import React from "react";
import Header from "../../components/Header/Header";
import styles from "./About.module.css";

const About: React.FC = () => {
  return (
    <div className={styles.About}>
      <Header></Header>
    </div>
  );
};

export default About;
