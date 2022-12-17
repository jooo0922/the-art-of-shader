import { Link } from "react-router-dom";
import icon from "../../assets/svg/back.svg";
import styles from "./BackBtn.module.css";

const BackBtn = () => {
  return (
    <div className={styles.BackBtn}>
      <Link to="/" className={styles.link}>
        <div className={styles.container}>
          <img src={icon} alt="icon" />
          <div className={styles.label}>BACK</div>
        </div>
      </Link>
    </div>
  );
};

export default BackBtn;
