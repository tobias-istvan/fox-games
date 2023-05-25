import {
  EventDispatcher,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  TextureLoader,
  MeshStandardMaterial
} from 'three';

export class Island extends EventDispatcher {
  public plane?: Mesh;
  constructor(heightMapImagePath: string) {
    super();
    this.init(heightMapImagePath);
  }

  async createMesh(heightMapImagePath: string) {
    const displacementTexture = await new TextureLoader().loadAsync(heightMapImagePath);
    const width = displacementTexture.image.width;
    const height = displacementTexture.image.height;
    // // Create plane geometry
    const segments = Math.max(width, height, 128); // Number of segments along each axis
    const geometry = new PlaneGeometry(
      Math.ceil(width / 10),
      Math.ceil(height / 10),
      segments,
      segments
    );

    const material = new MeshStandardMaterial({
      // map: gridTexture,
      color: 0x0095dd,
      wireframe: true,
      wireframeLinewidth: 2,
      // Add the displacement map / height map to the material
      displacementMap: displacementTexture,
      // Tweak the displacement scale to adjust the "intensity" of the terrain
      displacementScale: 1.2
    });

    console.info(material.displacementMap);

    const plane = new Mesh(geometry, material);
    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = 0.0;
    plane.position.z = 0.15;
    return plane;
  }

  async init(heightMapImagePath: string) {
    this.plane = await this.createMesh(heightMapImagePath);
    this.dispatchEvent({ type: 'ready' });
  }
}
