import * as THREE from "three";
import vs from "./glsl/magicCircle.vs";
import fs from "./glsl/magicCircle.fs";

export default class MagicCircle extends THREE.Mesh {
  private rotateSpeed: number; // 마법진 회전 속도

  private rotateDirection: number; // 마법진 회전 방향

  constructor(rotateSpeed: number, rotateDirection: number) {
    const geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0, // 시간변수
        },
        texture: {
          value: null, // 마법진 텍스쳐
        },
        hsv: {
          value: new THREE.Vector3(0, 0, 0), // 0 ~ 1 시이의 vec3 타입의 hsv 컬러값
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false, // z-fighting 현상 방지
    });
    super(geometry, material);
    this.name = "MagicCircle";
    this.rotateSpeed = rotateSpeed;
    this.rotateDirection = rotateDirection;
  }

  public update(time: number): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.time.value = time;
    }

    this.rotateMagicCircle();
  }

  private rotateMagicCircle(): void {
    this.rotateZ(
      THREE.MathUtils.degToRad(this.rotateSpeed * this.rotateDirection)
    );
  }

  public init(): void {
    this.rotateX(THREE.MathUtils.degToRad(-90));
  }

  public setTexture(texture: THREE.Texture): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.texture.value = texture;
    }
  }

  public setHSV(hsv: THREE.Vector3): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.hsv.value = hsv;
    }
  }
}
