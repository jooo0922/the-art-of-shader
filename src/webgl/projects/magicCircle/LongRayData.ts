import RayData from "./RayData";
import { RayType } from "../../types/RayType";

export default class LongRayData extends RayData {
  public get rayType(): RayType {
    return RayType.LONG;
  }

  public get number(): number {
    return 25;
  }

  public get minRayWidth(): number {
    return 1.5;
  }

  public get maxRayWidth(): number {
    return 3.5;
  }

  public get minRayHeight(): number {
    return 20;
  }

  public get maxRayHeight(): number {
    return 25;
  }

  public get minRadius(): number {
    return 0;
  }

  public get maxRadius(): number {
    return 3;
  }

  public get minFadeSpeed(): number {
    return 0.1;
  }

  public get maxFadeSpeed(): number {
    return 0.5;
  }

  public get minMoveDistance(): number {
    return 0.01;
  }

  public get maxMoveDistance(): number {
    return 0.1;
  }
}
