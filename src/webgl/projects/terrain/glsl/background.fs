precision highp float;

// 사용자 정의 uniform 변수
uniform float time;

// 보간변수
varying vec2 vUv;

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  vec3 bottomColor = hsvToRgb(vec3(0.5, 0.65, 0.97)); // 배경 구체의 밑쪽 색상 (밝은 청녹색)
  vec3 midColor = hsvToRgb(vec3(0.71, 0.83, 0.78)); // 배경 구체의 중간 색상 (보라색)
  vec3 topColor = hsvToRgb(vec3(0.636, 0.94, 0.45)); // 배경 구체의 위쪽 색상 (어두운 남보라색)

  float midColorCY = 0.56; // 배경 구체에 적용할 중간 색상의 정가운데 지점의 Y축 높이값 (midColor CenterY 의 줄임말)
  float gradientGap = 0.075; // smoothstep() 연산을 통해서, midColorY 지점을 기준으로 위/아래로 얼만큼 색상보간(그라데이션)을 해줄 것인지 결정해주는 값

  // 각각 smoothstep() 연산을 활용해서 
  // 1. bottomColor ~ midColor 사이의 색상보간 및
  // 2. midColor ~ topColor 사이의 색상보간을 계산해 줌.
  vec3 lowerHalfColor = mix(bottomColor, midColor, smoothstep(midColorCY - gradientGap, midColorCY, vUv.y)); // (구체의 맨 아래쪽 ~ midColorCY 지점) 까지의 색상 보간
  vec3 upperHalfColor = mix(midColor, topColor, smoothstep(midColorCY, midColorCY + gradientGap, vUv.y)); // (midColorCY ~ 구체의 맨 위쪽 지점) 까지의 색상 보간

  // step() 연산을 이용해서, 
  // vUv.y = 0 ~ midColorCY 지점까지는 0만 반환되어 lowerHalfColor 색상만 나오게 하고, 
  // vUv.y = midColorCY ~ 1.0 지점까지는 1만 반환되어 upperHalfColor 색상만 나오도록 함.
  vec3 finalCol = mix(lowerHalfColor, upperHalfColor, step(midColorCY, vUv.y));

  gl_FragColor = vec4(finalCol, 1.0);
}