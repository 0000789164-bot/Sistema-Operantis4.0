# Arquitetura multiempresa

## Objetivo

Cada empresa terá usuários e dados isolados. O frontend nunca deve usar um documento global compartilhado para dados operacionais.

## Estrutura Firestore

```text
empresas/{empresaId}
  perfil
  usuarios/{uid}
  equipamentos/{equipamentoId}
  ordens/{ordemId}
  planejamento/{planejamentoId}
  estoque/{itemId}
  historico/{registroId}
  falhas/{falhaId}
```

## Identidade

O `empresaId` deve vir do perfil autenticado do usuário. Não deve ser informado livremente pelo cliente para decidir qual empresa acessar.

## Login

O fluxo previsto é:

1. Usuário informa e-mail e senha.
2. Firebase Authentication autentica o usuário.
3. O sistema busca `usuarios/{uid}`.
4. O perfil contém `empresaId` e `role`.
5. Todas as consultas usam esse `empresaId`.
6. As regras do Firestore validam o vínculo entre UID e empresa.

Papéis previstos: `admin`, `gestor` e `tecnico`.

## Observação

A implementação do login e das regras depende da configuração do Firebase que está sendo feita em paralelo. Esta branch prepara a organização do projeto sem sobrescrever essa configuração.
