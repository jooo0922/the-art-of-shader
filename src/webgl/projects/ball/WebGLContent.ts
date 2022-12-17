import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import Camera from "./Camera";
import CameraAura from "./CameraAura";
import AuraBall from "./AuraBall";
import Background from "./Background";
import Drag from "./Drag";
import { ResourceTracker } from "../../utils/ResourceTracker";

export default class WebGLContent {
  renderer: THREE.WebGLRenderer;

  scene: THREE.Scene;

  sceneAura: THREE.Scene; // 렌더타겟 렌더링 시 사용할 scene

  camera: Camera;

  cameraAura: CameraAura; // 렌더타겟 렌더링 시 사용할 camera

  auraBall: AuraBall;

  background: Background;

  resourceTracker: ResourceTracker;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: canvas,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 1.0);

    this.resourceTracker = new ResourceTracker();

    this.scene = new THREE.Scene();
    this.sceneAura = new THREE.Scene();
    this.camera = new Camera();
    this.cameraAura = new CameraAura();
    this.auraBall = new AuraBall(this.resourceTracker);
    this.background = new Background();
  }

  // 리사이징 메서드
  resize(resolution: THREE.Vector2): void {
    this.renderer.setSize(resolution.x, resolution.y);
    this.camera.resize(resolution);
    this.auraBall.resize(resolution);
  }

  // 렌더링 루프 (렌더링 객체 관련)
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // 업데이트 루프 (데이터 관련)
  update(time: number, drag: Drag): void {
    this.camera.update(time);
    this.cameraAura.update(this.camera);

    this.auraBall.update(
      time,
      this.renderer,
      this.camera,
      this.sceneAura,
      this.cameraAura,
      drag
    );
    this.background.update();

    this.render();
  }

  async init() {
    const objLoader = new OBJLoader();
    const texLoader = new THREE.TextureLoader();
    await Promise.all([
      objLoader.loadAsync("./models/ball/volleyball.obj"),
      texLoader.loadAsync("./images/noise/noise1.png"),
    ]).then((response) => {
      const ballGeometry = (response[0].children[0] as THREE.Mesh).geometry;
      const noiseTex = response[1];

      noiseTex.wrapS = THREE.RepeatWrapping;
      noiseTex.wrapT = THREE.RepeatWrapping;

      this.camera.init();
      this.cameraAura.init();

      this.auraBall.init(ballGeometry, noiseTex);
      this.background.init();

      this.scene.add(this.auraBall);
      this.scene.add(this.background);

      this.resourceTracker.track(this.scene);
      this.resourceTracker.track(this.sceneAura);
      this.resourceTracker.track(this.background);
    });
  }

  public cleanup(): void {
    this.resourceTracker.dispose();
  }
}
