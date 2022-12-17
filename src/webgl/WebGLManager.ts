import BallManager from "./projects/ball/BallManager";
import GalaxyManager from "./projects/galaxy/GalaxyManager";
import WaterManager from "./projects/water/WaterManager";
import ForceFieldManager from "./projects/forceField/ForceFieldManager";
import TerrainManager from "./projects/terrain/TerrainManager";
import TypoWarpManager from "./projects/typoWarp/TypoWarpManager";
import StatueManager from "./projects/statue/StatueManager";
import VortexManager from "./projects/vortex/VortexManager";
import MagicCircleManager from "./projects/magicCircle/MagicCircleManager";
import ShieldManager from "./projects/shield/ShieldManager";
import { ManagerType } from "./types/ManagerType";

export default class WebGLManager {
  private canvas: HTMLCanvasElement;

  private manager: ManagerType | null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.manager = null;
  }

  public setManager(pathName: string): void {
    if (pathName === "/burning-ball")
      this.manager = new BallManager(this.canvas);
    if (pathName === "/galaxy") this.manager = new GalaxyManager(this.canvas);
    if (pathName === "/water-blob")
      this.manager = new WaterManager(this.canvas);
    if (pathName === "/force-field")
      this.manager = new ForceFieldManager(this.canvas);
    if (pathName === "/terrain") this.manager = new TerrainManager(this.canvas);
    if (pathName === "/typo-warp")
      this.manager = new TypoWarpManager(this.canvas);
    if (pathName === "/grain-statue")
      this.manager = new StatueManager(this.canvas);
    if (pathName === "/vortex") this.manager = new VortexManager(this.canvas);
    if (pathName === "/magic-circle")
      this.manager = new MagicCircleManager(this.canvas);
    if (pathName === "/shield") this.manager = new ShieldManager(this.canvas);
  }

  public async init(): Promise<void> {
    await this.manager?.init();
  }

  public stop(): void {
    this.manager?.stop();
  }

  public cleanup(): void {
    this.manager?.cleanup();
    this.manager = null;
  }
}
