import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Background from "./Background";
import Camera from "./Camera";
import Water from "./Water";
import { ResourceTracker } from "../../utils/ResourceTracker";

export default class WebGLContent {
  renderer: THREE.WebGLRenderer;

  scene: THREE.Scene;

  camera: Camera;

  water: Water;

  background: Background;

  controls: OrbitControls;

  resourceTracker: ResourceTracker;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: canvas,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.water = new Water();
    this.background = new Background();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.dampingFactor = 0.1;
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;

    this.resourceTracker = new ResourceTracker();
  }

  // 리사이징 메서드
  resize(resolution: THREE.Vector2): void {
    this.renderer.setSize(resolution.x, resolution.y);
    this.camera.resize(resolution);
  }

  // 렌더링 루프 (렌더링 객체 관련)
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // 업데이트 루프 (데이터 관련)
  update(time: number): void {
    this.camera.update(time);

    this.water.update(time);

    this.controls.update();

    this.render();
  }

  async init() {
    const texLoader = new THREE.CubeTextureLoader();
    texLoader
      .setPath("./images/water/cubemap/")
      .load(
        ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
        (texture) => {
          this.water.setTexture(texture);
          this.background.setTexture(texture);

          this.camera.init();
          this.water.init();

          this.scene.add(this.water);
          this.scene.add(this.background);

          this.resourceTracker.track(this.scene);
          this.resourceTracker.track(this.water);
          this.resourceTracker.track(this.background);
        }
      );
  }

  public cleanup(): void {
    this.resourceTracker.dispose();
  }
}
