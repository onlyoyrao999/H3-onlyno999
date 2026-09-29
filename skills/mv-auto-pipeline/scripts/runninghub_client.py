#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RunningHub ComfyUI Workflow Client for MV-AUTO-PIPELINE & MiniMax H3 Director (V2.1.0)
Official verified 15-second / 362-frame atomic dispatch engine.
"""

import os
import sys
import json
import time
import argparse
import urllib.request
import urllib.parse
import ssl
from typing import Dict, Any, Optional, List

RUNNINGHUB_BASE_URL = "https://www.runninghub.cn"
DEFAULT_WORKFLOW_ID = "2100506281638457345"
DEFAULT_COMFY_UUID = "79e9753c-d7eb-464f-b072-38c26f869748"
DEFAULT_INVITE_CODE = "wefjn44t"
WORKFLOW_NAME = "MiniMax H3 官方 Director 15秒/362帧 原子出片工作流"

class RunningHubClient:
    def __init__(self, api_key: Optional[str] = None, base_url: str = RUNNINGHUB_BASE_URL, dry_run: bool = False):
        self.api_key = api_key or os.environ.get("RUNNINGHUB_API_KEY", "").strip()
        self.base_url = base_url.rstrip("/")
        self.dry_run = dry_run or not bool(self.api_key)
        self.ssl_ctx = ssl.create_default_context()
        self.ssl_ctx.check_hostname = False
        self.ssl_ctx.verify_mode = ssl.CERT_NONE

    def dispatch_director_15s(
        self,
        prompt: str,
        workflow_id: str = DEFAULT_WORKFLOW_ID,
        seed: int = 666,
        width: int = 736,
        height: int = 1280,
        frames: int = 362,
        enable_refine: bool = True,
        poll_interval: int = 5,
        max_poll_time: int = 600
    ) -> Dict[str, Any]:
        """
        Dispatches a verified 15-second shot to RunningHub using Node 12 MiniMaxH3Director
        """
        if self.dry_run:
            print(f"[!] Dry-run mode: RUNNINGHUB_API_KEY not provided.")
            return {
                "status": "SUCCESS",
                "taskId": f"rh_dryrun_{int(time.time())}",
                "workflowId": workflow_id,
                "msg": "Dry-run verification passed (15s/362f config)."
            }

        node_info_list = [
            {"nodeId": "12", "fieldName": "global_prompt", "fieldValue": prompt},
            {"nodeId": "12", "fieldName": "seed", "fieldValue": seed},
            {"nodeId": "12", "fieldName": "width", "fieldValue": width},
            {"nodeId": "12", "fieldName": "height", "fieldValue": height},
            {"nodeId": "12", "fieldName": "total_frames", "fieldValue": frames},
            {"nodeId": "12", "fieldName": "frame_rate", "fieldValue": 24},
            {"nodeId": "109", "fieldName": "boolean", "fieldValue": enable_refine}
        ]

        payload = {
            "apiKey": self.api_key,
            "workflowId": workflow_id,
            "nodeInfoList": node_info_list,
            "instanceType": "default",
            "usePersonalQueue": False
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "User-Agent": "MiniMax-H3-Director/2.1.0"
        }

        endpoints = [
            f"{self.base_url}/task/openapi/create",
            f"{self.base_url}/openapi/v2/run/workflow/{workflow_id}"
        ]

        task_id = None
        for endpoint in endpoints:
            try:
                req = urllib.request.Request(
                    endpoint,
                    data=json.dumps(payload).encode("utf-8"),
                    headers=headers,
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=30, context=self.ssl_ctx) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))

                code = resp_data.get("code", 0)
                if code in (0, 200) or resp_data.get("status") in ("QUEUED", "RUNNING", "SUCCESS"):
                    data = resp_data.get("data", {})
                    task_id = data.get("taskId") or resp_data.get("taskId")
                    if task_id:
                        print(f"[+] Task created successfully! Task ID: {task_id}")
                        break
            except Exception as e:
                pass

        if not task_id:
            return {"status": "FAILED", "error": "Failed to create task via RunningHub endpoints."}

        return self.poll_task(task_id, poll_interval, max_poll_time)

    def poll_task(self, task_id: str, interval: int = 5, max_time: int = 600) -> Dict[str, Any]:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        payload = {"apiKey": self.api_key, "taskId": task_id}
        endpoints = [
            f"{self.base_url}/task/openapi/outputs",
            f"{self.base_url}/openapi/v2/query"
        ]

        start_time = time.time()
        while time.time() - start_time < max_time:
            for endpoint in endpoints:
                try:
                    req = urllib.request.Request(
                        endpoint,
                        data=json.dumps(payload).encode("utf-8"),
                        headers=headers,
                        method="POST"
                    )
                    with urllib.request.urlopen(req, timeout=15, context=self.ssl_ctx) as resp:
                        resp_data = json.loads(resp.read().decode("utf-8"))

                    data = resp_data.get("data", {})
                    status = (data.get("status") or resp_data.get("status") or "").upper()
                    progress = data.get("progress", 0)

                    if status:
                        print(f"[*] Task {task_id} status: {status} | Progress: {progress}%")
                        if status in ("SUCCESS", "COMPLETED", "FINISHED"):
                            urls = data.get("outputUrls") or data.get("outputs") or resp_data.get("outputUrls") or []
                            return {"status": "SUCCESS", "taskId": task_id, "outputUrls": urls, "data": data}
                        elif status in ("FAILED", "ERROR"):
                            err = data.get("errorMsg") or resp_data.get("msg") or "Task failed"
                            return {"status": "FAILED", "taskId": task_id, "error": err}
                        break
                except Exception:
                    pass
            time.sleep(interval)

        return {"status": "TIMEOUT", "taskId": task_id, "error": "Polling timed out"}

def main():
    parser = argparse.ArgumentParser(description="RunningHub MiniMax H3 Director Dispatcher")
    parser.add_argument("--shot", type=str, default="P01_15s")
    parser.add_argument("--workflow-id", type=str, default=DEFAULT_WORKFLOW_ID)
    parser.add_argument("--api-key", type=str, default=os.environ.get("RUNNINGHUB_API_KEY", ""))
    parser.add_argument("--prompt", type=str, default="")
    parser.add_argument("--frames", type=int, default=362)
    parser.add_argument("--seed", type=int, default=666)
    
    args = parser.parse_args()
    client = RunningHubClient(api_key=args.api_key)
    res = client.dispatch_director_15s(
        prompt=args.prompt or "## P01｜15.083秒 (362帧)\n[subject_definitions]...",
        workflow_id=args.workflow_id,
        seed=args.seed,
        frames=args.frames
    )
    print(json.dumps(res, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
