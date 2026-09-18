import { head, cta, guideList } from "../ui.mjs";

/* /guides/ is the parent of six live guide URLs. It did not exist, so the
 * address a reader types (or trims a guide URL back to) returned a 404. */
export default {
  path: "/guides/",
  title: "Guides | AI visibility for local businesses | Fowned",
  description:
    "Six plain-English guides for local business owners: local SEO vs GEO vs AEO, whether a local business needs GEO, what sources ChatGPT uses, what an AI visibility audit checks, choosing an agency, and tracking leads from ChatGPT.",
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Guides</span>
      <h1>Six guides for a local business owner.</h1>
      <p class="hero-sub">Each one answers a single question in full, says plainly where the evidence stops, and ends at the free audit, where a general answer becomes one about your business.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Read in any order", h: "Start with the question you already have." })}
${guideList()}
    </div>
  </section>

${cta({
  h: "Want the answer for your business?",
  p: "The audit runs the same checks these guides describe, on your site.",
  primary: { href: "/audit/", text: "Run my free audit →", ev: "guides_audit" },
  secondary: { href: "/resources/", text: "Short answers", ev: "guides_resources" },
})}`,
};
