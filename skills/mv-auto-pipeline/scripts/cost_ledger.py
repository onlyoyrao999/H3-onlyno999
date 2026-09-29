#!/usr/bin/env python3
"""
cost_ledger.py - MV-Auto-Pipeline Cost Ledger & Dual-Pool Budget Controller
Tracks compute tokens, API costs, real money caps, and shot status.
"""

import json
import time

class CostLedger:
    def __init__(self, budget_cap_usd: float = 25.0):
        self.budget_cap_usd = budget_cap_usd
        self.shots_ledger = {}
        self.total_compute_tokens = 0
        self.total_cost_usd = 0.0
        self.render_wall_clock_seconds = 0.0

    def record_shot(
        self, 
        shot_id: str, 
        pool_type: str, 
        tokens_used: int, 
        cost_usd: float, 
        duration_sec: float,
        generation_sec: float,
        reroll_count: int = 0
    ):
        if (self.total_cost_usd + cost_usd) > self.budget_cap_usd and cost_usd > 0:
            raise PermissionError(f"Budget Cap Exceeded! Current: ${self.total_cost_usd:.2f}, Attempted: +${cost_usd:.2f}, Cap: ${self.budget_cap_usd:.2f}")

        self.total_compute_tokens += tokens_used
        self.total_cost_usd += cost_usd
        self.render_wall_clock_seconds += generation_sec

        self.shots_ledger[shot_id] = {
            "shot_id": shot_id,
            "pool_type": pool_type,  # 'spot_free' or 'priority_paid'
            "tokens_used": tokens_used,
            "cost_usd": cost_usd,
            "shot_duration_sec": duration_sec,
            "generation_sec": generation_sec,
            "reroll_count": reroll_count,
            "timestamp": time.time()
        }

    def get_summary(self, target_mv_duration: float) -> dict:
        return {
            "mv_total_duration_seconds": target_mv_duration,
            "render_total_time_seconds": round(self.render_wall_clock_seconds, 2),
            "total_tokens": self.total_compute_tokens,
            "total_cost_usd": round(self.total_cost_usd, 4),
            "budget_cap_usd": self.budget_cap_usd,
            "budget_remaining_usd": round(self.budget_cap_usd - self.total_cost_usd, 4),
            "total_shots_completed": len(self.shots_ledger),
            "shots": self.shots_ledger
        }

if __name__ == "__main__":
    ledger = CostLedger(budget_cap_usd=20.0)
    ledger.record_shot("shot_01", "spot_free", tokens_used=1200, cost_usd=0.0, duration_sec=4.0, generation_sec=28.5)
    ledger.record_shot("shot_02", "priority_paid", tokens_used=2400, cost_usd=0.45, duration_sec=4.2, generation_sec=32.1)
    print(json.dumps(ledger.get_summary(target_mv_duration=8.2), indent=2))
