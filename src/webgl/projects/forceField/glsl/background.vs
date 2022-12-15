// built-in attribute 변수
attribute vec3 position;

// built-in uniform 변수
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

varying vec3 localOriginToPos; // 로컬 원점 ~ 각 버텍스 로컬 위치좌표 벡터 (즉, 버텍스의 오브젝트 좌표를 그대로 보간해서 넘김)

void main() {
  localOriginToPos = position;

  gl_Position = (projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)).xyww; // 나머지 변환행렬을 곱해서 클립좌표로 저장됨
}

/*
  localOriginToPos

  cubemap 텍스쳐를 샘플링하려면
  vec3 방향벡터가 필요한 것은 알고있을 것임.

  이때, 오브젝트 좌표의 중심점이 원점(0, 0, 0)인 상태이기 때문에
  각 버텍스의 오브젝트 좌표인 position 은 '원점 ~ 각 버텍스' 사이의 방향벡터라고도 볼 수 있음.

  큐브맵 텍스쳐를 샘플링할 때 필요한 방향벡터는 바로 이것이며,
  이때, 오픈프레임웍스에서 배웠던 것처럼 카메라가 반드시 원점에 위치해야만 
  position 값을 보간한 vec3 값으로 샘플링할 수 있는 건 아님. 

  카메라 위치와 무관하게 position 값으로 샘플링이 가능함.
*/

/*
  원근분할 무효화 (.xyww)

  원근분할 단계에서는 
  gl_Position 에 저장한 좌표값의 w 컴포넌트로 
  x, y, z 컴포넌트를 나눠줌으로써, 
  원근이 적용된 -1 ~ 1 사이의 NDC 좌표계로 변환함.

  이때, 스카이박스는 예외적으로
  원근과 관계없이 가장 멀리있어야만 하는 물체이기 때문에,
  즉, NDC 좌표계 상에서 z값이 항상 1이어야 하므로,
  z/w = 1 이 항상 나오도록 해야 함.

  그러기 위해서, 스카이박스에 적용하는 셰이더에는 
  swizzling 기법을 통해 z값을 w값과 동일하게 가져감으로써, 
  z/w = w/w = 1 이 항상 나오도록 하여
  스카이박스의 원근분할을 사실상 무효화하는 것임!
*/