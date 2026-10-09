/**
 * Google Apps Script web app that (1) appends recruitment applications to the "Applications" tab
 * and (2) sends email from the Google account that owns the script.
 * Setup: open the sheet -> Extensions -> Apps Script, paste this file, replace __SECRET__ with a long
 * random string, then Deploy -> New deployment -> Web app (Execute as: Me, Who has access: Anyone).
 * Put the deployment's /exec URL in RECRUITMENT_SHEET_WEBHOOK_URL and the secret in
 * RECRUITMENT_SHEET_WEBHOOK_SECRET. The secret is what keeps strangers from using it.
 * Gmail limits scripts to about 100 recipients a day (1500 on Google Workspace).
 * @OnlyCurrentDoc
 */
var SECRET = '__SECRET__';
var TAB = 'Applications';
var SENDER_NAME = 'Andropedia';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return reply({ ok: false, error: 'unauthorized' });
    if (body.action === 'mail') return sendMail(body);
    return appendRow(body);
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function appendRow(body) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(TAB);
  if (!sheet) return reply({ ok: false, error: 'missing tab' });
  var row = body.row;
  if (body.action !== 'append' || !Array.isArray(row) || !row.length) return reply({ ok: false, error: 'bad request' });

  // Column A is the reference. A reference already written is not added twice (safe retries).
  var last = sheet.getLastRow();
  var refs = last > 1 ? sheet.getRange(2, 1, last - 1, 1).getValues() : [];
  for (var i = 0; i < refs.length; i++) {
    if (String(refs[i][0]) === String(row[0])) return reply({ ok: true, row: i + 2, duplicate: true });
  }

  var target = last + 1;
  var range = sheet.getRange(target, 1, 1, row.length);
  range.setNumberFormat('@'); // plain text: nothing an applicant types is ever evaluated as a formula
  range.setValues([row]);
  return reply({ ok: true, row: target });
}

function sendMail(body) {
  var to = String(body.to || '');
  if (!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(to) || !body.subject) return reply({ ok: false, error: 'bad request' });
  var quota = MailApp.getRemainingDailyQuota();
  if (quota < 1) return reply({ ok: false, error: 'daily email quota used up' });
  var options = { name: SENDER_NAME };
  if (body.html) options.htmlBody = String(body.html);
  if (body.replyTo) options.replyTo = String(body.replyTo);
  MailApp.sendEmail(to, String(body.subject), String(body.text || ''), options);
  return reply({ ok: true, quotaLeft: quota - 1 });
}

function reply(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
