import * as THREE from "three";
import vs from "./glsl/typoWarp.vs";
import fs from "./glsl/typoWarp.fs";

// OctahedronGeometry, IcosahedronGeometry, SphereGeometry 등등 뭘 이용해서 blob 을 만들건 상관없는데,
// geometry 사이즈(반지름)가 일정 수준 이상이어야 vertex shader 에서 noise 함수로 차이가 확확 나는 랜덤값을 뽑아낼 수 있음.
// 만약 반지름이 너무 작다면, noise 함수로 들어가는 position 값에 큰 차이가 없기 때문에, 비슷한 값의 noise 값을 반환받게 될 것임.
// -> 이로 인해 blob 이 제대로 그려지지 않음!
const RADIUS = 100;
const TUBE = RADIUS;

export default class TypoWarp extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.TorusGeometry(
      RADIUS,
      TUBE,
      64,
      100,
      Math.PI * 2
    ); // torus 지오메트리를 Warp 의 기본형태로 사용
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0, // 시간변수
        },
        speed: {
          value: 0.5, // uv 스크롤링 속도값
        },
        texture: {
          value: null, // typo 텍스쳐
        },
        texDirection: {
          value: new THREE.Vector2(0, 0), // 텍스쳐 u, v 방향값
        },
        texRepeat: {
          value: new THREE.Vector2(0, 0), // 텍스쳐 u, v 반복횟수
        },
        amplitude: {
          value: 0.83, // blob 규모, 진폭
        },
        frequency: {
          value: 0.28, // blob 주기(자글자글한 정도)
        },
        radius: {
          value: RADIUS, // blob 에 사용된 geometry 의 반지름
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      transparent: true, // .png 텍스쳐의 알파값(투명도)을 적용하기 위해 반투명 셰이더로 적용
    });
    super(geometry, material);
    this.name = "Warp";
  }

  init() {
    this.rotation.x = -Math.PI / 2; // Warp 객체를 x축으로 -90도 회전시킴.
  }

  setTexture(texture: THREE.Texture) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.texture.value = texture;
    }
  }

  setTexDirection(u: number, v: number) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.texDirection.value.set(u, v);
    }
  }

  setTexRepeat(u: number, v: number) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.texRepeat.value.set(u, v);
    }
  }

  update(time: number) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.time.value = time;
    }
  }
}
