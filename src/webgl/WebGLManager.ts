import * as THREE from "three";
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
  private renderer: THREE.WebGLRenderer;

  private manager: ManagerType | null;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: canvas,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 1.0);
    this.manager = null;
  }

  public setManager(pathName: string): void {
    if (pathName === "/burning-ball")
      this.manager = new BallManager(this.renderer);
    if (pathName === "/galaxy") this.manager = new GalaxyManager(this.renderer);
    if (pathName === "/water-blob")
      this.manager = new WaterManager(this.renderer);
    if (pathName === "/force-field")
      this.manager = new ForceFieldManager(this.renderer);
    if (pathName === "/terrain")
      this.manager = new TerrainManager(this.renderer);
    if (pathName === "/typo-warp")
      this.manager = new TypoWarpManager(this.renderer);
    if (pathName === "/grain-statue")
      this.manager = new StatueManager(this.renderer);
    if (pathName === "/vortex") this.manager = new VortexManager(this.renderer);
    if (pathName === "/magic-circle")
      this.manager = new MagicCircleManager(this.renderer);
    if (pathName === "/shield") this.manager = new ShieldManager(this.renderer);
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
