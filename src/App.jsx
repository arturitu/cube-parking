import UI from './components/UI'
import GameCanvas from './components/GameCanvas'

const App = () => {
  return (
    <div className="relative w-full h-screen bg-radial from-brandDark to-[#111111] overflow-hidden">
      <GameCanvas />
      <UI />
    </div>
  )
}

export default App
