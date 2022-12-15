precision highp float;

// 사용자 지정 uniforms 변수
uniform sampler2D texture1; // 아무런 postEffect 가 적용되지 않은 렌더타겟 텍스쳐
uniform sampler2D texture2; // Bloom 을 제외한 모든 postEffect(bright, blurX, blurY) 가 적용된 렌더타겟 텍스쳐

varying vec2 vUv;

void main() {
  vec4 originColor = texture2D(texture1, vUv) * 1.2; // 아무런 후처리 효과가 없던 원본 색상
  vec4 postEffectColor = texture2D(texture2, vUv) * 2.0; // Bloom 을 제외한 모든 후처리 효과가 적용된 색상
  gl_FragColor = originColor + postEffectColor;
}