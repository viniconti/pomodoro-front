"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartColors, getBarColor } from "../../config/chartTheme";
import type { ChartMetric, ChartPoint } from "../../types/reports";
import ChartTooltip from "./ChartTooltip";

interface StatBarChartProps {
  data: ChartPoint[];
  metric: ChartMetric;
}

export default function StatBarChart({ data, metric }: StatBarChartProps) {
  const maxValue = Math.max(0, ...data.map((point) => point[metric]));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 8, right: 4, bottom: 0, left: 4 }}
        barCategoryGap="22%"
      >
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: chartColors.muted, fontSize: 11 }}
          tickMargin={8}
          minTickGap={16}
        />
        <YAxis
          hide
          domain={[0, maxValue > 0 ? maxValue * 1.08 : 1]}
          allowDecimals={metric !== "cycles"}
        />
        <Tooltip
          cursor={{ fill: chartColors.cursor }}
          content={<ChartTooltip metric={metric} />}
        />
        <Bar
          dataKey={metric}
          radius={[6, 6, 0, 0]}
          isAnimationActive
          animationDuration={500}
          animationEasing="ease-out"
        >
          {data.map((point) => (
            <Cell
              key={point.fullLabel}
              fill={getBarColor(point[metric], maxValue)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
