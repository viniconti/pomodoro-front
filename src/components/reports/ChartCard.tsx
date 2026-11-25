import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  total: string;
  totalCaption: string;
  children: ReactNode;
}

export default function ChartCard({
  title,
  total,
  totalCaption,
  children,
}: ChartCardProps) {
  return (
    <article className="report-card">
      <div className="report-card-header">
        <h3 className="report-card-title">{title}</h3>

        <div className="report-card-total">
          <strong>{total}</strong>
          <span>{totalCaption}</span>
        </div>
      </div>

      <div className="report-card-chart">{children}</div>
    </article>
  );
}
