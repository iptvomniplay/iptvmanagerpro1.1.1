# Como Publicar Sua Aplicação na Nuvem

Este guia mostra os passos para publicar (fazer o deploy) da sua aplicação na internet usando o Firebase App Hosting. Uma vez publicado, seu projeto terá um link público e poderá ser acessado de qualquer lugar.

## Pré-requisitos

Antes de começar, você precisa ter duas coisas instaladas no seu computador:

1.  **Node.js:** Essencial para rodar o ambiente de desenvolvimento e as ferramentas. Se não tiver, baixe e instale a partir do [site oficial do Node.js](https://nodejs.org/).
2.  **Firebase CLI:** A ferramenta de linha de comando do Firebase para gerenciar e publicar seus projetos.

---

## Passo a Passo para o Deploy

Siga estes 3 passos no terminal (prompt de comando) do seu computador.

### Passo 1: Instalar o Firebase CLI

Se você nunca instalou a ferramenta antes, execute o seguinte comando. (Se já tiver, pode pular este passo).

```bash
npm install -g firebase-tools
```
Este comando instala a ferramenta globalmente no seu sistema.

### Passo 2: Fazer Login na sua Conta Google

Agora, conecte a ferramenta à sua conta do Firebase.

```bash
firebase login
```
Este comando abrirá uma janela no seu navegador para que você possa fazer login com segurança na sua conta Google.

### Passo 3: Publicar a Aplicação

Este é o comando final que envia sua aplicação para a nuvem.

Primeiro, navegue no seu terminal até a pasta raiz do seu projeto (a pasta que contém arquivos como `package.json` e `apphosting.yaml`).

Depois, execute o comando:

```bash
firebase deploy
```

O terminal mostrará o progresso. Ao final, ele exibirá a **URL de Hospedagem (Hosting URL)**. Este é o link público da sua aplicação!

Exemplo: `https://seu-projeto-12345.web.app`

Pronto! Sua aplicação está online.
