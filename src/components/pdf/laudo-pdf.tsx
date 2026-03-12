import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ─── Types ──────────────────────────────────────────────────────

interface LaudoPdfData {
  id: number;
  contribuinte: {
    razaoSocial: string;
    cpfCnpj: string;
    tipo: string;
    regimeTributario?: string | null;
    atividadePrincipal?: string | null;
    cnae?: string | null;
    endereco?: string | null;
    municipio?: string | null;
    uf?: string | null;
  };
  valorCapagE?: number | null;
  valorDivida?: number | null;
  classificacaoCapag?: string | null;
  metodologia?: string | null;
  parecerTecnico?: string | null;
  conclusao?: string | null;
  conclusaoTexto?: string | null;
  limitacoes?: string | null;
  recomendacoes?: string | null;
  processoAdmin?: string | null;
  exercicioInicio?: number | null;
  exercicioFim?: number | null;
  bensEssenciais?: number | null;
  dataEmissao?: Date | null;
  createdAt: Date;
  balancos: Array<{
    exercicio: number;
    ativoCirculante: number;
    ativoNaoCirculante: number;
    ativoTotal: number;
    passivoCirculante: number;
    passivoNaoCirculante: number;
    passivoTotal: number;
    patrimonioLiquido: number;
  }>;
  dres: Array<{
    exercicio: number;
    receitaBruta: number;
    receitaLiquida: number;
    lucroBruto: number;
    despesasOperacionais: number;
    resultadoOperacional: number;
    lucroLiquido: number;
  }>;
  dfcs: Array<{
    exercicio: number;
    metodo: string;
    caixaLiquidoOperacional: number;
  }>;
  indicadores: Array<{
    exercicio: number;
    liquidezCorrente?: number | null;
    endividamentoGeral?: number | null;
    margemLiquida?: number | null;
    roe?: number | null;
    roa?: number | null;
  }>;
}

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 4,
    color: "#1e3a5f",
  },
  subheader: {
    fontSize: 10,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 6,
    textAlign: "justify",
  },
  label: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#444",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 4,
  },
  col: {
    flex: 1,
  },
  table: {
    marginTop: 6,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f4f8",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
  },
  tableCellBold: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  capagBadge: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginVertical: 12,
  },
  capagValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    paddingTop: 6,
  },
  disclaimer: {
    fontSize: 8,
    color: "#888",
    lineHeight: 1.4,
    marginTop: 4,
  },
});

// ─── Helpers ────────────────────────────────────────────────────

