import React from "react";
import Header from "../../components/Header/Header";
import styles from "./Main.module.css";

const Main: React.FC = () => {
  return (
    <div className={styles.Main}>
      <Header></Header>
    </div>
  );
};

export default Main;
