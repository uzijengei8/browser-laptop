const React = require('react')
const ImmutableComponent = require('./immutableComponent')
const ipc = require('ipc')

// Actions
const AppActions = require('../actions/appActions')

// Components
const NavigationBar = require('./navigationBar')
const Frame = require('./frame')
const Tabs = require('./tabs')

// Constants
const Config = require('../constants/config')

// State handling
const FrameStateUtil = require('../state/frameStateUtil')

class Main extends ImmutableComponent {
  componentDidMount () {
    if (this.props.browser.get('frames').isEmpty()) {
      AppActions.newFrame({
        location: Config.defaultUrl
      })
    }

    ipc.on('shortcut-new-frame', () => {
      console.log('new frame shortcut!')

      AppActions.newFrame({
        location: Config.defaultUrl
      })
    })

    ipc.on('shortcut-close-frame', () =>
      AppActions.closeFrame())
  }

  get activeFrame () {
    return this.refs[`frame${this.props.browser.get('activeFrameKey')}`]
  }

  onBack () {
    this.activeFrame.goBack()
  }

  onForward () {
    this.activeFrame.goForward()
  }

  render () {
    const comparatorByKeyAsc = (a, b) => a.get('key') > b.get('key')
      ? 1 : b.get('key') > a.get('key') ? -1 : 0

    let activeFrame = FrameStateUtil.getActiveFrame(this.props.browser)

    return <div id='browser'>
      <div className='top'>
        <div className='backforward'>
          <span
            className='back fa fa-angle-left'
            disabled={!activeFrame || !activeFrame.get('canGoBack')}
            onClick={this.onBack.bind(this)} />
          <span
            className='forward fa fa-angle-right'
            disabled={!activeFrame || !activeFrame.get('canGoForward')}
            onClick={this.onForward.bind(this)} />
        </div>
        <NavigationBar
          navbar={this.props.browser.getIn(['ui', 'navbar'])}
          activeFrame={activeFrame}
        />
        <Tabs
          tabs={this.props.browser.getIn(['ui', 'tabs'])}
          frames={this.props.browser.get('frames')}
          key='tab-bar'
          activeFrame={activeFrame}
        />
      </div>
      <div className='mainContainer'>
        <div className='tabContainer'>
        {
          this.props.browser.get('frames').sort(comparatorByKeyAsc).map(frame =>
            <Frame
              ref={`frame${frame.get('key')}`}
              frame={frame}
              key={frame.get('key')}
              isActive={FrameStateUtil.isFrameKeyActive(this.props.browser, frame.get('key'))}
            />)
        }
        </div>
      </div>
    </div>
  }
}

module.exports = Main
