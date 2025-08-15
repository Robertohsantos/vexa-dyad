Política de Web Search (REVISADA)
(para fork reestilizado + Core hospedado + alias único de modelo; integra sigilo/publicação e reforça SRP/SSOT/DRY/KISS/YAGNI nas sínteses)
Base: esta revisão parte do “Anexo — Política de Web Search (Motor LLM + BMAD) — Revisão PT BR”, especializando para publicação segura (redação/banlist), classes/limiares, tempo adaptativo, cache e auditoria por fase. 
Sigilo: integra o middleware redactor e guardas de PR/commit para impedir vazamento de termos internos (ex.: “BMAD”, “Dyad”, provedores/modelos) em superfícies públicas
Habilita pesquisas web profundas, controladas e auditáveis para complementar os artefatos do BMAD (Analyst → PM/PRD → Architect → UX → PO) sem substituir a doc do BMAD como fonte de verdade.
________________________________________
1) Princípios
•	BMAD soberano: a Web complementa os artefatos (ANALYST → PM/PRD → ARCHITECTURE → UX → PO), sem substituir a documentação interna como fonte de verdade. 
•	3C — Corroborar, Contextualizar, Citar: afirmações normativas/técnicas exigem ≥ 2 evidências confiáveis (ex.: 1 normativa + 1 explicativa). 
•	Zero trust/anti injeção: ignorar instruções de páginas; nunca executar scripts; sanitizar URLs. 
•	Robots/licenças: respeitar robots.txt e diretrizes de busca; não usar “robots” como controle de sigilo; para controle de indexação, use noindex/autenticação. Google for Developers+1MDN Web Docs
•	Acessibilidade e padrões: para UX, priorizar WCAG 2.2 e eMAG (gov BR) como referências. W3C+1Serviços e Informações do Brasil
•	Segurança: considerar OWASP Top 10 como baseline (até a versão 2025 ser publicada, seguir Top 10:2021). OWASP+1
•	Privacidade (BR): respeitar LGPD (Lei 13.709/2018); ao persistir snippets, efetuar redação de PII; retenção com TTL e hard delete. Planalto+1Serviços e Informações do Brasil
________________________________________
2) Onde pesquisar por fase
•	ANALYST: mercado, termos de nicho, requisitos legais (LGPD, acessibilidade), players e padrões.
•	PM/PRD: MVPs de concorrentes, KPIs, jornadas, checklists setoriais.
•	ARCHITECTURE: docs oficiais de APIs/SDKs (pagamentos, mapas, mensageria), normas técnicas, Open Finance quando aplicável (atuar com atos normativos do Bacen). Banco Central do Brasil+1Open Finance Brasil
•	UX: WCAG/eMAG, padrões de conteúdo, exemplos oficiais. W3CServiços e Informações do Brasil
•	PO/SM/DEV/QA: desabilitado por padrão; habilitar sob exceção (normas/a11y/segurança). 
2.1 Query Planner (PT BR → EN fallback)
•	Gera consultas a partir do IntentCard + gaps dos gates. Começa em PT BR com sinônimos setoriais; “cai” para EN apenas se recall for baixo; normaliza termos (ex.: imobiliária/corretora, cupom fiscal/NFC e). Usa hints por vertical (domain packs) e contexto regional (BR/UF). 
ts
Copiar
export function buildQueries(intent: any, gaps: string[]): string[] {
  const q: string[] = []; const push = (s: string) => { if (s && !q.includes(s)) q.push(s); };
  if (intent.market === 'imobiliaria') {
    push('LGPD leads imobiliária Brasil');
    push('WCAG 2.2 eMAG checklist');
    push('schema.org LocalBusiness RealEstateAgent breadcrumbs');
  }
  if (intent.solution_type === 'ecommerce') {
    push('structured data Product Offer AggregateOffer Google');
    push('política devolução LGPD ecommerce Brasil');
  }
  for (const g of gaps) push(`${g} requisitos Brasil`);
  return q.slice(0, 6);
}
________________________________________
3) Catálogo de domínios (prioridade)
1.	normativa (leis/decretos/reguladores: gov.br, Bacen, W3C, IETF, ISO, OWASP),
2.	oficial_vendedor (documentação de APIs/SDKs),
3.	tecnica_terceiros (fundações, WAI/W3C Understanding),
4.	mídia_técnica (portais reconhecidos),
5.	comunidade (Stack Overflow/issues).
Classes & limiares: para conteúdo normativo: exigir 1 normativa + 1 explicativa; confiança mínima por classe (ex.: normativa ≥ 4.5). 
________________________________________
4) Orçamento e limites (tempo adaptativo)
•	1º passe (recall): até 3 queries × top 5. 2º passe (precision): +2 queries × top 3 (se necessário).
•	Tokens de síntese: sem teto global; controlado por SLO de latência e Loop Guard do Motor.
•	Tempo adaptativo por fase para custo/UX previsíveis sem sacrificar qualidade. 
4.1 Tempo por fase (adaptativo)
•	Soft time (alvo): Analyst/PM/Arch 8000 ms; UX 3000 ms.
•	Hard timeout: Analyst/PM/Arch 15000 ms; UX 6000 ms.
•	Extensão (+50%) quando: uncertainty > 0.35, needs_normative = true ou no_cache_hit = true (máx. 1 extensão; nunca ultrapassar hard timeout). 
4.2 Failover multi provedor
•	Provedor A (principal) e B (fallback). Se recall < K ou timeout, tentar 1 fallback e registrar no evidence. 
________________________________________
5) Cache
•	URL cache por categoria: Normas/leis 14d, Docs de API 7d, Notícias/blogs 48h.
•	Snippet cache: hash do trecho (TTL acompanha a URL).
•	Embedding cache: chave URL#hash para rank semântico.
•	Intent cache: por chave semântica (ex.: imobiliaria|website|BR) por 7d.
•	Deduplicação: por (domínio, título, hash); usar URL canônica quando disponível. 
________________________________________
6) Playbooks por tipo de site (resumo)
•	Local business: LGPD (cookies/formulários), WCAG/eMAG, LocalBusiness, mapa/contato, OG/Twitter, sitemap/robots. W3CServiços e Informações do BrasilGoogle for Developers
•	Imobiliária: LGPD leads, filtros/busca, RealEstateAgent + Product/Offer, mapa/listagem. Planalto
•	E commerce: Product+Offer, breadcrumbs, frete/parcelamento, Pix/Boleto, política de devolução.
•	Fintech: consentimento granular, Open Finance BR (normativos Bacen), OWASP. Banco Central do BrasilOWASP
•	Educação: Article/BlogPosting, Event (turmas), email (SPF/DKIM/DMARC), FAQ.
•	Eventos: Event+recorrência, bilheteria, iCal, acessibilidade em mídia.
•	Gov/serviço: eMAG, linguagem simples, AA, transparência, sitemap/robots. Serviços e Informações do Brasil
________________________________________
7) Saídas exigidas nos artefatos
•	Campo external_sources[] com objetos { url, title, publisher, published_at? }.
•	O texto do artefato deve referenciar as fontes (“Fonte: …”).
•	Para normas/leis: duas fontes (1 normativa + 1 explicativa). 
________________________________________
8) Publicação & Sigilo (obrigatório)
•	Armazenamento interno: WebEvidence[] completa (inclui trust, freshness, class, notes, capturedAt, etc.).
•	Publicação: entregar somente campos públicos (url, title, publisher, published_at?, notes?).
•	Redator antes de publicar: redact_before_publish: true + banlist de termos internos ("BMAD","Dyad","OpenRouter","GLM" etc.). Em caso de vazamento, regenerar 1×; persistindo, sanitizar; opcionalmente bloquear. 
•	PII: redação de CPF/CNPJ/telefone/email nos snippets antes de persistir. Base legal: LGPD. Planalto
________________________________________
9) Esqueleto de Política — TypeScript
ts
Copiar
// policy.ts
export type Phase = 'ANALYST'|'PM_PRD'|'ARCHITECTURE'|'UX'|'PO_REVIEW'|'DEV'|'QA';
export type SourceClass = 'normativa'|'oficial_vendedor'|'tecnica_terceiros'|'midia_tecnica'|'comunidade';

