import { RayType } from "../../types/RayType";
import Ray from "./Ray";

export default class RayData {
  private _rayList: Ray[];

  constructor() {
    this._rayList = [];
  }

  public get rayType(): RayType | null {
    return null;
  }

  public get number(): number {
    return 0;
  }

  public get minRayWidth(): number {
    return 0;
  }

  public get maxRayWidth(): number {
    return 0;
  }

  public get minRayHeight(): number {
    return 0;
  }

  public get maxRayHeight(): number {
    return 0;
  }

  public get minRadius(): number {
    return 0;
  }

  public get maxRadius(): number {
    return 0;
  }

  public get minFadeSpeed(): number {
    return 0;
  }

  public get maxFadeSpeed(): number {
    return 0;
  }

  public get minMoveDistance(): number {
    return 0;
  }

  public get maxMoveDistance(): number {
    return 0;
  }

  public get rayList(): Ray[] {
    return this._rayList;
  }

  public set rayList(rayList: Ray[]) {
    this._rayList = rayList;
  }
}
