import * as THREE from "three";
import BloomPostEffect from "./BloomPostEffect";
import BlurPostEffect from "./BlurPostEffect";
import BrightPostEffect from "./BrightPostEffect";
import Camera from "./Camera";
import Drag from "./Drag";
import Points from "./Points";
import { ResourceTracker } from "../../utils/ResourceTracker";

export default class WebGLContent {
  renderer: THREE.WebGLRenderer;

  scene: THREE.Scene;

  rtScene: THREE.Scene;

  camera: THREE.OrthographicCamera;

  rtCamera: Camera;

  points: Points;

  renderTarget1: THREE.WebGLRenderTarget;

  renderTarget2: THREE.WebGLRenderTarget;

  renderTarget3: THREE.WebGLRenderTarget;

  renderTarget4: THREE.WebGLRenderTarget;

  brightPostEffect: BrightPostEffect;

  blurPostEffectX: BlurPostEffect;

  blurPostEffectY: BlurPostEffect;

  bloomPostEffect: BloomPostEffect;

  resourceTracker: ResourceTracker;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: canvas,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // 각각의 렌더타겟은 postEffect, 즉, 후처리에 사용하는 렌더타겟이므로, 윈도우 사이즈(=캔버스 사이즈)와 항상 동일해야 함.
    this.renderTarget1 = new THREE.WebGLRenderTarget(
      document.body.clientWidth,
      document.body.clientHeight
    );
    this.renderTarget2 = new THREE.WebGLRenderTarget(
      document.body.clientWidth,
      document.body.clientHeight
    );
    this.renderTarget3 = new THREE.WebGLRenderTarget(
      document.body.clientWidth,
      document.body.clientHeight
    );
    this.renderTarget4 = new THREE.WebGLRenderTarget(
      document.body.clientWidth,
      document.body.clientHeight
    );

