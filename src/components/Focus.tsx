import { AlarmClockCheck, Settings2 } from "lucide-react";
import { FaPlay } from "react-icons/fa";

interface FocusProps {
  modo: string;
  minutes: number;
  seconds: number;
  iniciarTimer: () => void;
  trocarModo: (novoModo: string, minutos: number) => void;
}

export default function Focus({
  modo,
  minutes,
  seconds,
  iniciarTimer,
  trocarModo,
}: FocusProps) {
  return (
    <section id="foco" className="foco-home-container">
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
    </section>
  );
}
