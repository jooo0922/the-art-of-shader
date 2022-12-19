import { useState, useEffect } from "react";
import Logo from "../Logo/Logo";
import AboutBtn from "../AboutBtn/AboutBtn";
import styles from "./Header.module.css";

const Header = () => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let prevScrollY = window.scrollY;
    const onScroll = (e: Event) => {
      const curScrollY = window.scrollY;
      if (curScrollY === 0 || curScrollY < prevScrollY) {
        setHide(false); // scroll top || scroll up
      } else {
        setHide(true); // scroll down
      }
      prevScrollY = curScrollY;
    };

    window.addEventListener("scroll", onScroll, false);

    return () => {
      window.removeEventListener("scroll", onScroll, false);
    };
  }, []);

  return (
    <header className={`${styles.Header} ${hide ? styles.hide : null}`}>
      <Logo></Logo>
      <AboutBtn></AboutBtn>
    </header>
  );
};

export default Header;
