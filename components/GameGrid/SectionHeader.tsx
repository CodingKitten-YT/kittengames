import type React from "react"

function SectionHeader({ icon, title, count, gradient = false }: { 
  icon: React.ReactNode; 
  title: string; 
  count?: number;
  gradient?: boolean;
}) {
  return (
    <div className="flex items-center mb-8 px-1 group">
      <div className={`mr-4 p-3 rounded-2xl text-white shadow-lg transition-all duration-300 group-hover:scale-110
        ${gradient 
          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600' 
          : 'bg-gradient-to-r from-purple-700 to-purple-800'
        }`}>
        {icon}
      </div>
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">{title}</h2>
        {count !== undefined && (
          <div className="flex items-center space-x-2">
            <div className="bg-purple-800/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-purple-100 border border-purple-700/30">
              {count} {count === 1 ? 'game' : 'games'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SectionHeader