import useStore from '../store/useStore'
import { levelsData } from '../data/levelsData'

const UI = () => {
  const currentLevelIndex = useStore((state) => state.currentLevelIndex)
  const moves = useStore((state) => state.moves)
  const stars = useStore((state) => state.stars)
  const gameWon = useStore((state) => state.gameWon)
  const setCurrentLevel = useStore((state) => state.setCurrentLevel)
  const resetLevel = useStore((state) => state.resetLevel)

  const currentLevel = levelsData[currentLevelIndex]
  const totalStars = stars.reduce((a, b) => a + b, 0)

  return (
    <div className="fixed inset-0 pointer-events-none select-none flex flex-col p-8 text-white font-sans">
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#c52233] rounded-sm rotate-12" />
          <h1 className="text-2xl font-black tracking-tighter italic">
            VIBE<span className="text-[#c52233]">PARKING</span>
          </h1>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest opacity-50 font-bold">
            Total Stars
          </div>
          <div className="text-2xl font-black">
            <span className="text-[#f1c40f]">{totalStars}</span>
            <span className="opacity-30"> / 25</span>
          </div>
        </div>
      </div>

      {/* Level Selector */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
        {levelsData.map((level, index) => {
          const isSelected = currentLevelIndex === index
          const levelStars = stars[index]
          return (
            <button
              key={level.id}
              onClick={() => setCurrentLevel(index)}
              className={
                'relative w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all ' +
                (isSelected
                  ? 'bg-[#c52233] scale-110 shadow-lg'
                  : 'bg-white/10 hover:bg-white/20')
              }
            >
              {level.id}
              {levelStars > 0 && (
                <div className="absolute -bottom-1 left-0 w-full flex justify-center gap-[2px]">
                  {[...Array(levelStars)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full bg-[#f1c40f]"
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Level Info */}
      <div className="mt-20 w-64 p-6 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-md">
        <div className="text-[10px] uppercase tracking-widest opacity-50 font-bold mb-1">
          Level {currentLevel.id}
        </div>
        <h2 className="text-xl font-serif italic mb-6">{currentLevel.name}</h2>

        <div className="flex justify-between items-center mb-4">
          <div className="text-[10px] uppercase tracking-widest opacity-50 font-bold">
            Moves
          </div>
          <div className="text-xl font-black text-[#c52233]">{moves}</div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-[10px] uppercase tracking-widest opacity-50 font-bold">
            Minimum
          </div>
          <div className="text-xl font-black opacity-80">
            {currentLevel.idealMoves}
          </div>
        </div>
      </div>

      {/* Restart Button */}
      <div className="mt-auto flex justify-center pb-4">
        <button
          onClick={resetLevel}
          className="pointer-events-auto px-10 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
        >
          Restart Level
        </button>
      </div>

      {/* Win Overlay */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center pointer-events-auto backdrop-blur-sm">
          <div className="text-center">
            <h2 className="text-5xl font-black italic mb-2">LEVEL CLEAR!</h2>
            <div className="flex justify-center gap-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={
                    'text-4xl ' +
                    (i < stars[currentLevelIndex]
                      ? 'text-[#f1c40f]'
                      : 'text-white/10')
                  }
                >
                  ★
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                if (currentLevelIndex < levelsData.length - 1) {
                  setCurrentLevel(currentLevelIndex + 1)
                } else {
                  setCurrentLevel(0)
                }
              }}
              className="px-12 py-4 bg-[#c52233] rounded-full font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              {currentLevelIndex < levelsData.length - 1
                ? 'Next Level'
                : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UI
