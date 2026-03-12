import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/server/db";
import { LaudoPdf } from "@/components/pdf/laudo-pdf";
import type { LaudoPdfData } from "@/components/pdf/laudo-pdf";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const laudoId = parseInt(id, 10);

  if (isNaN(laudoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  if (!db) {
    return NextResponse.json(
      { error: "Banco de dados não disponível no modo demonstração" },
      { status: 503 }
    );
  }

  try {
    const laudo = await db.laudo.findUniqueOrThrow({
      where: { id: laudoId },
      include: {
        contribuinte: true,
        balancos: { orderBy: { exercicio: "asc" } },
        dres: { orderBy: { exercicio: "asc" } },
        dfcs: { orderBy: { exercicio: "asc" } },
        indicadores: { orderBy: { exercicio: "asc" } },
      },
    });

    const pdfData: LaudoPdfData = {
      id: laudo.id,
      contribuinte: {
        razaoSocial: laudo.contribuinte.razaoSocial,
        cpfCnpj: laudo.contribuinte.cpfCnpj,
        tipo: laudo.contribuinte.tipo,
        regimeTributario: laudo.contribuinte.regimeTributario,
        atividadePrincipal: laudo.contribuinte.atividadePrincipal,
        cnae: laudo.contribuinte.cnae,
        endereco: laudo.contribuinte.endereco,
        municipio: laudo.contribuinte.municipio,
        uf: laudo.contribuinte.uf,
      },
      valorCapagE: laudo.valorCapagE,
      valorDivida: laudo.valorDivida,
      classificacaoCapag: laudo.classificacaoCapag,
      metodologia: laudo.metodologia,
      parecerTecnico: laudo.parecerTecnico,
      conclusao: laudo.conclusao,
      conclusaoTexto: laudo.conclusaoTexto,
      limitacoes: laudo.limitacoes,
      recomendacoes: laudo.recomendacoes,
      processoAdmin: laudo.processoAdmin,
      exercicioInicio: laudo.exercicioInicio,
      exercicioFim: laudo.exercicioFim,
      bensEssenciais: laudo.bensEssenciais,
      dataEmissao: laudo.dataEmissao,
      createdAt: laudo.createdAt,
      balancos: laudo.balancos.map((b) => ({
        exercicio: b.exercicio,
        ativoCirculante: b.ativoCirculante,
        ativoNaoCirculante: b.ativoNaoCirculante,
        ativoTotal: b.ativoTotal,
        passivoCirculante: b.passivoCirculante,
        passivoNaoCirculante: b.passivoNaoCirculante,
        passivoTotal: b.passivoTotal,
        patrimonioLiquido: b.patrimonioLiquido,
      })),
      dres: laudo.dres.map((d) => ({
        exercicio: d.exercicio,
        receitaBruta: d.receitaBruta,
        receitaLiquida: d.receitaLiquida,
        lucroBruto: d.lucroBruto,
        despesasOperacionais: d.despesasOperacionais,
        resultadoOperacional: d.resultadoOperacional,
        lucroLiquido: d.lucroLiquido,
      })),
      dfcs: laudo.dfcs.map((d) => ({
        exercicio: d.exercicio,
        metodo: d.metodo,
        caixaLiquidoOperacional: d.caixaLiquidoOperacional,
      })),
      indicadores: laudo.indicadores.map((ind) => ({
        exercicio: ind.exercicio,
        liquidezCorrente: ind.liquidezCorrente,
        endividamentoGeral: ind.endividamentoGeral,
        margemLiquida: ind.margemLiquida,
        roe: ind.roe,
        roa: ind.roa,
      })),
    };

    const buffer = await renderToBuffer(
      <LaudoPdf data={pdfData} />
    );

    const razao = laudo.contribuinte.razaoSocial
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 30);
    const filename = `CAPAG-e_${laudo.id}_${razao}.pdf`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Laudo não encontrado" },
        { status: 404 }
      );
    }
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json(
      { error: "Erro ao gerar PDF" },
      { status: 500 }
    );
  }
}
