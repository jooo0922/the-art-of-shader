// built-in attribute 변수
attribute vec3 position;

// built-in uniform 변수
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

varying vec3 localOriginToPos; // 로컬 원점 ~ 각 버텍스 로컬 위치좌표 벡터 (즉, 버텍스의 오브젝트 좌표를 그대로 보간해서 넘김)

void main() {
  /*
    cubemap 텍스쳐를 샘플링하려면
    vec3 방향벡터가 필요한 것은 알고있을 것임.

    이때, 오브젝트 좌표의 중심점이 원점(0, 0, 0)인 상태이기 때문에
    각 버텍스의 오브젝트 좌표인 position 은 '원점 ~ 각 버텍스' 사이의 방향벡터라고도 볼 수 있음.

    큐브맵 텍스쳐를 샘플링할 때 필요한 방향벡터는 바로 이것이며,
    이때, 오픈프레임웍스에서 배웠던 것처럼 카메라가 반드시 원점에 위치해야만 
    position 값을 보간한 vec3 값으로 샘플링할 수 있는 건 아님. 

    카메라 위치와 무관하게 position 값으로 샘플링이 가능함.
  */
  localOriginToPos = position;

  gl_Position = (projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)).xyww; // 나머지 변환행렬을 곱해서 클립좌표로 저장됨
}