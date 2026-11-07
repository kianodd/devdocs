#!/usr/bin/env python3
"""Fast incremental update: upload only the given files as blobs and commit
them on top of the current main tree. Usage: python3 update.py file1 [file2...] "commit message" """
import base64, json, os, sys, urllib.request, urllib.error
sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import add_surrogate_to_request, read_json_response

BASE = "https://api.github.com"
OWNER, REPO = "kianodd", "devdocs"
ROOT = os.path.dirname(os.path.abspath(__file__))

def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={"Content-Type": "application/json"} if data else {})
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    add_surrogate_to_request(req, "custom.github-pat", allowed_hosts=["api.github.com"])
    try:
        with urllib.request.build_opener().open(req, timeout=120) as r:
            return r.status, read_json_response(r)
    except urllib.error.HTTPError as e:
        try: return e.code, read_json_response(e)
        except Exception: return e.code, {}

def main():
    *paths, message = sys.argv[1:]
    st, ref = api("GET", f"/repos/{OWNER}/{REPO}/git/ref/heads/main")
    parent = ref["object"]["sha"]
    st, commit0 = api("GET", f"/repos/{OWNER}/{REPO}/git/commits/{parent}")
    base_tree = commit0["tree"]["sha"]
    entries = []
    for rel in paths:
        with open(os.path.join(ROOT, rel), "rb") as f:
            content = base64.b64encode(f.read()).decode()
        st, blob = api("POST", f"/repos/{OWNER}/{REPO}/git/blobs", {"content": content, "encoding": "base64"})
        if st not in (200, 201): print("blob failed", rel, st); sys.exit(1)
        entries.append({"path": rel.replace(os.sep, "/"), "mode": "100644", "type": "blob", "sha": blob["sha"]})
    st, t = api("POST", f"/repos/{OWNER}/{REPO}/git/trees", {"base_tree": base_tree, "tree": entries})
    if st not in (200, 201): print("tree failed", st, t); sys.exit(1)
    st, commit = api("POST", f"/repos/{OWNER}/{REPO}/git/commits",
                     {"message": message, "tree": t["sha"], "parents": [parent]})
    if st not in (200, 201): print("commit failed", st, commit); sys.exit(1)
    st, r = api("PATCH", f"/repos/{OWNER}/{REPO}/git/refs/heads/main", {"sha": commit["sha"]})
    print("updated:", st, commit["sha"][:8])
    st, b = api("POST", f"/repos/{OWNER}/{REPO}/pages/builds")
    print("pages build requested:", st)

if __name__ == "__main__":
    main()
