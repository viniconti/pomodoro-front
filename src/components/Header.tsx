import { IActiveTabs } from "../interfaces/IActiveTabs";

interface HeaderProps {
  setActiveTab: (value: IActiveTabs) => void;
}

export default function Header({ setActiveTab }: HeaderProps) {
  return (
    <header className="navbar-home">
      <div className="links-nav-home">
        <a onClick={() => setActiveTab("focus")} className="link-home">
          Foco
        </a>

        <a onClick={() => setActiveTab("report")} className="link-home">
          Relatórios
        </a>

        <a onClick={() => setActiveTab("about-us")} className="link-home">
          Sobre nós
        </a>
      </div>
    </header>
  );
}
