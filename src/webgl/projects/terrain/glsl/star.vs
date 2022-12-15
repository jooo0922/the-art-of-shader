// built-in attribute
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// 사용자 정의 attribute
attribute vec3 instancePosition; // 실제 구체의 버텍스 위치는 아니지만, 각 구체의 버텍스 위치들에 더해짐으로써, '사실상' 구체의 위치를 결정하는 attribute 변수 (하나의 구체 인스턴스에 존재하는 버텍스들끼리는 값이 동일함.)
attribute float instanceScale; // 각 구체 인스턴스의 버텍스마다 곱해주는 크기행렬에 적용할 크기값 

// built-in uniform
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 사용자 정의 uniform
uniform mat3 customNormalMatrix; // js(cpu) 단에서 미리 계산된 노말행렬 (버텍스마다 노멀행렬을 계산하면 gpu 가 동일한 연산을 불필요하게 반복하는 문제가 있음.)

// 보간변수
varying vec3 vPosition; // 월드공간 버텍스좌표를 보간하여 넘김.
varying vec3 vNormal; // 월드공간 노멀벡터를 보간하여 넘김.
varying vec2 vUv; // 버텍스 uv좌표를 보간하여 넘김. 

// 각 구체 인스턴스의 랜덤 크기값을 받아 XYZ 축을 모두 동일하게 크기변환 시키는 3차원 아핀공간 크기행렬을 반환하는 함수
mat4 scale3dXYZ(float scale) {
  return mat4(
    // 열 우선 행렬
  scale, 0.0, 0.0, 0.0, // 1열
  0.0, scale, 0.0, 0.0, // 2열
  0.0, 0.0, scale, 0.0, // 3열
  0.0, 0.0, 0.0, 0.1 // 4열
  );
}

void main() {
  mat4 scaleXYZMat = scale3dXYZ(instanceScale); // 특정 크기값으로 XYZ축 모두 동일하게 크기변환 시키는 크기행렬 계산
  vec3 scalePosition = (scaleXYZMat * vec4(position, 1.0)).xyz; // 각 구체 버텍스의 위치좌표를 크기행렬로 곱함으로써, 구체 버텍스들을 instanceScale 만큼 크기변환함.
  vec3 finalPos = instancePosition + scalePosition; // 각 구체 인스턴스 고유의 위치값과 크기변환이 적용된 구체의 버텍스 좌표값을 더해 최종 오브젝트공간 버텍스 좌표값을 계산함.
  vec4 mPosition = modelMatrix * vec4(finalPos, 1.0); // 모델행렬만 먼저 곱해서 최종 오브젝트공간 버텍스 좌표를 월드좌표로 변환

  vPosition = mPosition.xyz; // 월드공간 좌표를 보간하여 프래그먼트 셰이더로 넘김
  vNormal = customNormalMatrix * normal; // 월드공간 노멀벡터로 변환 후, 보간하여 프래그먼트 셰이더로 넘김 
  vUv = uv; // 버텍스 uv 좌표를 보간하여 프래그먼트 셰이더로 넘김

  gl_Position = projectionMatrix * viewMatrix * mPosition;
}

/*
  항상 모델 변환을 적용할 때에는,
  1. 크기변환
  2. 회전변환
  3. 이동변환 
  순서대로 적용해야 함.

  아핀변환 행렬도
  크기행렬 -> 회전행렬 -> 이동행렬 순으로 곱해줘야 하고,
  
  위에서처럼
  1. 크기행렬을 먼저 곱해주고 나서,
  2. instancePosition 을 더해 이동변환을 취해줘야 함.

  이는 상식적으로 생각해보면
  버텍스가 정확하게 변환되기 위해서는 
  당연히 지켜줘야 하는 순서임. 

  [참고] https://woo-dev.tistory.com/165
*/