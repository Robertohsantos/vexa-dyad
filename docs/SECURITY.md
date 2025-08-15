# SECURITY.md

## Escopo
Este documento resume práticas de segurança para o gateway, MCP servers e cliente.

## Ameaças (STRIDE) — Resumo
- **Spoofing:** tokens Bearer do gateway/MCP devem ser validados e rotacionados.
- **Tampering:** todas as respostas assinadas com correlação; logs imutáveis.
- **Repudiation:** trilhas de auditoria por requisição (trace/span id).
- **Information Disclosure:** nunca logar PII/segredos; redator na borda pública.
- **Denial of Service:** rate limit por tenant e backpressure.
- **Elevation of Privilege:** whitelists de ferramentas; separar papéis/escopos.

## OWASP ASVS (nível alvo)
- Autenticação, gestão de sessão e autorização.
- Proteção de dados (em trânsito e em repouso).
- Logging/auditoria e monitoramento.
- Configuração segura e dependências.
