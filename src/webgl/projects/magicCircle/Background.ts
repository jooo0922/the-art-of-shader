import * as THREE from "three";
import vs from "./glsl/background.vs";
import fs from "./glsl/background.fs";

export default class Background extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.BoxGeometry(20000, 20000, 20000);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0,
        },
        envMap: {
          value: null,
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      side: THREE.BackSide,
    });
    super(geometry, material);
    this.name = "Background";
  }

  public update(): void {}

  public init(): void {}

  setTexture(texture: THREE.CubeTexture) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.envMap.value = texture; // 배경 텍스쳐
    }
  }
}
