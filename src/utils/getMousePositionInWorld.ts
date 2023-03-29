import { Raycaster, Vector3 } from 'three';

export default function getMousePositionInWorld(
  mouseX: number,
  mouseY: number,
  camera: THREE.Camera,
  scene: THREE.Object3D
): THREE.Intersection<THREE.Object3D>[] {
  const mouseVector = new Vector3();
  mouseVector.x = (mouseX / window.innerWidth) * 2 - 1;
  mouseVector.y = -(mouseY / window.innerHeight) * 2 + 1;
  mouseVector.z = 0.5;

  const raycaster = new Raycaster();
  raycaster.setFromCamera(mouseVector, camera);

  const intersections = raycaster.intersectObjects(scene.children, true);

  return intersections;
}