function fmt(v: number | null | undefined): string {
  if (v == null) return "N/D";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtPct(v: number | null | undefined): string {
  if (v == null) return "N/D";
  return `${(v * 100).toFixed(2)}%`;
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "N/D";
  return new Date(d).toLocaleDateString("pt-BR");
}

const CAPAG_COLORS: Record<string, string> = {
  A: "#16a34a",
  B: "#2563eb",
  C: "#d97706",
  D: "#dc2626",
};

// ─── Component ──────────────────────────────────────────────────

export function LaudoPdf({ data }: { data: LaudoPdfData }) {
  const c = data.contribuinte;
  const capagColor = CAPAG_COLORS[data.classificacaoCapag ?? ""] ?? "#666";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.header}>LAUDO TCNICO CAPAG-e</Text>
        <Text style={styles.subheader}>
          Laudo #{data.id} | Emitido em {fmtDate(data.dataEmissao ?? data.createdAt)}
        </Text>

        {/* 1. Identificao */}
        <Text style={styles.sectionTitle}>1. Identificao da Empresa</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Razo Social</Text>
            <Text style={styles.value}>{c.razaoSocial}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>CPF/CNPJ</Text>
            <Text style={styles.value}>{c.cpfCnpj}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Tipo</Text>
            <Text style={styles.value}>{c.tipo}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Regime Tributrio</Text>
            <Text style={styles.value}>
              {c.regimeTributario?.replace("_", " ") ?? "N/D"}
            </Text>
          </View>
        </View>
        {c.atividadePrincipal && (
          <View>
            <Text style={styles.label}>Atividade Principal</Text>
            <Text style={styles.value}>
              {c.cnae ? `${c.cnae} - ` : ""}
              {c.atividadePrincipal}
            </Text>
          </View>
        )}
        {c.endereco && (
          <View>
            <Text style={styles.label}>Endereo</Text>
            <Text style={styles.value}>
              {c.endereco}
              {c.municipio ? ` - ${c.municipio}` : ""}
              {c.uf ? `/${c.uf}` : ""}
            </Text>
          </View>
        )}

        {/* 2. Objeto */}
        <Text style={styles.sectionTitle}>2. Objeto do Laudo</Text>
        <Text style={styles.paragraph}>
          O presente laudo tcnico tem por objeto a apurao da Capacidade
          de Pagamento Extraordinria (CAPAG-e) do contribuinte acima
          identificado, conforme previsto na Portaria PGFN 6.757/2022, para
          fins de transao tributria.
        </Text>
        {data.processoAdmin && (
          <Text style={styles.paragraph}>
            Processo administrativo: {data.processoAdmin}
          </Text>
        )}
        {data.valorDivida != null && (
          <Text style={styles.paragraph}>
            Valor da dvida objeto da transao: {fmt(data.valorDivida)}
          </Text>
        )}

        {/* 3. Metodologia */}
        <Text style={styles.sectionTitle}>3. Metodologia Aplicada</Text>
        <Text style={styles.paragraph}>
          {data.metodologia === "ROA_PLR"
            ? "Metodologia ROA + PLR: CAPAG-e = (Resultado Operacional Ajustado mdio x 5) + Patrimnio Lquido Realizvel. O Resultado Operacional Ajustado corresponde  mdia aritmtica dos resultados operacionais dos exerccios analisados."
            : data.metodologia === "FCO_PLR"
              ? "Metodologia FCO + PLR: CAPAG-e = (Fluxo de Caixa Operacional mdio x 5) + Patrimnio Lquido Realizvel. O FCO  obtido a partir da Demonstrao de Fluxo de Caixa pelo mtodo direto."
              : "Metodologia no informada."}
        </Text>
        <Text style={styles.paragraph}>
          PLR = Patrimnio Lquido - Bens Essenciais  Atividade = {fmt(
            data.balancos.length > 0
              ? data.balancos[data.balancos.length - 1].patrimonioLiquido -
                  (data.bensEssenciais ?? 0)
              : null
          )}
        </Text>
        {data.exercicioInicio && data.exercicioFim && (
          <Text style={styles.paragraph}>
            Perodo analisado: exerccios de {data.exercicioInicio} a{" "}
            {data.exercicioFim}.
          </Text>
        )}

        {/* 4. Documentos */}
        <Text style={styles.sectionTitle}>4. Documentos Analisados</Text>
        <Text style={styles.paragraph}>
          Foram analisados os seguintes documentos contbeis e financeiros:
        </Text>
        <Text style={styles.paragraph}>
          - Balano Patrimonial: {data.balancos.length} exerccio(s)
        </Text>
        <Text style={styles.paragraph}>
          - DRE: {data.dres.length} exerccio(s)
        </Text>
        <Text style={styles.paragraph}>
          - DFC: {data.dfcs.length} exerccio(s) (mtodo:{" "}
          {data.dfcs[0]?.metodo ?? "N/D"})
        </Text>

        {/* 5. Anlise Contbil */}
        <Text style={styles.sectionTitle}>
          5. Anlise Contbil e Financeira
        </Text>
        {data.balancos.length > 0 && (
          <View style={styles.table}>
            <Text style={styles.label}>Balano Patrimonial</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellBold}>Exerccio</Text>
              <Text style={styles.tableCellBold}>Ativo Total</Text>
              <Text style={styles.tableCellBold}>Passivo Total</Text>
              <Text style={styles.tableCellBold}>PL</Text>
            </View>
            {data.balancos.map((b) => (
              <View key={b.exercicio} style={styles.tableRow}>
                <Text style={styles.tableCell}>{b.exercicio}</Text>
                <Text style={styles.tableCell}>{fmt(b.ativoTotal)}</Text>
                <Text style={styles.tableCell}>{fmt(b.passivoTotal)}</Text>
                <Text style={styles.tableCell}>
                  {fmt(b.patrimonioLiquido)}
                </Text>
              </View>
            ))}
          </View>
        )}
        {data.dres.length > 0 && (
          <View style={styles.table}>
            <Text style={styles.label}>DRE</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellBold}>Exerccio</Text>
              <Text style={styles.tableCellBold}>Rec. Lquida</Text>
              <Text style={styles.tableCellBold}>Res. Operac.</Text>
              <Text style={styles.tableCellBold}>Lucro Lquido</Text>
            </View>
            {data.dres.map((d) => (
              <View key={d.exercicio} style={styles.tableRow}>
                <Text style={styles.tableCell}>{d.exercicio}</Text>
                <Text style={styles.tableCell}>
                  {fmt(d.receitaLiquida)}
                </Text>
                <Text style={styles.tableCell}>
                  {fmt(d.resultadoOperacional)}
                </Text>
                <Text style={styles.tableCell}>{fmt(d.lucroLiquido)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 6. Indicadores */}
        <Text style={styles.sectionTitle}>
          6. Anlise de Indicadores Financeiros
        </Text>
        {data.indicadores.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellBold}>Exerccio</Text>
              <Text style={styles.tableCellBold}>Liq. Corrente</Text>
              <Text style={styles.tableCellBold}>Endiv. Geral</Text>
              <Text style={styles.tableCellBold}>Margem Lq.</Text>
              <Text style={styles.tableCellBold}>ROE</Text>
            </View>
            {data.indicadores.map((ind) => (
              <View key={ind.exercicio} style={styles.tableRow}>
                <Text style={styles.tableCell}>{ind.exercicio}</Text>
                <Text style={styles.tableCell}>
                  {ind.liquidezCorrente?.toFixed(2) ?? "N/D"}
                </Text>
                <Text style={styles.tableCell}>
                  {fmtPct(ind.endividamentoGeral)}
                </Text>
                <Text style={styles.tableCell}>
                  {fmtPct(ind.margemLiquida)}
                </Text>
                <Text style={styles.tableCell}>{fmtPct(ind.roe)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.paragraph}>
            Indicadores no calculados para este laudo.
          </Text>
        )}

        {/* 7. Clculo CAPAG-e */}
        <Text style={styles.sectionTitle}>7. Clculo da CAPAG-e</Text>
        <Text
          style={[styles.capagValue, { color: capagColor }]}
        >
          CAPAG-e: {fmt(data.valorCapagE)}
        </Text>
        <Text style={[styles.capagBadge, { color: capagColor }]}>
          Classificao: {data.classificacaoCapag ?? "N/D"}
        </Text>
        {data.valorDivida != null && data.valorCapagE != null && (
          <Text style={styles.paragraph}>
            Relao CAPAG-e / Dvida:{" "}
            {data.valorDivida > 0
              ? (data.valorCapagE / data.valorDivida).toFixed(2)
              : "N/D"}
            x
          </Text>
        )}

        {/* 8. Fundamentao Legal */}
        <Text style={styles.sectionTitle}>8. Fundamentao Legal</Text>
        <Text style={styles.paragraph}>
          O presente laudo fundamenta-se nas seguintes normas:
        </Text>
        <Text style={styles.paragraph}>
          - Lei 14.375/2022 - Transao tributria
        </Text>
        <Text style={styles.paragraph}>
          - Portaria PGFN 6.757/2022 - Regulamentao da transao
        </Text>
        <Text style={styles.paragraph}>
          - Portaria PGFN 1.457/2024 - Exigncia de DFC mtodo direto
        </Text>

        {/* 9. Concluso */}
        <Text style={styles.sectionTitle}>9. Concluso Tcnica</Text>
        {data.parecerTecnico ? (
          <Text style={styles.paragraph}>{data.parecerTecnico}</Text>
        ) : (
          <Text style={styles.paragraph}>
            Parecer tcnico no informado.
          </Text>
        )}
        {data.conclusaoTexto && (
          <Text style={styles.paragraph}>{data.conclusaoTexto}</Text>
        )}
        {data.recomendacoes && (
          <>
            <Text style={styles.label}>Recomendaes</Text>
            <Text style={styles.paragraph}>{data.recomendacoes}</Text>
          </>
        )}

        {/* 10. Limitaes */}
        <Text style={styles.sectionTitle}>
          10. Limitaes e Responsabilidades
        </Text>
        {data.limitacoes ? (
          <Text style={styles.paragraph}>{data.limitacoes}</Text>
        ) : (
          <Text style={styles.paragraph}>
            Este laudo foi elaborado com base nas informaes e documentos
            fornecidos pelo contribuinte. O profissional responsvel no se
            responsabiliza por informaes omitidas, incorretas ou
            incompletas. A anlise  estritamente tcnica e no constitui
            assessoria jurdica. Os valores e indicadores apresentados
            refletem a situao financeira nos perodos analisados e podem
            sofrer alteraes em funo de fatos supervenientes.
          </Text>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Laudo CAPAG-e #{data.id} | Gerado por Sistema CAPAG-e |{" "}
          {fmtDate(new Date())}
        </Text>
      </Page>
    </Document>
  );
}

export type { LaudoPdfData };
