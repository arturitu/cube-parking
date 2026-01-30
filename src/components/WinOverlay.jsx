import useStore from '../store/useStore'
import { levelsData } from '../data/levelsData'

const WinOverlay = () => {
  const currentLevelIndex = useStore((state) => state.currentLevelIndex)
  const stars = useStore((state) => state.stars)
  const gameWon = useStore((state) => state.gameWon)
  const setCurrentLevel = useStore((state) => state.setCurrentLevel)
  const resetLevel = useStore((state) => state.resetLevel)
  const clearProgress = useStore((state) => state.clearProgress)

  if (!gameWon) {
    return null
  }

  const totalStars = stars.reduce((a, b) => a + b, 0)
  const isPerfectScore = totalStars === 25
  const isEndScreen =
    currentLevelIndex === levelsData.length - 1 || isPerfectScore

  const getRankMessage = (score) => {
    if (score === 25) return 'MASTER! PERFECT SCORE'
    if (score >= 20) return 'EXCELLENT WORK'
    if (score >= 15) return 'GOOD JOB, KEEP GOING'
    return 'YOU CAN DO IT BETTER'
  }

  const handleRetry = () => {
    const firstIncomplete = stars.findIndex((s) => s < 5)
    if (firstIncomplete !== -1) {
      setCurrentLevel(firstIncomplete)
    } else {
      resetLevel()
    }
  }

  return (
    <div className="fixed inset-0 bg-brandDark/95 flex items-center justify-center pointer-events-auto backdrop-blur-md z-50">
      <div className="text-center max-w-sm md:max-w-md w-full px-8">
        <h2 className="text-4xl md:text-6xl font-black italic mb-4 tracking-tighter leading-[0.9] text-white text-center">
          {isPerfectScore
            ? 'GAME FINISHED!'
            : isEndScreen
            ? 'FINAL LEVEL CLEAR!'
            : 'LEVEL CLEAR!'}
        </h2>

        <div className="flex justify-center gap-1.5 md:gap-2 mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={
                'text-3xl md:text-5xl ' +
                (i < stars[currentLevelIndex]
                  ? 'text-brandGold'
                  : 'text-white/10')
              }
            >
              ★
            </div>
          ))}
        </div>

        {isEndScreen && (
          <div className="mb-10 md:mb-12">
            <div className="text-4xl md:text-5xl font-black text-brandGold mb-2 leading-none font-sans">
              {totalStars} / 25
            </div>
            <div className="text-[10px] md:text-xs font-bold tracking-[0.3em] opacity-60 uppercase text-white">
              {getRankMessage(totalStars)}
            </div>
          </div>
        )}

        {!isEndScreen && <div className="mb-10 md:mb-12" />}

        <div className="flex flex-col gap-3 md:gap-4 items-center">
          <button
            onClick={() => {
              if (isPerfectScore) {
                // Handled by New Game
              } else if (isEndScreen) {
                handleRetry()
              } else {
                setCurrentLevel(currentLevelIndex + 1)
              }
            }}
            className={
              'w-full py-4 md:py-5 bg-brandRed rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all text-xs md:text-sm text-white ' +
              (isPerfectScore ? 'hidden' : 'block')
            }
          >
            {isEndScreen ? 'Retry for more Stars' : 'Next Level'}
          </button>

          {isEndScreen && !isPerfectScore && (
            <button
              onClick={() => clearProgress()}
              className="py-2 text-white/30 hover:text-white font-bold uppercase tracking-[0.2em] text-[10px] transition-all"
            >
              Start New Game (Clear Progress)
            </button>
          )}

          {isPerfectScore && (
            <button
              onClick={() => clearProgress()}
              className="w-full py-5 bg-white/10 hover:bg-white/20 rounded-full font-black uppercase tracking-widest transition-all text-sm border border-white/20 text-white"
            >
              Start New Game
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default WinOverlay
