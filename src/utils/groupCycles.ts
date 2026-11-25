import type { ChartPoint, CycleRecord, Period } from "../types/reports";

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

interface Bucket {
  key: string;
  label: string;
  fullLabel: string;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfWeek(date: Date): Date {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = monday.getDay(); // 0 = domingo

  monday.setDate(monday.getDate() + (weekday === 0 ? -6 : 1 - weekday));

  return monday;
}

function createBuckets(period: Period, reference: Date): Bucket[] {
  if (period === "daily") {
    return Array.from({ length: 24 }, (_, hour) => ({
      key: pad(hour),
      label: `${pad(hour)}h`,
      fullLabel: `${pad(hour)}:00 - ${pad(hour)}:59`,
    }));
  }

  if (period === "weekly") {
    const monday = startOfWeek(reference);

    return WEEK_DAYS.map((label, index) => {
      const day = new Date(monday);

      day.setDate(monday.getDate() + index);

      return {
        key: dateKey(day),
        label,
        fullLabel: `${pad(day.getDate())}/${pad(day.getMonth() + 1)}`,
      };
    });
  }

  const year = reference.getFullYear();
  const month = reference.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;

    return {
      key: dateKey(new Date(year, month, day)),
      label: String(day),
      fullLabel: `${pad(day)}/${pad(month + 1)}/${year}`,
    };
  });
}

/**
 * Agrupa os ciclos concluídos em intervalos do período escolhido.
 * Usa a data local do navegador para não deslocar pomodoros feitos à noite.
 */
export function groupCycles(
  cycles: CycleRecord[],
  period: Period,
  reference: Date = new Date(),
): ChartPoint[] {
  const buckets = createBuckets(period, reference);
  const points: ChartPoint[] = buckets.map((bucket) => ({
    label: bucket.label,
    fullLabel: bucket.fullLabel,
    cycles: 0,
    focusSeconds: 0,
  }));
  const indexByKey = new Map(buckets.map((bucket, index) => [bucket.key, index]));
  const referenceDate = dateKey(reference);

  for (const cycle of cycles) {
    const startedAt = new Date(cycle.startedAt);
    const finishedAt = new Date(cycle.finishedAt);

    if (
      Number.isNaN(startedAt.getTime()) ||
      Number.isNaN(finishedAt.getTime())
    ) {
      continue;
    }

    // A conclusão do ciclo define em qual intervalo ele entra.
    if (period === "daily" && dateKey(finishedAt) !== referenceDate) {
      continue;
    }

    const key =
      period === "daily" ? pad(finishedAt.getHours()) : dateKey(finishedAt);
    const index = indexByKey.get(key);

    if (index === undefined) {
      continue;
    }

    const seconds = (finishedAt.getTime() - startedAt.getTime()) / 1000;

    if (!Number.isFinite(seconds) || seconds <= 0) {
      continue;
    }

    points[index].cycles += 1;
    points[index].focusSeconds += seconds;
  }

  return points;
}
