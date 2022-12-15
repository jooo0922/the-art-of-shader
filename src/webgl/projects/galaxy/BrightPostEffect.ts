import * as THREE from "three";
import vs from "./glsl/postEffect.vs";
import fs from "./glsl/brightPostEffect.fs";

export default class BrightPostEffect extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        minBright: {
          value: 0.05, // 추출할 밝기 기준값 (기준값이 0.05 라는 것은, 거의 모든 Points 의 픽셀들을 샘플링해와서 bloom 처리 시키겠다는 뜻임. -> 왜냐? Points 주변으로 bloom 이 일어나려면 Points 의 모든 픽셀들을 다 가져와야 되니까!)
        },
        texture: {
          value: null,
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
      this.material.uniforms.texture.value = texture; // 렌더타겟 텍스쳐 (아무런 postEffect 가 적용되지 않은 렌더타겟 텍스쳐가 들어올 것임.)
    }
  }
}
