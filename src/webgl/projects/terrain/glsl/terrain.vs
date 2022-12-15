// built-in attribute
attribute vec3 position; // 오브젝트 공간의 버텍스 위치
attribute vec3 normal; // 탄젠트 공간의 버텍스 노멀벡터
/*
  평면 지오메트리의 버텍스 기본 노멀벡터는 
  전부 평면이 바라보는 방향인 
  (0.0, 0.0, 0.1) 일 것임. 

  평면 지오메트리 생성 후,
  별도로 회전시키지 않는다면,
  기본적으로 z축 방향을 바라보게 생성되기 때문에,

  평면 지오메트리가 생성되는 시점의
  각 버텍스들의 기본 탄젠트 공간 노멀벡터는
  z축을 바라보도록 설정될 것임.
*/

// built-in uniform
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 사용자 정의 uniform
uniform float time; // 시간변수
uniform float size; // 평면 지오메트리 크기 (width, height)
uniform float segments; // 평면 지오메트리 (가로/세로)분할 개수
uniform sampler2D noiseTex; // 노이즈 텍스쳐
uniform mat3 customNormalMatrix; // js(cpu) 단에서 미리 계산된 노말행렬 (버텍스마다 노멀행렬을 계산하면 gpu 가 동일한 연산을 불필요하게 반복하는 문제가 있음.)

// 보간변수
varying vec3 vPosition; // 월드공간 버텍스좌표를 보간하여 넘김.
varying vec3 vNormal; // 월드공간 노멀벡터를 보간하여 넘김.

// util 함수 가져오기
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d) // Simplex noise 함수 (참고로 snoise2 은 vec2 를 인자로 받아 -1 ~ 1 사이의 실수값을 반환함.)