    this.scene = new THREE.Scene(); // 렌더타겟 텍스쳐가 입혀진 평면을 담는 scene
    this.rtScene = new THREE.Scene(); // 렌더타겟에 그리는 실제 Points 를 담는 scene
    this.rtScene.background = new THREE.Color(0, 0, 0);
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); // 렌더타겟 텍스쳐가 입혀진 평면을 촬영하는 orthographic 카메라
    this.rtCamera = new Camera(); // 렌더타겟에 그리는 실제 Points 를 촬영하는 perspective 카메라
    this.points = new Points();

    this.brightPostEffect = new BrightPostEffect();
    this.blurPostEffectX = new BlurPostEffect();
    this.blurPostEffectY = new BlurPostEffect();
    this.bloomPostEffect = new BloomPostEffect();

    this.resourceTracker = new ResourceTracker();
  }

  // 리사이징 메서드
  resize(resolution: THREE.Vector2): void {
    this.renderer.setSize(resolution.x, resolution.y);
    // 후처리에 사용되는 렌더타겟의 사이즈는 캔버스 사이즈와 항상 동일해야 하므로, 리사이징할 때 똑같이 맞춰줄 것.
    this.renderTarget1.setSize(resolution.x, resolution.y);
    this.renderTarget2.setSize(resolution.x, resolution.y);
    this.renderTarget3.setSize(resolution.x, resolution.y);

    this.rtCamera.resize(resolution);
    this.points.resize(resolution);

    this.blurPostEffectX.resize(resolution);
    this.blurPostEffectY.resize(resolution);
  }

  // 렌더링 루프 (렌더링 객체 관련)
  render() {
    // BrightPostEffect 후처리에 사용할 렌더타겟 텍스쳐 렌더링
    this.renderer.setRenderTarget(this.renderTarget1); // 1번 렌더타겟 지정
    this.renderer.render(this.rtScene, this.rtCamera); // BrightPostEffect 에서 사용할 렌더타겟 텍스쳐 렌더링

    // BlurPostEffectX 후처리에 사용할 렌더타겟 텍스쳐 렌더링
    this.renderer.setRenderTarget(this.renderTarget2); // 2번 렌더타겟 지정
    this.scene.add(this.brightPostEffect); // BrightPostEffect 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에 추가
    this.renderer.render(this.scene, this.camera); // BrightPostEffect 의 렌더타겟 텍스쳐가 입혀진 평면을 렌더링
    this.scene.remove(this.brightPostEffect); // BrightPostEffect 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에서 제거

    // BlurPostEffectY 후처리에 사용할 렌더타겟 텍스쳐 렌더링
    this.renderer.setRenderTarget(this.renderTarget3); // 3번 렌더타겟 지정
    this.scene.add(this.blurPostEffectX); // BlurPostEffectX 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에 추가
    this.renderer.render(this.scene, this.camera); // BlurPostEffectX 의 렌더타겟 텍스쳐가 입혀진 평면을 렌더링
    this.scene.remove(this.blurPostEffectX); // BlurPostEffectX 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에서 제거

    // BloomPostEffect 후처리에 사용할 렌더타겟 텍스쳐 렌더링
    this.renderer.setRenderTarget(this.renderTarget4); // 4번 렌더타겟 지정
    this.scene.add(this.blurPostEffectY); // BlurPostEffectY 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에 추가
    this.renderer.render(this.scene, this.camera); // BlurPostEffectY 의 렌더타겟 텍스쳐가 입혀진 평면을 렌더링
    this.scene.remove(this.blurPostEffectY); // BlurPostEffectY 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에서 제거

    // 최종 후처리 평면 렌더링
    this.renderer.setRenderTarget(null); // 렌더타겟을 원래 캔버스로 복구
    this.scene.add(this.bloomPostEffect); // bloomPostEffect 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에 추가
    this.renderer.render(this.scene, this.camera); // bloomPostEffect 의 렌더타겟 텍스쳐가 입혀진 평면을 렌더링 -> 최종적으로 화면에 그려줄 평면
    this.scene.remove(this.bloomPostEffect); // bloomPostEffect 의 렌더타겟 텍스쳐가 입혀진 평면을 scene 에서 제거
  }

  // 업데이트 루프 (데이터 관련)
  update(time: number, drag: Drag): void {
    this.rtCamera.update(time);

    this.points.update(time, drag);

    this.render();
  }

  async init() {
    this.rtCamera.init();

    this.rtScene.add(this.points); // 실제 Points 가 찍히는 렌더타겟 씬에 Points 를 넣어줌.

    this.points.init();

    this.brightPostEffect.setTexture(this.renderTarget1.texture); // BrightPostEffect 에 1번 렌더타겟 텍스쳐 지정
    this.blurPostEffectX.setTexture(this.renderTarget2.texture); // BlurPostEffectX 에 2번 렌더타겟 텍스쳐 지정
    this.blurPostEffectY.setTexture(this.renderTarget3.texture); // BlurPostEffectY 에 3번 렌더타겟 텍스쳐 지정
    this.bloomPostEffect.setTexture(
      this.renderTarget1.texture, // 맨 처음에 아무런 postEffect 도 적용되지 않은 렌더타겟 텍스쳐
      this.renderTarget4.texture // Bloom 을 제외한 여태까지 모든 postEffect 가 적용된 렌더타겟 텍스쳐
    ); // BloomPostEffect 에 4번 렌더타겟 텍스쳐 지정

    this.blurPostEffectX.setDirection(1, 0); // 가로방향 가우시안 블러를 적용시키는 postEffect 평면
    this.blurPostEffectY.setDirection(0, 1); // 세로방향 가우시안 블러를 적용시키는 postEffect 평면

    this.resourceTracker.track(this.scene);
    this.resourceTracker.track(this.rtScene);
    this.resourceTracker.track(this.points);
    this.resourceTracker.track(this.renderTarget1);
    this.resourceTracker.track(this.renderTarget2);
    this.resourceTracker.track(this.renderTarget3);
    this.resourceTracker.track(this.renderTarget4);
    this.resourceTracker.track(this.brightPostEffect);
    this.resourceTracker.track(this.blurPostEffectX);
    this.resourceTracker.track(this.blurPostEffectY);
    this.resourceTracker.track(this.bloomPostEffect);
  }

  public cleanup(): void {
    this.resourceTracker.dispose();
  }
}
