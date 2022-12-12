import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import AboutPageTitle from "../../components/AboutPageTitle/AboutPageTitle";
import AboutPageInfo from "../../components/AboutPageInfo/AboutPageInfo";
import styles from "./About.module.css";

const About = () => {
  return (
    <div className={styles.About}>
      <Header></Header>
      <div className={styles.content}>
        <AboutPageTitle></AboutPageTitle>
        <AboutPageInfo></AboutPageInfo>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default About;
