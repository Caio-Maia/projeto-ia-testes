import React from "react";
import "../App.css";

const Footer = () => {
  return (
    <footer className="footer-responsive">
      <p>
      Created by <a href="https://github.com/Caio-Maia">Caio Maia</a> © {new Date().getFullYear()}
      </p>
    </footer>
  );
};

export default Footer;