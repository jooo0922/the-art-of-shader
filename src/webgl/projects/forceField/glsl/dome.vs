// built-in attribute 변수
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// built-in uniform 변수
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
// uniform mat3 normalMatrix; // 모델뷰 행렬을 기준으로 만든 노말행렬. 즉, 행렬곱을 하면 뷰 공간에서의 노말벡터가 나오기 때문에 결과가 이상하게 나올 것임.

// 사용자 정의 uniform
uniform mat3 customNormalMatrix; // js(cpu) 단에서 미리 계산된 노말행렬 (버텍스마다 노멀행렬을 계산하면 gpu 가 동일한 연산을 불필요하게 반복하는 문제가 있음.)

// 보간 변수
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec4 mPosition = modelMatrix * vec4(position, 1.0); // 모델행렬만 곱해서 월드좌표로 변환

  vNormal = customNormalMatrix * normal; // js(cpu) 단에서 미리 계산된 노말행렬을 곱해 노말벡터를 월드공간 노멀벡터로 변환해서 보간함.
  vPosition = mPosition.xyz; // 모델행렬을 곱해 버텍스 위치를 월드좌표로 변환함.
  vUv = uv;

  gl_Position = projectionMatrix * viewMatrix * mPosition; // 나머지 변환행렬을 곱해서 클립좌표로 저장됨
}