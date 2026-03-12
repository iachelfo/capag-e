import { cn } from "@/lib/utils";
import { CAPAG_CORES } from "@/lib/constants";

interface CapagBadgeProps {
  classificacao: "A" | "B" | "C" | "D" | null | undefined;
  size?: "sm" | "md" | "lg";
}

export function CapagBadge({ classificacao, size = "md" }: CapagBadgeProps) {
  if (!classificacao) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        N/D
      </span>
    );
  }

  const cores = CAPAG_CORES[classificacao];

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-4 py-2 text-lg",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-bold border",
        cores.bg,
        cores.text,
        cores.border,
        sizes[size],
        "dark:bg-opacity-20"
      )}
    >
      CAPAG {classificacao}
    </span>
  );
}
