import { Link } from "react-router-dom";
import styles from "./Thumbnail.module.css";
import { ThumbnailDataType } from "../../types/ThumbnailDataType";

const Thumbnail = ({ title, imageUrl, pathName }: ThumbnailDataType) => {
  return (
    <div className={styles.Thumbnail}>
      <Link to={pathName} className={styles.link}>
        <img src={imageUrl} alt="thumbnail" />
        <div className={styles.title}>{title}</div>
      </Link>
    </div>
  );
};

export default Thumbnail;
