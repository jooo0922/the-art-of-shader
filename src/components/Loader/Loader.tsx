import { motion } from "framer-motion";
import styles from "./Loader.module.css";

const Loader = () => {
  return (
    <motion.div
      className={styles.Loader}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.5,
          ease: [0.165, 0.84, 0.44, 1.0],
        },
      }}
    >
      TAOS
    </motion.div>
  );
};

export default Loader;
