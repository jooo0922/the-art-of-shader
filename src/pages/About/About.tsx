import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import styles from "./About.module.css";

const About: React.FC = () => {
  return (
    <div className={styles.About}>
      <Header></Header>
      <div className={styles.Content}></div>
      <Footer></Footer>
    </div>
  );
};

export default About;
