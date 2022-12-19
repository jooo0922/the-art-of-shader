import * as THREE from "three";
import Camera from "./Camera";
import Background from "./Background";
import Terrain from "./Terrain";
import RedStars from "./RedStars";
import BlueStars from "./BlueStars";
import BlackStars from "./BlackStars";
import Fog from "./Fog";
import { ResourceTracker } from "../../utils/ResourceTracker";

export default class WebGLContent {
  renderer: THREE.WebGLRenderer;

  scene: THREE.Scene;

  camera: Camera;

  background: Background;

  terrain: Terrain;

  redStars: RedStars;

  blueStars: BlueStars;

  blackStars: BlackStars;

  fog: Fog;

  resourceTracker: ResourceTracker;

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.background = new Background();
    this.terrain = new Terrain();
    this.redStars = new RedStars();
    this.blueStars = new BlueStars();
    this.blackStars = new BlackStars();
    this.fog = new Fog();

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

    this.fog.update(time);

    this.terrain.update(time);

    this.render();
  }

  async init() {
    const texLoader = new THREE.TextureLoader();
    await Promise.all([
      texLoader.loadAsync("./images/noise/noise2.jpg"),
      texLoader.loadAsync("./images/forceField/fog.png"),
    ]).then((response) => {
      const noiseTex = response[0];
      noiseTex.wrapS = THREE.RepeatWrapping;
      noiseTex.wrapT = THREE.RepeatWrapping;
      this.terrain.setTexture(noiseTex);
      this.terrain.init();

      const fogTex = response[1];
      this.fog.setTexture(fogTex);
      this.fog.init(this.camera);
      this.redStars.init();
      this.blueStars.init();
      this.blackStars.init();
      this.camera.init();

      this.scene.add(this.background);
      this.scene.add(this.terrain);
      this.scene.add(this.redStars);
      this.scene.add(this.blueStars);
      this.scene.add(this.blackStars);
      this.scene.add(this.camera); // Camera 를 scene 에 추가해줘야 Camera 의 자식요소로 추가된 Fog 가 화면에 제대로 나타나게 됨. (Camera를 scene 에 넣어주지 않으면 그것의 자식요소인 Fog 자체가 scene 에 안들어가게 되는 셈이니까!)

      // EllipseCurve 커브 시각화 및 디버깅용
      // const line = new THREE.Line(
      //   new THREE.BufferGeometry().setFromPoints(
      //     this.camera.cameraPath
      //       .getPoints(200)
      //       .map((p) => new THREE.Vector3(p.x, -17, p.y))
      //   ),
      //   new THREE.LineBasicMaterial({ color: 0x00ff00 })
      // );
      // const points = new THREE.Points(
      //   new THREE.BufferGeometry().setFromPoints(
      //     this.camera.cameraPath
      //       .getPoints(10)
      //       .map((p) => new THREE.Vector3(p.x, -17, p.y))
      //   ),
      //   new THREE.PointsMaterial({ color: 0xff0000, size: 20 })
      // );
      // this.scene.add(line);
      // this.scene.add(points);

      this.resourceTracker.track(this.scene);
      this.resourceTracker.track(this.background);
      this.resourceTracker.track(this.terrain);
      this.resourceTracker.track(this.redStars);
      this.resourceTracker.track(this.blueStars);
      this.resourceTracker.track(this.blackStars);
      this.resourceTracker.track(this.fog);
    });
  }

  public cleanup(): void {
    this.resourceTracker.dispose();
    this.renderer.dispose();
    this.renderer.clear();
  }
}
