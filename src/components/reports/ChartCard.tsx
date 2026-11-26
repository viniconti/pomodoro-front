import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ChartCardProps {
  icon: LucideIcon;
  title: string;
  total: string;
  totalCaption: string;
  children: ReactNode;
}

export default function ChartCard({
  icon: Icon,
  title,
  total,
  totalCaption,
  children,
}: ChartCardProps) {
  return (
    <article className="report-card">
      <div className="report-card-header">
        <span className="report-card-icon" aria-hidden="true">
          <Icon size={32} strokeWidth={1.8} />
        </span>

        <div className="report-card-info">
          <h3 className="report-card-title">{title}</h3>

          <div className="report-card-total">
            <strong>{total}</strong>
            <span>{totalCaption}</span>
          </div>
        </div>
      </div>

      <div className="report-card-chart">{children}</div>
    </article>
  );
}
