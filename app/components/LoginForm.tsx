"use client";

import { useEffect, useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import "../login/styles/login-right-side.css";
import { api } from "../services/api";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth";
import axios from "axios";
import { ToastContainer, toast, Bounce, type ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const toastOptions: ToastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
  transition: Bounce,
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { signIn, isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace("/");
    }
  }, [isLoading, isLoggedIn, router]);

  async function handleSubmitLogin() {
    if (!email || !password) {
      toast.error("Preencha o e-mail e a senha!", toastOptions);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      signIn(response.data.access_token, remember);
      router.push("/");
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;

      const message =
        status === 401 || status === 404
          ? "E-mail ou senha incorretos!"
          : "Erro ao fazer login. Tente novamente!";

      toast.error(message, toastOptions);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
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

        <button
          className="button-enter"
          onClick={handleSubmitLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
          <ArrowRight size={20} color="#FFFFFF" />
        </button>

        <div className="register-row">
          <p>Não tem uma conta ainda?</p>
          <a href="/register" className="register-link">
            Registre-se
          </a>
        </div>
      </div>

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
        transition={Bounce}
      />
    </>
  );
}
