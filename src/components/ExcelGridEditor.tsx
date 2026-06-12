import React from 'react';
import { Copy, Trash2, AlertCircle, Plus, Upload, Edit3 } from 'lucide-react';
import { BlindOrderItem, ProductCategory, ProductType } from '../types';

function getBoxTypeOptions(category: ProductCategory): string[] {
  switch (category) {
    case 'HORIZONTAL':
      return ['Standardní krycí plech', 'Loco zaoblená lišta', 'Prim elegantní profil', 'Eco profil bez krytu', 'HZ 25 standard profil', 'HZ 27 silný profil'];
    case 'WOODEN':
      return ['Krycí dřevěná lišta standard', 'Otevřený Al nosný profil', 'Garnýž retro ocel'];
    case 'PLISSE':
      return ['PM1 (Jednosměrné ovl. madlem)', 'PM2 (Obousměrné s madly)', 'PM3M (Dvě látky - den/noc)', 'AO43 (Střešní s vodicími lištami)'];
    case 'VERTICAL':
      return ['Profil standard Al bílý', 'Profil elegant stříbrný zaoblený', 'Profil stropní montáž zapuštěný'];
    case 'ROLETKY':
      return ['Sonata standard kazeta', 'Sonata XL kazetový box', 'Stream-S kazeta Velux', 'Legend střešní kazeta s pružinou', 'Jazz 17 otevřená hřídel bezbox', 'Optima s Al krytem', 'Collete s bočními lištami'];
    case 'SCREENS':
      return ['Profil OE 19x8 (standard okno)', 'Profil OE 32x11 LUX (extrudovaný)', 'Profil OE 34x9 LUX (s těsnicím kartáčem)', 'Profil DV 50x20 dveřní s panty', 'Profil DE 50x20 samozavírací s magnetem', 'PSR1 posuvný rám jednokřídlý', 'Stellar Lux plisovaná opona'];
    case 'EXTERNAL':
      return ['Z90 krycí box hranatý', 'S90 krycí box zaoblený', 'C80 krycí plech oboustranný', 'F80 fasádní nosič', 'Purenit podomítková schránka', 'Heluz nosný překlad'];
    case 'AWNING':
      return ['Casablanca celokazetová', 'Dakota polokazetová', 'Italia okenní s výklopnými rameny', 'Bez kazety standard'];
    default:
      return ['Standardní provedení'];
  }
}

function getBoxColorOptions(): string[] {
  return [
    'RAL 9010 - Bílá',
    'RAL 7016 - Antracit',
    'RAL 8017 - Hnědá',
    'RAL 9006 - Stříbrná',
    'RAL 8003 - Zlatý dub Renolit',
    'Imitace dřeva - Borovice',
    'Imitace dřeva - Buk',
    'Imitace dřeva - Ořech',
    'Lakování dle vzorníku RAL',
    'Surový Al / Eloxovaný hliník'
  ];
}

function getGuideTypeOptions(category: ProductCategory): string[] {
  switch (category) {
    case 'HORIZONTAL':
    case 'WOODEN':
      return ['Silonová fixace (Struna boční)', 'Bez fixace', 'Ocelové lanko Ø 1.5mm'];
    case 'PLISSE':
      return ['Vodicí šňůry napnuté', 'Boční vodicí lišty L ploché', 'Boční vodicí lišty U komorové'];
    case 'VERTICAL':
    case 'ROLETKY':
      return ['Bez vedení volně visící', 'Boční vodicí lišty Al', 'Vodicí struna silonová s napínákem'];
    case 'EXTERNAL':
      return ['J vodicí lišta standard', 'JU vodicí lišta zapuštěná', 'Ocelové lanko Ø 3.2mm', 'Samonosná vodicí lišta'];
    case 'SCREENS':
      return ['Bez vedení (otočné držáky)', 'Dvojitá lišta (H tvar)', 'U lišta boční s kartáčkem', 'Vodící magnetická lišta pro plisované'];
    case 'AWNING':
      return ['Kloubová ramena hliníková', 'Výklopná boční ramena ocel', 'Lanko boční nerezové fixace'];
    default:
      return ['Bez vedení'];
  }
}

