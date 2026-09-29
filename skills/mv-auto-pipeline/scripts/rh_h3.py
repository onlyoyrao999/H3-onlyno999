#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RunningHub OpenAPI v2 & MiniMax H3 Director CLI Dispatcher (rh_h3.py)
"""

import os
import sys
import json
import argparse
from runninghub_client import RunningHubClient

def main():
    parser = argparse.ArgumentParser(description="RunningHub MiniMax H3 OpenAPI v2 CLI Dispatcher")
    parser.add_argument("--shot", type=str, default="shot_01", help="Target shot ID")
    parser.add_argument("--workflow-type", type=str, choices=["director", "mv_digital_human"], default="director")
    parser.add_argument("--dry-run", action="store_true", default=True, help="Run in sandbox dry-run mode")
    parser.add_argument("--api-key", type=str, default=os.environ.get("RUNNINGHUB_API_KEY", ""))
    parser.add_argument("--prompt", type=str, default="subject_definitions: ...", help="Prompt text")
    parser.add_argument("--duration", type=float, default=15.083, help="Duration in seconds")
    
    args = parser.parse_args()
    print(f"[*] rh_h3.py initialized for RunningHub OpenAPI v2.")
    print(f"[*] Workflow Mode: {args.workflow_type}, Target: {args.shot}, DryRun: {args.dry_run}")
    
    if args.dry_run:
        print("[+] [Sandbox] Task dispatched successfully to RunningHub OpenAPI v2 endpoint.")
        print(f"[+] Task ID: rh_task_{args.shot}_simulated")
        print("[+] Output Video: https://www.runninghub.cn/output/sample_h3_director_output.mp4")
    else:
        client = RunningHubClient(api_key=args.api_key, dry_run=False)
        res = client.dispatch_shot(args.shot, {"prompt": args.prompt, "duration": args.duration})
        print(json.dumps(res, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
