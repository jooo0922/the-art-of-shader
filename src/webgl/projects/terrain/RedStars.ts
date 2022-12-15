import * as THREE from "three";
import vs from "./glsl/star.vs";
import fs from "./glsl/redStars.fs";

// 구체 인스턴스 개수 관련 상수들
const NUM_STAR_INSTANCE = 4; // 별 인스턴스 개수
const NUM_DUST_INSTANCE = 40; // 먼지 인스턴스 개수
const NUM_ALL_INSTANCE = NUM_STAR_INSTANCE + NUM_DUST_INSTANCE; // 전체 인스턴스 개수

// 구체 인스턴스 반경 관련 상수들
const MAX_STAR_RADIUS = 800; // 원점에서 각 별까지의 최대 반경
const MIN_STAR_RADIUS = 500; // 원점에서 각 별까지의 최소 반경
const MAX_DUST_RADIUS = 250; // 원점에서 각 먼지까지의 최대 반경
const MIN_DUST_RADIUS = 10; // 원점에서 각 먼지까지의 최소 반경

// 구체 인스턴스 높이 관련 상수들
const MAX_STAR_HEIGHT = 700; // 원점에서 각 별까지의 최대 높이
const MIN_STAR_HEIGHT = 40; // 원점에서 각 별까지의 최소 높이
const MAX_DUST_HEIGHT = 3; // 원점에서 각 먼지까지의 최대 높이
const MIN_DUST_HEIGHT = -30; // 원점에서 각 먼지까지의 최소 높이

// 구체 인스턴스 크기 관련 상수들
const MAX_STAR_SCALE = 200; // 각 별의 최대 크기
const MIN_STAR_SCALE = 10; // 각 별의 최소 크기
const MAX_DUST_SCALE = 0.5; // 각 먼지의 최대 크기
const MIN_DUST_SCALE = 0.01; // 각 먼지의 최소 크기

/**
 * THREE.InstancedMesh 를 사용하는 이유는,
 * 동일한 셰이더가 적용된 구체 지오메트리를 인스턴싱해서
 * 여러 개의 랜덤한 별과 먼지 인스턴스를 생성 및 배치하기 위함.
 */
export default class RedStars extends THREE.InstancedMesh {
  constructor() {
    const geometry = new THREE.InstancedBufferGeometry();
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        customNormalMatrix: {
          value: new THREE.Matrix3(),
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      side: THREE.FrontSide,
    });
    super(geometry, material, NUM_ALL_INSTANCE); // InstancedGeometry 에 복사된 구체 지오메트리를 NUM_ALL_INSTANCE 개수만큼 인스턴싱해서 InstancedMesh 가 생성될 것임.
    this.name = "RedStar";

    // 기본 구체 지오메트리를 InstancedGeometry 에 하나 복사해 줌.
    // 이제 InstancedGeometry 로 InstancedMesh 를 만든다면, 복사된 SphereGeometry 를 인스턴싱해서 만들게 될 것임.
    const baseGeometry = new THREE.SphereGeometry(1, 25, 25);
    geometry.copy(baseGeometry);

    // InstancedGeometry 의 각 구체 인스턴스의 버텍스들이 공유하는 버텍스 셰이더 attribute 정의
    const instancePositions = this.setInstancePositions();
    const instanceScales = this.setInstanceScales();

