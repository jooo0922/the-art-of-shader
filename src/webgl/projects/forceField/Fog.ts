import * as THREE from "three";
import vs from "./glsl/fog.vs";
import fs from "./glsl/fog.fs";
import Camera from "./Camera";

const NUM_INSTANCE = 50; // 인스턴스 개수

// THREE.InstancedMesh 를 사용하는 이유는, 안개 텍스쳐를 인스턴싱되는 수백 개의 평면에 씌워서 안개를 구현할 것이기 때문임.
export default class Fog extends THREE.InstancedMesh {
  constructor() {
    const geometry = new THREE.InstancedBufferGeometry();
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0,
        },
        fogTex: {
          value: null, // 각 인스턴스 평면마다 입혀줄 안개 텍스쳐
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      transparent: true, // 알파블렌딩 쉐이더 활성화
      blending: THREE.AdditiveBlending, // 가산 블렌딩 모드 적용
      depthWrite: false, // 깊이버퍼를 작성하지 않음으로써, 깊이값에 의해 투명 픽셀이 뒷쪽 픽셀을 잘라버리는 현상 방지
      side: THREE.DoubleSide, // 양면 렌더링 활성화
    });
    super(geometry, material, NUM_INSTANCE); // InstancedGeometry 에 복사된 평면 지오메트리를 NUM_INSTANCE 개수만큼 인스턴싱해서 InstancedMesh 가 생성될 것임.
    this.name = "Fog";

    // 기본 평면 지오메트리를 InstancedGeometry 에 하나 복사해 줌.
    // 이제 InstancedGeometry 로 InstancedMesh 를 만든다면, 복사된 PlaneGeometry 를 인스턴싱해서 만들게 될 것임.
    const baseGeometry = new THREE.PlaneGeometry(1100, 1100, 20, 20);
    geometry.copy(baseGeometry);

    // InstancedGeometry 의 각 평면 인스턴스의 버텍스들이 공유하는 버텍스 셰이더 attribute 정의
    const instancePositions = new THREE.InstancedBufferAttribute(
      new Float32Array(NUM_INSTANCE * 3),
      3
    );
    const delays = new THREE.InstancedBufferAttribute(
      new Float32Array(NUM_INSTANCE),
      1
    );
    const rotates = new THREE.InstancedBufferAttribute(
      new Float32Array(NUM_INSTANCE),
      1
    );
    for (let i = 0; i < NUM_INSTANCE; i++) {
      instancePositions.setXYZ(
        i, // 몇 번째 평면 인스턴스의 attribute 로 설정할 것인지, 즉, 인스턴스 인덱스
        (Math.random() * 2 - 1) * 850, // -850 ~ 850 사이의 x좌표값
        0, // y좌표값(높이)는 0으로 고정
        this.getFilteredRandomZ() // -90 ~ -70 및 70 ~ 90 사이의 필터링된 z좌표값
      ); // instancePosition 은 실제 각 평면의 버텍스는 아니지만, 각 평면의 버텍스에 더해짐으로써, 각 평면의 x, z 위치 계산에 기여함.
      delays.setX(i, Math.random()); // 각 평면 인스턴스마다 지연시간을 결정해주는 값을 0 ~ 1 사이의 값으로 랜덤 할당.
      rotates.setX(i, Math.random() * 2 - 1); // 각 평면 인스턴스마다 초기 회전각도를 결정해주는 값을 -1 ~ 1 사이로 랜덤 할당.
    }

    // InstancedGeometry 의 각 버텍스마다 attribute 할당
    geometry.setAttribute("instancePosition", instancePositions);
    geometry.setAttribute("delay", delays);
    geometry.setAttribute("rotate", rotates);
  }

  // 특정 범위 내의 랜덤값들 중에서 또 다른 범위 내의 랜덤값을 필터링하는 메서드
  private getFilteredRandomZ() {
    /**
     * 필터링 범위를 -90 ~ -70, 70 ~ 90 사이로 잡은 이유
     *
     * 필터링 범위를 위와 같이 잡은 건 아래의 3가지 조건을 고려함.
     * 1. Dome 의 반지름: 50
     * 2. 원점에서부터 카메라의 거리: 약 110
     * 3. fog.vs 에서 moveRise 계산 시, sin 함수에 의해 z값이 왔다갔다 하는 범위: -15 ~ 15 사이
     *
     * 일단, 평면 지오메트리가 z축 방향으로 펄럭일 때,
     * Dome 을 가로지르면 안되므로, 필터링 범위의 최대/최소값을 70, -70 으로 잡아줌.
     * 여기에 -15, 15를 더해준다면, 아무리 침범해봐야 55, -55 까지 침범하게 되고,
     * Dome 의 반지름은 50 이니까 Dome 을 가로지르지 않음.
     *
     * 또한, 평면 지오메트리가 카메라도 가로지르면 안되므로,
     * z좌표값의 최대/최소값을 90, -90 으로 잡아줌.
     * 여기에 15, -15를 더해준다면, 아무리 침범해봐야 105, -105 까지 침범하게 되고,
     * 원점에서부터 카메라의 거리가 약 110 이니까 카메라도 가로지르지 않음.
     */
    let randomZ,
      minZ = -90, // 최대 z좌표값
      maxZ = 90, // 최소 z좌표값
      midZ = 0, // 중간 z좌표값
      minFilter = -70, // 필터링 범위의 최소 z좌표값
      maxFilter = 70; // 필터링 범위의 최대 z좌표값
    randomZ = (Math.random() * 2 - 1) * maxZ;
    if (midZ < randomZ && randomZ < maxFilter) {
      // z값이 0 ~ 70 사이의 값이라면, 70 ~ 90 사이의 랜덤값으로 필터링함.
      randomZ = Math.random() * (maxZ - maxFilter) + maxFilter;
    }
    if (minFilter < randomZ && randomZ < midZ) {
      // z값이 -70 ~ 0 사이의 값이라면, -90 ~ -70 사이의 랜덤값으로 필터링함.
      randomZ = Math.random() * (minZ - minFilter) + minFilter;
    }
    return randomZ;
  }

  update(time: number, rtCamera: Camera) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.time.value = time;
    }

    // OrbitControls 로 카메라를 돌렸을 때, 안개 텍스쳐 평면들이 비스듬히 보이지 않도록 하기 위해,
    // 안개 텍스쳐가 씌워진 평면들이 렌더타겟 카메라만 바라보도록 함.
    this.lookAt(rtCamera.position);
  }

  setTexture(fogTex: THREE.Texture) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.fogTex.value = fogTex;
    }
  }
}
