// built-in attribute
attribute vec3 position;
attribute vec2 uv;

// built-in uniform
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 사용자 정의 uniform
uniform float time; // 시간 변수 (초 단위)
uniform float amplitude; // blob 규모, 진폭 (사이즈)
uniform float frequency; // blob 변화 주기 (자글자글한 정도)
uniform float radius; // blob 에 사용되는 geometry 의 반지름

// 보간변수
varying vec2 vUv;

// Classic Perlin noise 함수 가져오기 
// 참고로 cnoise3 은 vec3 를 인자로 받아 -1 ~ 1 사이의 실수값을 반환함.
#pragma glslify: cnoise3 = require(glsl-noise/classic/3d)

void main() {
  // 만약 position 벡터의 길이를 놓고 본다면, 로컬 원점으로부터 각 버텍스까지의 반경과도 같음. 
  // 따라서, 최대 반경인 geometry radius 만큼을 나눠주면 길이가 1인 vec3 가 되겠군. 
  // -> 여기에 초 단위 시간변수 time 을 더해서 매 시간마다, 버텍스마다 변화하는 랜덤한 noise 값을 리턴받음.
  float noise = cnoise3(vec3(position / radius + time));

  // 랜덤한 noise 값에 blob 변화주기의 제곱을 곱해주고, amplitude 를 더해줌으로써 blob의 주기와 규모를 계산함.
  // 이 값을 오브젝트공간 좌표(= positiom = 현재 로컬 원점으로부터 각 버텍스까지의 반경 벡터로도 볼 수 있음.)에 곱해줌으로써,
  // 현재 로컬 원점으로부터 각 버텍스 방향으로의 벡터 길이를 늘렸다 줄였다 한 것으로도 볼 수 있겠지! -> 즉, 해당 방향으로 버텍스를 왔다갔다 하게 되는거임.
  vec4 mPosition = modelMatrix * vec4(position * (noise * pow(frequency, 2.0) + amplitude), 1.0);

  vUv = uv;

  gl_Position = projectionMatrix * viewMatrix * mPosition; // 나머지 변환행렬을 곱해서 클립좌표로 저장됨
}

/*
  noise 의 frequency(빈도, 주기)와 amplitude(규모, 진폭)

  1. frequency 는 blob 의 빈도, 주기, 자글자글한 정도를 결정해 줌. 
  기본적으로 noise 는 -1 ~ 1 사이의 랜덤값인데, 
  여기에 0에 가까운 frequency 값을 곱할수록 노이즈값 범위의 차이가 좁혀질 것이고, 
  큰 frequency 값을 곱할수록 노이즈값 범위가 확대되겠지? 
  ex> -1 ~ 1 * 10 => -10 ~ 10 이 되는 것처럼!

  2. amplitude 값을 더해주면 blob 의 기본 규모, 사이즈를 결정해 줌.
  ex> -1 ~ 1 + 10 => 9 ~ 11 이 되서
  노이즈값의 기본 규모가 9 ~ 11 사이의 값으로 확대되는 것임. 
  9보다 작은 랜덤 노이즈값은 나오지 못할테니 기본 규모가 굉장히 커지는 것임.
*/