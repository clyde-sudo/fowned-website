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
