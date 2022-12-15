import * as THREE from "three";
import vs from "./glsl/shield.vs";
import fs from "./glsl/shield.fs";

export default class Shield extends THREE.Mesh {
  constructor(geometry: THREE.BufferGeometry) {
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0, // 시간변수
        },
        texture: {
          value: null, // Hexagon 패턴 텍스쳐
        },
        moveSpeed: {
          value: 0.5, // 각 Hexagon 이동속도
        },
        maxMoveRadius: {
          value: 0.25, // 각 Hexagon 들의 최대 이동반경
        },
        customNormalMatrix: {
          value: new THREE.Matrix3(), // js(cpu) 단에서 계산되는 노멀행렬
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      transparent: true, // 알파블렌딩 셰이더 활성화 -> 텍스쳐의 투명도값 적용 가능
    });
    super(geometry, material);
    this.name = "Shield";
  }

  public init(): void {
    this.setNormalMatrix();
  }

  public update(time: number): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.time.value = time;
    }
  }

  public setTexture(texture: THREE.Texture): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.texture.value = texture;
    }
  }

  // 노말행렬 계산 메서드 (관련 설명 하단 참고)
  private setNormalMatrix(): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      // Object3D.matrixWorld 는 해당 오브젝트의 버텍스들에 적용되는 모델행렬이라고 보면 됨.
      // 해당 오브젝트에 이동, 회전, 스케일 변환을 적용했을 때, matrixWorld를 업데이트해줘야 모델행렬에도 반영됨.
      this.updateMatrixWorld();

      const normalMatrix = new THREE.Matrix3(); // 3*3 단위행렬 생성
      normalMatrix.setFromMatrix4(
        this.matrixWorld.clone().invert().transpose() // 모델행렬의 역행렬의 전치행렬을 구한 뒤, 상단 3*3 요소들만 저장함.
      );

      this.material.uniforms.customNormalMatrix.value = normalMatrix; // 유니폼 변수에 노멀행렬 전송
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
