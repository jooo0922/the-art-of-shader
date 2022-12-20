import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import MainPageTitle from "../../components/MainPageTitle/MainPageTitle";
import MainPageSubtitle from "../../components/MainPageSubtitle/MainPageSubtitle";
import Loader from "../../components/Loader/Loader";
import Thumbnail from "../../components/Thumbnail/Thumbnail";
import THUMBNAIL_DATA from "../../components/Thumbnail/thumbnailData";
import styles from "./Main.module.css";

const Main = () => {
  const [showLoader, setShowLoader] = useState(true);
  const [showPage, setShowPage] = useState(false);
  setTimeout(() => {
    setShowLoader(false);
    setTimeout(() => {
      setShowPage(true);
    }, 500);
  }, 1500);

  return (
    <div className={styles.Main}>
      <AnimatePresence>{showLoader && <Loader></Loader>}</AnimatePresence>
      {showPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              duration: 0.5,
              ease: [0.165, 0.84, 0.44, 1.0],
            },
          }}
        >
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
        </motion.div>
      )}
    </div>
  );
};

export default Main;
