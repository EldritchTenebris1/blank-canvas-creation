## Visão geral

Vamos resolver 4 frentes. Os itens 1 e 2 são correções; 3 e 4 são novas funcionalidades.

---

### 1. Venda não baixa a quantidade da pista (bug real)

**Causa:** a tabela `products` só tem política de edição para **admin**. Quando o frentista finaliza a venda, o `UPDATE` em `pista_qty` é bloqueado silenciosamente pela segurança (0 linhas afetadas) — por isso a quantidade nunca diminui, mesmo a venda sendo registrada.

**Correção:** criar uma função de banco `register_sale` (SECURITY DEFINER) que, de forma atômica e para o usuário logado:
- valida estoque disponível na pista;
- diminui `pista_qty`;
- insere o registro em `movements` (tipo `venda`).

Ajustar `operador.tsx` para chamar essa função em vez de fazer `update` + `insert` direto. Isso também garante que não exista venda registrada sem baixa de estoque.

---

### 2. Excel/CSV: vendas aparecem "do sistema", sem frentista

Hoje o relatório não identifica quem vendeu. Vamos:
- enriquecer a consulta de movimentações com o nome do frentista (via `employees`/`profiles` por `user_id`);
- adicionar a coluna **Frentista** nas tabelas do relatório e em **todas as abas** do Excel e no CSV;
- adicionar uma aba/seção **"Vendas por Frentista"** (total de unidades, faturamento e lucro por pessoa).

---

### 3. Ordem personalizada de produtos

- Adicionar coluna `sort_order` em `products`.
- Na tela **Produtos** (admin), permitir reordenar (botões mover ↑/↓ ou arrastar) e salvar a ordem.
- Aplicar `ORDER BY sort_order` em **Pista, Estoque, Operador e Produtos**, para que a ordem definida pelo admin (Funil → Galão → etc.) valha em todo o sistema.

---

### 4. Módulo de Turno + Troco de Caixa + Conferência

Novo fluxo de passagem de turno.

**Novas tabelas:**
- `shifts`: turno (manhã/tarde/noite), `responsible_user_id`, `conferente_user_id`, `cash_opening` (troco inicial), `cash_closing`, status (`aberto` / `conferido` / `fechado`), datas e observações.
- `shift_counts`: por turno e produto — `counted_qty` (contado), `system_qty` (sistema no momento), `verified` (conferido).

**Fluxo:**
1. **Abrir turno (responsável):** o frentista (ex.: João) marca-se como responsável, escolhe o turno, informa o **troco do caixa** e faz a **conferência dos produtos na pista** (conta cada item).
2. **Conferência (próximo turno):** ao entrar, outro frentista (ex.: Eduardo) escolhe a opção **Conferente**. Ele revisa o que João contou (lista lado a lado: contado × sistema). Se estiver tudo certo, **confirma** — passando a ser o novo responsável **sem recontar tudo**.
3. **Relatório:** o turno do João consta como **conferido por Eduardo**, registrando a passagem de turno.

**Onde fica:** nova página **"Turnos / Conferência"** no menu do operador e uma visão no admin (lista de turnos, divergências de contagem e troco). Divergências entre contado e sistema ficam destacadas.

---

## Detalhes técnicos

- Migração 1: função `register_sale(jsonb)` + grant `authenticated`.
- Migração 2: `ALTER TABLE products ADD COLUMN sort_order int`; backfill por nome.
- Migração 3: tabelas `shifts` e `shift_counts` com GRANTs + RLS (frentista vê/edita turnos próprios e abertos; admin vê tudo) + trigger `updated_at`.
- `use-products.ts`: ordenar por `sort_order, name`.
- Novo hook `use-shifts.ts` e nova rota `src/routes/operador` (ou aba) para o fluxo de turno.
- Relatório: novo agrupamento por frentista no Excel/CSV.

## Ordem de execução

1. Bug da pista (migração `register_sale` + ajuste no operador) — maior impacto.
2. Atribuição de frentista no relatório/Excel/CSV.
3. Ordem personalizada de produtos.
4. Módulo de turno/conferência (maior parte do trabalho).

Posso começar pelo item 1 assim que aprovar. Se quiser ajustar o fluxo de conferência (ex.: turnos fixos, quem pode ser conferente), me diga.