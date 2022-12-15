precision highp float;

uniform float time;
uniform float hex;

varying vec2 vUv;

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  vec3 rgb = mix(hsvToRgb(vec3(0.54, 0.1, 0.02)), hsvToRgb(vec3(0.54, 0.7, 0.1)), vUv.y * 4.0 - 1.15); // 보간된 uv의 y컴포넌트에 따라 두 색상을 섞어줌.

  gl_FragColor = vec4(rgb, 1.0);
}