export interface WebSearchPhasePolicy {
  allowed: boolean;
  timeBudgetMs: number;      // legado (use softTimeMs/hardTimeoutMs abaixo)
  queriesFirstPass: number;
  kFirst: number;
  queriesSecondPass: number;
  kSecond: number;
  minSources: number;
  minNormative?: number;
  softTimeMs?: number;       // NOVO
  hardTimeoutMs?: number;    // NOVO
  extendOn?: { uncertainty_gt?: number; needs_normative?: boolean; no_cache_hit?: boolean }; // NOVO
  extendPct?: number;        // NOVO (ex.: 50)
  maxExtensions?: number;    // NOVO
}

export interface ClassThresholds {
  minByClass?: Partial<Record<SourceClass, number>>;
  minTrustByClass?: Partial<Record<SourceClass, number>>;
}

export interface RankingWeights { trust: number; freshness: number; semanticFit: number; }

export interface PublicationConfig {                // NOVO
  store_web_evidence: boolean;
  public_fields: ('url'|'title'|'publisher'|'published_at'|'notes')[];
  redact_before_publish: boolean;
  forbid_internal_terms: string[];                  // ["BMAD","Dyad","OpenRouter","GLM",...]
}

export interface WebSearchPolicyConfig {
  enabled: boolean;
  phases: Record<Phase, WebSearchPhasePolicy>;
  rankingWeights: RankingWeights;
  whitelist: string[];
  blacklist: string[];
  freshnessWindowsMonths: { [key: string]: number };
  classThresholds?: ClassThresholds;
  providers?: { primary: string; fallback?: string };
  caching: {
    urlTtlDays: { [category: string]: number };
    enableEtag: boolean;
    embedCache: boolean;
    intentCacheTtlDays: number;
  };
  costs: { maxDailyCurrency: number; maxTokensPerPhase: number };
  outputs: PublicationConfig;                       // NOVO
}
________________________________________
10) Evidências e Ranking (com gate por classe)
ts
Copiar
// evidence.ts
export interface WebEvidence {
  url: string;
  title: string;
  publisher?: string;
  publishedAt?: string;      // ISO
  lastUpdated?: string;      // ISO
  docVersion?: string;       // v4.2 / 2024-11
  capturedAt: string;        // ISO
  snippet: string;           // curto, citação/“trecho”
  quoteBounds?: [number, number];
  sourceClass: SourceClass;
  trustScore: number;        // 0..5 (tabela por domínio)
  freshnessScore: number;    // 0..1 (janela por categoria)
  semanticFit: number;       // 0..1
  license?: string;
  notes?: string;
}

