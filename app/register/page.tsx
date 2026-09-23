"use client";

import Image from "next/image";
import "./styles/register-left-side.css";
import "./styles/register-right-side.css";
import { Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { api } from "../services/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  async function handleSubmit() {
    if (password !== confirmPassword) {
      alert("As senhas devem ser iguais");
      return;
    }

    try {
      const response = await api.post("/users", {
        email,
        password,
        name,
      });

      console.log(response.data);
      alert("Usuário criado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar o usuário");
    }
  }

  return (
    <main className="container">
      {/* LADO ESQUERDO */}
      <section className="left-side-container">
        <div className="left-content">
          <Image
            src="/pomodoro.png"
            alt="Logo Pomodoro"
            width={160}
            height={160}
            className="logo"
          />

          <h1 className="h1-left-side">Crie sua conta aqui</h1>

          <p className="h3-left-side">
            Entra na sua conta para continuar
          </p>

          <form className="register-form">
            <div className="inputs-container">
              <div className="input-group">
                <label htmlFor="email">E-mail</label>

                <div className="input-box">
                  <Mail size={20} color="#FFD0B9" />

                  <input
                    placeholder="seuemail@gmail.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="name">Seu nome</label>

                <div className="input-box">
                  <User size={20} color="#FFD0B9" />

                  <input
                    placeholder="Seu nome"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="register-password" htmlFor="senha">
                  Senha
                </label>

                <div className="input-box">
                  <Lock size={20} color="#FFD0B9" />

                  <input
                    placeholder="Sua senha"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="confirmar-senha">
                  Confirmar senha
                </label>

                <div className="input-box">
                  <Lock size={20} color="#FFD0B9" />

                  <input
                    placeholder="confirme sua senha"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              type="button"
              className="button-left-side"
            >
              Cadastrar
              <span>→</span>
            </button>
          </form>

          <p className="login-left">
            Já tem uma conta?
            <a href="/login">Entrar</a>
          </p>
        </div>
      </section>

      {/* LADO DIREITO */}
      <section className="right-side-container">
        <div className="right-box">
          <div className="top-right-box">
            <h1 className="h1-right-box">
              Olá, Bem vindo ao Pomodoro!
            </h1>

            <div className="trave-right-box"></div>

            <p className="h3-right-box">
              Organize sua rotina e gerencie o seu tempo tendo maior
              eficiência e produtividade em suas atividades
            </p>
          </div>

          <a href="/login" className="button-right-box">
            <span>
              Já tem uma conta? <strong>Entrar</strong>
            </span>

            <span className="arrow">→</span>
          </a>
        </div>
      </section>
    </main>
  );
}