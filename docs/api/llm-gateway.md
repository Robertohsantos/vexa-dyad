# LLM Gateway — Guia de Integração

Este gateway recebe chamadas no **formato OpenAI Chat Completions** e roteia para o provedor **OpenRouter** usando o modelo **GLM‑4.5**.

## Mapeamento de modelo
- Do cliente (Claude Code): `model: "glm-4.5"`
- No gateway: mapeie para o provedor `z-ai/glm-4.5` (ou `z-ai/glm-4.5-air`) do OpenRouter.

## Autenticação
- O Claude Code envia `Authorization: Bearer <token>` (variável `ANTHROPIC_AUTH_TOKEN`). O gateway valida e, internamente, usa a chave do provedor.

## Streaming
- Suporte a SSE para respostas com `stream: true`.

## Observabilidade
- Exporte métricas/traces com OpenTelemetry (latência, tokens, custos, erros) e IDs de correlação.

## Exemplo de requisição (cliente → gateway)
```http
POST /v1/chat/completions
Authorization: Bearer <token-do-gateway>
Content-Type: application/json

{
  "model": "glm-4.5",
  "messages": [
    {"role":"system","content":"..."},
    {"role":"user","content":"..."}
  ],
  "stream": true
}
```

## Observações
- Ao trocar o modelo, altere apenas o mapeamento interno (sem impacto no cliente).
- Normalize diferenças de esquema entre provedores no próprio gateway.
