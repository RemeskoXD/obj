import React, { useState } from 'react';
import { Layers, HelpCircle, AlertTriangle, ShieldCheck, Sun, Info, Search, HelpCircle as HintIcon } from 'lucide-react';

type SpecCategory = 'ALL' | 'HORIZONTAL' | 'EXTERNAL' | 'AWNING';

export default function BlindSpecsInfo() {
  const [activeCategory, setActiveCategory] = useState<SpecCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const specs = [
    // 1. HORIZONTAL
    {
      id: 'hz',
      category: 'HORIZONTAL' as const,
      name: 'HZ 25x19 / HZ 27x19',
      sub: 'Klasická meziskelní žaluzie',
      desc: 'Tradiční meziskelní montáž s čelním nebo bočním ovládacím vývodem (tyčka, šňůra či ohebný bowden).',
      limits: 'Šířka: od 150 mm do 2000 mm.',
      critical: 'Upozornění: Fixace atypické šikminy (šikmé řezy) je technicky proveditelná výhradně na zesíleném profilu HZ 27x19 mm!',
      advantage: 'Skvělá pro úzké rámy kastlových a šroubovaných oken.',
      windClass: 'N/A (pouze interiér)',
      areaMax: 'N/A'
    },
    {
      id: 'isoline',
      category: 'HORIZONTAL' as const,
      name: 'Isoline Standard',
      sub: 'Řetízkový systém (Standard)',
      desc: 'Nejrozšířenější interiérový model se zaobleným horním profilem 42.5x25.6x25 mm. Vedení je zajištěno silonovou strunou.',
      limits: 'Šířka: 200 - 2400 mm. Výška: 300 - 2500 mm.',
      critical: 'Při použití úzkých lamel 16x0.21 mm je z důvodu zajištění stability minimální výrobní šířka zvýšena na 330 mm!',
      advantage: 'Skvělý poměr ceny a kvality, velmi snadná údržba.',
      windClass: 'N/A (pouze interiér)',
      areaMax: '2.40 m²'
    },
    {
      id: 'loco',
      category: 'HORIZONTAL' as const,
      name: 'Isoline LOCO',
      sub: 'Řetízkový systém (Plochá lišta)',
      desc: 'Moderní model s designovou, mimořádně plochou plechovou krycí lištou, která překrývá křídlo okna v jedné rovině.',
      limits: 'Šířka: 200 - 2400 mm. Výška: 300 - 2500 mm.',
      critical: 'Celostín (domykatelné provedení) má excentricky děrované lamely, čímž zamezí vnikání světla po zatažení.',
      advantage: 'Krycí lišta splývá v jedné estetické rovině s rámem křídla.',
      windClass: 'N/A (pouze interiér)',
      areaMax: '2.40 m²'
    },
    {
      id: 'prim',
      category: 'HORIZONTAL' as const,
      name: 'Isoline PRIM',
      sub: 'Prémiový bytový systém',
      desc: 'Estetická špička s aerodynamickým elegantním profilem 47.3x24 mm. Vhodná pro luxusní rezidence.',
      limits: 'Šířka: 240 - 2200 mm. Výška: 300 - 2400 mm.',
      critical: 'Při ploše nad 2.4 m² je pro udělení záruky QAPI bezpodmínečně vyžadována planetová převodovka s brzdou! Šířka nad 1.5 m vyžaduje 2 montážní podpěry.',
      advantage: 'Díky robustní převodovce má mezní garantovanou plochu až 5.28 m².',
      windClass: 'N/A (pouze interiér)',
      areaMax: '5.28 m² (s převodovkou)'
    },
    {
      id: 'eco',
      category: 'HORIZONTAL' as const,
      name: 'Isoline ECO',
      sub: 'Šnekový systém (Tyčka/Brzda)',
      desc: 'Ovládání pomocí průhledné plastové tyčky namísto řetízku. Spolehlivá alternativa pro úzká nebo střešní okna.',
      limits: 'Šířka: 200 - 2400 mm. Výška: 300 - 2500 mm.',
      critical: 'Poloha brzdy se určuje jako P (vpravo) nebo L (vlevo). Při úzké lamele 16 mm je min. šířka 330 mm.',
      advantage: 'Snadné dálkové tyčové ovládání i ve výškách.',
      windClass: 'N/A (pouze interiér)',
      areaMax: '2.40 m²'
    },

    // 2. EXTERNAL
    {
      id: 'ext_z90',
      category: 'EXTERNAL' as const,
      name: 'Venkovní žaluzie Z-90',
      sub: 'Exteriérové zpevněné provedení',
      desc: 'Lamely ve tvaru písmene Z o šířce 90 mm s integrovaným pryžovým těsněním. Zajišťuje maximální domykavost a akustický útlum.',
      limits: 'Šířka: 400 - 4500 mm. Výška: 500 - 4000 mm.',
      critical: 'Ruční klika vyžaduje min. šířku 400 mm. Motorické pohonné systémy vyžadují šířku minimálně 600 mm!',
      advantage: 'Vysoká stabilita ve větru a nejlepší zatemňovací efekt na trhu.',
      windClass: 'Třída 3 (rychlost větru do 49 km/h)',
      areaMax: '8.0 m² (klika) / 16.0 m² (motor)'
    },
    {
      id: 'ext_s90',
      category: 'EXTERNAL' as const,
      name: 'Venkovní žaluzie S-90',
      sub: 'Elegantní zakulacený profil',
      desc: 'Exteriérové stínění s lamelami tvaru S. Velmi elegantní, působí měkkým designovým dojmem.',
      limits: 'Šířka: 400 - 4500 mm. Výška: 500 - 4000 mm.',
      critical: 'Šířka nad 2500 mm bezpodmínečně vyžaduje montáž přídavných silných ocelových vodicích lan.',
      advantage: 'Hladký a tichý chod lamel díky zaválcovanému plastovému těsnění.',
      windClass: 'Třída 3 (rychlost větru do 49 km/h)',
      areaMax: '8.0 m² (klika) / 16.0 m² (motor)'
    },
    {
      id: 'ext_c80',
      category: 'EXTERNAL' as const,
      name: 'Venkovní žaluzie C-80',
      sub: 'Tradiční průmyslový standard',
      desc: 'Oboustranně falcované lamely ve tvaru písmene C o šířce 80 mm s možností nakápění na obě strany.',
      limits: 'Šířka: 400 - 4500 mm. Výška: 500 - 4000 mm.',
      critical: 'Lamela C-80 nemá pryžové tlumící těsnění, při silnějším větru je náchylnější na hluk.',
      advantage: 'Nejuniverzálnější typ využívaný v administrativních budovách a školách.',
      windClass: 'Třída 2 (rychlost větru do 38 km/h)',
      areaMax: '8.0 m² (klika) / 16.0 m² (motor)'
    },

    // 3. AWNINGS
    {
      id: 'awn_casablanca',
      category: 'AWNING' as const,
      name: 'Kasetová markýza Casablanca',
      sub: 'Luxusní zapouzdřená ochrana',
      desc: 'Prémiová kazeta dokonale chrání navíjenou tkaninu QAPI i kloubová hliníková ramena před vnější vlhkostí.',
      limits: 'Šířka: 2000 - 6000 mm. Výsuv: 1500 - 3500 mm (kroky po 500 mm).',
      critical: 'Při volbě Somfy elektromotoru je bezpečnostními předpisy doporučeno větrné nebo otřesové čidlo Eolis.',
      advantage: 'Kazeta splývá se stěnou domu a dramaticky prodlužuje životnost akrylové látky.',
      windClass: 'Třída 2 (odolnost vůči mírnému větru)',
      areaMax: '21.0 m²'
    },
    {
      id: 'awn_dakota',
      category: 'AWNING' as const,
      name: 'Kasetová markýza Dakota',
      sub: 'Robustní velkoformátový systém',
      desc: 'Extrémně pevná nosná konstrukce s masivními rameny určená pro stínění extrémně velkých zahradních teras.',
      limits: 'Šířka: 2000 - 6000 mm. Výsuv: až do 3500 mm.',
      critical: 'Vzhledem k vysoké váze a náchylnosti na poryvy větru vyžaduje stabilní kotvení do zateplených stěn chemickou kotvou.',
      advantage: 'Maximální odolnost ramen (napínací ocelové řetězy vyvíjejí obrovský tlak).',
      windClass: 'Třída 2',
      areaMax: '21.0 m²'
    },
    {
      id: 'awn_italia',
      category: 'AWNING' as const,
      name: 'Okenní markýza Italia',
      sub: 'Sklopná ramena (Balkony a Lodžie)',
      desc: 'Elegantní menší clona se sklopnými bočními rameny upevněnými na zábradlí nebo spodní špaletě.',
      limits: 'Šířka: 1000 - 5000 mm. Výsuv ramen: 1000 - 1800 mm.',
      critical: 'Sklopení ramen je čistě mechanické, úhel sklonu je plně nastavitelný od 0° do 160°.',
      advantage: 'Skvělá pro městské byty s lodžiemi, restaurace a pouliční stánky s výlohou.',
      windClass: 'Třída 3 (vysoká sklopná odolnost)',
      areaMax: '9.0 m²'
    }
  ];

  // Filter based on active category tab and search query
  const filteredSpecs = specs.filter((item) => {
    const categoryMatches = activeCategory === 'ALL' || item.category === activeCategory;
    const searchMatches = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.sub.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.limits.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.critical.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatches && searchMatches;
  });

  return (
    <div id="qapi-specs-guide" className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Aktivní normy a limity QAPI
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Technický list Q2/2026 • Bezpečnostní a expediční limity</p>
        </div>

        {/* Categories Tab selector styled as iOS Segmented Control */}
        <div className="bg-slate-100/80 p-1 rounded-2xl flex w-full md:w-auto border border-slate-200/50 select-none">
          {(['ALL', 'HORIZONTAL', 'EXTERNAL', 'AWNING'] as const).map((cat) => {
            let label = 'Vše';
            if (cat === 'HORIZONTAL') label = 'Horizontální';
            if (cat === 'EXTERNAL') label = 'Vnější';
            if (cat === 'AWNING') label = 'Markýzy';

            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 md:flex-none py-1.5 px-3 rounded-xl text-[10px] md:text-xs font-bold transition duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-xs border border-indigo-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Search Box */}
      <div className="relative">
        <span className="absolute left-3 top-3.5 text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Hledat pravidlo, limit rozměru, nucenou brzdu, nebo Z90..."
          className="w-full text-base md:text-xs rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-slate-800 tracking-tight focus:border-indigo-500 focus:outline-hidden min-h-[44px]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3 h-5 w-5 bg-slate-200/60 hover:bg-slate-200 text-slate-500 rounded-full font-bold text-[10px]"
          >
            ×
          </button>
        )}
      </div>

      {/* Grid displaying filtered items with high-contrast colored callouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSpecs.length > 0 ? (
          filteredSpecs.map((item) => {
            const isHoriz = item.category === 'HORIZONTAL';
            const isExt = item.category === 'EXTERNAL';

            return (
              <div
                key={item.id}
                className="bg-slate-50 hover:bg-slate-100/55 rounded-2xl border border-slate-100 p-4 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 tracking-tight">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{item.sub}</span>
                    </div>
                    <span className={`text-[8px] font-black rounded uppercase px-1.5 py-0.5 border ${
                      isHoriz 
                        ? 'bg-indigo-50/50 text-indigo-700 border-indigo-100' 
                        : isExt 
                        ? 'bg-amber-50/50 text-amber-700 border-amber-100' 
                        : 'bg-emerald-50/50 text-emerald-700 border-emerald-100'
                    }`}>
                      {isHoriz ? 'Interiér' : isExt ? 'Exteriér' : 'Terasa'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed mb-3">{item.desc}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-200/40">
                  <div className="flex items-start gap-1 text-[10px]">
                    <Sun className="w-3.5 h-3.5 text-indigo-550 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Technické limity:</span>{' '}
                      <span className="font-mono text-slate-600 bg-white/70 px-1 rounded">{item.limits}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1 text-[10px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-805">Krizové pravidlo:</span>{' '}
                      <span className="text-slate-600 leading-normal">{item.critical}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] bg-white border border-slate-150 rounded-lg p-2 mt-1 font-semibold">
                    <div>
                      <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Max garant. plocha</span>
                      <span className="text-slate-800 font-mono font-bold">{item.areaMax}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Větrná odolnost</span>
                      <span className="text-slate-800 font-mono font-bold">{item.windClass}</span>
                    </div>
                  </div>

                  <div className="pt-1.5 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Výhoda QAPI: {item.advantage}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-8 bg-slate-50 border border-slate-200/50 rounded-2xl">
            <p className="text-xs text-slate-500">Nebyly nalezeny žádné specifikace odpovídající hledání.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs text-indigo-600 font-bold hover:underline"
            >
              Vymazat vyhledávání
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
