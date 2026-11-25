export type Period = "daily" | "weekly" | "monthly";

/** Registro devolvido por GET /cycle-history (datas em ISO). */
export interface CycleRecord {
  id: number;
  startedAt: string;
  finishedAt: string;
  userID: number;
}

/** Um intervalo do gráfico, compartilhado pelos dois cards. */
export interface ChartPoint {
  label: string;
  fullLabel: string;
  cycles: number;
  focusSeconds: number;
}

export type ChartMetric = "cycles" | "focusSeconds";
