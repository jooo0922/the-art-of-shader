import * as THREE from "three";
import WebGLContent from "./WebGLContent";
import Drag from "./Drag";

export default class BallManager {
  private canvas: HTMLCanvasElement;

  private webglContent: WebGLContent;

  private resolution: THREE.Vector2;

  private drag: Drag;

  private requestId: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.webglContent = new WebGLContent(canvas);
    this.resolution = new THREE.Vector2();
    this.drag = new Drag(this.resolution);
    this.requestId = 0;
  }

  // 이벤트 관련 메서드
  private on() {
    window.addEventListener("resize", this.resize);

    // 마우스 이벤트핸들러 등록
    this.canvas.addEventListener("mousedown", this.onMouseDown, {
      // true 일 경우, 콜백함수 내에 preventDefault() 를 무시함.
      // 명시하지 않을 경우, 기본값은 false 지만,
      // wheel, mousewheel, touchstart, touchmove 이벤트에 한해서는 예외적으로 기본값이 true임.
      /**
       * 이거를 true로 하는 경우는,
       * 일반적으로 이 값이 false 가 됨에 따라
       * 터치 이벤트 등 일부 이벤트 수신기가 스크롤을 처리하는 브라우저 스레드를 block 하고,
       * 이로 인해 스크롤 성능 저하가 발생할 수 있다고 함.
       *
       * 그래서 이러한 스크롤 성능 저하를 방지하기 위해
       * touchmove 등의 터치이벤트에 대해서는
       * passive 기본값을 true 로 지정하여
       * 이벤트 수신기가 스크롤을 처리하는 브라우저 렌더링을 방해하지 않도록 함.
       */
      passive: false,
    });
    this.canvas.addEventListener("mousemove", this.onMouseMove, {
      passive: false,
    });
    this.canvas.addEventListener("mouseup", this.onMouseUp);

    // 터치이벤트 핸들러 등록
    this.canvas.addEventListener("touchstart", this.onTouchStart, {
      passive: false,
    });
    this.canvas.addEventListener("touchmove", this.onTouchMove, {
      passive: false,
    });
    this.canvas.addEventListener("touchend", this.onTouchEnd);
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
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mouseup", this.onMouseUp);
    this.canvas.removeEventListener("touchstart", this.onTouchStart);
    this.canvas.removeEventListener("touchmove", this.onTouchMove);
    this.canvas.removeEventListener("touchend", this.onTouchEnd);
    cancelAnimationFrame(this.requestId);
  }

  public cleanup(): void {
    this.webglContent.cleanup();
  }
}
