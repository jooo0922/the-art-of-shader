import * as THREE from "three";
import vs from "./glsl/ground.vs";
import fs from "./glsl/ground.fs";

export default class Ground extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(20000, 20000); // Ground 객체의 사이즈를 Background 사이즈와 동일하게 맞춤.
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        diffuseTex: {
          value: null, // 알비도(디퓨즈, 물체 색상) 텍스쳐
        },
        normalTex: {
          value: null, // 노멀맵 텍스쳐
        },
        textureRepeat: {
          value: 2000,
        },
        dirLightDirection: {
          value: new THREE.Vector3(0, 100, 0), // 디렉셔널 리이트 방향벡터 (WebGLContent 에서 설정한 this.directionalLight.position 과 동일하게 맞춰줌.)
        },
        pointLightPosition: {
          value: new THREE.Vector3(0, 10, 0), // 포인트라이트 조명 월드공간 위치
        },
        pointLightRadius: {
          value: 60, // 포인트라이트 조명의 반경 (감쇄 계산에 사용할 조명의 최대 영향 범위. 반지름)
        },
        hsv: {
          value: new THREE.Vector3(0, 0, 0), // 0 ~ 1 시이의 vec3 타입의 hsv 컬러값 -> 포인트라이트 조명색상 계산에 사용
        },
        ambientColor: {
          value: new THREE.Vector3(0.003, 0.002, 0.001), // 앰비언트 라이트 색상값
        },
        customNormalMatrix: {
          value: new THREE.Matrix3(), // cpu 단에서 직접 계산한 뒤 넘겨주는 커스텀 노멀행렬
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      // MagicCircle 도 깊이버퍼를 저장하지 않지만,
      // transparent: true 로 알파블렌딩 셰이더가 적용되기 때문에,
      // 불투명 셰이더인 Ground 보다 나중에 렌더링됨. -> 결과적으로 Ground 위에 MagicCircle 이 그려지게 됨!
      depthWrite: false,
      side: THREE.FrontSide,
    });
    super(geometry, material);
    this.name = "Ground";
  }

  public update(): void {}

  public init(): void {
    this.rotation.x = -Math.PI / 2; // Ground 객체 평면을 -90도 회전시킴.
    this.setNormalMatrix();
  }

  public setTextures(
    diffuseTex: THREE.Texture,
    normalTex: THREE.Texture
  ): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.diffuseTex.value = diffuseTex;
      this.material.uniforms.normalTex.value = normalTex;
    }
  }

  public setHSV(hsv: THREE.Vector3): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.hsv.value = hsv;
    }
  }

  // 노말행렬 계산 메서드 (관련 설명 하단 참고)
  private setNormalMatrix(): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      // Object3D.matrixWorld 는 해당 오브젝트의 버텍스들에 적용되는 모델행렬이라고 보면 됨.
      // 해당 오브젝트에 이동, 회전, 스케일 변환을 적용했을 때, matrixWorld를 업데이트해줘야 모델행렬에도 반영됨.
      this.updateMatrixWorld(true);

      const normalMatrix = new THREE.Matrix3(); // 3 * 3 단위행렬 생성
      normalMatrix.setFromMatrix4(
        this.matrixWorld.clone().invert().transpose() // 모델행렬의 역행렬의 전치행렬을 구한 뒤, 상단 3*3 요소들만 저장함.
      );

      this.material.uniforms.customNormalMatrix.value = normalMatrix; // 유니폼 변수에 노멀행렬 전송.
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
