precision highp float;

// built-in uniform
uniform vec3 cameraPosition; // 월드공간 카메라 좌표

// 사용자 정의 uniform
uniform float time;

// 보간변수
varying vec3 vPosition; // 보간된 월드공간 위치좌표
varying vec3 vNormal; // 보간된 월드공간 노멀벡터

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  vec3 dirLight = normalize(vec3(-0.5, 1.0, 0.2)); // 디렉셔널 라이트 벡터
  vec3 viewDir = normalize(cameraPosition - vPosition); // 각 프래그먼트 월드좌표 -> 카메라 월드좌표. 즉, 뷰 벡터!
  vec3 normal = normalize(vNormal); // 보간된 노멀벡터는 길이가 1로 보존되지 않으므로, 다시 정규화해서 맞춤

  // 디퓨즈 라이팅 계산
  float diffuse = max(0.0, dot(normal, dirLight)); // 디퓨즈 라이팅 계산
  vec3 hsv1 = vec3(0.58, 0.71, 0.12); // 안쪽 영역의 어두운 디퓨즈 라이팅 색상
  vec3 hsv2 = vec3(0.65, 0.82, 0.47); // 안쪽 영역의 밝은 디퓨즈 라이팅 색상
  vec3 innerColor = mix(hsvToRgb(hsv1), hsvToRgb(hsv2), diffuse);  // 안쪽 영역의 디퓨즈 라이팅 색상을 diffuse값에 따라 보간하기

  /*
    rim light 계산
    
    1. 각 프래그먼트의 노말벡터와 각 프래그먼트에서 카메라까지의 뷰 벡터를 내적계산함.
    2. 내적값이 -1 ~ 1 범위에 있는데, 음수값이 나오면 다른 조명이나 색상값과 더할 때 문제가 생기므로, max() 함수로 음수값을 0으로 초기화함.
    3. 여기까지 계산된 내적값은 카메라와 마주보는 곳일수록 1에 가까워서 오히려 밝아지고, 가장자리가 0에 가까워서 어둡게 렌더링됨.
    하지만, 우리가 원하는 림라이트 효과는 그것의 반대니까, 1에서 빼줘서 값을 뒤집은 것.
  */
  float rim = 1.0 - max(0.0, dot(normal, viewDir));
  rim = pow(rim, 2.0); // rim 영역의 테두리를 얅게 좁히기 위해 거듭제곱으로 편차를 늘림 (-> 지수함수 그래프!)
  vec3 rimColor = hsvToRgb(vec3(0.51, 0.72, 0.96)); // rim light 의 색상
  vec3 rimLight = rimColor * rim; // rimlight 색상값과 거듭제곱으로 편차를 늘린 rim값을 곱해 최종 rim light 계산

  // 최종 색상값 계산 (안쪽 영역의 디퓨즈 색상과 림라이트 색상을 더함.)
  vec3 finalCol = innerColor + rimLight;

  gl_FragColor = vec4(finalCol, 1.0);
}