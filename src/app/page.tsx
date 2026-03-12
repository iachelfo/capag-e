import Link from "next/link";
import Image from "next/image";
import {
  FilePlus,
  LayoutDashboard,
  Calculator,
  CheckSquare,
  BookOpen,
  ArrowRight,
  Shield,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <Image
            src="/icons/chelfo-logo.png"
            alt="Chelfo"
            width={120}
            height={120}
            className="rounded-xl"
            priority
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          CAPAG-e
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Gerador de Laudo Técnico de Capacidade de Pagamento Extraordinária
          para transações tributárias junto à PGFN
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Link
            href="/laudo/novo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <FilePlus className="h-5 w-5" />
            Novo Laudo
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            icon: FilePlus,
            title: "Laudo Automatizado",
            desc: "Wizard guiado para criar laudos CAPAG-e com as 10 seções obrigatórias, cálculo automático e geração de PDF.",
            href: "/laudo/novo",
          },
          {
            icon: Calculator,
            title: "Simulador de Transação",
            desc: "Simule descontos e parcelamentos por classificação CAPAG (A, B, C, D) e compare modalidades.",
            href: "/simulador",
          },
          {
            icon: CheckSquare,
            title: "Checklist Art. 30",
            desc: "Checklist interativo dos documentos obrigatórios para evitar indeferimento do pedido.",
            href: "/checklist",
          },
          {
            icon: BookOpen,
            title: "Guia Técnico",
            desc: "Metodologias ROA+PLR e FCO+PLR explicadas, modelo de DFC e casos de referência.",
            href: "/guia-tecnico",
          },
          {
            icon: LayoutDashboard,
            title: "Dashboard",
            desc: "Histórico de laudos, estatísticas por classificação e acompanhamento de status.",
            href: "/dashboard",
          },
          {
            icon: Shield,
            title: "Conformidade Legal",
            desc: "Alinhado à Portaria PGFN 6.757/2022, Lei 14.375/2022 e Portaria 1.457/2024.",
            href: "/guia-tecnico",
          },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md transition-all"
          >
            <item.icon className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              {item.title}
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {item.desc}
            </p>
          </Link>
        ))}
      </section>

      {/* Classificação CAPAG */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Classificações CAPAG
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              cls: "A",
              color: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
              badge: "text-green-700 dark:text-green-300",
              desc: "CAPAG >= 2x dívida",
              terms: "Sem desconto, até 60 meses",
            },
            {
              cls: "B",
              color: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
              badge: "text-blue-700 dark:text-blue-300",
              desc: "CAPAG entre 1x e 2x",
              terms: "Sem desconto, até 60 meses",
            },
            {
              cls: "C",
              color: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
              badge: "text-amber-700 dark:text-amber-300",
              desc: "CAPAG < dívida",
              terms: "Até 65% desconto, 114 meses",
            },
            {
              cls: "D",
              color: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
              badge: "text-red-700 dark:text-red-300",
              desc: "Crédito irrecuperável",
              terms: "Até 70% desconto, 133 meses",
            },
          ].map((item) => (
            <div
              key={item.cls}
              className={`p-4 rounded-lg border ${item.color}`}
            >
              <div className={`text-2xl font-bold ${item.badge} mb-1`}>
                Rating {item.cls}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.desc}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {item.terms}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Attribution */}
      <footer className="text-center py-6 border-t border-gray-200 dark:border-gray-800">
        <Image
          src="/icons/chelfo-logo.png"
          alt="Chelfo"
          width={48}
          height={48}
          className="mx-auto mb-2 rounded-lg"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          Elaborado por Carlos Chelfo
        </p>
        <a
          href="https://instagram.com/Prof.CarlosChelfo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Instagram: @Prof.CarlosChelfo
        </a>
      </footer>
    </div>
  );
}
