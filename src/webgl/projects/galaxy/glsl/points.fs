precision highp float;

// 사용자 지정 uniforms 변수
uniform float maxRadius; // 버텍스 최대 반경(반지름)

varying float vRadius; // 로컬좌표 원점(즉, Points 객체의 중심점) ~ 각 Points 버텍스의 로컬좌표 사이의 거리 -> 즉, 각 버텍스의 원점으로부터의 반경이지!

// hsvToRgb 는 인자로 vec3() 타입을 전달해야 함. float 3개를 전달하면 안됨!
#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0; // 각 버텍스의 point 를 구성하는 프래그먼트들의 좌표인 gl_PointCoord 값을 0 ~ 1 에서 -1 ~ 1 로 맵핑함
  float pRadius = length(p); // 해당 프래그먼트 지점과 Point 의 원점 사이의 거리, 즉 프래그먼트 지점의 반경이 되겠지.
  if(pRadius > 1.0) {
    // 현재 맵핑된 좌표 범위가 -1 ~ 1 이므로, 전체 길이는 2.0 이고, 최대 반지름이 1.0 이므로, 1.0 보다 멀리 떨어진 프래그먼트는 discard 해버림.
    // -> 반지름이 1.0인 원이 그려지겠지
    discard;
  }

  float alpha = vRadius / maxRadius; // 각 버텍스의 원점으로부터의 반경 / 최대 반경 -> 값이 1.0에 가까울수록 멀리 떨어져있고, 0.0에 가까울수록 원점에 가까움
  vec3 hsv1 = hsvToRgb(vec3(0.038, 0.81, 1.0)); // Points 의 안쪽 색상 (밝은 주황색. 원점에 가까운 색상)
  vec3 hsv2 = hsvToRgb(vec3(0.62, 0.8, 0.52)); // Points 의 바깥쪽 색상 (어두운 남색. 원점에서 먼 색상)

  // discard 된 픽셀을 제외한 상태에서, 로컬 원점에서 가까울수록 hsv1, 멀수록 hsv2 의 색상이 나오도록 함.
  vec3 rgb = mix(hsv1, hsv2, alpha);

  gl_FragColor = vec4(rgb, 1.0);
}