import Image from "next/image";
import { UserCircle2 } from "lucide-react";

import "./styles/home.css";

export default function Home() {
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
          <h3 className="foco-pomodoro-home">Foco</h3>
          <h3 className="short-break-pomodoro-home">Short break</h3>
          <h3 className="long-break-pomodoro-home">Long break</h3>
        </div>
      </div>
    </div>
  );
}
