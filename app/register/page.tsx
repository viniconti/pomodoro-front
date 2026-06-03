"use client";

import { Mail } from "lucide-react";
import { Lock } from "lucide-react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import "./styles/register-left-side.css"
import "./styles/register-right-side.css"

export default function Register() {
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

                <h1 className="h1-left-side">Crie a sua conta</h1>
                <h3 className="h3-left-side">Preencha os dados abaixo para se regitrar</h3>

                <div className="inputs-container">
                    <div className="input-email">
                        <Mail size={20} color="#FFD0B9" />
                        <input placeholder="seuemail@gmail.com" type="email" />
                    </div>

                    <div className="input-password">
                        <Lock size={20} color="#FFD0B9" />
                        <input placeholder="Sua senha" type="password" />
                    </div>

                    <div className="input-confirm-password">
                        <Lock size={20} color="#FFD0B9" />
                        <input placeholder="Confirme sua senha" type="password" />
                    </div>
                </div>

                <button className="button-left-side">Cadastrar  <ArrowRight size={20} color="#FFFFFF" /></button>
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
                        Ja tem uma conta? <strong>Entrar</strong>
                        <ArrowRight size={20} color="#FFFFFF" />
                    </button>
                </div>
            </div>

        </div>
    )
}