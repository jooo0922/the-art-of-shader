import * as THREE from "three";
import vs from "./glsl/postEffect.vs";
import fs from "./glsl/blurPostEffect.fs";

export default class BlurPostEffect extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        resolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight), // 리사이징될 때마다 윈도우 해상도 값을 업데이트 해줌.
        },
        direction: {
          value: new THREE.Vector2(0, 0), // 가우시안 블러 방향 정의
        },
        texture: {
          value: null,
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
    });
    super(geometry, material);
    this.name = "BlurPostEffect";
  }

  setDirection(x: number, y: number) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.direction.value.set(x, y); // 가우시안 블러 방향 정의
    }
  }

  setTexture(texture: THREE.Texture) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.texture.value = texture; // 렌더타겟 텍스쳐
    }
  }

  resize(resolution: THREE.Vector2) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.resolution.value.set(resolution.x, resolution.y); // 리사이징될 때마다 윈도우 해상도 값을 업데이트 해줌.
    }
  }
}
