import * as THREE from "three";
import CameraPath from "./CameraPath";

const CAMERA_MOVE_SPEED = 0.1;

export default class Camera extends THREE.PerspectiveCamera {
  private time: number;

  private isActive: boolean;

  private cameraPath: CameraPath;

  constructor(
    cameraPath: CameraPath,
    fov: number = 50,
    aspect: number = 1,
    near: number = 0.1,
    far: number = 2000
  ) {
    super(fov, aspect, near, far);

    this.time = 0;
    this.isActive = false;
    this.cameraPath = cameraPath;
  }

  resize(resolution: THREE.Vector2) {
    this.aspect = resolution.x / resolution.y;
    this.updateProjectionMatrix();
  }

  update(time: number) {
    if (this.isActive === false) return;
    this.time = time * CAMERA_MOVE_SPEED; // DOMHighResTimeStamp 시간값에 속도를 곱해서 카메라 경로 계산에 필요한 시간값을 계산함.
    this.moveInCameraPath(this.time); // 매 프레임마다 CameraPath 곡선 상에 위치하는 좌표를 가지고 카메라의 현재 위치와 lookAt 을 계산함.
  }

  init() {
    this.aspect = window.innerWidth / window.innerHeight;
    this.far = 10000;
    this.moveInCameraPath(0); // 카메라 초기 위치값 및 lookAt 값은 시간이 0초일 때의 좌표값으로 각각 초기화함. (시간은 0에서 시작하니까 초기값의 시간값은 0으로 넣어주는 게 맞겠지!ㄴ)
    this.isActive = true;
  }

  // 카메라 경로 상에서 현재 시간값에 대한 카메라의 위치값과 lookAt 좌표값을 계산 후 적용하는 함수
  private moveInCameraPath(time: number) {
    let position = this.cameraPath.getCameraPosition(time);
    let lookAt = this.cameraPath.getCameraLookAt(time);
    this.position.copy(position);
    this.lookAt(lookAt);
  }
}
