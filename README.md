# Zenko · Painel de Publicação

Ferramenta interna da Zenko para agendar e publicar em Instagram, TikTok e Facebook.
**Fase 1 — frontend acessível.**

- **Next.js 16.2.10** (App Router, Turbopack)
- **JavaScript puro** — sem TypeScript
- **CSS puro** — sem Tailwind, sem biblioteca de componentes
- **React Compiler** ativo (recurso estável do Next 16)
- **next/font/local** — fontes hospedadas no próprio app, sem depender do Google
- Meta de acessibilidade: **WCAG 2.2 nível AA**

---

## Como rodar

Requisito: **Node.js 20 ou superior** (o Next.js 16 não roda em versões antigas).

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>.

Para gerar a versão de produção:

```bash
npm run build
npm start
```

---

## Estrutura

```
app/
  layout.js            Layout raiz: fontes, metadados, casca do painel
  globals.css          Todo o CSS (tokens da marca + componentes)
  fonts/               Fontes em WOFF2, servidas pelo próprio app (188 KB)
  icon.svg             Favicon (marca Z)
  page.js              /               → Dashboard
  agendar/page.js      /agendar        → Agendar post
  carrossel/page.js    /carrossel      → Carrossel em massa
  calendario/page.js   /calendario     → Calendário
  contas/page.js       /contas         → Contas sociais
  logs/page.js         /logs           → Logs
  configuracoes/page.js /configuracoes → Perfil, Equipe, Notificações, Segurança
  not-found.js         404

components/
  AppShell.js          Barra lateral, topo, menu no celular, foco na troca de rota
  ToastProvider.js     Avisos (com região aria-live)
  Icons.js             Ícones em SVG
  views/               As 7 telas
```

Cada rota é uma página do App Router, com seu próprio `<title>`. As telas que têm
interação são Client Components (`'use client'`); as páginas em si são Server
Components, que é onde ficam os metadados.

---

## O que já funciona e o que ainda não

**Funciona:** navegação entre as 7 telas, formulário de agendamento com validação,
seleção de contas, contador de legenda, upload (arrastar ou escolher), calendário
navegável por mês, abas de configurações, papéis da equipe, avisos.

**Ainda não (Fase 2):** nada é salvo nem publicado de verdade. As ações mostram um
aviso de simulação. Os dados (contas, membros, logs) são exemplos escritos no código.

Os pontos onde o back-end vai entrar estão marcados com comentários `Fase 2:` no código.

---

## Próximos passos

1. **Fase 2** — back-end, banco de dados e login com papéis e permissões
2. **Fase 3** — integração com as APIs da Meta e do TikTok + agendador
3. **Fase 4** — logs em tempo real, testes e deploy

Em paralelo, a Zenko precisa verificar o app na **Meta** e no **TikTok** e passar pela
revisão deles: é isso que libera a permissão de publicar de verdade.

---

## Acessibilidade

O que já está garantido no código:

- HTML semântico e um só `<h1>` por tela
- Link "pular para o conteúdo"
- Foco visível em tudo e navegação 100% por teclado
  (inclui setas ←/→ nas abas e Esc para fechar o menu)
- O foco vai para o conteúdo a cada troca de rota
- Contraste conferido para o nível AA
- Status nunca comunicado só por cor — sempre com texto junto
- Tabelas com cabeçalhos (`<th scope>`) e legenda
- Avisos anunciados por leitores de tela (`aria-live`)
- `prefers-reduced-motion` respeitado
- Layout responsivo, funciona com zoom de 200%

**Faltando para a meta completa:** o widget do **VLibras** e a página de
**Declaração de Acessibilidade** — ambos entram junto com a Fase 2.

---

## Fontes

Carregadas com **`next/font/local`** a partir de `app/fonts` — nada vem do Google Fonts.

| Fonte | Uso | Peso |
|---|---|---|
| Bricolage Grotesque | Títulos | 99 KB (variável, eixos `opsz` + `wght`) |
| Chivo | Corpo do texto | 42 KB (variável) |
| IBM Plex Mono | Etiquetas e dados | 40 KB (pesos 500 e 600) |

Os arquivos vieram do repositório oficial do Google Fonts, foram convertidos para WOFF2
e reduzidos ao alfabeto latino — com **todos os acentos do português conferidos**.

Por que local e não `next/font/google`:

- o navegador não fala com nenhum servidor de terceiros;
- o Next injeta o `@font-face` e o `preload` sozinho, então o texto não "pula" ao carregar;
- o build funciona **offline**, em Docker e em CI, sem depender da rede.

---

## React Compiler

Ligado em `next.config.mjs` (`reactCompiler: true`), com o `babel-plugin-react-compiler`
como dependência de desenvolvimento. Ele memoriza os componentes automaticamente —
menos re-renderização, sem `useMemo`/`useCallback` na mão.

O custo é o build ficar mais lento (de ~8s para ~18s neste projeto), porque o
compilador roda em cima do Babel. Se algum dia isso atrapalhar, basta remover a
linha `reactCompiler: true`.
