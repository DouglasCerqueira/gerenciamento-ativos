<h1 align="center">Gerenciamento de Ativos</h1>

<p align="center">
  <strong>Controle de ativos de TI — cadastro, movimentação, compras, atribuições e baixas, com permissões por perfil.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel&logoColor=white" alt="Vercel" />
</p>

Sistema web para controle de inventário de ativos de TI: cadastro de equipamentos, movimentações entre locais, compras, atribuições a colaboradores e baixas, com **acesso por perfil** (Administrador, Gestor, Técnico) e persistência em tempo real via Supabase.

---

## Galeria

<p align="center">
  <img src="/images/dashboard.png" alt="Dashboard" width="88%" />
</p>
<p align="center"><em>Dashboard · totais, ativos por tipo e disponibilidade num só painel</em></p>

<br />

<p align="center">
  <img src="/images/ativos.png" alt="Ativos" width="88%" />
</p>
<p align="center"><em>Ativos · cadastro com disponível, atribuído e status por item</em></p>

<br />

<p align="center">
  <img src="/images/transferencias.png" alt="Transferencias" width="88%" />
</p>
<p align="center"><em>Transferências · histórico de movimentações entre locais</em></p>

<br />

<p align="center">
  <img src="/images/compras.png" alt="Compras" width="88%" />
</p>
<p align="center"><em>Compras · pedidos, fornecedor, custo e status de entrega</em></p>

<br />

<p align="center">
  <img src="/images/atribuicoes.png" alt="Atribuicoes" width="88%" />
</p>
<p align="center"><em>Atribuições · ativos vinculados a colaboradores, com devolução</em></p>

<br />

<p align="center">
  <img src="/images/baixas.png" alt="Baixas" width="88%" />
</p>
<p align="center"><em>Baixas · descarte e outras saídas registradas por motivo</em></p>

<br />

<p align="center">
  <img src="/images/usuarios.png" alt="usuarios" width="88%" />
</p>
<p align="center"><em>Baixas · descarte e outras saídas registradas por motivo</em></p>

<br />

<p align="center">
  <img src="/images/configs.png" alt="Configuracoes" width="88%" />
</p>
<p align="center"><em>Configurações · cadastro de locais e funcionários</em></p>

<br />

---

## O que o sistema faz

| Módulo | Para quê |
|--------|----------|
| **Dashboard** | Visão geral com indicadores do inventário |
| **Ativos** | Cadastro de computadores, roteadores, impressoras e licenças; status em uso, manutenção ou disponível |
| **Transferências** | Movimentação de ativos entre localidades, com histórico |
| **Compras** | Pedidos, fornecedor, custo unitário/total, nota fiscal e status |
| **Atribuições** | Vinculação de ativos a colaboradores, com data de devolução |
| **Baixas** | Descarte, perda, roubo/furto, dano ou obsolescência |
| **Usuários** | Gestão de perfis e permissões (acesso restrito a administradores) |

### Perfis de acesso

| Perfil | Permissões |
|---|---|
| **Administrador** | Acesso completo, incluindo gestão de usuários e configurações |
| **Gestor** | Cria e edita ativos, transferências, compras e baixas |
| **Técnico** | Consulta e criação de atribuições |

---

## Como foi construído

```
Frontend (Vite + React 19 + TypeScript)  →  Supabase (Auth, Postgres)
```

- **React Hook Form + Zod** — formulários e validação por entidade
- **React Router** — roteamento das telas, com bloqueio de rotas por perfil (`RequireRole`)
- **Tailwind CSS** — estilização
- **Recharts** — gráficos do dashboard

---

<p align="center">
  <sub>Gerenciamento de Ativos</sub>
</p>
