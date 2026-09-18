export function Letterhead() {
  return (
    <div className="bg-white text-gray-900 px-8 py-6 border-b-2 border-gray-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        {/* Left: Yenepoya Logo & Branding */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-900 via-blue-600 to-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            Y
          </div>

          <div>
            <h2 className="text-lg font-bold text-blue-900 tracking-wide">
              PATH TO THE FUTURE
            </h2>
            <p className="text-xs text-blue-900 font-semibold mt-1">
              Darb Al-Mostaqbal Education Co.
            </p>
            <p className="text-xs text-blue-900">
              Yenepoya International Schools - KSA
            </p>
          </div>
        </div>

        {/* Right: Ministry of Education Logo */}
        <div className="text-right flex flex-col items-end">
          <div className="w-20 h-20 mb-2 flex items-center justify-center">
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-teal-500"
                />
              ))}
            </div>
          </div>
          <p className="text-xs font-semibold text-teal-700">وزارة التعليم</p>
          <p className="text-xs text-teal-700">Ministry of Education</p>
        </div>
      </div>
    </div>
  );
}

export function LetterheadFooter() {
  return (
    <div>
      <div className="border-t-2 border-gray-300 mt-12 pt-4 text-gray-700 text-xs">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Left */}
          <div>
            <p className="font-semibold">Future Path Education Co. L.L.C</p>
            <p>CR No. 2051263406</p>
          </div>

          {/* Center */}
          <div className="text-center">
            <p className="flex items-center justify-center gap-2">
              <span>☎</span>
              <span>+966 55 768 8833</span>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span>☎</span>
              <span>+966 50 674 4488</span>
            </p>
            <p className="flex items-center justify-center gap-2 mt-1">
              <span>📧</span>
              <span>info@yensschoolsksa.com</span>
            </p>
            <p className="text-xs">pathofuture.edu@gmail.com</p>
          </div>

          {/* Right */}
          <div className="text-right">
            <p className="font-semibold">Kingdom of Saudi Arabia</p>
            <p>Al Khobar, Al Azziziyah, Al Amwaj District</p>
          </div>
        </div>
      </div>

      {/* Colored bar */}
      <div className="flex gap-0 mt-4 h-1">
        <div className="flex-1 bg-blue-900" />
        <div className="flex-1 bg-yellow-500" />
      </div>
    </div>
  );
}