// ranker.ts
export function score(x: WebEvidence, w: RankingWeights) {
  const base = 0.45*x.trustScore + 0.35*x.freshnessScore + 0.20*x.semanticFit;
  const classBonus = x.sourceClass === 'normativa' ? 0.4 : x.sourceClass === 'oficial_vendedor' ? 0.2 : 0;
  const updatedBonus = x.lastUpdated ? 0.05 : 0;
  return base + classBonus + updatedBonus;
}

export function rank(e: WebEvidence[], w: RankingWeights) {
  return [...e].sort((a, b) => score(b, w) - score(a, w));
}

// gate por classe
export function passesClassThresholds(evs: WebEvidence[], cls?: ClassThresholds) {
  if (!cls) return true;
  const byClass: Record<SourceClass, WebEvidence[]> = { normativa:[],oficial_vendedor:[],tecnica_terceiros:[],midia_tecnica:[],comunidade:[] };
  evs.forEach(e => { (byClass[e.sourceClass] ||= []).push(e); });
  if (cls.minByClass) for (const k in cls.minByClass) {
    if ((byClass[k as keyof typeof byClass]?.length || 0) < (cls.minByClass[k as keyof typeof byClass] as number)) return false;
  }
  if (cls.minTrustByClass) for (const k in cls.minTrustByClass) {
    const minT = cls.minTrustByClass[k as keyof typeof byClass] as number;
    if (!byClass[k as keyof typeof byClass]?.some(e => e.trustScore >= minT)) return false;
  }
  return true;
}
________________________________________
11) Cache (impl. mínima)
ts
Copiar
export interface Cache<K, V> { get(key: K): Promise<V|undefined>; set(key: K, value: V, ttlSec: number): Promise<void>; del(key: K): Promise<void>; }
export class MemoryCache<K,V> implements Cache<K,V> {
  private store = new Map<K, { v: V; exp: number }>();
  async get(key: K){const hit=this.store.get(key); if(!hit) return; if(Date.now()>hit.exp){this.store.delete(key); return;} return hit.v;}
  async set(key: K, value: V, ttlSec: number){this.store.set(key,{v:value,exp:Date.now()+ttlSec*1000});}
  async del(key: K){this.store.delete(key);}
}
________________________________________
12) Cliente de busca + Guard (tempo adaptativo, failover, gate por classe)
ts
Copiar
export interface SearchResult { url: string; title: string; snippet: string; publishedAt?: string; domain: string; canonicalUrl?: string }
export interface WebSearchClient {
  search(query: string, limit: number, whitelist?: string[]): Promise<SearchResult[]>;
  fetchSnippet(url: string): Promise<{ snippet: string; etag?: string; lastModified?: string }>;
}

