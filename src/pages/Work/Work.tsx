import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import WebGLManager from "../../webgl/WebGLManager";
import styles from "./Work.module.css";

const Work = () => {
  const canvasRef = useRef(null);
  const location = useLocation();
  useEffect(() => {
    async function initWebGL(): Promise<void> {
      const canvas = canvasRef.current;
      const webglManager = new WebGLManager(canvas);
      webglManager.setPathName(location.pathname);
      await webglManager.init();
    }
    initWebGL();
  });

  return (
    <div className={styles.Work}>
      <canvas ref={canvasRef} className={styles.webglCanvas}></canvas>
    </div>
  );
};

export default Work;