function getMountingTypeOptions(category: ProductCategory): string[] {
  switch (category) {
    case 'HORIZONTAL':
    case 'WOODEN':
      return ['Do zasklívací lišty (Okenní křídlo)', 'Na rám okna (Vrtáním)', 'Na rám okna (Svěrné držáky bez vrtání)', 'Čelní stěnové úhelníky'];
    case 'PLISSE':
      return ['Do zasklívací lišty (Standard klipy)', 'Na rám okna (Pružný klip s lepením)', 'Na stěnu / Strop šroubováním'];
    case 'ROLETKY':
      return ['Na rám okna (Plastový bezvrtný úchyt vč. fixace)', 'Na stěnu nad okenní výřez', 'Do stropu / ostění'];
    case 'EXTERNAL':
      return ['Do ostění (Do boků stavby)', 'Na rám okna (Čelní kotevní patky)', 'Do zateplení (Podomítkové pouzdro)', 'Pomocný jekl ocelový nosný'];
    case 'SCREENS':
      return ['Otočné Z-držáky (Bez vrtání, různé výšky)', 'Pružinové kolíky po obvodu (Do ostění)', 'Obrtlíky (Nylonové otočné do rámu okna)', 'Do ostění šrouby skrz profil'];
    case 'AWNING':
      return ['Do stěny (Zateplená fasáda s chemickou kotvou)', 'Do stropu / na balkónovou konstrukci', 'Na krokev střechy krovů'];
    default:
      return ['Na rám okna'];
  }
}

function getMotorOptions(): string[] {
  return [
    'Manuální (Klika / Nekonečný řetízek / Pružina / Madlo)',
    'Somfy IO dálkový (Bezdrátový přijímač)',
    'Somfy WT standard (Drátový pohon na vypínač)',
    'Elero dálkový s ochrannými senzory',
    'Becker tichý motor s nastavením dorazů',
    'Apex Eco solární bateriový pohon'
  ];
}

function isFieldAllowed(category: ProductCategory, field: string): boolean {
  if (field === 'isCelostin') {
    return category === 'HORIZONTAL' || category === 'PLISSE';
  }
  if (field === 'isSlant') {
    return category === 'HORIZONTAL' || category === 'VERTICAL' || category === 'PLISSE' || category === 'EXTERNAL' || category === 'SCREENS';
  }
  if (field === 'topProfileColor') {
    return category !== 'AWNING';
  }
  return true;
}

function getLamellaSizePlaceholder(category: ProductCategory): string {
  switch (category) {
    case 'HORIZONTAL': return 'Zadejte rozměr (např. 25x0.18)';
    case 'WOODEN': return 'Velikost lamel (např. 50 mm)';
    case 'PLISSE': return 'Záhyb látky (např. 20 mm)';
    case 'VERTICAL': return 'Šířka pásu (např. 127 mm)';
    case 'ROLETKY': return 'Kategorie látky (např. Standard)';
    case 'SCREENS': return 'Typ sítě (např. Šedá síťovina)';
    case 'EXTERNAL': return 'Rozměr lamely (např. Z90)';
    case 'AWNING': return 'Kvalita tkaniny (např. Akrylová)';
    case 'JAPANESE': return 'Šířka panelů (např. 600 mm)';
    default: return 'Vyberte rozměr';
  }
}

function getLamellaColorPlaceholder(category: ProductCategory): string {
  switch (category) {
    case 'HORIZONTAL':
    case 'WOODEN':
    case 'EXTERNAL':
      return 'Barva lamely (RAL / decor)';
    case 'SCREENS':
      return 'Barva sítě (Šedá / Černá)';
    case 'ROLETKY':
    case 'PLISSE':
    case 'VERTICAL':
    case 'JAPANESE':
    case 'AWNING':
      return 'Barva a kód tkaniny';
    default:
      return 'Zadejte barvu';
  }
}

function getLamellaColorOptions(category: ProductCategory): string[] {
  switch (category) {
    case 'HORIZONTAL':
      return [
        '9010 - Bílá',
        '8017 - Tmavě hnědá',
        '9006 - Stříbrná',
        '7016 - Antracit',
        '1013 - Slonová kost',
        '8004 - Měděná / Hnědá',
        'W91 - Imitace dřeva - Borovice',
        'W92 - Imitace dřeva - Buk',
        'W93 - Imitace dřeva - Dub',
        'W95 - Imitace dřeva - Zlatý dub',
        'W96 - Imitace dřeva - Ořech',
        'W98 - Imitace dřeva - Mahagon'
      ];
    case 'WOODEN':
      return [
        'W01 - Přírodní borovice',
        'W02 - Bělená bříza',
        'W03 - Světlá třešeň',
        'W04 - Tmavý ořech',
        'W05 - Wenge černá'
      ];
    case 'PLISSE':
      return [
        'PL-101 Sněhobílá (Standard)',
        'PL-102 Krémová lesklá (Pearl)',
        'PL-115 Šedá perleť',
        'PL-204 Elegantní tm. hnědá',
        'PL-305 Temně černá (Zatemňující)'
      ];
    case 'VERTICAL':
      return [
        'VE-01 Bílá hladká 127mm',
        'VE-02 Béžová krémová 127mm',
        'VE-03 Světle šedá průsvitná',
        'VE-04 Modrá pastelová bavlněná'
      ];
    case 'ROLETKY':
      return [
        'RL-01 Křídová bílá (Standard)',
        'RL-02 Písková melír',
        'RL-03 Antracitová blackout (Zatemňující)',
        'RL-04 Čokoládově hnědá s texturou'
      ];
    case 'SCREENS':
      return [
        'Šedá standard (skelné vlákno/PVC)',
        'Černá anti-alergenní a antiprašná',
        'Materiál Pet-Screen (zvýšená pevnost)',
        'Bronzová metalická (Alu síťovina)'
      ];
    case 'EXTERNAL':
      return [
        'RAL 9010 - Bílá',
        'RAL 9006 - Stříbrná metalická',
        'RAL 9007 - Šedostříbrná',
        'RAL 7016 - Antracitová struktura',
        'RAL 8014 - Sépiová hnědá',
        'DB 703 - Tmavě šedá se třpytem'
      ];
    case 'AWNING':
      return [
        'AWN-10 Béžový melír (Acrylic)',
        'AWN-12 Šedá s jemným proužkem',
        'AWN-18 Námořnická modrá',
        'AWN-25 Tmavě šedá antracit (Standard)'
      ];
    case 'JAPANESE':
      return [
        'JP-01 Rýžový papír imitace',
        'JP-02 Přírodní len krémový',
        'JP-03 Antracitová tkanina jemná'
      ];
    default:
      return ['9010 - Bílá', '8017 - Hnědá', '7016 - Antracit'];
  }
}

