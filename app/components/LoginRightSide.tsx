import { ArrowRight } from "lucide-react";
import "../styles/login-right-side.css";

export default function LoginRightSide() {
  return (
    <div className="right-side-container">
      <div className="right-box">
        <div className="top-right-box">
          <h1 className="h1-right-box">Olá, Bem vindo ao Pomodoro!</h1>
          <div className="trave-right-box" />
          <h3 className="h3-right-box">
            Organize sua rotina e gerencie o seu tempo tendo maior eficiência
            e produtividade em suas atividades
          </h3>
        </div>
        <button className="button-right-box">
          Registrar-se
          <ArrowRight size={20} color="#FFFFFF" />
        </button>
      </div>
    </div>
  );
}