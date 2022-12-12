import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import MainPageTitle from "../../components/MainPageTitle/MainPageTitle";
import MainPageSubtitle from "../../components/MainPageSubtitle/MainPageSubtitle";
import Thumbnail from "../../components/Thumbnail/Thumbnail";
import THUMBNAIL_DATA from "./thumbnailData";
import styles from "./Main.module.css";

const Main = () => {
  return (
    <div className={styles.Main}>
      <Header></Header>
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <MainPageTitle></MainPageTitle>
          <MainPageSubtitle></MainPageSubtitle>
        </div>
        <div className={styles.thumbnailContainer}>
          {THUMBNAIL_DATA.map((data, index) => (
            <Thumbnail
              title={data.title}
              imageUrl={data.imageUrl}
              pathName={data.pathName}
              key={index}
            />
          ))}
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Main;
