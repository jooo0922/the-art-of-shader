import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
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
      webglManager.cleanup();
    };
  });

  return (
    <div className={styles.Work}>
      <canvas ref={canvasRef} className={styles.webglCanvas}></canvas>
    </div>
  );
};

export default Work;
