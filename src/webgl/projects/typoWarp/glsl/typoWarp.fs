precision highp float;

// 사용자 정의 uniform 변수
uniform float time; // 시간변수
uniform float speed; // uv 스크롤링 속도값
uniform sampler2D texture; // typo 텍스쳐
uniform vec2 texDirection; // 보간된 uv 좌표에 곱해줄 텍스쳐 방향값 (uv좌표가 -1.0과 곱해지면 원래 방향에서 뒤집어질 것임)
uniform vec2 texRepeat; // 보간된 uv 좌표에 곱해줄 텍스쳐 반복횟수

// 보간변수
varying vec2 vUv;

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  // 보간된 uv 좌표에 텍스쳐 방향벡터, 텍스쳐 반복횟수를 곱함으로써 uv좌표 범위를 뒤집고 확대해서 맵핑함.
  // 거기에 속도값을 곱한 시간변수를 더해줌으로써, 시간에 따라 uv scrolling 할 수 있도록 함.
  vec2 uv = vUv * texRepeat * texDirection + vec2(time * speed, time * speed);
  vec4 texColor = texture2D(texture, uv);

  vec3 typoColor = hsvToRgb(vec3(0.0, 0.0, 0.87)); // 타이포 색상

  vec3 finalCol = typoColor; // 최종 색상값
  float opacity = texColor.a; // 최종 투명도

  gl_FragColor = vec4(finalCol, opacity);
}