import React from "react";
import styles from "./Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.Footer}>
      <div>SEOUL, REPUBLIC OF KOREA</div>
      <div>&copy; 2022. CHA JOOYEONG ALL RIGHTS RESERVED</div>
    </footer>
  );
};

export default Footer;
