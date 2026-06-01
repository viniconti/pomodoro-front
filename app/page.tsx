"use client";

import { Mail } from "lucide-react";
import { Lock } from "lucide-react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="container">
      {/* LEFT SIDE CONTAINER */}
      <div className="left-side-container">

        <Image
          src="/pomodoro.png"
          alt="Pomodoro" 
          width={160} 
          height={160} 
        />

        <h1 className="h1-left-side">Bem vindo de volta</h1>
        <h3 className="h3-left-side">Entre na sua conta para continuar</h3>

        <div className="inputs-container">
          <div className="input-email">
            <Mail size={20} color="#FFD0B9"/>
             <input placeholder="seuemail@gmail.com" type="email" />
          </div>
          
          <div className="input-password">
            <Lock size={20} color="#FFD0B9"/>
             <input placeholder="Sua senha" type="password" />
          </div>
        </div>
        
        <input type="checkbox" />
        <p>Lembrar-me</p>
        <p>Esqueceu a senha?</p>
        <button></button>
        <p>Não tem uma conta ainda?</p>
        <p>Registrar-se</p>

      </div>

      {/* RIGHT SIDE CONTAINER */}
      <div className="right-side-container">
        <div className="right-box">
          <div className="top-right-box">
            <h1 className="h1-right-box">Olá, bem vindo ao Pomodoro!</h1>
            <div className="trave-right-box"></div>
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
      
    </div>
  );
}
