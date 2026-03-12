import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/server/db";
import { LaudoPdf } from "@/components/pdf/laudo-pdf";
import type { LaudoPdfData } from "@/components/pdf/laudo-pdf";
import { DEMO_LAUDO_DETAIL } from "@/lib/demo-data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DemoLaudo = (typeof DEMO_LAUDO_DETAIL)[keyof typeof DEMO_LAUDO_DETAIL];

/** Map a DEMO_LAUDO_DETAIL entry into the shape LaudoPdf expects */
function demoToPdfData(demo: DemoLaudo): LaudoPdfData {
  return {
    id: demo.id,
    contribuinte: {
      razaoSocial: demo.contribuinte.razaoSocial,
      cpfCnpj: demo.contribuinte.cpfCnpj,
      tipo: demo.contribuinte.tipo,
      regimeTributario: demo.contribuinte.regimeTributario ?? null,
      atividadePrincipal: demo.contribuinte.atividadePrincipal ?? null,
      cnae: demo.contribuinte.cnae ?? null,
      endereco: demo.contribuinte.endereco ?? null,
      municipio: demo.contribuinte.municipio ?? null,
      uf: demo.contribuinte.uf ?? null,
    },
    valorCapagE: demo.valorCapagE,
    valorDivida: demo.valorDivida,
    classificacaoCapag: demo.classificacaoCapag,
    metodologia: demo.metodologia,
    parecerTecnico: demo.parecerTecnico ?? null,
    conclusao: demo.conclusao ?? null,
    conclusaoTexto: demo.conclusaoTexto ?? null,
    limitacoes: demo.limitacoes ?? null,
    recomendacoes: demo.recomendacoes ?? null,
    processoAdmin: demo.processoAdmin ?? null,
    exercicioInicio: demo.exercicioInicio ?? null,
    exercicioFim: demo.exercicioFim ?? null,
    bensEssenciais: demo.bensEssenciais ?? null,
    dataEmissao: demo.dataEmissao ? new Date(demo.dataEmissao) : null,
    createdAt: new Date(demo.createdAt),
    balancos: demo.balancos.map((b) => ({
      exercicio: b.exercicio,
      ativoCirculante: b.ativoCirculante,
      ativoNaoCirculante: b.ativoNaoCirculante,
      ativoTotal: b.ativoTotal,
      passivoCirculante: b.passivoCirculante,
      passivoNaoCirculante: b.passivoNaoCirculante,
      passivoTotal: b.passivoTotal,
      patrimonioLiquido: b.patrimonioLiquido,
    })),
    dres: demo.dres.map((d) => ({
      exercicio: d.exercicio,
      receitaBruta: d.receitaBruta,
      receitaLiquida: d.receitaLiquida,
      lucroBruto: d.lucroBruto,
      despesasOperacionais: d.despesasOperacionais,
      resultadoOperacional: d.resultadoOperacional,
      lucroLiquido: d.lucroLiquido,
    })),
    dfcs: demo.dfcs.map((d) => ({
      exercicio: d.exercicio,
      metodo: d.metodo,
      caixaLiquidoOperacional: d.caixaLiquidoOperacional,
    })),
    indicadores: demo.indicadores.map((ind) => ({
      exercicio: ind.exercicio,
      liquidezCorrente: ind.liquidezCorrente ?? null,
      endividamentoGeral: ind.endividamentoGeral ?? null,
      margemLiquida: ind.margemLiquida ?? null,
      roe: ind.roe ?? null,
      roa: ind.roa ?? null,
    })),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const laudoId = parseInt(id, 10);

  if (isNaN(laudoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    // ── 1. Try to get data from the database ──────────────────────
    let pdfData: LaudoPdfData | null = null;

    if (db) {
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

        pdfData = {
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
      } catch {
        // DB query failed (e.g. native binary incompatible) — fall through to demo
        console.warn("PDF: DB query failed, falling back to demo data");
      }
    }

    // ── 2. Fallback to demo data if DB unavailable ────────────────
    if (!pdfData) {
      const demo =
        DEMO_LAUDO_DETAIL[laudoId as keyof typeof DEMO_LAUDO_DETAIL];
      if (!demo) {
        return NextResponse.json(
          { error: "Laudo não encontrado (modo demonstração)" },
          { status: 404 }
        );
      }
      pdfData = demoToPdfData(demo);
    }

    // ── 3. Render the PDF ─────────────────────────────────────────
    const buffer = await renderToBuffer(<LaudoPdf data={pdfData} />);

    const razao = pdfData.contribuinte.razaoSocial
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 30);
    const filename = `CAPAG-e_${pdfData.id}_${razao}.pdf`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json(
      { error: "Erro ao gerar PDF" },
      { status: 500 }
    );
  }
}
