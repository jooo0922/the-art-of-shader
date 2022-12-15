import * as THREE from "three";
import vs from "./glsl/postEffect.vs";
import fs from "./glsl/bloomPostEffect.fs";

export default class BloomPostEffect extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        texture1: {
          value: null,
        },
        texture2: {
          value: null,
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
    });
    super(geometry, material);
    this.name = "BloomPostEffect";
  }

  setTexture(texture1: THREE.Texture, texture2: THREE.Texture) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.texture1.value = texture1; // 아무런 postEffect 가 적용되지 않은 렌더타겟 텍스쳐
      this.material.uniforms.texture2.value = texture2; // Bloom 을 제외한 모든 postEffect 가 적용된 렌더타겟 텍스쳐
    }
  }
}
