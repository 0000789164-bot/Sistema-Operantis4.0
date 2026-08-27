# Arquitetura multiempresa — Sistema Operantis 4.0

## Objetivo
Cada empresa deve possuir dados isolados no Firestore.

## Estrutura recomendada

```
empresas/{empresaId}
  ├── perfil
  ├── equipamentos/{equipamentoId}
  ├── ordens/{ordemId}
  ├── planejamento/{planejamentoId}
  ├── estoque/{itemId}
  ├── historico/{registroId}
  └── falhas/{falhaId}
```

## Camada de dados
Use sempre `empresaId` obtido da autenticação/cadastro para construir os caminhos. Nunca use um documento global compartilhado como `sistema_operantis/dados`.

## Migração
Os dados legados do documento global podem ser migrados uma única vez para uma empresa escolhida pelo administrador. A migração deve ocorrer no servidor ou por uma rotina administrativa autenticada para evitar cópias acidentais.

## Observação
Este arquivo prepara a especificação da separação. A implementação final no `index.html` e nas regras do Firestore deve ser feita em conjunto com a solução de autenticação/Firebase para que `empresaId` seja confiável.
