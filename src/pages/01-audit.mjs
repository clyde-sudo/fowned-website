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
