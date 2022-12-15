precision highp float;

// 사용자 정의 uniform 변수
uniform float time; // 시간변수
uniform float fadeSpeed; // 광선이 fade 효과로 나타나거나 사라지는 속도
uniform float moveDistance; // 광선이 y축으로 움직이는 최대 이동거리. 값이 클수록 더 많이 움직임.
uniform sampler2D texture; // 광선 텍스쳐
uniform vec3 hsv; // 0 ~ 1 시이의 vec3 타입의 hsv 컬러값

// 보간변수
varying vec2 vUv; // 보간된 uv좌표 데이터

#pragma glslify: hsvToRgb = require('../../../utils/glsl/hsvToRgb.glsl');

void main() {
  float moveY = fract(time * fadeSpeed) * moveDistance; // 광선 텍스쳐를 v축(y축) 방향으로 움직이고자 하는 거리 (참고로 fract()는 소수점, 즉 0.0 ~ 0.999... 을 반복적으로 반환함)
  vec2 coord = vUv - vec2(0.0, moveY); // 원래의 uv좌표에 시간에 따라 변하는 v축 이동값을 빼줘서 광선 텍스쳐를 uv스크롤링 해줌. 
  vec4 texColor = texture2D(texture, coord);

  float rayOpacity = moveY; // 우선 광선 전체 투명도 값을 moveY 와 동일하게 맞춤
  if(rayOpacity > moveDistance * 0.5) {
    rayOpacity = moveDistance - rayOpacity; // moveY 값이 최대 이동거리의 절반을 넘어서는 순간 광선 투명도 값은 다시 0을 향해 가도록 하려는 것!
  }
  /*
    지금까지 계산한 rayOpacity(광선 투명도)를 바로 사용해버리면,
    광선의 전체 투명도가 moveDistance 값에 영향을 받게 됨.

    즉, 최대 이동거리가 0.5로 설정이 된 광선은,
    광선의 투명도가 0 ~ 0.5 사이까지만 왔다갔다할 수 있도록 제한된다는 뜻임.

    이렇게 되면 최대 이동거리에 따라 광선 전체 투명도가 결정되기 때문에,
    최대 이동거리와 관계없이 광선 투명도를 설정하고자
    0 ~ moveDistance 까지의 투명도값을
    0 ~ 1 사이의 값으로 smoothstep() 함수로 맵핑시킨 것임!
  */
  rayOpacity = smoothstep(0.0, moveDistance, rayOpacity);
  float opacity = texColor.a * rayOpacity;

  // 최종 색상 계산
  vec3 finalColor = hsvToRgb(hsv);

  gl_FragColor = vec4(finalColor, opacity);
}