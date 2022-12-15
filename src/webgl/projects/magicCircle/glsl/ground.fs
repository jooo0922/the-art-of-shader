precision highp float;

// 사용자 정의 uniforms
uniform sampler2D diffuseTex; // 디퓨즈(알비도, 물체의 원 색상) 텍스쳐
uniform sampler2D normalTex; // 노멀맵 텍스쳐
uniform float textureRepeat; // 텍스쳐 반복 횟수
uniform vec3 hsv; // 0 ~ 1 시이의 vec3 타입의 hsv 컬러값 -> 포인트라이트 조명색상 계산에 사용
uniform vec3 dirLightDirection; // 디렉셔널 라이트 방향벡터
uniform vec3 pointLightPosition; // 포인트라이트 조명 월드공간 위치
uniform float pointLightRadius; // 포인트라이트 조명의 반경 (감쇄 계산에 사용할 조명의 최대 영향 범위. 반지름)
uniform vec3 ambientColor; // 앰비언트 라이트 색상값

// 보간변수
varying mat3 TBN; // 탄젠트 공간의 노멀벡터(노말맵에서 샘플링한 벡터)를 월드공간의 노멀벡터로 변환하기 위한 행렬. 보통 TBN 행렬이라고 부름.
varying vec3 vPosition; // 평면 지오메트리의 오브젝트공간 좌표를 월드좌표로 변환한 뒤, 프래그먼트 셰이더로 보간하여 전달
varying vec2 vUv; // 평면 지오메트리의 uv좌표 보간하여 프래그먼트 셰이더로 전달

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

// 디렉셔널 라이트, 포인트 라이트, 스포트 라이트 등 어떤 라이트 유형이라도 가져다 쓸 수 있도록 블린-퐁 라이트의 각 요소들을 계산하는 별도 함수를 추출함 -> 일종의 리팩토링
// 디퓨즈 라이팅 계산 (노멀벡터와 조명벡터를 내적)
float diffuse(vec3 lightDir, vec3 normal) {
  float diffAmt = max(0.0, dot(normal, lightDir)); // 정규화된 노멀벡터와 조명벡터의 내적값을 구한 뒤, max() 함수로 음수인 내적값 제거.
  return diffAmt;
}

// 디렉셔널 라이트 계산 함수
vec3 dirLight(vec3 normal, vec3 meshColor) {
  // 디력셔널 라이트 조명색상 계산
  vec3 lightColor = hsvToRgb(vec3(0.2, 0.01, 0.0002));

  // 디퓨즈 라이팅 계산
  float diffAmt = diffuse(dirLightDirection, normal); // 별도로 추출한 함수로부터 디퓨즈 라이팅 값 리턴받음
  vec3 diffuseColor = meshColor * lightColor * diffAmt; // '물체의 원색상 * 디렉셔널 라이트 조명색상 * 디퓨즈 라이트값' 을 곱해 디퓨즈 라이트 색상값 결정

  vec3 finalColor = diffuseColor;
  return finalColor;
}

