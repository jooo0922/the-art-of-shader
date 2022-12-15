import * as THREE from "three";
import vs from "./glsl/ray.vs";
import fs from "./glsl/ray.fs";

export default class Ray extends THREE.Mesh {
  public readonly rayWidth: number;

  public readonly rayHeight: number;

  constructor(rayWidth: number, rayHeight: number) {
    const geometry = new THREE.PlaneGeometry(rayWidth, rayHeight, 2, 2);
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0, // 시간변수
        },
        fadeSpeed: {
          value: 0, // 광선이 fade 효과로 나타나거나 사라지는 속도
        },
        moveDistance: {
          value: 0, // 광선이 y축으로 움직이는 최대 이동거리. 값이 클수록 더 많이 움직임.
        },
        texture: {
          value: null, // 광선 텍스쳐
        },
        hsv: {
          value: new THREE.Vector3(0, 0, 0), // 0 ~ 1 시이의 vec3 타입의 hsv 컬러값
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false,
    });
    super(geometry, material);
    this.name = "Ray";
    this.rayWidth = rayWidth;
    this.rayHeight = rayHeight;
  }

  public init(): void {}

  public update(time: number): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.time.value = time;
    }
  }

  public setPosition(x: number, y: number, z: number): void {
    this.position.set(x, y, z);
  }

  public setRotation(x: number, y: number, z: number): void {
    this.rotation.set(x, y, z);
  }

  public setFadeSpeed(fadeSpeed: number): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.fadeSpeed.value = fadeSpeed;
    }
  }

  public setMoveDistance(moveDistance: number): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.moveDistance.value = moveDistance;
    }
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
