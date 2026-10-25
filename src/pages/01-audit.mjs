import { head, answer, cta, auditForm } from "../ui.mjs";

export default {
  path: "/audit/",
  title: "Free AI visibility audit | Fowned",
  description:
    "Request a free check of what AI assistants can and cannot read about your business. A person runs it and emails you the audit within 2 business days.",
  scripts: ["/js/audit.js"],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Free audit</span>
      <h1>See what AI tools can read about you.</h1>
      <p class="hero-sub">Leave your website address and an email. A person checks the signals AI assistants rely on when they decide which business to name, and sends you the audit within 2 business days. Anything that could not be measured is reported as unmeasured rather than as a zero.</p>
    </div>
  </section>

  <section id="audit">
    <div class="container">
      <div class="final-cta">
${auditForm()}
      </div>
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Before you request it", h: "What the audit does and does not do." })}
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
  "How long does it take, and do I need an account?",
  "No account. A person checks your site and emails the audit to the address you leave, within 2 business days. Nothing is shown on this page in the meantime, because an instant result would be a guess."
)}
    </div>
  </section>

${cta({
  h: "Want it walked through instead?",
  p: "If you would rather talk it through with someone first, the number below reaches us directly.",
  primary: { href: "/contact/", text: "Request a consultation", ev: "audit_consult" },
  secondary: { href: "/how-it-works/", text: "How it works", ev: "audit_how" },
})}`,
};