// 현재 버텍스 및 인접 버텍스의 높이값에 더해줄 elevation 값을 리턴해주는 함수
float getElevation(vec2 coord) {
  /*
    인자값 vec2 coord 의 정채
    
    아직 모델행렬 변환이 적용되지 않은, 
    오브젝트 공간의 평면 지오메트리 상에서
    각 평면의 2D 좌표값이라고도 볼 수 있는
    position.xy 값을 0.0 ~ 1.0 사이의 좌표값으로 맵핑한 것임.

    자세히 말하자면, position.xy 의 범위는
    평면 지오메트리의 사이즈가 2000*2000 이라고 가정하면,
    0.0 ~ 2000.0 사이의 좌표값으로 구성되어 있음.

    이 범위 내의 값을 0.0 ~ 1.0 으로 맵핑시키기 위헤
    'position.xy / 평면 지오메트리의 사이즈'
    로 계산해 준 vec2 좌표값이 들어온다는 뜻임.

    이걸 왜 맵핑해주냐?
    저 값이 결국 attribute vec2 uv 와
    정확하게 동일한 값이기 때문임.

    한마디로 평면에 존재하는 버텍스들의 uv좌표를
    직접 계산해준 거라고 보면 됨.

    왜 이걸 굳이 직접 계산해주냐?
    인접 버텍스에 적용될 uv좌표값을 구하려면 
    이렇게 해야되서 그럼.

    이전에 했던 방식 중에
    uv + vec2(uvOffset, 0.0) 
    뭐 이런 식으로 인접버텍스의 uv를 대충 계산했던게 있는데
    이거로 인접 버텍스의 elevation 을 계산하면
    정확한 결과값이 안나왔음.

    그래서 저렇게 uv좌표를 직접 맵핑시켜서
    계산을 해줘야 했던 것!
  */

  // 노이즈 값을 frequency(맵핑된 coord값(사실상 버텍스 uv와 동일) 왼쪽에 곱해주는 숫자)와 시간(time)에 따라 다르게 계산
  float noise1 = snoise2(coord * 3.0); // 가장 확대된 노이즈(= low frequency) 
  // -> 가장 확대된 노이즈는 전체적인 지형의 고저를 표현하고 있음. 전체 지형은 고정되어 있어야 솟아오른 부분을 피해서 CameraPath 를 그릴 수 있기 때문에, time값에 따른 uv 스크롤링을 하지 않도록 함.  
  float noise2 = snoise2((coord * 10.0) + (vec2(-time * 0.024, time * 0.03) * 3.0)); // 중간 정도로 확대된 노이즈(= mid frequency)
  float noise3 = snoise2((coord * 20.0) + (vec2(time * 0.06, -time * 0.032) * 6.0)); // // 가장 오밀조밀한 노이즈(= high frequency)

  // 각 버텍스의 y좌표값의 기본 elevation 값 계산 (Simplex noise 함수 활용)
  // 위에서 구한 Simplex noise 값을 pow() 로 거듭제곱하여 노이즈값의 편차를 더욱 강하게 줌. (선형 -> 지수함수 곡선이니까!)
  float elevation1 = pow((noise1 * 0.5 + 0.5), 3.2) * 120.0; // 가장 확대된 노이즈(= low frequency) 로 계산되는 elevation -> 언덕이 구불구불함이 가장 덜함.
  float elevation2 = pow((noise2 * 0.5 + 0.5), 3.4) * 12.0; // 중간 정도로 확대된 노이즈(= mid frequency) 로 계산되는 elevation -> 언덕의 구불구불함이 중간 정도임.
  float elevation3 = pow((noise3 * 0.5 + 0.5), 2.8) * 1.5; // 가장 오밀조밀한 노이즈(= high frequency) 로 계산되는 elevation -> 언덕의 구불구불함이 가장 심함.
  float baseElevation = elevation1 + elevation2 + elevation3; // 서로 다른 frequency 의 elevation 을 모두 더한 각 버텍스의 기본 elevation 값

  // 노이즈 텍스쳐를 샘플링하여 Terrain 의 자글자글한 세부묘사를 담당하는 detail elevation 값 계산
  vec4 colorNoise = texture2D(noiseTex, coord); // 노이즈 텍스쳐 샘플링
  float detailEelevation = colorNoise.r * 35.0 + colorNoise.g * 15.0 + colorNoise.b * 5.0; // 색상 부위마다 비율을 다르게 계산함으로써, 각 부위마다 detail 값이 다양하게 적용되도록 함. 

  // 최종 elevation 값 계산
  float finalElevation = baseElevation + detailEelevation;

  // 최종 elevation 값 반환
  return finalElevation;

}

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
  vec3 elevatedPosition = position + normal * getElevation(position.xy / size); // 현재 버텍스의 오브젝트 공간 좌표에 기본 normal 방향(결)을 따라 elevation 값을 더해줌. (아직 회전을 포함한 모델행렬이 적용되기 전이므로, z축 방향으로 elevation 이 더해질 것임.)
  vec4 mPosition = modelMatrix * vec4(elevatedPosition, 1.0); // 모델행렬만 먼저 곱해서 월드좌표로 변환 -> 여기까지 와야 이제 회전 등의 변환이 적용된 월드공간 버텍스 좌표가 되는 것임!
  vPosition = mPosition.xyz; // 버텍스 월드공간 좌표를 프래그먼트 셰이더로 보간해서 넘김.

  float positionOffset = size / segments; // 탄젠트 공간의 탄젠트벡터 및 바이탄젠트벡터 방향을 따라 인접 버텍스의 오브젝트공간 좌표를 구하기 위한 offset (= 버텍스 사이의 거리값과 동일함. '평면 지오메트리 전체 사이즈 / 버텍스 분할 개수' 니까!)

  // 탄젠트공간의 탄젠트벡터와 바이탄젠트벡터 계산 (elevation 미적용 버텍스 기준)
  vec3 tangent = orthogonal(normal); // 탄젠트 공간의 노멀벡터를 전달받아 탄젠트 공간의 탄젠트벡터를 리턴해주는 함수. (정확히는 직교벡터 계산 함수)
  vec3 bitangent = normalize(cross(normal, tangent)); // 탄젠트 공간 노멀벡터와 탄젠트벡터(위에서 계산)을 외적계산하여 바이탄젠트벡터 계산

  // 인접 버텍스 계산 (elevation 미적용 버텍스 기준. 계산된 인접 버텍스 좌표는 오브젝트공간 좌표임.)
  vec3 baseNeighbor1 = position + tangent * positionOffset; // 탄젠트공간의 탄젠트벡터의 방향(결)을 따라('결을 따른다' 에 대한 하단 설명 참고) 오프셋 적용하여 탄젠트 방향의 인접 버텍스 계산
  vec3 baseNeighbor2 = position + bitangent * positionOffset; // 탄젠트공간의 바이탄젠트의 방향(결)을 따라 오프셋 적용하여 바이탄젠트 방향의 인접 버텍스 계산

  // 각 방향의 인접 버텍스에 elevation 을 올려줌 
  vec3 elevatedNeighbor1 = baseNeighbor1 + normal * getElevation(baseNeighbor1.xy / size); // 탄젠트공간의 노멀벡터의 결을 따라 탄젠트 방향 인접 버텍스에 elevation 값을 더해줌. (기본 인접버텍스 좌표가 오브젝트공간 좌표 기준이므로, z축 방향으로 elevation 이 더해질 것임.)
  vec3 elevatedNeighbor2 = baseNeighbor2 + normal * getElevation(baseNeighbor2.xy / size); // 탄젠트공간의 노멀벡터의 결을 따라 바이탄젠트 방향 인접 버텍스에 elevation 값을 더해줌. (기본 인접버텍스 좌표가 오브젝트공간 좌표 기준이므로, z축 방향으로 elevation 이 더해질 것임.)

  // elevation 을 올려준 현재 버텍스와 인접 버텍스들을 빼줌으로써 각각 elevation 이 적용된 현재 버텍스의 탄젠트벡터, 바이탄젠트벡터, 노멀벡터 계산.
  /*
    근데 위에서 탄젠트벡터 구할때는 
    orthogonal() 막 이런 함수 쓰면서 어렵게 계산했는데
    여기서는 탄젠트벡터 구할 때 
    이렇게 간단하게 인접버텍스랑 현재버텍스를 빼주는 식으로 구해도 되나?

    상관이 없지!
    왜냐하면, 이미 elevatedNeighbor1 자체가
    탄젠트방향의 인접버텍스인 baseNeighbor1 로부터 
    elevation 만큼만 노말벡터 방향으로 쭉 끌어올려진 거기 때문에
    이미 오브젝트공간 xy축 기준으로는 탄젠트방향의 인접 버텍스라고 볼 수 있음. (z축 방향으로 높이값만 올려준 것임!)

    따라서, 현재 버텍스 - 탄젠트방향의 인접 버텍스 = 탄젠트벡터
    라고 할 수 있으므로, 그냥 이렇게 간단하게 계산해줘도 되는 게 맞음.

    바이탄젠트벡터도 마찬가지!
  */
  vec3 elevatedTangent = elevatedNeighbor1 - elevatedPosition; // elevation 이 적용된 현재 버텍스의 탄젠트공간 탄젠트벡터
  vec3 elvatedBitangent = elevatedNeighbor2 - elevatedPosition; // elevation 이 적용된 현재 버텍스의 탄젠트공간 바이탄젠트벡터  
  vec3 elevatedNormal = normalize(cross(elevatedTangent, elvatedBitangent)); // elevation 이 적용된 현재 버텍스의 탄젠트벡터와 바이탄젠트를 외적하여 탄젠트공간 노멀벡터 계산

  // elevation 이 적용된 현재 버텍스의 탄젠트공간 노멀벡터를 월드공간 노멀벡터로 변환
  vNormal = customNormalMatrix * elevatedNormal; // cpu 단에서 미리 계산된 노멀행렬을 곱해서 탄젠트공간 노멀벡터 -> 월드공간 노멀벡터로 변환한 뒤, 프래그먼트 셰이더로 보간하여 전송

  gl_Position = projectionMatrix * viewMatrix * mPosition; // elevation 이 적용된 현재 버텍스의 월드좌표에 나머지 변환행렬을 곱해서 클립좌표로 저장함.
}

