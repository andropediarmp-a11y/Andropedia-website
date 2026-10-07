// Text of the legal pages. Shown as a popup card from the footer and as full pages at /terms and /privacy.

export interface LegalSection {
  heading: string;
  body: Array<string | { list: string[] }>;
}

export interface LegalDoc {
  slug: "terms" | "privacy";
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "Using this site",
    body: [
      "By using the Andropedia website you agree to these terms. If you do not agree, please do not use the site. Andropedia is a student-run club, and the site is provided as is, without any promise that it will always be available or error free.",
    ],
  },
  {
    heading: "Applications and membership",
    body: [
      "Applying does not guarantee a place in the club. Selection is decided by the club's leads. Only one application per person is accepted, and the details you give must be true and your own.",
      "Membership can be changed or ended by the club, for example for inactivity or breaking these terms.",
    ],
  },
  {
    heading: "Event registration",
    body: [
      {
        list: [
          "Registration is first come, first served, and may be limited by seats or teams.",
          "For team events, the team leader registers the team and is responsible for the accuracy of every member's details. Each person can be on one team per event.",
          "Registration can be closed, or an event changed, moved or cancelled, by the organisers. We will use the contact details you gave to tell you.",
          "Anyone who gives false details, or registers on behalf of someone who has not agreed, may be removed from the event.",
        ],
      },
    ],
  },
  {
    heading: "Member accounts and the portal",
    body: [
      "You sign in with a one-time code sent to your registered email. Keep your email secure. You are responsible for what is done through your account. Do not try to access anyone else's account or data, or any part of the site you have not been given access to.",
      "Work you submit through the portal must be your own, and you must have the right to share any links or files you submit. Scores and feedback are decisions of the club's evaluators.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "Do not misuse the site. In particular, do not:",
      {
        list: [
          "submit spam, false information, or automated or bulk requests;",
          "try to bypass limits, security or permissions, or probe the site for weaknesses;",
          "upload anything unlawful, harmful or that infringes someone else's rights;",
          "use the site to harass or impersonate anyone.",
        ],
      },
      "We may block access or remove content that breaks these rules.",
    ],
  },
  {
    heading: "Content and ownership",
    body: [
      "The Andropedia name, design and site content belong to the club or its contributors. You keep ownership of the work you submit. By submitting it you let the club display it within the portal and, where you agreed, on the public site, for club purposes such as grading, showcases and the leaderboard.",
    ],
  },
  {
    heading: "Privacy",
    body: ["How we handle your personal information is described in our Privacy Policy."],
  },
  {
    heading: "Liability",
    body: [
      "To the extent the law allows, Andropedia and its volunteers are not liable for losses from using the site or from events, including loss of data or missed registrations. Nothing here limits any right you have that cannot lawfully be limited.",
    ],
  },
  {
    heading: "Changes and contact",
    body: [
      "We may update these terms, and the date above will change when we do. Continuing to use the site after a change means you accept it. For questions, contact the club's leads or reply to any email we have sent you.",
    ],
  },
];

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      "Andropedia is a student technology club. This website lets people learn about the club, apply to join, register for events, and lets members submit and track weekly work. The club is run by students, so please contact us through the club's leads or by replying to any email we send you.",
    ],
  },
  {
    heading: "What we collect",
    body: [
      "We only collect what a form on this site asks for. Depending on what you do, that is:",
      {
        list: [
          "Recruitment application: name, college email, year of study, chosen domain, your skills, why you want to join, an optional portfolio link, and your consent.",
          "Event registration: name and college email. For team events we also collect each team member's mobile number, department, section, year of study and register number.",
          "Member profiles: name, email, domain, LinkedIn link, profile photo and a short bio that members give the club through the member form.",
          "Member portal: the tasks you submit, the scores and feedback you receive, and your points and rank.",
          "Login: your email address, and a one-time code we send you. We store only a scrambled (hashed) version of the code and of your session.",
        ],
      },
      "We do not run advertising or analytics trackers on this site.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      {
        list: [
          "To review applications and contact shortlisted applicants.",
          "To run events, check team eligibility and contact participants about the event.",
          "To send confirmation emails and login codes.",
          "To run weekly sprints, grade work and show the leaderboard.",
          "To show the Our Team page and keep the club's member list up to date.",
          "To keep the site secure, for example rate limits and spam checks.",
        ],
      },
      "We do not sell your information and we do not use it for advertising.",
    ],
  },
  {
    heading: "Who can see it",
    body: [
      "Only club administrators can see applications, event registrations (including mobile numbers and register numbers) and member emails.",
      "Some member details are public by design. If you are a member, your name, domain, photo, bio and LinkedIn link can appear on the Our Team page. Your email, mobile number and register number are never shown publicly.",
      "Your member scores and rank appear on the leaderboard to other signed-in members.",
    ],
  },
  {
    heading: "Where it is stored",
    body: [
      "Applications are stored in a private Google Sheet shared only with club administrators, and may be held briefly in our database if the sheet is unavailable. Everything else is stored in our database. We use email and hosting providers to run the site, and they process data on our behalf.",
    ],
  },
  {
    heading: "Cookies and local storage",
    body: [
      "When you sign in we set one cookie that keeps you signed in. It is HTTP-only, so scripts on the page cannot read it, and it expires after 14 days or when you sign out.",
      "Your browser also keeps a few things on your own device: an unsent draft of the application form and a note of which events you registered for, so the page can show \"registered\". You can clear these in your browser settings at any time.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep applications and event registrations only as long as we need them to run the recruitment cycle or event. Member records are kept while you are a member. You can ask us to delete your data at any time.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "You can ask to see the information we hold about you, correct it, or have it deleted, and you can withdraw consent for an application. To do this, contact the club or reply to any email we have sent you, and quote your reference ID if you have one.",
    ],
  },
  {
    heading: "Changes",
    body: ["If we change this policy we will update the date at the top of this page."],
  },
];

export const TERMS: LegalDoc = {
  slug: "terms",
  title: "Terms of Service",
  updated: "October 2026",
  intro: "These terms cover your use of the Andropedia website: applying to the club, registering for events and using the member portal.",
  sections: TERMS_SECTIONS,
};

export const PRIVACY: LegalDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  updated: "October 2026",
  intro: "This explains what personal information Andropedia collects through this website, why we collect it, who can see it, and how you can have it removed.",
  sections: PRIVACY_SECTIONS,
};
