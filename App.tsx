import React, { useState } from 'react';
import { Inventory } from './components/Inventory';
import { CsvGenerator } from './components/CsvGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'csv'>('inventory');

  const bgImage = "https://i.pinimg.com/originals/4e/6f/54/4e6f5452777159292752207443505430.jpg";
  const noiseSvg = "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E";

  return (
    <div 
      className="min-h-screen flex justify-center items-start p-5 relative overflow-x-hidden font-sans text-ink"
      style={{
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for multiply effect */}
      <div className="absolute inset-0 bg-paper/80 mix-blend-multiply pointer-events-none z-0" />

      {/* Main Container */}
      <div 
        className="relative z-10 w-full max-w-[1100px] bg-white/95 border-[5px] border-ink shadow-hard p-4 sm:p-8 mt-4 sm:mt-10"
        style={{ backgroundImage: `url("${noiseSvg}")` }}
      >
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-10 border-b-4 border-ink pb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 min-w-[200px] p-5 font-marker text-xl sm:text-3xl border-[3px] border-ink text-center transition-all duration-200 relative
              ${activeTab === 'inventory' 
                ? 'bg-ink text-sunflower shadow-[6px_6px_0px_#ffcc00] -translate-y-1' 
                : 'bg-white hover:-translate-y-0.5 hover:shadow-hard-sm'
              }`}
          >
            LG 入库
            <div className="text-xs font-sans font-bold opacity-80 mt-1 uppercase tracking-tighter">INVENTORY DOJO</div>
            {activeTab === 'inventory' && <span className="absolute top-1 right-2 text-sm">★</span>}
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex-1 min-w-[200px] p-5 font-marker text-xl sm:text-3xl border-[3px] border-ink text-center transition-all duration-200 relative
              ${activeTab === 'csv' 
                ? 'bg-ink text-sunflower shadow-[6px_6px_0px_#ffcc00] -translate-y-1' 
                : 'bg-white hover:-translate-y-0.5 hover:shadow-hard-sm'
              }`}
          >
            LG 信息包
            <div className="text-xs font-sans font-bold opacity-80 mt-1 uppercase tracking-tighter">CSV SCROLL</div>
            {activeTab === 'csv' && <span className="absolute top-1 right-2 text-sm">★</span>}
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-[fadeIn_0.3s_ease-out]">
          {activeTab === 'inventory' ? <Inventory /> : <CsvGenerator />}
        </div>

      </div>
    </div>
  );
}