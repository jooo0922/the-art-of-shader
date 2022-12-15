import * as THREE from "three";
import vs from "./glsl/auraPostEffect.vs";
import fs from "./glsl/auraPostEffect.fs";

export default class AuraPostEffect extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        resolution: {
          value: new THREE.Vector2(512, 512),
        },
        direction: {
          value: new THREE.Vector2(0, 0),
        },
        radius: {
          value: 1,
        },
        texture: {
          value: null,
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
    });
    super(geometry, material);
    this.name = "AuraPostEffect";
  }

  setDirection(x: number, y: number) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.direction.value.set(x, y);
    }
  }

  setTexture(texture: THREE.Texture) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.texture.value = texture; // 렌더타겟 텍스쳐
    }
  }

  update() {}
}
