// built-in attribute 변수
attribute vec3 position;
attribute vec2 uv;

// built-in uniform 변수
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 보간 변수
varying vec2 vUv;

void main() {
  vec4 mPosition = modelMatrix * vec4(position, 1.0); // 모델행렬만 곱해서 월드좌표로 변환

  vUv = uv; // 버텍스 uv 좌표데이터 보간하여 프래그먼트 셰이더로 넘김

  gl_Position = projectionMatrix * viewMatrix * mPosition; // 나머지 변환행렬을 곱해서 클립좌표로 저장됨
}