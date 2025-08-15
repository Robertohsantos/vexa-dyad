# Plano de Implementação - Projeto Vexa Dyad

## 📋 Visão Geral
Implementação de um sistema de desenvolvimento baseado em IA que integra:
- Fork customizado do Dyad (AI app builder)
- Protocolo BMAD (Business Model Analysis & Design)
- Gateway LLM com GLM-4.5 via OpenRouter
- Sistema de sanitização e conformidade LGPD

## 🎯 Objetivo Principal
Criar um ambiente completo de desenvolvimento assistido por IA com pipeline estruturado em fases, validação rigorosa e proteção de informações proprietárias.

---

## ✅ Componentes Já Implementados

### 1. Documentação Base
- [x] CLAUDE.md com princípios obrigatórios (SRP, SSOT, DRY, KISS, YAGNI)
- [x] motor-llm-bmad.md com protocolo operacional completo
- [x] politica-web-search.md com regras de busca externa
- [x] Documentação de segurança (SECURITY.md, DATAFLOW-LGPD.md)
- [x] Configuração de observabilidade (OTEL.md)
- [x] Definition of Done estabelecido

### 2. Código de Exemplo
- [x] Middleware redactor básico (src/middleware/redactor.ts)
- [x] Estrutura de métricas placeholder (src/metrics/metrics.ts)
- [x] Rota de chat exemplo (src/routes/chat.ts)

### 3. Configurações
- [x] commitlint.config.cjs para padronização de commits
- [x] OpenAPI spec do gateway (openapi/llm-gateway.yaml)
- [x] Documentação de setup do Claude Code
- [x] Diretrizes para MCP servers

### 4. Dyad Upstream
- [x] Repositório Dyad completo como submodule
- [x] Aplicação Electron funcional
- [x] Schema de banco de dados SQLite
- [x] Sistema de prompts do Dyad

---

## 🔧 Componentes Pendentes

### 1. Gateway LLM
- [ ] Implementação completa do gateway proxy
- [ ] Autenticação via Bearer token
- [ ] Roteamento para OpenRouter
- [ ] Normalização de requests/responses
- [ ] Suporte a streaming SSE
- [ ] Rate limiting e throttling
- [ ] Circuit breaker para resiliência
- [ ] Logs estruturados

### 2. Sistema BMAD Core
- [ ] FSM (Finite State Machine) para controle de fases
- [ ] Schemas JSON validados (IntentCard, AnalysisSpec, PRDSpec, etc.)
- [ ] Sistema de citações internas
- [ ] Gates de validação entre fases
- [ ] Sistema de sharding pós-PO
- [ ] Persistência de estado
- [ ] Rollback de fases
- [ ] Auditoria de transições

### 3. MCP Servers
- [ ] Server bmad-core (motor/orquestração)
- [ ] Server web-policy (política de busca)
- [ ] Autenticação e autorização
- [ ] APIs REST/SSE
- [ ] Health checks
- [ ] Versionamento de API
- [ ] Rate limiting por tenant

### 4. Sistema de Sanitização
- [ ] Implementação completa do redactor
- [ ] PR guards automáticos
- [ ] Commit hooks de validação
- [ ] Banlist de termos internos
- [ ] Detecção de padrões sensíveis
- [ ] Logs de tentativas de vazamento
- [ ] Dashboard de métricas de segurança

### 5. Integrações
- [ ] Conexão Claude Code → Gateway
- [ ] Gateway → OpenRouter
- [ ] MCP servers remotos
- [ ] Sistema de cache distribuído
- [ ] Message queue para async ops
- [ ] Webhook handlers
- [ ] Event sourcing

### 6. Observabilidade
- [ ] OpenTelemetry setup
- [ ] Métricas por fase
- [ ] Traces distribuídos
- [ ] Dashboards de monitoramento
- [ ] Alertas automatizados
- [ ] Log aggregation
- [ ] Performance profiling

---

## 📅 Fases de Implementação Detalhadas

