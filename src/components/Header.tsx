import { IActiveTabs } from "../interfaces/IActiveTabs";

interface HeaderProps {
  setActiveTab: (value: IActiveTabs) => void;
}

export default function Header({ setActiveTab }: HeaderProps) {
  return (
    <header className="navbar-home">
      <div className="links-nav-home">
        <a className="link-home" onClick={() => setActiveTab("focus")}>
          Foco
        </a>

        <a className="link-home" onClick={() => setActiveTab("report")}>
          Relatórios
        </a>

        <a className="link-home">
          Sobre nós
        </a>
      </div>
    </header>
  );
}
