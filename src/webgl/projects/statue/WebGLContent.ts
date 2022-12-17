import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import Camera from "./Camera";
import Background from "./Background";
import Statue from "./Statue";
import StillLife from "./StillLife";
import Drag from "./Drag";
import { ResourceTracker } from "../../utils/ResourceTracker";

export default class WebGLContent {
  renderer: THREE.WebGLRenderer;

  scene: THREE.Scene;

  camera: Camera;

  background: Background;

  statue: Statue | undefined;

  cherry: StillLife | undefined;

  leaf: StillLife | undefined;

  sphere: StillLife | undefined;

  cube: StillLife | undefined;

  cylinder: StillLife | undefined;

  icosahedron: StillLife | undefined;

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
    this.background = new Background();

    this.resourceTracker = new ResourceTracker();
  }

  async init() {
    const objLoader = new OBJLoader();
    await Promise.all([
      objLoader.loadAsync("./models/statue/venus.obj"),
      objLoader.loadAsync("./models/statue/cherry.obj"),
      objLoader.loadAsync("./models/statue/leaf.obj"),
    ]).then((response) => {
      this.createObjects(response);
      this.initObjects();
      this.transformObjects();
      this.addObjects();

      this.resourceTracker.track(this.scene);
      this.resourceTracker.track(this.background);
      this.resourceTracker.track(this.statue);
      this.resourceTracker.track(this.cherry);
      this.resourceTracker.track(this.leaf);
      this.resourceTracker.track(this.sphere);
      this.resourceTracker.track(this.cube);
      this.resourceTracker.track(this.cylinder);
      this.resourceTracker.track(this.icosahedron);
    });
  }

  public cleanup(): void {
    this.resourceTracker.dispose();
  }

  // 리사이징 메서드
  resize(resolution: THREE.Vector2): void {
    this.renderer.setSize(resolution.x, resolution.y);
    this.camera.resize(resolution);
    this.statue?.resize(resolution);
    this.background.resize(resolution);
    this.cherry?.resize(resolution);
    this.leaf?.resize(resolution);
    this.sphere?.resize(resolution);
    this.cube?.resize(resolution);
    this.icosahedron?.resize(resolution);
    this.cylinder?.resize(resolution);
  }

  // 업데이트 루프 (데이터 관련)
  update(time: number, drag: Drag): void {
    this.camera.update(time);

    this.updateMoveX(drag);

    this.updateRotation();

    this.render();
  }

  // 렌더링 루프 (렌더링 객체 관련)
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  private createObjects(response: [THREE.Group, THREE.Group, THREE.Group]) {
    const statueGeometry = (response[0].children[0] as THREE.Mesh).geometry;
    const cherryGeometry = (response[1].children[0] as THREE.Mesh).geometry;
    const leafGeometry = (response[2].children[0] as THREE.Mesh).geometry;
    const sphereGeometry = new THREE.SphereGeometry(6, 32, 16);
    const cubeGeometry = new THREE.BoxGeometry(9, 9, 9);
    const icosahedronGeometry = new THREE.IcosahedronGeometry(7, 0);
    const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 7, 32);

    this.statue = new Statue(statueGeometry);
    this.cherry = new StillLife(cherryGeometry);
    this.leaf = new StillLife(leafGeometry);
    this.sphere = new StillLife(sphereGeometry);
    this.cube = new StillLife(cubeGeometry);
    this.icosahedron = new StillLife(icosahedronGeometry);
    this.cylinder = new StillLife(cylinderGeometry);
  }

  private initObjects() {
    this.camera.init();
    this.statue?.init();
    this.cherry?.init();
    this.leaf?.init();
    this.sphere?.init();
    this.cube?.init();
    this.icosahedron?.init();
    this.cylinder?.init();
  }

  private transformObjects() {
    this.cherry?.setPosition(-30, 0, 0);
    this.leaf?.setPosition(24, -11, 0);
    this.sphere?.setPosition(26, -2, 0);
    this.cube?.setPosition(-30, 14, 0);
    this.icosahedron?.setPosition(-22, -16, 0);
    this.cylinder?.setPosition(24, 12, 0);

    this.cherry?.setRotation(
      THREE.MathUtils.degToRad(25),
      THREE.MathUtils.degToRad(5),
      THREE.MathUtils.degToRad(20)
    );
    this.leaf?.setRotation(
      THREE.MathUtils.degToRad(90),
      THREE.MathUtils.degToRad(140),
      THREE.MathUtils.degToRad(-40)
    );
    this.cube?.setRotation(
      THREE.MathUtils.degToRad(35),
      THREE.MathUtils.degToRad(60),
      THREE.MathUtils.degToRad(5)
    );
    this.icosahedron?.setRotation(
      THREE.MathUtils.degToRad(15),
      THREE.MathUtils.degToRad(-15),
      THREE.MathUtils.degToRad(10)
    );
    this.cylinder?.setRotation(
      THREE.MathUtils.degToRad(20),
      THREE.MathUtils.degToRad(10),
      THREE.MathUtils.degToRad(35)
    );

    this.leaf?.setScale(3.5, 3.5, 3.5);
  }

  private addObjects() {
    this.scene.add(this.background);
    if (this.statue) this.scene.add(this.statue);
    if (this.cherry) this.scene.add(this.cherry);
    if (this.leaf) this.scene.add(this.leaf);
    if (this.sphere) this.scene.add(this.sphere);
    if (this.cube) this.scene.add(this.cube);
    if (this.icosahedron) this.scene.add(this.icosahedron);
    if (this.cylinder) this.scene.add(this.cylinder);
  }

  private updateMoveX(drag: Drag) {
    this.background.updateMoveX(drag);
    this.statue?.updateMoveX(drag);
    this.cherry?.updateMoveX(drag);
    this.leaf?.updateMoveX(drag);
    this.sphere?.updateMoveX(drag);
    this.cube?.updateMoveX(drag);
    this.icosahedron?.updateMoveX(drag);
    this.cylinder?.updateMoveX(drag);
  }

  private updateRotation() {
    this.statue?.updateRotationY(0.3, 1);
    this.cherry?.updateRotationY(0.45, 1);
    this.leaf?.updateRotationZ(0.5, 1);
    this.sphere?.updateRotationY(0.4, 1);
    this.cube?.updateRotationY(0.5, -1);
    this.icosahedron?.updateRotationY(0.4, 1);
    this.cylinder?.updateRotationX(0.3, -1);
  }
}
