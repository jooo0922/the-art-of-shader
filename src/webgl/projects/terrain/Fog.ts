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
      depthTest: false, // 깊이테스트를 비활성화하여, 어떤 물체보다도 Fog 인스턴스가 맨앞에 렌더링되도록 함.
      side: THREE.DoubleSide, // 양면 렌더링 활성화
    });
    super(geometry, material, NUM_INSTANCE); // InstancedGeometry 에 복사된 평면 지오메트리를 NUM_INSTANCE 개수만큼 인스턴싱해서 InstancedMesh 가 생성될 것임.
    this.name = "Fog";

    // 기본 평면 지오메트리를 InstancedGeometry 에 하나 복사해 줌.
    // 이제 InstancedGeometry 로 InstancedMesh 를 만든다면, 복사된 PlaneGeometry 를 인스턴싱해서 만들게 될 것임.
    const baseGeometry = new THREE.PlaneGeometry(160, 160, 20, 20);
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
        (Math.random() * 2 - 1) * 200, // -200 ~ 200 사이의 x좌표값
        -70, // y좌표값(높이)는 -70으로 고정 (Terrain 의 아랫부분에 안개가 깔리게 하려고 기본높이값을 낮춘 것.)
        0
      ); // instancePosition 은 실제 각 평면의 버텍스는 아니지만, 각 평면의 버텍스에 더해짐으로써, 각 평면의 x좌표값 계산에 기여함.
      delays.setX(i, Math.random()); // 각 평면 인스턴스마다 지연시간을 결정해주는 값을 0 ~ 1 사이의 값으로 랜덤 할당.
      rotates.setX(i, Math.random() * 2 - 1); // 각 평면 인스턴스마다 초기 회전각도를 결정해주는 값을 -1 ~ 1 사이로 랜덤 할당.
    }

    // InstancedGeometry 의 각 버텍스마다 attribute 할당
    geometry.setAttribute("instancePosition", instancePositions);
    geometry.setAttribute("delay", delays);
    geometry.setAttribute("rotate", rotates);
  }

  update(time: number) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.time.value = time;
    }
  }

  init(camera: Camera) {
    camera.add(this); // Fog 객체가 카메라를 따라다니도록 자식요소로 추가함.
    this.position.set(0, -60, -180); // Fog 의 오브젝트공간 좌표(로컬좌표)를 설정하여 카메라로부터 약간 떨어지도록 함. -> 그래야 카메라에 Fog 가 찍힐테니까
  }

  setTexture(fogTex: THREE.Texture) {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.fogTex.value = fogTex;
    }
  }
}
