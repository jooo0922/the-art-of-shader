import * as THREE from "three";

export default class Camera extends THREE.PerspectiveCamera {
  private time: number;

  private isActive: boolean;

  constructor(
    fov: number = 50,
    aspect: number = 1,
    near: number = 0.1,
    far: number = 2000
  ) {
    super(fov, aspect, near, far);

    this.time = 0;
    this.isActive = false;
  }

  resize(resolution: THREE.Vector2) {
    this.aspect = resolution.x / resolution.y;
    this.updateProjectionMatrix();
  }

  update(time: number) {
    if (this.isActive === false) return;
    this.time = time;
  }

  init() {
    this.aspect = window.innerWidth / window.innerHeight;
    this.far = 20000; // Background, Water 의 사이즈가 20000*20000 이기 때문에, 카메라 절두체의 사이즈도 이에 맞춰줘야
    // focalLength 설정 시 resize 했을 때와 resize 직후 새로고침 했을 때의 카메라 거리가 달라지는 버그 발생. -> 임시 코멘트 처리
    // this.setFocalLength(50); // 렌즈의 초점 거리를 결정함. (초점거리가 짧을수록 넓은 시야각(fov)을 표현하는 광각렌즈에 가깝고, 길수록 좁은 시야각(fov)으로 먼 거리 대상을 크게 표현하는 망원렌즈에 가까워 짐.)
    this.position.set(0, 10, -110);
    this.lookAt(new THREE.Vector3(0, 0, 0));
    this.isActive = true;
  }
}
