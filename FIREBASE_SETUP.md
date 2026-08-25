# Firebase — Sistema-Operantis

A aplicação está configurada para usar o projeto Firebase `sistema-operantis` e o Cloud Firestore.

## 1. Ativar autenticação anônima

No Firebase Console, abra **Authentication → Sign-in method** e habilite **Anonymous**.

O Sistema-Operantis usa autenticação anônima para que as regras do Firestore não precisem deixar o banco aberto publicamente.

## 2. Publicar as regras do Firestore

O arquivo `firestore.rules` já está no repositório. Publique-o no **Firestore → Rules**.

As regras permitem leitura e gravação somente para clientes autenticados.

## 3. Estrutura criada

O sistema usa a coleção `sistema_operantis` com os documentos:

- `equipamentos`
- `ordens_servico`
- `planejamento`
- `estoque`
- `historico`

Cada documento guarda o conjunto de registros da respectiva aba.

## 4. Funcionamento

Ao abrir o sistema, ele autentica o cliente anonimamente, carrega os dados do Firestore e atualiza a interface. Cadastros, novas OS, alterações de planejamento e conclusões são sincronizados novamente com o banco.
