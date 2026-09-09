from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

# Generated from apps/web/lib/portfolio-data.ts — the site's single source of
# truth — via `npm run export:portfolio` (apps/web/scripts/export-portfolio-data.ts).
# Re-run that whenever portfolio-data.ts changes to keep the agent in sync.
PORTFOLIO_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "portfolio.json"


@lru_cache(maxsize=1)
def load_portfolio_data() -> dict:
    if not PORTFOLIO_DATA_PATH.exists():
        raise FileNotFoundError(
            f"{PORTFOLIO_DATA_PATH} not found — run `npm run export:portfolio` "
            "in apps/web to generate it from portfolio-data.ts."
        )
    return json.loads(PORTFOLIO_DATA_PATH.read_text(encoding="utf-8"))
