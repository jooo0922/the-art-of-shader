// built-in attribute 변수
attribute vec3 position;
attribute vec2 uv;

// 사용자 정의 attribute 변수
attribute vec3 instancePosition; // 실제 평면의 버텍스 위치는 아니지만, 각 평면의 버텍스 위치들에 더해짐으로써, '사실상' 평면의 위치를 결정하는 attribute 변수 (하나의 평면 인스턴스에 존재하는 버텍스들끼리는 값이 동일함.)
attribute float delay; // 각 평면 인스턴스마다 0 ~ 1 사이의 값으로 랜덤 할당되는 지연시간을 결정해주는 값
attribute float rotate; // 각 평면 인스턴스마다 -1 ~ 1 사이로 랜덤 할당되는 초기 회전각도를 결정해주는 값

// built-in uniform 변수
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 사용자 정의 uniform 변수
uniform float time;

// 보간 변수
varying vec3 vPosition;
varying vec2 vUv;

// 지속시간 상수
const float duration = 200.0;

// 특정 각도에 대한 3차원 아핀공간 z축 회전행렬을 반환하는 함수
mat4 rotation3dZ(float angle) {
  float sin = sin(angle);
  float cos = cos(angle);

  return mat4(
    // 열 우선 행렬
  cos, sin, 0.0, 0.0, // 1열
  -sin, cos, 0.0, 0.0, // 2열
  0.0, 0.0, 1.0, 0.0, // 3열
  0.0, 0.0, 0.0, 1.0 // 4열
  );
}

void main() {
  /*
    현재시간값 now

    duration(200) 으로 나눈 나머지를 다시 duration 으로 나누기 때문에,
    결과값은 시간이 지남에 따라(time) 0에서 1을 향해 주기적으로 반복될 것임.

    다만, delay 값에 의해 0 ~ 1로 도달하는 타이밍이 달라지는 것 같음.
    
    예를들어, 
    time 이 0인 시점을 놓고 보면,
    delay = 0 인 경우, now 값은 0 / 200 = 0 으로 시작하고,
    delay = 0.5 인 경우, now 값은 100 / 200 = 0.5 로 시작하고,
    delay = 1 인 경우, now 값은 0 / 200 = 0 으로 시작함.

    time 이 50까지 흐른 시점을 놓고 보면,
    delay = 0 인 경우, now 값은 50 / 200 = 0.25 가 되고,
    delay = 0.5 인 경우, now 값은 150 / 200 = 0.75 가 되고,
    delay = 1 인 경우, now 값은 50 / 200 = 0.25 가 됨.
    
    time 이 100까지 흐른 시점을 놓고 보면,
    delay = 0 인 경우, now 값은 100 / 200 = 0.5 가 되고,
    delay = 0.5 인 경우, now 값은 0 / 200 = 0 부터 다시 시작하고,
    delay = 1 인 경우, now 값은 100 / 200 = 0.5 가 됨.

    이처럼, delay 값이 뭐냐에 따라
    now 값이 0에서 시작해서 1이 되고 나서 다시 0부터 시작하는 타이밍이
    각 평면마다 달라진다는 뜻임!
  */
  float now = mod(time + delay * duration, duration) / duration;

  // 특정 각도만큼 각 평면(의 버텍스들)을 회전시킴 (초기 랜덤 회전각도 및 시간에 따라 달라짐)
  float angle = radians(rotate * 360.0) + time * 0.2; // 각도 범위는 초기각도 -360 ~ 360 사이의 값에서 시작하여 시간(time)이 지남에 따라 점점 커질 것임.
  mat4 rotateZMat = rotation3dZ(angle);  // 특정 각도에 대한 z축 회전행렬을 계산함.
  vec3 rotatePosition = (rotateZMat * vec4(position, 1.0)).xyz; // 각 평면 버텍스의 위치좌표를 z축 회전행렬로 곱함으로써, 평면을 z축 회전시킴.

  vec3 moveRise = vec3(
    // 시간의 흐름(time), 랜덤 지속시간(delay), 로컬 원점에서 각 버텍스까지의 거리(length(position))에 따라 moveRise 값이 다르게 계산되겠군
  (now * 2.0 - 1.0) * (300.0 - (delay * 2.0 - 1.0) * 200.0), // x좌표값: (-1 ~ 1) * (100 ~ 500) = 대략 -500 ~ 500 사이의 x좌표값이 시간흐름, 랜덤 지속시간에 따라 계산되겠군.
  (now * 2.0 - 1.0) * 100.0, // y좌표값: -100 ~ 100 사이의 y좌표값이 시간흐름, 랜덤 지속시간에 따라 계산되겠군(now)
  sin(radians(time * 50.0 + delay + length(position))) * 30.0 // z좌표값: -30 ~ 30 사이의 z좌표값이 시간흐름, 랜덤지속시간, 로컬원점에서 버텍스까지의 거리에 따라 다르게 계산되겠군.
    // -> 평면 버텍스를 z방향으로 깃발처럼 펄럭이게 움직이는 것임. (삼각함수로 계산하니까!)
  );

  // 매 프레임마다 각 평면의 각 버텍스마다 업데이트할 최종 위치좌표값을 계산함. 
  // 기본적으로 평면 인스턴스마다 갖는 instancePosition 에 따라 위치가 결정되지만, 
  // 시간흐름 및 초기 랜덤 회전각도에 따라 평면이 회전할 것이고, (rotatePosition)
  // 시간흐름 및 랜덤 지속시간, 로컬 원점에서 각 버텍스까지의 거리에 따라 한 평면 안에서도 버텍스마다 z좌표값이 다르게 움직일거임(moveRise)
  vec3 finalPos = instancePosition + moveRise + rotatePosition;

  vPosition = position;
  vUv = uv;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(finalPos, 1.0);
}