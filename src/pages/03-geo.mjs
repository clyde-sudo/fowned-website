import { head, answer, cta } from "../ui.mjs";

export default {
  path: "/geo/",
  title: "What is GEO for a local business? Generative engine optimization explained | Fowned",
  description:
    "GEO makes a local business readable, correct and retrievable to AI assistants so they can name it in an answer. What it is, what it is not, where evidence ends.",
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Definition</span>
      <h1>What generative engine optimization actually is.</h1>
      <p class="hero-sub">A plain definition, the mechanism behind it, and an honest account of where the evidence runs out.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
      <h2 class="section-h">Definitions for a local business owner</h2>
${answer(
  "What is generative engine optimization?",
  "Generative engine optimization, or GEO, is the practice of making a business readable, accurate and retrievable to AI assistants, so that when one answers a customer's question the business can be named correctly. It covers the machine-readable identity of the business, the structure of the content describing it, the consistency of its details across the wider web, and whether retrieval systems are technically permitted to fetch the pages at all. Whether a local business should spend on it is a separate question: <a class=\"inline-link\" href=\"/guides/geo-for-local-businesses/\">does your business need GEO?</a>"
)}
${answer(
  "How is it different from SEO?",
  "Conventional search optimization competes for a position in a list of links. GEO competes to be the entity a generated answer names, which is a different unit of output. The technical foundations overlap almost entirely: a page a crawler cannot fetch is invisible to both. The divergence is in content shape, since an assistant lifts a self-contained answer rather than sending a click, and in measurement, since there is no ranking position to report."
)}
${answer(
  "Why can a business be invisible to an AI assistant?",
  "The most common causes, in the order we find them: the page renders its content only after JavaScript executes, so the served HTML is effectively empty; the business identity exists nowhere in machine-readable form; the key facts a customer asks about, such as service area and hours, are in an image or a PDF rather than text; the details contradict each other across directories, so no single version is trustworthy; or a security rule blocks non-browser clients outright, so retrieval never happens."
)}
${answer(
  "Can anyone guarantee a business will be recommended?",
  "No. Assistants generate answers probabilistically from sources that change, and the same question can produce different answers on the same day. Presence and correctness of the underlying signals is controllable and measurable. Being named is neither guaranteed nor directly purchasable, and any agency that says otherwise is selling something it cannot deliver."
)}
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Honesty note", h: "Three claims we will not make." })}
      <ul class="claim-list">
        <li><strong>Adding schema markup boosts AI citation.</strong> Structured data makes an entity unambiguous, which is worth doing on its own terms. We have not measured a citation lift caused by adding it, so we do not sell it as one.</li>
        <li><strong>An llms.txt file improves ranking.</strong> It is an experimental convention for publishing machine-readable context. It is not a ranking signal, no major assistant has committed to honouring it, and we treat it as an experiment.</li>
        <li><strong>A specific AI answer produced this lead.</strong> We can observe that a visit carried a referrer naming an AI surface. We cannot observe which answer, or whether an answer was involved at all. Observed and inferred stay separate words here.</li>
      </ul>
    </div>
  </section>

${cta({
  h: "Find out where you stand.",
  p: "The free audit reports which of these foundations exist on your site today.",
  primary: { href: "/audit/", text: "Run my free audit →", ev: "geo_audit" },
  secondary: { href: "/ai-visibility/", text: "How we measure it", ev: "geo_measure" },
})}`,
};
