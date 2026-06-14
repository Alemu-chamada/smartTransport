interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
}

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const variants = {
    default: "bg-muted text-foreground border-border",
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    error: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const autoVariant = (status: string): typeof variant => {
    const lower = status.toLowerCase();
    if (["active", "confirmed", "success", "completed", "healthy", "paid"].includes(lower)) return "success";
    if (["pending", "processing", "warning"].includes(lower)) return "warning";
    if (["cancelled", "failed", "error", "critical", "suspended"].includes(lower)) return "error";
    if (["inactive", "info"].includes(lower)) return "info";
    return "default";
  };

  const finalVariant = variant === "default" ? autoVariant(status) : variant;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg border text-xs font-medium ${variants[finalVariant]}`}
    >
      {status}
    </span>
  );
}
