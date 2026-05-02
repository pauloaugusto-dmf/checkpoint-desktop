# 🎮 Checkpoint Desktop

O **Checkpoint** é um gerenciador de biblioteca de jogos *local-first* moderno e rápido, focado em entregar a melhor experiência de usuário para acompanhamento de jogos, lançamentos e eventos.

Construído com uma arquitetura moderna e segura utilizando **Electron**, **React** (via Vite), **Tailwind CSS** e **SQLite**.

## ✨ Funcionalidades

- 📚 **Gerenciamento de Biblioteca**: Adicione seus jogos com detalhes como título, plataforma, status (Jogando, Pausado, Backlog, Completado, etc.), nota pessoal, percentual de conclusão e tempo de jogo.
- 📅 **Calendário Interativo**: Acompanhe o lançamento de novos jogos e cadastre eventos importantes (ex: Game Awards, State of Play) em um calendário mensal ou anual embutido.
- 🎨 **Personalização Visual**: Suporte a diversos temas de cores (Violeta, Esmeralda, Rosa, Âmbar, Céu), estilos de ícones (Status, Monocromático, Destaque) e modo claro/escuro.
- 💾 **Segurança de Dados e Backup**: Seus dados ficam armazenados localmente no seu computador via SQLite. O aplicativo possui um sistema de Exportação e Importação de backup via `.json` equipado com *safe-restore* automático em caso de falha.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React (Ícones).
- **Backend (Desktop)**: Electron (Processo Principal e Preload Script com IPC).
- **Banco de Dados**: SQLite3 com Promises (Local-first, salvo na pasta `userData` do OS).

## 🚀 Como Executar o Projeto

### Pré-requisitos
Certifique-se de ter o **Node.js** e o **npm** instalados na sua máquina.

### Instalação
Clone este repositório e instale as dependências:

```bash
git clone <url-do-repositorio>
cd checkpoint-desktop
npm install
```

### Ambiente de Desenvolvimento
Para iniciar o servidor React (Vite) em conjunto com a janela de desenvolvimento do Electron:

```bash
npm run dev
```

## 🏗️ Arquitetura e Segurança

O Checkpoint foi estruturado seguindo rigorosamente as melhores práticas de Engenharia de Software:
1. **Frontend Modular**: UI separada em pequenos componentes na pasta `src/renderer/components`.
2. **Context Isolation**: O Electron roda com `nodeIntegration: false` e `contextIsolation: true`. Toda a comunicação entre o React e o Node.js/Banco de Dados ocorre via eventos seguros IPC definidos no `src/preload/index.js` (ContextBridge).
3. **SQL Injection Prevention**: O sistema utiliza *Prepared Statements* puros em todas as operações de banco de dados (`src/main/sqlite.js`), impedindo injeções maliciosas.

## 📦 Como Empacotar (Build)

*(Nota: Ferramentas de empacotamento como electron-builder estão sendo configuradas para gerar os executáveis `.exe`, `.dmg` e `.AppImage` em atualizações futuras)*

No momento, o comando básico de compilação da interface é:
```bash
npm run build
```