import { WebSearchPolicyConfig, Phase } from './policy';
import { Cache } from './cache';
import { WebEvidence } from './evidence';
import { rank } from './ranker';
import { passesClassThresholds } from './gateByClass';

export interface SearchPlan { key: string; queries: string[]; phase: Phase; intentKey: string; }
export interface SearchContext { uncertainty?: number; needsNormative?: boolean; cacheHit?: boolean; }

function computeDeadlineMs(ph: any, ctx: SearchContext) {
  const soft = ph.softTimeMs ?? ph.timeBudgetMs;
  const hard = ph.hardTimeoutMs ?? Math.round(soft * 1.8);
  const shouldExtend = ((ph.extendOn?.uncertainty_gt && (ctx.uncertainty ?? 0) > ph.extendOn.uncertainty_gt)
    || (ph.extendOn?.needs_normative && !!ctx.needsNormative)
    || (ph.extendOn?.no_cache_hit && (ctx.cacheHit === false)));
  const pct = shouldExtend ? (ph.extendPct ?? 50) : 0;
  const extended = soft + Math.round((soft * pct)/100);
  return Math.min(extended, hard);
}

export async function runSearch(
  plan: SearchPlan,
  clientA: WebSearchClient,
  clientB: WebSearchClient | null,
  cache: Cache<string, WebEvidence[]>,
  cfg: WebSearchPolicyConfig,
  ctx: SearchContext = {}
): Promise<{ status: 'ok'|'insufficient'; evidence?: WebEvidence[] }> {
  const ph = cfg.phases[plan.phase];
  if (!cfg.enabled || !ph.allowed) return { status: 'insufficient' };
  const cached = await cache.get(plan.key); if (cached) return { status: 'ok', evidence: cached };

  const start = Date.now();
  const deadlineMs = computeDeadlineMs(ph, ctx);
  const ev: WebEvidence[] = [];
  const fetchFrom = async (client: WebSearchClient, q: string, k: number) => {
    const r = await client.search(q, k, cfg.whitelist);
    return r.map(x => ({
      url: x.canonicalUrl || x.url, title: x.title, snippet: x.snippet, publisher: x.domain, publishedAt: x.publishedAt,
      capturedAt: new Date().toISOString(), sourceClass: classifyDomain(x.domain),
      trustScore: trustFromDomain(x.domain), freshnessScore: freshnessFromDate(x.publishedAt), semanticFit: 0.8
    } as WebEvidence));
  };

  for (const q of plan.queries.slice(0, ph.queriesFirstPass)) {
    if (Date.now() - start > deadlineMs) break;
    ev.push(...dedupe(await fetchFrom(clientA, q, ph.kFirst)));
  }

  let ranked = rank(ev, cfg.rankingWeights).slice(0, ph.kFirst);
  let enough = ranked.filter(x => x.trustScore >= 3.5).length >= ph.minSources && passesClassThresholds(ranked, cfg.classThresholds);

  if (!enough && clientB) {
    for (const q of plan.queries.slice(0, ph.queriesSecondPass)) {
      if (Date.now() - start > deadlineMs) break;
      ev.push(...dedupe(await fetchFrom(clientB, q, ph.kSecond)));
    }
    ranked = rank(ev, cfg.rankingWeights).slice(0, ph.kFirst + ph.kSecond);
    enough = ranked.filter(x => x.trustScore >= 3.5).length >= ph.minSources && passesClassThresholds(ranked, cfg.classThresholds);
  }

  if (!enough) return { status: 'insufficient' };
  await cache.set(plan.key, ranked, cfg.caching.intentCacheTtlDays * 86400);
  return { status: 'ok', evidence: ranked };
}

