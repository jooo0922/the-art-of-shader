import * as THREE from "three";
import CameraPath from "./CameraPath";

export default class Camera extends THREE.PerspectiveCamera {
  private time: number;

  private isActive: boolean;

  private cameraPath: CameraPath;

  constructor(
    fov: number = 50,
    aspect: number = 1,
    near: number = 0.1,
    far: number = 2000
  ) {
    super(fov, aspect, near, far);

    this.time = 0;
    this.isActive = false;
    this.cameraPath = new CameraPath();
  }

  resize(resolution: THREE.Vector2) {
    this.aspect = resolution.x / resolution.y;
    this.updateProjectionMatrix();
  }

  update(time: number) {
    if (this.isActive === false) return;
    this.time = time;

    // 매 프레임마다 CameraPath 곡선 상에 위치하는 좌표를 가지고 카메라의 현재 위치와 lookAt 을 계산함.
    let position = this.cameraPath.getCameraPosition(time);
    let lookAt = this.cameraPath.getCameraLookAt(time);

    this.position.copy(position);
    this.lookAt(lookAt);
  }

  init() {
    this.aspect = window.innerWidth / window.innerHeight;
    this.far = 20000; // Background 의 사이즈가 20000*20000 이므로, 카메라 절두체 사이즈도 이에 맞춰준 것.
    // this.position.set(0, 600, 0); // CatmullRomCurve3 커브 경로좌표 그릴 때 설정해주는 카메라 초기값
    this.position.set(200, 0, 200);
    this.lookAt(new THREE.Vector3(0, 20, 0));
    this.isActive = true;
  }
}
