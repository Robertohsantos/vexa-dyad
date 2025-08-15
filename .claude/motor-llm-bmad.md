Motor LLM + BMAD — Protocolo Operacional (REVISADO)
(para fork reestilizado + Core hospedado + GLM 4.5 via OpenRouter + princípios SRP/SSOT/DRY/KISS/YAGNI obrigatórios)
Base deste documento: revisa e especializa a versão “Motor LLM + BMAD — Protocolo Operacional para o App Builder (Rev. PTBR)”, mantendo a essência (FSM por papéis, artefatos com schemas rígidos, citações, higiene de contexto e sharding) e adicionando camadas de publicação/sigilo, enforcement dos 5 princípios, modelo único mascarado por alias e integração com Core hospedado. 
Guardrails de sigilo (commit/PR + redactor) são referenciados e integrados como publish layer.
Escopo desta revisão
1.	Separação “interno vs. público”: artefatos completos (com citations[] internas, telemetria e metadados) ficam apenas no Core hospedado. O cliente local recebe um envelope público sanitizado (external_sources[] apenas).
2.	Sigilo operacional: proibição de menções a “BMAD”, “Dyad”, provedores/modelos reais em qualquer saída pública; middleware redactor obrigatório antes de publicar respostas/artefatos. 
3.	5 princípios obrigatórios (SRP, SSOT, DRY, KISS, YAGNI) em todas as fases, com Gate de princípios (pode reprovar a fase). 
4.	Modelo único mascarado por alias: política de modelos fixa exposta como alias (motor-seguro-1), mapeando internamente para GLM 4.5 (e opcionalmente GLM 4.5 Air para fases de raciocínio) via OpenRouter (API OpenAI compatible). Nunca expor model_id real ao cliente. OpenRouter+3OpenRouter+3OpenRouter+3

0) Idioma, locale e convenções
•	Idioma: PT BR em todas as saídas, prompts, mensagens de erro e artefatos.
•	Datas: DD/MM/AAAA; numeração pt-BR; moeda BRL quando aplicável. 
________________________________________
1) Metas
•	Converter qualquer pedido livre em pipeline BMAD com alta taxa de sucesso.
•	Operar 100% via artefatos JSON validados por schema, com citações internas.
•	Publicação segura: entregar ao cliente apenas o envelope público sanitizado.
________________________________________
2) Visão geral do fluxo
Intake → IntentCard → ANALYST → PM(PRD) → ARCHITECTURE → UX → PO_REVIEW → SHARDING → DONE
•	Gates por fase: validações de schema, citações internas e gate de princípios.
•	Sharding pós PO go (MDTree).
•	Logs/auditoria: decisões, buscas, versões de doc, telemetria — internos. 
________________________________________
3) Máquina de estados (FSM)
•	Estados: INTENT → ANALYST → PM_PRD → ARCHITECTURE → UX → PO_REVIEW → SHARDING → DONE.
•	Cada estado emite JSON no schema da fase com citations[] (internas) e, quando aplicável, external_sources[] (web). Saída inválida ⇒ autofix guiado.
•	ask_user (≤3 perguntas objetivas) quando necessário. PO_REVIEW pode reprovar e devolver. 

