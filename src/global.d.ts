// Definitions to let TS understand .vs, .fs, .glsl shader files
// ts-shader-loader 사용 시 declare 파일을 생성해줘야 함.
declare module "*.fs" {
  const value: string;
  export default value;
}
declare module "*.vs" {
  const value: string;
  export default value;
}
declare module "*.glsl" {
  const value: string;
  export default value;
}
