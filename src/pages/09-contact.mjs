import { head } from "../ui.mjs";
import { SITE } from "../layout.mjs";

export default {
  path: "/contact/",
  title: "Contact Fowned",
  description:
    "Reach Fowned by phone or LinkedIn, or run the free audit first so the conversation starts from evidence rather than a sales script.",
  scripts: ["/js/contact.js"],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Contact</span>
      <h1>Talk to a person.</h1>
      <p class="hero-sub">The fastest route is the phone. If you want the conversation to start from evidence, run the free audit first and we will read the result with you.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
      <div class="contact-cards">
        <div class="contact-card">
          <span class="label">Phone</span>
          <p class="contact-big"><a href="${SITE.phoneHref}" data-ev="cta_click" data-ev-label="contact_phone">${SITE.phoneText}</a></p>
          <p>Reaches us directly. This is the only booking route we operate, so there is no calendar link here to invent one.</p>
        </div>
        <div class="contact-card">
          <span class="label">LinkedIn</span>
          <p class="contact-big"><a href="${SITE.linkedin}" target="_blank" rel="noopener noreferrer" data-ev="cta_click" data-ev-label="contact_linkedin">Fowned on LinkedIn</a></p>
          <p>Message us there if that is easier. It is checked on working days.</p>
        </div>
        <div class="contact-card">
          <span class="label">Start with evidence</span>
          <p class="contact-big"><a href="/audit/" data-ev="cta_click" data-ev-label="contact_audit">Run the free audit</a></p>
          <p>About a minute, no account. It gives us both something concrete to talk about.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Consultation request", h: "Or leave your details here." })}
      <div class="demo-inline">
        <span class="demo-chip">DEMO</span>
        <p>This demo build does <strong>not</strong> transmit messages anywhere. The form below demonstrates the intended flow and confirms in your browser only. Nothing is sent, stored on a server, or emailed. Use the phone number or LinkedIn above to reach us for real.</p>
      </div>
      <form class="lead-form" id="contactForm" novalidate>
        <div class="field">
          <label for="cName">Your name</label>
          <input type="text" id="cName" name="name" autocomplete="name" required>
        </div>
        <div class="field">
          <label for="cSite">Your website</label>
          <input type="text" id="cSite" name="site" placeholder="yourbusiness.com" autocomplete="url" required>
        </div>
        <div class="field">
          <label for="cEmail">Email</label>
          <input type="email" id="cEmail" name="email" autocomplete="email" required>
        </div>
        <div class="field">
          <label for="cNote">What would you like to fix?</label>
          <textarea id="cNote" name="note" rows="4"></textarea>
        </div>
        <button type="submit" class="btn btn-primary" id="contactSubmit">Request a consultation</button>
        <p class="audit-lead-msg" id="contactMsg" role="status"></p>
      </form>
    </div>
  </section>`,
};