4) Contratos de Tools (Core hospedado)
•	doc.search(query, k?) -> Passage[]
•	doc.get(path, anchor?, sha?) -> { content }
•	citations.validate(citations[]) -> { valid, invalid[]? }
•	ask_user(questions[]) -> answers[] (≤3 por rodada)
•	save_artifact(kind, payload) -> { id, version }
•	clear_context() / start_new_thread(tag)
•	(Opcional) web.search(plan) -> WebEvidence[] (vide política de Web Search, documento separado). 
•	publish.sanitize(artifact, channel) -> { public_artifact }
o	Aplica redactor e remove metadados sensíveis (e.g., citations[] internas, model_id, prompt_version, doc_sha). Obrigatório antes de enviar algo ao cliente. 
•	principles.check(code_tree?) -> PrinciplesReport (opcional)
o	Integra linters/checagens (SonarJS/JSCPD/Madge/ts prune) e resume violações dos 5 princípios para o Gate de princípios. (Pode ser substituído por execução em CI e apenas ingestão do resultado.) 
________________________________________
5) Guardrails (regras hard)
5.1 Sem citação, sem avanço (interno) — cada artefato precisa de citations[] válidas (doc do Core). Para conteúdos normativos externos, seguir a política no documento de Web Search (≥2 fontes), mas sem revelar internals ao cliente. 
5.2 Schemas rígidos por fase (AJV/Zod) com mensagens claras de correção. 
5.3 Ferramentas por papel: ANALYST/PM/ARCHITECT/UX/PO só usam doc.*, ask_user, save_artifact e web.search (quando permitido na política). Sem fs.write/execução. 
5.4 Higiene de contexto: start_new_thread por fase; clear_context() na transição. Sharding pós PO go. 
5.5 Gate de princípios (OBRIGATÓRIO): se violar SRP/SSOT/DRY/KISS/YAGNI, reprova a fase. (Ver §6.11 e §7.)
5A) Publicação & Sigilo
•	Artefatos internos (com citations[] e telemetria) não são enviados ao cliente.
•	Antes de publicar qualquer resposta/artefato, chamar publish.sanitize (usa redactor):
o	Remove/mascara: citations[] internas (bmad://), model_id, prompt_version, doc_sha, nomes internos, provedores/modelos/arquiteturas reais.
o	Bloqueia termos sensíveis (BMAD, Dyad, etc.). Em caso de vazamento, re gerar uma vez e, persistindo, sanitizar; se ainda falhar, retornar texto neutro (política hard block configurável).
o	KPIs: leak_events_total, leak_rate.
o	Saída pública padrão: PublicArtifactEnvelope contendo payload e external_sources[] (somente fontes web/ públicas). 

6) Schemas (JSON)
Nota: a compatibilidade com a versão anterior é preservada. Recomenda-se padronizar citations para CitationObject; strings no formato antigo continuam aceitas durante a transição.
6.0 PublicArtifactEnvelope (superfície pública)
json
Copiar
{
  "$schema": "https://example.com/schemas/public-artifact-envelope.json",
  "type": "object",
  "required": ["kind", "payload"],
  "properties": {
    "kind": { "type": "string", "enum": ["analysis","prd","architecture","ux","po"] },
    "payload": { "type": "object" },
    "external_sources": {
      "type": "array",
      "items": { "$ref": "https://example.com/schemas/external-source.json" },
      "default": []
    }
  }
}
6.1 IntentCard
json
Copiar
{
  "$schema": "https://example.com/schemas/intent-card.json",
  "type": "object",
  "required": ["problem", "solution_type", "core_capabilities", "audience", "region", "uncertainty"],
  "properties": {
    "problem": { "type": "string" },
    "solution_type": { "type": "string", "enum": ["website", "webapp", "hybrid"] },
    "core_capabilities": { "type": "array", "items": { "type": "string" } },
    "audience": { "type": "array", "items": { "type": "string" } },
    "region": { "type": "string", "default": "BR" },
    "constraints": { "type": "object" },
    "security": { "type": "object", "properties": { "lgpd": { "type": "boolean", "default": true } } },
    "uncertainty": { "type": "number", "minimum": 0, "maximum": 1 },
    "needs_input": { "type": "boolean", "default": false },
    "questions": { "type": "array", "items": { "type": "string" }, "maxItems": 3 }
  }
}
6.2 AnalysisSpec
json
Copiar
{
  "$schema": "https://example.com/schemas/analysis-spec.json",
  "type": "object",
  "required": ["problem_statement", "goals", "users", "acceptance_criteria", "risks", "citations"],
  "properties": {
    "needs_input": { "type": "boolean", "default": false },
    "questions": { "type": "array", "items": { "type": "string" }, "maxItems": 3 },
    "problem_statement": { "type": "string" },
    "goals": { "type": "array", "items": { "type": "string" } },
    "users": { "type": "array", "items": { "type": "string" } },
    "acceptance_criteria": { "type": "array", "items": { "type": "string" } },
    "risks": { "type": "array", "items": { "type": "string" } },
    "citations": {
      "oneOf": [
        { "type": "array", "items": { "type": "string", "pattern": "^bmad:\\/\\/[^#]+#[^@]+@[0-9a-f]{7,}$" } },
        { "type": "array", "items": { "$ref": "#/definitions/CitationObject" } }
      ]
    },
    "external_sources": { "type": "array", "items": { "$ref": "#/definitions/ExternalSource" } }
  },
  "definitions": {
    "CitationObject": {
      "type": "object",
      "required": ["path", "anchor", "sha"],
      "properties": {
        "path": { "type": "string" },
        "anchor": { "type": "string" },
        "sha": { "type": "string", "pattern": "^[0-9a-f]{7,}$" },
        "quote": { "type": "string" }
      }
    },
    "ExternalSource": {
      "type": "object",
      "required": ["url"],
      "properties": {
        "url": { "type": "string", "format": "uri" },
        "title": { "type": "string" },
        "publisher": { "type": "string" },
        "published_at": { "type": "string", "format": "date-time" }
      }
    }
  }
}
6.3 PRDSpec (resumo)
json
Copiar
{
  "$schema": "https://example.com/schemas/prd-spec.json",
  "type": "object",
  "required": ["epics", "stories", "acceptance_criteria_map", "nfr", "scope_cuts", "citations"],
  "properties": {
    "epics": { "type": "array", "items": { "type": "string" } },
    "stories": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "as", "i_want", "so_that", "acceptance"],
        "properties": {
          "id": { "type": "string" },
          "as": { "type": "string" },
          "i_want": { "type": "string" },
          "so_that": { "type": "string" },
          "acceptance": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "acceptance_criteria_map": { "type": "object" },
    "nfr": { "type": "array", "items": { "type": "string" } },
    "scope_cuts": { "type": "array", "items": { "type": "string" } },
    "citations": {
      "oneOf": [
        { "type": "array", "items": { "type": "string" } },
        { "type": "array", "items": { "$ref": "#/definitions/CitationObject" } }
      ]
    },
    "external_sources": { "type": "array", "items": { "$ref": "#/definitions/ExternalSource" } }
  }
}
6.4 ArchitectureSpec (resumo)
json
Copiar
{
  "$schema": "https://example.com/schemas/architecture-spec.json",
  "type": "object",
  "required": ["tech_stack", "components", "data_model", "interfaces", "coding_standards", "source_tree", "citations"],
  "properties": {
    "tech_stack": { "type": "object" },
    "components": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "responsibilities", "interfaces"],
        "properties": {
          "name": { "type": "string" },
          "responsibilities": { "type": "array", "items": { "type": "string" } },
          "interfaces": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "data_model": { "type": "array", "items": { "type": "string" } },
    "interfaces": { "type": "array", "items": { "type": "string" } },
    "coding_standards": { "type": "string" },
    "source_tree": { "type": "string" },
    "engineering_principles": {
      "type": "array",
      "items": { "type": "string", "enum": ["SRP", "SSOT", "DRY", "KISS", "YAGNI"] },
      "minItems": 5,
      "uniqueItems": true,
      "description": "Princípios obrigatórios que regem todo o projeto"
    },
    "citations": {
      "oneOf": [
        { "type": "array", "items": { "type": "string" } },
        { "type": "array", "items": { "$ref": "#/definitions/CitationObject" } }
      ]
    },
    "external_sources": { "type": "array", "items": { "$ref": "#/definitions/ExternalSource" } }
  }
}
6.5 UXSpec (resumo)
json
Copiar
{
  "$schema": "https://example.com/schemas/ux-spec.json",
  "type": "object",
  "required": ["user_flows", "screens_outline", "a11y_basics", "citations"],
  "properties": {
    "user_flows": { "type": "array", "items": { "type": "string" } },
    "screens_outline": { "type": "array", "items": { "type": "string" } },
    "ui_copy_notes": { "type": "string" },
    "a11y_basics": { "type": "array", "items": { "type": "string" } },
    "citations": {
      "oneOf": [
        { "type": "array", "items": { "type": "string" } },
        { "type": "array", "items": { "$ref": "#/definitions/CitationObject" } }
      ]
    }
  }
}
6.6 POReview
json
Copiar
{
  "$schema": "https://example.com/schemas/po-review.json",
  "type": "object",
  "required": ["go_no_go", "gaps", "acceptance_refinements", "citations"],
  "properties": {
    "go_no_go": { "type": "string", "enum": ["go", "no_go"] },
    "gaps": { "type": "array", "items": { "type": "string" } },
    "acceptance_refinements": { "type": "array", "items": { "type": "string" } },
    "citations": { "type": "array", "minItems": 1, "items": { "type": "string" } }
  }
}
6.7 ShardingManifest (MDTree)
json
Copiar
{
  "$schema": "https://example.com/schemas/sharding-manifest.json",
  "type": "object",
  "required": ["files", "rules"],
  "properties": {
    "files": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["path", "kind"],
        "properties": {
          "path": { "type": "string" },
          "kind": { "type": "string", "enum": ["analysis", "prd", "architecture", "ux", "po"] },
          "source": { "type": "string" }
        }
      }
    },
    "rules": {
      "type": "object",
      "properties": {
        "dev_load_always": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
6.8 DevStory (para implementação)
json
Copiar
{
  "$schema": "https://example.com/schemas/dev-story.json",
  "type": "object",
  "required": ["story_id", "title", "context_refs", "tasks", "definition_of_done", "test_plan", "citations"],
  "properties": {
    "story_id": { "type": "string" },
    "title": { "type": "string" },
    "context_refs": {
      "type": "object",
      "properties": {
        "analysis_ref": { "type": "string" },
        "prd_ref": { "type": "string" },
        "architecture_ref": { "type": "string" },
        "ux_ref": { "type": "string" }
      }
    },
    "tasks": { "type": "array", "items": { "type": "string" } },
    "acceptance": { "type": "array", "items": { "type": "string" } },
    "test_plan": { "type": "array", "items": { "type": "string" } },
    "files_touched": { "type": "array", "items": { "type": "string" } },
    "risk_notes": { "type": "array", "items": { "type": "string" } },
    "citations": { "type": "array", "minItems": 1, "items": { "type": "string" } },
    "external_sources": { "type": "array", "items": { "$ref": "#/definitions/ExternalSource" } }
  },
  "definitions": {
    "ExternalSource": {
      "type": "object",
      "required": ["url"],
      "properties": {
        "url": { "type": "string", "format": "uri" },
        "title": { "type": "string" },
        "snippet": { "type": "string" },
        "accessed_at": { "type": "string", "format": "date-time" }
      }
    }
  }
}
6.9 QAPlan (o que será verificado)
json
Copiar
{
  "$schema": "https://example.com/schemas/qa-plan.json",
  "type": "object",
  "required": ["scope", "checks", "environments", "citations"],
  "properties": {
    "scope": { "type": "string" },
    "checks": { "type": "array", "items": { "type": "string" } },
    "environments": { "type": "array", "items": { "type": "string" } },
    "a11y": { "type": "array", "items": { "type": "string" } },
    "performance_targets": { "type": "array", "items": { "type": "string" } },
    "security_checks": { "type": "array", "items": { "type": "string" } },
    "citations": { "type": "array", "minItems": 1, "items": { "type": "string" } }
  }
}
6.10 QAReport (resultado da verificação)
json
Copiar
{
  "$schema": "https://example.com/schemas/qa-report.json",
  "type": "object",
  "required": ["result", "failures", "coverage_notes"],
  "properties": {
    "result": { "type": "string", "enum": ["pass", "fail", "needs_changes"] },
    "failures": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "severity", "type", "description"],
        "properties": {
          "id": { "type": "string" },
          "severity": { "type": "string", "enum": ["low", "medium", "high"] },
          "type": { "type": "string" },
          "description": { "type": "string" },
          "reproduction": { "type": "string" },
          "related_files": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "coverage_notes": { "type": "string" },
    "artifacts": { "type": "array", "items": { "type": "string" } },
    "citations": { "type": "array", "items": { "type": "string" } },
    "external_sources": { "type": "array", "items": { "$ref": "#/definitions/ExternalSource" } }
  },
  "definitions": {
    "ExternalSource": {
      "type": "object",
      "required": ["url"],
      "properties": {
        "url": { "type": "string", "format": "uri" },
        "title": { "type": "string" },
        "snippet": { "type": "string" },
        "accessed_at": { "type": "string", "format": "date-time" }
      }
    }
  }
}
6.11 GateResult (resultado dos gates por fase)
json
Copiar
{
  "$schema": "https://example.com/schemas/gate-result.json",
  "type": "object",
  "required": ["state", "passed"],
  "properties": {
    "state": { "type": "string", "enum": ["ANALYST", "PM_PRD", "ARCHITECTURE", "UX", "PO_REVIEW", "SHARDING"] },
    "passed": { "type": "boolean" },
    "principles_ok": { "type": "boolean", "default": true },
    "errors": { "type": "array", "items": { "type": "string" } },
    "warnings": { "type": "array", "items": { "type": "string" } },
    "actions": { "type": "array", "items": { "type": "string" } }
  }
}
6.12 CitationObject (opcional para logs/auditoria)
json
Copiar
{
  "$schema": "https://example.com/schemas/citation.json",
  "type": "object",
  "required": ["path", "anchor", "sha"],
  "properties": {
    "path": { "type": "string" },
    "anchor": { "type": "string" },
    "sha": { "type": "string", "pattern": "^[0-9a-f]{7,}$" },
    "quote": { "type": "string" }
  }
}
6.13 ExternalSource (objeto reutilizável)
json
Copiar
{
  "$schema": "https://example.com/schemas/external-source.json",
  "type": "object",
  "required": ["url"],
  "properties": {
    "url": { "type": "string", "format": "uri" },
    "title": { "type": "string" },
    "snippet": { "type": "string" },
    "accessed_at": { "type": "string", "format": "date-time" }
  }
}
6.14 CoherenceReport (checagens entre artefatos)
json
Copiar
{
  "$schema": "https://example.com/schemas/coherence-report.json",
  "type": "object",
  "required": ["source_state", "target_state", "ok", "issues"],
  "properties": {
    "source_state": { "type": "string" },
    "target_state": { "type": "string" },
    "ok": { "type": "boolean" },
    "issues": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["kind", "message"],
        "properties": {
          "kind": { "type": "string", "enum": ["missing", "conflict", "incomplete", "mismatch"] },
          "message": { "type": "string" },
          "pointer": { "type": "string" }
        }
      }
    }
  }
}



