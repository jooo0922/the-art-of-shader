precision highp float;

// 버텍스 셰이더에서 보간되어 온 변수들
// 그러나, 이 셰이더는 Points 객체에 사용되는 셰이더이므로,
// Points 의 각 버텍스에만 적용이 되고 있음. 
// 따라서, 이 경우에는 버텍스 사이의 프래그먼트들 각각에 실제 보간이 이뤄지는 건 아니고, 
// '해당 버텍스의 색상을 계산해주는 프래그먼트 셰이더로 넘겨준다' 는 표현이 더 정확함. 
varying vec3 vColor;
varying float vAlpha;

void main() {
  // 각 버텍스의 point 를 구성하는 프래그먼트들의 좌표인 gl_PointCoord 값을 0 ~ 1 에서 -1 ~ 1 로 맵핑함
  vec2 p = gl_PointCoord * 2.0 - 1.0;

  // -1 ~ 1 로 맵핑된 gl_PointCoord 좌표계는 원점(중심점)이 (0, 0)인 상태이므로,
  // 이 상태에서 Point 의 각 지점의 vec2 데이터의 길이를 구하면 
  // 해당 프래그먼트 지점과 Point 의 원점 사이의 거리, 즉 프래그먼트 지점의 반경이 되겠지.
  float radius = length(p);

  /*
    1. smoothstep(0.0, 0.2, vAlpha) * (1.0 - smoothstep(0.8, 1.0, vAlpha))  
    시간의 흐름과 각 버텍스별 랜덤한 delay 값에 따라 결정되는 vAlpha 값이
    0.0 ~ 0.2 까지는 0 ~ 1 로 서서히 보간된 값이 나오도록 하고,
    0.2 ~ 0.8 까지는 무조건 1로 나오고
    0.8 ~ 1.0 까지는 1 ~ 0 으로 서서히 보간된 값이 나오고,
    1.0 이 되면 딱 0이 되겠지

    2. (1.0 - smoothstep(0.5, 1.0, radius))
    point 의 중심점에서 point 내부의 각 프래그먼트들 까지의 거리, 반경을 나타내는 radius 값이
    0.0 ~ 0.5 까지는 무조건 1로 나오고 (즉, 중심점에서 중간 반지름까지는 1인거임)
    0.5 ~ 1.0 까지는 1 ~ 0 으로 서서히 보간되면서 투명해지다가 (즉, 중간 반지름부터 끝부분으로 가면서 서서히 투명해지는 거지)
    1.0 이 되면 딱 0이 되겠지 

    3. 마지막 보정값 0.6을 1번과 2번 결과값에 곱해줘서 
    각 point 내의 프래그먼트들마다 최종 투명도를 계산해 줌.
  */ 
  float opacity = smoothstep(0.0, 0.2, vAlpha) * (1.0 - smoothstep(0.8, 1.0, vAlpha)) * (1.0 - smoothstep(0.5, 1.0, radius)) * 0.6;

  vec3 color = vColor; // 각 point 내의 프래그먼트들 색상값은 버텍스 셰이더에서 받아온 vColor 값 그대로 사용함.

  gl_FragColor = vec4(color, opacity);
}

/*
  gl_PointCoord

  참고로, 이거는 Kinetic 프로젝트 메인 화면
  구현할 때에도 사용했었음.

  이거는 Point 를 셰이더로 그릴 때,
  하나의 Point 내부에 색상을 찍어주는 픽셀(프래그먼트)들의 좌표값을
  0.0 ~ 1.0 사이의 vec2 데이터로 표현한 것을 의미함.

  각 Point 의 왼쪽 -> 오른쪽으로 갈수록 0 ~ 1이 되고,
  아래쪽 -> 위쪽으로 갈수록 0 ~ 1 로 변화함.  

  그러니까 포인트의 정가운데 지점의 gl_PointCoord 는?
  vec2(0.5, 0.5)겠지!

  이런 걸 주로 뭐 할때 쓰냐면,
  위에서 사용한 것처럼
  하나의 Point 내에서 투명도나 색상의 변화를 주고 싶을 때,
  포인트를 좀 더 디테일하게 그리고 싶을 때 이 좌표값을 사용하면 좋음.

  이 값을 계산하기 편하게 -1 ~ 1 사이의 값으로 맵핑해서 사용하기도 함.
  그렇게 되면 포인트 정가운데 지점의 gl_PointCoord 는 vec2(0, 0)이 되겠지?

  [참고자료] https://registry.khronos.org/OpenGL-Refpages/gl4/html/gl_PointCoord.xhtml
*/