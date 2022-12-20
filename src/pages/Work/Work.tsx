import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import WorkPageHeader from "../../components/WorkPageHeader/WorkPageHeader";
import WorkPageInfo from "../../components/WorkPageInfo/WorkPageInfo";
import Loader from "../../components/Loader/Loader";
import WebGLManager from "../../webgl/WebGLManager";
import styles from "./Work.module.css";

const Work = () => {
  const [showLoader, setShowLoader] = useState(true);
  const canvasRef = useRef(null);
  const location = useLocation();
  useEffect(() => {
    let webglManager: WebGLManager;
    async function initWebGL(): Promise<void> {
      const canvas: HTMLCanvasElement | null = canvasRef.current;
      if (canvas) webglManager = new WebGLManager(canvas);
      webglManager.setManager(location.pathname);
      await webglManager.init();
      setShowLoader(false);
    }
    initWebGL();

    return () => {
      webglManager.stop();
      webglManager.cleanup();
    };
  });

  return (
    <div className={styles.Work}>
      <WorkPageHeader></WorkPageHeader>
      <div className={styles.midContainer}></div>
      <WorkPageInfo pathName={location.pathname}></WorkPageInfo>
      <AnimatePresence>{showLoader && <Loader></Loader>}</AnimatePresence>
      <canvas ref={canvasRef} className={styles.webglCanvas}></canvas>
    </div>
  );
};

export default Work;
