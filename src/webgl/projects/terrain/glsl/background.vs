// built-in attribute
attribute vec3 position;
attribute vec2 uv;

// built-in uniform
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 보간변수
varying vec2 vUv;

void main() {
  vec4 mPosition = modelMatrix * vec4(position, 1.0); // 모델행렬만 먼저 곱해서 월드좌표로 변환

  vUv = uv;

  gl_Position = projectionMatrix * viewMatrix * mPosition; // 나머지 변환행렬을 곱해서 클립좌표로 저장됨
}