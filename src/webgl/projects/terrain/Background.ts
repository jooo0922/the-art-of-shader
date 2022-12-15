import * as THREE from "three";
import vs from "./glsl/background.vs";
import fs from "./glsl/background.fs";

export default class Background extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.SphereGeometry(1000, 50, 50);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0,
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      side: THREE.BackSide,
    });
    super(geometry, material);
    this.name = "Background";
  }

  update() {}

  init() {}
}