### Fase 1: Setup Inicial (1-2 dias)
#### Tarefas
- [ ] Criar estrutura de diretórios do projeto
  - [ ] `/gateway` - Servidor do gateway LLM
  - [ ] `/bmad-core` - Motor BMAD e orquestração
  - [ ] `/web-policy` - Servidor de política de busca
  - [ ] `/shared` - Código compartilhado
  - [ ] `/tests` - Testes integrados
- [ ] Configurar ambiente de desenvolvimento
  - [ ] Node.js 20+
  - [ ] TypeScript 5+
  - [ ] ESLint + Prettier
  - [ ] Husky para git hooks
- [ ] Instalar dependências necessárias
  - [ ] Express/Fastify
  - [ ] OpenAI SDK
  - [ ] Drizzle ORM
  - [ ] Zod para validação
  - [ ] Winston para logs
- [ ] Configurar variáveis de ambiente (.env)
  - [ ] OPENROUTER_API_KEY
  - [ ] GATEWAY_PORT
  - [ ] DATABASE_URL
  - [ ] MCP_TOKEN
- [ ] Setup inicial do banco de dados
  - [ ] Migrations iniciais
  - [ ] Seeds de desenvolvimento

### Fase 2: Gateway LLM (3-4 dias)
#### Tarefas
- [ ] Criar servidor Express/Fastify para gateway
  - [ ] Setup básico do servidor
  - [ ] Middleware de CORS
  - [ ] Error handling global
- [ ] Implementar autenticação Bearer
  - [ ] Validação de tokens
  - [ ] Rate limiting por token
  - [ ] Token rotation strategy
- [ ] Configurar proxy para OpenRouter
  - [ ] Cliente HTTP com retry
  - [ ] Timeout handling
  - [ ] Request/response logging
- [ ] Adicionar normalização de payloads
  - [ ] OpenAI → OpenRouter
  - [ ] OpenRouter → OpenAI response
  - [ ] Error normalization
- [ ] Implementar streaming SSE
  - [ ] Stream parser
  - [ ] Backpressure handling
  - [ ] Connection management
- [ ] Testes de integração
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] Load tests

### Fase 3: Sistema BMAD Core (5-7 dias)
#### Tarefas
- [ ] Implementar FSM com estados definidos
  - [ ] State definitions
  - [ ] Transition rules
  - [ ] State persistence
  - [ ] Event emitters
- [ ] Criar validadores de schema (AJV/Zod)
  - [ ] IntentCard schema
  - [ ] AnalysisSpec schema
  - [ ] PRDSpec schema
  - [ ] ArchitectureSpec schema
  - [ ] UXSpec schema
  - [ ] POReview schema
  - [ ] ShardingManifest schema
- [ ] Sistema de citações e evidências
  - [ ] Citation storage
  - [ ] Evidence validation
  - [ ] Reference tracking
- [ ] Gates de princípios
  - [ ] SRP validator
  - [ ] SSOT validator
  - [ ] DRY validator
  - [ ] KISS validator
  - [ ] YAGNI validator
- [ ] Lógica de transição entre fases
  - [ ] Pre-conditions
  - [ ] Post-conditions
  - [ ] Rollback logic
- [ ] Sistema de sharding de artefatos
  - [ ] MDTree generator
  - [ ] File splitter
  - [ ] Reference manager

### Fase 4: MCP Servers (3-4 dias)
#### Tarefas
- [ ] Setup servidor HTTP/SSE para bmad-core
  - [ ] Express server setup
  - [ ] SSE endpoint
  - [ ] WebSocket fallback
- [ ] Setup servidor para web-policy
  - [ ] Search endpoint
  - [ ] Cache management
  - [ ] Result ranking
- [ ] Implementar autenticação MCP
  - [ ] Bearer token validation
  - [ ] JWT implementation
  - [ ] Session management
- [ ] Criar endpoints necessários
  - [ ] /health
  - [ ] /api/v1/process
  - [ ] /api/v1/status
  - [ ] /api/v1/artifacts
- [ ] Documentação das APIs
  - [ ] OpenAPI specs
  - [ ] Postman collection
  - [ ] Usage examples

