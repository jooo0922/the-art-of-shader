import * as THREE from "three";
import vs from "./glsl/background.vs";
import fs from "./glsl/background.fs";

export default class Background extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.SphereGeometry(100, 12, 12);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0,
        },
        hex: {
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

/**
 * ShaderMaterial vs RawShaderMaterial
 *
 * THREE.JS 에서 기본 제공하는 uniform 및 attibute 내장변수가
 * ShaderMaterial 에는 prepended 되어있는 반면,
 * RawShaderMaterial 은 해당 변수들을 직접 셰이더 코드에 선언해줘야 함.
 *
 * 그래서, ShaderMaterial 사용 시
 * 해당 변수들을 직접 선언하면 redefinition 에러가 발생함.
 */
