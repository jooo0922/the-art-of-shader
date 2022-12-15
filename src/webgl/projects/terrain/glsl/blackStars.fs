precision highp float;

// built-in uniform
uniform vec3 cameraPosition; // 월드공간 카메라 좌표

// 보간변수
varying vec3 vPosition; // 월드공간 버텍스좌표기 보간되어 넘어옴.
varying vec3 vNormal; // 월드공간 노멀벡터가 보간되어 넘어옴.
varying vec2 vUv; // 버텍스 uv좌표를 보간되어 넘어옴.

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosition); // 각 프래그먼트 월드좌표 -> 카메라 월드좌표. 즉, 뷰 벡터!
  vec3 normal = normalize(vNormal); // 보간된 노멀벡터는 길이가 1로 보존되지 않으므로, 다시 정규화해서 맞춤

  /*
    rim light 계산
    
    1. 각 프래그먼트의 노말벡터와 각 프래그먼트에서 카메라까지의 뷰 벡터를 내적계산함.
    2. 내적값이 -1 ~ 1 범위에 있는데, 음수값이 나오면 다른 조명이나 색상값과 더할 때 문제가 생기므로, max() 함수로 음수값을 0으로 초기화함.
    3. 여기까지 계산된 내적값은 카메라와 마주보는 곳일수록 1에 가까워서 오히려 밝아지고, 가장자리가 0에 가까워서 어둡게 렌더링됨.
    하지만, 우리가 원하는 림라이트 효과는 그것의 반대니까, 1에서 빼줘서 값을 뒤집은 것.
  */
  float rim = 1.0 - max(0.0, dot(normal, viewDir));
  rim = pow(rim, 2.0); // rim 영역의 테두리를 얅게 좁히기 위해 거듭제곱으로 편차를 늘림 (-> 지수함수 그래프!)

  // 영역별 색상 정의
  vec3 baseColor = hsvToRgb(vec3(0.58, 0.71, 0.12)); // 기본색상
  vec3 innerRimColor = hsvToRgb(vec3(0.64, 0.82, 0.47)); // 안쪽 rim 영역 색상
  vec3 outerRimColor = hsvToRgb(vec3(0.51, 0.72, 0.96)); // 바깥쪽 rim 영역 색상

  // rim 값으로 색상보간 시 필요한 변수 정의
  float gradientGap1 = 0.2; // 첫번째 색상보간(그라데이션)의 너비(간격)을 결정
  float gradientGap2 = 0.25; // 두번째 색상보간(그라데이션)의 너비(간격)을 결정
  float gradientStart1 = 0.15; // smoothstep() 으로 계산되는 첫번째 색상보간(그라데이션)이 시작하는 지점의 rim값 
  float gradientEnd1 = gradientStart1 + gradientGap1; // smoothstep() 으로 계산되는 첫번째 색상보간(그라데이션)이 끝나는 지점의 rim값
  float gradientStart2 = 0.4; // smoothstep() 으로 계산되는 두번째 색상보간(그라데이션)이 시작하는 지점의 rim값
  float gradientEnd2 = gradientStart2 + gradientGap2; // smoothstep() 으로 계산되는 두번째 색상보간(그라데이션)이 끝나는 지점의 rim값

  // smoothstep() 을 사용하여 rim값에 따라 색상보간
  vec3 gradient1 = mix(baseColor, innerRimColor, smoothstep(gradientStart1, gradientEnd1, rim)); // baseColor ~ innerRimColor 사이를 색상보간
  vec3 gradient2 = mix(gradient1, outerRimColor, smoothstep(gradientStart2, gradientEnd2, rim)); // 1번 그라데이션 ~ outerRimColor 사이를 색상보간

  // 최종 색상값 정의
  vec3 finalCol = gradient2;

  gl_FragColor = vec4(finalCol, 1.0);
}