### Fase 5: Sistema de Sanitização (2-3 dias)
#### Tarefas
- [ ] Expandir middleware redactor
  - [ ] Pattern detection
  - [ ] Context-aware redaction
  - [ ] Whitelist management
- [ ] Configurar hooks pre-commit
  - [ ] Term detection
  - [ ] Auto-correction
  - [ ] Commit blocking
- [ ] Setup PR guards no GitHub
  - [ ] GitHub Actions workflow
  - [ ] PR validation
  - [ ] Auto-comments
- [ ] Testes de vazamento
  - [ ] Penetration tests
  - [ ] Fuzzing
  - [ ] Manual review
- [ ] Métricas de leak_rate
  - [ ] Counter implementation
  - [ ] Dashboard setup
  - [ ] Alerting

### Fase 6: Integrações (3-4 dias)
#### Tarefas
- [ ] Conectar Claude Code ao gateway
  - [ ] Configuration
  - [ ] Authentication
  - [ ] Error handling
- [ ] Testar fluxo completo end-to-end
  - [ ] Happy path
  - [ ] Error scenarios
  - [ ] Performance tests
- [ ] Implementar sistema de cache
  - [ ] Redis setup
  - [ ] Cache strategies
  - [ ] TTL management
- [ ] Configurar retry e fallback
  - [ ] Exponential backoff
  - [ ] Circuit breaker
  - [ ] Fallback responses
- [ ] Documentar configurações
  - [ ] ENV variables
  - [ ] Config files
  - [ ] Deployment guide

### Fase 7: Observabilidade (2-3 dias)
#### Tarefas
- [ ] Setup OpenTelemetry
  - [ ] SDK configuration
  - [ ] Instrumentation
  - [ ] Exporters
- [ ] Configurar exporters
  - [ ] Jaeger for traces
  - [ ] Prometheus for metrics
  - [ ] Loki for logs
- [ ] Criar dashboards básicos
  - [ ] Grafana setup
  - [ ] Key metrics
  - [ ] SLO tracking
- [ ] Alertas e SLOs
  - [ ] Alert rules
  - [ ] PagerDuty integration
  - [ ] Runbooks
- [ ] Documentação de métricas
  - [ ] Metric catalog
  - [ ] Dashboard guide
  - [ ] Troubleshooting

### Fase 8: Testes e Validação (3-4 dias)
#### Tarefas
- [ ] Testes unitários
  - [ ] 80% coverage target
  - [ ] Critical paths
  - [ ] Edge cases
- [ ] Testes de integração
  - [ ] API tests
  - [ ] Database tests
  - [ ] External service mocks
- [ ] Testes E2E
  - [ ] User journeys
  - [ ] Cross-browser
  - [ ] Performance
- [ ] Validação de conformidade LGPD
  - [ ] Data minimization
  - [ ] Consent management
  - [ ] Right to deletion
- [ ] Testes de segurança
  - [ ] OWASP Top 10
  - [ ] Penetration testing
  - [ ] Security scanning

### Fase 9: Documentação e Deploy (2-3 dias)
#### Tarefas
- [ ] Documentação técnica completa
  - [ ] Architecture docs
  - [ ] API reference
  - [ ] Database schema
- [ ] Guias de uso
  - [ ] Getting started
  - [ ] Tutorials
  - [ ] FAQ
- [ ] Scripts de deploy
  - [ ] Docker setup
  - [ ] Kubernetes manifests
  - [ ] Terraform configs
- [ ] CI/CD pipeline
  - [ ] GitHub Actions
  - [ ] Build automation
  - [ ] Deploy automation
- [ ] Release notes
  - [ ] Changelog
  - [ ] Migration guide
  - [ ] Known issues

---

## 🚀 Próximos Passos Imediatos

1. **Setup do ambiente de desenvolvimento**
   - [ ] Clone do repositório
   - [ ] Instalação de dependências
   - [ ] Configuração do IDE
   - [ ] Setup do banco de dados local

2. **Iniciar desenvolvimento do Gateway**
   - [ ] Criar estrutura básica
   - [ ] Implementar autenticação
   - [ ] Testar conexão com OpenRouter

