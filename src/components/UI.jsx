import useStore from '../store/useStore'
import { levelsData } from '../data/levelsData'
import Header from './Header'
import LevelProgress from './LevelProgress'
import LevelHeader from './LevelHeader'
import RestartButton from './RestartButton'
import Footer from './Footer'
import WinOverlay from './WinOverlay'

const UI = () => {
  return (
    <div className="fixed inset-0 pointer-events-none select-none flex flex-col text-white font-sans">
      <Header />

      <div className="mt-4 pointer-events-auto">
        <LevelProgress />
      </div>

      <LevelHeader />

      {/* Restart Button & Footer */}
      <div className="mt-auto flex flex-col items-center pb-4 md:pb-8 gap-6 md:gap-10">
        <RestartButton />
        <Footer />
      </div>

      <WinOverlay />
    </div>
  )
}

export default UI
