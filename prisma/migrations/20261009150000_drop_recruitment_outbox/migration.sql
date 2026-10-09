-- The recruitment outbox is replaced by retrying unsynced rows of "Application" (sheetSyncedAt / emailSentAt).
DROP TABLE IF EXISTS "RecruitmentOutbox";
