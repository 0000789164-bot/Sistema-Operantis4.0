# Sistema Operantis 4.0

Sistema de gestão e organização de trabalhos de manutenção, desenvolvido para centralizar equipamentos, ordens de serviço, planejamento, estoque, histórico e indicadores.

## 🌐 Acessar o sistema

**[Abrir o Sistema Operantis 4.0](https://0000789164-bot.github.io/Sistema-Operantis4.0/)**

## 📋 Principais recursos

- Cadastro e acompanhamento de equipamentos
- Criação e acompanhamento de ordens de serviço
- Planejamento de manutenções
- Controle e acompanhamento de estoque
- Histórico de atividades e manutenções
- Identificação de falhas e geração de ações corretivas
- Dashboard para acompanhamento da operação
- Persistência de dados no navegador

## 🏗️ Tecnologias

- HTML
- CSS
- JavaScript
- Web Storage do navegador
- GitHub Pages

## 🏢 Arquitetura multiempresa

O projeto está evoluindo para uma arquitetura multiempresa, na qual cada empresa terá seus próprios usuários e dados, com isolamento entre clientes.

Estrutura planejada:

```text
empresas/{empresaId}
├── perfil
├── equipamentos/{equipamentoId}
├── ordens/{ordemId}
├── planejamento/{planejamentoId}
├── estoque/{itemId}
├── historico/{registroId}
└── falhas/{falhaId}
```

## 🚧 Status

Projeto em desenvolvimento ativo. A próxima etapa é consolidar autenticação e isolamento por empresa sem depender de um serviço externo de banco.

## 📁 Repositório

[GitHub — Sistema Operantis 4.0](https://github.com/0000789164-bot/Sistema-Operantis4.0)