// 포인트 라이트 계산 함수
vec3 pointLight(vec3 normal, vec3 meshColor) {
  // 포인트라이트 방향벡터 및 감쇄값 계산
  vec3 toLight = pointLightPosition - vPosition; // 포인트라이트 월드공간 위치 ~ 각 프래그먼트 월드공간 위치까지의 벡터 계산
  vec3 lightDir = normalize(toLight); // 위에서 구한 각 프래그먼트에 도달하는 포인트라이트 방향벡터의 길이를 1로 맞춰서 방향벡터 구함.
  float distanceToLight = length(toLight); // 정규화되지 않은 각 프래그먼트에 도달하는 포인트라이트 벡터의 길이값, 즉, 각 프래그먼트에서 조명까지의 거리값을 구해놓음.
  float falloff = max(0.0, 1.0 - (distanceToLight / pointLightRadius)); // 각 프래그먼트에서 조명까지의 거리값을 포인트라이트 조명의 반경(최대범위)로 나눈 뒤, 1에서 빼줌으로써 감쇄값을 계산함.
  // 왜 감쇄값 계산 시 1에서 빼주냐면, 프래그먼트가 포인트라이트에 가까울수록 (distToLight / lightRadius) 는 0에 가깝겠지만, 
  // 디퓨즈 라이팅 값에 곱해주는 감쇄값인 falloff 는 가까울수록 1에 가까워야 결과값이 더 밝은 색상으로 나오게 될테니, 1에서 빼줘서 값을 뒤집어준 것임!
  // 참고로, falloff 최소값을 0.0 으로 설정한 이유는, falloff 값이 0보다 작아질 경우(즉, 조명에서 아주 멀리 떨어진 프래그먼트들),
  // diffAmt 값에 음수를 곱하는 꼴이 되어버리기 때문에, 이를 피하고자 최소값을 0.0 으로 막아둔 것임.

  // 포인트라이트 조명색상 계산
  vec3 lightColor = hsvToRgb(vec3(hsv));

  // 디퓨즈 라이팅 계산
  float diffAmt = diffuse(lightDir, normal) * falloff; // 별도로 추출한 함수로부터 디퓨즈 라이팅 값 리턴받고, 거기에 포인트라이트 감쇄량을 곱해줌
  vec3 diffuseColor = meshColor * lightColor * diffAmt; // '물체의 원색상 * 포인트라이트 조명색상 * 디퓨즈 라이트값' 을 곱해 디퓨즈 라이트 색상값 결정

  vec3 finalColor = diffuseColor;
  return finalColor;
}

void main() {
  // 월드공간 노멀벡터 계산
  // 버텍스 셰이더에서 노멀벡터를 보간해서 받아오는 게 아니라, 노말맵 텍스쳐에서 샘플링한 노말벡터를 TBN 행렬로 곱해 월드공간으로 변환한 후 사용할 것임.
  vec3 normal = texture2D(normalTex, vUv * textureRepeat).rgb; // 노말맵 텍스쳐에서 텍셀값을 샘플링한 뒤, vec3 노말벡터 자리에 할당함.

  // 위의 샘플링한 노말벡터는 어디까지나 텍스쳐의 텍셀값, 즉 색상값이므로 범위가 0 ~ 1까지 밖에 표현이 안됨. 
  // 그런데, 탄젠트 공간의 노말벡터는 실제로 -1 ~ 1 사이의 정규화된 좌표계를 사용하고 있고, 음의 방향으로도 벡터를 표현할 수 있어야 하기 때문에
  // 0 ~ 1 사이의 컴포넌트 범위를 -1 ~ 1 사이로 맵핑한 뒤 정규화한 것.
  normal = normalize(normal * 2.0 - 1.0);
  normal = normalize(TBN * normal); // 컴포넌트의 값 범위를 바로잡은 노말벡터를 TBN 행렬과 곱해줌으로써, 탄젠트공간 -> 월드공간 으로 변환을 수행한 뒤, 길이를 1로 다시 정규화함.
  // 여기까지 해야 노말맵에서 샘플링해온 노말벡터는 조명계산에 써먹을 수 있는 상태가 되었고, 이후의 계산은 원래 하던 조명계산과 동일하게 수행하면 됨.

  // 물체의 원색상 계산
  vec3 meshColor = texture2D(diffuseTex, vUv * textureRepeat).xyz; // 물체의 디퓨즈 텍스쳐에서 샘플링한 텍셀값을 사용할거임.

  // 최종 색상 계산
  vec3 finalColor = vec3(0.0, 0.0, 0.0); // 최종 색상값을 검정색으로 초기화하고, 여기에 각 조명별 색상값을 누적계산 해나갈 것임.
  finalColor += pointLight(normal, meshColor); // 포인트 라이트 색상값 누적계산
  finalColor += dirLight(normal, meshColor); // 디렉셔널 라이트 색상값 누적계산
  finalColor += ambientColor; // 앰비언트 라이트(환경광. 디렉셔널 또는 포인트 라이트와 독립된 별도의 조명값) 색상값 누적 계산

  gl_FragColor = vec4(finalColor, 1.0);
}