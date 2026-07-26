'use client'

interface Match {
  teamA?: string
  teamB?: string
}

export default function Bracket3D({ matches }: { matches: any[] }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500 text-sm sm:text-base">
        🏆 Bracket coming soon — matches will appear here once scheduled.
      </div>
    )
  }

  return (
    <div className="space-y-3 p-2">
      {matches.map((match: Match, idx: number) => (
        <div
          key={idx}
          className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 hover:bg-white/10 transition-colors"
        >
          <span className="font-semibold text-purple-300 text-sm sm:text-lg flex-1 text-center truncate">
            {match.teamA || 'TBD'}
          </span>
          <span className="text-gray-600 text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 bg-white/5 rounded-full shrink-0">
            VS
          </span>
          <span className="font-semibold text-pink-300 text-sm sm:text-lg flex-1 text-center truncate">
            {match.teamB || 'TBD'}
          </span>
        </div>
      ))}
    </div>
  )
}
