"use client";

import Image from "next/image";
import { UserCircle2, LogOut } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/home.css";
import "./styles/reports.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTimer } from "react-timer-hook";
import Header from "../components/Header";
import Focus from "../components/Focus";
import { AboutUs } from "../components/AboutUs";
import { Report } from "../components/Report";
import { useAuth } from "../context/auth";
import { api } from "../services/api";

const CICLO_PADRAO_MINUTOS = 25;

function vencimentoEm(minutos: number) {
  const data = new Date();

  data.setSeconds(data.getSeconds() + minutos * 60);

  return data;
}

export default function Home() {
  const [modo, setModo] = useState("pomodoro");
  const [statsVersion, setStatsVersion] = useState(0);
  const { isLoggedIn, isLoading, signOut } = useAuth();
  const router = useRouter();

  const modoRef = useRef(modo);
  const minutosRef = useRef(CICLO_PADRAO_MINUTOS);
  const startedAtRef = useRef(new Date());
  const cicloIniciadoRef = useRef(false);
  const cicloRegistradoRef = useRef(false);
  const onExpireRef = useRef<() => void>(() => {});

  const [expiryTimestamp] = useState(() =>
    vencimentoEm(CICLO_PADRAO_MINUTOS),
  );

  const { seconds, minutes, isRunning, start, pause, restart } = useTimer({
    expiryTimestamp,
    autoStart: false,
    onExpire: () => onExpireRef.current(),
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  const registrarCiclo = useCallback(async () => {
    const minutos = minutosRef.current;

    // Pausas não são registradas como tempo de foco.
    if (modoRef.current !== "pomodoro" || cicloRegistradoRef.current) {
      restart(vencimentoEm(minutos), false);
      return;
    }

    cicloRegistradoRef.current = true;

    try {
      await api.post("/cycle-history", {
        startedAt: startedAtRef.current.toISOString(),
        finishedAt: new Date().toISOString(),
      });

      setStatsVersion((version) => version + 1);
      toast.success("Ciclo Pomodoro registrado!");
    } catch (error) {
      cicloRegistradoRef.current = false;
      console.error("Erro ao registrar o ciclo:", error);
      toast.error("Não foi possível salvar o ciclo.");
    } finally {
      cicloIniciadoRef.current = false;
      restart(vencimentoEm(minutos), false);
    }
  }, [restart]);

  useEffect(() => {
    onExpireRef.current = registrarCiclo;
  }, [registrarCiclo]);

  function alternarTimer() {
    if (isRunning) {
      pause();
      return;
    }

    if (modoRef.current === "pomodoro" && !cicloIniciadoRef.current) {
      startedAtRef.current = new Date();
      cicloIniciadoRef.current = true;
      cicloRegistradoRef.current = false;
    }

    start();
  }

  function trocarModo(novoModo: string, minutos: number) {
    setModo(novoModo);
    modoRef.current = novoModo;
    minutosRef.current = minutos;
    startedAtRef.current = new Date();
    cicloIniciadoRef.current = false;
    cicloRegistradoRef.current = false;

    restart(vencimentoEm(minutos), false);
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

        <Header />

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

      <Focus
        modo={modo}
        minutes={minutes}
        seconds={seconds}
        trocarModo={trocarModo}
        isRunning={isRunning}
        alternarTimer={alternarTimer}
      />

      <Report refreshKey={statsVersion} />

      <AboutUs refreshKey={statsVersion} />

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
