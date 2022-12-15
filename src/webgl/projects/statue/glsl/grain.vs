// built-in attribute 변수
attribute vec3 position;
attribute vec3 normal;

// built-in uniform 변수
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 사용자 정의 uniform
uniform mat3 customNormalMatrix; // js(cpu) 단에서 미리 계산된 노말행렬 (버텍스마다 노멀행렬을 계산하면 gpu 가 동일한 연산을 불필요하게 반복하는 문제가 있음.)

// 보간변수
varying vec3 vNormal; // 월드공간 노멀벡터를 구해서 프래그먼트 셰이더로 보간할 것임.

void main() {
  vNormal = customNormalMatrix * normal; // js(cpu) 단에서 미리 계산된 노말행렬을 곱해 노말벡터를 월드공간 노멀벡터로 변환함.

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}