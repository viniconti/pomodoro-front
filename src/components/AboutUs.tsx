"use client";

import { AlarmClockCheck, Clock } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "../services/api";

interface CycleStats {
  totalCycles: number;
  totalFocusSeconds: number;
}

const STATS_INICIAIS: CycleStats = {
  totalCycles: 0,
  totalFocusSeconds: 0,
};

interface AboutUsProps {
  refreshKey?: number;
}

export function AboutUs({ refreshKey = 0 }: AboutUsProps) {
  const [stats, setStats] = useState<CycleStats>(STATS_INICIAIS);

  useEffect(() => {
    let ativo = true;

    api
      .get<CycleStats>("/cycle-history/stats")
      .then((response) => {
        if (ativo) {
          setStats(response.data);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar estatísticas:", error);
      });

    return () => {
      ativo = false;
    };
  }, [refreshKey]);

  const horas = Math.floor(stats.totalFocusSeconds / 3600);
  const minutos = Math.floor((stats.totalFocusSeconds % 3600) / 60);

  return (
    <div id="sobre-nos" className="container-footer">
      <div className="top-footer">
        {/* COLUNA ESQUERDA */}
        <div className="left-footer">
          <Image
            src="/pomodoroHome.png"
            alt="Pomodoro"
            width={260}
            height={160}
          />

          <div className="description-footer">
            <p>Menos distração, mais foco.</p>
            <p>Um pomodoro de cada vez.</p>
          </div>
        </div>

        {/* COLUNA CENTRAL */}
        <div className="mid-footer">
          <h3>Navegação</h3>

          <p>Foco</p>
          <p>Relatórios</p>
          <p>Configurações</p>
        </div>

        {/* COLUNA DIREITA */}
        <div className="right-footer">
          <h3>Estatísticas gerais</h3>

          <div className="top-right-footer">
            <AlarmClockCheck
              size={35}
              strokeWidth={1.5}
              color="#FF6200"
            />

            <div className="info-footer">
              <h4>{stats.totalCycles}</h4>
              <p>Pomodoros totais</p>
            </div>
          </div>

          <div className="line-footer"></div>

          <div className="bottom-right-footer">
            <Clock
              size={35}
              strokeWidth={1.5}
              color="#FF6200"
            />

            <div className="info-footer">
              <h4>
                {horas}h {minutos}m
              </h4>
              <p>Tempo total de foco</p>
            </div>
          </div>
        </div>
      </div>

      {/* RODAPÉ */}
      <p className="copyright-footer">
        ©Pomodoro, todos os direitos reservados.
      </p>
    </div>
  );
}
