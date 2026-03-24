


const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-stone-700/50 flex items-center justify-center border-2 border-stone-600 shadow-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* Badge */}
        <span className="inline-block px-4 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold tracking-widest uppercase rounded-full border border-amber-400/30 mb-6">
          Bảo Trì Hệ Thống
        </span>

        {/* Title */}
        <h1 className="text-4xl font-light tracking-widest text-white uppercase mb-4">
          FASHION
        </h1>
        <h2 className="text-xl font-medium text-stone-300 mb-4">
          Website đang được bảo trì
        </h2>
        <p className="text-stone-400 text-sm leading-relaxed mb-8">
          Chúng tôi đang nâng cấp hệ thống để mang đến trải nghiệm tốt hơn.
          Vui lòng quay lại sau ít phút. Xin lỗi vì sự bất tiện này.
        </p>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <p className="text-stone-500 text-xs">
          © 2026 FashionStyle. Mọi thắc mắc: support@fashionstyle.com
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
