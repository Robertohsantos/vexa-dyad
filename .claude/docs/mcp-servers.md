# MCP Servers — Orientações

## Objetivo
Expõe o **motor/orquestração** e a **política de Web Search** como **MCP servers** remotos para o Claude Code.

## Escopos e aprovação
- **Projeto** (`.mcp.json`): compartilhado via git; requer aprovação dos membros ao abrir o projeto no Claude.
- **Usuário** (`--scope user`): privado do usuário; útil para testes.

## Autenticação
- Use `Authorization: Bearer ${MCP_TOKEN}` nos servidores HTTP/SSE. Você pode rotacionar tokens sem alterar o repo (apenas variáveis de ambiente).

## Boas práticas
- Prefixe ferramentas MCP com nomes claros (ex.: `mcp__web-policy__search`).  
- Garanta timeouts e budgets do lado do servidor (o cliente não deve forçar orçamentos).  
- Registre auditoria (queries, fontes, custos, latência) do lado do servidor.