7) System prompts por papel — com “Coding Mandates (OBRIGATÓRIO)”
Em todas as fases (INTENT/ANALYST/PM/ARCH/UX/PO), adicionar no topo do system:
yaml
Copiar
[Coding Mandates — OBRIGATÓRIO]
1) SRP — Single Responsibility: cada função/módulo tem 1 responsabilidade clara.
2) SSOT — Single Source of Truth: dados/config centrais em um único módulo confiável.
3) DRY — Don't Repeat Yourself: proíba duplicação; extraia utilitários.
4) KISS — Keep it Simple, Stupid: prefira soluções diretas; evite complexidade desnecessária.
5) YAGNI — You Aren’t Gonna Need It: não implemente o que não foi validado no PRD.

Regras:
- Toda proposta deve indicar onde os mandatos se materializam (ex.: “SSOT em config/app.ts”).
- Em conflito, priorize SRP e SSOT; em dúvida, reduza escopo (YAGNI).

Sempre iniciar com doc.search e citar 1–3 trechos BMAD; idioma PT BR; saída apenas JSON no schema da fase.
•	ANALYST (system): clarificar problema/objetivos/usuários/aceites; pode fazer até 3 perguntas.
•	PM (system): PRD (MVP first), épicos/histórias, NFRs, cortes (Hindsight 20/20).
•	ARCHITECT (system): stack, componentes, interfaces, data model, standards, source tree.
•	UX (system): user flows, screens outline, a11y.
•	PO (system): revisão de alinhamento; go_no_go e gaps.
________________________________________
8) Política de Perguntas ao Usuário
•	Máx. 3 por rodada, objetivas. Ausência de resposta ⇒ defaults e suposições registradas no PRD.
________________________________________
9) Higiene de contexto e sharding
clear_context() ao finalizar cada fase; start_new_thread(tag) na transição. Após PO go: gerar ShardingManifest + arquivos curtos (MD/JSON). DevLoadAlways: coding standards.md, tech stack.md, source tree.md. 
________________________________________
10) Documentação do Core — Fonte canônica
Snapshot {repo}@{commit_sha} versionado; atualização por job; citação interna: bmad://{path}#{anchor}@{sha7+} (uso apenas interno). 
________________________________________
11) Validações & auditoria (internas)
•	Validação de schema por fase; citations.validate(); coerência entre artefatos (Analysis↔PRD, Arch↔PRD, UX↔Stories).
•	Proveniência (interna): registrar model_id (real), prompt_version, doc_sha, web_evidence_ids.
•	Publicação: remover esses campos e passar pelo redactor antes do envio (KPIs de vazamento).
________________________________________
12) Recuperação de erros
•	AUTO_FIX: reprompt direcionado para cumprir schema+citações.
•	NEEDS_INPUT: perguntar (≤3) e reprocessar; ou seguir com defaults.
•	CORRECT_COURSE (PO/SM): pivotar ou retornar fases. 
________________________________________
13) Métricas de sucesso
•	Taxa de passagem de gates; refações/artefato (alvo ≤ 1,5); tempo até PO go; % artefatos com ≥2 citações internas válidas; satisfação no primeiro preview. 