/*
  '특정 벡터의 결을 따라' elevation 을 더해준다?

  이 말 뜻은 뭐냐면,
  예를 들어, 지금 노멀벡터의 결을 따라 더해준다 치면,
  평면 지오메트리의 기본 노멀벡터가 (0.0, 0.0, 1.0) 이잖아?

  근데 만약 이 노멀벡터 방향(결)을 따라
  임의의 elevation 값 1000 을 더해준다고 치면,

  (0.0, 0.0, 1.0) * 1000.0)
  즉, (0.0, 0.0, 1000.0) 으로 더해줘야
  해당 노멀벡터 방향으로 elevation 값이 더해지게 되겠지?

  이처럼, 특정 벡터의 방향으로 elevation 을 더해주기 위해,
  elevation 을 더해주기 전, 바로 더해주는 게 아니라,
  특정 벡터(탄젠트벡터, 바이탄젠트벡터, 노멀벡터 등)와
  곱한 다음 더해준다는 의미임.
*/

/*
  버텍스 셰이더에서 인접 버텍스들의 데이터에 접근하여
  노멀벡터를 업데이트하는 방법

  원칙적으로는 WebGL 의 버텍스 셰이더에서
  인접 버텍스 데이터에 접근하는 것은 불가능함.

  왜냐하면, WebGL 이 Geometry Shader 를 지원하지 않기 때문에!

  하지만, Terrain 과 같이
  heightMap, displacementMap, noiseMap, displace 함수, noise 함수 등을
  활용해서 평면 지오메트리의 버텍스 좌표를 업데이트하는 경우,
  예외적으로 인접 버텍스의 데이터를 직접 계산해서
  노멀벡터를 직접 계산하는 것이 가능함.

  1. 현재 버텍스의 탄젠트공간 탄젠트벡터와 바이탄젠트벡터 계산
  현재 버텍스를 원점으로 하는 탄젠트공간의 탄젠트벡터와 바이탄젠트 벡터를 구해줘야 함.
  이거는 위에서 사용한 orthogonal 함수와 built-in 탄젠트공간 노멀벡터를 활용하면
  계산할 수 있음.

  2. 평면 지오메트리의 오브젝트공간 버텍스 좌표 계산 (현재 버텍스 및 인접 버텍스들 계산)
  offset 값을 1에서 구한 탄젠트 공간의 탄젠트벡터와 바이탄젠트벡터의 결을 따라 더해줌으로써,
  탄젠트 방향과 바이탄젠트 방향의 인접 버텍스의 좌표를 구해줄 수 있음. 

  3. 평면 지오메트리에서 현재 버텍스와 인접 버텍스의 uv좌표값 계산
  '0 ~ 평면 지오메트리 사이즈' 사이의 버텍스 position.xy 좌표값을
  '0 ~ 1' 사이의 uv좌표값 범위로 맵핑해줄 수 있다면,
  인접버텍스.xy 좌표값에 해당하는 uv좌표값도 맵핑시켜서 구할 수 있음.
  -> 그냥 간단하게 
  '현재(인접)버텍스.xy / 평면 지오메트리 사이즈'
  로 계산해주면 끝남.

  4. 현재(인접)버텍스들에 elevation 이 적용된 좌표값 계산
  3에서 구한 현재(인접)버텍스들의 맵핑된 uv좌표값을 활용해서 elevation 값, 
  즉, 각 버텍스들의 높이값을 얼마나 올려줄 것인지 계산한 다음,
  그 값을 현재(인접)버텍스들에 탄젠트 공간 노멀벡터 방향(결)을 따라 올려주면 됨. 

  5. elevation 이 적용된 현재버텍스의 탄젠트공간 탄젠트벡터와 바이탄젠트벡터 계산
  4에서 구한 elevation 이 적용된 탄젠트방향, 바이탄젠트방향 인접버텍스들 각각에
  elevation 이 적용된 현재버텍스를 각각 빼주면 
  elevation 이 적용된 현재버텍스의 탄젠트벡터와 바이탄젠트벡터를 구할 수 있음.
  참고로, 위의 인접버텍스들은 이미 탄젠트방향의 인접버텍스에서 elevation 만큼 끌어올린 것에 불과하므로,
  굳이 1번처럼 orthogonal() 같은 함수를 사용하지 않아도 탄젠트벡터를 구할 수 있음.

  6. elevation 이 적용된 현재버텍스의 탄젠트공간 노멀벡터 계산
  5에서 구한 탄젠트벡터와 바이탄젠트벡터를 외적계산하면 알아서 나오겠지?

  7. 현재버텍스의 탄젠트공간 노멀벡터 -> 월드공간 노멀벡터로 변환
  6에서 구한 elevation 이 적용된 현재버텍스의 탄젠트공간 노멀벡터에
  노멀행렬을 곱해주면 월드공간 노멀벡터로 변환됨.

  8. 월드공간 노멀벡터를 프래그먼트 셰이더 보간변수로 전송
  여기까지 버텍스 셰이더에서 계산된 노멀벡터를 보간변수를 통해 
  프래그먼트 셰이더로 넘겨주면 버텍스 셰이더가 할 일은 끝난것임.

  이 다음부터는 프래그먼트 셰이더에서
  조명계산에 쓰던 뭐에 쓰던 알아서 하면 됨.
*/