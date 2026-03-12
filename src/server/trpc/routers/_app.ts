import { createTRPCRouter } from "../init";
import { contribuinteRouter } from "./contribuinte";
import { laudoRouter } from "./laudo";
import { balancoRouter } from "./balanco";
import { dreRouter } from "./dre";
import { dfcRouter } from "./dfc";
import { indicadorRouter } from "./indicador";
import { documentoRouter } from "./documento";
import { simulacaoRouter } from "./simulacao";

export const appRouter = createTRPCRouter({
  contribuinte: contribuinteRouter,
  laudo: laudoRouter,
  balanco: balancoRouter,
  dre: dreRouter,
  dfc: dfcRouter,
  indicador: indicadorRouter,
  documento: documentoRouter,
  simulacao: simulacaoRouter,
});

export type AppRouter = typeof appRouter;
