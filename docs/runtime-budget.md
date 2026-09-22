# Runtime budget

| Critical path | Metric | Budget |
| --- | --- | --- |
| boards_list (`/boards` after auth) | Time to interactive heading "My Boards" | ≤ 5000 ms on local Next.js 16 / Node 22 |

Measured during until-100 Playwright proves (`app-eval-runs/openboard/prove-all.json`).
