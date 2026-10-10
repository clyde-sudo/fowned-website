import { head, answer, cta, table } from "../ui.mjs";

export default {
  path: "/answers/how-to-get-your-business-listed-in-chatgpt/",
  title: "How to get your business listed in ChatGPT | Fowned",
  description:
    "There is no list, no directory and no submission form. Listed means appearing in the sources an assistant retrieves. Here is where those sources live.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I get my business listed in ChatGPT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "There is no list to join. ChatGPT holds no business directory, accepts no submissions and has no listing form, so nothing you fill in adds you to it. What people mean by being listed is being named when someone asks a relevant question, and that happens by way of the sources the assistant retrieves at that moment: your own site, the mapping and directory profiles that describe you, and the third-party pages that mention you. Those are the surfaces to work on, because they are the ones that exist.",
          },
        },
        {
          "@type": "Question",
          name: "Is there a ChatGPT business submission form?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Any service charging to submit your business to ChatGPT is charging for something that has no mechanism behind it. The work that does have a mechanism is making your own pages retrievable and your third-party profiles consistent.",
          },
        },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Answer</span>
      <h1>How to get your business listed in ChatGPT</h1>
      <p class="hero-sub">There is no list. That sounds like bad news and is mostly good news, because it means nobody has a place in a queue ahead of you.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The premise", h: "Correcting the question first." })}
${answer(
  "ChatGPT has no directory and no submission form",
  "It does not maintain a business index the way a mapping service does, and there is nowhere to submit yourself. Any service charging to add your business to ChatGPT is charging for a mechanism that does not exist. Being named in an answer is a consequence of what the assistant can retrieve when it is asked, not of a record it holds about you."
)}
      <p>So the useful translation of the question is this: which sources does an assistant reach for when someone asks about a business like mine, and do those sources describe me accurately? That version has a real answer and real work behind it.</p>
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Where the sources live", h: "The surfaces that stand in for a listing." })}
${table(
  ["Surface", "What it contributes", "State to aim for"],
  [
    ["Your own site", "The primary statement of what you do and where", "Fetchable by a non-browser client, facts present as text"],
    ["Mapping and local profiles", "Location, hours, category, contact", "Complete, claimed, and identical to the site"],
    ["Industry and trade directories", "Corroboration from a second party", "Consistent name, address and phone across all of them"],
    ["Pages that mention you", "Independent description in someone else's words", "Accurate, and describing the service you actually sell"],
  ]
)}
      <p class="fineprint">The common thread is agreement. One profile with different hours or an old phone number does more damage than a missing profile, because a contradiction is harder to resolve than a gap.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The step people skip", h: "Check that the fetch works before writing anything." })}
      <p>Filling in every directory is wasted effort while your own site refuses the fetch. Assistants retrieve with a non-browser client that identifies itself by name, and a great many sites block or challenge that client through a security default nobody set deliberately. It is a quiet failure: the site works perfectly in your browser and returns nothing to the thing that would have quoted you.</p>
      <p>One distinction is worth carrying, because it is routinely got backwards. Crawlers that gather training data and crawlers that fetch a page for a live answer are different clients with different names. Blocking the first costs you nothing in citation. Blocking the second makes citation impossible. Most sites that block one are blocking both without meaning to block either.</p>
    </div>
  </section>

${cta({
  h: "See which sources can actually reach you.",
  p: "The free audit requests your pages as an assistant would and reports what passed, what failed, and what returned no verdict at all.",
  primary: { href: "/audit/", text: "Request my free audit →", ev: "answer_listed" },
  secondary: { href: "/answers/how-to-get-chatgpt-to-recommend-my-business/", text: "How recommendation works", ev: "answer_to_recommend" },
})}`,
};
