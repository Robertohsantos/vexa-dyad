# Setup do Claude Code — Projeto

Este guia prepara o repositório para uso com **Claude Code**, conectando ao seu **LLM Gateway** e aos subagentes **MCP** (motor/orquestração e política de Web Search).

## Pré‑requisitos
- **Node.js 18+** e `@anthropic-ai/claude-code` instalado globalmente: `npm i -g @anthropic-ai/claude-code`. Veja a visão geral e requisitos.  
- **Memória de projeto** com `CLAUDE.md` na raiz (Claude carrega memórias em hierarquia).  
- **Settings** em `.claude/settings.json` (projeto) e `~/.claude/settings.json` (usuário).  

## Passos
1. Copie esta pasta para sua base de código.
2. Ajuste `.env.example` e exporte as variáveis no seu ambiente/sessão.
3. Revise `.claude/settings.json` (permissões, hooks e env) e confirme que os **hooks** aparecem em `/hooks`.
4. Configure os MCP servers via `.mcp.json` (servidores remotos do seu motor e da web policy).
5. Inicie: `claude` no terminal do projeto.

### Onde ficam memórias e settings
- `./CLAUDE.md` (projeto), `~/.claude/CLAUDE.md` (usuário), e memórias corporativas. Claude lê **CLAUDE.md** automaticamente e respeita a precedência.  
- `settings.json` (usuário, projeto e corporativo) controlam permissões, hooks e variáveis de ambiente.

### Permissões e Hooks
- `permissions.deny`: bloqueia `WebSearch`/`WebFetch` locais e oculta `.env`/`secrets/**` do Claude.  
- `UserPromptSubmit` → `enforce-principles.py`: injeta SRP/SSOT/DRY/KISS/YAGNI a todo prompt e bloqueia tentativas de desativá-las.  
- `PostToolUse` → `post-edit-checks.sh`: roda lint/tests quando houver.

### Gateway de LLM
- O cliente (Claude Code) aponta para **seu gateway** usando `ANTHROPIC_AUTH_TOKEN` e, opcionalmente, cabeçalhos customizados; o roteamento interno mapeia `glm-4.5` → provedor (OpenRouter).

### MCP (subagentes)
- `.mcp.json` publica os servidores remotos: `bmad-core` (motor/orquestração) e `web-policy` (busca). Você pode gerir via `claude mcp list|get|remove`.

### Dicas
- Use `/config` e `claude config set` para ajustar configurações.  
- Use `/memory` e o atalho `#` para editar memórias rapidamente.
