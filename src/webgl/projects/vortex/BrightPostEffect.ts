import * as THREE from "three";
import vs from "./glsl/postEffect.vs";
import fs from "./glsl/brightPostEffect.fs";

export default class BrightPostEffect extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        minBright: {
          value: 0.8, // 추출할 밝기의 최소 기준값
        },
        texture: {
          value: null, // 렌더타겟 텍스쳐 (아무런 postEffect 가 적용되지 않은 첫 번째 렌더타겟 텍스쳐가 들어올 것임.)
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
    });
    super(geometry, material);
    this.name = "BrightPostEffect";
  }

  setTexture(texture: THREE.Texture) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.texture.value = texture; // 렌더타겟 텍스쳐 (아무런 postEffect 가 적용되지 않은 첫 번째 렌더타겟 텍스쳐가 들어올 것임.)
    }
  }
}

/**
 * 참고로,
 * PostEffect 메쉬의 PlaneGeometry 크기를
 * 2 * 2 로 지정한 이유는,
 *
 * 이 메쉬를 담는 orthographic camera 의
 * 절두체의 상하좌우를 (-1, 1, 1, -1) 로 설정함으로써,
 * 절두체의 가로 * 세로 폭이 2 * 2 가 되기 때문!
 *
 * 즉, 카메라 절두체의 가로 * 세로 폭과
 * PlaneGeometry 사이즈를 맞춘 것임.
 */
