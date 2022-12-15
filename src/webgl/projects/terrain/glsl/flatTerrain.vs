#version 300 es

// built-in attribute
in vec3 position;
in vec3 normal;
in vec2 uv;

// built-in uniform
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 사용자 정의 uniform
uniform float time;

// 보간변수
out vec3 vMPosition; // 월드공간 좌표값을 보간하여 넘김. (프래그먼트 셰이더에서 편미분으로 노멀벡터 계산할 때 사용할 것임.)

// Simplex noise 함수 가져오기 
// 참고로 cnoise2 은 vec2 를 인자로 받아 -1 ~ 1 사이의 실수값을 반환함.
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

void main() {
  vec4 mPosition = modelMatrix * vec4(position, 1.0); // 모델행렬만 먼저 곱해서 월드좌표로 변환

  // Terrain 이 x축으로 -90도 회전한 상태이므로, 모델행렬이 곱해진 월드좌표를 기준으로 y축을 계산해줘야 제대로 움직임.
  // position 은 오브젝트좌표(로컬좌표) 기준이기 때문에, y축을 계산해주면 z축 방향으로 움직임 -> PlaneGeometry 를 회전시켰으니까!
  // 각 버텍스의 y좌표값 elevation 값 계산 (노이즈 텍스쳐 활용)
  float elevation1 = (snoise2(uv * 5.0) * 2.0 - 1.0) * 100.0;
  float elevation2 = (snoise2(uv * 20.0) * 2.0 - 1.0) * 10.0;
  float elevation3 = (snoise2(uv * 100.0) * 2.0 - 1.0) * 2.0;
  float finalElevation = elevation1 + elevation2 + elevation3;
  mPosition.y += finalElevation;

  vMPosition = mPosition.xyz;

  gl_Position = projectionMatrix * viewMatrix * mPosition; // 나머지 변환행렬을 곱해서 클립좌표로 저장됨
}