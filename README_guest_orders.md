
# Guest Orders (Enviar para Produção sem login)

Este patch permite que usuários **não logados** enviem o pedido para produção após informar **Nome** e **WhatsApp**.

## O que foi adicionado
- **Dialog** no `PreviewArea.tsx` para coletar nome e WhatsApp quando não há sessão.
- **Edge Function** `submit-bombom` que insere no banco usando a `SERVICE_ROLE` (seguro via backend).
- **Migration** que:
  - Torna `user_id` opcional na tabela `public.bombons`.
  - Adiciona `guest_nome` e `guest_telefone`.
  - Garante que exista `user_id` **ou** os dois campos de convidado.

## Como aplicar

### 1) Rodar a migration
No projeto Supabase local ou no CI:

```bash
supabase db push
# ou, se preferir, aplique apenas este arquivo:
# supabase db reset && supabase db push
```

### 2) Deploy da Edge Function
```bash
cd supabase/functions/submit-bombom
supabase functions deploy submit-bombom --project-ref <SEU_PROJECT_REF>
# Garanta que as variáveis estejam definidas no projeto:
# SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
```

### 3) Permissões / RLS
- A função utiliza `SUPABASE_SERVICE_ROLE_KEY`, então a política existente
  `Service role can manage bombons` já é suficiente.
- **Não é necessário** permitir inserts anônimos diretamente no cliente.

### 4) Frontend
- O botão **Enviar para Produção** agora habilita para todos (desde que já exista imagem gerada).
- Sem login: abre o diálogo, valida dados, chama a função.
- Com login: envia direto para a função com `user_id`.

---

> Dica: se usa Vercel, adicione `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_URL` como variáveis de ambiente do projeto para executar funções com segurança.