14) Pseudocódigo do Orquestrador (alto nível)
pseudo
Copiar
onUserPrompt(p):
  card = LLM.intent(p)
  if card.needs_input: answers = ask_user(card.questions)

  analysis = LLM.analyst(card, answers)
  validate(analysis)

  prd = LLM.pm(card, analysis)
  validate(prd, coherence(analysis))

  arch = LLM.architect(card, prd)
  validate(arch, coherence(prd))

  ux = LLM.ux(card, prd, arch)
  validate(ux, coherence(prd))

  po = LLM.po(card, analysis, prd, arch, ux)
  if po.go_no_go == 'no_go': return correct_course()

  manifest = shard(prd, arch, ux)
  save_all_internal()

  public = publish.sanitize({analysis, prd, arch, ux, po, manifest}, "app")
  return { status: 'DONE', artifacts: public }

15) Escala, qualidade e segurança
15.1 SLOs & política de consumo (sem teto de tokens)
•	Sem hard cap de tokens; qualidade priorizada.
•	p95 por fase (sem web): ≤ 6s; com web: ≤ 8s (controlado por SLOs e Loop Guard).
•	Instant Preview: ≤ 3s p95 pós PO (depende de sharding). 
15.1.1 Loop Guard (sem limitar tokens, mas estancando gasto improdutivo)
•	Sinais: gate bounce 3×; repetição ≥ 0,95; citações estagnadas; thrashing de tool; wall time > 120s.
•	Ações: Reprompt direcionado → Ask user → Escalar para PO (no_go).
•	YAML (trecho):
yaml
Copiar
consumption_policy:
  tokens: { hard_cap: null }
  loop_guard:
    max_gate_bounces: 3
    max_autofix_attempts: 1
    max_wall_time_ms: 120000
    similarity_threshold: 0.95
    require_new_citation_on_retry: true
    search_overlap_threshold: 0.8
    trigger_user_questions_on_loop: true
    ask_user_max_questions: 3
    escalate_to_po_on_loop: true
