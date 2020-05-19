import * as THREE from 'three';
import Event from './Event';

class Engine {
  constructor () {
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0xffffff, 0.00015)

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      20000
    )

    this.createRenderer();

    /**
     * Add events related to rendering
     */
    new Event('resize', () => this.resize())

    this.animate();
  }

  createRenderer () {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    })

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    )

    document.body.appendChild(renderer.domElement)

    this.renderer = renderer
  }

  animate () {
    requestAnimationFrame(() => this.animate())

    this.renderer.render(
      this.scene,
      this.camera
    )
  }

  resize () {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

export default Engine;