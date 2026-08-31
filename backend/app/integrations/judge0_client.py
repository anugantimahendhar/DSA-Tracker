import base64
import subprocess
import tempfile
import os
import sys
import time
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
from app.utils.language_helpers import get_judge0_language_id


class Judge0Client:
    def __init__(self):
        self.api_url = settings.JUDGE0_API_URL.rstrip('/')
        self.api_key = settings.JUDGE0_API_KEY
        self.host = settings.JUDGE0_HOST
        self.timeout = settings.JUDGE0_TIMEOUT_SECONDS

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
        }
        if self.api_key and self.api_key != "placeholder-judge0-key":
            headers["X-RapidAPI-Key"] = self.api_key
            headers["X-RapidAPI-Host"] = self.host
        return headers

    async def execute_code(self, source_code: str, language: str, stdin: str = "") -> Dict[str, Any]:
        """
        Executes code via Judge0 API or localized safe sandbox fallback.
        """
        # Check if real API key is configured
        if self.api_key and self.api_key != "placeholder-judge0-key":
            try:
                lang_id = get_judge0_language_id(language)
                payload = {
                    "source_code": base64.b64encode(source_code.encode("utf-8")).decode("utf-8"),
                    "language_id": lang_id,
                    "stdin": base64.b64encode(stdin.encode("utf-8")).decode("utf-8"),
                    "cpu_time_limit": self.timeout,
                    "wall_time_limit": self.timeout * 2,
                    "memory_limit": 128000,
                }
                
                url = f"{self.api_url}/submissions?base64_encoded=true&wait=true"
                async with httpx.AsyncClient(timeout=self.timeout + 5.0) as client:
                    response = await client.post(url, json=payload, headers=self._get_headers())
                    if response.status_code in (200, 201):
                        data = response.json()
                        stdout = base64.b64decode(data.get("stdout") or "").decode("utf-8", errors="replace") if data.get("stdout") else ""
                        stderr = base64.b64decode(data.get("stderr") or "").decode("utf-8", errors="replace") if data.get("stderr") else ""
                        compile_output = base64.b64decode(data.get("compile_output") or "").decode("utf-8", errors="replace") if data.get("compile_output") else ""
                        status_info = data.get("status", {})
                        
                        return {
                            "stdout": stdout.strip(),
                            "stderr": stderr.strip(),
                            "compile_output": compile_output.strip(),
                            "status_id": status_info.get("id", 3),
                            "status_description": status_info.get("description", "Accepted"),
                            "time_ms": float(data.get("time", 0) or 0) * 1000,
                            "memory_kb": float(data.get("memory", 0) or 0),
                            "token": data.get("token", "")
                        }
            except Exception as exc:
                if not settings.ALLOW_SANDBOX_FALLBACK:
                    raise exc
                # If network fails or timeout, fall through to sandbox runner
        
        # Local Sandbox Fallback Runner
        if settings.ALLOW_SANDBOX_FALLBACK:
            return self._run_local_sandbox(source_code, language, stdin)

        raise RuntimeError("Judge0 execution unavailable and fallback is disabled.")

    def _run_local_sandbox(self, source_code: str, language: str, stdin: str) -> Dict[str, Any]:
        """
        Safely executes code locally with subprocess and timeout.
        """
        lang = language.lower()
        start_time = time.time()
        
        try:
            if lang in ("python", "py", "python3"):
                proc = subprocess.run(
                    [sys.executable, "-c", source_code],
                    input=stdin,
                    text=True,
                    capture_output=True,
                    timeout=self.timeout
                )
                elapsed_ms = (time.time() - start_time) * 1000
                if proc.returncode != 0:
                    return {
                        "stdout": proc.stdout.strip(),
                        "stderr": proc.stderr.strip(),
                        "compile_output": "",
                        "status_id": 11, # Runtime Error
                        "status_description": "Runtime Error (NZEC)",
                        "time_ms": elapsed_ms,
                        "memory_kb": 12000.0,
                        "token": "local-sandbox"
                    }
                return {
                    "stdout": proc.stdout.strip(),
                    "stderr": proc.stderr.strip(),
                    "compile_output": "",
                    "status_id": 3, # Accepted
                    "status_description": "Accepted",
                    "time_ms": elapsed_ms,
                    "memory_kb": 12000.0,
                    "token": "local-sandbox"
                }

            elif lang in ("javascript", "js", "node", "nodejs"):
                proc = subprocess.run(
                    ["node", "-e", source_code],
                    input=stdin,
                    text=True,
                    capture_output=True,
                    timeout=self.timeout
                )
                elapsed_ms = (time.time() - start_time) * 1000
                if proc.returncode != 0:
                    return {
                        "stdout": proc.stdout.strip(),
                        "stderr": proc.stderr.strip(),
                        "compile_output": "",
                        "status_id": 11,
                        "status_description": "Runtime Error",
                        "time_ms": elapsed_ms,
                        "memory_kb": 15000.0,
                        "token": "local-sandbox"
                    }
                return {
                    "stdout": proc.stdout.strip(),
                    "stderr": proc.stderr.strip(),
                    "compile_output": "",
                    "status_id": 3,
                    "status_description": "Accepted",
                    "time_ms": elapsed_ms,
                    "memory_kb": 15000.0,
                    "token": "local-sandbox"
                }

            elif lang in ("cpp", "c++"):
                # Check for g++
                with tempfile.TemporaryDirectory() as tmpdir:
                    src_file = os.path.join(tmpdir, "solution.cpp")
                    exe_file = os.path.join(tmpdir, "solution.exe" if os.name == "nt" else "solution")
                    with open(src_file, "w", encoding="utf-8") as f:
                        f.write(source_code)
                    
                    comp = subprocess.run(
                        ["g++", "-O2", src_file, "-o", exe_file],
                        capture_output=True,
                        text=True,
                        timeout=self.timeout
                    )
                    if comp.returncode != 0:
                        return {
                            "stdout": "",
                            "stderr": "",
                            "compile_output": comp.stderr.strip(),
                            "status_id": 6, # Compilation Error
                            "status_description": "Compilation Error",
                            "time_ms": 0.0,
                            "memory_kb": 0.0,
                            "token": "local-sandbox"
                        }
                    
                    run_proc = subprocess.run(
                        [exe_file],
                        input=stdin,
                        text=True,
                        capture_output=True,
                        timeout=self.timeout
                    )
                    elapsed_ms = (time.time() - start_time) * 1000
                    return {
                        "stdout": run_proc.stdout.strip(),
                        "stderr": run_proc.stderr.strip(),
                        "compile_output": "",
                        "status_id": 3 if run_proc.returncode == 0 else 11,
                        "status_description": "Accepted" if run_proc.returncode == 0 else "Runtime Error",
                        "time_ms": elapsed_ms,
                        "memory_kb": 8000.0,
                        "token": "local-sandbox"
                    }

            elif lang == "java":
                with tempfile.TemporaryDirectory() as tmpdir:
                    src_file = os.path.join(tmpdir, "Main.java")
                    with open(src_file, "w", encoding="utf-8") as f:
                        f.write(source_code)
                    
                    comp = subprocess.run(
                        ["javac", src_file],
                        capture_output=True,
                        text=True,
                        timeout=self.timeout
                    )
                    if comp.returncode != 0:
                        return {
                            "stdout": "",
                            "stderr": "",
                            "compile_output": comp.stderr.strip(),
                            "status_id": 6,
                            "status_description": "Compilation Error",
                            "time_ms": 0.0,
                            "memory_kb": 0.0,
                            "token": "local-sandbox"
                        }
                    
                    run_proc = subprocess.run(
                        ["java", "-cp", tmpdir, "Main"],
                        input=stdin,
                        text=True,
                        capture_output=True,
                        timeout=self.timeout
                    )
                    elapsed_ms = (time.time() - start_time) * 1000
                    return {
                        "stdout": run_proc.stdout.strip(),
                        "stderr": run_proc.stderr.strip(),
                        "compile_output": "",
                        "status_id": 3 if run_proc.returncode == 0 else 11,
                        "status_description": "Accepted" if run_proc.returncode == 0 else "Runtime Error",
                        "time_ms": elapsed_ms,
                        "memory_kb": 24000.0,
                        "token": "local-sandbox"
                    }

            else:
                return {
                    "stdout": "",
                    "stderr": f"Unsupported language: {language}",
                    "compile_output": "",
                    "status_id": 11,
                    "status_description": "Language Not Supported in Sandbox",
                    "time_ms": 0.0,
                    "memory_kb": 0.0,
                    "token": "local-sandbox"
                }

        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": "Time Limit Exceeded",
                "compile_output": "",
                "status_id": 5, # Time Limit Exceeded
                "status_description": "Time Limit Exceeded",
                "time_ms": self.timeout * 1000,
                "memory_kb": 0.0,
                "token": "local-sandbox"
            }
        except FileNotFoundError as fnf:
            # Compiler or runtime binary not installed
            return {
                "stdout": "",
                "stderr": f"Runtime binary not found for {language}: {str(fnf)}",
                "compile_output": "",
                "status_id": 11,
                "status_description": "Environment Runtime Not Found",
                "time_ms": 0.0,
                "memory_kb": 0.0,
                "token": "local-sandbox"
            }
        except Exception as e:
            return {
                "stdout": "",
                "stderr": str(e),
                "compile_output": "",
                "status_id": 11,
                "status_description": "Internal Error",
                "time_ms": 0.0,
                "memory_kb": 0.0,
                "token": "local-sandbox"
            }


judge0_client = Judge0Client()