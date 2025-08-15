# Schemas — Artefatos do Fluxo

Este diretório deve conter os JSON Schemas dos artefatos (IntentCard, AnalysisSpec, PRDSpec, ArchitectureSpec, UXSpec, POReview, ShardingManifest, DevStory, QAPlan, QAReport, GateResult, CoherenceReport, CitationObject, ExternalSource).

- Publique cada schema em uma URL canônica (campo `$schema`) e versionamento semântico.
- Valide os artefatos com AJV/Zod no pipeline do orquestrador.
