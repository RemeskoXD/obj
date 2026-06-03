import React from 'react';
import { BlindOrderItem, ProductCategory } from '../types';

interface BlindLivePreviewProps {
  item: BlindOrderItem;
}

export default function BlindLivePreview({ item }: BlindLivePreviewProps) {
  const { category, productType, width, height, lamellaColor, topProfileColor, isCelostin, isSlant, controlSide } = item;

  // Resolve color values from codes
  const resolveColorHex = (code: string, fallback: string): string => {
    switch (code) {
      case '9010':
      case 'RAL9010':
        return '#FFFFFF';
      case '8017':
      case 'RAL8017':
        return '#4A2B20';
      case '9006':
      case 'RAL9006':
        return '#9CA3AF';
      case '7016':
      case 'RAL7016':
        return '#374151';
      case '1013':
        return '#F5F5DC';
      case '8004':
        return '#B45309';
      case 'RE_OAK':
      case 'W95':
        return '#D97706'; // Golden oak
      case 'RE_NUTS':
      case 'W96':
        return '#78350F'; // Walnut
      case 'W91': return '#EAB308'; // Borovice
      case 'W92': return '#F59E0B'; // Buk
      case 'W93': return '#D97706'; // Dub
      case 'W98': return '#991B1B'; // Mahagon
      case 'AWN_STD_BG': return '#F3F4F6';
      case 'AWN_STD_GR': return '#6B7280';
      case 'AWN_PREM_ST': return '#3B82F6'; // Stripes represent with styled pattern
      case 'AWN_ALU_W': return '#FFFFFF';
      case 'AWN_ALU_A': return '#1F2937';
      default:
        return fallback;
    }
  };

  const colorSlat = resolveColorHex(lamellaColor, '#D1D5DB');
  const colorProfile = resolveColorHex(topProfileColor, '#9CA3AF');

  // Compute responsive layout container scaling
  // We want to fit the blind in a aspect-ratio constrained box (e.g. max 200px width/height)
  const maxPixelSize = 160;
  const itemWidth = width || 1000;
  const itemHeight = height || 1200;

  const aspectRatio = itemWidth / itemHeight;
  let renderWidth = maxPixelSize;
  let renderHeight = maxPixelSize;

  if (aspectRatio > 1) {
    renderHeight = maxPixelSize / aspectRatio;
  } else {
    renderWidth = maxPixelSize * aspectRatio;
  }

  // Ensure render dimensions don't shrink too small for visual representation
  renderWidth = Math.max(renderWidth, 60);
  renderHeight = Math.max(renderHeight, 60);

  // Slat counts to display (not exact to millimetre but proportional to height/slat relation)
  const isAwn = category === 'AWNING';
  const isExt = category === 'EXTERNAL';
  const isHor = category === 'HORIZONTAL' || !category;

  const getSlatCount = () => {
    if (isAwn) return 1;
    if (isExt) return Math.min(12, Math.max(5, Math.round(itemHeight / 250)));
    return Math.min(18, Math.max(8, Math.round(itemHeight / 120)));
  };

  const slatCount = getSlatCount();
  const slatRows = Array.from({ length: slatCount });

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white flex flex-col items-center justify-center relative overflow-hidden select-none min-h-[290px] w-full shadow-inner">
      
      {/* Background CAD-Style gird overlays */}
      <div className="absolute inset-x-0 inset-y-0 opacity-10 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:10px_10px]" />
      
      {/* HUD category identifier tags */}
      <div className="absolute top-3 left-3 flex gap-1.5 items-center">
        <span className="p-1 px-2 text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-black uppercase tracking-wide">
          QAPI Vizualizace v1.2
        </span>
        {isCelostin && (
          <span className="p-1 px-1.5 text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-bold">
            💡 Celostín
          </span>
        )}
        {isSlant && (
          <span className="p-1 px-1.5 text-[8px] bg-red-500/20 text-red-300 border border-red-500/30 rounded font-bold">
            📐 Šikmina atyp
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3 text-right">
        <span className="text-[10px] font-mono text-slate-400 font-bold block">
          Plocha: {((itemWidth * itemHeight) / 1000000).toFixed(3)} m²
        </span>
      </div>

      {/* Main CAD Interactive Graphic Box */}
      <div className="relative flex flex-col items-center justify-center my-6 z-10">
        
        {/* Aspect ratio frame box */}
        <div 
          className="relative transition-all duration-300 ease-out border-2 border-slate-700/60 shadow-xl bg-slate-950 flex flex-col"
          style={{ width: `${renderWidth}px`, height: `${renderHeight}px`, borderRadius: '4px' }}
        >
          
          {/* TOP PROFILE / CASSETTE */}
          <div 
            className="w-full transition-all duration-300 ease-out shrink-0 relative flex items-center justify-center border-b border-black/45"
            style={{ 
              height: isAwn ? '16px' : isExt ? '12px' : '8px', 
              backgroundColor: colorProfile,
              borderRadius: '2px 2px 0 0'
            }}
          >
            {/* Somfy internal motor indicator */}
            {['MOTOR_IO', 'MOTOR_SWITCH'].includes(controlSide as string) && (
              <div className="absolute right-1 w-2 h-2 rounded-full bg-[#10B981] border border-black/30 animate-pulse" title="Elektropohon QAPI" />
            )}
            {/* Small mechanical gearbox */}
            {item.hasGearbox && (
              <span className="absolute left-1 text-[7px] leading-none text-black/60 font-black">⚙️</span>
            )}
          </div>

          {/* SLATS CONTAINER/BODY */}
          <div className="flex-1 w-full relative flex overflow-hidden p-1 gap-0.5" style={{ flexDirection: category === 'VERTICAL' ? 'row' : 'column', justifyContent: 'space-between' }}>
            {isAwn ? (
              /* Awning folded arms preview projection */
              <div className="absolute inset-0 flex flex-col justify-between p-1.5">
                <div 
                  className="w-full h-full transition-all duration-300 ease-out rounded relative overflow-hidden flex flex-col justify-between border border-black/10"
                  style={{
                    background: lamellaColor === 'AWN_PREM_ST'
                      ? 'repeating-linear-gradient(90deg, #3B82F6, #3B82F6 10px, #E5E7EB 10px, #E5E7EB 20px)'
                      : colorSlat
                  }}
                >
                  {/* Diagonal shade arms representation */}
                  <svg className="absolute inset-0 w-full h-full stroke-amber-400 opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="10" y1="90" x2="45" y2="20" strokeWidth="4" />
                    <line x1="90" y1="90" x2="55" y2="20" strokeWidth="4" />
                    <line x1="45" y1="20" x2="55" y2="20" strokeWidth="4" />
                  </svg>
                  <div className="absolute bottom-1 bg-black/60 text-white font-mono text-[7px] font-black tracking-wide px-1 rounded left-1/2 -translate-x-1/2">
                    VÝSUVNÁ RAMENA
                  </div>
                </div>
              </div>
            ) : category === 'VERTICAL' ? (
              /* Vertical Blinds slats side-by-side rendering */
              <>
                {Array.from({ length: 11 }).map((_, i) => (
                  <div 
                    key={i}
                    className="h-full rounded-xs transition-all duration-300 ease-out border-r border-black/15 shadow-2xs relative"
                    style={{ 
                      width: '8%',
                      backgroundColor: colorSlat,
                      opacity: 0.9,
                    }}
                  />
                ))}
                <div className="absolute inset-x-0 top-1/2 h-[1px] border-t border-dashed border-slate-400/30 opacity-40" />
              </>
            ) : category === 'SCREENS' ? (
              /* Insect Screens fine mesh grid rendering */
              <div className="absolute inset-0 bg-[#1e293b]/75 flex items-center justify-center p-1 font-mono text-[7px] tracking-wide font-black border border-white/5">
                <div 
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)',
                    backgroundSize: '4px 4px',
                    backgroundPosition: '0 0, 2px 2px'
                  }}
                />
                <span className="text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-850 z-10">
                  ISSO OCHRANNÁ SÍŤ
                </span>
              </div>
            ) : (
              /* Regular or External horizontal blind slats rendering */
              <>
                {slatRows.map((_, i) => (
                  <div 
                    key={i}
                    className="w-full rounded-sm transition-all duration-300 ease-out border-b border-black/15 shadow-2xs relative"
                    style={{ 
                      height: isExt ? '6px' : '4px',
                      backgroundColor: colorSlat,
                      opacity: isCelostin ? 1 : 0.9,
                      // Apply skew if slant blind atypical layout
                      transform: isSlant ? `skewY(${-12 + (i * 1.5)}deg)` : 'none'
                    }}
                  >
                    {/* Celostín tight interlocking overlap design indicator */}
                    {isCelostin && (
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-black/35" />
                    )}
                  </div>
                ))}

                {/* Control String Ladders / Cords for physical feel */}
                <div className="absolute inset-y-0 left-1/4 w-0.5 border-r border-dashed border-slate-400/40 opacity-55" />
                <div className="absolute inset-y-0 right-1/4 w-0.5 border-l border-dashed border-slate-400/40 opacity-55" />

                {/* Left/Right controls (cords or chain RP, RL) */}
                {controlSide === 'RP' && (
                  <div className="absolute right-1.5 top-0 h-[65%] w-1.5 border border-slate-300/50 rounded-full flex flex-col justify-around py-1 bg-black/10">
                    <div className="w-0.5 h-0.5 bg-white rounded-full mx-auto" />
                    <div className="w-0.5 h-0.5 bg-white rounded-full mx-auto" />
                    <div className="w-0.5 h-0.5 bg-white rounded-full mx-auto" />
                  </div>
                )}
                {controlSide === 'RL' && (
                  <div className="absolute left-1.5 top-0 h-[65%] w-1.5 border border-slate-300/50 rounded-full flex flex-col justify-around py-1 bg-black/10">
                    <div className="w-0.5 h-0.5 bg-white rounded-full mx-auto" />
                    <div className="w-0.5 h-0.5 bg-white rounded-full mx-auto" />
                    <div className="w-0.5 h-0.5 bg-white rounded-full mx-auto" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* BOTTOM PROFILE LIŠTA */}
          {!isAwn && (
            <div 
              className="w-full transition-all duration-300 ease-out shrink-0"
              style={{ 
                height: isExt ? '10px' : '6px', 
                backgroundColor: colorProfile,
                borderRadius: '0 0 2px 2px'
              }}
            />
          )}

        </div>

        {/* CAD Dimension rulers & bounds */}
        {/* Width measurement bar (Horizontal ruler underneath) */}
        <div 
          className="absolute -bottom-6 left-0 flex flex-col items-center justify-center transition-all duration-300"
          style={{ width: `${renderWidth}px` }}
        >
          {/* horizontal ruler line */}
          <div className="w-full h-[1px] bg-indigo-400 relative flex justify-between">
            <div className="h-1.5 w-[1px] bg-indigo-400 absolute left-0 -top-0.5" />
            <div className="h-1.5 w-[1px] bg-indigo-400 absolute right-0 -top-0.5" />
          </div>
          <span className="font-mono text-[9px] font-black text-indigo-300 mt-1 bg-slate-900 px-1 leading-none">
            {itemWidth} mm
          </span>
        </div>

        {/* Height measurement indicator (Vertical ruler to the right) */}
        <div 
          className="absolute top-0 -right-7 flex items-center justify-center transition-all duration-300"
          style={{ height: `${renderHeight}px` }}
        >
          {/* Vertical ruler line */}
          <div className="w-[1px] h-full bg-indigo-400 relative flex flex-col justify-between items-center">
            <div className="w-1.5 h-[1px] bg-indigo-400 absolute top-0 -left-0.5" />
            <div className="w-1.5 h-[1px] bg-indigo-400 absolute bottom-0 -left-0.5" />
            {/* Vertical rotated text */}
            <span className="font-mono text-[9px] font-black text-indigo-300 bg-slate-900 py-0.5 px-1 leading-none absolute whitespace-nowrap rotate-90 my-auto">
              {itemHeight} mm
            </span>
          </div>
        </div>

      </div>

      {/* Mini Legend labels */}
      <div className="mt-2.5 flex flex-wrap gap-2 text-[10px] justify-center text-slate-400 font-mono">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-indigo-400 inline-block" />
          <span>Kroucený profil</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded inline-block border border-slate-500" style={{ backgroundColor: colorSlat }} />
          <span>Lamela: {lamellaColor}</span>
        </div>
        {topProfileColor && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded inline-block border border-slate-500" style={{ backgroundColor: colorProfile }} />
            <span>Kryt: {topProfileColor}</span>
          </div>
        )}
      </div>

    </div>
  );
}
