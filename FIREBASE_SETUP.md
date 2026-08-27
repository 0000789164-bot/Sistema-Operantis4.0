# Firebase — Sistema-Operantis 4.0

A aplicação usa o projeto Firebase `sistema-operantis` e o Cloud Firestore.

## 1. Autenticação

No Firebase Console, abra **Authentication → Sign-in method** e habilite **Anonymous**.

O aplicativo autentica o navegador anonimamente antes de acessar o Firestore.

## 2. Regras do Firestore

Publique `firestore.rules` no **Firestore → Rules**.

As regras permitem acesso somente a clientes autenticados e limitam a aplicação ao documento `sistema_operantis/dados`. Exclusão do documento é bloqueada.

> Observação: autenticação anônima identifica a sessão como autenticada, mas não é uma identidade empresarial. Para um ambiente de produção com múltiplos usuários, recomenda-se evoluir para autenticação nominal e regras por usuário/empresa.

## 3. Estrutura atual

A aplicação usa a coleção `sistema_operantis` e o documento `dados`, com os campos:

- `equipamentos`
- `ordens`
- `planejamento`
- `historico`
- `falhasAutomaticas`
- `atualizadoEm`

O módulo `falhas.js` mantém as falhas automáticas no Firestore e também usa `localStorage` como apoio local.

## 4. Falhas automáticas

Quando o campo `hora` de um equipamento atinge ou ultrapassa o campo `limite`, o sistema registra uma falha automática uma única vez para aquela combinação de TAG/horímetro/limite e abre uma OS corretiva automaticamente, evitando duplicação de OS abertas.

As falhas podem ser marcadas como **Resolvidas** pelo painel de histórico.

## 5. Publicação

O workflow de GitHub Pages publica o conteúdo do repositório. O workflow de integração garante que `falhas.js` seja carregado depois do código principal do `index.html`, evitando a falha anterior de integração entre os módulos.
