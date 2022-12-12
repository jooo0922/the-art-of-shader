import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import MainPageTitle from "../../components/MainPageTitle/MainPageTitle";
import MainPageSubtitle from "../../components/MainPageSubtitle/MainPageSubtitle";
import styles from "./Main.module.css";

const Main: React.FC = () => {
  return (
    <div className={styles.Main}>
      <Header></Header>
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <MainPageTitle></MainPageTitle>
          <MainPageSubtitle></MainPageSubtitle>
        </div>
        <div className={styles.thumbnailContainer}></div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Main;
