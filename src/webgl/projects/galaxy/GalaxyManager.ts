import * as THREE from "three";
import WebGLContent from "./WebGLContent";
import Drag from "./Drag";

export default class GalaxyManager {
  private webglContent: WebGLContent;

  private resolution: THREE.Vector2;

  private drag: Drag;

  constructor(canvas: HTMLCanvasElement) {
    this.webglContent = new WebGLContent(canvas);
    this.resolution = new THREE.Vector2();
    this.drag = new Drag(this.resolution);
  }

  // 이벤트 관련 메서드
  private on() {
    window.addEventListener("resize", this.resize.bind(this));

    // 마우스 이벤트핸들러 등록
    window.addEventListener("mousedown", this.onMouseDown.bind(this), {
      passive: false,
    });
    window.addEventListener("mousemove", this.onMouseMove.bind(this), {
      passive: false,
    });
    window.addEventListener("mouseup", this.onMouseUp.bind(this));

    // 터치이벤트 핸들러 등록
    window.addEventListener("touchstart", this.onTouchStart.bind(this), {
      passive: false,
    });
    window.addEventListener("touchmove", this.onTouchMove.bind(this), {
      passive: false,
    });
    window.addEventListener("touchend", this.onTouchEnd.bind(this));
  }

  // 리사이징 메서드
  private resize(): void {
    this.resolution.set(document.body.clientWidth, document.body.clientHeight);
    this.drag.resize(this.resolution);
    this.webglContent.resize(this.resolution);
  }

  // 마우스 이벤트핸들러
  private onMouseDown(e: MouseEvent) {
    this.drag.touchStart(e);
  }

  private onMouseMove(e: MouseEvent) {
    this.drag.touchMove(e);
  }

  private onMouseUp(e: MouseEvent) {
    this.drag.touchEnd(e);
  }

  // 터치 이벤트핸들러
  private onTouchStart(e: TouchEvent): void {
    this.drag.touchStart(e);
  }

  private onTouchMove(e: TouchEvent): void {
    this.drag.touchMove(e);
  }

  private onTouchEnd(e: TouchEvent): void {
    this.drag.touchEnd(e);
  }

  // 업데이트 루프 (데이터 관련)
  private update(t: DOMHighResTimeStamp): void {
    let time = t / 1000; // 초 단위
    this.drag.update();
    this.webglContent.update(time, this.drag);
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
