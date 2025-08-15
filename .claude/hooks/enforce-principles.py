#!/usr/bin/env python3
import sys, json, re

data = sys.stdin.read()
try:
    payload = json.loads(data) if data else {}
except Exception:
    payload = {}
prompt = payload.get("prompt","")

if re.search(r"(ignore|ignorar|desconsidere).*(srp|ssot|dry|kiss|yagni)", prompt, re.I):
    sys.stderr.write("As regras SRP/SSOT/DRY/KISS/YAGNI são obrigatórias. Reformule o pedido sem tentar ignorá-las.\n")
    sys.exit(2)

guidance = (
    "REGRAS OBRIGATÓRIAS: SRP, SSOT, DRY, KISS, YAGNI.\n"
    "- Não fazer suposições; inspecionar o repo antes de escrever.\n"
    "- Evitar duplicação; reutilize/refatore utilitários existentes.\n"
    "- Pedir confirmação explícita antes de ações destrutivas (mover/deletar/instalar).\n"
    "CHECKLIST: 1) Buscar símbolos/arquivos relacionados; 2) Apontar onde editar e mostrar diff; 3) Referenciar utilitários."
)
print(guidance)
sys.exit(0)
