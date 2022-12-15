precision highp float;

// 사용자 지정 uniforms 변수
uniform vec2 resolution;
uniform vec2 direction;
uniform sampler2D texture;

varying vec2 vUv;

// 가우시안 블러 함수 (함수에 대한 자세한 설명은 ball/glsl/auraPostEffect.fs 참고)
vec4 gaussianBlur(sampler2D texture, vec2 uv, float radius, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 step = radius / resolution * direction;
  color += texture2D(texture, uv - 4.0 * step) * 0.02699548325659403;
  color += texture2D(texture, uv - 3.0 * step) * 0.06475879783294587;
  color += texture2D(texture, uv - 2.0 * step) * 0.12098536225957168;
  color += texture2D(texture, uv - 1.0 * step) * 0.17603266338214976;
  color += texture2D(texture, uv) * 0.19947114020071635;
  color += texture2D(texture, uv + 1.0 * step) * 0.17603266338214976;
  color += texture2D(texture, uv + 2.0 * step) * 0.12098536225957168;
  color += texture2D(texture, uv + 3.0 * step) * 0.06475879783294587;
  color += texture2D(texture, uv + 4.0 * step) * 0.02699548325659403;
  return color;
}

void main() {
  // 참고로 이 셰이더에서 사용하는 가우시안 블러의 반경값은 1.5로 고정함.
  vec4 color = gaussianBlur(texture, vUv, 1.5, resolution, direction);
  gl_FragColor = color;
}