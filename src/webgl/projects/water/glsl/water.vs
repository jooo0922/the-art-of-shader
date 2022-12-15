// built-in attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// built-in uniforms
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 사용자 정의 uniform 변수
uniform float time; // 시간 변수 (초 단위)
uniform float amplitude; // blob 규모, 진폭 (사이즈)
uniform float frequency; // blob 변화 주기 (자글자글한 정도)
uniform float radius; // blob 에 사용되는 geometry 의 반지름
uniform mat3 customNormalMatrix; // js(cpu) 단에서 미리 계산된 노말행렬 (버텍스마다 노멀행렬을 계산하면 gpu 가 동일한 연산을 불필요하게 반복하는 문제가 있음.)

// 보간 변수
varying vec3 vPosition; // 월드공간 버텍스 좌표를 구해서 프래그먼트 셰이더로 보간할 것임. (조명계산, 반사 및 굴절 샘플링 계산에 사용)
varying vec3 vNormal; // 월드공간 노멀벡터를 구해서 프래그먼트 셰이더로 보간할 것임. (조명계산, 반사 및 굴절 샘플링 계산에 사용)

// Classic Perlin noise 함수 가져오기 
// 참고로 cnoise3 은 vec3 를 인자로 받아 -1 ~ 1 사이의 실수값을 반환함.
#pragma glslify: cnoise3 = require(glsl-noise/classic/3d)

void main() {
  // 만약 position 벡터의 길이를 놓고 본다면, 로컬 원점으로부터 각 버텍스까지의 반경과도 같음. 
  // 따라서, 최대 반경인 geometry radius 만큼을 나눠주면 길이가 1인 vec3 가 되겠군. 
  // -> 여기에 초 단위 시간변수 time 을 더해서 매 시간마다, 버텍스마다 변화하는 랜덤한 noise 값을 리턴받음.
  float noise = cnoise3(vec3(position / radius + time));

  vPosition = (modelMatrix * vec4(position, 1.0)).xyz; // 모델행렬을 곱해 버텍스 위치를 월드좌표로 변환함.
  vNormal = customNormalMatrix * normal; // js(cpu) 단에서 미리 계산된 노말행렬을 곱해 노말벡터를 월드공간 노멀벡터로 변환함.

  // 랜덤한 noise 값에 blob 변화주기의 제곱을 곱해주고, amplitude 를 더해줌으로써 blob의 주기와 규모를 계산함.
  vec4 mvPosition = viewMatrix * modelMatrix * vec4(position * (noise * pow(frequency, 2.0) + amplitude), 1.0);

  gl_Position = projectionMatrix * mvPosition;
}

/*
  OctahedronGeometry, IcosahedronGeometry, SphereGeometry 등등 뭘 이용해서 blob 을 만들건 상관없는데,
  geometry 사이즈(반지름)가 일정 수준 이상이어야 vertex shader 에서 noise 함수로 차이가 확확 나는 랜덤값을 뽑아낼 수 있음.
  만약 반지름이 너무 작다면, noise 함수로 들어가는 position 값에 큰 차이가 없기 때문에, 비슷한 값의 noise 값을 반환받게 될 것임. -> blob 이 제대로 그려지지 않음!
*/

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