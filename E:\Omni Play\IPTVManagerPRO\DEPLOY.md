# Como Publicar Sua Aplicação na Vercel (Grátis)

Este guia mostra os passos para publicar (fazer o deploy) da sua aplicação na internet usando a **Vercel**. Este método é **100% gratuito** para projetos pessoais e não exige cartão de crédito. Uma vez publicado, seu projeto terá um link público e poderá ser acessado de qualquer lugar.

## Pré-requisitos

1.  **Conta no GitHub:** Você precisará de uma conta no [GitHub](https://github.com) para armazenar seu código.
2.  **Conta na Vercel:** Crie uma conta gratuita na [Vercel](https://vercel.com/signup) usando sua conta do GitHub.

---

## Passo a Passo para o Deploy

### Passo 1: Enviar seu código para o GitHub

Se seu código ainda não está em um repositório do GitHub, siga estes passos. Se já estiver, pule para o Passo 2.

1.  **Crie um novo repositório no GitHub:**
    *   Vá para o [GitHub](https://github.com/new) e crie um novo repositório. Pode ser público ou privado. Não adicione `README` ou `.gitignore`, pois seu projeto já os possui.

2.  **Conecte sua pasta local ao repositório do GitHub:**
    *   No seu terminal, dentro da pasta `E:\Omni Play\IPTVManagerPRO`, execute os seguintes comandos, **substituindo `SEU-USUARIO` e `NOME-DO-REPOSITORIO`** com os seus dados do GitHub:

    ```bash
    git init
    git add .
    git commit -m "Primeiro commit"
    git branch -M main
    git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git
    git push -u origin main
    ```

### Passo 2: Fazer o Deploy na Vercel

1.  **Acesse seu Dashboard da Vercel:**
    *   Faça login na [Vercel](https://vercel.com/dashboard).

2.  **Importe seu Projeto:**
    *   Clique em **"Add New... > Project"**.
    *   Na seção **"Import Git Repository"**, encontre o repositório que você acabou de criar/atualizar e clique em **"Import"**.

3.  **Configure e Publique:**
    *   A Vercel irá detectar automaticamente que é um projeto Next.js. Você **não precisa** configurar nada.
    *   Apenas clique no botão **"Deploy"**.

A Vercel irá construir e publicar sua aplicação. Ao final, ela mostrará a URL pública do seu projeto. Exemplo: `https://seu-projeto.vercel.app`

Pronto! Sua aplicação está online, de graça.

---
**IMPORTANTE:**
*   A partir de agora, qualquer `git push` que você fizer para a branch `main` no GitHub irá automaticamente gerar um novo deploy na Vercel.
*   Você não precisa mais usar os comandos `firebase` para este projeto.
