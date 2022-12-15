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

export default class WebGLManager {
  private pathName: string = "";

  private ballManager: BallManager | undefined;

  private galaxyManager: GalaxyManager | undefined;

  private waterManager: WaterManager | undefined;

  private forceFieldManager: ForceFieldManager | undefined;

  private terrainManager: TerrainManager | undefined;

  private typoWarpManager: TypoWarpManager | undefined;

  private statueMananger: StatueManager | undefined;

  private vortexManager: VortexManager | undefined;

  private magicCircleManager: MagicCircleManager | undefined;

  private shieldManager: ShieldManager | undefined;

  constructor(canvas: HTMLCanvasElement | null) {
    if (canvas) {
      this.ballManager = new BallManager(canvas);
      this.galaxyManager = new GalaxyManager(canvas);
      this.waterManager = new WaterManager(canvas);
      this.forceFieldManager = new ForceFieldManager(canvas);
      this.terrainManager = new TerrainManager(canvas);
      this.typoWarpManager = new TypoWarpManager(canvas);
      this.statueMananger = new StatueManager(canvas);
      this.vortexManager = new VortexManager(canvas);
      this.magicCircleManager = new MagicCircleManager(canvas);
      this.shieldManager = new ShieldManager(canvas);
    }
  }

  public setPathName(pathName: string): void {
    this.pathName = pathName;
  }

  public async init(): Promise<void> {
    if (this.pathName === "/burning-ball") await this.ballManager?.init();
    if (this.pathName === "/galaxy") await this.galaxyManager?.init();
    if (this.pathName === "/water-blob") await this.waterManager?.init();
    if (this.pathName === "/force-field") await this.forceFieldManager?.init();
    if (this.pathName === "/terrain") await this.terrainManager?.init();
    if (this.pathName === "/typo-warp") await this.typoWarpManager?.init();
    if (this.pathName === "/grain-statue") await this.statueMananger?.init();
    if (this.pathName === "/vortex") await this.vortexManager?.init();
    if (this.pathName === "/magic-circle")
      await this.magicCircleManager?.init();
    if (this.pathName === "/shield") await this.shieldManager?.init();
  }

  public clear(): void {}
}
