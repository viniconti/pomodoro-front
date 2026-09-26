"use client";

import Image from "next/image";
import { UserCircle2, AlarmClockCheck, Settings2 } from "lucide-react";
import "./styles/home.css";
import { useState } from "react";
import { useTimer } from "react-timer-hook";
import { FaPlay } from "react-icons/fa";

export default function Home() {
  const [modo, setModo] = useState("pomodoro");

  const tempoInicial = new Date();

  tempoInicial.setSeconds(tempoInicial.getSeconds() + 25 * 60);

  const { seconds, minutes, isRunning, start, pause, restart } = useTimer({
    expiryTimestamp: tempoInicial,
    autoStart: false,
  });

  function iniciarTimer() {
    start();
  }

  function trocarModo(novoModo: string, minutos: number) {
    setModo(novoModo);

    const novoTempo = new Date();
    novoTempo.setSeconds(novoTempo.getSeconds() + minutos * 60);

    restart(novoTempo, false);
  }

  return (
    <div className="container-geral-home">
      {/* navbar-home */}
      <nav className="navbar-home">
        <a className="logo-home" href="#foco">
          <Image
            src="/pomodoroHome.png"
            alt="Pomodoro"
            width={166}
            height={109}
          />
        </a>

        <div className="navbar-home">
          <div className="links-nav-home">
            <a className="link-home" href="#foco">
              Foco
            </a>

            <a className="link-home" href="#relatorios">
              Relatórios
            </a>

            <a className="link-home" href="#configuracoes">
              Configurações
            </a>
          </div>
        </div>

        <a className="perfil-home" href="#perfil">
          <UserCircle2 size={50} strokeWidth={1.5} />
        </a>
      </nav>

      {/* foco-home */}
      <div id="foco" className="foco-home-container">
        <div className="pomodoro-foco">
          <div
            className={`opcao-foco ${modo === "pomodoro" ? "ativo" : ""}`}
            onClick={() => trocarModo("pomodoro", 25)}
          >
            <h3 className="foco-pomodoro-home">Pomodoro</h3>
          </div>

          <div
            className={`opcao-foco ${modo === "short-break" ? "ativo" : ""}`}
            onClick={() => trocarModo("short-break", 5)}
          >
            <h3 className="short-break-pomodoro-home">Short break</h3>
          </div>

          <div
            className={`opcao-foco ${modo === "long-break" ? "ativo" : ""}`}
            onClick={() => trocarModo("long-break", 15)}
          >
            <h3 className="long-break-pomodoro-home">Long break</h3>
          </div>
        </div>

        {/* Timer-home */}
        <div className="timer-config-home">
          <div className="hora-de-focar">
            <AlarmClockCheck size={44} strokeWidth={1} color="#FF6200" />
            <h3>Hora de focar</h3>
          </div>

          <div className="timer">
            <span>{String(minutes).padStart(2, "0")}</span>

            <span>:</span>

            <span>{String(seconds).padStart(2, "0")}</span>
          </div>
          <div onClick={iniciarTimer} className="button-timer">
            <FaPlay size={24} />
            <h3>Iniciar</h3>
          </div>

          <div className="config-timer-home">
            <Settings2 size={41} strokeWidth={1} />
            <h3>Configurar ciclo</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
