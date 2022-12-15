import * as THREE from "three";
import vs from "./glsl/ball.vs";
import fs from "./glsl/ball.fs";
import Camera from "./Camera";

export default class Ball extends THREE.Mesh {
  isActive: boolean;

  constructor(geometry: THREE.BufferGeometry) {
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0,
        },
        renderOutline: {
          value: 0,
        },
        noiseTex: {
          value: null,
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
    });
    super(geometry, material);
    this.name = "Ball";
    this.isActive = false;
  }

  init(noiseTex: THREE.Texture) {
    this.isActive = true;
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.noiseTex.value = noiseTex;
    }
  }

  update(time: number, camera: Camera) {
    if (this.isActive === false) return;
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.time.value = time;
    }
    this.rotation.set(
      Math.sin(time / 10) * 2 * Math.PI,
      Math.cos(time / 10) * 2 * Math.PI,
      0
    );
  }
}
