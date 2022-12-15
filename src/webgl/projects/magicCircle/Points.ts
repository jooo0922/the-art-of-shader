import * as THREE from "three";
import vs from "./glsl/points.vs";
import fs from "./glsl/points.fs";

const DURATION = 4; // 각 포인트의 투명도 최대 지속시간
const NUM = 50; // 포인트 개수
const ROTATE_SPEED = 0.2; // Points 객체 전체를 회전시키는 속도

export default class Points extends THREE.Points {
  constructor() {
    const geometry = new THREE.BufferGeometry();

    // bufferGeometry 의 attribute 변수에 할당할 데이터 정의 (position, delay)
    const positions = new THREE.BufferAttribute(new Float32Array(NUM * 3), 3); // 32비트 실수로 저장하는 형식화 배열의 크기를 NUM * 3 개로 지정. (position 은 x, y, z 가 필요하니까)
    const delays = new THREE.BufferAttribute(new Float32Array(NUM), 1); // 32비트 실수로 저장하는 형식화 배열의 크기를 NUM 개로 지정. (각 포인트별 투명도 지속시간값은 1개면 충분함)
    for (let i = 0; i < NUM; i++) {
      const radian = THREE.MathUtils.degToRad(Math.random() * 360); // 0 ~ 360 도 사이의 랜덤한 각도를 radian 각도로 받음
      const radius = Math.random() * 4 + 1; // 1 ~ 5 사이의 랜덤한 반지름값을 리턴받음. -> 마침 MagicCircle 반지름도 5 이므로, MagicCircle 내부에 골고루 위치되겠군
      positions.setXYZ(
        i,
        Math.cos(radian) * radius,
        0, // Points 의 각 버텍스의 높이값(y 좌표값)은 일단 전부 0으로 넣어주고 있음. (높이값은 시간에 따라, delay 값에 따라 버텍스 셰이더에서 따로 계산해줄거임.)
        Math.sin(radian) * radius
      ); // 원의 좌표를 구하는 공식을 활용해서, random 한 반지름 radius 정도 크기의 원에 존재하는 랜덤한 radian 각도에 해당하는 원의 좌표를 positions의 X, Z 좌표값에 각각 계산해서 넣어줌.
      delays.setX(i, Math.random() * DURATION); // 각 포인트 투명도 지속시간을 0 ~ 4 사이의 랜덤값으로 넣어줌.
    }
    geometry.setAttribute("position", positions); // positions 버텍스 데이터를 "position" attribute 변수에 전송함
    geometry.setAttribute("delay", delays); // delays 버텍스 데이터를 "delay" attribute 변수에 전송함

    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: {
          value: 0, // 시간변수
        },
        duration: {
          value: DURATION, // 최대 지속시간인 4가 유니폼 변수로 전송함.
        },
        resolution: {
          value: new THREE.Vector2(0, 0), // 리사이징되는 window 사이즈 vec2 값으로 전송됨.
        },
        maxY: {
          value: 20.0, // 각 Point 들이 y축 방향으로 최대한 올라갈 수 있는 높이값
        },
        noiseTex: {
          value: null, // 노이즈 텍스쳐
        },
        hsv: {
          value: new THREE.Vector3(0, 0, 0), // 0 ~ 1 시이의 vec3 타입의 hsv 컬러값
        },
      },
      vertexShader: vs,
      fragmentShader: fs,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false, // 깊이버퍼를 저장하지 않음.
      // -> 이런 걸 왜 해주냐면, 일반적으로 알파 블렌딩이 적용된 요소들 끼리는 카메라 위치와의 거리를 따져서 카메라와 거리가 먼 것부터 먼저 그리게 됨.
      // 근데, 이렇게 알파소팅을 해줘봤자, 카메라와 각 요소들 사이의 거리를 정확하게 비교하는 게 어렵기 때문에, 눈으로 봤을땐 분명 앞에 있는 물체가 맞는데
      // 피봇 중심점을 기준으로 거리를 계산하는 gpu 는 오히려 뒤에 있는 물체를 앞에 있는 물체로 인식해서 해당 물체의 투명한 픽셀로 인해 앞에 있는 물체가 잘리는 현상이 발생함.
      // 이를 방지하기 위해, 아예 깊이버퍼를 저장하지 않도록 함으로써, 카메라와의 거리 비교를 안하게 되고, 그로 인해 깊이값과 상관없이 앞뒤의 픽셀들을 잘림없이 렌더링하려는 것임.
    });

    super(geometry, material);
    this.name = "Points";
  }

  public init(): void {}

  public update(time: number): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.time.value = time;
      this.rotation.set(0, time * ROTATE_SPEED, 0); // Points 객체 전체를 시간이 지날때마다 y축 방향으로 ROTATE_SPEED 정도의 속도로 회전시킴
    }
  }

  public resize(resolution: THREE.Vector2): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.resolution.value.copy(resolution); // 리사이징된 window 사이즈를 유니폼 변수로 재전송함.
    }
  }

  public setTexture(texture: THREE.Texture): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.noiseTex.value = texture;
    }
  }

  public setHSV(hsv: THREE.Vector3): void {
    if (this.material instanceof THREE.RawShaderMaterial) {
      this.material.uniforms.hsv.value = hsv;
    }
  }
}
