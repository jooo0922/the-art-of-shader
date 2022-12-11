import React from "react";
import { Link } from "react-router-dom";
import styles from "./AboutBtn.module.css";

const AboutBtn: React.FC = () => {
  return (
    <div className={styles.AboutBtn}>
      <Link to="/about" className={styles.link}>
        ABOUT
      </Link>
    </div>
  );
};

export default AboutBtn;
