import useStore from '../store/useStore'
import { levelsData } from '../data/levelsData'

const LevelProgress = () => {
  const currentLevelIndex = useStore((state) => state.currentLevelIndex)
  const stars = useStore((state) => state.stars)
  const completedLevels = useStore((state) => state.completedLevels)
  const setCurrentLevel = useStore((state) => state.setCurrentLevel)

  return (
    <div className="flex justify-center items-center gap-4 py-4 border-y border-white/10">
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
              relative w-14 h-14 rounded-md flex flex-col items-center justify-center transition-all border
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
              className={`text-xl font-black ${
                isSelected ? 'text-white' : 'text-white/80'
              }`}
            >
              {level.id}
            </span>

            {/* Stars or visual for completion */}
            <div className="absolute -bottom-1 flex gap-1">
              {isCompleted
                ? [...Array(levelStars)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-brandGold rounded-full shadow-sm shadow-brandGold/50"
                    />
                  ))
                : isSelected && (
                    <div className="w-6 h-1 bg-white rounded-full opacity-50" />
                  )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default LevelProgress
