precision highp float;

// 사용자 지정 uniforms 변수
uniform float minBright; // 추출할 밝기 기준값
uniform sampler2D texture; // 아무런 postEffect 가 적용되지 않은 렌더타겟 텍스쳐

varying vec2 vUv;

void main() {
  vec4 bright = max(vec4(0.0), (texture2D(texture, vUv) - minBright));
  gl_FragColor = bright;
}

/*
  minBright

  이 밝기값 이상의 밝기를 갖는
  프래그먼트들만 추출함.

  이렇게 되면, 특정 밝기값 이상의 프래그먼트들만 추출된
  렌더타겟 텍스쳐를 Bloom 이펙트를 처리해주는
  렌더패스에 넘길 수 있음.

  즉, 특정 밝기 이상의 프래그먼트들에 대해서만
  가우시안 블러를 때려서 bloom 효과를 적용해주겠다는 뜻.

  [참고1] https://learnopengl.com/Advanced-Lighting/Bloom
  [참고2] https://gyutts.tistory.com/181?category=755809
*/

/*
  max() 함수로 밝기값을 추출하는 원리

  간단히 정리하자면,
  샘플링한 이전 씬의 텍스쳐에서 vec4(minBright) 보다 작은 값이 존재한다면,
  (texture2D(texture, vUv) - vec4(minBright)) < vec4(0.0) 이므로,
  이 값은 vec4(0.0) 보다 작은 음수 컴포넌트들이 나올 것임.

  그럴 경우, vec4(0.0) 을 리턴해서 음수값이 나오지 않도록,
  즉, 샘플링한 텍셀값이 vec4(minBright) 보다 작은 애들은 전부 vec4(0.0),
  즉, 검정색으로 찍어버리라는 말임.

  반대로, 
  샘플링한 이전 씬의 텍스쳐에서 vec4(minBright) 보다 큰 값이 존재한다면,
  (texture2D(texture, vUv) - vec4(minBright)) > vec4(0.0) 이므로,
  원래의 렌더타겟 텍스쳐의 색상에서 minBright 만큼을 뺀 색을 
  밝기값으로 지정해주라는 뜻임.

  이게 learnOpenGL 에서 설명한 부분과는 좀 다른 점이 있다면,
  brightPostEffect 에서 계산된 밝은 부분이
  원래의 렌더타겟 텍스쳐의 색상에서의 밝은 부분보다는 좀 어둡다는 것임.

  왜? vec4(minBright) 만큼을 뺏으니까!
*/