15.2 Operação da FSM
•	Persistência de estado/transições; retries com backoff; DLQ por fase; backpressure por projeto/tenant; correlation id e tracing ponta a ponta. 
15.3 Política de modelos (modelo único + alias) — revisada
•	Exposição pública: apenas alias motor-seguro-1.
•	Mapeamento interno (Core):
o	motor-seguro-1 → z-ai/glm-4.5 (fundação).
o	Opcional por papel (planejamento/raciocínio): z-ai/glm-4.5-air com reasoning.enabled=true.
•	API: usar endpoint OpenAI compatible (OpenRouter normaliza requests/responses ao formato Chat API). Nunca devolver model_id real ao cliente. OpenRouter+3OpenRouter+3OpenRouter+3
YAML (exemplo):
yaml
Copiar
model_policy:
  provider: openrouter          # mascarado no gateway; não expor ao cliente
  model_alias: motor-seguro-1   # único modelo visível
  public_disclosure: false      # nunca expor model_id real
  internal_map:
    motor-seguro-1:
      default: "z-ai/glm-4.5"
      by_role:
        ARCHITECTURE: { model: "z-ai/glm-4.5-air", params: { reasoning: { enabled: true } } }
  telemetry_internal:
    record_model_id: true
    record_prompt_version: true
    record_cost: true
