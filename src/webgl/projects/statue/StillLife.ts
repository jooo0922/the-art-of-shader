import * as THREE from "three";
import vs from "./glsl/grain.vs";
import fs from "./glsl/grain.fs";
import Drag from "./Drag";

// 조각상 주변에 배치되는 정물(still life)을 생성하는 클래스
export default class StillLife extends THREE.Mesh {
  constructor(geometry: THREE.BufferGeometry) {
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        customNormalMatrix: {
          value: new THREE.Matrix3(),
        },
        noiseScale: {
          value: 2.5, // grain 노이즈의 알갱이 크기와 frequency 를 결정하는 값 (자세한 설명은 statue.fs 참고)
        },
        lightIntensity: {
          value: 1.6, // 조명의 강도
        },
        lightContrast: {
          value: 2.8, // 조명의 음영대비 정도 (기본 라이팅에 노이즈값을 적용하면, 음영대비가 약해서 효과가 잘 안나타나므로, 라이팅값에 constrast 를 강하게 줘서 grain 효과가 더 잘 보이도록 하려는 것!)
        },
        normalizedMoveX: {
          value: 0, // 0.0 ~ 1.0 사이의 값으로 정규화된 마우스(터치) x좌표값. (초기값은 0 으로 설정해서 모든 픽셀에 grain noise 를 적용하려는 것.)
        },
        resolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight), // 리사이징될 때마다 윈도우 해상도 값을 업데이트 해줌.
        },
        devicePixelRatio: {
          value: 1, // css 픽셀 하나를 그리기 위한 장치 픽셀의 개수. 해상도가 클수록 비례해서 커짐. -> 각 디바이스 해상도에 따른 uv좌표, moveX 값 정규화를 정확하게 계산하기 위함.
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
    });
    super(geometry, material);
    this.name = "StillLife";
  }

  init() {}

  update() {}

  resize(resolution: THREE.Vector2) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.resolution.value.set(resolution.x, resolution.y); // 리사이징될 때마다 윈도우 해상도 값을 업데이트 해줌.
      this.material.uniforms.devicePixelRatio.value = window.devicePixelRatio; // 리사이징될 때마다 css 픽셀 하나당 장치 픽셀 개수를 업데이트 해줌.
    }
  }

  setPosition(x: number, y: number, z: number) {
    this.position.set(x, y, z);
    this.setNormalMatrix();
  }

  setRotation(x: number, y: number, z: number) {
    this.rotation.set(x, y, z);
    this.setNormalMatrix();
  }

  setScale(x: number, y: number, z: number) {
    this.scale.set(x, y, z);
    this.setNormalMatrix();
  }

  updateRotationX(degree: number, direction: number) {
    this.rotateX(THREE.MathUtils.degToRad(degree * direction));
    this.setNormalMatrix();
  }

  updateRotationY(degree: number, direction: number) {
    this.rotateY(THREE.MathUtils.degToRad(degree * direction));
    this.setNormalMatrix();
  }

  updateRotationZ(degree: number, direction: number) {
    this.rotateZ(THREE.MathUtils.degToRad(degree * direction));
    this.setNormalMatrix();
  }

  updateMoveX(drag: Drag) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      let moveX = drag.vMove.x,
        resolutionX = drag.resolution.x;
      let normalizedMoveX = moveX / resolutionX;
      this.material.uniforms.normalizedMoveX.value = normalizedMoveX;
    }
  }

  // 노말행렬 계산 메서드 (관련 설명 하단 참고)
  private setNormalMatrix() {
    if (this.material instanceof THREE.RawShaderMaterial) {
      // Object3D.matrixWorld 는 해당 오브젝트의 버텍스들에 적용되는 모델행렬이라고 보면 됨.
      // 해당 오브젝트에 이동, 회전, 스케일 변환을 적용했을 때, matrixWorld를 업데이트해줘야 모델행렬에도 반영됨.
      this.updateMatrixWorld(true);
      const normalMatrix = new THREE.Matrix3(); // 3 * 3 단위행렬 생성
      normalMatrix.setFromMatrix4(
        this.matrixWorld.clone().invert().transpose() // 모델행렬의 역행렬의 전치행렬을 구한 뒤, 상단 3*3 요소들만 저장함.
      );

      this.material.uniforms.customNormalMatrix.value = normalMatrix; // 유니폼 변수에 모델행렬 전송,
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
