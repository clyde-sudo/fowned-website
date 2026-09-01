import { head } from "../ui.mjs";

const UPDATED = "31 August 2026";

export default {
  path: "/terms/",
  title: "Terms of use | Fowned",
  description:
    "The terms that govern use of the fowned.live website, the free audit, and the demo product surfaces.",
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Terms</span>
      <h1>Terms of use.</h1>
      <p class="hero-sub">These govern this website. A paid engagement is governed by its own signed agreement, which wins wherever the two differ. Last updated ${UPDATED}.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The site", h: "What this website is." })}
      <p>Fowned is a generative engine optimization agency. This site describes that service, runs a free sample audit, and shows product screens. Using it means you accept what is written here. If you do not, please stop using it.</p>
      <p>You may read, quote and link to anything published here. You may not scrape it at a rate that degrades it for other people, resell it as your own, or use it to train a model that competes with us.</p>
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "The free audit", h: "A sample, not a professional opinion." })}
      <p>The audit on this site is a free sample. It reports what a set of automated checks observed at one moment about one website. It is information, not advice, and no engagement or duty of care starts because you ran it.</p>
      <p>Run it against a site you own or are authorised to test. Running it against somebody else's property to gather competitive intelligence is not what it is for.</p>
      <p>Screens marked DEMO DATA show invented example clients. Every figure on them is a fixture. No company named on those screens is a Fowned customer, and nothing there is live telemetry.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "What we do not promise", h: "No ranking or citation guarantee." })}
      <p>Search engines and AI assistants decide for themselves what to show and what to cite. Nobody controls that, and anybody who tells you they guarantee a position or a citation is selling you something they cannot deliver. We commit to the work and to reporting honestly what moved and what did not.</p>
      <p>This site is provided as it stands. We do not promise it is free of error or always available. To the extent the law allows, we are not liable for indirect or consequential loss arising from using it. Nothing here limits liability for death, personal injury or fraud.</p>
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Ownership and links", h: "Ours, yours, and theirs." })}
      <p>The text, design, marks and code on this site belong to Fowned. The website address you submit, and anything you send us, stays yours. You give us permission to use it for the purpose you sent it for, which is running your audit and replying to you.</p>
      <p>Links to other sites are for convenience. What is on them is their responsibility, not ours.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Changes and contact", h: "Dated, and answerable." })}
      <p>We may update these terms. The date at the top is the date of the current text, and continuing to use the site after a change means you accept it.</p>
      <p>Questions go through the <a href="/contact/">contact form</a> or the phone number in the footer. How we handle what you send is set out in the <a href="/privacy/">privacy policy</a>.</p>
    </div>
  </section>
`,
};
