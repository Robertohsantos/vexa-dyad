#!/usr/bin/env python3
import sys, json, re, subprocess, shlex

data = sys.stdin.read()
try:
    payload = json.loads(data) if data else {}
except Exception:
    payload = {}
tool = (payload.get("tool_name") or payload.get("tool") or "").strip()
ti = payload.get("tool_input") or payload.get("args") or {}

def grep_repo(q: str) -> str:
    try:
        cmd = f"git ls-files | xargs -r grep -nIH --color=never -e {shlex.quote(q)}"
        out = subprocess.check_output(["bash","-lc", cmd], text=True, stderr=subprocess.DEVNULL)
        return out.strip()
    except subprocess.CalledProcessError:
        return ""

if tool.lower() == "bash":
    cmd = (ti.get("command") or "").lower()
    if re.search(r"\brm\s+-rf\b|git\s+reset\s+--hard\b|docker\s+system\s+prune\b|mkfs\\.|format\\s", cmd):
        sys.stderr.write("Comando potencialmente destrutivo bloqueado. Explique o plano, peça confirmação explícita e mostre diff/backup.\n")
        sys.exit(2)

if tool in ("Write","Edit","MultiEdit"):
    content = (ti.get("content") or ti.get("patch") or "")
    ids = [m[1] for m in re.findall(r'\b(class|function|def)\s+([A-Za-z_]\w+)', content)]
    hits = []
    for q in ids[:3]:
        out = grep_repo(q)
        if out:
            hits.append(f"→ Possíveis ocorrências para '{q}':\n{out[:1200]}")
    if hits:
        sys.stderr.write("Possível duplicação detectada. Reutilize/refatore utilitários existentes ou centralize (SSOT).\n\n" + "\n".join(hits) + "\n")
        sys.exit(2)

sys.exit(0)
