import type { Period } from "../../types/reports";

const OPTIONS: Array<{ value: Period; label: string }> = [
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
];

interface PeriodFilterProps {
  value: Period;
  onChange: (period: Period) => void;
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div
      className="report-period-filter"
      role="group"
      aria-label="Período dos relatórios"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`report-period-button${
            value === option.value ? " ativo" : ""
          }`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
