/* Body for retired URLs. functions/_middleware.js serves this with a 410
 * status; the build keeps it out of the sitemap and llms.txt. */
export default {
  path: "/410/",
  title: "Page removed | Fowned",
  description: "This page has been removed from the site.",
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">410</span>
      <h1>This page has been removed.</h1>
      <p class="hero-sub">It held an illustrative example, not a real client result, so it has been taken down. A real case study will be published here once one is ready.</p>
      <div class="hero-ctas">
        <a href="/" class="btn btn-primary">Back to the homepage</a>
        <a href="/audit/" class="btn btn-secondary">Request the free audit</a>
      </div>
    </div>
  </section>`,
};
