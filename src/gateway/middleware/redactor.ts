// src/gateway/middleware/redactor.ts
export type RegenerateFn = (opts: { original: string; instruction: string }) => Promise<string>;

const BANNED_REGEX = /(?:^|[^a-zA-Z])(BMAD|bmad-?method|bmad-?code-?org|team[-_ ]?fullstack\.ya?ml|orchestrator\s*BMAD)(?:$|[^a-zA-Z])/i;
const BANNED_NORMALIZED = ['bmad','bmadmethod','bmadcodeorg','teamfullstackyaml','orchestratorbmad'];

export function normalizeForScan(s: string) {
  return (s||'').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
}

export function hasLeak(text: string) {
  if (!text) return false;
  if (BANNED_REGEX.test(text)) return true;
  const n = normalizeForScan(text);
  return BANNED_NORMALIZED.some(key => n.includes(key));
}

export function sanitize(text: string) {
  if (!text) return text;
  return text
    .replace(/BMAD/gi, 'fluxo proprietário')
    .replace(/bmad-?method/gi, 'fluxo proprietário')
    .replace(/bmad-?code-?org/gi, 'repositório interno')
    .replace(/team[-_ ]?fullstack\.ya?ml/gi, 'arquivo de time')
    .replace(/orchestrator\s*BMAD/gi, 'maestro do fluxo');
}

export async function guardPublicText(
  text: string,
  regenerate?: RegenerateFn,
  opts: { maxRetries?: number; hardBlock?: boolean } = {}
): Promise<{ text: string; redacted: boolean; retries: number; blocked: boolean }>{

  const maxRetries = opts.maxRetries ?? 1;
  const hardBlock = opts.hardBlock ?? false;

  if (!hasLeak(text)) return { text, redacted: false, retries: 0, blocked: false };

  let retries = 0;
  if (regenerate) {
    const instr = 'Reescreva sem mencionar termos internos (BMAD, repositórios ou arquivos internos). Use apenas rótulos públicos como "fluxo proprietário".';
    const regenerated = await regenerate({ original: text, instruction: instr });
    retries++;
    if (!hasLeak(regenerated)) return { text: regenerated, redacted: false, retries, blocked: false };
  }

  const safe = sanitize(text);
  if (!hasLeak(safe)) return { text: safe, redacted: true, retries, blocked: false };

  return { text: '[conteúdo retido por política de sigilo]', redacted: true, retries: blocked ? 1 : 0, blocked: hardBlock };
}
