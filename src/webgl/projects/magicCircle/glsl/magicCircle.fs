precision highp float;

// 사용자 정의 uniform 변수
uniform float time; // 시간변수
uniform sampler2D texture; // 마법진 텍스쳐
uniform vec3 hsv; // 0 ~ 1 시이의 vec3 타입의 hsv 컬러값

// 보간변수
varying vec2 vUv; // 보간된 uv좌표데이터

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  vec4 texColor = texture2D(texture, vUv);
  float opacity = texColor.a;

  // 최종 색상 계산
  vec3 finalColor = hsvToRgb(hsv);

  gl_FragColor = vec4(finalColor, opacity);
}