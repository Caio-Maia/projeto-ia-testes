import React from "react";
import { FaBars } from "react-icons/fa";
import "../App.css";

const Header = ({ toggleSidebar }) => {
  return (
    <header className="app-header">
      <button className="header-toggle-btn" onClick={toggleSidebar}>
        <FaBars size={20} />
      </button>
      <h1 className="header-title">Meu App</h1>
      <nav className="header-nav">
        <a href="/">Home</a>
        <a href="/sobre">Sobre</a>
        <a href="/contato">Contato</a>
      </nav>
    </header>
  );
};

export default Header;