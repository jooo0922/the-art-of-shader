import * as THREE from "three";
import CameraPath from "./CameraPath";
import vs from "./glsl/vortex.vs";
import fs from "./glsl/vortex.fs";

export default class Vortex extends THREE.Mesh {
  constructor(curve: CameraPath) {
    const geometry = new THREE.TubeGeometry(curve, 100, 1.0, 80, true);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0, // 시간변수
        },
        noiseTexList: {
          /**
           * 참고로, TubeGeometry 처럼
           * uv값이 한바퀴 돌면서 구분선이 생기는 지오메트리의 경우,
           * 노이즈를 사용하고자 한다면,
           *
           * glsl-noise 함수를 사용하기 보다는,
           * 텍스쳐를 REPEAT 하더라도 u축의 양끝이 서로 자연스럽게 연결되도록
           * 편집된 이미지 파일들 (noise1.png, noise2.jpg 등) 을
           * 노이즈 텍스쳐로 사용하는 게 좋음.
           */
          value: [null, null], // 노이즈 텍스쳐 배열
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      side: THREE.BackSide,
    });
    super(geometry, material);
    this.name = "Vortex";
  }

  init() {}

  update(time: number) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.time.value = time;
    }
  }

  setTextureList(noiseTexList: THREE.Texture[]) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.noiseTexList.value = noiseTexList;
    }
  }
}