function classifyDomain(d: string){ /* mapear domínio→classe */ return 'tecnica_terceiros' as const; }
function trustFromDomain(d: string){ /* tabela/regex */ return 3.5; }
function freshnessFromDate(dt?: string){ /* janela */ return 1; }
function dedupe(list: WebEvidence[]){ return Array.from(new Map(list.map(i => [i.url, i])).values()); }
________________________________________
13) YAML — política (com classes/limiares, failover, tempo adaptativo e publicação)
yaml
Copiar
web_search_policy:
  enabled: true
  providers: { primary: bing, fallback: google }
  phases:
    ANALYST:
      allowed: true
      softTimeMs: 8000
      hardTimeoutMs: 15000
      extendOn: { uncertainty_gt: 0.35, needs_normative: true, no_cache_hit: true }
      extendPct: 50
      maxExtensions: 1
      queriesFirstPass: 3
      kFirst: 5
      queriesSecondPass: 2
      kSecond: 3
      minSources: 2
      minNormative: 1
    PM_PRD:
      allowed: true
      softTimeMs: 8000
      hardTimeoutMs: 15000
      extendOn: { uncertainty_gt: 0.35, needs_normative: true, no_cache_hit: true }
      extendPct: 50
      maxExtensions: 1
      queriesFirstPass: 3
      kFirst: 5
      queriesSecondPass: 2
      kSecond: 3
      minSources: 2
      minNormative: 1
    ARCHITECTURE:
      allowed: true
      softTimeMs: 8000
      hardTimeoutMs: 15000
      extendOn: { uncertainty_gt: 0.35, needs_normative: true, no_cache_hit: true }
      extendPct: 50
      maxExtensions: 1
      queriesFirstPass: 3
      kFirst: 5
      queriesSecondPass: 2
      kSecond: 3
      minSources: 2
      minNormative: 1
    UX:
      allowed: true
      softTimeMs: 3000
      hardTimeoutMs: 6000
      extendOn: { needs_normative: true, no_cache_hit: true }
      extendPct: 50
      maxExtensions: 1
      queriesFirstPass: 2
      kFirst: 5
      queriesSecondPass: 1
      kSecond: 3
      minSources: 1
    PO_REVIEW: { allowed: false }
    DEV:       { allowed: false }
    QA:        { allowed: false }
  rankingWeights: { trust: 0.45, freshness: 0.35, semanticFit: 0.20 }
  classThresholds:
    minByClass: { normativa: 1, oficial_vendedor: 1 }
    minTrustByClass: { normativa: 4.5 }
  freshnessWindowsMonths: { law_norms: 60, api_docs: 24, tech_blogs: 18, news: 12 }
  whitelist: [ ]         # preencher com oficiais/docs/academia/mídia técnica
  blacklist: [ "*-seo.*", "content-farm.*" ]
  caching:
    urlTtlDays: { law_norms: 14, api_docs: 7, news: 2 }
    enableEtag: true
    embedCache: true
    intentCacheTtlDays: 7
  costs: { maxDailyCurrency: 60.0, maxTokensPerPhase: 2500 }
  outputs:
    store_web_evidence: true
    public_fields: ["url","title","publisher","published_at","notes"]
    redact_before_publish: true
    forbid_internal_terms: ["BMAD","Dyad","OpenRouter","GLM"]
