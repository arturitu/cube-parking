import useStore from '../store/useStore'
import { levelsData } from '../data/levelsData'

const LevelHeader = () => {
  const currentLevelIndex = useStore((state) => state.currentLevelIndex)
  const moves = useStore((state) => state.moves)
  const currentLevel = levelsData[currentLevelIndex]

  return (
    <div className="flex justify-between items-end w-full max-w-5xl mx-auto pt-2">
      {/* Left: Your Moves */}
      <div className="w-1/3">
        <div className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-2">
          Your Moves
        </div>
        <div className="text-7xl font-black text-brandGold leading-none drop-shadow-md">
          {moves}
        </div>
      </div>

      {/* Center: Level Info */}
      <div className="w-1/3 text-center">
        <div className="text-xs uppercase tracking-[0.6em] font-bold text-brandGold mb-4">
          Level {currentLevel.id}
        </div>
        <h2 className="text-4xl font-serif italic text-white leading-tight drop-shadow-lg">
          {currentLevel.name}
        </h2>
      </div>

      {/* Right: Minimum Moves */}
      <div className="w-1/3 text-right">
        <div className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-2">
          Target
        </div>
        <div className="text-7xl font-black text-white/10 leading-none">
          {currentLevel.idealMoves}
        </div>
      </div>
    </div>
  )
}

export default LevelHeader
