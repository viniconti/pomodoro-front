"use client";

import { useEffect, useMemo, useState } from "react";
import { chartCssVariables } from "../../config/chartTheme";
import { api } from "../../services/api";
import type { ChartPoint, CycleRecord, Period } from "../../types/reports";
import { formatFocus } from "../../utils/formatFocus";
import { groupCycles } from "../../utils/groupCycles";
import ChartCard from "./ChartCard";
import PeriodFilter from "./PeriodFilter";
import StatBarChart from "./StatBarChart";

interface ReportDashboardProps {
  refreshKey?: number;
}

export default function ReportDashboard({
  refreshKey = 0,
}: ReportDashboardProps) {
  const [period, setPeriod] = useState<Period>("weekly");
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let ativo = true;

    api
      .get<CycleRecord[]>("/cycle-history")
      .then((response) => {
        if (ativo) {
          setCycles(Array.isArray(response.data) ? response.data : []);
          setHasError(false);
        }
      })
      .catch((error) => {
        if (ativo) {
          console.error("Erro ao carregar relatórios:", error);
          setHasError(true);
        }
      })
      .finally(() => {
        if (ativo) {
          setIsLoading(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [refreshKey]);

  const data = useMemo<ChartPoint[]>(
    () => groupCycles(cycles, period),
    [cycles, period],
  );

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, point) => ({
          cycles: acc.cycles + point.cycles,
          focusSeconds: acc.focusSeconds + point.focusSeconds,
        }),
        { cycles: 0, focusSeconds: 0 },
      ),
    [data],
  );

  return (
    <section
      id="relatorios"
      className="report-section"
      style={chartCssVariables}
    >
      <div className="report-header">
        <div>
          <h2 className="report-title">Relatórios</h2>
          <p className="report-subtitle">Acompanhe o seu tempo de foco.</p>
        </div>

        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {hasError && (
        <p className="report-message">
          Não foi possível carregar os relatórios.
        </p>
      )}

      {!hasError && isLoading && (
        <p className="report-message">Carregando relatórios...</p>
      )}

      {!hasError && !isLoading && totals.cycles === 0 && (
        <p className="report-message">
          Nenhum Pomodoro concluído neste período.
        </p>
      )}

      <div className="report-grid">
        <ChartCard
          title="Pomodoros concluídos"
          total={String(totals.cycles)}
          totalCaption="no período selecionado"
        >
          <StatBarChart data={data} metric="cycles" />
        </ChartCard>

        <ChartCard
          title="Tempo total de foco"
          total={formatFocus(totals.focusSeconds)}
          totalCaption="no período selecionado"
        >
          <StatBarChart data={data} metric="focusSeconds" />
        </ChartCard>
      </div>
    </section>
  );
}
