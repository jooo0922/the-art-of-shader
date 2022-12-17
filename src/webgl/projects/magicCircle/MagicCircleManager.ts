import * as THREE from "three";
import WebGLContent from "./WebGLContent";

export default class MagicCircleManager {
  private webglContent: WebGLContent;

  private resolution: THREE.Vector2;

  constructor(canvas: HTMLCanvasElement) {
    this.webglContent = new WebGLContent(canvas);
    this.resolution = new THREE.Vector2();
  }

  // 이벤트 관련 메서드
  private on() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  // 리사이징 메서드
  private resize(): void {
    this.resolution.set(document.body.clientWidth, document.body.clientHeight);
    this.webglContent.resize(this.resolution);
  }

  // 업데이트 루프 (데이터 관련)
  private update(t: DOMHighResTimeStamp): void {
    let time = t / 1000; // 초 단위
    this.webglContent.update(time);
    requestAnimationFrame(this.update.bind(this));
  }

  // entry point
  async init() {
    await this.webglContent.init();
    this.on();
    this.resize();
    this.update(0);
  }

  public cleanup(): void {
    this.webglContent.cleanup();
  }
}
