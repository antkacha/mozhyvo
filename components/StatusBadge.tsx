import type { Application } from "@/hooks/useApplications";

const CONFIG: Record<
  Application["status"],
  { label: string; bg: string; text: string; dot: string }
> = {
  pending:   { label: "Очікує",       bg: "bg-blue-50",   text: "text-blue-600",  dot: "bg-blue-500"  },
  reviewing: { label: "Розглядається",bg: "bg-amber-50",  text: "text-amber-600", dot: "bg-amber-400" },
  accepted:  { label: "Прийнято",     bg: "bg-green-50",  text: "text-green-700", dot: "bg-green-500" },
  rejected:  { label: "Відхилено",    bg: "bg-red-50",    text: "text-red-500",   dot: "bg-red-400"   },
};

export default function StatusBadge({
  status,
  size = "md",
}: {
  status: Application["status"];
  size?: "sm" | "md";
}) {
  const c = CONFIG[status];
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${pad} ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}
