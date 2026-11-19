"""Validates a Chrome Web Store package zip: every manifest path must exist,
popup.html relative references must resolve, and no dev-only host may remain."""
import json
import os
import posixpath
import re
import sys
import zipfile


def main(zip_path):
    z = zipfile.ZipFile(zip_path)
    names = set(n for n in z.namelist() if not n.endswith("/"))
    problems = []

    if "manifest.json" not in names:
        problems.append("manifest.json is not at the zip root")
        print_report(zip_path, names, problems, [])
        return 1

    manifest = json.loads(z.read("manifest.json").decode("utf-8"))
    checks = []

    for size, path in manifest.get("icons", {}).items():
        checks.append((f"icons[{size}]", path))
    for size, path in manifest.get("action", {}).get("default_icon", {}).items():
        checks.append((f"action.default_icon[{size}]", path))
    checks.append(("action.default_popup", manifest["action"]["default_popup"]))
    checks.append(("background.service_worker", manifest["background"]["service_worker"]))
    for i, cs in enumerate(manifest.get("content_scripts", [])):
        for j, js in enumerate(cs.get("js", [])):
            checks.append((f"content_scripts[{i}].js[{j}]", js))
        for j, css in enumerate(cs.get("css", [])):
            checks.append((f"content_scripts[{i}].css[{j}]", css))

    for label, path in checks:
        if path not in names:
            problems.append(f"{label} -> {path} : MISSING")

    # popup html relative references
    popup = manifest["action"]["default_popup"]
    if popup in names:
        html = z.read(popup).decode("utf-8")
        base = posixpath.dirname(popup)
        refs = re.findall(r'(?:src|href)="([^"]+)"', html)
        for ref in refs:
            if ref.startswith(("http://", "https://", "data:", "#")):
                continue
            target = posixpath.normpath(posixpath.join(base, ref.split("?")[0]))
            status = "ok" if target in names else "MISSING"
            if status == "MISSING":
                problems.append(f"popup.html ref {ref} -> {target} : MISSING")
            print(f"  popup ref {ref:45s} -> {target:45s} {status}")

    # forbidden strings in any text file
    for n in sorted(names):
        if n.endswith((".js", ".json", ".html", ".css")):
            text = z.read(n).decode("utf-8", "replace")
            for bad in ("localhost:3000", "http://localhost"):
                if bad in text:
                    problems.append(f"{n} still contains '{bad}'")

    for label, path in checks:
        print(f"  manifest {label:32s} -> {path:45s} {'ok' if path in names else 'MISSING'}")

    print_report(zip_path, names, problems, checks)
    return 1 if problems else 0


def print_report(zip_path, names, problems, checks):
    print("\n=== files ===")
    for n in sorted(names):
        print(f"  {n}")
    print(f"\ntotal files: {len(names)}")
    print(f"zip size: {os.path.getsize(zip_path)} bytes")
    if problems:
        print("\n=== PROBLEMS ===")
        for p in problems:
            print("  !", p)
        print(f"\nRESULT: FAIL ({len(problems)} problem(s))")
    else:
        print("\nRESULT: OK — every manifest path and popup reference resolves; no dev host remains.")


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "algo-notion-sync-webstore-v1.0.1.zip"))
