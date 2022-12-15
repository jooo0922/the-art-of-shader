import * as THREE from "three";
import vs from "./glsl/terrain.vs"; // smoothShading 버텍스 셰이더
import fs from "./glsl/terrain.fs"; // smoothShading 프래그먼트 셰이더
// import vs from "./glsl/flatTerrain.vs"; // flatShading 버텍스 셰이더
// import fs from "./glsl/flatTerrain.fs";// flatShading 프래그먼트 셰이더

const SIZE = 500; // 평면 지오메트리 크기 (width, height)
const SEGMENTS = 500; // 평면 지오메트리 (가로/세로)분할 개수

export default class Terrain extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0, // 시간변수
        },
        size: {
          value: SIZE, // 평면 지오메트리 크기 (width, height) -> 버텍스 셰이더에서 인접 버텍스의 오브젝트공간 좌표 및 uv좌표 계산에 필요
        },
        segments: {
          value: SEGMENTS, // 평면 지오메트리 (가로/세로)분할 개수 -> 버텍스 셰이더에서 인접 버텍스의 오브젝트공간 좌표 계산에 필요
        },
        noiseTex: {
          value: null,
        },
        customNormalMatrix: {
          value: new THREE.Matrix3(),
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
    });
    super(geometry, material);
    this.name = "Terrain";
  }

  init() {
    this.rotation.x = -Math.PI / 2; // Terrain 객체 평면을 -90도 회전시킴.
    this.position.y -= 70; // Terrain 객체의 높이값을 전체적으로 내려줌.

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

  setTexture(noiseTex: THREE.Texture) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.noiseTex.value = noiseTex;
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
