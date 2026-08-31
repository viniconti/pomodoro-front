import Image from "next/image";
import "./styles/register-left-side.css";
import "./styles/register-right-side.css";

export default function Register() {
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

                    <h1 className="h1-left-side">
                        Crie sua conta aqui
                    </h1>

                    <p className="h3-left-side">
                        Entra na sua conta para continuar
                    </p>

                    <form className="register-form">

                        <div className="inputs-container">

                            <div className="input-group">

                                <label htmlFor="email">
                                    E-mail
                                </label>

                                <div className="input-box">

                                    <span className="input-icon">
                                        ✉
                                    </span>

                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="seuemail@gmail.com"
                                        required
                                    />

                                </div>

                            </div>


                            <div className="input-group">

                                <label htmlFor="senha">
                                    Senha
                                </label>

                                <div className="input-box">

                                    <span className="input-icon">
                                        ♙
                                    </span>

                                    <input
                                        id="senha"
                                        type="password"
                                        placeholder="Sua senha"
                                        required
                                    />

                                </div>

                            </div>


                            <div className="input-group">

                                <label htmlFor="confirmar-senha">
                                    Confirmar senha
                                </label>

                                <div className="input-box">

                                    <span className="input-icon">
                                        ♙
                                    </span>

                                    <input
                                        id="confirmar-senha"
                                        type="password"
                                        placeholder="Sua senha"
                                        required
                                    />

                                </div>

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="button-left-side"
                        >
                            Cadastrar
                            <span>→</span>
                        </button>

                    </form>


                    <p className="login-left">
                        Já tem uma conta?

                        <a href="/login">
                            Entrar
                        </a>
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
                            Organize sua rotina e gerencie o seu tempo
                            tendo maior eficiência e produtividade em suas
                            atividades
                        </p>

                    </div>


                    <a
                        href="/login"
                        className="button-right-box"
                    >
                        <span>
                            Já tem uma conta? <strong>Entrar</strong>
                        </span>

                        <span className="arrow">
                            →
                        </span>
                    </a>

                </div>

            </section>

        </main>
    );
}