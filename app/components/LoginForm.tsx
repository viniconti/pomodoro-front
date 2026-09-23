"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import "../login/styles/login-right-side.css";
import { api } from "../services/api";
import { redirect } from "next/dist/server/api-utils";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  async function handleSubmit() {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      alert("Login efetuado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao fazer login");
    }
  }

  return (
    <div className="inputs-container">
      <label className="email-label" htmlFor="Email">
        Email
      </label>
      <div className="input-email">
        <Mail size={20} color="#FFD0B9" />
        <input
          placeholder="seuemail@gmail.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <label className="password-label" htmlFor="Password">
        Senha
      </label>
      <div className="input-password">
        <Lock size={20} color="#FFD0B9" />
        <input
          placeholder="Sua senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="remember-row">
        <div className="remember-left">
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <label htmlFor="remember">Lembrar-me</label>
        </div>
        <button className="forgot-password">Esqueceu a senha?</button>
      </div>

      <button className="button-enter" onClick={handleSubmit}>
        Entrar
        <ArrowRight size={20} color="#FFFFFF" />
      </button>

      <div className="register-row">
        <p>Não tem uma conta ainda?</p>
        <a href="/register" className="register-link">
          Registre-se
        </a>
      </div>
    </div>
  );
}
