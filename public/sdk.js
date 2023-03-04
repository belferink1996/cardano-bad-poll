class BadPollSDK {
  constructor() {
    this.frontUrl = 'https://poll.badfoxmc.com/sdk'
  }

  stop() {
    this.iFrame = this.iFrameWrapper.removeChild(this.iFrame)
    this.iFrameWrapper = document.body.removeChild(this.iFrameWrapper)
  }

  start({ stakeKey } = {}) {
    if (!document || !document.body) {
      throw new Error('document.body is not defined')
    }

    const query = `?stake_key=${stakeKey}`
    const src = this.frontUrl + query
    const isMobile = window.innerWidth <= 768

    this.iFrameWrapper = document.createElement('div')
    this.iFrameWrapper.setAttribute('id', 'bad-poll-iframe-wrapper')
    this.iFrameWrapper.setAttribute(
      'style',
      'width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.5); border: none; display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; z-index: 999999'
    )

    this.iFrame = document.createElement('iframe')
    this.iFrame.setAttribute('id', 'bad-poll-iframe')
    this.iFrame.setAttribute('src', src)
    this.iFrame.setAttribute(
      'style',
      `max-width: ${isMobile ? '100vw' : '555px'}; width: 100%; max-height: ${
        isMobile ? '100vh' : '70vh'
      }; height: 100%; border: none; border-radius: ${isMobile ? '0' : '1rem'};`
    )

    this.iFrame = this.iFrameWrapper.appendChild(this.iFrame)
    this.iFrameWrapper = document.body.appendChild(this.iFrameWrapper)

    window.addEventListener('message', ({ origin, data: msg }) => {
      switch (msg) {
        case 'bad-poll-close': {
          this.stop()
          break
        }
        default: {
          break
        }
      }
    })
  }
}
