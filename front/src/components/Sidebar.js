import React from "react";
import { FaHome, FaHistory, FaCog, FaSignOutAlt } from "react-icons/fa";
import "../App.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar-drawer ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        {isOpen ? <span className="sidebar-title">Meu App</span> : null}
        <div className="sidebar-logo">⚡</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-item">
          <FaHome size={20} />
          <span>Início</span>
        </div>
        <div className="sidebar-item">
          <FaHistory size={20} />
          <span>Histórico</span>
        </div>
        <div className="sidebar-item">
          <FaCog size={20} />
          <span>Configurações</span>
        </div>
        <div className="sidebar-item">
          <FaSignOutAlt size={20} />
          <span>Sair</span>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
