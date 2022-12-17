import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import WorkPageHeader from "../../components/WorkPageHeader/WorkPageHeader";
import WorkPageInfo from "../../components/WorkPageInfo/WorkPageInfo";
import WebGLManager from "../../webgl/WebGLManager";
import styles from "./Work.module.css";

const Work = () => {
  const canvasRef = useRef(null);
  const location = useLocation();
  useEffect(() => {
    let webglManager: WebGLManager;
    async function initWebGL(): Promise<void> {
      const canvas: HTMLCanvasElement | null = canvasRef.current;
      if (canvas) webglManager = new WebGLManager(canvas);
      webglManager.setManager(location.pathname);
      await webglManager.init();
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
      <WorkPageInfo pathName={location.pathname}></WorkPageInfo>
      <canvas ref={canvasRef} className={styles.webglCanvas}></canvas>
    </div>
  );
};

export default Work;
