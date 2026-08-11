"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import "../styles/login-left-side.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  function handleSubmit() {
    console.log({ email, password, remember });
    // aqui vai a chamada pro backend futuramente
  }

  return (
    <div className="inputs-container">
      <div className="input-email">
        <Mail size={20} color="#FFD0B9" />
        <input
          placeholder="seuemail@gmail.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

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
        <button className="register-link">Registrar-se</button>
      </div>
    </div>
  );
}