3. **Preparar infraestrutura**
   - [ ] Setup Redis para cache
   - [ ] Configurar PostgreSQL
   - [ ] Docker Compose para desenvolvimento

4. **Estabelecer processo de desenvolvimento**
   - [ ] Branch strategy
   - [ ] Code review process
   - [ ] Testing requirements
   - [ ] Documentation standards

---

## 📊 Métricas de Sucesso

### KPIs Técnicos
- [ ] Latência p95 < 2s por fase
- [ ] Disponibilidade > 99.9%
- [ ] Taxa de erro < 0.1%
- [ ] Coverage de testes > 80%

### KPIs de Negócio
- [ ] Taxa de conclusão de pipeline > 90%
- [ ] Satisfação do usuário > 4.5/5
- [ ] Tempo médio de resposta < 5s
- [ ] Custo por requisição < $0.10

### KPIs de Segurança
- [ ] Zero vazamentos de termos internos
- [ ] 100% de conformidade LGPD
- [ ] Tempo de detecção de incidente < 5min
- [ ] MTTR < 30min

---

## 📅 Cronograma

### Semana 1-2
- Fase 1: Setup Inicial ✓
- Fase 2: Gateway LLM (início)

### Semana 3-4
- Fase 2: Gateway LLM (conclusão) ✓
- Fase 3: Sistema BMAD Core (início)

### Semana 5-6
- Fase 3: Sistema BMAD Core (conclusão) ✓
- Fase 4: MCP Servers ✓
- Fase 5: Sistema de Sanitização ✓

### Semana 7
- Fase 6: Integrações ✓
- Fase 7: Observabilidade ✓

### Semana 8
- Fase 8: Testes e Validação ✓
- Fase 9: Documentação e Deploy ✓
- Go-live preparation

---

## 🔄 Acompanhamento

### Daily Standup Topics
- [ ] Progresso das tarefas atuais
- [ ] Bloqueadores identificados
- [ ] Necessidade de suporte
- [ ] Atualização de estimativas

### Weekly Review
- [ ] Métricas de progresso
- [ ] Qualidade do código
- [ ] Testes executados
- [ ] Documentação atualizada

### Sprint Retrospective
- [ ] O que funcionou bem
- [ ] O que pode melhorar
- [ ] Ações para próxima sprint
- [ ] Atualização do roadmap

---

## 📝 Notas Importantes

1. **Priorização**: Foco inicial no Gateway e BMAD Core como fundação
2. **Segurança**: Sanitização e conformidade são críticos desde o início
3. **Qualidade**: Testes automatizados em todas as fases
4. **Documentação**: Manter atualizada durante o desenvolvimento
5. **Comunicação**: Daily standups e updates semanais

---

## 🆘 Riscos e Mitigações

### Riscos Técnicos
| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Latência alta do OpenRouter | Alto | Médio | Cache agressivo, fallback local |
| Complexidade do FSM | Alto | Alto | Desenvolvimento incremental, testes extensivos |
| Vazamento de dados | Crítico | Baixo | Múltiplas camadas de sanitização |

### Riscos de Projeto
| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Atraso no cronograma | Médio | Médio | Buffer de 20% no tempo estimado |
| Mudança de requisitos | Alto | Médio | Desenvolvimento ágil, sprints curtas |
| Falta de recursos | Alto | Baixo | Plano de contingência, documentação clara |

---

## 📞 Contatos e Recursos

### Time de Desenvolvimento
- **Tech Lead**: [A definir]
- **Backend Dev**: [A definir]
- **DevOps**: [A definir]
- **QA**: [A definir]

### Recursos Externos
- [Documentação OpenRouter](https://openrouter.ai/docs)
- [Dyad Repository](https://github.com/dyad-sh/dyad)
- [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code)

### Ferramentas
- **IDE**: VS Code com extensões TypeScript
- **API Testing**: Postman/Insomnia
- **Monitoring**: Grafana + Prometheus
- **CI/CD**: GitHub Actions

---

**Última atualização**: 2025-08-15
**Status**: 🟡 Em Planejamento
**Próxima revisão**: [A definir]