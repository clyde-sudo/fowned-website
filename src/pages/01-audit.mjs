import { head, answer, cta } from "../ui.mjs";

export default {
  path: "/audit/",
  title: "Free AI visibility audit | Fowned",
  description:
    "Run a free check of what AI assistants can and cannot read about your business. Results show what is missing, and what was not measurable, separately.",
  scripts: ["/js/audit.js"],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Free audit</span>
      <h1>See what AI tools can read about you.</h1>
      <p class="hero-sub">Enter your website address. The audit checks the signals AI assistants rely on when they decide which business to name, and reports what it could not measure as unmeasured rather than as a zero.</p>
    </div>
  </section>

  <section id="audit">
    <div class="container">
      <div class="final-cta">
        <form class="audit-form" id="auditForm" novalidate>
          <label class="sr-only" for="auditUrl">Your website address</label>
          <input type="text" id="auditUrl" name="url" placeholder="yourbusiness.com" autocomplete="url" required>
          <button type="submit" class="btn btn-primary" id="auditSubmit">Run my free audit &rarr;</button>
        </form>
        <div class="audit-panel" id="auditPanel" hidden aria-live="polite"></div>
      </div>
    </div>
  </section>

  <section class="band" id="sprint">
    <div class="container narrow">
${head({
  label: "Sent here by Citability",
  h: "The Visibility Sprint is delivered by Fowned.",
  sub: "Citability sells the sprint and measures the result. Fowned does the implementation work inside it.",
})}
      <div class="tier-card">
        <span class="label">Visibility Sprint</span>
        <h3>Four weeks of implementation, then a re-test that proves it moved.</h3>
        <p>Citability runs the audit that sets your baseline. Fowned then builds the infrastructure that audit named, and Citability re-runs the same question set afterwards, so the change is measured rather than asserted.</p>
        <ul class="tick-list">
          <li>llms.txt and AI crawler allowlist</li>
          <li>Entity and schema graph across Organization, Person, FAQ and DefinedTerm</li>
          <li>Answer-capsule content restructure</li>
          <li>Re-test on Citability against the baseline question set</li>
        </ul>
        <p class="tier-who">Four weeks from $4,500 for one business. Six weeks at $9,000 when several properties are in scope.</p>
        <p class="fineprint">Sprints are sold alongside the Citability retainer rather than on their own, because a sprint nobody measures afterwards is a report with extra steps. Fowned runs two slots per quarter, so a sprint starts with an application.</p>
        <a href="/contact/?topic=sprint" class="btn btn-primary tier-cta" data-ev="cta_click" data-ev-label="audit_sprint_apply">Apply for a sprint slot &rarr;</a>
      </div>
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Before you run it", h: "What the audit does and does not do." })}
${answer(
  "What does the audit check?",
  "Whether your business name, service area, hours, contact details and service descriptions exist in the served HTML; whether structured data identifies the business; whether reviews and location are machine-readable; and whether search agents are allowed to retrieve the page at all."
)}
${answer(
  "Does it prove an AI will recommend me?",
  "No. It measures whether the inputs AI assistants rely on are present and readable. Presence of the inputs is a precondition for being named, not a guarantee of it, and we do not report it as one."
)}
${answer(
  "What happens to a check that cannot be measured?",
  "It is reported on its own line as not measured, and it is removed from the denominator. A check that never returned a verdict is not a failure and is never counted as one."
)}
${answer(
  "Do I need an account?",
  "No. The audit runs without one. You only leave an email if you want the full result sent to you."
)}
    </div>
  </section>

${cta({
  h: "Want it walked through instead?",
  p: "If you would rather have someone read the result with you, the number below reaches us directly.",
  primary: { href: "/contact/", text: "Request a consultation", ev: "audit_consult" },
  secondary: { href: "/how-it-works/", text: "How it works", ev: "audit_how" },
})}`,
};
