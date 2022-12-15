precision highp float;

// 사용자 정의 uniform 변수
uniform sampler2D fogTex; // 안개 텍스챠

// 보간 변수
varying vec3 vPosition;
varying vec2 vUv;

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  vec4 texColor = texture2D(fogTex, vUv); // 안개 텍스쳐를 샘플링함.
  float opacity = texColor.a * 0.36; // 안개 텍스쳐는 .png 파일이므로, 픽셀부위마다 투명도가 다를 것이고, 그것들에 전반적으로 0.36 을 곱해 투명도를 전체적으로 낮춰줘서 opacity 값을 계산함.

  vec3 fogColor = hsvToRgb(vec3(0.0, 0.1, 0.44)); // 안개의 색상값을 계산함.

  // gl_FragColor = vec4(1., 0., 0., 1.); // 안개 평면 디버깅용
  gl_FragColor = vec4(fogColor, opacity);
}