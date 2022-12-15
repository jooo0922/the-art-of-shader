import * as THREE from "three";
import Camera from "./Camera";
import TypoWarp from "./TypoWarp";

export default class WebGLContent {
  renderer: THREE.WebGLRenderer;

  scene: THREE.Scene;

  camera: Camera;

  warp: TypoWarp;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: canvas,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#1E1E1E");
    this.camera = new Camera();
    this.warp = new TypoWarp();
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

    this.warp.update(time);

    this.render();
  }

  async init() {
    const texLoader = new THREE.TextureLoader();
    await Promise.all([texLoader.loadAsync("./images/typoWarp/typo.png")]).then(
      (response) => {
        const typoTex = response[0];
        typoTex.wrapS = THREE.RepeatWrapping;
        typoTex.wrapT = THREE.RepeatWrapping;
        this.warp.setTexture(typoTex);
        this.warp.setTexDirection(-1, -1);
        this.warp.setTexRepeat(5, 70); // 텍스쳐 반복횟수 설정 시, 가급적 u방향은 적게 반복하고, v방향은 많이 반복해줄수록 타이포 텍스쳐가 늘어짐 없이 잘 렌더링됨.
        this.warp.init();

        this.camera.init();

        this.scene.add(this.warp);
      }
    );
  }
}
