import { head, answer, cta, table } from "../ui.mjs";

export default {
  path: "/answers/why-my-business-is-not-showing-up-on-chatgpt/",
  title: "Why is my business not showing up on ChatGPT? | Fowned",
  description:
    "Three distinct causes, each with a different fix: the assistant cannot fetch your pages, it can fetch them but the fact is not in the text, or nothing outside your own site corroborates you. How to tell which one you have.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Why is my business not showing up on ChatGPT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "There are three separate causes and they are commonly confused. First, the assistant cannot fetch your pages at all, because a firewall, a bot rule or a challenge page blocks the non-browser client that does the fetching. Second, it can fetch your pages but the fact being asked about is not in the text, because it lives inside an image, a PDF or a component that only renders in a browser. Third, it can read the fact but does not treat you as a candidate, because no source outside your own website says the same thing. Each cause has a different fix, and applying the wrong one changes nothing.",
          },
        },
        {
          "@type": "Question",
          name: "Is there a ChatGPT ranking I can appeal?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. There is no ranking table, no position to hold and no appeal process. An assistant assembles an answer at the moment it is asked, from sources it can retrieve then. Absence is not a penalty applied to you, so there is nothing to appeal and no submission that resolves it.",
          },
        },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Answer</span>
      <h1>Why is my business not showing up on ChatGPT?</h1>
      <p class="hero-sub">There are three separate causes. They look identical from the outside and they need different fixes, so the first job is telling them apart rather than guessing.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The three causes", h: "Absence is not one problem." })}
${answer(
  "One: the assistant cannot fetch your pages",
  "An assistant answering a live question often has to retrieve a page at that moment. It does so with a non-browser client that identifies itself by name. Many sites block or challenge those clients through a security default nobody chose deliberately, so the fetch never completes. This is the most common cause and also the easiest to confirm, because it either works or it does not."
)}
${answer(
  "Two: the page is fetched, but the fact is not in the text",
  "Retrieval succeeding does not mean the answer is readable. Service areas printed inside a graphic, hours held in a PDF, and pricing that only appears after a script runs are all invisible to a client that reads the delivered text. The page looks complete to you because your browser assembles it. The fetcher receives something much smaller."
)}
${answer(
  "Three: you are readable, but nothing corroborates you",
  "An assistant asked to recommend a business is choosing among candidates. A claim that appears only on your own website has no second source. When the same name, address, phone number and service description appear consistently on the listings and directories the assistant retrieves, the claim is corroborated. When they disagree, the ambiguity is a reason to leave you out rather than a reason to include you."
)}
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Diagnosis", h: "How to tell which one you have." })}
${table(
  ["Symptom", "Likely cause", "What settles it"],
  [
    ["The assistant says it cannot access the site", "Cause one, blocked retrieval", "Request the page as the named client and read the status code"],
    ["It describes your business but gets a specific fact wrong", "Cause two, the fact is not in the text", "Read the delivered HTML, not the rendered page"],
    ["It answers the category question and names competitors instead", "Cause three, no corroboration", "Compare your details across the listings it cites"],
  ]
)}
      <p class="fineprint">These are diagnoses, not proofs of cause. A diagnosis becomes a cause only when the fix is applied and the measurement is repeated.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "What this is not", h: "There is no ranking to appeal." })}
      <p>There is no ChatGPT ranking table, no position to defend and no submission form that resolves absence. An assistant assembles each answer when it is asked, from whatever it can retrieve at that moment. That is worse news than a ranking in one way, because there is no scoreboard to watch, and better news in another: nothing was applied against you, so nothing has to be reversed.</p>
      <p>Be careful with one detail. Training crawlers and retrieval crawlers are different clients with different names. Blocking a training crawler has no effect on whether an assistant can cite you in a live answer. Blocking a retrieval crawler makes citation impossible. Sites routinely block both while intending to block neither.</p>
    </div>
  </section>

${cta({
  h: "Find out which of the three you have.",
  p: "The free audit requests your pages the way an assistant does and reports which checks passed, which failed, and which produced no verdict at all.",
  primary: { href: "/audit/", text: "Run my free audit →", ev: "answer_chatgpt_absent" },
  secondary: { href: "/resources/", text: "More plain answers", ev: "answer_to_resources" },
})}`,
};
