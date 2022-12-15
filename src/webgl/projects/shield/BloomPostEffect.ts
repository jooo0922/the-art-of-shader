import * as THREE from "three";
import vs from "./glsl/postEffect.vs";
import fs from "./glsl/bloomPostEffect.fs";

export default class BloomPostEffect extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        texture1: {
          value: null, // 아무런 postEffect 가 적용되지 않은 원본 렌더타겟 텍스쳐
        },
        texture2: {
          value: null, // Bloom 을 제외한 모든 postEffect (minBright 보다 밝은 값 추출, 가우시안 블러) 가 적용된 렌더타겟 텍스쳐
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
    });
    super(geometry, material);
    this.name = "BloomPostEffect";
  }

  public setTexture(texture1: THREE.Texture, texture2: THREE.Texture): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.texture1.value = texture1; // 아무런 postEffect 가 적용되지 않은 원본 렌더타겟 텍스쳐
      this.material.uniforms.texture2.value = texture2; // Bloom 을 제외한 모든 postEffect (minBright 보다 밝은 값 추출, 가우시안 블러) 가 적용된 렌더타겟 텍스쳐
    } // learnOpenGL 에서 원본패스가 1번 텍스쳐에 해당되고, 밝기를 추출해 가우시안 블러를 적용한 렌더패스가 2번 텍스쳐에 해당함.
  }
}
