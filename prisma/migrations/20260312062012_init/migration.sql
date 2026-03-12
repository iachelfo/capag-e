-- CreateTable
CREATE TABLE "contribuintes" (
    "id" SERIAL NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "tipo" TEXT NOT NULL,
    "regime_tributario" TEXT,
    "atividade_principal" TEXT,
    "cnae" TEXT,
    "endereco" TEXT,
    "municipio" TEXT,
    "uf" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contribuintes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laudos" (
    "id" SERIAL NOT NULL,
    "contribuinte_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "classificacao_capag" TEXT,
    "valor_capag_e" DOUBLE PRECISION,
    "metodologia" TEXT,
    "resultado_operacional_ajustado" DOUBLE PRECISION,
    "patrimonio_liquido_realizavel" DOUBLE PRECISION,
    "bens_essenciais" DOUBLE PRECISION,
    "caixa_liquido_operacional" DOUBLE PRECISION,
    "parecer_tecnico" TEXT,
    "recomendacoes" TEXT,
    "conclusao" TEXT,
    "conclusao_texto" TEXT,
    "limitacoes" TEXT,
    "valor_divida" DOUBLE PRECISION,
    "processo_admin" TEXT,
    "data_emissao" TIMESTAMP(3),
    "exercicio_inicio" INTEGER,
    "exercicio_fim" INTEGER,
    "usuario_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laudos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" SERIAL NOT NULL,
    "laudo_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "caminho_arquivo" TEXT NOT NULL,
    "tamanho_bytes" INTEGER,
    "mime_type" TEXT,
    "status_upload" TEXT NOT NULL DEFAULT 'concluido',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balancos_patrimoniais" (
    "id" SERIAL NOT NULL,
    "laudo_id" INTEGER NOT NULL,
    "exercicio" INTEGER NOT NULL,
    "ativo_circulante" DOUBLE PRECISION NOT NULL,
    "ativo_nao_circulante" DOUBLE PRECISION NOT NULL,
    "ativo_total" DOUBLE PRECISION NOT NULL,
    "passivo_circulante" DOUBLE PRECISION NOT NULL,
    "passivo_nao_circulante" DOUBLE PRECISION NOT NULL,
    "passivo_total" DOUBLE PRECISION NOT NULL,
    "patrimonio_liquido" DOUBLE PRECISION NOT NULL,
    "caixa_equivalentes" DOUBLE PRECISION,
    "estoques" DOUBLE PRECISION,
    "contas_receber" DOUBLE PRECISION,
    "imobilizado" DOUBLE PRECISION,
    "intangivel" DOUBLE PRECISION,
    "contas_pagar" DOUBLE PRECISION,
    "emprestimos" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balancos_patrimoniais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dres" (
    "id" SERIAL NOT NULL,
    "laudo_id" INTEGER NOT NULL,
    "exercicio" INTEGER NOT NULL,
    "receita_bruta" DOUBLE PRECISION NOT NULL,
    "deducoes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receita_liquida" DOUBLE PRECISION NOT NULL,
    "custos_mercadorias" DOUBLE PRECISION NOT NULL,
    "lucro_bruto" DOUBLE PRECISION NOT NULL,
    "despesas_operacionais" DOUBLE PRECISION NOT NULL,
    "despesas_administrativas" DOUBLE PRECISION,
    "despesas_vendas" DOUBLE PRECISION,
    "resultado_financeiro" DOUBLE PRECISION,
    "resultado_operacional" DOUBLE PRECISION NOT NULL,
    "resultado_antes_ir" DOUBLE PRECISION,
    "provisao_ir_csll" DOUBLE PRECISION,
    "lucro_liquido" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dfcs" (
    "id" SERIAL NOT NULL,
    "laudo_id" INTEGER NOT NULL,
    "exercicio" INTEGER NOT NULL,
    "metodo" TEXT NOT NULL,
    "recebimentos_clientes" DOUBLE PRECISION,
    "pagamentos_fornecedores" DOUBLE PRECISION,
    "pagamentos_salarios" DOUBLE PRECISION,
    "pagamentos_impostos" DOUBLE PRECISION,
    "outros_recebimentos" DOUBLE PRECISION,
    "outros_pagamentos" DOUBLE PRECISION,
    "caixa_liquido_operacional" DOUBLE PRECISION NOT NULL,
    "lucro_liquido_base" DOUBLE PRECISION,
    "depreciacao_amortizacao" DOUBLE PRECISION,
    "variacao_capital_giro" DOUBLE PRECISION,
    "atividades_investimento" DOUBLE PRECISION,
    "atividades_financiamento" DOUBLE PRECISION,
    "variacao_liquida_caixa" DOUBLE PRECISION,
    "saldo_inicial_caixa" DOUBLE PRECISION,
    "saldo_final_caixa" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dfcs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicadores_financeiros" (
    "id" SERIAL NOT NULL,
    "laudo_id" INTEGER NOT NULL,
    "exercicio" INTEGER NOT NULL,
    "liquidez_corrente" DOUBLE PRECISION,
    "liquidez_seca" DOUBLE PRECISION,
    "liquidez_imediata" DOUBLE PRECISION,
    "liquidez_geral" DOUBLE PRECISION,
    "endividamento_geral" DOUBLE PRECISION,
    "composicao_endividamento" DOUBLE PRECISION,
    "imobilizacao_pl" DOUBLE PRECISION,
    "margem_bruta" DOUBLE PRECISION,
    "margem_operacional" DOUBLE PRECISION,
    "margem_liquida" DOUBLE PRECISION,
    "roe" DOUBLE PRECISION,
    "roa" DOUBLE PRECISION,
    "giro_ativo" DOUBLE PRECISION,
    "cobertura_divida" DOUBLE PRECISION,
    "variacao_receita" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "indicadores_financeiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulacoes_transacao" (
    "id" SERIAL NOT NULL,
    "laudo_id" INTEGER,
    "valor_divida" DOUBLE PRECISION NOT NULL,
    "classificacao_capag" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "prazo_meses" INTEGER NOT NULL,
    "desconto_percentual" DOUBLE PRECISION NOT NULL,
    "valor_com_desconto" DOUBLE PRECISION NOT NULL,
    "valor_parcela" DOUBLE PRECISION,
    "valor_entrada" DOUBLE PRECISION,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulacoes_transacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_alteracoes" (
    "id" SERIAL NOT NULL,
    "laudo_id" INTEGER NOT NULL,
    "campo_alterado" TEXT NOT NULL,
    "valor_anterior" TEXT,
    "valor_novo" TEXT,
    "descricao" TEXT,
    "data_alteracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_alteracoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contribuintes_cpf_cnpj_key" ON "contribuintes"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "balancos_patrimoniais_laudo_id_exercicio_key" ON "balancos_patrimoniais"("laudo_id", "exercicio");

-- CreateIndex
CREATE UNIQUE INDEX "dres_laudo_id_exercicio_key" ON "dres"("laudo_id", "exercicio");

-- CreateIndex
CREATE UNIQUE INDEX "dfcs_laudo_id_exercicio_key" ON "dfcs"("laudo_id", "exercicio");

-- CreateIndex
CREATE UNIQUE INDEX "indicadores_financeiros_laudo_id_exercicio_key" ON "indicadores_financeiros"("laudo_id", "exercicio");

-- AddForeignKey
ALTER TABLE "laudos" ADD CONSTRAINT "laudos_contribuinte_id_fkey" FOREIGN KEY ("contribuinte_id") REFERENCES "contribuintes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_laudo_id_fkey" FOREIGN KEY ("laudo_id") REFERENCES "laudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balancos_patrimoniais" ADD CONSTRAINT "balancos_patrimoniais_laudo_id_fkey" FOREIGN KEY ("laudo_id") REFERENCES "laudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dres" ADD CONSTRAINT "dres_laudo_id_fkey" FOREIGN KEY ("laudo_id") REFERENCES "laudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dfcs" ADD CONSTRAINT "dfcs_laudo_id_fkey" FOREIGN KEY ("laudo_id") REFERENCES "laudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicadores_financeiros" ADD CONSTRAINT "indicadores_financeiros_laudo_id_fkey" FOREIGN KEY ("laudo_id") REFERENCES "laudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulacoes_transacao" ADD CONSTRAINT "simulacoes_transacao_laudo_id_fkey" FOREIGN KEY ("laudo_id") REFERENCES "laudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_alteracoes" ADD CONSTRAINT "historico_alteracoes_laudo_id_fkey" FOREIGN KEY ("laudo_id") REFERENCES "laudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
