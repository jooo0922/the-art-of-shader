precision highp float;

// 사용자 정의 uniforms
uniform sampler2D texture1; // 아무런 postEffect 가 적용되지 않은 렌더타겟 텍스쳐
uniform sampler2D texture2; // Bloom 을 제외한 모든 postEffect (minBright 보다 밝은 값 추출, 가우시안 블러) 가 적용된 렌더타겟 텍스쳐

// 보간변수
varying vec2 vUv;

void main() {
  vec4 originColor = texture2D(texture1, vUv) * 1.0; // 아무런 후처리 효과를 적용하지 않은 원본 색상을 일정 비율로 곱해서 적용
  vec4 postEffectColor = texture2D(texture2, vUv) * 3.5; // Bloom 을 제외한 모든 postEffect (minBright 보다 밝은 값 추출, 가우시안 블러) 가 적용된 색상을 일정 비율로 곱해서 적용
  gl_FragColor = originColor + postEffectColor; // 두 색상을 더해서 BloomPostEffect 가 적용된 최종 색상을 계산함.
}