"use client";

import Image from "next/image";
import { UserCircle2, LogOut } from "lucide-react";
import "./styles/home.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTimer } from "react-timer-hook";
import Header from "../components/Header";
import { IActiveTabs } from "../interfaces/IActiveTabs";
import Focus from "../components/Focus";
import { AboutUs } from "../components/AboutUs";
import { Report } from "../components/Report";
import { useAuth } from "../context/auth";

export default function Home() {
  const [modo, setModo] = useState("pomodoro");
  const [activeTab, setActiveTab] = useState<IActiveTabs>("focus");
  const { isLoggedIn, isLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  const tempoInicial = new Date();

  tempoInicial.setSeconds(tempoInicial.getSeconds() + 25 * 60);

  const { seconds, minutes, start, restart } = useTimer({
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

  if (isLoading || !isLoggedIn) {
    return null;
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

        <Header setActiveTab={setActiveTab} />

        <button
          className="logout-home"
          type="button"
          onClick={signOut}
          title="Sair da conta"
          aria-label="Sair da conta"
        >
          <LogOut size={32} strokeWidth={1.5} />
        </button>

        <a className="perfil-home" href="#perfil">
          <UserCircle2 size={50} strokeWidth={1.5} />
        </a>
      </nav>

      {activeTab == "focus" && (
        <Focus
          modo={modo}
          minutes={minutes}
          seconds={seconds}
          trocarModo={trocarModo}
          iniciarTimer={iniciarTimer}
        />
      )}

      {activeTab == "report" && <Report />}

      {activeTab == "about-us" && <AboutUs />}
    </div>
  );
}
