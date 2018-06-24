const {
  Container,
  Bitmap,
  LoadQueue,
} = window.createjs

const STAR_PNG_FILE = './star_particle.png'

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

  createParticles(numParticles) {
    // for now, creates particles of the same img
    const particleList = new Container()
    // TODO: this "starID" is hardcoded for now
    const particleImg = ParticleSystem._queue.getResult('starID')
    const baseBitmap = new Bitmap(particleImg)
    for (let i = 0; i < numParticles; ++i) {
      const particle = baseBitmap.clone()
      particle.x = 5 * i
      particle.y = 5 * i
      particle.scaleX = i / 5
      particle.scaleY = i / 5
      particleList.addChild(particle)
    }
    return particleList
  },

  updateParticles(particleList) {
    particleList.children.forEach((particle, i) => {
      particle.x += i
      particle.y += i
    })
  }
}

export default ParticleSystem