import * as THREE from "three";
import vs from "./glsl/points.vs";
import fs from "./glsl/points.fs";
import Drag from "./Drag";

const NUM = 10000; // 포인트 개수
const NUM_BRANCHES = 5; // 나선형의 가지 개수
const MAX_RADIUS = 10; // 원점에서 각 포인트까지의 최대 반경
const SPIN = 1; // 원점에서의 반경에 따른 가지 휨 정도 (값이 커질수록 가지가 더 많이 휨)
const RANDOMNESS = 0.3; // 랜덤값의 범위를 결정해 줌.
const RANDOMNESS_POWER = 0.8; // 랜덤값의 제곱 지수를 결정함. -> 값이 클수록 지수함수 곡선이 더 심해지겠지!
const SPEED = 0.1; // 각 Points 버텍스의 전체적인 회전 속도

export default class Points extends THREE.Points {
  constructor() {
    const geometry = new THREE.BufferGeometry();

    // bufferGeometry 의 position attribute 변수에 할당할 데이터 정의
    const positions = new THREE.BufferAttribute(new Float32Array(NUM * 3), 3); // 32비트 실수로 저장하는 형식화 배열의 크기를 NUM * 3 개로 지정. (position 은 x, y, z 가 필요하니까)
    for (let i = 0; i < NUM; i++) {
      const radius = MAX_RADIUS * Math.random(); // 랜덤한 반경 -> 원점 ~ 각 포인트를 잇는 벡터 거리
      const spinAngle = radius * SPIN; // 원점에서의 반경에 비례해서 x,z좌표의 sin(), cos() 각도에 더해줄 값 -> 거리가 멀어지면 더 휘면서 나선형 가지가 그려지겠지
      const branchAngle = ((i % NUM_BRANCHES) / NUM_BRANCHES) * 2 * Math.PI; // 나선형 가지별 각도

      // Points 좌표들에 무작위성을 더해주기 위해 계산된 랜덤값들
      const randomX =
        Math.pow(Math.random(), RANDOMNESS_POWER) *
        (Math.random() - 0.5) *
        RANDOMNESS *
        radius;
      const randomY =
        Math.pow(Math.random(), RANDOMNESS_POWER) *
        (Math.random() - 0.5) *
        RANDOMNESS *
        radius;
      const randomZ =
        Math.pow(Math.random(), RANDOMNESS_POWER) *
        (Math.random() - 0.5) *
        RANDOMNESS *
        radius;

      let x = radius * Math.sin(branchAngle + spinAngle) + randomX;
      let y = randomY;
      let z = radius * Math.cos(branchAngle + spinAngle) + randomZ;

      positions.setXYZ(i, x, y, z);
    }
    geometry.setAttribute("position", positions);

    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0,
        },
        maxRadius: {
          value: MAX_RADIUS,
        },
        speed: {
          value: SPEED,
        },
        resolution: {
          value: new THREE.Vector2(0, 0), // 리사이징되는 window 사이즈 vec2 값으로 전송됨.
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    super(geometry, material);
    this.name = "Points";
  }

  init() {}

  update(time: number, drag: Drag) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.time.value = time;
    }

    if (drag) {
      this.rotation.set(
        THREE.MathUtils.degToRad(drag.vCur.y - 5),
        THREE.MathUtils.degToRad(drag.vCur.x + 5),
        THREE.MathUtils.degToRad(-10)
      );
    }
  }

  resize(resolution: THREE.Vector2) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.resolution.value.copy(resolution); // 리사이징된 window 사이즈를 유니폼 변수로 재전송함.
    }
  }
}

/**
 * branchAngle
 *
 * i는 정수이고, NUM_BRANCHES 로 나눈 나머지 연산은 0 ~ NUM_BRANCHES 사이의 정수임.
 * 따라서, (0 ~ NUM_BRANCHES 사이의 정수 / NUM_BRANCHES) 를
 * 360도의 라디안 값으로 나눈 일정한 각도들이 계산되겠지.
 *
 * 결과적으로, 나선형의 가지마다 고유의 각도가 계산되겠군!
 */

/**
 * randomX,Y,Z
 *
 * Math.pow(Math.random(), RANDOMNESS_POWER) *
 * (Math.random() - 0.5) *
 * RANDOMNESS *
 * radius;
 *
 * 위의 공식을 보면, 나선형 가지들을 이루는 Points 좌표들에
 * 무작위성을 더해주기 위해서 계산하는 랜덤값임을 알 수 있음.
 *
 * 이때,
 * RANDOMNESS_POWER 는 값이 커질수록 pow 의 결과값이 더욱 지수함수 곡선을 그리게 해주고,
 * RANDOMNESS 는 값이 커질수록 랜덤값의 범위를 확장해주고,
 * radius 는 원점에서 거리가 먼 반경일수록 랜덤값의 범위가 확장되겠지!
 */
