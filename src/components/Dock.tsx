import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Wallet, Coins, Settings, Plus } from 'lucide-react';
import { useState } from 'react';

interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const dockItems: DockItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <Home className="w-6 h-6" />,
    path: '/',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'create',
    label: 'Create',
    icon: <Plus className="w-6 h-6" />,
    path: '/create',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: <TrendingUp className="w-6 h-6" />,
    path: '/projects',
    color: 'from-pink-500 to-pink-600',
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: <Wallet className="w-6 h-6" />,
    path: '/wallet',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    id: 'investments',
    label: 'Investments',
    icon: <Coins className="w-6 h-6" />,
    path: '/investments',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-6 h-6" />,
    path: '/settings',
    color: 'from-gray-500 to-gray-600',
  },
];

export function Dock() {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-[#1a3d4d]/60 backdrop-blur-xl border border-teal-700/30 rounded-[20px] px-4 py-3 shadow-2xl">
        <div className="flex items-end gap-2">
          {dockItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredItem === item.id;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className="relative group"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#0f2833]/95 backdrop-blur-md text-white text-xs font-medium rounded-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {item.label}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#0f2833]/95 rotate-45" />
                  </div>
                )}

                {/* Icon Container */}
                <div
                  className={`
                    relative w-14 h-14 rounded-[14px] flex items-center justify-center
                    bg-gradient-to-br ${item.color}
                    transition-all duration-300 ease-out
                    ${isHovered ? 'scale-110 -translate-y-2' : 'scale-100'}
                    ${isActive ? 'shadow-lg shadow-teal-500/30 scale-105' : 'shadow-md'}
                    hover:shadow-xl
                  `}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}
                  
                  {/* Icon */}
                  <div className="text-white">
                    {item.icon}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
