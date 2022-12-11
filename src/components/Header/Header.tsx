import React from "react";
import Logo from "../Logo/Logo";
import AboutBtn from "../AboutBtn/AboutBtn";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  return (
    <header className={styles.Header}>
      <Logo></Logo>
      <AboutBtn></AboutBtn>
    </header>
  );
};

export default Header;
