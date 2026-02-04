import React, { useState, useEffect } from 'react';

const StatusBadge = ({ color, label }: { color: string; label: string }) => {
  let bgClass = '';
  let dotClass = '';
  let textClass = '';
  let borderClass = '';

  switch (color) {
    case 'red':
      bgClass = 'bg-red-50';
      dotClass = 'bg-red-600';
      textClass = 'text-red-900';
      borderClass = 'border-red-100';
      break;
    case 'yellow':
      bgClass = 'bg-yellow-50';
      dotClass = 'bg-yellow-600';
      textClass = 'text-yellow-900';
      borderClass = 'border-yellow-100';
      break;
    case 'orange':
      bgClass = 'bg-orange-50';
      dotClass = 'bg-orange-600';
      textClass = 'text-orange-900';
      borderClass = 'border-orange-100';
      break;
    case 'blue':
      bgClass = 'bg-blue-50';
      dotClass = 'bg-[#137fec]';
      textClass = 'text-[#137fec]';
      borderClass = 'border-blue-100';
      break;
    case 'purple':
      bgClass = 'bg-purple-50';
      dotClass = 'bg-purple-600';
      textClass = 'text-purple-900';
      borderClass = 'border-purple-100';
      break;
    case 'cyan':
      bgClass = 'bg-cyan-50';
      dotClass = 'bg-cyan-600';
      textClass = 'text-cyan-900';
      borderClass = 'border-cyan-100';
      break;
  }

  return (
    <div className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full border pl-3 pr-4 ${bgClass} ${borderClass}`}>
      <div className={`size-2.5 rounded-full ${dotClass}`}></div>
      <p className={`text-xs font-bold uppercase tracking-wide ${textClass}`}>{label}</p>
    </div>
  );
};

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="flex items-center justify-center size-9 rounded-lg transition-all duration-300 hover:scale-105"
      style={{
        background: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
        boxShadow: 'var(--shadow-sm)'
      }}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      <span className="material-symbols-outlined text-[20px] transition-transform duration-300" style={{ transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)' }}>
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};

export const Header: React.FC = () => {
  return (
    <header className="flex-none flex items-center justify-end whitespace-nowrap border-b px-6 py-2.5 z-50 relative overflow-hidden" style={{ background: 'var(--bg-header)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Inject custom animations for liquid blobs */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* 左侧：Logo (True Liquid Morandi Style) */}
      <div className="absolute inset-y-0 left-0 w-[calc(100%-600px)] pointer-events-none overflow-hidden"
        style={{ maskImage: 'linear-gradient(to right, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)' }}>

        {/* Base Morandi Blue Background */}
        <div className="absolute inset-0 bg-[#F0F4F8] dark:bg-[#0f172a]"></div>

        {/* Liquid Blobs Container - High Blur for Fusion */}
        <div className="absolute inset-0 filter blur-3xl opacity-80 dark:opacity-60">
          {/* Blob 1: Professional Blue (#3B75B0) */}
          <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[#3B75B0] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>

          {/* Blob 2: Deep Depth (#2A5A8A) */}
          <div className="absolute top-[-10%] left-[20%] w-72 h-72 bg-[#2A5A8A] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>

          {/* Blob 3: Soft Light (#6B9AC9) */}
          <div className="absolute bottom-[-20%] left-[10%] w-72 h-72 bg-[#6B9AC9] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Logo Container (Positioned on top of the liquid) */}
        <div className="absolute inset-y-0 left-0 w-full flex items-center pl-8">
          {/* Added drop-shadow for better contrast against light liquid */}
          <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain brightness-0 invert opacity-95 relative z-10 drop-shadow-sm" />
        </div>
      </div>

      {/* 右侧：图例 + 主题切换 */}
      <div className="flex items-center gap-4 relative z-10">
        {/* 图例容器 */}
        <div className="flex gap-3 mr-4 pr-6" style={{ borderRight: '1px solid var(--border-color)' }}>
          <StatusBadge color="yellow" label="超时完成" />
          <StatusBadge color="red" label="超时未完成" />
          <StatusBadge color="purple" label="关联告警" />
          <StatusBadge color="cyan" label="临期预警" />
        </div>

        {/* 主题切换 */}
        <ThemeToggle />
      </div>
    </header>
  );
};