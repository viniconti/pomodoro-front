import Image from "next/image";
import LoginForm from "./components/LoginForm";
import LoginRightSide from "./components/LoginRightSide";
import "./styles/login-left-side.css";

export default function Home() {
  return (
    <div className="container">

      {/* LEFT SIDE */}
      <div className="left-side-container">
        <div className="logo-wrapper">
          <Image
            src="/pomodoro.png"
            alt="Pomodoro"
            width={160}
            height={160}
          />
        </div>

        <div className="container-top">
          <h1 className="h1-left-side">Bem-vindo de volta</h1>
          <h3 className="h3-left-side">Entra na sua conta para continuar</h3>
        </div>

        <LoginForm />
      </div>

      {/* RIGHT SIDE */}
      <LoginRightSide />

    </div>
  );
}