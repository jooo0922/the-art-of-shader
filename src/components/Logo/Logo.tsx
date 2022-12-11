import React from "react";
import { Link } from "react-router-dom";
import styles from "./Logo.module.css";

const Logo: React.FC = () => {
  return (
    <div className={styles.Logo}>
      <Link to="/" className={styles.Link}>
        TAOS
      </Link>
    </div>
  );
};

export default Logo;
