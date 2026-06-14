import { ReactNode } from "motion/react";
import { Card } from "./Card";

interface FilterPanelProps {
  children: ReactNode;
}

export function FilterPanel({ children }: FilterPanelProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap gap-4 items-end">{children}</div>
    </Card>
  );
}
