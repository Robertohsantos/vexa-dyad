# OTEL.md — Observabilidade

- **Traces:** cada request tem `trace_id`, `span_id`, `tenant_id`, `artifact_id`.
- **Métricas:** latência p95 por fase, custo (tokens/$), % falhas, eventos de redator.
- **Logs:** estruturados com níveis; sem PII/segredos.
- **Export:** OTLP/HTTP para o coletor; sampling ajustável.
