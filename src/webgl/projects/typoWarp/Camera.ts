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
    this.aspect = document.body.clientWidth / document.body.clientHeight;
    this.position.set(15, 110, 60);
    this.rotation.set(
      THREE.MathUtils.degToRad(-50), // x축 회전
      THREE.MathUtils.degToRad(5), // y축 회전
      THREE.MathUtils.degToRad(-5) // z축 회전
    );
    this.isActive = true;
  }
}