function getTopProfileColorPlaceholder(category: ProductCategory): string {
  if (category === 'AWNING') return '—';
  if (category === 'SCREENS') return 'Barva Al profilu (RAL)';
  return 'Barva horní lišty / profilu';
}

function getBoxTypePlaceholder(category: ProductCategory): string {
  switch (category) {
    case 'HORIZONTAL': return 'Krycí plech / nosník';
    case 'WOODEN': return 'Krycí lišta standard';
    case 'PLISSE': return 'Model plisé (např. PM2)';
    case 'VERTICAL': return 'Typ profilu garnýže';
    case 'ROLETKY': return 'Typ kazetky (např. Sonata)';
    case 'SCREENS': return 'Profil sítě (např. OE 19x8)';
    case 'EXTERNAL': return 'Vnější box (např. Z90 box)';
    case 'AWNING': return 'Konstrukce (např. Casablanca)';
    case 'JAPANESE': return 'Profil VL drážkový';
    default: return 'Zadejte typ boxu';
  }
}

function getBoxColorPlaceholder(category: ProductCategory): string {
  switch (category) {
    case 'HORIZONTAL':
    case 'WOODEN':
      return 'Barva nosiče / RAL';
    case 'PLISSE':
      return 'Barva profilu plisé';
    case 'VERTICAL':
      return 'Barva vodicího profilu';
    case 'ROLETKY':
      return 'Barva kazetky a lišt';
    case 'SCREENS':
      return 'Barva Al rámu sítě';
    case 'EXTERNAL':
      return 'Barva krycího boxu';
    case 'AWNING':
      return 'Barva konstrukce';
    case 'JAPANESE':
      return 'Barva VL profilu';
    default:
      return 'Barva Al / RAL';
  }
}

interface ExcelGridEditorProps {
  items: BlindOrderItem[];
  setItems: React.Dispatch<React.SetStateAction<BlindOrderItem[]>>;
  viewMode: 'cards' | 'grid';
  setViewMode: (mode: 'cards' | 'grid') => void;
  onExport: () => void;
  onAddRow: () => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onEdit?: (index: number) => void;
  validateItem: (item: BlindOrderItem) => any[];
  getProductTypeLabel: (type: string) => string;
  categoriesList: { value: string; label: string; icon: string }[];
  productTypesByCategory: Record<string, string[]>;
  controlOptionsByCategory: Record<string, { value: string; label: string }[]>;
  lamellaOptionsByCategory: Record<string, string[]>;
  offlineTemplates: { file: string; label: string }[];
  importedFileInfo: string;
  setImportedFileInfo: (info: string) => void;
}