    // InstancedGeometry 의 각 버텍스마다 attribute 할당
    geometry.setAttribute("instancePosition", instancePositions);
    geometry.setAttribute("instanceScale", instanceScales);
  }

  private setInstancePositions() {
    const instancePositions = new THREE.InstancedBufferAttribute(
      new Float32Array(NUM_ALL_INSTANCE * 3),
      3
    );

    // 초반에는 별 인스턴스 상수들로 랜덤값을 계산하다가,
    // 반복문 인덱스가 지정된 별 인스턴스 개수를 초과하면 먼지 인스턴스 상수들로 랜덤값을 계산하도록 분기처리 함.
    for (let i = 0; i < NUM_ALL_INSTANCE; i++) {
      let maxRadius = MAX_STAR_RADIUS,
        minRadius = MIN_STAR_RADIUS,
        maxHeight = MAX_STAR_HEIGHT,
        minHeight = MIN_STAR_HEIGHT;

      if (i >= NUM_STAR_INSTANCE) {
        maxRadius = MAX_DUST_RADIUS;
        minRadius = MIN_DUST_RADIUS;
        maxHeight = MAX_DUST_HEIGHT;
        minHeight = MIN_DUST_HEIGHT;
      }

      const angle = THREE.MathUtils.degToRad(Math.random() * 360); // 각 구체 인스턴스의 각도를 0 ~ 360도 사이의 랜덤한 라디안 각도로 계산
      const radius = Math.random() * (maxRadius - minRadius) + minRadius; // 원점에서 각 구체 인스턴스 까지의 반경을 특정 범위 내의 랜덤값으로 계산
      const height = Math.random() * (maxHeight - minHeight) + minHeight; // 원점에서 각 구체 인스턴스 까지의 높이를 특정 범위 내의 랜덤값으로 계산

      let x = Math.sin(angle) * radius; // 구체 인스턴스의 랜덤한 x좌표값 계산
      let y = height; // 구체 인스턴스의 랜덤한 y좌표값(높이) 계산
      let z = Math.cos(angle) * radius; // 구체 인스턴스의 랜덤한 z좌표값 계산

      instancePositions.setXYZ(i, x, y, z); // 첫 번째 인자 i 는 뭐냐면, 몇 번째 구체 인스턴스의 attribute 로 설정할 것인지, 즉, 인스턴스 인덱스를 뜻함.
    }

    return instancePositions;
  }

  private setInstanceScales() {
    const instanceScales = new THREE.InstancedBufferAttribute(
      new Float32Array(NUM_ALL_INSTANCE),
      1
    );

    // 초반에는 별 인스턴스 상수들로 랜덤값을 계산하다가,
    // 반복문 인덱스가 지정된 별 인스턴스 개수를 초과하면 먼지 인스턴스 상수들로 랜덤값을 계산하도록 분기처리 함.
    for (let i = 0; i < NUM_ALL_INSTANCE; i++) {
      let maxScale = MAX_STAR_SCALE,
        minScale = MIN_STAR_SCALE;

      if (i >= NUM_STAR_INSTANCE) {
        maxScale = MAX_DUST_SCALE;
        minScale = MIN_DUST_SCALE;
      }

      const scale = Math.random() * (maxScale - minScale) + minScale; // 각 구체 인스턴스의 크기값을 특정 범위 내의 랜덤값으로 계산
      instanceScales.setX(i, scale); // 첫 번째 인자 i 는 뭐냐면, 몇 번째 구체 인스턴스의 attribute 로 설정할 것인지, 즉, 인스턴스 인덱스를 뜻함.
    }

    return instanceScales;
  }

  update() {}

  init() {
    this.setNormalMatrix();
  }

  // 노말행렬 계산 메서드 (관련 설명 하단 참고)
  private setNormalMatrix() {
    if (this.material instanceof THREE.RawShaderMaterial) {
      // Object3D.matrixWorld 는 해당 오브젝트의 버텍스들에 적용되는 모델행렬이라고 보면 됨.
      // 해당 오브젝트에 이동, 회전, 스케일 변환을 적용했을 때, matrixWorld를 업데이트해줘야 모델행렬에도 반영됨.
      this.updateMatrixWorld(true);

      const normalMatrix = new THREE.Matrix3(); // 3*3 단위행렬 생성
      normalMatrix.setFromMatrix4(
        this.matrixWorld.clone().invert().transpose() // 모델행렬의 역행렬의 전치행렬을 구한 뒤, 상단 3*3 요소들만 저장함.
      );

      this.material.uniforms.customNormalMatrix.value = normalMatrix; // 유니폼 변수에 모델행렬 전송
    }
  }
}

/**
 * 노멀행렬을 js(cpu) 단에서 계산하여
 * gpu 에서 돌아가는 셰이더로 전송해주는 메서드
 *
 * 버텍스 셰이더에서 계산해주던 노멀행렬을
 * cpu 단에서 계산하여 전송하도록 구조를 변경한 이유는,
 *
 * 첫 번쨰로, 노멀행렬 계산에 필요한 역행렬과 전치행렬 계산은
 * GPU 에서는 상당히 무거운 연산이고,
 *
 * 두 번째로, 버텍스마다 적용되는 모델행렬이 동일하기 때문에,
 * 노멀행렬 연산의 결과값도 버텍스마다 동일함.
 * 따라서, 동일한 결과값을 각 버텍스마다 반복적으로
 * 불필요하게 수행함으로써 gpu 자원을 낭비하지 않도록 하기 위함.
 */
