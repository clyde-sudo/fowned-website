import { head, cta, truth } from "../ui.mjs";

export default {
  path: "/case-studies/",
  title: "Worked example | an illustrative GEO engagement | Fowned",
  description:
    "A step-by-step illustrative walkthrough of a Fowned engagement, from blocked retrieval to re-measurement. Constructed example, not a real client result.",
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="demo-chip">ILLUSTRATIVE DEMO</span>
      <h1>A worked example, start to finish.</h1>
      <p class="hero-sub">This walkthrough is <strong>constructed</strong>. Verdigris Roofing Co does not exist and the figures were not measured. It is here to show the shape of an engagement, not to claim a result. We would rather show you an honest invention than an unverifiable success story.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
      <div class="case-step">
        <span class="label">Before &middot; observation</span>
        <h2>What the audit found.</h2>
        <p>A regional roofing contractor with a competent-looking website was named in one of six sampled category questions, and described with a phone number that had been out of service for a year.</p>
        <ul class="claim-list">
          <li><strong>Retrieval:</strong> 6 of 11 checks passing. Firewall rules returned 403 to every non-browser client, so most pages were never fetched.</li>
          <li><strong>Identity:</strong> no structured data identified the business anywhere on the site.</li>
          <li><strong>Consistency:</strong> the phone number differed across four directory listings.</li>
          <li><strong>Answer presence:</strong> named in 1 of 6 sampled questions ${truth("CURRENT")}, always after a competitor.</li>
        </ul>
      </div>

      <div class="case-step">
        <span class="label">Intervention &middot; what Fowned would do</span>
        <h2>Four changes, in dependency order.</h2>
        <ol class="ordered-list">
          <li>Allow documented retrieval agents through the firewall rule. Nothing else can be evaluated until pages can actually be fetched, so this goes first regardless of its size.</li>
          <li>Add server-rendered organization and service structured data, so the business is identifiable without executing JavaScript.</li>
          <li>Correct the two stale directory listings carrying the old phone number, then re-check the aggregators that syndicate from them.</li>
          <li>Rewrite the four highest-intent service pages so each answers its question completely in the first two paragraphs.</li>
        </ol>
      </div>

      <div class="case-step">
        <span class="label">After &middot; re-measure</span>
        <h2>What the next measurement would show.</h2>
        <p>Two of these are directly verifiable on the following scheduled run. The other two are not, and the difference matters more than the numbers.</p>
        <ul class="claim-list">
          <li><strong>Directly verifiable:</strong> retrieval access restored, structured data present and valid. These are pass or fail, and they either hold or they do not.</li>
          <li><strong>Observed, not attributed:</strong> answer presence moving from 1 of 6 to 3 of 6 would be recorded as an observation. With a sample of six, that movement is not statistically separable from noise, and it would be reported that way rather than as a 200 percent improvement.</li>
          <li><strong>Not claimed:</strong> that any specific enquiry arrived because of an AI answer. Referrers are recorded, so an AI referrer would be labelled as observed. The causal step from answer to enquiry is not observable and does not get asserted.</li>
        </ul>
      </div>

      <div class="case-note">
        <span class="demo-chip">ILLUSTRATIVE DEMO</span>
        <p>Numbers on this page are constructed for explanation. When Fowned publishes a real client result it will name the client, the dates, the measurement method and the sample size, or it will not be published.</p>
      </div>
    </div>
  </section>

${cta({
  h: "Run the first step on your own site.",
  p: "The audit produces the observation stage of exactly this walkthrough, with your numbers instead of invented ones.",
  primary: { href: "/audit/", text: "Run my free audit →", ev: "case_audit" },
  secondary: { href: "/how-it-works/", text: "See the method", ev: "case_how" },
})}`,
};
