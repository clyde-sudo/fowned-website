import { head, answer, cta, table } from "../ui.mjs";

export default {
  path: "/answers/how-to-get-chatgpt-to-recommend-my-business/",
  title: "How to get ChatGPT to recommend my business | Fowned",
  description:
    "You cannot make an assistant recommend you, and anyone selling that sells a guess. You can become retrievable and corroborated, which is what it selects on.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I get ChatGPT to recommend my business?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You cannot instruct an assistant to recommend you, and there is no placement to buy. What you can change is whether you are a candidate when it assembles an answer. That takes two things in order. First, be retrievable: the pages that state what you do, where you do it and who you do it for must be fetchable by a non-browser client and readable as text. Second, be corroborated: the same details must appear consistently on the third-party listings and directories the assistant actually retrieves, because a claim that exists only on your own site has no second source.",
          },
        },
        {
          "@type": "Question",
          name: "Can I pay for placement in an AI answer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Not in the way ad placement works in search. There is no auction, no bid and no slot to buy for organic recommendations. Anyone offering guaranteed placement in an assistant's answer is describing something that does not exist as a product.",
          },
        },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Answer</span>
      <h1>How to get ChatGPT to recommend my business</h1>
      <p class="hero-sub">The honest version: you cannot make it recommend you. You can make yourself a candidate it is able to select, which is a different job with a much clearer method.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The mechanism", h: "What the assistant is actually doing." })}
      <p>When someone asks for a recommendation, the assistant is not consulting a ranked list of businesses. It is assembling an answer from sources it can retrieve at that moment, and naming the businesses those sources describe clearly enough to name. Every lever you have acts on that sentence, and levers that act on anything else do nothing.</p>
${answer(
  "Lever one: be retrievable",
  "The pages that state what you do, where you work and who you serve have to be fetchable by a non-browser client and readable as delivered text. That means no bot rule or challenge page blocking the fetch, and no critical fact locked inside an image, a PDF or a script-rendered component. This lever is binary. Until it passes, nothing else you do can matter, because the fetch never returns anything to reason over."
)}
${answer(
  "Lever two: be corroborated",
  "An assistant choosing among candidates is weighing sources against each other. When your name, address, phone number, service area and service description say the same thing on your own site and on the listings and directories it retrieves, the claim is confirmed from more than one direction. When they disagree, the disagreement is a reason to name someone less ambiguous instead. Consistency across sources does more work here than any single page you write."
)}
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Order of work", h: "Two levers, and they are not parallel." })}
${table(
  ["Step", "What it does", "Why it comes here"],
  [
    ["Confirm retrieval succeeds", "Establishes that a fetch returns your text at all", "A blocked fetch makes every later step unmeasurable"],
    ["Put the facts in the text", "Makes the specific claim readable, not just the page", "A retrievable page with the answer in an image still cannot be quoted"],
    ["Align the third-party listings", "Gives the claim a second and third source", "This is the lever that turns readable into selectable"],
    ["Re-measure", "Tells you whether any of it moved", "Without this the work is belief, not a result"],
  ]
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "What does not work", h: "Three things sold as levers that are not." })}
      <p><strong>Buying placement.</strong> There is no auction and no slot. A guaranteed position in an assistant's organic answer is not a product that exists, whatever the pitch says.</p>
      <p><strong>Keyword density.</strong> Repeating a phrase does not raise a score, because there is no score. The assistant needs the fact stated once, clearly, in text it can reach.</p>
      <p><strong>Volume for its own sake.</strong> Forty thin pages give a retriever forty weak sources. One page that answers a real question completely is worth more than all of them, because it can be lifted and quoted whole.</p>
      <p class="fineprint">Note the shape of the thing being measured. In assistant answers to questions like this one, the sources cited are overwhelmingly explanatory pages and documentation rather than vendor home pages. Being described accurately on the pages that get retrieved matters more than optimising the page you most want people to see.</p>
    </div>
  </section>

${cta({
  h: "Start with lever one, because it is binary.",
  p: "The free audit requests your pages the way an assistant does and reports whether the fetch returns your text, which check failed, and which produced no verdict at all.",
  primary: { href: "/audit/", text: "Request my free audit →", ev: "answer_recommend" },
  secondary: { href: "/answers/why-my-business-is-not-showing-up-on-chatgpt/", text: "Why am I not showing up?", ev: "answer_to_absent" },
})}`,
};
