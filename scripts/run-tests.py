#!/usr/bin/env python3
"""
Automatic test runner that discovers and executes tests across the repo.

Usage:
    python3 scripts/run-tests.py                 # Run all tests
    python3 scripts/run-tests.py --config PATH    # Custom config path
    python3 scripts/run-tests.py --list           # List test suites
    python3 scripts/run-tests.py --suite NAME     # Run a specific suite

Scans for .testrunner.yml at the project root (or specified path),
executes each test command in its directory, and reports results.
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("Error: PyYAML is required. Install with: pip install pyyaml", file=sys.stderr)
    sys.exit(1)


PASS = "PASS"
FAIL = "FAIL"
SKIP = "SKIP"

RESET = "\033[0m"
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"


def find_config(start: Path) -> Path | None:
    for path in [start, start.parent, Path.cwd()]:
        candidate = path / ".testrunner.yml"
        if candidate.exists():
            return candidate
    return None


def load_config(path: Path) -> dict:
    with open(path) as f:
        cfg = yaml.safe_load(f)
    if not cfg or "tests" not in cfg:
        print(f"Error: no 'tests' key found in {path}", file=sys.stderr)
        sys.exit(1)
    return cfg


def color(status: str, text: str) -> str:
    if status == PASS:
        return f"{GREEN}{text}{RESET}"
    if status == FAIL:
        return f"{RED}{text}{RESET}"
    if status == SKIP:
        return f"{YELLOW}{text}{RESET}"
    return text


def run_test(root: Path, entry: dict) -> tuple[str, str | None]:
    name = entry["name"]
    rel_path = entry["path"]
    command = entry["command"]
    optional = entry.get("optional", False)

    target_dir = (root / rel_path).resolve()
    if not target_dir.is_dir():
        msg = f"Directory not found: {target_dir}"
        if optional:
            return SKIP, msg
        return FAIL, msg

    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=str(target_dir),
            capture_output=True,
            text=True,
            timeout=120,
        )
    except subprocess.TimeoutExpired:
        return FAIL, "Timed out (120s)"
    except Exception as e:
        return FAIL, str(e)

    output = result.stdout + result.stderr

    if result.returncode == 0:
        return PASS, output
    else:
        return FAIL, output


def main():
    parser = argparse.ArgumentParser(
        description="Sports Dashboard Test Runner"
    )
    parser.add_argument(
        "--config",
        help="Path to .testrunner.yml (default: auto-discover)",
    )
    parser.add_argument(
        "--suite",
        help="Run only a specific test suite by name",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List all test suites without running them",
    )
    args = parser.parse_args()

    if args.config:
        config_path = Path(args.config)
        if not config_path.exists():
            print(f"Error: config not found: {config_path}", file=sys.stderr)
            sys.exit(1)
    else:
        config_path = find_config(Path(__file__).resolve())
        if not config_path:
            print(
                "Error: no .testrunner.yml found. Create one or use --config.",
                file=sys.stderr,
            )
            sys.exit(1)

    root = config_path.parent
    cfg = load_config(config_path)
    suites = cfg["tests"]

    if args.list:
        print(f"{BOLD}Available test suites:{RESET}")
        for s in suites:
            opt = " (optional)" if s.get("optional") else ""
            print(f"  {CYAN}{s['name']}{RESET}{opt}")
        print(f"\n  Total: {len(suites)} suite(s)")
        return

    if args.suite:
        suites = [s for s in suites if s["name"] == args.suite]
        if not suites:
            print(f"Error: no suite named '{args.suite}'", file=sys.stderr)
            sys.exit(1)

    total = len(suites)
    passed = 0
    failed = 0
    skipped = 0
    results = []

    print(f"\n{BOLD}=== Test Runner: {config_path.name} ==={RESET}\n")

    for i, entry in enumerate(suites, 1):
        name = entry["name"]
        print(f"[{i}/{total}] {name} ... ", end="", flush=True)

        status, output = run_test(root, entry)

        if status == PASS:
            print(color(PASS, PASS))
            passed += 1
        elif status == SKIP:
            print(color(SKIP, f"{SKIP} ({output})"))
            skipped += 1
        else:
            print(color(FAIL, FAIL))
            failed += 1

        results.append((name, status, output))

    print(f"\n{BOLD}{'='*50}{RESET}")
    print(f"{BOLD}Summary:{RESET}")
    print(f"  {GREEN}Passed:{RESET}  {passed}")
    if failed:
        print(f"  {RED}Failed:{RESET}  {failed}")
    if skipped:
        print(f"  {YELLOW}Skipped:{RESET} {skipped}")
    print(f"  Total:   {total}")

    for name, status, output in results:
        if status == FAIL:
            print(f"\n{RED}{BOLD}--- {name} Output ---{RESET}")
            print(output.strip()[:2000])
            print(f"{RED}{BOLD}--- End ---{RESET}")

    sys.exit(1 if failed > 0 else 0)


if __name__ == "__main__":
    main()
