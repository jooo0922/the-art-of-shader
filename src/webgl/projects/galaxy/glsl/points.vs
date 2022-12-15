// 사용자 정의 attribute 변수
attribute vec3 position;

// built-in uniforms 변수
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 사용자 정의 uniforms 변수
uniform float time; // 시간 변수
uniform float speed; // 각 Points 버텍스의 회전 속도 변수
uniform vec2 resolution; // 리사이징될 때마다 갱신되는 브라우저 window 사이즈

// 사용자 정의 varying 변수
varying float vRadius; // 로컬좌표 원점(즉, Points 객체의 중심점) ~ 각 Points 버텍스의 로컬좌표 사이의 거리 -> 즉, 각 버텍스의 원점으로부터의 반경이지!

// Classic Perlin noise 함수 가져오기 
// 참고로 cnoise3 은 vec3 를 인자로 받아 -1 ~ 1 사이의 실수값을 반환함.
#pragma glslify: cnoise3 = require(glsl-noise/classic/3d)

// 특정 각도에 대한 3차원 아핀공간 y축 회전행렬을 반환하는 함수
mat4 rotation3dY(float angle) {
  float sin = sin(angle);
  float cos = cos(angle);

  return mat4(
  // 열 우선 행렬
  cos, 0.0, -sin, 0.0, // 1열
  0.0, 1.0, 0.0, 0.0, // 2열
  sin, 0.0, cos, 0.0, // 3열
  0.0, 0.0, 0.0, 1.0 // 4열
  );
}

void main() {
  vRadius = length(position); // 로컬좌표 원점(즉, Points 객체의 중심점) ~ 각 Points 버텍스의 로컬좌표 사이의 거리 -> 즉, 각 버텍스의 원점으로부터의 반경이지!
  vec4 mPosition = modelMatrix * vec4(position, 1.0); // 모델행렬만 곱해서 월드좌표로 변환

  float angle = time * speed; // 시간의 흐름 및 속도에 따른 회전 각도
  vec4 mvPosition = viewMatrix * rotation3dY(angle) * mPosition; // 카메라 뷰 행렬 * 회전각도에 대한 y축 4*4 회전행렬 * 각 Points 버텍스 월드좌표

  float distanceFromCamera = length(mvPosition.xyz); // 카메라에서 각 Point 버텍스 사이의 거리
  float randomSize = cnoise3(position) * 0.5 + 1.0; // -1.0 ~ 1.0 사이의 cnoise 리턴값을 0.5 ~ 1.5 사이의 랜덤한 크기값으로 맵핑함.
  float pointSize = randomSize * (40.0 / distanceFromCamera) * (resolution.y / 1024.0); // 최종 pointSize 계산
  // pointSize 계산 시, Ball 과 다르게 pixelRatio 를 곱해주지 않음.
  // Ball 에서는 pixelRatio 를 곱해주지 않으면, 맥북같은 레티나 디스플레이에서는 Point 가 너무 작아져서 곱해줘야 하지만,
  // Galaxy, MagicCircle 등에서는 pixelRatio 를 곱해주면 레티나에서 오히려 사이즈가 비정상적으로 커짐. 
  // 아마 PointSize 를 계산하는 과정, 또는 렌더링하는 방식이 달라서 그런 것 같음...

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = pointSize;
}

/*
  gl_PointSize 계산 과정

  1. randomSize
  classic perlin noise 함수를 이용해서
  0.5 ~ 1.5 사이의 랜덤한 포인트 크기값을 계산함.

  1. 일단 pixelRatio 는 해상도가 클수록 css 픽셀 하나 당 물리적 픽셀 개수가 많아지므로,
  디바이스 해상도에 비례해서 point 사이즈가 커질 것이고,
  distanceFromCamera(각 버텍스와 카메라 사이의 거리)에는 당연히 반비례하게 사이즈가 계산될거임. 
  거리가 멀수록 작아지고, 거리가 가까울수록 커지겠지.

  2. 그리고 resolution.y / 1024.0 은 아마 
  브라우저 window 높이값이 1024.0 일 때를 기준으로 리사이징된 브라우저 사이즈가 몇이냐에 따라 
  point 사이즈를 결정하려고 하는거 같음. window 높이값이 1024.0 인 애는 원래의 사이즈대로 나올 것이고,
  1024.0 보다 크면 point 사이즈도 커질 것이고, 1024.0 보다 작으면 point 사이즈도 작아지겠군
*/