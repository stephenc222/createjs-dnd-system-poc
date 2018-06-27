const {
  Container,
  Bitmap,
  LoadQueue,
} = window.createjs

const STAR_PNG_FILE = './star_particle.png'

const radPerParticle = (particleIndex, numParticles) => particleIndex * (2 * Math.PI / numParticles)

const ParticleSystem = {

  _queue: new LoadQueue(),

  init() {
    const handleComplete = () => {
      const image = ParticleSystem._queue.getResult('starID');
      document.body.appendChild(image);
    }
    ParticleSystem._queue.on('complete', handleComplete, this);
    ParticleSystem._queue.loadManifest([{ id: 'starID', src: STAR_PNG_FILE }]);

  },

  setParticleCoords(particleList, xVal, yVal) {
    if (!particleList.children || !particleList.children.length) {
      throw new Error('no particles to loop over for coordinate setting')
    }

    particleList.children.forEach((particle) => {
      particle.x = xVal
      particle.y = yVal
    })
  },

  createParticles(numParticles) {
    // for now, creates particles of the same img
    const particleList = new Container()
    // TODO: this "starID" is hardcoded for now
    const particleImg = ParticleSystem._queue.getResult('starID')
    const baseBitmap = new Bitmap(particleImg)
    for (let i = 0; i < numParticles; ++i) {
      const particle = baseBitmap.clone()
      // TODO: hardcoded coord right now off canvas
      particle.x = -100 //5 * i
      particle.y = -100 //5 * i
      particle.scaleX = 0.5//i / 5
      particle.scaleY = 0.5//i / 5
      particleList.addChild(particle)
    }
    return particleList
  },

  updateParticles(particleList, particleSpeed) {
    if (!particleList.children || !particleList.children.length) {
      throw new Error('no particles to loop over for update')
    }
    const numParticles = particleList.children.length
    particleList.children.forEach((particle, i) => {
      const radianOfParticle = radPerParticle(i, numParticles)
      particle.x += particleSpeed * Math.cos(radianOfParticle)
      particle.y += particleSpeed * -Math.sin(radianOfParticle)
    })
  }
}

export default ParticleSystem