OpenRouter+1
15.4 Governança de prompts & anti injeção
•	Versionar system prompts; gravar prompt_version (interno).
•	Whitelists de tools por papel; ignorar instruções externas que tentem mudar a política.
•	Sanitização de URLs; bloquear domínios não permitidos.
•	Saída JSON obrigatório; filtros de conteúdo. 
15.5 LGPD & privacidade
•	Minimização/retensão por projeto (ex.: 12 meses), exportação/eliminação; criptografia em trânsito/repouso; segredos em cofre; sem logs de dados sensíveis em superfícies públicas. 
15.6 Evals & qualidade contínua
•	Golden sets por vertical (BR); métricas: aderência a schema, coerência, % citações válidas, notas humanas; A/B de prompts/modelos; regressions diárias. 
15.7 Observabilidade & operação
•	Métricas por fase (latência/erro), custo/tokens, uso de web.search, tamanho de saídas; alertas de SLO/custo/DLQ/validações; runbooks para indisponibilidades/timeouts.
•	Sigilo: monitorar leak_events_total e leak_rate; toda superfície pública passa por publish.sanitize.
15.8 Custos & quotas
•	Metering por projeto/tenant/fase; cotas por plano com burst e killswitch; memoization de subtarefas repetidas (ex.: Intent/Analysis por intent_key) por 7 dias. 
________________________________________
16) Apêndice — contratos e exemplos
16.1 publish.sanitize (contrato)
Entrada: { kind, payload, citations?, external_sources?, meta? }
Saída: PublicArtifactEnvelope
Ações:
•	Remove citations[] internas e metadados (model_id, prompt_version, doc_sha).
•	Aplica redactor (banlist + regenerate once + sanitize fallback).
•	Registra métricas de vazamento. 
16.2 Gate de princípios (execução típica)
•	Inputs: PrinciplesReport (ou resultados de linters/estática) + artefato atual.
•	Falhas comuns:
o	SRP: função/arquivo com responsabilidades múltiplas;
o	SSOT: constantes/config duplicadas;
o	DRY: blocos repetidos (detectados por clone detector);
o	KISS: complexidade cognitiva alta;
o	YAGNI: abstrações/dependências sem validação no PRD.
•	Outputs: GateResult.principles_ok=false, errors[] e actions[] com refatorações propostas. 
________________________________________
16.3 Nota sobre integração com o cliente (fork reestilizado)
O cliente local aponta para um único provider (seu Gateway OpenAI compatible) e um único modelo (motor-seguro-1). O Core hospeda a FSM, a política de Web Search e a publicação sanitizada. O cliente não possui prompts/políticas/modelos internos. (OpenRouter mantém compatibilidade com o formato OpenAI Chat API, permitindo esse desenho.) OpenRouter
