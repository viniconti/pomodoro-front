import type { CSSProperties } from "react";

/**
 * Paleta compartilhada dos gráficos de relatório.
 * Altere aqui para trocar as cores em todos os cards e barras.
 */
export const chartColors = {
  primary: "#FF6900",
  secondary: "#C45305",
  tertiary: "#984208",
  dark: "#663014",
  deep: "#542B16",
  card: "#222222",
  border: "rgba(104, 103, 103, 0.3)",
  cursor: "rgba(255, 105, 0, 0.08)",
  text: "#e5e5e5",
  muted: "#a5a5a5",
} as const;

/** Variáveis CSS derivadas da mesma paleta, aplicadas na seção de relatórios. */
export const chartCssVariables = {
  "--chart-primary": chartColors.primary,
  "--chart-secondary": chartColors.secondary,
  "--chart-tertiary": chartColors.tertiary,
  "--chart-dark": chartColors.dark,
  "--chart-deep": chartColors.deep,
  "--chart-card": chartColors.card,
  "--chart-border": chartColors.border,
  "--chart-cursor": chartColors.cursor,
  "--chart-text": chartColors.text,
  "--chart-muted": chartColors.muted,
} as CSSProperties;

/** Barra de maior destaque usa o laranja principal; as demais, intensidades da paleta. */
export function getBarColor(value: number, maxValue: number): string {
  if (maxValue <= 0 || value <= 0) {
    return chartColors.deep;
  }

  if (value >= maxValue) {
    return chartColors.primary;
  }

  const ratio = value / maxValue;

  if (ratio >= 0.75) return chartColors.secondary;
  if (ratio >= 0.5) return chartColors.tertiary;
  if (ratio >= 0.25) return chartColors.dark;

  return chartColors.deep;
}
