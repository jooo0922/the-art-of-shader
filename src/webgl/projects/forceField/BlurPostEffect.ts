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
          value: null, // 렌더타겟 텍스쳐
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
