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

## 📦 Como Empacotar (Build) para Windows

O projeto utiliza o **electron-builder** para compilar o executável e o **node-gyp** para compilar as dependências nativas (como o `sqlite3` em C++). 

### ⚠️ Aviso para usuários de WSL (Linux no Windows)
Não realize o build do projeto diretamente de dentro do WSL. A compilação do `sqlite3` exige compiladores nativos do sistema alvo. Para gerar o `.exe`, **utilize o terminal nativo do Windows** (PowerShell ou CMD).

### Pré-requisitos de Compilação (Windows)
Certifique-se de que o seu ambiente Windows possua:
1. **Node.js** instalado nativamente.
2. **Visual Studio Build Tools**: Durante a instalação (ou modificando no Visual Studio Installer), certifique-se de instalar:
   - *Desenvolvimento para Desktop com C++ (Desktop development with C++)*
   - *Windows 10/11 SDK* (obrigatório para compilar módulos nativos).

### Comandos de Build
Após clonar o repositório em uma pasta nativa do Windows (ex: `C:\Projetos`), execute:
```cmd
npm install
npm run build:win
```
O executável final (`Checkpoint Setup 1.0.0.exe`) será gerado dentro da pasta `release`.

---

## 🛡️ Solução de Problemas: Windows Smart App Control

No Windows 11, o **Controle de Aplicativos Inteligente (Smart App Control)** bloqueia por padrão a execução de instaladores que não possuam um Certificado Digital pago emitido por uma Autoridade Confiável (como a DigiCert).

Se o instalador for bloqueado após o build e você não possuir um certificado, você pode gerar um certificado autoassinado localmente para uso pessoal ou de desenvolvimento, forçando o seu Windows a confiar no seu próprio executável:

**Abra o PowerShell como Administrador e execute:**
```powershell
# 1. Cria um Certificado Digital Local de Desenvolvedor e o injeta nas raízes confiáveis da sua máquina
$cert = New-SelfSignedCertificate -Type Custom -Subject "CN=Checkpoint Developer" -KeyUsage DigitalSignature -FriendlyName "CheckpointCert" -CertStoreLocation "Cert:\CurrentUser\My" -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")

$store = Get-Item "Cert:\LocalMachine\Root"
$store.Open("ReadWrite")
$store.Add($cert)
$store.Close()

# 2. Assina o executável do Checkpoint com o seu novo certificado
Set-AuthenticodeSignature -FilePath ".\release\Checkpoint Setup 1.0.0.exe" -Certificate $cert
```
Após executar esses comandos, o Windows passará a reconhecer o aplicativo como confiável em sua máquina e o bloqueio será removido.
