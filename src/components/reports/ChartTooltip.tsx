import type { ChartMetric, ChartPoint } from "../../types/reports";
import { formatFocus } from "../../utils/formatFocus";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: ChartPoint }>;
  metric: ChartMetric;
}

export default function ChartTooltip({
  active,
  payload,
  metric,
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;

  if (!point) {
    return null;
  }

  const value =
    metric === "cycles"
      ? `${point.cycles} ${point.cycles === 1 ? "pomodoro" : "pomodoros"}`
      : formatFocus(point.focusSeconds);

  return (
    <div className="report-tooltip">
      <p className="report-tooltip-label">{point.fullLabel}</p>
      <p className="report-tooltip-value">{value}</p>
    </div>
  );
}
