import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import styles from "./Main.module.css";

const Main: React.FC = () => {
  return (
    <div className={styles.Main}>
      <Header></Header>
      <div className={styles.Content}></div>
      <Footer></Footer>
    </div>
  );
};

export default Main;
