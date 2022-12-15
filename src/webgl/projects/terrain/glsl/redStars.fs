precision highp float;

// 보간변수
varying vec3 vPosition; // 월드공간 버텍스좌표기 보간되어 넘어옴.
varying vec3 vNormal; // 월드공간 노멀벡터가 보간되어 넘어옴.
varying vec2 vUv; // 버텍스 uv좌표를 보간되어 넘어옴.

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  vec3 lowerColor = hsvToRgb(vec3(0.863, 1.0, 0.92));
  vec3 upperColor = hsvToRgb(vec3(0.719, 0.82, 0.92));

  /*
    mix() 함수의 alpha 값을 살펴보면,

    보간된 uv좌표의 v축(y축) 높이값에 따라
    -2.5 ~ 1.5 사이의 값을 갖게 됨.

    이 말은 즉, 
    -2.5 ~ 0.0 구간까지는 전부 lowerColor 가 칠해지고,
    0.0 ~ 0.5 구간까지는 lowerColor 가 좀 더 섞이게 되고,
    0.5 ~ 1.0 구간까지는 upperColor 가 좀 더 섞이게 되고,
    1.0 ~ 1.5 구간까지는 upperColor 가 칠해진다는 뜻.

    전체적으로 보면 lowerColor 가 
    더 많이 칠해지도록 uv좌표를 맵핑시켰다고 보면 됨.
  */
  vec3 finalCol = mix(lowerColor, upperColor, vUv.y * 4.0 - 2.5); // 보간된 uv의 y컴포넌트에 따라 두 색상을 섞어줌.

  gl_FragColor = vec4(finalCol, 1.0);
}