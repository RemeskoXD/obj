import React from 'react';
import { BlindOrderItem } from '../types';

interface BlindLivePreviewProps {
  item: BlindOrderItem;
}

export default function BlindLivePreview({ item }: BlindLivePreviewProps) {
  const {
    category,
    productType,
    width,
    height,
    lamellaColor = '',
    topProfileColor = '',
    bottomProfileColor = '',
    isCelostin = false,
    isSlant = false,
    controlSide = '',
    
    // Insect screens
    profileType = '',
    screenType = '',
    screenColor = '',
    threshold = '',
    meshColor = '',
    coverBar = false,
    supportingProfile = false,
    mountingLProfile = false,

    // Door screens
    rivetingPants = false,
    pantsSide = 'L',
    pantsCountStandard = 0,
    pantsCountSelfClose = 0,
    kickPlate = false,
    brushProfile = false,
    doorBarPosition = 'bez příčky',
    handleMagnet = false,

    // Window screens
    brushType = '',
    brushHeight = '',
    holderType = '',
    holderHeight = '',
    riveting = false,
    cornersLook = '',
    windowBarCount = 0,
    windowBarHeight1 = 0,
    windowBarHeight2 = 0,

    // Roller blinds
    controlMethod = '',
    electronicsType = '',
    chainLength = '',
    coverFabric = false,
    mountingOpus = '',
    safetyElement = false,
    coverBarCollete = 'plochá',
    awningWindSensor = false,

    // Horizontal blinds
    lamellaType = '',
    profileMaterial = 'Fe',
    locoColor = '',
    colorHarmony = false,
    controlLengthCustom = '',
    controlAccessory = '',
    windowMaterial = '',
    spacerCount = 0,
    safetyElementBlinds = false,
    mountingSupport = false
  } = item;

  // Resolve color values from codes
  const resolveColorHex = (code: string, fallback: string): string => {
    if (!code) return fallback;
    const cleanCode = code.replace(/^RAL\s*/i, '').trim().toLowerCase();
    
    switch (cleanCode) {
      case '9010':
      case 'ral9010':
      case 'bílá':
      case '9010 - bílá':
      case '1 - bílá mat':
      case 'bílá mat':
        return '#F8FAFC'; // Clean white
      case '8017':
      case 'ral8017':
      case 'tm. hnědá':
      case '8017 - tm. hnědá':
      case '2 - hnědá mat':
      case 'hnědá mat':
        return '#3D2314'; // Elegant deep brown
      case '9006':
      case 'ral9006':
      case 'stříbrná':
      case '9006 - stříbrná':
        return '#94A3B8'; // Metallic grey
      case '7016':
      case 'ral7016':
      case 'antracit':
      case '7016 - antracit':
      case '3 - antracit mat':
      case 'antracit mat':
      case '5 - antracit str.':
      case 'antracit str.':
        return '#1E293B'; // Premium anthracite slate
      case '1013':
      case 'sl. kost':
      case '1013 - sl. kost':
        return '#FAF6E9'; // Ivory warm bone white
      case '8004':
      case 'hnědá':
      case '8004 - hnědá':
        return '#78350F'; // Terracotta warm brown
      case '8003':
        return '#92400E';
      case 'db 703':
      case 'db703':
      case '4 - db 703':
        return '#0F172A'; // Midnight dark anthracite
      case 're_oak':
      case 're_oak_foil':
      case 'zlatý dub':
      case '6 - nástřik - zlatý dub (stellar mini)':
        return '#B45309'; // Golden oak base
      case 're_nuts':
      case 'ořech':
        return '#451A03'; // Walnut base
      case 'awn_std_bg': return '#EAE3CD'; // Warm sand canvas
      case 'awn_std_gr': return '#64748B'; // Solid slate canopy
      case 'awn_prem_st': return '#0284C7'; // Blue/white seaside stripes
      case 'awn_alu_w': return '#F8FAFC';
      case 'awn_alu_a': return '#1E293B';
      default:
        // Try fuzzy timber color matching
        if (cleanCode.includes('w91')) return '#D97706'; // Borovice pine
        if (cleanCode.includes('w92')) return '#EA580C'; // Buk beech
        if (cleanCode.includes('w93')) return '#B45309'; // Dub oak
        if (cleanCode.includes('w95') || cleanCode.includes('zlatý dub')) return '#D97706'; // Golden oak
        if (cleanCode.includes('w96') || cleanCode.includes('ořech')) return '#451A03'; // Walnut
        if (cleanCode.includes('w98') || cleanCode.includes('mahagon')) return '#7F1D1D'; // Mahogany red
        if (cleanCode.includes('bílá') || cleanCode.includes('white')) return '#F8FAFC';
        if (cleanCode.includes('antracit') || cleanCode.includes('7016') || cleanCode.includes('db')) return '#1E293B';
        if (cleanCode.includes('hnědá') || cleanCode.includes('8017') || cleanCode.includes('brown')) return '#3D2314';
        if (cleanCode.includes('stříbrná') || cleanCode.includes('9006') || cleanCode.includes('silver')) return '#94A3B8';
        if (cleanCode.includes('šedá') || cleanCode.includes('grey')) return '#475569';
        if (cleanCode.includes('černá') || cleanCode.includes('black')) return '#0F172A';
        return fallback;
    }
  };

  // Resolve Wood Grain representation gradient
  const getWoodGradient = (code: string): string => {
    switch (code.toUpperCase()) {
      case 'W91': // Borovice
        return 'linear-gradient(90deg, #F59E0B 0%, #D97706 50%, #F59E0B 100%)';
      case 'W92': // Buk
        return 'linear-gradient(90deg, #F97316 0%, #EA580C 50%, #F97316 100%)';
      case 'W93': // Dub
        return 'linear-gradient(90deg, #D97706 0%, #B45309 50%, #D97706 100%)';
      case 'W95': // Zlatý dub
        return 'linear-gradient(90deg, #EA580C 0%, #D97706 30%, #B45309 70%, #EA580C 100%)';
      case 'W96': // Ořech
        return 'linear-gradient(90deg, #451A03 0%, #78350F 50%, #3F1A03 100%)';
      case 'W98': // Mahagon
        return 'linear-gradient(90deg, #7F1D1D 0%, #991B1B 50%, #581C1C 100%)';
      default:
        return '';
    }
  };

  // Resolve Screen Mesh Color and transparency look
  const resolveMeshLook = (meshStr?: string) => {
    if (!meshStr) return { color: 'rgba(15, 23, 42, 0.75)', opacity: 0.75, name: 'Standard', isDense: false };
    const norm = meshStr.toLowerCase();
    
    if (norm.includes('šedá') || norm.includes('š – šedá')) {
      return { color: 'rgba(71, 85, 105, 0.7)', opacity: 0.7, name: 'Šedá standardní', isDense: false };
    }
    if (norm.includes('protipylová') || norm.includes('p – protipylová')) {
      return { color: 'rgba(13, 148, 136, 0.8)', opacity: 0.8, name: 'Protipylová antiseptická', isDense: true };
    }
    if (norm.includes('nanovlákn') || norm.includes('n – s nanovláknem')) {
      return { color: 'rgba(109, 40, 217, 0.82)', opacity: 0.85, name: 'Nanovlákno filtrační', isDense: true };
    }
    if (norm.includes('pet screen') || norm.includes('psč') || norm.includes('psš')) {
      return { color: 'rgba(153, 27, 27, 0.78)', opacity: 0.8, name: 'Zesílená PET screen odolná', isDense: true };
    }
    return { color: 'rgba(15, 23, 42, 0.75)', opacity: 0.75, name: 'Černá standardní', isDense: false };
  };

  const isAwn = category === 'AWNING';
  const isExt = category === 'EXTERNAL';
  const isScreen = category === 'SCREENS';
  const isRoll = category === 'ROLETKY';
  const isHor = category === 'HORIZONTAL' || category === 'WOODEN';
  const isVert = category === 'VERTICAL';

  // Choose display values and profiles
  const isWood = category === 'WOODEN';
  const frameColorHex = resolveColorHex(screenColor || locoColor || topProfileColor, '#F8FAFC');
  const lamellaColorHex = resolveColorHex(lamellaColor, '#CBD5E1');
  const profileColorHex = resolveColorHex(topProfileColor || locoColor, '#94A3B8');
  const bottomProfileHex = resolveColorHex(bottomProfileColor || topProfileColor || locoColor || lamellaColor, '#94A3B8');

  // Compute responsive dimensions
  const maxPixelSize = 180;
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

  // Minimum dimensions prevent crushing
  renderWidth = Math.max(renderWidth, 85);
  renderHeight = Math.max(renderHeight, 85);

  const getSlatCount = () => {
    if (isAwn) return 1;
    if (isExt) return Math.min(14, Math.max(6, Math.round(itemHeight / 210)));
    if (lamellaType && lamellaType.includes('16')) return Math.min(26, Math.max(14, Math.round(itemHeight / 75))); 
    return Math.min(20, Math.max(9, Math.round(itemHeight / 110)));
  };

  const slatCount = getSlatCount();
  const slatRows = Array.from({ length: slatCount });

  // Mesh color resolving helper for screens
  const meshLook = resolveMeshLook(meshColor);

  return (
    <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 text-white flex flex-col items-center justify-center relative overflow-hidden select-none min-h-[380px] w-full shadow-2xl">
      
      {/* Background CAD-Style grid overlays */}
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:12px_12px]" />
      
      {/* HUD category identifier tags */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center max-w-[75%] z-20">
        <span className="p-1 px-2.5 text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded-full font-bold uppercase tracking-widest">
          QAPI VIZUALIZACE V2.0
        </span>
        {isCelostin && (
          <span className="p-1 px-2 text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold shadow-xs animate-pulse">
            ☀️ Celostín 100%
          </span>
        )}
        {isSlant && (
          <span className="p-1 px-2 text-[8px] bg-red-500/20 text-red-300 border border-red-500/30 rounded-full font-semibold">
            📐 Šikmina atyp
          </span>
        )}
        {mountingLProfile && (
          <span className="p-1 px-2 text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 rounded-full font-bold">
            L-rám
          </span>
        )}
        {kickPlate && (
          <span className="p-1 px-2 text-[8px] bg-slate-550/40 text-neutral-200 border border-slate-650/30 rounded-full font-semibold">
            🛡️ Okopovka
          </span>
        )}
        {safetyElement && (
          <span className="p-1 px-2 text-[8px] bg-amber-500/30 text-amber-300 border border-amber-550/20 rounded-full font-medium">
            🚼 Dětská pojistka
          </span>
        )}
        {colorHarmony && (
          <span className="p-1 px-2 text-[8px] bg-violet-500/20 text-violet-300 border border-violet-500/25 rounded-full font-bold">
            🔮 Barevný soulad
          </span>
        )}
      </div>

      {/* Surface Area calculation tag */}
      <div className="absolute top-3 right-3 text-right z-20">
        <span className="text-[10px] font-mono text-slate-400 font-extrabold block bg-slate-900/60 p-1 px-2 rounded-lg border border-slate-800/50 backdrop-blur-xs">
          Plocha: {((itemWidth * itemHeight) / 1000000).toFixed(3)} m²
        </span>
      </div>

      {/* Wind sensor animation if markýza has sensor */}
      {isAwn && awningWindSensor && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 z-20 backdrop-blur-xs">
          {/* Animated SVG Windmill rotor */}
          <div className="relative w-5 h-5">
            <svg 
              className="w-full h-full text-sky-400 animate-[spin_1.5s_linear_infinite]" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <circle cx="12" cy="7" r="1.5" fill="currentColor" />
              <circle cx="12" cy="17" r="1.5" fill="currentColor" />
              <circle cx="7" cy="12" r="1.5" fill="currentColor" />
              <circle cx="17" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="text-[8px] font-mono font-black text-sky-300 tracking-wider">
            VĚTRNÉ ČIDLO AKTIVNÍ
          </span>
        </div>
      )}

      {/* Main CAD Interactive Graphic Box */}
      <div className="relative flex flex-col items-center justify-center my-8 z-10">
        
        {/* Aspect ratio frame box representing the absolute size constraints */}
        <div 
          className="relative transition-all duration-300 ease-out border shadow-2xl flex flex-col overflow-hidden bg-slate-950"
          style={{ 
            width: `${renderWidth}px`, 
            height: `${renderHeight}px`, 
            borderRadius: isRoll && coverBarCollete === 'radius' ? '14px 14px 4px 4px' : '6px',
            borderColor: isScreen ? frameColorHex : 'rgba(71, 85, 105, 0.4)'
          }}
        >
          
          {/* 1. LAYER ZERO: THE WINDOW BACKDROP SCENE (Simulates looking through glass) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-sky-200">
            {/* Scenic background gradient (Sky to garden grass) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#bae6fd] via-[#e0f2fe] to-[#bbf7d0]" />
            
            {/* Scenic trees or hills inside garden */}
            <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-emerald-600/50 to-transparent blur-xs" />
            <div className="absolute bottom-2 left-4 w-12 h-12 rounded-full bg-emerald-500/20 blur-xs" />
            <div className="absolute bottom-1 right-3 w-16 h-10 rounded-full bg-teal-600/15 blur-xs" />
            
            {/* Glass cross grids (Window Mullions) */}
            <div className="absolute inset-x-0 top-1/2 h-[1.5px] bg-white/45" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] bg-white/45" />
            
            {/* Sun glare lines (diagonal streaks) */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-80" />
            <div 
              className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] rotate-[35deg]"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.3) 34%, rgba(255,255,255,0.15) 38%, transparent)'
              }}
            />
          </div>

          {/* 2. SPECIFIC LAYER CONTENT VIEWS */}
          
          {/* CATEGORY A: SCREENS (Sítě proti hmyzu) */}
          {isScreen ? (
            <div className="absolute inset-0 flex flex-col justify-between z-10">
              
              {/* Mesh texturized grid overlay over the window background */}
              <div 
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: meshLook.isDense ? 0.92 : 0.82,
                  backgroundColor: meshLook.color,
                  backgroundImage: 'radial-gradient(#111 0.45px, transparent 0.45px), radial-gradient(#111 0.45px, transparent 0.45px)',
                  backgroundSize: '2.5px 2.5px',
                  backgroundPosition: '0 0, 1.25px 1.25px'
                }}
              />

              {/* Plisé Screen accordion grid rendering lines */}
              {productType === 'SCREEN_DOOR_PLEAT' && (
                <div className="absolute inset-0 flex divide-x divide-black/45 opacity-60">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className="h-full flex-1 bg-black/5" />
                  ))}
                </div>
              )}

              {/* Rolovací okenní VERSA: Top cassette box & bottom handle profile */}
              {productType === 'SCREEN_ROLLER_VERSA' && (
                <>
                  {/* Top Roller Cassette Box */}
                  <div 
                    className="absolute top-0 inset-x-0 h-4 border-b border-black/35 z-25 shadow-xs flex items-center justify-between px-2"
                    style={{ backgroundColor: frameColorHex }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-black/15" />
                    <span className="text-[5px] font-black tracking-wider text-black/45">VERSA ROLLER BOX</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-black/15" />
                  </div>
                  {/* Bottom pull bar profile */}
                  <div 
                    className="absolute bottom-0 inset-x-0 h-2 border-t border-black/35 z-25"
                    style={{ backgroundColor: frameColorHex }}
                  />
                  {/* Brake status label indicator */}
                  {item.hasBrake && (
                    <div className="absolute top-5 right-2 bg-indigo-650 text-white text-[5px] px-1 py-0.5 rounded shadow-xs font-bold uppercase tracking-wider z-30">
                      BRZDA
                    </div>
                  )}
                </>
              )}

              {/* Rolovací dveřní DAROS: Side cassette box & right magnet profile */}
              {productType === 'SCREEN_ROLLER_DAROS' && (
                <>
                  {/* Left Roller Cassette Box */}
                  <div 
                    className="absolute left-0 inset-y-0 w-4 border-r border-black/35 z-25 shadow-xs flex flex-col items-center justify-between py-2"
                    style={{ backgroundColor: frameColorHex }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-black/15" />
                    <span className="text-[4px] font-black tracking-wider text-black/45 rotate-90 my-2">DAROS</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-black/15" />
                  </div>
                  {/* Right side magnetic pull bar */}
                  <div 
                    className="absolute right-0 inset-y-0 w-2 border-l border-black/35 z-25 flex items-center justify-center"
                    style={{ backgroundColor: frameColorHex }}
                  >
                    <div className="w-1 h-3 rounded-full bg-black/30" />
                  </div>
                  {/* Brake status label indicator */}
                  {item.hasBrake && (
                    <div className="absolute top-2 right-4 bg-indigo-650 text-white text-[5px] px-1 py-0.5 rounded shadow-xs font-bold uppercase tracking-wider z-30">
                      BRZDA
                    </div>
                  )}
                </>
              )}

              {/* L-Profile Outer Border highlight */}
              {mountingLProfile && (
                <div className="absolute inset-0.5 border border-dashed border-emerald-400 pointer-events-none z-30" />
              )}

              {/* Brush profile fuzzy seal around the edges */}
              {brushProfile && (
                <div className="absolute inset-0 border-[2.5px] border-slate-900 border-dashed opacity-50 z-20 pointer-events-none" />
              )}

              {/* Rotating plastic holders (Vrtané obrtlíky/držáky) */}
              {productType === 'SCREEN_FIX_W' && holderType && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  <div className="absolute top-[15%] -left-1 w-2.5 h-1 bg-[#94A3B8] border border-black/50 rounded-full rotate-45 transform origin-center shadow-xs" />
                  <div className="absolute top-[15%] -right-1 w-2.5 h-1 bg-[#94A3B8] border border-black/50 rounded-full -rotate-45 transform origin-center shadow-xs" />
                  <div className="absolute bottom-[20%] -left-1 w-2.5 h-1 bg-[#94A3B8] border border-black/50 rounded-full -rotate-45 transform origin-center shadow-xs" />
                  <div className="absolute bottom-[20%] -right-1 w-2.5 h-1 bg-[#94A3B8] border border-black/50 rounded-full rotate-45 transform origin-center shadow-xs" />
                  
                  {holderHeight && (
                    <div className="absolute top-[50%] -left-1 w-2.5 h-1 bg-amber-500 border border-black/40 rounded-full z-20" title={`Držák ve výšce ${holderHeight}`} />
                  )}
                </div>
              )}

              {/* Sliding Screen Door representation (Screen Door Slide) */}
              {productType === 'SCREEN_DOOR_SLIDE' && (
                <>
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 border-l border-black/40 z-25" style={{ backgroundColor: frameColorHex }} />
                  <div className="absolute right-[4px] top-[48%] w-1.5 h-5 bg-[#CBD5E1] border border-black/40 rounded-sm z-30" />
                </>
              )}

              {/* Fixed Screen Corner appearance Caps (Plastic corners vs clean cut) */}
              {productType === 'SCREEN_FIX_W' && cornersLook === 'vnější' && (
                <>
                  <div className="absolute top-0 left-0 w-3 h-3 border-b border-r border-[#475569]/30" style={{ backgroundColor: frameColorHex }} />
                  <div className="absolute top-0 right-0 w-3 h-3 border-b border-l border-[#475569]/30" style={{ backgroundColor: frameColorHex }} />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-t border-r border-[#475569]/30" style={{ backgroundColor: frameColorHex }} />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-t border-l border-[#475569]/30" style={{ backgroundColor: frameColorHex }} />
                </>
              )}

              {/* Dividing transoms / crossbars */}
              {/* 1. Door Screen partition line */}
              {productType === 'SCREEN_DOOR_OPEN' && doorBarPosition !== 'bez příčky' && (
                <>
                  {doorBarPosition.includes('1ks') || doorBarPosition.includes('dolní') || doorBarPosition.includes('střední') || doorBarPosition.includes('horní') ? (
                    <div 
                      className="absolute left-0 right-0 h-2.5 border-y border-black/40 z-20 flex items-center justify-center text-[5px] font-bold text-slate-800 transition-all duration-200"
                      style={{ 
                        backgroundColor: frameColorHex,
                        top: doorBarPosition.includes('dolní') || doorBarPosition.includes('1/3') 
                          ? '66%' 
                          : doorBarPosition.includes('horní') 
                          ? '33%' 
                          : '50%' 
                      }}
                    >
                      QAPI
                    </div>
                  ) : (
                    <>
                      <div 
                        className="absolute left-0 right-0 h-2 border-y border-black/40 z-20"
                        style={{ backgroundColor: frameColorHex, top: '35%' }}
                      />
                      <div 
                        className="absolute left-0 right-0 h-2 border-y border-black/40 z-20"
                        style={{ backgroundColor: frameColorHex, top: '65%' }}
                      />
                    </>
                  )}
                </>
              )}

              {/* 2. Window Screen partition lines based on exact user measurements */}
              {productType === 'SCREEN_FIX_W' && windowBarCount > 0 && (
                <>
                  {windowBarCount === 1 ? (
                    <div 
                      className="absolute left-0 right-0 h-2.5 border-y border-black/40 z-20 flex items-center justify-center font-mono text-[5px] text-slate-600 font-extrabold"
                      style={{ 
                        backgroundColor: frameColorHex,
                        top: windowBarHeight1 > 0 ? `${Math.min(92, Math.max(8, 100 - (windowBarHeight1 / itemHeight) * 100))}%` : '50%'
                      }}
                    >
                      P1
                    </div>
                  ) : (
                    <>
                      <div 
                        className="absolute left-0 right-0 h-2 border-y border-black/30 z-20 flex items-center justify-center font-mono text-[5px] text-slate-600 font-extrabold"
                        style={{ 
                          backgroundColor: frameColorHex,
                          top: windowBarHeight1 > 0 ? `${Math.min(92, Math.max(8, 100 - (windowBarHeight1 / itemHeight) * 100))}%` : '35%'
                        }}
                      >
                        P1
                      </div>
                      <div 
                        className="absolute left-0 right-0 h-2 border-y border-black/30 z-20 flex items-center justify-center font-mono text-[5px] text-slate-600 font-extrabold"
                        style={{ 
                          backgroundColor: frameColorHex,
                          top: windowBarHeight2 > 0 ? `${Math.min(92, Math.max(8, 100 - (windowBarHeight2 / itemHeight) * 100))}%` : '70%'
                        }}
                      >
                        P2
                      </div>
                    </>
                  )}
                </>
              )}

              {/* OKOPPLATE / Okopový plech (Pre-drilled aluminium protective sheet) */}
              {productType === 'SCREEN_DOOR_OPEN' && kickPlate && (
                <div 
                  className="absolute bottom-0 inset-x-0 h-[22%] border-t border-black/40 z-25 flex flex-col items-center justify-center tracking-widest text-[#1e293b]/70 font-black"
                  style={{ 
                    background: `linear-gradient(to bottom, ${frameColorHex} 0%, rgba(148, 163, 184, 0.4) 100%)` 
                  }}
                >
                  <span className="text-[6px] tracking-wide text-slate-600">PROTI-KOP</span>
                  {/* Subtle metal brush pattern overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:100%_2px] opacity-30 pointer-events-none" />
                </div>
              )}

              {/* Threshold (Práh) strip at bottom */}
              {productType === 'SCREEN_DOOR_PLEAT' && threshold && (
                <div 
                  className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border-t border-slate-900 z-25 flex items-center justify-center"
                >
                  <div className="w-[80%] h-0.5 bg-black/20" />
                </div>
              )}

              {/* Supporting Profile overlay */}
              {supportingProfile && (
                <div 
                  className="absolute top-0 bottom-0 left-[48%] w-2 border-x border-black/40 z-20 flex items-center justify-center"
                  style={{ backgroundColor: frameColorHex }}
                />
              )}

              {/* Metal Hinges (Panty) positioned based on customized counts and properties */}
              {productType === 'SCREEN_DOOR_OPEN' && (
                <div className="absolute inset-y-0 inset-x-0 pointer-events-none z-30">
                  {/* Standard hinges based on quantity */}
                  {Array.from({ length: Math.max(3, pantsCountStandard || 3) }).map((_, i) => {
                    const topPercent = 10 + i * 36;
                    return (
                      <div 
                        key={`std-pant-${i}`}
                        className="absolute w-1.2 h-3 border border-black/35 rounded-xs shadow-xs"
                        style={{ 
                          top: `${topPercent}%`,
                          left: pantsSide === 'L' ? '1px' : 'auto', 
                          right: pantsSide === 'P' ? '1px' : 'auto',
                          background: rivetingPants ? 'linear-gradient(to right, #F59E0B, #D97706)' : 'linear-gradient(to right, #E2E8F0, #94A3B8)'
                        }}
                      />
                    );
                  })}
                  
                  {/* Self-closing spring hinges (Samozavírací) in distinct golden color tone */}
                  {pantsCountSelfClose > 0 && Array.from({ length: pantsCountSelfClose }).map((_, i) => {
                    const topPercent = 25 + i * 40;
                    return (
                      <div 
                        key={`self-pant-${i}`}
                        className="absolute w-1.5 h-3.5 border border-[#3E2314]/30 rounded-xs bg-gradient-to-r from-amber-400 to-[#D97706] shadow-md animate-pulse"
                        style={{ 
                          top: `${topPercent}%`,
                          left: pantsSide === 'L' ? '0px' : 'auto', 
                          right: pantsSide === 'P' ? '0px' : 'auto' 
                        }}
                        title="Samozavírací pružinový pant"
                      />
                    );
                  })}
                </div>
              )}

              {/* Handle with strong magnet snap (Klika s magnetem) */}
              {productType === 'SCREEN_DOOR_OPEN' && handleMagnet && (
                <div 
                  className="absolute top-[48%] w-2.5 h-5 rounded-xs border border-black/45 z-30 shadow-xs flex flex-col justify-between p-0.5 bg-gradient-to-b from-slate-200 to-slate-400"
                  style={{ 
                    left: pantsSide === 'P' ? '2.5px' : 'auto', 
                    right: pantsSide === 'L' ? '2.5px' : 'auto' 
                  }}
                  title="Dveřní madýlko s magnetem"
                >
                  <div className="w-1.5 h-0.5 bg-slate-600 rounded-full mx-auto" />
                  <div className="w-1.5 h-1 bg-black/40 rounded-full mx-auto" />
                </div>
              )}

              {/* Title Text Identification HUD inside screen */}
              <div className="absolute top-[40%] text-[#111]/30 font-bold uppercase tracking-widest text-[8px] text-center w-full z-1 pointer-events-none select-none">
                SÍŤ PROTI HMYZU
              </div>

            </div>
          ) : isRoll ? (
            
            /* CATEGORY B: ROLLER BLINDS (Látkové roletky) */
            <div className="absolute inset-0 flex flex-col justify-between z-10">
              
              {/* TOP CASSETTE BOX HEADER */}
              <div 
                className="w-full shrink-0 relative flex items-center justify-center transition-all duration-300 border-b border-black/40 shadow-xs"
                style={{ 
                  height: '24px', 
                  backgroundColor: coverFabric ? lamellaColorHex : '#E2E8F0',
                  borderRadius: coverBarCollete === 'radius' ? '12px 12px 0 0' : '0'
                }}
              >
                {/* Simulated inner metal reflection shine */}
                <div className="absolute inset-x-0 top-0.5 h-1.5 bg-white/25" />
                {coverFabric && (
                  <div className="absolute inset-x-0 top-0 bottom-0 opacity-40 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_3px,transparent_3px,transparent_6px)]" />
                )}
                
                {/* Small hardware label on top bar */}
                <span className="text-[6px] tracking-wider text-slate-800 font-extrabold scale-95 uppercase">
                  {coverBarCollete === 'radius' ? 'ROLO ROUND' : 'ROLO CLASSIC'}
                </span>
              </div>

              {/* FABRIC SHADE SHEET EXPANSION LAYER */}
              <div className="flex-1 w-full relative flex flex-col justify-end p-0.5">
                
                {/* Fabric canvas with beautiful custom aesthetics */}
                <div 
                  className="w-full h-[90%] border border-black/25 transition-all duration-300 relative rounded-xs shadow-md"
                  style={{ 
                    backgroundColor: lamellaColorHex,
                    opacity: 0.94
                  }}
                >
                  {/* Day & Night striped patterns for Opus & Zebra designs */}
                  {productType.includes('OPUS') || mountingOpus || productType.includes('ROLOLITE') ? (
                    <div className="absolute inset-0 flex flex-col justify-between bg-transparent">
                      {Array.from({ length: 7 }).map((_, sIdx) => (
                        <div 
                          key={`zebra-${sIdx}`} 
                          className="h-[8%] w-full transition-all"
                          style={{ 
                            backgroundColor: sIdx % 2 === 0 ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.3)',
                            borderBottom: '0.5px solid rgba(0,0,0,0.08)'
                          }} 
                        />
                      ))}
                    </div>
                  ) : (
                    // Classic dense fabric texture
                    <div 
                      className="absolute inset-0 opacity-15"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.15) 50%, transparent 50%), linear-gradient(rgba(0,0,0,0.15) 50%, transparent 50%)',
                        backgroundSize: '2.5px 2.5px'
                      }}
                    />
                  )}

                  {/* Heat pressed weighted bottom guide bar (Zatěžovací lišta) */}
                  <div className="absolute bottom-0 left-0 right-0 h-3.5 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 border-t border-[#111]/30 flex items-center justify-between px-1">
                    <div className="w-1 h-1 bg-black/40 rounded-full" />
                    <div className="flex-1 h-1 bg-black/10 rounded-full mx-1" />
                    <div className="w-1 h-1 bg-black/40 rounded-full" />
                  </div>
                </div>

              </div>

              {/* Floating control beaded chain (Řetízek s dírkami) */}
              {(controlMethod === 'Ř - řetízek' || controlSide.startsWith('R')) && (
                <div 
                  className="absolute top-5 h-[72%] w-2 px-[1.5px] border-x border-[#94A3B8]/30 bg-black/5 z-25 flex flex-col justify-between"
                  style={{ 
                    left: controlSide === 'RL' || controlSide === 'L' ? '5px' : 'auto', 
                    right: controlSide === 'RP' || controlSide === 'P' || controlSide === '' ? '5px' : 'auto' 
                  }}
                >
                  {/* Simulated chain beads */}
                  <div className="w-1 h-1 bg-slate-100 rounded-full mx-auto border border-black/30" />
                  <div className="w-1 h-1 bg-slate-100 rounded-full mx-auto border border-black/30" />
                  <div className="w-1 h-1 bg-slate-100 rounded-full mx-auto border border-black/30" />
                  <div className="w-1 h-1 bg-slate-100 rounded-full mx-auto border border-black/30" />
                  
                  {/* Safety Tension Guard (Dětská pojistka) preventing strangulation hazards */}
                  {safetyElement && (
                    <div 
                      className="absolute bottom-1.5 left-[-2.5px] w-3 h-3 bg-red-500 text-white rounded-full border border-white/80 animate-bounce flex items-center justify-center font-black text-[6px]" 
                      title="Dětská pojistka řetízku splňuje normy EU"
                    >
                      !
                    </div>
                  )}
                </div>
              )}

              {/* Somfy/Elero motor wire connector */}
              {(controlMethod.includes('M') || controlSide.startsWith('MOTOR')) && (
                <div 
                  className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-md animate-pulse flex items-center justify-center z-30" 
                  title="Inteligentní tichý pohon QAPI"
                >
                  <span className="text-[5px] text-white font-bold leading-none">M</span>
                </div>
              )}

            </div>
          ) : (
            
            /* CATEGORY C: HORIZONTAL / EXTERNAL BLINDS & AWNINGS */
            <div className="absolute inset-0 flex flex-col justify-between z-10">
              
              {/* TOP PROFILE BOX CARRIER ENTRY */}
              <div 
                className="w-full transition-all duration-300 shrink-0 relative flex items-center justify-center border-b border-black/50 shadow-xs"
                style={{ 
                  height: isAwn ? '22px' : isExt ? '16px' : '10px', 
                  backgroundColor: profileColorHex,
                  borderRadius: '3px 3px 0 0'
                }}
              >
                {/* Brushed reflection glare on aluminum housing */}
                <div className="absolute inset-x-0 top-0.5 h-1 bg-white/25" />
                
                {/* Motor badge overlay on top casing */}
                {['MOTOR_IO', 'MOTOR_SWITCH'].includes(controlSide) && (
                  <div className="absolute right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white shadow-sm flex items-center justify-center pointer-events-auto" title="Motor pohon Somfy">
                    <span className="text-[5px] text-white font-extrabold scale-95 leading-none">M</span>
                  </div>
                )}

                {/* Physical gearbox outline widget */}
                {item.hasGearbox && (
                  <span className="absolute left-1.5 text-[7px] select-none animate-[pulse_2s_infinite]">⚙️</span>
                )}
                
                {/* Top Profile material badge */}
                {profileMaterial === 'Al' && !isAwn && (
                  <span className="absolute right-5 text-[5px] font-black text-slate-800 bg-slate-200/80 p-0.5 rounded leading-none" title="Extrudovaný hliníkový box">AL</span>
                )}
              </div>

              {/* SLAT BODY CONTAINER WITH DETAILED RENDER ENGINE */}
              <div 
                className="flex-1 w-full relative flex p-1 overflow-hidden" 
                style={{ 
                  flexDirection: isVert ? 'row' : 'column', 
                  justifyContent: 'space-between',
                  gap: isVert ? '2px' : isExt ? '4px' : '1.5px' 
                }}
              >
                {/* PERSPECTIVE C1: AWNING (Výsuvná markýza) */}
                {isAwn ? (
                  <div className="absolute inset-0 p-2 flex flex-col justify-between">
                    <div 
                      className="w-full h-full rounded transition-all duration-300 relative overflow-hidden flex flex-col justify-between border border-black/40 shadow-lg"
                      style={{
                        background: lamellaColor === 'AWN_PREM_ST'
                          ? 'repeating-linear-gradient(90deg, #0284C7, #0284C7 8px, #FAF6E9 8px, #FAF6E9 16px)'
                          : lamellaColorHex
                      }}
                    >
                      {/* 3D Tension Arms overlay lines */}
                      <svg className="absolute inset-0 w-full h-full stroke-amber-500 opacity-80" viewBox="0 0 120 120" preserveAspectRatio="none">
                        <line x1="12" y1="108" x2="48" y2="24" strokeWidth="4.5" strokeLinecap="round" />
                        <line x1="108" y1="108" x2="72" y2="24" strokeWidth="4.5" strokeLinecap="round" />
                        <line x1="48" y1="24" x2="72" y2="24" strokeWidth="4.5" strokeLinecap="round" />
                        {/* Shadow underneath arms */}
                        <line x1="12" y1="109" x2="48" y2="25" strokeWidth="4.5" stroke="rgba(0,0,0,0.15)" />
                      </svg>

                      {/* Front wave-fringed valance (Dekorativní volán) at the absolute bottom edge */}
                      <div className="absolute bottom-0 inset-x-0 h-4 flex z-20">
                        {Array.from({ length: 12 }).map((_, vIdx) => (
                          <div 
                            key={`valance-${vIdx}`}
                            className="flex-1 h-3 rounded-b-full shadow-2xs border-t border-black/15 transition-all"
                            style={{ 
                              backgroundColor: lamellaColor === 'AWN_PREM_ST' ? (vIdx % 2 === 0 ? '#0284C7' : '#FAF6E9') : lamellaColorHex 
                            }}
                          />
                        ))}
                      </div>

                      <div className="absolute top-[40%] bg-black/75 text-amber-400 font-mono text-[6px] font-black tracking-widest px-2 py-0.5 rounded-full left-1/2 -translate-x-1/2 shadow-xs border border-amber-500/20">
                        ROBUSTNÍ RAMENA
                      </div>
                    </div>
                  </div>
                ) : isVert ? (
                  
                  /* PERSPECTIVE C2: VERTICAL BLINDS (Vertikální lamely) */
                  <>
                    {Array.from({ length: 11 }).map((_, i) => (
                      <div 
                        key={`lam-vert-${i}`}
                        className="h-full rounded-xs transition-all duration-350 ease-out border-r border-[#111]/35 shadow-xs relative"
                        style={{ 
                          width: '8%',
                          background: isWood ? getWoodGradient(lamellaColor) : lamellaColorHex,
                          opacity: 0.95,
                        }}
                      >
                        {/* Alternating soft 3D shade simulation */}
                        <div className="absolute inset-y-0 left-0 w-1/3 bg-white/15" />
                        <div className="absolute inset-y-0 right-0 w-1/3 bg-black/15" />
                        
                        {/* bottom stabilization weight card (Stabilizační závaží) */}
                        <div className="absolute bottom-1 inset-x-0.5 h-1.5 bg-slate-350 border border-black/20" />
                      </div>
                    ))}
                    {/* Intersecting bottom stabilization chain (Spojovací řetízek dolní) */}
                    <div className="absolute inset-x-0 bottom-2.5 h-[1.5px] border-b border-dashed border-slate-300 opacity-60 pointer-events-none" />
                  </>
                ) : (
                  
                  /* PERSPECTIVE C3: HORIZONTAL & EXTERNAL ACCENT BLINDS (Klasické lamely) */
                  <>
                    {/* Vertical guideline wires (Silonové vodící šňůry) at 25% and 75% width */}
                    <div 
                      className="absolute inset-y-0 left-[26%] w-[1px] border-r border-dashed border-slate-800 opacity-40 z-10" 
                      style={{ borderColor: colorHarmony ? lamellaColorHex : 'rgba(15,23,42,0.45)' }}
                    />
                    <div 
                      className="absolute inset-y-0 right-[26%] w-[1px] border-l border-dashed border-slate-800 opacity-40 z-10" 
                      style={{ borderColor: colorHarmony ? lamellaColorHex : 'rgba(15,23,42,0.45)' }}
                    />

                    {slatRows.map((_, i) => {
                      const baseWoodGrad = getWoodGradient(lamellaColor);
                      
                      return (
                        <div 
                          key={`slat-${i}`}
                          className="w-full rounded-xs transition-all duration-350 ease-out border-b border-black/25 shadow-2xs relative"
                          style={{ 
                            height: isExt ? '7.5px' : (lamellaType && lamellaType.includes('16') ? '2.5px' : '4px'),
                            background: isWood ? baseWoodGrad : lamellaColorHex,
                            opacity: isCelostin ? 1.0 : 0.92,
                            transform: isSlant ? `skewY(${-10 + (i * 1.1)}deg)` : 'none'
                          }}
                        >
                          {/* Top metallic gloss highlight if modern horizontal color */}
                          {!isWood && (
                            <div className="absolute top-0 inset-x-0 h-[1px] bg-white/15" />
                          )}

                          {/* Technical string drill holes (Technický prostřih dírky) visible ONLY in standard, closed in Celostín */}
                          {!isCelostin && !isExt && (
                            <>
                              <div className="absolute left-[26%] -translate-x-1/2 top-1 w-1.2 h-0.8 bg-[#111] rounded-full opacity-65" />
                              <div className="absolute right-[26%] translate-x-1/2 top-1 w-1.2 h-0.8 bg-[#111] rounded-full opacity-65" />
                            </>
                          )}

                          {/* Rubber seal bead simulation on bottom edge for Z90 / S90 external slats */}
                          {isExt && ['EXT_Z90', 'EXT_S90'].includes(productType) && (
                            <div className="absolute bottom-0 inset-x-0 h-0.8 bg-slate-900 opacity-80" title="Gumené tlumící těsnění integrované" />
                          )}
                        </div>
                      );
                    })}

                    {/* External Robust Side Guiding tracks (Zabudované vodící lišty) for Outdoor Venetian blinds */}
                    {isExt && (
                      <>
                        {/* Leit-schiene left track */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-2.5 border-r border-[#111]/40 shadow-xs z-30" 
                          style={{ backgroundColor: profileColorHex }}
                        />
                        {/* Leit-schiene right track */}
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-2.5 border-l border-[#111]/40 shadow-xs z-30" 
                          style={{ backgroundColor: profileColorHex }}
                        />
                      </>
                    )}

                    {/* Left/Right manual loop cords or chain pulling indicators */}
                    {controlSide === 'RP' && (
                      <div className="absolute right-2 top-0 h-[70%] w-2 border border-slate-300/40 rounded-full flex flex-col justify-around py-1 bg-black/10 z-20">
                        <div className="w-0.8 h-0.8 bg-white rounded-full mx-auto shadow-2xs" />
                        <div className="w-0.8 h-0.8 bg-white rounded-full mx-auto shadow-2xs" />
                        <div className="w-0.8 h-0.8 bg-white rounded-full mx-auto shadow-2xs" />
                        {safetyElementBlinds && (
                          <div className="absolute bottom-0 w-2 h-2 rounded-full bg-red-500 border border-white left-[-1px] animate-bounce" />
                        )}
                      </div>
                    )}
                    {controlSide === 'RL' && (
                      <div className="absolute left-2 top-0 h-[70%] w-2 border border-slate-300/40 rounded-full flex flex-col justify-around py-1 bg-black/10 z-20">
                        <div className="w-0.8 h-0.8 bg-white rounded-full mx-auto shadow-2xs" />
                        <div className="w-0.8 h-0.8 bg-white rounded-full mx-auto shadow-2xs" />
                        <div className="w-0.8 h-0.8 bg-white rounded-full mx-auto shadow-2xs" />
                        {safetyElementBlinds && (
                          <div className="absolute bottom-0 w-2 h-2 rounded-full bg-red-500 border border-white left-[-1px] animate-bounce" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* BOTTOM PROFILE SLAT / WEIGHT BAR */}
              {!isAwn && (
                <div 
                  className="w-full transition-all duration-300 ease-out shrink-0 border-t border-black/40"
                  style={{ 
                    height: isExt ? '12px' : '7px', 
                    backgroundColor: bottomProfileHex,
                    borderRadius: '0 0 3px 3px'
                  }}
                />
              )}
            </div>
          )}

        </div>

        {/* CAD Dimension rulers & measurement lines with Apple layout accent font */}
        {/* Width measurement bar (Horizontal ruler underneath) */}
        <div 
          className="absolute -bottom-6 left-0 flex flex-col items-center justify-center transition-all duration-300"
          style={{ width: `${renderWidth}px` }}
        >
          {/* horizontal ruler line */}
          <div className="w-full h-[1px] bg-sky-400 relative flex justify-between">
            <div className="h-1.5 w-[1px] bg-sky-400 absolute left-0 -top-0.5" />
            <div className="h-1.5 w-[1px] bg-sky-400 absolute right-0 -top-0.5" />
          </div>
          <span className="font-mono text-[9px] font-extrabold text-sky-400 mt-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 leading-none shadow-sm z-10 transition-colors">
            {itemWidth} mm
          </span>
        </div>

        {/* Height measurement indicator (Vertical ruler to the right) */}
        <div 
          className="absolute top-0 -right-8 flex items-center justify-center transition-all duration-300"
          style={{ height: `${renderHeight}px` }}
        >
          {/* Vertical ruler line */}
          <div className="w-[1px] h-full bg-sky-400 relative flex flex-col justify-between items-center">
            <div className="w-1.5 h-[1px] bg-sky-400 absolute top-0 -left-0.5" />
            <div className="w-1.5 h-[1px] bg-sky-400 absolute bottom-0 -left-0.5" />
            {/* Vertical rotated text */}
            <span className="font-mono text-[9px] font-extrabold text-sky-400 bg-slate-950 py-0.5 px-1.5 rounded border border-slate-800 leading-none absolute whitespace-nowrap rotate-95 my-auto shadow-sm z-10 transition-colors">
              {itemHeight} mm
            </span>
          </div>
        </div>

      </div>

      {/* Dynamic Mini Legend labels with responsive elegant layout */}
      <div className="mt-3.5 flex flex-wrap gap-2 text-[10px] justify-center text-slate-400 font-mono text-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/45 w-full max-w-[95%]">
        {isScreen ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md border border-slate-700 inline-block shadow-2xs" style={{ backgroundColor: frameColorHex }} />
              <span className="text-slate-300 font-bold">Rám: {screenColor || 'Standard'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md border border-slate-700 inline-block shadow-2xs" style={{ backgroundColor: meshLook.color }} />
              <span className="text-slate-300 font-bold">Síť: {meshLook.name}</span>
            </div>
            {supportingProfile && (
              <span className="text-blue-400 font-black text-[9px] border border-blue-500/20 px-1 rounded">🛡️ Vynášecí lišta</span>
            )}
            {kickPlate && (
              <span className="text-amber-400 font-black text-[9px] border border-amber-500/20 px-1 rounded">🔒 Okop 10cm</span>
            )}
            {riveting && (
              <span className="text-slate-300 text-[9px] bg-slate-800 px-1 rounded border border-slate-750">Nýtování</span>
            )}
          </>
        ) : isRoll ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md border border-slate-700 inline-block shadow-2xs" style={{ backgroundColor: lamellaColorHex }} />
              <span className="text-slate-300 font-bold">Látka: {lamellaColor || 'Výběr'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md border border-slate-700 inline-block shadow-2xs" style={{ backgroundColor: coverFabric ? lamellaColorHex : '#E2E8F0' }} />
              <span className="text-slate-300 font-bold">Kazeta: {coverBarCollete}</span>
            </div>
            {controlMethod && (
              <div className="flex items-center gap-0.5 text-emerald-400 font-bold text-[9px]">
                ⚡ {controlMethod.replace('M1 - ', '').replace('M2 - ', '')}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md inline-block border border-slate-700 shadow-2xs" style={{ background: isWood ? getWoodGradient(lamellaColor) : lamellaColorHex }} />
              <span className="text-slate-300 font-bold">Lamela: {lamellaColor || 'Standard'}</span>
            </div>
            {(locoColor || topProfileColor) && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md inline-block border border-slate-700 shadow-2xs" style={{ backgroundColor: resolveColorHex(locoColor || topProfileColor, '#FFF') }} />
                <span className="text-slate-300 font-bold">Lišta: {locoColor || topProfileColor}</span>
              </div>
            )}
            {item.hasGearbox && (
              <span className="text-sky-450 font-semibold text-[9px] bg-sky-950/40 border border-sky-800/30 px-1 rounded">Prevodka ⚙️</span>
            )}
          </>
        )}
      </div>

    </div>
  );
}
