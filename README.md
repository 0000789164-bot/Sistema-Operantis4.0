# Sistema Operantis 4.0

Sistema de gestão e organização de trabalhos de manutenção, desenvolvido para centralizar equipamentos, ordens de serviço, planejamento, estoque, histórico e indicadores.

## 🌐 Acessar o sistema

**[Abrir o Sistema Operantis 4.0](https://0000789164-bot.github.io/Sistema-Operantis4.0/)**

## 🔐 Credenciais de acesso para teste

> **Atenção:** estas credenciais são de teste/demonstração e estão documentadas publicamente neste README. Não utilize estas senhas em ambiente de produção.

### 🏢 Empresa A — SENAI

- **Usuário:** `SENAIMMP`
- **Senha:** `MAURICIO ROSCOE`

### 🏢 Empresa B — VALE

- **Usuário:** `VALE2026`
- **Senha:** `VALEMINEIRAÇÃO`

### 👑 Administrador

- **Usuário:** `adm2026`
- **Senha:** `amizade`

O administrador pode alternar entre as empresas disponíveis para visualizar e administrar os dados de cada uma.

## 📋 Principais recursos

- Cadastro e acompanhamento de equipamentos
- Criação e acompanhamento de ordens de serviço
- Planejamento e controle de manutenções
- Controle e acompanhamento de peças e estoque
- Histórico de atividades e manutenções
- Identificação de falhas e geração de ações corretivas
- Dashboard para acompanhamento da operação
- Isolamento dos dados por empresa
- Acesso diferenciado para empresas e administrador

## 🏢 Arquitetura multiempresa

O sistema utiliza uma estrutura de dados separada por empresa. Atualmente estão configuradas duas empresas de teste:

```text
SENAI
├── equipamentos
├── ordens de serviço
├── planejamento e controle de manutenção
├── peças & estoque
├── falhas
└── histórico

VALE
├── equipamentos
├── ordens de serviço
├── planejamento e controle de manutenção
├── peças & estoque
├── falhas
└── histórico
```

Os registros de uma empresa não devem ser misturados com os registros da outra. O administrador possui acesso para selecionar a empresa que deseja administrar.

## 🏗️ Tecnologias

- HTML
- CSS
- JavaScript
- Firebase / Firestore
- GitHub Pages

## 🚧 Status

Projeto em desenvolvimento ativo, com autenticação e estrutura multiempresa em implementação/teste.

## 📁 Repositório

[GitHub — Sistema Operantis 4.0](https://github.com/0000789164-bot/Sistema-Operantis4.0)
