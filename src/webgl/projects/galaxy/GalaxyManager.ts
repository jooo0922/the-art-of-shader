import * as THREE from "three";
import WebGLContent from "./WebGLContent";
import Drag from "./Drag";

export default class GalaxyManager {
  private webglContent: WebGLContent;

  private resolution: THREE.Vector2;

  private drag: Drag;

  private requestId: number;

  constructor(canvas: HTMLCanvasElement) {
    this.webglContent = new WebGLContent(canvas);
    this.resolution = new THREE.Vector2();
    this.drag = new Drag(this.resolution);
    this.requestId = 0;
  }

  // 이벤트 관련 메서드
  private on() {
    window.addEventListener("resize", this.resize);

    // 마우스 이벤트핸들러 등록
    window.addEventListener("mousedown", this.onMouseDown, {
      passive: false,
    });
    window.addEventListener("mousemove", this.onMouseMove, {
      passive: false,
    });
    window.addEventListener("mouseup", this.onMouseUp);

    // 터치이벤트 핸들러 등록
    window.addEventListener("touchstart", this.onTouchStart, {
      passive: false,
    });
    window.addEventListener("touchmove", this.onTouchMove, {
      passive: false,
    });
    window.addEventListener("touchend", this.onTouchEnd);
  }

  // 리사이징 메서드
  private resize = () => {
    this.resolution.set(document.body.clientWidth, document.body.clientHeight);
    this.drag.resize(this.resolution);
    this.webglContent.resize(this.resolution);
  };

  // 마우스 이벤트핸들러
  private onMouseDown = (e: MouseEvent) => {
    this.drag.touchStart(e);
  };

  private onMouseMove = (e: MouseEvent) => {
    this.drag.touchMove(e);
  };

  private onMouseUp = (e: MouseEvent) => {
    this.drag.touchEnd(e);
  };

  // 터치 이벤트핸들러
  private onTouchStart = (e: TouchEvent) => {
    this.drag.touchStart(e);
  };

  private onTouchMove = (e: TouchEvent) => {
    this.drag.touchMove(e);
  };

  private onTouchEnd = (e: TouchEvent) => {
    this.drag.touchEnd(e);
  };

  // 업데이트 루프 (데이터 관련)
  private update(t: DOMHighResTimeStamp): void {
    let time = t / 1000; // 초 단위
    this.drag.update();
    this.webglContent.update(time, this.drag);
    this.requestId = requestAnimationFrame(this.update.bind(this));
  }

  // entry point
  async init() {
    await this.webglContent.init();
    this.on();
    this.resize();
    this.update(0);
  }

  public stop(): void {
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("touchstart", this.onTouchStart);
    window.removeEventListener("touchmove", this.onTouchMove);
    window.removeEventListener("touchend", this.onTouchEnd);
    cancelAnimationFrame(this.requestId);
  }

  public cleanup(): void {
    this.webglContent.cleanup();
  }
}
