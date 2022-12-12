import styles from "./AboutPageInfo.module.css";

const AboutPageInfo = () => {
  return (
    <div className={styles.AboutPageInfo}>
      <div className={styles.title}>ABOUT PROJECT</div>
      <p className={styles.paragraph}>
        THIS PROJECT IS <br />
        AN ARCHIVE OF PERSONAL WORKS <br />
        RECREATED WITH GLSL <br />
        FROM ORIGINAL ARTWORKS.
      </p>
      <div className={styles.email}>
        <a href="mailto:jooo0922@gmail.com">JOOO0922@GMAIL.COM</a>
      </div>
      <div className={styles.sns}>
        <a href="https://github.com/jooo0922">GITHUB</a>
        <a href="https://www.linkedin.com/in/jooo0922">LINKEDIN</a>
      </div>
    </div>
  );
};

export default AboutPageInfo;
