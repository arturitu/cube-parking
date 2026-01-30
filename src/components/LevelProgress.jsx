import useStore from '../store/useStore'
import { levelsData } from '../data/levelsData'

const LevelProgress = () => {
  const currentLevelIndex = useStore((state) => state.currentLevelIndex)
  const stars = useStore((state) => state.stars)
  const completedLevels = useStore((state) => state.completedLevels)
  const setCurrentLevel = useStore((state) => state.setCurrentLevel)

  return (
    <div className="flex justify-center items-center gap-2 md:gap-4 py-4 md:py-6 overflow-x-auto">
      {levelsData.map((level, index) => {
        const isSelected = currentLevelIndex === index
        const isCompleted = completedLevels.includes(index)
        const levelStars = stars[index]
        const isLocked =
          index > 0 && !completedLevels.includes(index - 1) && !isCompleted

        return (
          <button
            key={level.id}
            onClick={() => !isLocked && setCurrentLevel(index)}
            disabled={isLocked}
            className={`
              relative w-11 h-11 md:w-14 md:h-14 rounded-md flex flex-col items-center justify-center transition-all border flex-shrink-0
              ${
                isSelected
                  ? 'bg-brandRed border-brandRed shadow-xl shadow-brandRed text-white scale-110 z-10'
                  : isLocked
                  ? 'bg-brandDark/40 border-white/5 opacity-20 cursor-not-allowed'
                  : 'bg-white/5 border-white/10 hover:border-brandGold/50 hover:bg-white/10'
              }
            `}
          >
            <span
              className={`text-xl md:text-2xl font-black mb-1 ${
                isSelected ? 'text-white' : 'text-white/80'
              }`}
            >
              {level.id}
            </span>

            {/* Stars or visual for completion inside the box */}
            <div className="absolute bottom-1.5 md:bottom-2 flex justify-center w-full gap-[2px] md:gap-[3px]">
              {isCompleted ? (
                [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${
                      i < levelStars
                        ? 'bg-brandGold shadow-[0_0_4px_rgba(241,196,15,0.6)]'
                        : 'bg-white/10'
                    }`}
                  />
                ))
              ) : (
                <div
                  className={`w-5 md:w-7 h-1 md:h-1.5 rounded-full ${
                    isSelected ? 'bg-black/20' : 'bg-white/5'
                  }`}
                />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default LevelProgress
