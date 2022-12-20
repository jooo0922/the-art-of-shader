import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Thumbnail.module.css";
import { ThumbnailDataType } from "../../types/ThumbnailDataType";

const Thumbnail = ({ title, imageUrl, pathName }: ThumbnailDataType) => {
  return (
    <motion.div
      className={styles.Thumbnail}
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link to={pathName} className={styles.link}>
        <img src={imageUrl} alt="thumbnail" />
        <div className={styles.title}>{title}</div>
      </Link>
    </motion.div>
  );
};

export default Thumbnail;
