#version 300 es
precision highp float;

// 사용자 정의 uniform
uniform float time;

// 보간변수
in vec3 vMPosition;

// 다음 파이프라인으로 넘길 최종 색상값 (gl_FragColor 와 동일)
out vec4 outColor;

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  vec3 dirLight = normalize(vec3(-1.0, 1.0, 0.2)); // 디렉셔널 라이트 벡터
  vec3 tangent = dFdx(vMPosition); // 인접 프래그먼트의 월드좌표 x값과 편미분하여 기울기(순간변화율)의 근사치를 구함 -> 탄젠트벡터
  vec3 bitangent = dFdy(vMPosition); // 인접 프래그먼트의 월드좌표 y값과 편미분하여 기울기(순간변화율)의 근사치를 구함 -> 바이탄젠트벡터
  vec3 normal = normalize(cross(tangent, bitangent)); // 보간된 노멀벡터는 길이가 1로 보존되지 않으므로, 다시 정규화해서 맞춤
  float diffuse = max(0.0, dot(normal, dirLight)); // 디퓨즈 라이팅 계산

  vec3 rgb = hsvToRgb(vec3(0.0, 0.0, 0.5));
  vec4 finalCol = vec4(rgb * diffuse, 1.0);

  outColor = finalCol;
}

/*
  노멀벡터 직접 계산 시,
  dFdx(genType p), dFdy(genType p) 의 역할

  프래그먼트 셰이더에서만 사용할 수 있는 built-in 함수
  참고로 인자로 들어가는 genType 은, 어떤 타입이든 다 들어올 수 있는 general type 이라는 뜻임.

  dFdx(vec3(~~~)) 를 예로 들자면,
  인자로 들어간 vec3 데이터에서, x좌표값에 대해서만 편미분하여
  현재 프래그먼트의 x좌표값과 그것의 직근접한 이웃 프래그먼트의 x좌표값의  
  순간변화율의 근사치를 구해서 동일한 vec3 데이터로 리턴해 줌. 

  즉, 여기서 사용된 dFdx(vMPosition) 으로 치면,
  현재 프래그먼트와 인접 프래그먼트의 
  월드좌표 x좌표값의 기울기(순간변화율)의 근사치를 구해서 
  vec3 값으로 리턴하게 되는데, 
  이는 현재 프래그먼트의 탄젠트 공간 속 탄젠트벡터와 동일함!

  예전에 노멀맵을 적용할 때,
  노말맵에서 샘플링한 텍셀값은 탄젠트공간 속 노멀벡터임을
  가정하고 계산했었지?

  여기서는 반대로,
  아예 각 프래그먼트의
  월드공간 x좌표값을 편미분하여 탄젠트벡터를 직접 계산하고,
  월드공간 y좌표값을 편미분하여 바이탄젠트벡터를 직접 계산해서,
  탄젠트벡터와 바이탄젠트벡터를 cross(외적) 해서 
  노멀벡터를 직접 계산하는 것임!

  정리하면, 
  dFdx(vMPosition) -> 현재 프래그먼트의 탄젠트벡터
  dFdy(vMPosition) -> 현재 프래그먼트의 바이탄젠트벡터
  cross(dFdx(vMPosition), dFdy(vMPosition)) -> 현재 프래그먼트의 노말벡터 
  라고 할 수 있음!

  참고로, Three.js 셰이더에서 dFdx(), dFdy() 사용하려면,
  #version 300 es 로 셰이더 버전을 변경해주는 게 좋음.

  [참고] https://stackoverflow.com/questions/65387637/i-can-t-get-derivatives-dfdx-working-in-my-shader-with-webgl1-or-2
  [참고] https://www.generativehut.com/post/generative-terrain-nfts-for-fxhash-in-three-js
  [참고] https://community.khronos.org/t/getting-the-normal-with-dfdx-and-dfdy/70177
*/

/*
  dFdx(genType p), dFdy(genType p) 로 노멀벡터 계산 시,
  FlatShading 으로만 나올 수 밖에 없는 이유

  현재 glsl 에서는 dFdx(), dFdy() 를
  프래그먼트 셰이더에서만 사용할 수 있는 상태임.

  즉, 삼각형 내의 각 버텍스들의 월드좌표가 '선형보간'된
  vMPosition 만을 가지고 프래그먼트 셰이더에서
  편미분을 해주고 있음.

  '선형보간'은 모든 점(순간)들에서
  기울기가 동일하기 때문에,

  편미분으로 구한 순간변화율(기울기)가 
  모두 동일할 수밖에 없음.

  따라서, 같은 삼각형 내의 버텍스들 사이에
  위치한 프래그먼트들의 vMPosition 으로 편미분을 해봤자
  모두 동일한 기울기의 vec3 값을 얻을 수밖에 없는 것임.

  즉, 같은 삼각형 내의 버텍스들 사이에 있는
  프래그먼트들의 탄젠트벡터와 바이탄젠트벡터의 기울기가
  모두 동일하다보니, 걔내를 외적해서 계산한 노멀벡터도
  기울기가 동일할 수밖에 없는 것이지.

  당연히 그 노멀벡터로 계산한 diffuse 값도
  같은 삼각형 내에 있는 프래그먼트들 끼리는 동일할 수밖에 없음.
  -> 그래서 사실 모든 프래그먼트에서 동일한 기울기를 미분하기 때문에
  굉장히 비효율적인 연산이라고 볼 수 있음.

  SmoothShading 을 해주려면, 
  버택스 셰이더에서 인접한 버텍스들을 통해
  탄젠트벡터와 바이탄젠트벡터를 구한 뒤 cross(외적)을 해주면 됨.

  그러나, 현재 WebGL 에서는 이것이 불가능한 상태임.
  그 이유는 아래 코멘트에 더 자세히 상술해 놓음.

  [참고] https://community.khronos.org/t/getting-the-normal-with-dfdx-and-dfdy/70177
*/

/*
  버텍스 셰이더에서 position 을 동적으로 계산할 시,
  노멀벡터를 그에 맞게 업데이트하기 어려운 이유

  버텍스 셰이더에서 position 을 업데이트하면,
  인접한 버텍스 좌표들을 가져와서, 그걸로 업데이트된 노멀벡터를 계산해서
  노멀을 보간해서 프래그먼트로 넘겨주면 
  SmoothShading 도 간단하게 계산할 수 있지 않을까?

  슬프지만 이거는 WebGL 에서는 구현이 불가능함.

  왜냐면, 버텍스 셰이더에서는 일단 기본적으로
  '인접한 버텍스 데이터들'을 못가져옴. 아예 접근이 안됨.

  이걸 하려면,
  Geometry Shader(지오메트리 셰이더)라고 하는
  또 다른 종류의 셰이더를 사용해야 함.
  여기서는 인접 버텍스들간의 접근이 가능함.

  근데 문제는,
  WebGL 에서는 Geometry Shader 를
  지원하지 않는다는 게 가장 큰 문제임.

  그래서, 현재로써 웹에서 동적으로 버텍스 좌표를 업데이트할 경우, 
  버텍스 노멀벡터를 그에 맞춰서 동적으로 업데이트하기 어려움.

  그러나, 아주 방법이 없는 것은 아닌데,
  heightMap, noiseMap 같은 텍스쳐를 사용하면, 인접 버텍스 좌표를 구해
  계산할수도 있음! -> terrain.vs 에 관련 상세 내용을 정리해놓음!

  [참고] https://stackoverflow.com/questions/21124637/how-do-i-update-normals-after-positioning-vertices-in-vertex-shader
*/