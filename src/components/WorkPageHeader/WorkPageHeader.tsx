import Logo from "../Logo/Logo";
import BackBtn from "../BackBtn/BackBtn";
import styles from "./WorkPageHeader.module.css";

const WorkPageHeader = () => {
  return (
    <header className={styles.WorkPageHeader}>
      <Logo></Logo>
      <BackBtn></BackBtn>
    </header>
  );
};

export default WorkPageHeader;
