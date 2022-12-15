precision highp float;

// 보간변수
varying vec3 vPosition; // 월드공간 버텍스좌표기 보간되어 넘어옴.
varying vec3 vNormal; // 월드공간 노멀벡터가 보간되어 넘어옴.
varying vec2 vUv; // 버텍스 uv좌표를 보간되어 넘어옴.

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  vec3 color = hsvToRgb(vec3(0.5, 0.9, 0.94));
  gl_FragColor = vec4(color, 1.0);
}