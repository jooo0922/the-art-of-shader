import * as THREE from "three";
import vs from "./glsl/background.vs";
import fs from "./glsl/background.fs";
import Drag from "./Drag";

export default class Background extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.SphereGeometry(1000, 50, 50);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        noiseScale: {
          value: 2.5,
        },
        noiseThreshold: {
          value: 0.11, // 노이즈 알갱이를 표현할 지 말 지를 결정하는 threshold 값
        },
        normalizedMoveX: {
          value: 0,
        },
        resolution: {
          value: new THREE.Vector2(
            document.body.clientWidth,
            document.body.clientHeight
          ), // 리사이징될 때마다 윈도우 해상도 값을 업데이트 해줌.
        },
        devicePixelRatio: {
          value: 1, // css 픽셀 하나를 그리기 위한 장치 픽셀의 개수. 해상도가 클수록 비례해서 커짐. -> 각 디바이스 해상도에 따른 uv좌표, moveX 값 정규화를 정확하게 계산하기 위함.
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      side: THREE.BackSide,
    });
    super(geometry, material);
    this.name = "Background";
  }

  init() {}

  update() {}

  resize(resolution: THREE.Vector2) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.resolution.value.set(resolution.x, resolution.y); // 리사이징될 때마다 윈도우 해상도 값을 업데이트 해줌.
      this.material.uniforms.devicePixelRatio.value = window.devicePixelRatio; // 리사이징될 때마다 css 픽셀 하나당 장치 픽셀 개수를 업데이트 해줌.
    }
  }

  updateMoveX(drag: Drag) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      let moveX = drag.vMove.x,
        resolutionX = drag.resolution.x;
      let normalizedMoveX = moveX / resolutionX;
      this.material.uniforms.normalizedMoveX.value = normalizedMoveX;
    }
  }
}
