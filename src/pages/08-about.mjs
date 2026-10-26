import { head, answer, cta } from "../ui.mjs";
import { SITE } from "../layout.mjs";

/* The questions people ask about the domain itself. Before 2026-10-26 no page
 * said "fowned.live" in words, so a search for it had nothing to match and an
 * assistant answering from memory guessed from the name. One list feeds both
 * the visible answers and the FAQ data, so the two cannot drift apart. */
const FACTS = [
  {
    q: "What is fowned.live?",
    a: "fowned.live is the website of Fowned, a generative engine optimization agency. Fowned checks how AI assistants such as ChatGPT, Gemini and Perplexity describe a business, fixes what they get wrong, and keeps measuring the answers afterwards. Fowned is the name, one word, not a misspelling of another word.",
  },
  {
    q: "Who runs Fowned?",
    a: "Clyde Sada is accountable for the work Fowned delivers and for whether each client is satisfied with it.",
  },
  {
    q: "How can I check Fowned before working with you?",
    a: `Call ${SITE.phoneText}, message Fowned on LinkedIn, or request the free audit and judge the work before paying for anything. Nothing is charged through this website: pricing is agreed on a call and contracted with you directly.`,
  },
];

export default {
  path: "/about/",
  title: "About Fowned | how we work | Fowned",
  description:
    "Fowned is a generative engine optimization agency. We diagnose before prescribing, label evidence honestly, and report what was not measured as not measured.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FACTS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">About</span>
      <h1>An agency that reports its own limits.</h1>
      <p class="hero-sub">Fowned helps businesses be named accurately when AI assistants answer a customer's question. The commercial bet is that honest measurement wins the accounts worth keeping.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "At a glance", h: "Fowned and fowned.live, in three answers." })}
${FACTS.map((f) => answer(f.q, f.a)).join("\n")}
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Principles", h: "Four rules we run the work by." })}
      <ul class="claim-list">
        <li><strong>Diagnosis before prescription.</strong> No recommendation ships without an observation behind it. If we cannot say what we saw, we have not earned the right to say what to change.</li>
        <li><strong>Evidence carries a label.</strong> Observed, inferred and unknown are different words and stay different. A missing referrer is unknown, never direct.</li>
        <li><strong>A missing measurement is not a zero.</strong> Reports show what did not measure as not measured. The denominator shrinks instead of the numerator, so a broken instrument never looks like a broken website.</li>
        <li><strong>Causation is not asserted from correlation.</strong> We record interventions with dates and re-measure on schedule. When a number moves after a change, that is what we say, not that the change caused it.</li>
      </ul>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Platform", h: "How the measurement runs." })}
      <p>Fowned's audits, monitoring and lead attribution run on a dedicated visibility measurement platform operated for us. Your data stays inside your own workspace on it, scoped so that one client's records are not reachable from another's.</p>
      <p>What that buys you in practice: the same checks run the same way every time, results are stored with a timestamp so before and after are comparable, and a failed run is recorded as a failed run rather than quietly retried until it produces a number.</p>
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Accountability", h: "Who answers for the work." })}
      <p>Clyde Sada is accountable for whether an early Fowned client is satisfied with what was delivered. If the work is not what you were told it would be, you raise it with him and he owns the answer rather than passing you to a queue.</p>
      <p>You get a reply within two business days on every channel published on the contact page. If an audit result looks wrong to you, say so and we re-run it rather than defending the first number. Pricing is agreed on the call and contracted with you directly, so nothing is charged through this website.</p>
    </div>
  </section>

${cta({
  h: "See it applied to your site.",
  p: "The audit is the same first step every Fowned engagement starts from.",
  primary: { href: "/audit/", text: "Request my free audit →", ev: "about_audit" },
  secondary: { href: "/contact/", text: "Talk to us", ev: "about_contact" },
})}`,
};
