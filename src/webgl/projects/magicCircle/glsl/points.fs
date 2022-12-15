precision highp float;

// 사용자 정의 uniforms
uniform vec3 hsv;

// 보간변수
/*
  그러나, 이 셰이더는 Points 객체에 사용되는 셰이더이므로,
  Points 의 각 버텍스에만 적용이 되고 있음. 
  따라서, 이 경우에는 버텍스 사이의 프래그먼트들 각각에 실제 보간이 이뤄지는 건 아니고, 
  '해당 버텍스의 투명도값을 계산해주는 프래그먼트 셰이더로 넘겨준다' 는 표현이 더 정확함. 
*/
varying float vAlpha;

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  // 각 버텍스의 point 를 구성하는 프래그먼트들의 좌표인 gl_PointCoord 값을 0 ~ 1 에서 -1 ~ 1 로 맵핑함
  vec2 p = gl_PointCoord * 2.0 - 1.0;

  // -1 ~ 1 로 맵핑된 gl_PointCoord 좌표계는 원점(중심점)이 (0, 0)인 상태이므로,
  // 이 상태에서 Point 의 각 지점의 vec2 데이터의 길이를 구하면 
  // 해당 프래그먼트 지점과 Point 의 원점 사이의 거리, 즉 프래그먼트 지점의 반경이 되겠지.
  float radius = length(p);
  if(radius > 1.0) {
    // Point 의 반지름에 해당하는 길이인 1.0 보다 큰 픽셀들은 discard 함으로써,
    // Point 가 원으로 그랴질 수 있도록 한 것
    discard;
  }

  float opacity = vAlpha; // 투명도 계산
  vec3 finalColor = hsvToRgb(hsv); // 최종 색상 계산

  gl_FragColor = vec4(finalColor, opacity);
}