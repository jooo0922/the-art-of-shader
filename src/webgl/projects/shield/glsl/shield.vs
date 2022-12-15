// built-in attribute 변수
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// built-in uniform 변수
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 사용자 정의 uniforms
uniform float time; // 시간변수 -> 버텍스 애니메이션 계산에 필요
uniform float moveSpeed; // 각 Hexagon 이동속도
uniform float maxMoveRadius; // 각 Hexagon 들의 최대 이동반경
uniform mat3 customNormalMatrix; // js(cpu) 단에서 미리 계산된 노말행렬 (버텍스마다 노멀행렬을 계산하면 gpu 가 동일한 연산을 불필요하게 반복하는 문제가 있음.)

// 보간 변수
varying vec3 vPosition; // 월드공간 버텍스 좌표를 구해서 프래그먼트 셰이더로 보간할 것임.
varying vec3 vNormal; // 월드공간 노멀벡터를 구해서 프래그먼트 셰이더로 보간할 것임. 
varying vec2 vUv; // 버텍스 uv 좌표값을 보간하여 프래그먼트 셰이더로 넘겨줌
varying float vMoveDistance; // 각 버텍스가 노말방향으로 이동한 거리값(정확히는 이동거리 계산에 사용된 0 ~ 1 사이의 노이즈값)을 프래그먼트 셰이더로 보간하여 넘김. 
// 만약 동일한 Hexagon 내에 존재하는 버텍스라면 노멀벡터가 동일하므로, 이동거리도 동일할거임.
// 단, 최대 이동거리를 곱하기 전 상태인 noise 값만 넘겨줌. 왜냐면, 프래그먼트 셰이더에서 필요한 건 0 ~ 1 범위의 값이지, 0 ~ 최대 이동거리 범위의 값이 아니기 때문!

// Simplex noise 함수 가져오기 
// 참고로 snoise3 은 vec3 를 인자로 받아 -1 ~ 1 사이의 실수값을 반환함.
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

void main() {
  // Hexagon 랜덤 이동반경 계산
  float noise = snoise3((normal + time * moveSpeed) * 1.25) * 0.5 + 0.5; // 시간변수에 이동속도값 곱함. 1.25 를 곱해준 이유는 샘플링 좌표 범위를 넓혀서 hexagon 간의 이동간격 차이를 키워주려는 것. 
  float moveRadius = noise * maxMoveRadius; // 노이즈값에 최대 이동반경을 곱해서 

  // Hexagon 이동방향 계산
  vec3 moveDirection = normal; // 이동 방향은 각 Hexagon 버텍스들의 노멀벡터 방향과 일치시킴

  // 각 Hexagon 별 최종 이동값(이동벡터) 계산 -> 이동방향 * 이동거리(반경)
  vec3 movePosition = moveRadius * moveDirection; // 0 ~ maxMoveRadius 사이의 길이를 갖는 이동값(이동벡터)
  vec4 mPosition = modelMatrix * vec4(position + movePosition, 1.0); // 모델행렬만 곱해서 월드좌표로 변환

  vMoveDistance = max(0.0, noise * 2.0 - 1.0); // 랜덤 이동거리 계산 시 사용했던 noise 를 보간할 이동거리값으로 넘겨줌. 
  // -> noise 값 범위가 0 ~ 1 사이이기 때문에, 이 값이 프래그먼트 셰이더에서 무언가를 계산하기 더 적합한 범위임.
  // 이때, noise 자체를 바로 넘겨줘버리면 0 ~ 1 사이의 값이 편차가 크지 않아, 프래그먼트 셰이더에서 계산한 테두리의 어두운 영역과 밝은 영역 간의 편차가 크지 않게 보임.
  // 따라서, noise값을 -1 ~ 1 사이의 값으로 맵핑시킨 뒤, 음수값은 모두 0으로 반환해버리도록 함으로써, noise 값의 편차를 늘려준 다음 프래그먼트 셰이더로 전송했다고 보면 됨.
  vPosition = mPosition.xyz; // 월드공간으로 변환된 버텍스 위치 좌표를 프래그먼트 셰이더로 보간하여 넘김
  vNormal = customNormalMatrix * normal; // js(cpu) 단에서 미리 계산된 노말행렬을 곱해 노말벡터를 월드공간 노멀벡터로 변환함.
  vUv = uv; // uv 좌표값을 보간하여 프래그먼트 셰이더로 넘김

  gl_Position = projectionMatrix * viewMatrix * mPosition; // 나머지 변환행렬을 곱해서 클립좌표로 저장됨
}