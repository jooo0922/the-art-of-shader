import RayData from "./RayData";
import { RayType } from "../../types/RayType";

export default class ShortRayData extends RayData {
  public get rayType(): RayType {
    return RayType.SHORT;
  }

  public get number(): number {
    return 15;
  }

  public get minRayWidth(): number {
    return 0.1;
  }

  public get maxRayWidth(): number {
    return 0.5;
  }

  public get minRayHeight(): number {
    return 15;
  }

  public get maxRayHeight(): number {
    return 20;
  }

  public get minRadius(): number {
    return 4;
  }

  public get maxRadius(): number {
    return 5;
  }

  public get minFadeSpeed(): number {
    return 0.25;
  }

  public get maxFadeSpeed(): number {
    return 0.5;
  }

  public get minMoveDistance(): number {
    return 0.3;
  }

  public get maxMoveDistance(): number {
    return 0.5;
  }
}
