// built-in attributes
attribute vec3 position;
attribute vec3 normal; // 탄젠트 공간에 정의된 버텍스 노멀 벡터
attribute vec2 uv;

// built-in uniforms
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 사용자 정의 uniforms
// 조명계산에 필요한 노멀, 탄젠트, 바이탄젠트 벡터(즉, 월드공간으로 변환된 노멀, 탄젠트, 바이탄젠트 벡터)를 계산하기 위해, 
// 노말행렬을 cpu 단에서 계산하여 버텍스 셰이더로 보내준 것.
uniform mat3 customNormalMatrix; 

// 보간변수
varying mat3 TBN; // 탄젠트 공간의 노멀벡터(노말맵에서 샘플링한 벡터)를 월드공간의 노멀벡터로 변환하기 위한 행렬. 보통 TBN 행렬이라고 부름.
varying vec3 vPosition; // 평면 지오메트리의 오브젝트공간 좌표를 월드좌표로 변환한 뒤, 프래그먼트 셰이더로 보간하여 전달할 것임.
varying vec2 vUv; // 평면 지오메트리의 uv좌표 보간하여 프래그먼트 셰이더로 전달

// 탄젠트 공간의 노멀벡터를 전달받아 탄젠트 공간의 탄젠트벡터를 리턴해주는 함수.
vec3 orthogonal(vec3 v) {
  /*
    이 함수는 정확히 말하자면,
    전달받은 어떤 벡터에 대하여
    탄젠트 방향의 직교 벡터를 계산해주는 거 같음.

    정확히는 모르겠지만 일단 
    이 함수에 탄젠트공간 노멀벡터를 넣으면
    정규화된 탄젠트공간 탄젠트벡터를 얻을 수 있다는 것만
    알아두면 될 것 같음...ㅜ

    나중에 아래 원문 웹사이트 보면서 더 공부해볼 것.
    [참고] http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
  */
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
}

void main() {
  // 탄젠트공간의 탄젠트벡터와 바이탄젠트벡터 계산 
  vec3 tangent = orthogonal(normal); // 탄젠트 공간의 노멀벡터를 전달받아 탄젠트 공간의 탄젠트벡터를 리턴해주는 함수. (정확히는 직교벡터 계산 함수)
  vec3 bitangent = normalize(cross(normal, tangent)); // 탄젠트 공간 노멀벡터와 탄젠트벡터(위에서 계산)을 외적계산하여 바이탄젠트벡터 계산

  // TBN 행렬 계산 및 프래그먼트로 보간
  vec3 T = normalize(customNormalMatrix * tangent); // 탄젠트 벡터를 노말행렬과 곱해 월드공간으로 변환함
  vec3 B = normalize(customNormalMatrix * bitangent); // 바이탄젠트 벡터(탄젠트 벡터와 노말벡터의 외적)을 노말행렬과 곱해 월드공간으로 변환함.
  vec3 N = normalize(customNormalMatrix * normal); // 노말벡터를 노말행렬과 곱해 월드공간으로 변환함
  TBN = mat3(T, B, N); // 위에 계산한 세 벡터(모두 변환 후 길이는 1로 정규화된 상태)를 3*3 행렬로 묶어 TBN 행렬로 만든 뒤, 프래그먼트 셰이더로 보간하여 전송 
  // 행렬로 세 벡터를 묶을 때에는, 인자로 넣어주는 벡터의 순서가 매우 중요하다고 함. 꼭 T, B, N 순서로 넣어줄 것!
  // 참고로 mat3() 는 전달한 인자값을 column-major order, 즉, 열 우선 행렬로 정렬해 줌. [참고] https://www.khronos.org/opengl/wiki/Data_Type_(GLSL)

  vec4 mPosition = modelMatrix * vec4(position, 1.0); // 모델행렬만 곱해서 월드좌표로 변환

  // 보간변수 전달
  vPosition = mPosition.xyz; // 평면 지오메트리의 오브젝트공간 좌표를 월드좌표로 변환한 뒤, 프래그먼트 셰이더로 보간
  vUv = uv; // 평면 지오메트리의 uv좌표 보간하여 프래그먼트 셰이더로 전달

  gl_Position = projectionMatrix * viewMatrix * mPosition; // 나머지 변환행렬을 곱해서 클립좌표로 저장됨
}

/*
  버텍스 데이터에 기본 저장된 normal 을 월드공간 노멀벡터로 변환하는 것과,
  노멀맵에서 샘플링한 텍셀값을 월드공간 노멀벡터로 변환하는 공식이 아예 다름!

  버텍스 데이터의 normal 데이터는 노멀행렬만 곱해주면 월드공간 노멀벡터로 변환되지만,
  노멀맵에서 샘플링한 텍셀값은 그 자체로는 노멀벡터가 아니기 때문에, TBN 행렬을 만들어서 곱해줘야
  월드공간 노멀벡터로 변환될 수 있음!

  -> 그래서 노멀맵에서 샘플링한 텍셀을 노멀벡터로 사용하려면
  TBN 행렬을 만드는 과정을 거쳐야 하는 것임.

  TBN 의 N 이 버텍스 데이터의 기본 normal 벡터가 월드공간 노멀벡터로 변환된 것이고!
*/