// built-in attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// built-in uniforms
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition; // 월드공간 카메라 위치 데이터가 저장된 built-in uniform 변수

// 사용자 정의 uniforms
uniform float time;
uniform float renderOutline;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vColor;

void main() {
  // normal 을 더해줘서 모델의 버텍스들을 바깥방향으로 확장시킴. -> renderOutline 값에 따라 얼마나 확장될 지가 결정됨. 
  vec4 mPosition = modelMatrix * vec4(position + normal * renderOutline * 0.5, 1.0); // 모델행렬만 곱해서 월드좌표로 변환

  // (원점 ~ 카메라) 벡터와 (원점 ~ 버텍스) 벡터 사이의 각도를 구함 (dot 의 결과값이 cos값이므로, 이를 acos() 역함수에 넣으면 cos값에 해당하는 각도가 나옴.) 
  // 두 벡터의 각도가 일치하면, 즉 카메라와 버텍스가 일치하면 0도가 나올거고, 두 벡터 각도가 서로 반대방향이면, 즉 카메라와 버텍스가 서로 반대에 위치하면 180도가 나오겠지. 
  float angleToCamera = acos(dot(normalize(cameraPosition), normalize(mPosition.xyz)));

  vPosition = mPosition.xyz; // 버텍스의 월드좌표만 따로 보간해서 넘김
  vNormal = (normalMatrix * normal).xyz; // 노멀벡터를 노말행렬과 곱함으로써, 월드좌표로 변환하여 보간해서 넘김
  vUv = uv;

  // 보간되는 색상값을 smoothstep() 으로 구함.
  // 각 버텍스와 카메라 사이의 각도에 따라 색상이 결정될거고, abs(sin(angleToCamera)) 는 90도에 가까울수록 1에 가깝게 찍힐거고, 0도/180도에 가까울수록 0에 가깝게 찍힐거임.
  // 따라서, 한 0도 ~ 53도 구간까지는 계속 0이 찍힐거고, 53도 정도에서 90도 까지는 0 ~ 1 사이로 보간되겠군. 90도 영역(바깥쪽)으로 갈수록 1에 가까워지는거지. -> rimLight?
  vColor = vec3(smoothstep(0.8, 1.0, abs(sin(angleToCamera))));

  gl_Position = projectionMatrix * viewMatrix * mPosition; // 나머지 변환행렬을 곱해서 클립좌표로 저장됨
}