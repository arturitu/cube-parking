import useStore from '../store/useStore'

const RestartButton = () => {
  const resetLevel = useStore((state) => state.resetLevel)

  return (
    <div className="w-full flex justify-end px-6 md:px-12">
      <button
        onClick={resetLevel}
        className="pointer-events-auto flex items-center gap-2 md:gap-3 px-5 md:px-8 py-2.5 md:py-3.5 rounded-full bg-brandRed hover:bg-brandRed/90 transition-all text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-brandRed/20 group"
      >
        <span className="hidden xs:inline">Restart Level</span>
        <span className="xs:hidden">Restart</span>
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 md:w-5 md:h-5 fill-none group-hover:rotate-180 transition-transform duration-500"
        >
          <path
            d="M5.00672 18.6238C5.98777 19.6049 7.08633 20.3467 8.30239 20.8493C9.51857 21.352 10.7541 21.6146 12.009 21.6369C13.2638 21.6596 14.4907 21.4411 15.6897 20.9817C16.8885 20.5224 17.9537 19.8269 18.8854 18.8953L16.6364 16.6462C15.3616 17.921 13.7986 18.54 11.9474 18.503C10.096 18.4662 8.50706 17.7845 7.18052 16.458C5.85919 15.1367 5.1838 13.5505 5.15436 11.6994C5.12479 9.84815 5.74991 8.28263 7.02972 7.00282C8.30451 5.72803 9.86752 5.10911 11.7187 5.14604C13.5701 5.18285 15.1615 5.867 16.493 7.1985L16.619 7.32448L15.0087 7.29561L15.0504 9.61736L21.1918 9.72747L21.0817 3.58606L18.7415 3.56282L18.7888 5.15468L18.6554 5.02127C17.6734 4.03932 16.5753 3.29794 15.361 2.79712C14.1466 2.29617 12.9088 2.03133 11.6476 2.00261C10.3864 1.97363 9.15899 2.18616 7.96545 2.6402C6.77203 3.09411 5.70373 3.79266 4.76054 4.73584C3.81735 5.67903 3.11611 6.75003 2.6568 7.94885C2.19737 9.14778 1.97897 10.3747 2.00159 11.6296C2.02396 12.8844 2.28518 14.1186 2.78524 15.3321C3.2853 16.5456 4.02579 17.6429 5.00672 18.6238Z"
            fill="white"
          />
        </svg>
      </button>
    </div>
  )
}

export default RestartButton
