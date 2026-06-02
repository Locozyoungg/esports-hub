export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Esports Hub. All rights reserved.
        </p>
        <nav className="flex gap-6 text-sm text-gray-400">
          <a href="/tournaments" className="hover:text-purple-400 transition-colors">
            Tournaments
          </a>
          <a href="/community" className="hover:text-purple-400 transition-colors">
            Community
          </a>
        </nav>
      </div>
    </footer>
  )
}