import * as THREE from "three";
import Camera from "./Camera";

export default class CameraAura extends THREE.PerspectiveCamera {
  private distance: number;

  constructor(
    fov: number = 50,
    aspect: number = 1,
    near: number = 0.1,
    far: number = 2000
  ) {
    super(fov, aspect, near, far);

    this.distance = 0;
  }

  update(camera: Camera) {
    this.position
      .copy(camera.position)
      .normalize()
      .multiplyScalar(this.distance); // 전달받은 카메라와의 방향벡터를 normalize 한 뒤, 시야각 절반 기준으로 구한 distance 를 곱해서 현재 CameraAura 의 위치를 결정함.
    this.lookAt(new THREE.Vector3(0, 0, 0)); // CameraAura 도 Camera 와 마찬가지로 lookAt 을 원점으로 맞춰줘야 함.
  }

  init() {
    this.aspect = 1; // Aura 에 사용할 geometry 자체가 정사각형이므로 aspect 비율값을 1로 해주는 게 맞음.
    this.far = 1000;
    // focalLength 설정 시 resize 했을 때와 resize 직후 새로고침 했을 때의 카메라 거리가 달라지는 버그 발생. -> 임시 코멘트 처리
    // this.setFocalLength(50); // 렌즈의 초점 거리를 결정함. (초점거리가 짧을수록 넓은 시야각(fov)을 표현하는 광각렌즈에 가깝고, 길수록 좁은 시야각(fov)으로 먼 거리 대상을 크게 표현하는 망원렌즈에 가까워 짐.)
    this.distance = // distance 는 렌더타겟을 촬영하는 카메라인 CameraAura 를 실제 씬을 촬영하는 Camera 에서 얼마나 멀리 떨어트릴지 그 거리를 결정하는 값 -> 이게 멀어질수록 Aura 에 렌더되는 렌더타겟 텍스쳐에 그려지는 postEffect 가 더 작아짐.
      Math.abs(Math.tan(THREE.MathUtils.degToRad(this.fov) / 2) * 2) * 20 * 2; // three.js 튜토리얼에서 시야각 절반 각도의 tan 값을 이용해 물체와 카메라 사이의 거리를 구하는 공식과 유사함.
  }
}
