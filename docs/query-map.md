# Fowned query universe (persisted 2026-09-06)

Source of truth for keyword rows: OpenSEO project fowned.live, saved keywords, tags `c1`..`c7` and `owner:<path>`.
Metrics: OpenSEO get_keyword_metrics, US, 2026-09-06. 13 of 50 queries carry Google Ads volume; the other 37 return no data (not zero demand, unmeasured).

| Cluster | Queries | Owner URL | Measured volume |
|---|---|---|---|
| c1 hire-provider | 13 | /services/ (choose-agency guide assists) | ai seo agency 1300 KD0; ai seo services 1300 KD2; GEO services 720 KD19; geo services 720; geo agency 590; aeo agency 480; aeo services 390; ai search optimization agency 390; GEO agency 390 KD0; GEO company 110; llm seo agency 110 |
| c2 local-ai-visibility | 7 | /ai-visibility/ | none measured |
| c3 why-missing | 5 | /answers/why-my-business-is-not-showing-up-on-chatgpt/ | none measured |
| c4 become-recommended | 7 | /answers/how-to-get-chatgpt-to-recommend-my-business/ (6), /answers/how-to-get-your-business-listed-in-chatgpt/ (1) | how to get cited by chatgpt 70 |
| c5 audit-intent | 7 | /guides/ai-visibility-audit-for-local-businesses/ then /audit/ | none measured |
| c6 local-seo-bridge | 6 | /guides/local-seo-vs-geo-vs-aeo/ (4); GAP evidence posts: GBP effect, reviews effect (2) | geo vs seo vs aeo 260 KD11 |
| c7 sources | 5 | /guides/what-sources-chatgpt-uses-to-recommend-local-businesses/ (2); GAP evidence posts: directories, local citations, schema (3) | none measured |

Rule: one owner per query. A new page is created only for a `owner:GAP-evidence-post` row.
Five GAP rows collapse into at most three evidence posts (GBP+reviews, directories+citations, schema).

## Refresh-or-spoke rule (operator, 2026-11-11)

The site is worked as one cluster: every guide is a spoke, and the work list
comes from Search Console, not from outside keyword tools.

1. Pull query + page rows from Search Console. For each page, list the queries
   it is shown for whose phrase is not on the page.
2. **Refresh first.** Add the phrase to the page that is already shown for it,
   as a question heading with its answer, when that page can answer it honestly.
3. **New spoke only when it cannot be added.** A query cannot be added when its
   intent is not the page's job, or when another page owns it. A page being
   inside its 28-day freeze is a reason to wait, not a reason for a new page.
4. Queries that cannot be housed are grouped by intent. One new spoke per
   intent, never one page per phrase. A group under 20 impressions per 28 days
   waits until it grows.
5. One owner per query still holds. When a new spoke takes a query, the page
   that used to be shown for it links to the spoke and does not add the phrase.

First use: `/guides/chatgpt-tracking-for-local-businesses/` takes the
"chatgpt tracking" group (785 impressions, 2026-08-12..11-09) from the
lead-tracking guide, which owns lead attribution only.
