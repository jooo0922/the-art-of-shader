import { Link } from "react-router-dom";
import styles from "./Logo.module.css";

const Logo = () => {
  return (
    <div className={styles.Logo}>
      <Link to="/" className={styles.link}>
        TAOS
      </Link>
    </div>
  );
};

export default Logo;
