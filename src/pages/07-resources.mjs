import { head, answer, cta, guideList } from "../ui.mjs";

export default {
  path: "/resources/",
  title: "Resources | plain answers on AI visibility | Fowned",
  description:
    "Short, sourceable answers to the questions local businesses ask about being named by AI assistants, including the ones where the honest answer is unknown.",
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Resources</span>
      <h1>Plain answers, including the unsatisfying ones.</h1>
      <p class="hero-sub">Every answer here is either something we can observe directly or something we will tell you is unresolved. There is no third category.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
      <h2 class="section-h">Straight answers about AI visibility</h2>
${answer(
  "Why does my business show up in Google but not in ChatGPT?",
  "The two systems retrieve differently. A search index can rank a page it fetched months ago; an assistant answering a live question often needs to fetch something now, and many sites block or challenge the non-browser clients that do the fetching. The second common cause is that the specific fact being asked about, such as a service area or opening hours, exists only inside an image, a PDF or a JavaScript-rendered component and is not in the text at all."
)}
${answer(
  "Does blocking AI crawlers hurt my visibility?",
  "It depends entirely on which crawler. Training crawlers and retrieval crawlers are different clients with different user agents. Blocking a training crawler has no effect on whether an assistant can cite you in a live answer. Blocking a retrieval crawler makes citation impossible. Many sites block both without realising they are separate decisions, often through a security default nobody chose deliberately."
)}
${answer(
  "Is structured data worth adding?",
  "Yes, for a reason that is not a ranking claim. Structured data removes ambiguity about which entity a page describes, which matters when several businesses share a name or a location. We have not measured a citation increase caused by adding it, and we will not sell it as one. It is cheap, it is correct, and its benefit is disambiguation."
)}
${answer(
  "How often should visibility be re-measured?",
  "Frequently enough that a change and its measurement can be connected, which in practice means weekly or monthly rather than quarterly. The failure mode of infrequent measurement is not missing data, it is that six changes land between two measurements and none of them can be attributed to anything."
)}
${answer(
  "What is llms.txt and should I have one?",
  "It is a proposed convention for a plain-text file describing a site to language models. It is experimental. No major assistant has publicly committed to reading it, and it is not a ranking signal. It costs almost nothing to publish, which is a reasonable argument for doing it, and no evidence supports treating it as a priority."
)}
${answer(
  "Can I do this myself?",
  "The retrieval and consistency work, largely yes, and the audit will tell you what to fix in specific terms whether or not you hire anyone. The parts that are harder to do alone are sustained re-measurement and knowing which of six simultaneous changes mattered."
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Guides", h: "Six longer reads for a local business owner." })}
      <p>Each guide answers one question in full and ends at the audit, because the audit is where a generic answer turns into your answer.</p>
${guideList()}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Single answers", h: "Three questions that come up on their own." })}
      <p>Each of these has its own page, because a question asked in isolation deserves an answer that can be read in isolation.</p>
      <ul class="check-list">
        <li><a href="/answers/why-my-business-is-not-showing-up-on-chatgpt/">Why is my business not showing up on ChatGPT?</a> Three separate causes, and how to tell which one you have.</li>
        <li><a href="/answers/how-to-get-chatgpt-to-recommend-my-business/">How to get ChatGPT to recommend my business</a> The two levers that exist, and three that are sold but do not.</li>
        <li><a href="/answers/how-to-get-your-business-listed-in-chatgpt/">How to get your business listed in ChatGPT</a> There is no list. What the question actually means.</li>
      </ul>
    </div>
  </section>

${cta({
  h: "Start with your own numbers.",
  p: "Generic answers only go so far. The audit tells you which of these apply to your site.",
  primary: { href: "/audit/", text: "Run my free audit →", ev: "res_audit" },
  secondary: { href: "/geo/", text: "What is GEO", ev: "res_geo" },
})}`,
};
