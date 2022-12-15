precision highp float;

// built-in uniform
uniform vec3 cameraPosition; // 월드공간 카메라 좌표

// 사용자 정의 uniforms
uniform sampler2D texture; // Hexagon 패턴 텍스쳐

// 보간 변수
varying vec3 vPosition; // 월드공간 버텍스 좌표를 구해서 프래그먼트 셰이더로 보간할 것임.
varying vec3 vNormal; // 월드공간 노멀벡터를 구해서 프래그먼트 셰이더로 보간할 것임. 
varying vec2 vUv; // 버텍스 uv 좌표값을 보간하여 프래그먼트 셰이더로 넘겨줌
varying float vMoveDistance; // 각 버텍스가 노말방향으로 이동한 거리값(정확히는 이동거리 계산에 사용된 0 ~ 1 사이의 노이즈값)을 프래그먼트 셰이더로 보간하여 넘김.

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  // Hexagon 패턴 텍스쳐 샘플링
  vec4 texColor = texture2D(texture, vUv);

  /*
    rim 값 계산
    
    1. 각 프래그먼트의 노말벡터와 각 프래그먼트에서 카메라까지의 뷰 벡터를 내적계산함.
    2. 내적값이 -1 ~ 1 범위에 있는데, 음수값이 나오면 다른 조명이나 색상값과 더할 때 문제가 생기므로, max() 함수로 음수값을 0으로 초기화함.
    3. 여기까지 계산된 내적값은 카메라와 마주보는 곳일수록 1에 가까워서 오히려 밝아지고, 가장자리가 0에 가까워서 어둡게 렌더링됨.
    하지만, 우리가 원하는 림라이트 효과는 그것의 반대니까, 1에서 빼줘서 값을 뒤집은 것.
  */
  vec3 viewDir = normalize(cameraPosition - vPosition); // 각 프래그먼트 월드좌표 -> 카메라 월드좌표. 즉, 뷰 벡터!
  vec3 normal = normalize(vNormal); // 보간된 노멀벡터는 길이가 1로 보존되지 않으므로, 다시 정규화해서 맞춤
  float rim = 1.0 - max(0.0, dot(normal, viewDir));
  rim = pow(rim, 1.3); // rim 영역의 테두리를 얅게 좁히기 위해 거듭제곱으로 편차를 늘림 (-> 지수함수 그래프!)

  // Hexagon fill(면) 투명도 및 색상 계산
  float fillOpacity = rim; // Hexagon 면의 투명도를 rim 값과 일치시킴. -> 사실상 fill 에서 기본 색상값만 제외하고 똑같이 계산한 거임.
  vec3 fillColor = hsvToRgb(vec3(0.56, 1.0, 1.0)); // Hexagon 면의 기본 색상값
  vec3 fill = fillColor * fillOpacity; // rim 값과 면 색상을 곱해주고 있으므로, Hexagon 면 색상은 노멀벡터가 카메라 벡터와 0도에 가까운 곳일수록 어둡고, 가장자리로 갈수록 밝아지겠군

  // Hexagon stroke(테두리) 투명도 및 색상 계산
  float strokeOpacity = texColor.a * vMoveDistance; // Hexagon 테두리 투명도도 stroke 에서 기본 색상값만 제외하고 똑같이 계산한 것임. -> 설명도 stroke 계산로직 하단에 쓴 거 참고하면 됨.
  vec3 strokeColor = hsvToRgb(vec3(0.01, 1.0, 1.0)); // Hexagon 테두리의 기본 색상값
  vec3 stroke = strokeColor * strokeOpacity; // => Hexagon 기본 색상값 * Hexagon 텍스쳐 투명도 * Hexagon 노멀방향 이동거리(0 ~ 1 사이의 값) 
  // Hexagon 텍스쳐 투명도를 곱한 건, 투명도가 1로 찍히는 테두리 영역만 테두리 색상을 적용하려는 것.
  // Hexagon 이동방향을 곱한 건, 이동방향이 길수록, 즉, 노말방향으로 Hexagon 이 많이 튀어나와 있을수록 테두리 색상을 더 강하게 적용하려는 것.

  // 최종 색상값 계산
  vec3 finalColor = fill + stroke; // 면 색상과 테두리 색상을 더해줌

  // 최종 투명도 계산
  float opacity = min(1.0, fillOpacity + strokeOpacity); // 면 투명도와 테두리 투명도를 더해줌. 또, 1.0 보다 큰 값은 1.0 으로 반환함. -> 투명도 최대값은 1.0 이니까!

  gl_FragColor = vec4(finalColor, opacity);
}