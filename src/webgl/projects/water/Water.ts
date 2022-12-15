import * as THREE from "three";
import vs from "./glsl/water.vs";
import fs from "./glsl/water.fs";

// OctahedronGeometry, IcosahedronGeometry, SphereGeometry 등등 뭘 이용해서 blob 을 만들건 상관없는데,
// geometry 사이즈(반지름)가 일정 수준 이상이어야 vertex shader 에서 noise 함수로 차이가 확확 나는 랜덤값을 뽑아낼 수 있음.
// 만약 반지름이 너무 작다면, noise 함수로 들어가는 position 값에 큰 차이가 없기 때문에, 비슷한 값의 noise 값을 반환받게 될 것임.
// -> 이로 인해 blob 이 제대로 그려지지 않음!
const RADIUS = 200;

export default class Water extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.OctahedronGeometry(RADIUS, 32);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0,
        },
        amplitude: {
          value: 1,
        }, // blob 규모, 진폭
        frequency: {
          value: 0.4,
        }, // blob 주기(자글자글한 정도)
        radius: {
          value: RADIUS,
        }, // blob 에 사용된 geometry 의 반지름
        lightDir: {
          value: new THREE.Vector3(-1.0, 1.0, 0.2), // 디렉셔널 라이트 방향
        },
        lightCol: {
          value: new THREE.Vector3(1.0, 0.88, 0.71), // 조명색상
        },
        envMap: {
          value: null, // 환경맵 텍스쳐 (반사 및 굴절 샘플링에 사용)
        },
        customNormalMatrix: {
          value: new THREE.Matrix3(),
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
    });
    super(geometry, material);
    this.name = "Water";
  }

  init() {
    this.position.set(0, 160, 0);
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

  setTexture(texture: THREE.CubeTexture) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.envMap.value = texture; // 환경맵 텍스쳐 (반사 및 굴절 샘플링에 사용)
    }
  }

  update(time: number) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.time.value = time;
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