export default function ExcelGridEditor({
  items,
  setItems,
  viewMode,
  setViewMode,
  onExport,
  onAddRow,
  onDuplicate,
  onDelete,
  onEdit,
  validateItem,
  getProductTypeLabel,
  categoriesList,
  productTypesByCategory,
  controlOptionsByCategory,
  lamellaOptionsByCategory,
  offlineTemplates,
  importedFileInfo,
  setImportedFileInfo,
}: ExcelGridEditorProps) {

  const handleCellChange = (index: number, field: keyof BlindOrderItem, value: any) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleCategoryChange = (index: number, newCat: ProductCategory) => {
    const list = productTypesByCategory[newCat] || productTypesByCategory.HORIZONTAL;
    const defaultProduct = list[0] as ProductType;
    setItems(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        category: newCat,
        productType: defaultProduct,
        lamellaSize: newCat === 'HORIZONTAL' 
          ? '25x0.18' 
          : newCat === 'WOODEN' 
            ? 'WOOD_25' 
            : newCat === 'PLISSE' 
              ? 'Plisé látka 20 mm' 
              : newCat === 'JAPANESE'
                ? 'Panel standard'
                : 'Standard',
        controlSide: newCat === 'PLISSE' ? 'madlo' : newCat === 'JAPANESE' ? 'rucni' : '1'
      };
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {importedFileInfo && (
        <div className="bg-[#F2F2F7] rounded-2xl border-0 p-3 text-[13px] text-black font-medium flex items-center justify-between gap-3 px-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#34C759] animate-pulse shrink-0 shadow-[0_0_8px_#34C759]" />
            <span className="opacity-80 text-[#8E8E93]">Importováno ze souboru:</span>
            <span className="bg-white px-2.5 py-1 rounded-md font-mono text-black font-semibold truncate max-w-[220px] shadow-sm">{importedFileInfo}</span>
          </div>
          <button
            type="button"
            onClick={() => setImportedFileInfo('')}
            className="text-[13px] text-[#007AFF] hover:opacity-80 font-semibold cursor-pointer tracking-tight bg-white px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-transform"
          >
            Skrýt
          </button>
        </div>
      )}

      {/* Main Grid Card */}
      <div className="bg-white rounded-[24px] border border-[#E5E5EA] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Spreadsheet Actions Top Controls */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-[#E5E5EA] p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#34C759] shadow-[0_0_8px_#34C759]" />
            <span className="text-[17px] font-semibold text-black tracking-tight">Položky objednávky</span>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onExport}
              className="px-4 py-2 bg-white flex items-center gap-1.5 rounded-xl border border-[#E5E5EA] text-[#007AFF] font-medium text-[14px] hover:bg-[#F2F2F7] transition-colors active:scale-95 shadow-sm"
            >
              <Upload className="w-4 h-4 rotate-180" />
              <span>Stáhnout QAPI formát</span>
            </button>
            <button
              type="button"
              onClick={onAddRow}
              className="px-4 py-2 bg-[#007AFF] text-white flex items-center gap-1.5 rounded-xl font-medium text-[14px] hover:bg-[#006ee6] transition-colors active:scale-95 shadow-[0_2px_8px_rgba(0,122,255,0.3)]"
            >
              <Plus className="w-4 h-4" />
              <span>Přidat řádek</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table View */}
        <div className="overflow-x-auto select-none overflow-y-visible" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-[#F2F2F7] text-[12px] font-semibold text-[#1C1C1E] select-none">
                <th className="py-2.5 px-3 text-center min-w-[50px] max-w-[50px] sticky left-0 z-20 bg-[#F2F2F7] border border-[#D1D1D6]">P.</th>
                <th className="py-2.5 px-3 min-w-[190px] sticky left-[50px] z-20 bg-[#F2F2F7] border border-[#D1D1D6]">Místnost (Pozice)</th>
                <th className="py-2.5 px-3 min-w-[195px] border border-[#D1D1D6]">Kategorie stínění</th>
                <th className="py-2.5 px-3 min-w-[240px] border border-[#D1D1D6]">Produktový typ stínění</th>
                <th className="py-2.5 px-3 min-w-[105px] text-center border border-[#D1D1D6]">Šířka (mm)</th>
                <th className="py-2.5 px-3 min-w-[105px] text-center border border-[#D1D1D6]">Výška (mm)</th>
                <th className="py-2.5 px-3 min-w-[70px] text-center border border-[#D1D1D6]">Ks</th>
                <th className="py-2.5 px-3 min-w-[190px] border border-[#D1D1D6]">Rozměr/Lamela</th>
                <th className="py-2.5 px-3 min-w-[170px] border border-[#D1D1D6]">Barva lamely/látky</th>
                <th className="py-2.5 px-3 min-w-[160px] border border-[#D1D1D6]">Krycí lišta/profil</th>
                <th className="py-2.5 px-3 min-w-[190px] border border-[#D1D1D6]">Typ Boxu / Látky</th>
                <th className="py-2.5 px-3 min-w-[180px] border border-[#D1D1D6]">Barva Boxu / AL</th>
                <th className="py-2.5 px-3 min-w-[180px] border border-[#D1D1D6]">Způsob Vedení</th>
                <th className="py-2.5 px-3 min-w-[200px] border border-[#D1D1D6]">Kotvení / Uchycení</th>
                <th className="py-2.5 px-3 min-w-[180px] border border-[#D1D1D6]">Pohon / Motor</th>
                <th className="py-2.5 px-3 min-w-[210px] border border-[#D1D1D6]">Ovládání stínění</th>
                <th className="py-2.5 px-3 text-center min-w-[60px] border border-[#D1D1D6]" title="Atypický tvar (šikmina)">At.</th>
                <th className="py-2.5 px-3 text-center min-w-[60px] border border-[#D1D1D6]" title="Celostínící">Cel.</th>
                <th className="py-2.5 px-3 min-w-[240px] border border-[#D1D1D6]">Zákaznická poznámka</th>
                <th className="py-2.5 px-3 text-center min-w-[120px] border border-[#D1D1D6]">Akce</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={20} className="py-20 border border-[#E5E5EA] text-center text-[14px] text-[#8E8E93] bg-[#F9F9FB]/50 transition-colors">
                    <div className="max-w-sm mx-auto space-y-4">
                      <div className="mx-auto w-16 h-16 bg-[#F2F2F7] rounded-full flex items-center justify-center border border-[#E5E5EA]">
                        <Plus className="w-8 h-8 text-[#007AFF] opacity-80" />
                      </div>
                      <div>
                        <p className="font-semibold text-black text-[16px]">Žádné položky</p>
                        <p className="text-[#8E8E93] mt-1.5 leading-relaxed text-[13px]">
                          Klikněte na „Přidat řádek“ pro zahájení objednávky.<br/>Tip: Klávesou <kbd className="border border-[#D1D1D6] rounded px-1.5 py-0.5 text-[11px] font-sans font-medium text-[#1C1C1E] bg-white shadow-sm mx-1">Enter</kbd>v posledním sloupci rychle přidáte další.
                        </p>
                      </div>
                      <button onClick={onAddRow} className="mt-2 text-[#007AFF] font-medium hover:opacity-70 active:opacity-50 transition-opacity">
                        Začít zadávat →
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const alerts = validateItem(item);
                  const hasError = alerts.some(al => al.type === 'error');
                  const hasWarning = alerts.some(al => al.type === 'warning');

                  // Parse comment & position
                  const parts = (item.notes || '').split(' | ');
                  const currentPos = parts[0]?.startsWith('Pozice: ') ? parts[0].replace('Pozice: ', '') : '';
                  const currentNotes = parts[0]?.startsWith('Pozice: ') ? parts.slice(1).join(' | ') : (item.notes || '');

                  const wAlert = alerts.find(a => a.field === 'width');
                  const hAlert = alerts.find(a => a.field === 'height');

                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-[#E5E5EA] last:border-0 hover:bg-[#F4F4F6]/40 transition-colors duration-100 text-[13px] ${
                        hasError ? 'bg-[#FF3B30]/5 hover:bg-[#FF3B30]/10' : hasWarning ? 'bg-[#FF9500]/5 hover:bg-[#FF9500]/10' : 'bg-white'
                      }`}
                    >
                      {/* Number Index (Sticky Column) */}
                      <td className={`p-0 text-center font-semibold select-none sticky left-0 z-10 border border-[#E5E5EA] shadow-[1px_0_0_0_#E5E5EA] min-w-[50px] max-w-[50px] h-[40px] ${
                        hasError ? 'bg-[#FFF2F2] text-[#FF3B30]' : hasWarning ? 'bg-[#FFF9F2] text-[#FF9500]' : 'bg-[#F2F2F7] text-[#8E8E93]'
                      }`}>
                        <div className="flex items-center justify-center w-full h-full text-[12px]">
                          {hasError ? (
                            <span className="cursor-help text-[14px]" title={alerts.map(a => a.message).join('\n')}>🛑</span>
                          ) : hasWarning ? (
                            <span className="cursor-help text-[14px]" title={alerts.map(a => a.message).join('\n')}>⚠️</span>
                          ) : (
                            idx + 1
                          )}
                        </div>
                      </td>

                      {/* Position room input */}
                      <td className="p-0 sticky left-[50px] z-10 bg-white border border-[#E5E5EA] shadow-[1px_0_0_0_#E5E5EA] min-w-[190px]">
                        <input
                          type="text"
                          placeholder="Kuchyň ok. 1"
                          value={currentPos}
                          onChange={(e) => {
                            const nextPos = e.target.value;
                            const nextNotes = currentNotes ? `Pozice: ${nextPos} | ${currentNotes}` : `Pozice: ${nextPos}`;
                            handleCellChange(idx, 'notes', nextNotes);
                          }}
                          className="w-full h-[38px] px-3 bg-transparent hover:bg-[#F2F2F7]/50 focus:bg-[#FFF] text-[13px] font-medium text-black focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none transition-all"
                        />
                      </td>

                      {/* Category select */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <div className="relative w-full h-full flex items-center bg-white">
                          <select
                            value={item.category}
                            onChange={(e) => handleCategoryChange(idx, e.target.value as ProductCategory)}
                            className="w-full h-[38px] pl-3 pr-7 bg-transparent hover:bg-[#F2F2F7]/50 text-[13px] text-black font-medium focus:bg-[#FFF] focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none appearance-none cursor-pointer transition-all"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.9em' }}
                          >
                            {categoriesList.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Product selection dropdown */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <div className="relative w-full h-full flex items-center bg-white">
                          <select
                            value={item.productType}
                            onChange={(e) => handleCellChange(idx, 'productType', e.target.value as ProductType)}
                            className="w-full h-[38px] pl-3 pr-7 bg-transparent hover:bg-[#F2F2F7]/50 text-[13px] text-black font-semibold focus:bg-[#FFF] focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none appearance-none cursor-pointer truncate transition-all"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.9em' }}
                          >
                            {(productTypesByCategory[item.category] || []).map(pType => (
                              <option key={pType} value={pType}>{getProductTypeLabel(pType)}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Width */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <input
                          type="number"
                          value={item.width || ''}
                          placeholder="mm"
                          onChange={(e) => handleCellChange(idx, 'width', Number(e.target.value) || 0)}
                          className={`w-full h-[38px] px-3 bg-transparent text-center hover:bg-[#F2F2F7]/50 focus:bg-[#FFF] text-[13px] font-semibold font-mono focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none transition-all ${
                            wAlert ? 'text-[#FF3B30] bg-[#FF3B30]/5 font-bold' : 'text-black'
                          }`}
                          title={wAlert?.message}
                        />
                      </td>

                      {/* Height */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <input
                          type="number"
                          value={item.height || ''}
                          placeholder="mm"
                          onChange={(e) => handleCellChange(idx, 'height', Number(e.target.value) || 0)}
                          className={`w-full h-[38px] px-3 bg-transparent text-center hover:bg-[#F2F2F7]/50 focus:bg-[#FFF] text-[13px] font-semibold font-mono focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none transition-all ${
                            hAlert ? 'text-[#FF3B30] bg-[#FF3B30]/5 font-bold' : 'text-black'
                          }`}
                          title={hAlert?.message}
                        />
                      </td>

                      {/* Quantity */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => handleCellChange(idx, 'quantity', Number(e.target.value) || 1)}
                          className="w-full h-[38px] px-3 bg-transparent text-center hover:bg-[#F2F2F7]/50 focus:bg-[#FFF] text-[13px] font-semibold text-black focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none transition-all"
                        />
                      </td>

                      {/* Lamella Optima selection */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <div className="relative w-full h-full flex items-center bg-white">
                          <select
                            value={item.lamellaSize}
                            onChange={(e) => handleCellChange(idx, 'lamellaSize', e.target.value)}
                            className="w-full h-[38px] pl-3 pr-7 bg-transparent hover:bg-[#F2F2F7]/50 text-[13px] text-black font-medium focus:bg-[#FFF] focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none appearance-none cursor-pointer transition-all"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.9em' }}
                          >
                            {(lamellaOptionsByCategory[item.category] || ['Standard']).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Lamella/Fabric Color */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <input
                          type="text"
                          list={`lamella-color-list-${idx}`}
                          placeholder={getLamellaColorPlaceholder(item.category)}
                          value={item.lamellaColor}
                          onChange={(e) => handleCellChange(idx, 'lamellaColor', e.target.value)}
                          className="w-full h-[38px] px-3 bg-transparent hover:bg-[#F2F2F7]/50 focus:bg-[#FFF] text-[13px] font-medium text-black focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none transition-all"
                        />
                        <datalist id={`lamella-color-list-${idx}`}>
                          {getLamellaColorOptions(item.category).map(opt => (
                            <option key={opt} value={opt} />
                          ))}
                        </datalist>
                      </td>

                      {/* Top Profile color text */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <input
                          type="text"
                          disabled={!isFieldAllowed(item.category, 'topProfileColor')}
                          placeholder={getTopProfileColorPlaceholder(item.category)}
                          value={isFieldAllowed(item.category, 'topProfileColor') ? item.topProfileColor : '—'}
                          onChange={(e) => {
                            if (isFieldAllowed(item.category, 'topProfileColor')) {
                              handleCellChange(idx, 'topProfileColor', e.target.value);
                              handleCellChange(idx, 'bottomProfileColor', e.target.value);
                            }
                          }}
                          className={`w-full h-[38px] px-3 bg-transparent text-[13px] font-medium transition-all outline-none border-0 ${
                            !isFieldAllowed(item.category, 'topProfileColor') 
                              ? 'bg-[#F2F2F7]/60 text-[#8E8E93]/85 cursor-not-allowed select-none text-center font-bold' 
                              : 'hover:bg-[#F2F2F7]/50 focus:bg-[#FFF] text-black focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset'
                          }`}
                        />
                      </td>

                      {/* Typ Boxu / Látky */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <input
                          type="text"
                          list={`box-type-list-${idx}`}
                          placeholder={getBoxTypePlaceholder(item.category)}
                          value={item.boxType || item.fabricType || item.screenType || item.plisseModel || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (item.category === 'SCREENS') handleCellChange(idx, 'screenType', val);
                            else if (item.category === 'PLISSE') handleCellChange(idx, 'plisseModel', val);
                            else handleCellChange(idx, 'boxType', val);
                          }}
                          className="w-full h-[38px] px-3 bg-transparent hover:bg-[#F2F2F7]/50 focus:bg-[#FFF] text-[13px] font-medium text-black focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none transition-all"
                        />
                        <datalist id={`box-type-list-${idx}`}>
                          {getBoxTypeOptions(item.category).map(opt => (
                            <option key={opt} value={opt} />
                          ))}
                        </datalist>
                      </td>

                      {/* Barva Boxu / AL */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <input
                          type="text"
                          list={`box-color-list-${idx}`}
                          placeholder={getBoxColorPlaceholder(item.category)}
                          value={item.boxColor || item.bracketColor || item.meshColor || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (item.category === 'SCREENS') handleCellChange(idx, 'meshColor', val);
                            else if (item.category === 'ROLETKY') handleCellChange(idx, 'bracketColor', val);
                            else handleCellChange(idx, 'boxColor', val);
                          }}
                          className="w-full h-[38px] px-3 bg-transparent hover:bg-[#F2F2F7]/50 focus:bg-[#FFF] text-[13px] font-medium text-black focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none transition-all"
                        />
                        <datalist id={`box-color-list-${idx}`}>
                          {getBoxColorOptions().map(opt => (
                            <option key={opt} value={opt} />
                          ))}
                        </datalist>
                      </td>

                      {/* Způsob Vedení */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <input
                          type="text"
                          list={`guide-type-list-${idx}`}
                          placeholder="Vyberte boční vedení"
                          value={item.guideType || item.guideRailsWidth || ''}
                          onChange={(e) => {
                            handleCellChange(idx, 'guideType', e.target.value);
                          }}
                          className="w-full h-[38px] px-3 bg-transparent hover:bg-[#F2F2F7]/50 focus:bg-[#FFF] text-[13px] font-medium text-black focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none transition-all"
                        />
                        <datalist id={`guide-type-list-${idx}`}>
                          {getGuideTypeOptions(item.category).map(opt => (
                            <option key={opt} value={opt} />
                          ))}
                        </datalist>
                      </td>

                      {/* Kotvení / Uchycení */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <input
                          type="text"
                          list={`mounting-type-list-${idx}`}
                          placeholder="Vyberte způsob kotvení"
                          value={item.mountingTypeCustom || item.mountingType || item.mountingOpus || ''}
                          onChange={(e) => {
                            handleCellChange(idx, 'mountingTypeCustom', e.target.value);
                          }}
                          className="w-full h-[38px] px-3 bg-transparent hover:bg-[#F2F2F7]/50 focus:bg-[#FFF] text-[13px] font-medium text-black focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none transition-all"
                        />
                        <datalist id={`mounting-type-list-${idx}`}>
                          {getMountingTypeOptions(item.category).map(opt => (
                            <option key={opt} value={opt} />
                          ))}
                        </datalist>
                      </td>

                      {/* Pohon / Motor */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <input
                          type="text"
                          list={`motor-options-list-${idx}`}
                          placeholder="Vyberte motor / pohon"
                          value={item.electronicsReceiver || item.motorBrand || item.electronicsApp || ''}
                          onChange={(e) => {
                            handleCellChange(idx, 'electronicsReceiver', e.target.value);
                          }}
                          className="w-full h-[38px] px-3 bg-transparent hover:bg-[#F2F2F7]/50 focus:bg-[#FFF] text-[13px] font-medium text-black focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none transition-all"
                        />
                        <datalist id={`motor-options-list-${idx}`}>
                          {getMotorOptions().map(opt => (
                            <option key={opt} value={opt} />
                          ))}
                        </datalist>
                      </td>

                      {/* ControlSide select */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <div className="relative w-full h-full flex items-center bg-white">
                          <select
                            value={item.controlSide}
                            onChange={(e) => handleCellChange(idx, 'controlSide', e.target.value)}
                            className="w-full h-[38px] pl-3 pr-7 bg-transparent hover:bg-[#F2F2F7]/50 text-[13px] text-black font-medium focus:bg-[#FFF] focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none appearance-none cursor-pointer transition-all"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.9em' }}
                          >
                            {(controlOptionsByCategory[item.category] || []).map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Atypical Checkbox */}
                      <td className="p-0 border border-[#E5E5EA] text-center bg-white font-semibold">
                        <div className={`flex justify-center items-center h-[38px] w-full transition-colors ${!isFieldAllowed(item.category, 'isSlant') ? 'bg-[#F2F2F7]/50' : ''}`}>
                          <input
                            type="checkbox"
                            disabled={!isFieldAllowed(item.category, 'isSlant')}
                            checked={isFieldAllowed(item.category, 'isSlant') ? item.isSlant : false}
                            onChange={(e) => handleCellChange(idx, 'isSlant', e.target.checked)}
                            className="w-5 h-5 rounded-md border-[#C6C6C8] text-[#007AFF] focus:ring-[#007AFF] focus:ring-offset-0 cursor-pointer transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                          />
                        </div>
                      </td>

                      {/* Celostín Checkbox */}
                      <td className="p-0 border border-[#E5E5EA] text-center bg-white font-semibold">
                        <div className={`flex justify-center items-center h-[38px] w-full transition-colors ${!isFieldAllowed(item.category, 'isCelostin') ? 'bg-[#F2F2F7]/40' : ''}`}>
                          <input
                            type="checkbox"
                            disabled={!isFieldAllowed(item.category, 'isCelostin')}
                            checked={isFieldAllowed(item.category, 'isCelostin') ? item.isCelostin : false}
                            onChange={(e) => handleCellChange(idx, 'isCelostin', e.target.checked)}
                            className="w-5 h-5 rounded-md border-[#C6C6C8] text-[#007AFF] focus:ring-[#007AFF] focus:ring-offset-0 cursor-pointer transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                          />
                        </div>
                      </td>

                      {/* Custom note */}
                      <td className="p-0 border border-[#E5E5EA]">
                        <input
                          type="text"
                          placeholder="Zapsat poznámku k položce..."
                          value={currentNotes}
                          onChange={(e) => {
                            const nextNotes = currentPos ? `Pozice: ${currentPos} | ${e.target.value}` : e.target.value;
                            handleCellChange(idx, 'notes', nextNotes);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              onAddRow();
                            }
                          }}
                          className="w-full h-[38px] px-3 bg-transparent hover:bg-[#F2F2F7]/50 focus:bg-[#FFF] text-[13px] font-medium text-black focus:ring-1.5 focus:ring-[#007AFF] focus:ring-inset border-0 outline-none transition-all"
                        />
                      </td>

                      {/* Row operational buttons */}
                      <td className="p-0 text-center border border-[#E5E5EA] bg-[#F2F2F7]/35">
                        <div className="flex gap-1 justify-center items-center h-[38px]">
                          {onEdit && (
                            <button
                              type="button"
                              onClick={() => onEdit(idx)}
                              className="p-1.5 bg-transparent hover:bg-[#FF9500]/10 text-[#FF9500] rounded-lg transition-colors active:scale-90"
                              title="Upravit pokročilé detaily v průvodci"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDuplicate(idx)}
                            className="p-1.5 bg-transparent hover:bg-[#007AFF]/10 text-[#007AFF] rounded-lg transition-colors active:scale-90"
                            title="Duplikovat řádek"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(idx)}
                            className="p-1.5 bg-transparent hover:bg-[#FF3B30]/10 text-[#FF3B30] rounded-lg transition-colors active:scale-90"
                            title="Odstranit řádek"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Alert Bulletins below Spreadsheet if any exist */}
      {items.length > 0 && items.some(it => validateItem(it).length > 0) && (
        <div className="bg-[#FFF0F0] border-0 rounded-2xl p-4 md:p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[#FF3B30] font-semibold text-[13px] tracking-tight">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Chybí některé údaje nebo jsou mimo výrobní limity</span>
          </div>
          <div className="text-[13px] text-[#FF3B30]/90 space-y-1.5 pl-7 list-disc">
            {items.map((item, idx) => {
              const rowAlerts = validateItem(item);
              if (rowAlerts.length === 0) return null;
              const posParts = (item.notes || '').split(' | ');
              const posName = posParts[0]?.startsWith('Pozice: ') ? posParts[0].replace('Pozice: ', '') : `Řádek ${idx + 1}`;
              return (
                <div key={item.id} className="flex gap-2 flex-col sm:flex-row leading-tight">
                  <span className="font-semibold underline shrink-0 truncate sm:w-32">Pozice „{posName || idx+1}“:</span>
                  <span className="font-medium">{rowAlerts.map(a => a.message).join(' • ')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
