import useStore from '../store/useStore'

const Header = () => {
  const stars = useStore((state) => state.stars)
  const totalStars = stars.reduce((a, b) => a + b, 0)

  return (
    <div className="flex justify-between items-center w-full px-12 pt-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brandRed rounded-sm rotate-12" />
        <h1 className="text-2xl font-black tracking-tighter italic">
          VIBE<span className="text-brandRed">PARKING</span>
        </h1>
      </div>

      <div className="text-right">
        <div className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-black text-white mb-1">
          TOTAL STARS
        </div>
        <div className="text-5xl font-black flex items-baseline justify-end gap-1">
          <span className="text-brandGold leading-none">{totalStars}</span>
          <span className="text-white opacity-20 text-2xl">/25</span>
        </div>
      </div>
    </div>
  )
}

export default Header