________________________________________
14) Prompt templates (resumo por fase)
•	ANALYST — usar web.search com o plano; trazer ≤5 evidências ranqueadas; gerar resumo curto e preencher external_sources[]; se insuficiente, marcar research_insufficient=true e seguir com defaults. Ao sintetizar, aplique SRP/SSOT/DRY/KISS/YAGNI nas recomendações (ex.: evitar requisitos supérfluos, preferir uma única fonte de dados). 
•	PM/PRD — comparar features de mercado, extrair KPIs/benchmarks; citar fontes; justificar cortes (YAGNI) e redução de complexidade (KISS). 
•	ARCHITECTURE — priorizar docs oficiais de APIs/SDKs; listar NFRs/riscos; citar; propor design com SRP/SSOT e evitar duplicação (DRY). 
•	UX — consultar WCAG/eMAG; gerar checklist de a11y; citar ≥1 fonte; preferir padrões simples (KISS). W3CServiços e Informações do Brasil
________________________________________
15) Checklists rápidos (por tipo)
•	Espelham a Seção 6 em formato de checklist para UI. 
________________________________________
16) Observabilidade & métricas (específicas de search)
•	KPIs: avg_trust, %normativas, %duplicadas, evidências/artefato, latência/fase, recall/consulta.
•	Alertas: %normativas < alvo, freshness < alvo, overlap alto entre buscas sequenciais, tempo > budget.
•	Logs: queries, provedor (A/B), evidences salvos (IDs), custos, tempo.
•	Publicação: métricas leak_events_total e leak_rate do redactor.
________________________________________
17) LGPD & retenção
•	Retenção: 12 meses (configurável) por projeto.
•	Exclusão: botão “Excluir dados deste projeto” (hard delete de snippets/metadados).
•	Redação de PII em snippets antes de persistir. Base legal: LGPD. Planalto
________________________________________
18) Domain packs (BR) por vertical
•	imobiliaria_BR, ecommerce_BR, fintech_BR, governo_BR, educacao_BR, com whitelist e exemplos de queries; versionados e auditáveis; promover versão nova via revisão. 
________________________________________
19) Política para imagens e vídeos
•	Imagens: somente guidelines/demos oficiais (design systems, W3C, gov). Proibido copiar UI proprietária.
•	Vídeos: quando oficial/relevante, transcrever (OCR/ASR), citar timestamp; TTL maior p/ conteúdo oficial. 
________________________________________
20) “Insufficient evidence” (mais útil)
•	Explicitar o que faltou (ex.: “norma estadual NFC e em SP”).
•	Propor alternativas (perguntar UF, pedir docs do cliente).
•	Seguir com defaults e flag de risco no artefato. 
________________________________________
21) Harness de testes do search
•	Conjunto de intents sintéticos PT BR por vertical com metas: recall mínimo, presença de fontes normativas, latência máxima.
•	Executar em CI diária; bloquear regressões. 
________________________________________
Referências essenciais (não exaustivas)
•	WCAG 2.2: padrão W3C (Recomendação desde 5 out 2023) e guia de novidades. W3C+1
•	eMAG (gov BR): modelo e documentos oficiais. Serviços e Informações do Brasilemag.governoeletronico.gov.br
•	LGPD (Lei 13.709/2018): textos oficiais e páginas informativas do governo. Planalto+1Serviços e Informações do Brasil
•	OWASP Top 10: 2021 oficial; status do projeto 2025. OWASP+1
•	Robots.txt: guias e especificações (Google/MDN). Google for Developers+1MDN Web Docs+1
•	Open Finance (BR): páginas oficiais (Bacen/Open Finance Brasil). Banco Central do Brasil+1Open Finance Brasil
Este documento substitui a versão anterior da Política de Web Search e deve ser aplicado no Core hospedado, com publicação sanitizada em qualquer superfície voltada ao cliente.
