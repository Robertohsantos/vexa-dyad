# Troubleshooting - Claude Code no Projeto Vexa

## Erro: Hook PreToolUse com "not found"

### Sintoma
```
● PreToolUse:Bash [$CLAUDE_PROJECT_DIR/.claude/hooks/pre-tool-use.py] failed with non-blocking status code 127:
  /bin/sh: 1: /home/roberto/Vexa: not found
```

### Causa
- O caminho do projeto contém espaços ("Vexa Dyad")
- A variável `$CLAUDE_PROJECT_DIR` não é expandida corretamente
- Configurações são carregadas na memória ao iniciar o Claude

### Solução

#### 1. Correção Permanente
Editar `.claude/settings.json` para usar caminhos absolutos:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"/home/roberto/Vexa Dyad/.claude/hooks/pre-tool-use.py\"",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

#### 2. Aplicar a Correção
**IMPORTANTE**: Após modificar settings.json, você DEVE reiniciar o Claude Code:
```bash
# Sair do Claude (Ctrl+C)
# Reiniciar
cd "/home/roberto/Vexa Dyad"
claude
```

#### 3. Workarounds Temporários (se não puder reiniciar)
- **Opção A**: Renomear temporariamente o settings.json
  ```bash
  mv .claude/settings.json .claude/settings.json.bak
  ```
  
- **Opção B**: Criar link simbólico
  ```bash
  sudo ln -s "/home/roberto/Vexa Dyad" /home/roberto/Vexa
  ```

### Prevenção
- Sempre reinicie o Claude após modificar arquivos em `.claude/`
- Evite usar variáveis de ambiente em comandos de hooks
- Use caminhos absolutos quando o projeto tiver espaços no nome

## Outros Problemas Comuns

### Hooks Duplicados
- **Problema**: Hooks definidos em `settings.json` e `settings.local.json`
- **Solução**: Manter hooks apenas em `settings.json`, usar `settings.local.json` apenas para permissões

### Permissões Negadas
- **Problema**: Hook não tem permissão para executar
- **Solução**: 
  ```bash
  chmod +x .claude/hooks/*.py
  ```

## Referências
- Documentação oficial: https://docs.anthropic.com/en/docs/claude-code/settings
- Configuração de hooks: https://docs.anthropic.com/en/docs/claude-code/hooks