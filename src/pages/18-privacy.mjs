import { head } from "../ui.mjs";

/* The dates here are the dates the text last changed. Update BOTH the constant
 * and the visible line when the practices below change, because a privacy page
 * whose date lies is worse than no page at all. */
const UPDATED = "31 August 2026";

export default {
  path: "/privacy/",
  title: "Privacy policy | Fowned",
  description:
    "What Fowned collects when you use this site, why, where it is stored, who else sees it, and how to have it removed.",
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Privacy</span>
      <h1>What we collect, and what we do not.</h1>
      <p class="hero-sub">This describes the fowned.live website only. Last updated ${UPDATED}.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The short version", h: "No cookies, no ad tracking, no selling." })}
      <ul class="claim-list">
        <li><strong>We set no advertising or tracking cookies.</strong> There is no cookie banner on this site because there is nothing to consent to.</li>
        <li><strong>You are anonymous until you type an email.</strong> Page visits are counted without any identifier that names a person.</li>
        <li><strong>We never sell or rent your details.</strong> They exist so a human here can reply to you.</li>
      </ul>
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "What you give us", h: "Information you type into a form." })}
      <p>The audit form takes a website address. The result form and the consultation form take your email, and optionally your name, your website and a short message. If you run the audit and then leave your email, we attach the findings you saw to your record so that whoever replies is reading the same report you did.</p>
      <p>We store this in a database operated for Fowned by Cloudflare, and we send a copy to our own inboxes by email so the enquiry is not missed. Nothing else is done with it. It is used to reply to you and to keep track of the conversation.</p>
      <p>We keep lead records for as long as the commercial conversation is live, and for two years after the last contact so we can honour a request to be forgotten and know who we already spoke to. Ask us to delete it sooner and we will.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "What we measure", h: "Page counts, with no identifier attached." })}
      <p>The site records which pages are opened, which buttons are pressed, and which site or campaign sent you here. That record carries the path, the referring site and any campaign tags in the link. It carries no name, no email, no cookie and no device fingerprint.</p>
      <p>One entry is kept in your browser's session storage so that if you arrive from a search result and fill in a form five pages later, we still know which page sent you. It is deleted when you close the tab.</p>
      <p>A referrer that is missing is recorded as unknown. It is never recorded as direct. AI assistants routinely strip that header, and guessing would put a fact in our records that nobody observed.</p>
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Who else sees it", h: "Three processors, each with one job." })}
      <ul class="claim-list">
        <li><strong>Cloudflare</strong> hosts this site and stores the enquiry database. It sees the request needed to serve a page.</li>
        <li><strong>Resend</strong> delivers the email that tells us an enquiry arrived. It sees what is in that email.</li>
        <li><strong>Our measurement platform</strong> runs the visibility checks behind the audit. It sees the website address you asked about, which is a public website, not personal information.</li>
      </ul>
      <p class="fineprint">If we ever add a visitor identification service to this site, this list is where it will be named before it goes live.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Your rights", h: "Ask, and we act." })}
      <p>You can ask what we hold about you, ask for a copy, ask for it to be corrected, or ask for it to be deleted. Write to us through the <a href="/contact/">contact form</a> or call the number in the footer, and say what you want done. We answer inside 30 days.</p>
      <p>If you are in the UK or the EU, our lawful basis for holding an enquiry is legitimate interest, specifically replying to somebody who asked us to. You can object to that at any time and the record goes.</p>
      <p>This site is not intended for children, and we do not knowingly collect anything from anyone under 16.</p>
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Changes", h: "Dated, not silent." })}
      <p>When this policy changes, the date at the top changes with it. We do not backdate. If a change materially widens what we collect, we will say so on the page rather than leaving you to diff it.</p>
      <p>See also the <a href="/terms/">terms of use</a>.</p>
    </div>
  </section>
`,
};
