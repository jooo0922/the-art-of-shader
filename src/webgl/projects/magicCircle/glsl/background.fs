precision highp float;

// 사용자 정의 uniforms
uniform float time; // 시간변수
uniform samplerCube envMap; // 큐브맵 텍스쳐

// 보간변수
varying vec3 localOriginToPos; // 로컬 원점 ~ 각 버텍스 로컬 위치좌표 벡터 (즉, 버텍스의 오브젝트 좌표를 그대로 보간해서 넘김)

void main() {
  gl_FragColor = textureCube(envMap, localOriginToPos);
}

/*
  samplerCube

  큐브맵 텍스쳐를 담기 위한 유니폼 변수 선언

  큐브맵은 2D 텍스쳐가 아니므로, 
  샘플러 타입을 'sampler2D' 가 아닌 'samplerCube' 로 지정해줘야 함.

  큐브맵 텍스쳐는 주변 환경을 담은 이미지를 제공해서 주변 환경 반사효과 또는 스카이박스 구현에 활용하므로, 
  Environment Map, 줄여서 envMap 이라고도 함.

  이러한 큐브맵 텍스쳐를 샘플링할 때에는,
  vec2 타입의 uv 좌표가 아니라,
  vec3 타입의 방향벡터를 사용해야 함.
*/