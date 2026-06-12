import React, { useState } from 'react';
import {
  Plus,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Scale,
  Calculator,
  ArrowRight,
  ClipboardList,
  Wrench,
  X,
  Copy,
  Trash2,
  CornerDownRight,
  HelpCircle,
  Info,
  Calendar,
  Layers,
  UserCheck,
  Volume2,
  VolumeX,
  FileText,
  Phone,
  Mail,
  MapPin,
  Percent,
  Check,
  Printer
} from 'lucide-react';
import { BlindOrderItem, ValidationAlert, ProductCategory, ProductType } from './types';
import {
  validateBlindItem,
  calculateItemPrice,
  calculateItemWeight,
  getProductTypeLabel
} from './constants';
import OrderStepWizard from './components/OrderStepWizard';
import ExcelGridEditor from './components/ExcelGridEditor';
import { playTactileClick, playSuccessChime, playErrorHum } from './utils/sound';

// Helper to generate unique IDs
const generateId = () => 'item_' + Math.random().toString(36).substring(2, 9);

// Mapping defined categories and products
const PRODUCT_TYPES_BY_CATEGORY: Record<string, string[]> = {
  HORIZONTAL: ['ISOLINE', 'ISOLINE_LOCO', 'ISOLINE_PRIM', 'ISOLINE_ECO', 'HZ_25_19', 'HZ_27_19'],
  WOODEN: ['WOOD_25', 'WOOD_35', 'WOOD_50'],
  VERTICAL: ['VERT_STOFF_89', 'VERT_STOFF_127', 'VERT_PVC'],
  ROLETKY: ['ROLL_OPTIMA', 'ROLL_ROLOLITE'],
  SCREENS: ['SCREEN_FIX_W', 'SCREEN_DOOR_OPEN', 'SCREEN_DOOR_SLIDE', 'SCREEN_DOOR_PLEAT', 'SCREEN_SLIDE_TRACKS', 'SCREEN_SLIDE_FRAME', 'SCREEN_SLANT', 'SCREEN_ROLLER_VERSA', 'SCREEN_ROLLER_DAROS'],
  EXTERNAL: ['EXT_Z90', 'EXT_S90', 'EXT_C80', 'EXT_F80', 'EXT_TARA_PREMIO_I', 'EXT_TARA_PREMIO_II', 'EXT_GHIBLI_UNION', 'EXT_ROLO_VENKOVNI', 'EXT_ROLO_HELUZ'],
  AWNING: ['AWN_CASABLANCA', 'AWN_DAKOTA', 'AWN_ITALIA', 'AWN_UNION_DROP'],
  PLISSE: ['PLISSE_DARNI', 'PLISSE_LAGARTA'],
  JAPANESE: ['JAP_STENA']
};

const CATEGORIES_LIST = [
  { value: 'HORIZONTAL', label: 'Horizontální', icon: '🪟' },
  { value: 'WOODEN', label: 'Dřevěné', icon: '🪵' },
  { value: 'PLISSE', label: 'Plisé žaluzie', icon: '🎋' },
  { value: 'VERTICAL', label: 'Vertikální', icon: '↔️' },
  { value: 'JAPANESE', label: 'Japonská stěna', icon: '⛩️' },
  { value: 'ROLETKY', label: 'Roletky', icon: '📜' },
  { value: 'SCREENS', label: 'Sítě / Dveře', icon: '🛡️' },
  { value: 'EXTERNAL', label: 'Venkovní', icon: '🏢' },
  { value: 'AWNING', label: 'Markýzy', icon: '⛺' }
];

const OFFLINE_TEMPLATES = [
  { file: '01_formular_horizontalni_zaluzie.xls', label: 'Horizontální žaluzie (Vzor)' },
  { file: '01_formular_horizontalni_zaluzie_Isoline_Loco_Prim_Eco.xls', label: 'Isoline/Loco/Prim/Eco' },
  { file: '02_formular_plise_zaluzie_Darni.xls', label: 'Plisé žaluzie DARNI' },
  { file: '02_formular_plise_zaluzie_Lagarta.xls', label: 'Plisé žaluzie LAGARTA' },
  { file: '03_formular_drevene_zaluzie.xls', label: 'Dřevěné žaluzie' },
  { file: '04_formular_vertikalni_zaluzie.xls', label: 'Vertikální stínění' },
  { file: '05_formular_textilni_roletky_Jazz.xls', label: 'Textilní roletky' },
  { file: '06_formular_japonska_stena.xls', label: 'Japonská stěna' },
  { file: '07_formular_pevne_site_proti_hmyzu_okenni.xls', label: 'Pevné sítě proti hmyzu' },
  { file: '09_formular_venkovni_zaluzie.xlsx', label: 'Venkovní žaluzie' }
];

const LAMELLA_OPTIONS_BY_CATEGORY: Record<string, string[]> = {
  HORIZONTAL: ['25x0.18', '25x0.21', '16x0.21'],
  WOODEN: ['25 mm', '35 mm', '50 mm'],
  PLISSE: ['Plisé látka 20 mm'],
  VERTICAL: ['Látka 89 mm', 'Látka 127 mm', 'PVC 89 mm'],
  JAPANESE: ['Panel standard', 'Panel Premium'],
  ROLETKY: ['Standard', 'Premium', 'Zatemňující'],
  SCREENS: ['Šedá sklovlákno', 'Černá sklovlákno', 'Protipylová', 'Plisovaná černá'],
  EXTERNAL: ['Z90 - zpevněná', 'S90 - oblá', 'C80 - záhyb', 'F80 - plochá'],
  AWNING: ['Tkanina Terasa Standard', 'Soltis screen', 'Akrylová Premium']
};

const CONTROL_OPTIONS_BY_CATEGORY: Record<string, { value: string; label: string }[]> = {
  HORIZONTAL: [
    { value: 'RP', label: 'RP (Pravo)' },
    { value: 'RL', label: 'RL (Vlevo)' },
    { value: 'M', label: 'M (Meziskelní tyčka)' },
    { value: 'MF', label: 'MF (Meziskelní s fix)' },
    { value: 'IB', label: 'IB (Brzda a šnek)' }
  ],
  WOODEN: [
    { value: 'RP', label: 'Pravé (P)' },
    { value: 'RL', label: 'Levé (L)' }
  ],
  PLISSE: [
    { value: 'madlo', label: 'Ovládací madlo' },
    { value: 'provazek_L', label: 'Provázek vlevo (L)' },
    { value: 'provazek_P', label: 'Provázek vpravo (P)' }
  ],
  VERTICAL: [
    { value: '1', label: '1 - stahování k ovladači' },
    { value: '2', label: '2 - stahování od ovladače' },
    { value: '3', label: '3 - stahování od středu (opona)' },
    { value: '4', label: '4 - stahování do středu' },
    { value: '5', label: '5 - oboustranné ovládání' },
    { value: '8/1', label: '8/1 - dvoje k ovladači' },
    { value: '8/2', label: '8/2 - dvoje od ovladače' },
    { value: '8/3', label: '8/3 - dvoje od středu' },
    { value: '8/4', label: '8/4 - dvoje do středu' }
  ],
  JAPANESE: [
    { value: 'snura', label: 'Šňůra s těžítkem' },
    { value: 'tahlo', label: 'Průhledné táhlo' },
    { value: 'rucni', label: 'Volně ruční posun' }
  ],
  ROLETKY: [
    { value: 'RP', label: 'Řetízek vpravo' },
    { value: 'RL', label: 'Řetízek vlevo' }
  ],
  SCREENS: [
    { value: 'RP', label: 'Není určeno' }
  ],
  EXTERNAL: [
    { value: 'RP', label: 'Klika vpravo' },
    { value: 'RL', label: 'Klika vlevo' },
    { value: 'MOTOR_IO', label: 'Somfy IO dálkový' },
    { value: 'MOTOR_SWITCH', label: 'Motor na vypínač' }
  ],
  AWNING: [
    { value: 'RP', label: 'Klika vpravo' },
    { value: 'RL', label: 'Klika vlevo' },
    { value: 'MOTOR_IO', label: 'Somfy IO motor' }
  ]
};

export default function App() {
  // Empty default list of order items to encourage launching the customized questionnaires
  const [items, setItems] = useState<BlindOrderItem[]>([]);
  const [orderNumber, setOrderNumber] = useState<string>('OBJ-2026-001');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  
  // Custom technician and customer states for measurement protocol & SMTP
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [ccEmail, setCcEmail] = useState<string>('');
  const [technicianName, setTechnicianName] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  
  // Synchronized sound feedback state
  const [soundMuted, setSoundMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('qapi_sound_muted') === 'true';
    }
    return false;
  });

  const toggleSound = () => {
    const nextState = !soundMuted;
    setSoundMuted(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qapi_sound_muted', String(nextState));
    }
    if (!nextState) {
      setTimeout(() => playTactileClick(), 50);
    }
  };

  // Layout & Wizard States
  const [isPrintOverlayOpen, setIsPrintOverlayOpen] = useState<boolean>(false);
  const [vatRate, setVatRate] = useState<number>(21); // default 21%
  const [orderDiscount, setOrderDiscount] = useState<number>(0); // discount percent
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    orderId?: string;
    message?: string;
  } | null>(null);

  const [appNotification, setAppNotification] = useState<{message: string, isError: boolean} | null>(null);

  // Auto-dismiss helper for top notifications
  React.useEffect(() => {
    if (appNotification) {
      const timer = setTimeout(() => setAppNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [appNotification]);

  // Wizard active triggers
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [wizardEditingItem, setWizardEditingItem] = useState<BlindOrderItem | null>(null);
  
  // Confirmed item state to trigger post-questionnaire branch overlay
  const [justSavedItem, setJustSavedItem] = useState<BlindOrderItem | null>(null);

  // Synchronized view layout (Cards vs Grid)
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('grid'); // Default to grid for high productivity order sheets!

  const handleGridAddRow = () => {
    playTactileClick();
    const nextId = 'item_grid_' + Math.random().toString(36).substring(2, 9);
    const newItem: BlindOrderItem = {
      id: nextId,
      category: 'HORIZONTAL',
      productType: 'ISOLINE',
      width: 1000,
      height: 1000,
      quantity: 1,
      lamellaSize: '25x0.18',
      lamellaColor: '9010',
      topProfileColor: '9010',
      bottomProfileColor: '9010',
      controlSide: 'RP',
      isCelostin: false,
      isSlant: false,
      hasBrake: false,
      hasGearbox: false,
      notes: ''
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleGridCellChange = (index: number, field: keyof BlindOrderItem, value: any) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleGridCategoryChange = (index: number, newCat: ProductCategory) => {
    const list = PRODUCT_TYPES_BY_CATEGORY[newCat] || PRODUCT_TYPES_BY_CATEGORY.HORIZONTAL;
    const defaultProduct = list[0] as ProductType;
    setItems(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        category: newCat,
        productType: defaultProduct,
        lamellaSize: newCat === 'HORIZONTAL' ? '25x0.18' : newCat === 'WOODEN' ? 'WOOD_25' : 'Standard',
        controlSide: 'RP'
      };
      return next;
    });
  };

  const handleExportToExcel = async () => {
    try {
      playTactileClick();
      if (items.length === 0) {
        setAppNotification({ message: 'Nelze exportovat prázdnou objednávku. Nejprve nadefinujte nebo importujte položky.', isError: true });
        return;
      }

      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();

      // We will group items by category
      const categoriesInOrder = Array.from(new Set(items.map(it => it.category)));

      categoriesInOrder.forEach(cat => {
        const catItems = items.filter(it => it.category === cat);
        let sheetName = 'Stínění';
        let data: any[] = [];

        if (cat === 'HORIZONTAL') {
          sheetName = 'Horizontální žaluzie';
          data = catItems.map((item, idx) => ({
            'pozice': item.notes && item.notes.startsWith('Pozice:') ? item.notes.split(' | ')[0].replace('Pozice: ', '') : `Položka ${idx + 1}`,
            'šířka': item.width,
            'výška': item.height,
            'ks': item.quantity,
            'ovládání': item.controlSide,
            'materiál profilu': item.profileMaterial || 'Fe',
            'doplněk ovládání': item.controlAccessory || (item.hasGearbox && item.hasBrake ? 'PB - převodovka s brzdou' : item.hasBrake ? 'B - brzda' : ''),
            'typ žaluzie': getProductTypeLabel(item.productType),
            'barva profilu': item.topProfileColor,
            'barva krycí lišty LOCO': item.locoColor || '',
            'typ lamely': item.lamellaSize,
            'barva lamely': item.lamellaColor,
            'domyk. provedení': item.isCelostin ? 'ANO' : 'NE',
            'délka ovládání jiná (mm)': item.controlLengthCustom || 'standard',
            'materiál okna': item.windowMaterial || 'PVC',
            'distanční podložky': item.spacerCount || 0,
            'bar. sladění žebřík+texband': item.colorHarmony ? 'ANO' : 'NE',
            'bezpečnost. prvek': item.safetyElementBlinds ? 'ANO' : 'NE',
            'montážní podpěra': item.mountingSupport ? 'ANO' : 'NE',
            'šikmina': item.isSlant ? 'ANO' : 'NE',
            'poznámky': item.notes || ''
          }));
        } else if (cat === 'WOODEN') {
          sheetName = 'Dřevěné žaluzie';
          data = catItems.map((item, idx) => ({
            'Pozice (Řádek)': idx + 1,
            'Místnost / Pozice': item.notes && item.notes.startsWith('Pozice:') ? item.notes.split(' | ')[0].replace('Pozice: ', '') : `Položka ${idx + 1}`,
            'Typ dřevěné žaluzie': getProductTypeLabel(item.productType),
            'Šířka (mm)': item.width,
            'Výška (mm)': item.height,
            'Množství (ks)': item.quantity,
            'Šířka lamely (Rozměr)': item.lamellaSize,
            'Barva lamely / dřeva': item.lamellaColor,
            'Barva horního profilu': item.topProfileColor,
            'Krycí lišta (typ)': item.boxType || '',
            'Barva krycí lišty': item.boxColor || '',
            'Strana ovládání': item.controlSide,
            'S brzdou': item.hasBrake ? 'ANO' : 'NE',
            'S převodovkou': item.hasGearbox ? 'ANO' : 'NE',
            'Poznámka': item.notes || ''
          }));
        } else if (cat === 'VERTICAL') {
          sheetName = 'Vertikální stínění';
          data = catItems.map((item, idx) => ({
            'pozice': item.notes && item.notes.startsWith('Pozice:') ? item.notes.split(' | ')[0].replace('Pozice: ', '') : `Položka ${idx + 1}`,
            'omezení typ': item.verticalLimitation || '',
            'provedení typ': item.verticalDesign || '1', // 1=standard, 2=lux
            'šířka látky': item.lamellaSize || '127',
            'ks': item.quantity,
            'šířka': item.width,
            'výška': item.height,
            'typ stahování': item.verticalStahovani || '1',
            'počet barev': item.verticalColorsCount || 1,
            'barva': item.lamellaColor,
            'uchycení': item.mountingType || '',
            'uchycení navíc (ks)': item.verticalExtraBrackets || 0,
            'délka ovládání': item.verticalControlLength || '',
            'bezpečn. prvek': item.safetyElementBlinds ? 'ANO' : 'NE',
            'poznámky': item.notes || ''
          }));
        } else if (cat === 'ROLETKY') {
          sheetName = 'Textilní roletky';
          data = catItems.map((item, idx) => ({
            'pozice': item.notes && item.notes.startsWith('Pozice:') ? item.notes.split(' | ')[0].replace('Pozice: ', '') : `Položka ${idx + 1}`,
            'ks': item.quantity,
            'typ roletky': getProductTypeLabel(item.productType),
            'látka': item.lamellaColor,
            'barva komponentů': item.boxColor || item.topProfileColor || '',
            'šířka': item.width,
            'výška': item.height,
            'strana': item.controlSide,
            'ovládání': item.motorBrand ? 'Motor' : 'Ř - řetízek',
            'elektronika': item.motorBrand || '',
            'vodicí lišta': item.guideRailsOption ? 'ANO' : 'NE',
            'bezpečnost. prvek': item.safetyElement ? 'ANO' : 'NE',
            'délka řetízku': item.chainLength || 'standard',
            'poznámky': item.notes || ''
          }));
        } else if (cat === 'SCREENS') {
          sheetName = 'Sítě proti hmyzu';
          data = catItems.map((item, idx) => ({
            'pozice': item.notes && item.notes.startsWith('Pozice:') ? item.notes.split(' | ')[0].replace('Pozice: ', '') : `Položka ${idx + 1}`,
            'profil': item.productType || '',
            'ks': item.quantity,
            'šířka': item.width,
            'výška': item.height,
            'barva profilu': item.topProfileColor || item.boxColor || '',
            'síťovina': item.lamellaColor,
            'okopový plech': item.kickPlate ? 'ANO' : 'NE',
            'typ kartáčku / těsnění': item.brushType || '',
            'samozavírací panty (ks)': item.pantsCountSelfClose ? 1 : 0,
            'standardní panty (ks)': item.pantsCountStandard || 0,
            'výška držáku / uchycení do okna': item.mountingType || '',
            'rohy sítě (vnitřní/vnější)': item.cornersLook || '',
            'magnet / úchyty': item.handleMagnet ? 'ANO' : 'NE',
            'poznámka': item.notes || ''
          }));
        } else if (cat === 'EXTERNAL') {
          sheetName = 'Venkovní žaluzie';
          data = catItems.map((item, idx) => ({
            'pozice': item.notes && item.notes.startsWith('Pozice:') ? item.notes.split(' | ')[0].replace('Pozice: ', '') : `Položka ${idx + 1}`,
            'ks': item.quantity,
            'šířka': item.width,
            'výška': item.height,
            'typ lamely': item.lamellaSize,
            'barva lamela': item.lamellaColor,
            'prodloužení profilu +/- (mm)': '',
            'vedení žaluzie levá (typ)': item.guideType || '',
            'vedení žaluzie levá (barva)': item.boxColor || '',
            'vedení žaluzie pravá (typ)': item.guideType || '',
            'vedení žaluzie pravá (barva)': item.boxColor || '',
            'konc. lišta (barva)': item.endProfileColor || '',
            'uchycení vedení levá (typ)': item.mountingType || '',
            'uchycení vedení levá (barva)': '',
            'uchycení vedení pravá (typ)': item.mountingType || '',
            'uchycení vedení pravá (barva)': '',
            'držák nosníku (typ)': item.mountingSupport ? 'ANO' : '',
            'způsob ovládání (L/P/S)': item.controlSide,
            'způsob ovládání (typ)': item.motorBrand || 'Klika',
            'specifikace': item.electronicsReceiver || '',
            'spojeno s pozicí': '',
            'poznámka': item.notes || ''
          }));
        } else if (cat === 'AWNING') {
          sheetName = 'Markýzy';
          data = catItems.map((item, idx) => ({
            'Pozice (Řádek)': idx + 1,
            'Místnost / Pozice': item.notes && item.notes.startsWith('Pozice:') ? item.notes.split(' | ')[0].replace('Pozice: ', '') : `Položka ${idx + 1}`,
            'Typ markýzy': getProductTypeLabel(item.productType),
            'Šířka (mm)': item.width,
            'Výsuv (mm)': item.height,
            'Množství (ks)': item.quantity,
            'Kvalita a kód tkaniny': item.lamellaColor,
            'Typ konstrukce': item.boxType || '',
            'Barva konstrukce': item.boxColor || '',
            'Ovládání': item.controlSide,
            'Větrné čidlo': item.awningWindSensor ? 'ANO' : 'NE',
            'Přijímač/Ovladač': item.electronicsReceiver || '',
            'Kryt Al/Stříška': item.awningHood ? 'ANO' : 'NE',
            'Poznámka': item.notes || ''
          }));
        } else if (cat === 'PLISSE') {
          sheetName = 'Plisé žaluzie';
          data = catItems.map((item, idx) => ({
            'pozice': item.notes && item.notes.startsWith('Pozice:') ? item.notes.split(' | ')[0].replace('Pozice: ', '') : `Položka ${idx + 1}`,
            'šířka': item.width,
            'výška': item.height,
            'model': item.plisseModel || getProductTypeLabel(item.productType),
            'barva profilu': item.boxColor || '',
            'první látka (horní)': item.lamellaColor,
            'druhá látka (dolní)': item.secondFabric || '',
            'strana ovládání': item.controlSide,
            'ovládání': item.controlSide, // Same logic or could be mapped to custom strings "madlo" etc.
            'montáž                  - typ uchycení': item.mountingType || '',
            'prodlužovací tyč (cm)': item.extensionRod || '',
            'krycí lišta': item.plisseCoverBar || '',
            'ks': item.quantity,
            'poznámka': item.notes || ''
          }));
        } else if (cat === 'JAPANESE') {
          sheetName = 'Japonské stěny';
          data = catItems.map((item, idx) => ({
            'Pozice (Řádek)': idx + 1,
            'Místnost / Pozice': item.notes && item.notes.startsWith('Pozice:') ? item.notes.split(' | ')[0].replace('Pozice: ', '') : `Položka ${idx + 1}`,
            'Profil VL': item.boxType || getProductTypeLabel(item.productType),
            'Šířka (mm)': item.width,
            'Výška (mm)': item.height,
            'Množství (ks)': item.quantity,
            'Šířka panelů (mm)': item.panelWidth || '',
            'Počet panelů': item.panelCount || 1,
            'VL typ': item.japTrackType || '',
            'Barva VL profilu': item.boxColor || '',
            'Magnetické úchyty (párů)': item.japMagnetsEnabled ? (item.japMagnetCount || 2) : 0,
            'Tkanina / Barva': item.lamellaColor,
            'Poznámka': item.notes || ''
          }));
        } else {
          sheetName = 'Stínění QAPI';
          data = catItems.map((item, idx) => ({
            'Pozice (Řádek)': idx + 1,
            'Rozměry': `${item.width} x ${item.height} mm`,
            'Ks': item.quantity,
            'Barva lamely': item.lamellaColor,
            'Barva profilu': item.topProfileColor,
            'Model': getProductTypeLabel(item.productType),
            'Poznámka': item.notes || ''
          }));
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      XLSX.writeFile(workbook, `QAPI_${orderNumber || 'objednavka'}.xlsx`);
      playSuccessChime();
      setAppNotification({ message: `Soubor QAPI_${orderNumber || 'objednavka'}.xlsx byl úspěšně stažen s oddělenými listy pro jednotlivé kategorie výrobků.`, isError: false });
    } catch (err: any) {
      console.error(err);
      playErrorHum();
      setAppNotification({ message: 'Chyba při sestavování Excelu: ' + err.message, isError: true });
    }
  };

  // Duplicate an existing item
  const handleDuplicateItem = (index: number) => {
    playTactileClick();
    const list = [...items];
    const original = list[index];
    const clone: BlindOrderItem = {
      ...original,
      id: generateId(),
      notes: original.notes ? `${original.notes} (Kopie)` : 'Kopie'
    };
    list.splice(index + 1, 0, clone);
    setItems(list);
  };

  // Delete an item from order
  const handleDeleteItem = (index: number) => {
    playTactileClick();
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Trigger wizard edits on specific item index
  const handleStartEditItem = (item: BlindOrderItem) => {
    playTactileClick();
    setWizardEditingItem(item);
    setIsWizardOpen(true);
  };

  // Process item output from step-by-step wizard
  const handleSaveWizardItem = (savedItem: BlindOrderItem) => {
    const exists = items.some(it => it.id === savedItem.id);
    if (exists) {
      // Editing existing - closes normally
      playTactileClick();
      setItems(items.map(it => it.id === savedItem.id ? savedItem : it));
      setIsWizardOpen(false);
      setWizardEditingItem(null);
    } else {
      // Appending new item - trigger success picker
      playSuccessChime();
      setItems([...items, savedItem]);
      setJustSavedItem(savedItem);
      setIsWizardOpen(false);
      setWizardEditingItem(null);
    }
  };

  const handleAddAnother = () => {
    playTactileClick();
    setJustSavedItem(null);
    setWizardEditingItem(null);
    setIsWizardOpen(true);
  };

  const handleViewSummary = () => {
    playTactileClick();
    setJustSavedItem(null);
    setViewMode('grid');
  };

  // Clear entire form data
  const handleResetOrder = () => {
    playTactileClick();
    if (window.confirm('Opravdu si přejete smazat celou objednávku a začít znovu?')) {
      setItems([]);
      setOrderNumber('OBJ-' + Math.floor(1000 + Math.random() * 9000));
      setGeneralNotes('');
      setSubmissionResult(null);
      setImportedFileInfo('');
    }
  };

  const [importedFileInfo, setImportedFileInfo] = useState<string>('');

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      playTactileClick();
      // Dynamically import the parser utility
      const { parseXlsOrderFile } = await import('./utils/xlsParser');
      const result = await parseXlsOrderFile(file);

      if (result.items && result.items.length > 0) {
        // Append parsed items to items list
        setItems(prev => [...prev, ...result.items]);
        setImportedFileInfo(`${result.fileName} (${result.items.length} prvků)`);
        
        // Auto-populate customer & order metadata if found
        if (result.orderInfo?.customerName) {
          setCustomerName(result.orderInfo.customerName);
        }
        if (result.orderInfo?.orderNumber) {
          setOrderNumber(result.orderInfo.orderNumber);
        }

        playSuccessChime();
        setAppNotification({
          message: `Úspěšně importováno ${result.items.length} prvků z "${result.fileName}".`,
          isError: false
        });
      } else {
        playErrorHum();
        setAppNotification({
          message: 'V souboru nebyly nalezeny žádné platné stínicí prvky.',
          isError: true
        });
      }
    } catch (err: any) {
      console.error(err);
      playErrorHum();
      setAppNotification({
        message: `Chyba při parsování Excel souboru: ${err?.message || 'nepodporovaný formát'}`,
        isError: true
      });
    } finally {
      // Clear value so the same file can be selected again
      e.target.value = '';
    }
  };

  // Compute statistics
  const aggregatedStats = items.reduce(
    (acc, curr) => {
      const weight = calculateItemWeight(curr);
      const area = (curr.width * curr.height) / 1000000 * curr.quantity;
      const count = curr.quantity;

      return {
        price: 0,
        weight: acc.weight + weight,
        area: acc.area + area,
        count: acc.count + count
      };
    },
    { price: 0, weight: 0, area: 0, count: 0 }
  );

  // Check technical validation alerts across entire package
  const allAlerts = items.reduce<ValidationAlert[]>((acc, curr) => {
    return [...acc, ...validateBlindItem(curr)];
  }, []);

  const hasErrors = allAlerts.some((al) => al.type === 'error');

  // Submit complete order payload
  const handleSubmitOrder = async () => {
    if (hasErrors) {
      playErrorHum();
      setAppNotification({ message: 'Před odesláním opravte závažné technické chyby vyznačené v prvcích.', isError: true });
      return;
    }

    try {
      const orderPayload = {
        id: 'ord_' + Date.now(),
        orderNumber,
        createdAt: new Date().toISOString(),
        items,
        totalPriceEstimate: aggregatedStats.price,
        notes: generalNotes
      };

      const res = await fetch('/api/qapi/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: orderPayload }),
      });

      const data = await res.json();
      if (data.success) {
        playSuccessChime();
        setSubmissionResult({
          success: true,
          orderId: data.orderId,
          message: data.message
        });
      } else {
        throw new Error(data.error || 'Server odmítl registraci zakázky.');
      }
    } catch (err: any) {
      playErrorHum();
      setAppNotification({ message: 'Chyba odesílání: ' + err.message, isError: true });
    }
  };

  // Asynchronously dispatch the measurement protocol via SMTP using the Nodemailer microservice
  const handleSendEmail = async () => {
    if (items.length === 0) {
      playErrorHum();
      setAppNotification({ message: 'Seznam stínění je prázdný.', isError: true });
      return;
    }
    if (!recipientEmail || !recipientEmail.includes('@')) {
      playErrorHum();
      setAppNotification({ message: 'Zadejte prosím platný e-mail příjemce.', isError: true });
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/qapi/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderNumber,
          items: items.map(item => ({
            ...item,
            productName: getProductTypeLabel(item.productType)
          })),
          generalNotes,
          recipientEmail,
          ccEmail,
          technicianName,
          customerName,
          customerPhone,
          customerAddress,
          totalArea: aggregatedStats.area,
          totalCount: aggregatedStats.count,
          totalWeight: aggregatedStats.weight
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Něco se nepovedlo při komunikaci se serverem.');
      }

      playSuccessChime();
      setAppNotification({ 
        message: data.message || 'Zaměřovací protokol byl úspěšně vyexpedován e-mailem!', 
        isError: false 
      });
    } catch (err: any) {
      playErrorHum();
      setAppNotification({ 
        message: err.message || 'Nepodařilo se odeslat e-mail. Zkontrolujte nastavení SMTP.', 
        isError: true 
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-neutral-800 font-sans antialiased flex flex-col selection:bg-neutral-200 selection:text-neutral-900">
      
      {/* iOS-inspired Fluent Sticky Top Masthead */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 z-30 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-black text-white flex items-center justify-center rounded-lg font-black text-xs uppercase tracking-tight select-none">
              Q
            </div>
            <div>
              <span className="font-extrabold text-neutral-900 text-sm tracking-tight">QAPI</span>
            </div>
          </div>

          {/* Removed Navigation Controls */}
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-4">
        
        {/* iOS Styled Push Alert Toast */}
        {appNotification && (
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold shadow-xs animate-fade-in ${
            appNotification.isError 
              ? 'bg-red-50 border-red-150 text-red-700' 
              : 'bg-neutral-900 border-neutral-850 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-4 h-4 shrink-0 ${appNotification.isError ? 'text-red-500' : 'text-neutral-400'}`} />
              <span>{appNotification.message}</span>
            </div>
            <button 
              onClick={() => setAppNotification(null)}
              className="text-neutral-400 hover:text-neutral-200 transition p-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}
        
        {submissionResult ? (
          /* Apple Style Order Complete Summary Card */
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-neutral-200/50 p-6 text-center shadow-xs space-y-5 my-8">
            <div className="h-12 w-12 bg-neutral-900 text-white mx-auto rounded-full flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-neutral-900 tracking-tight">
                Objednávka úspěšně uložena
              </h2>
              <p className="text-xs text-neutral-400 leading-normal">
                Veškeré rozměry byly zvalidovány a odeslány do výroby QAPI. Protokol k podpisu je připraven.
              </p>
            </div>

            <div className="bg-[#F2F2F7] rounded-xl p-4 text-left space-y-2 text-xs border border-neutral-200/40">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-neutral-400 font-medium">Kód objednávky</span>
                <span className="font-mono font-bold text-neutral-800">{submissionResult.orderId}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-neutral-200/40 pt-1.5">
                <span className="text-neutral-400 font-medium">Výrobní číslo</span>
                <span className="font-bold text-neutral-800 tracking-wider uppercase font-mono">{orderNumber}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-neutral-200/40 pt-1.5">
                <span className="text-neutral-400 font-medium">Celková plocha</span>
                <span className="font-mono font-black text-neutral-900 text-sm">
                  {aggregatedStats.area.toFixed(3)} m²
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                onClick={() => {
                  playTactileClick();
                  setIsPrintOverlayOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
              >
                <Printer className="w-4 h-4" />
                Zpřístupnit tisk / PDF
              </button>
              <button
                onClick={() => {
                  setItems([]);
                  setOrderNumber('OBJ-' + Math.floor(1000 + Math.random() * 9000));
                  setGeneralNotes('');
                  setSubmissionResult(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl cursor-pointer transition active:scale-95 border border-neutral-250/40"
              >
                Nová čistá zakázka
              </button>
            </div>
          </div>
        ) : justSavedItem ? (
          /* Beautiful Cupertino Apple-style post-add confirmation view */
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-neutral-200/50 p-6 sm:p-7 shadow-xs space-y-5 animate-fade-in my-6">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
              <div className="h-10 w-10 bg-neutral-900 text-white rounded-full flex items-center justify-center shrink-0 border border-neutral-850">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-neutral-900 uppercase tracking-tight">Prvek úspěšně zapsán do objednávky!</h2>
                <p className="text-[11px] text-neutral-400 font-medium">Stínicí technika QAPI byla nakonfigurována a zařazena do kalkulace.</p>
              </div>
            </div>

            {/* Quick Summary list layout */}
            <div className="bg-[#F2F2F7] rounded-xl border border-neutral-200/40 p-4 space-y-3 text-xs leading-none">
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-neutral-200/40">
                <span className={`p-1 px-2 text-[9px] font-black rounded uppercase tracking-wider ${
                  justSavedItem.category === 'EXTERNAL'
                    ? 'bg-orange-100 text-orange-800'
                    : justSavedItem.category === 'AWNING'
                    ? 'bg-neutral-900 text-white'
                    : justSavedItem.category === 'WOODEN'
                    ? 'bg-amber-100 text-amber-800'
                    : justSavedItem.category === 'VERTICAL'
                    ? 'bg-teal-100 text-teal-800'
                    : justSavedItem.category === 'ROLETKY'
                    ? 'bg-indigo-100 text-indigo-800'
                    : justSavedItem.category === 'SCREENS'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-100 text-neutral-850'
                }`}>
                  {justSavedItem.category === 'EXTERNAL' ? 'Venkovní' : 
                   justSavedItem.category === 'AWNING' ? 'Markýza' : 
                   justSavedItem.category === 'WOODEN' ? 'Dřevěná' : 
                   justSavedItem.category === 'VERTICAL' ? 'Vertikální' : 
                   justSavedItem.category === 'ROLETKY' ? 'Roletka' : 
                   justSavedItem.category === 'SCREENS' ? 'Síť / Dveře' : 
                   'Horizontální'}
                </span>
                <span className="font-bold text-neutral-900">{getProductTypeLabel(justSavedItem.productType)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-neutral-200/40">
                  <span className="text-neutral-400 block text-[9px] mb-1">PROPORCE:</span>
                  <span className="font-mono font-bold text-neutral-850">{justSavedItem.width} × {justSavedItem.height} mm</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-neutral-200/40">
                  <span className="text-neutral-400 block text-[9px] mb-1">MNOŽSTVÍ:</span>
                  <span className="font-bold text-neutral-850">{justSavedItem.quantity} ks</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-neutral-200/40">
                  <span className="text-neutral-400 block text-[9px] mb-1">PROVEDENÍ &amp; BARVA:</span>
                  <p className="font-bold text-neutral-800 truncate">{justSavedItem.lamellaColor} / pr. {justSavedItem.topProfileColor}</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-neutral-200/40">
                  <span className="text-neutral-400 block text-[9px] mb-1">CELKOVÁ PLOCHA:</span>
                  <span className="font-black font-mono text-neutral-900">
                    {((justSavedItem.width * justSavedItem.height * justSavedItem.quantity) / 1000000).toFixed(3)} m²
                  </span>
                </div>
              </div>
              {justSavedItem.notes && (
                <div className="pt-2.5 border-t border-neutral-200/40 flex items-start gap-1.5 text-neutral-500 text-[11px] leading-normal font-medium">
                  <span className="font-bold shrink-0">Poznámka / Pozn. v domě:</span>
                  <span className="italic">"{justSavedItem.notes}"</span>
                </div>
              )}
            </div>

            {/* Decision panel prompt */}
            <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 text-center space-y-3.5">
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-neutral-900 uppercase">Chcete pokračovat v zaměřování dalších oken?</h4>
                <p className="text-[11px] text-neutral-400 leading-normal max-w-sm mx-auto">
                  Můžete buď přidat další prvek ze zaměřovací tabulky do této objednávky, nebo rovnou zrevidovat celou zakázku k odeslání.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1.5">
                <button
                  type="button"
                  onClick={handleAddAnother}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 select-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Konfigurovat další okno / prvek
                </button>
                <button
                  type="button"
                  onClick={handleViewSummary}
                  className="px-5 py-2.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 select-none"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Zobrazit rekapitulaci zakázky
                </button>
              </div>
            </div>
          </div>
        ) : isWizardOpen ? (
          /* Dynamic Questionnaire Step Wizard styled like Apple Modal View in-place */
          <div className="space-y-3.5">
            <div className="flex items-center justify-between bg-[#1C1C1E] text-white p-3.5 rounded-2xl text-[11px] font-semibold tracking-wide shadow-sm">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#007AFF] animate-ping" />
                Interaktivní konfigurace dle technického listu QAPI. Nepatřičné rozměry jsou ihned korigovány.
              </span>
              <button
                onClick={() => { playTactileClick(); setIsWizardOpen(false); setWizardEditingItem(null); }}
                className="text-[#007AFF] hover:text-white font-black uppercase text-[10px]"
              >
                Zpět na přehled
              </button>
            </div>

            <OrderStepWizard
              editingItem={wizardEditingItem}
              onSaveItem={handleSaveWizardItem}
              onCancel={() => {
                setIsWizardOpen(false);
                setWizardEditingItem(null);
              }}
            />
          </div>
        ) : (
          /* Main Form Split Screen Layout for iOS device views */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* Left Workspace (8/12 weight): Added items summary and general metadata */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Order Metadata and general settings ( Grouped settings card look) */}
              <div className="bg-white rounded-2xl border border-neutral-200/55 p-5 shadow-xs">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-3.5">
                  <span className="text-xs font-black text-neutral-900 uppercase tracking-wide">
                    Poznámky k výrobě a nakládce QAPI
                  </span>
                  <button
                    onClick={handleResetOrder}
                    className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold text-[10px] rounded-lg transition border border-neutral-200/50 cursor-pointer select-none active:scale-95"
                  >
                    Vyčistit formulář
                  </button>
                </div>

                <div className="mt-2">
                  <textarea
                    rows={2}
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Např. Roztřídit dle místností, u šikmých žaluzií přibalit náhradní fixace..."
                    className="w-full text-base sm:text-xs rounded-xl border border-neutral-200 bg-[#F2F2F7] p-3 text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-black focus:outline-hidden min-h-[50px]"
                  />
                </div>
              </div>

              {/* Items Summary list layout ( Widgets container) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-5 min-w-5 px-1 bg-black flex items-center justify-center text-[10px] font-mono font-bold text-white rounded-full select-none">
                      {items.length}
                    </span>
                    <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wide font-sans">Položky k nacenění a výrobě</h3>
                  </div>

                  <div className="flex bg-[#F2F2F7] p-1 rounded-xl gap-0.5 select-none shrink-0 border border-neutral-250/20">
                    <button
                      type="button"
                      onClick={() => { playTactileClick(); setViewMode('grid'); }}
                      className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-white text-black shadow-3xs'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      Rychlá tabulka (.xlsx)
                    </button>
                    <button
                      type="button"
                      onClick={() => { playTactileClick(); setViewMode('cards'); }}
                      className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                        viewMode === 'cards'
                          ? 'bg-white text-black shadow-3xs'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      Karty / Detaily
                    </button>
                  </div>

                  <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-250 cursor-pointer hover:bg-emerald-100 text-xs font-bold rounded-xl shadow-yxs transition active:scale-95 select-none hover:border-emerald-300">
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Excel Import</span>
                      <input
                        type="file"
                        accept=".xls,.xlsx"
                        className="hidden"
                        onChange={handleFileImport}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setWizardEditingItem(null);
                        setIsWizardOpen(true);
                      }}
                      className="px-3.5 py-2 bg-black hover:bg-neutral-850 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer select-none active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" />
                      Konfigurovat prvek
                    </button>
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  <ExcelGridEditor
                    items={items}
                    setItems={setItems}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onExport={handleExportToExcel}
                    onAddRow={handleGridAddRow}
                    onDuplicate={handleDuplicateItem}
                    onDelete={handleDeleteItem}
                    onEdit={(idx) => {
                      playTactileClick();
                      setWizardEditingItem(items[idx]);
                      setIsWizardOpen(true);
                    }}
                    validateItem={validateBlindItem}
                    getProductTypeLabel={getProductTypeLabel}
                    categoriesList={CATEGORIES_LIST}
                    productTypesByCategory={PRODUCT_TYPES_BY_CATEGORY}
                    controlOptionsByCategory={CONTROL_OPTIONS_BY_CATEGORY}
                    lamellaOptionsByCategory={LAMELLA_OPTIONS_BY_CATEGORY}
                    offlineTemplates={OFFLINE_TEMPLATES}
                    importedFileInfo={importedFileInfo}
                    setImportedFileInfo={setImportedFileInfo}
                  />
                ) : (
                  /* ORIGINAL CARD VIEW (iOS standard Cards list) */
                  items.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-2xl border border-neutral-200/50 p-6 text-center space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="h-10 w-10 bg-[#F2F2F7] rounded-full flex items-center justify-center mx-auto text-base select-none shadow-inner">
                            📦
                          </div>
                          <div className="max-w-xs mx-auto space-y-1">
                            <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Ruční zaměření prvků</h4>
                            <p className="text-[11px] text-neutral-400 leading-normal font-medium">
                              Klikněte na tlačítko níže pro otevření interaktivního lamelového dotazníku QAPI a nakonfigurujte rozměry prvku krok za krokem.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setWizardEditingItem(null);
                              setIsWizardOpen(true);
                            }}
                            className="px-4 py-2.5 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 select-none"
                          >
                            <Plus className="w-4 h-4 text-white" />
                            Spustit dotazník QAPI
                          </button>

                        </div>
                      </div>

                      {/* Drag and Drop / Excel Import widget */}
                      <div className="bg-emerald-50/15 rounded-2xl border border-dashed border-emerald-350 p-6 text-center space-y-4 flex flex-col justify-between hover:bg-emerald-50/30 transition-all duration-150">
                        <div className="space-y-4">
                          <div className="h-10 w-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-base select-none shadow-inner">
                            📊
                          </div>
                          <div className="max-w-xs mx-auto space-y-1">
                            <h4 className="text-xs font-black text-emerald-920 uppercase tracking-tight">Rychlý import z Excelu (.xls)</h4>
                            <p className="text-[11px] text-emerald-605 leading-normal font-semibold">
                              Máte již vyplněnou tabulku ze složky <code className="font-mono bg-emerald-100/60 px-1 py-0.5 rounded text-[10px]">xls</code>? Nahrajte ji sem! Začněte s „01_ Horizontální žaluzie“.
                            </p>
                          </div>
                        </div>

                        <div className="pt-2">
                          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs active:scale-95 select-none w-full sm:w-auto justify-center">
                            <Upload className="w-4 h-4" />
                            Vybrat .xls formulář
                            <input
                              type="file"
                              accept=".xls,.xlsx"
                              className="hidden"
                              onChange={handleFileImport}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Cards listing for current elements built with iOS detail standards */
                    <div className="space-y-3">
                      {importedFileInfo && (
                        <div className="bg-emerald-50/80 rounded-xl border border-emerald-200/50 p-2 text-xs text-emerald-800 font-bold flex items-center justify-between gap-3 px-3 shadow-3xs">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span className="opacity-80">Importováno z tabulky:</span>
                            <span className="bg-emerald-100/70 border border-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none font-black text-emerald-900 truncate max-w-[180px] sm:max-w-xs">{importedFileInfo}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setImportedFileInfo('')}
                            className="text-[10px] text-emerald-600 hover:text-emerald-800 font-black cursor-pointer uppercase tracking-tight"
                          >
                            Skrýt
                          </button>
                        </div>
                      )}
                      {items.map((item, index) => {
                        const itemPrice = calculateItemPrice(item);
                        const itemWeight = calculateItemWeight(item);
                        const itemAlerts = validateBlindItem(item);
                        const hasItemError = itemAlerts.some(al => al.type === 'error');

                        return (
                          <div
                            key={item.id}
                            className="bg-white rounded-2xl border border-neutral-200/60 p-4.5 shadow-xs hover:border-neutral-350 transition-all relative flex flex-col md:flex-row justify-between gap-4 group"
                          >
                            {/* Row numeric index in circle */}
                            <div className="absolute top-4 left-4 h-5.5 w-5.5 rounded-full bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-[9px] font-mono font-bold text-neutral-500 select-none">
                              {index + 1}
                            </div>

                            <div className="pl-8 space-y-2 flex-1">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`p-0.5 px-1.5 text-[8px] font-black rounded uppercase tracking-wider leading-none select-none ${
                                    item.category === 'EXTERNAL'
                                      ? 'bg-orange-100 border border-orange-200/65 text-orange-800'
                                      : item.category === 'AWNING'
                                      ? 'bg-neutral-900 text-white border border-transparent'
                                      : item.category === 'WOODEN'
                                      ? 'bg-amber-100 border border-amber-200/65 text-amber-800'
                                      : item.category === 'VERTICAL'
                                      ? 'bg-teal-100 border border-teal-200/65 text-teal-800'
                                      : item.category === 'ROLETKY'
                                      ? 'bg-indigo-100 border border-indigo-200/65 text-indigo-855'
                                      : item.category === 'SCREENS'
                                      ? 'bg-emerald-100 border border-emerald-200/65 text-emerald-855'
                                      : 'bg-neutral-100 border border-neutral-200/60 text-neutral-700'
                                  }`}>
                                    {item.category === 'EXTERNAL' ? 'Venkovní' : 
                                     item.category === 'AWNING' ? 'Markýza' : 
                                     item.category === 'WOODEN' ? 'Dřevěné' : 
                                     item.category === 'VERTICAL' ? 'Vertikální' : 
                                     item.category === 'ROLETKY' ? 'Roletka' : 
                                     item.category === 'SCREENS' ? 'Síť/Dveře' : 
                                     'Horizontální'}
                                  </span>
                                  <h4 className="text-xs font-black text-neutral-900 font-sans">
                                    {getProductTypeLabel(item.productType)}
                                  </h4>
                                  {item.notes && (
                                    <span className="text-[10px] text-neutral-400 font-bold bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-100">
                                      {item.notes}
                                    </span>
                                  )}
                                </div>

                                {/* Highlight key details in Cupertino table capsules */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-3 text-[11px] leading-tight select-none">
                                  <div className="p-2 bg-[#F2F2F7] rounded-lg">
                                    <span className="text-neutral-400 block text-[8px] font-bold tracking-wider mb-0.5">ROZMĚRY:</span>
                                    <span className="font-mono font-bold text-neutral-800">{item.width} × {item.height} mm</span>
                                  </div>
                                  <div className="p-2 bg-[#F2F2F7] rounded-lg">
                                    <span className="text-neutral-400 block text-[8px] font-bold tracking-wider mb-0.5">POČET KS:</span>
                                    <span className="font-bold text-neutral-800">{item.quantity} ks</span>
                                  </div>
                                  <div className="p-2 bg-[#F2F2F7] rounded-lg text-ellipsis overflow-hidden">
                                    <span className="text-neutral-400 block text-[8px] font-bold tracking-wider mb-0.5">LAMELA / TKANINA:</span>
                                    <span className="font-semibold text-neutral-800 truncate block">{item.lamellaSize || 'Standard'}</span>
                                  </div>
                                  <div className="p-2 bg-[#F2F2F7] rounded-lg text-ellipsis overflow-hidden">
                                    <span className="text-neutral-400 block text-[8px] font-bold tracking-wider mb-0.5">ODSTÍNY (L/P):</span>
                                    <span className="font-semibold text-neutral-800 truncate block">{item.lamellaColor} / pr. {item.topProfileColor}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Accessory summary badges in clean pills */}
                              <div className="flex gap-1 flex-wrap text-[9px] font-bold text-neutral-500 select-none">
                                {item.controlSide && (
                                  <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-150 rounded-md font-mono">Ovládání: {item.controlSide}</span>
                                )}
                                {item.isCelostin && <span className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200/40 text-neutral-800 rounded-md">Celostín</span>}
                                {item.isSlant && <span className="px-1.5 py-0.5 bg-[#FFF9E6] border border-[#FFEBAD] text-amber-800 rounded-md">Atypické okno</span>}
                                {item.hasGearbox && <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-150 text-neutral-700 rounded-md">S planetovou převodovkou</span>}
                                {item.awningWindSensor && <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-150 text-neutral-700 rounded-md">Otřesové větrné čidlo</span>}
                              </div>

                              {/* Custom warning bubbles */}
                              {itemAlerts.length > 0 && (
                                <div className="space-y-1">
                                  {itemAlerts.map((al, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-2 rounded-lg text-[10px] leading-normal flex items-start gap-1.5 border font-semibold ${
                                        al.type === 'error'
                                          ? 'bg-red-50 text-red-700 border-red-150/60'
                                          : 'bg-amber-50 text-amber-800 border-amber-150/60'
                                      }`}
                                    >
                                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                      <span>{item.notes && item.notes.startsWith('Pozice:') ? `${item.notes.split(' | ')[0]}: ${al.message}` : al.message}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Side pricing columns with clean haptic action triggers */}
                            <div className="flex flex-row md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-neutral-150/60 pt-3 md:pt-0 md:pl-4 shrink-0 min-w-40 text-right gap-2 select-none">
                              <div>
                                <span className="block text-[8px] text-neutral-400 font-bold tracking-wider">PLOCHA PRVKU (M²):</span>
                                <span className="text-sm font-black font-mono text-neutral-905 block leading-none mt-0.5">
                                  {((item.width * item.height) / 1000000).toFixed(3)} m²
                                </span>
                                {item.quantity > 1 ? (
                                  <span className="block text-[9px] text-indigo-600 font-bold font-mono">Celkem: {((item.width * item.height * item.quantity) / 1000000).toFixed(3)} m² (~ {itemWeight} kg)</span>
                                ) : (
                                  <span className="block text-[9px] text-neutral-400 font-medium font-mono">~ {itemWeight} kg</span>
                                )}
                              </div>

                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateItem(index)}
                                  className="p-1.5 bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 text-neutral-500 rounded-lg transition-all cursor-pointer h-7 w-7 flex items-center justify-center border border-neutral-200/70"
                                  title="Duplikovat žaluzii"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditItem(item)}
                                  className="px-2.5 py-1 bg-neutral-50 border border-neutral-200 hover:border-black hover:bg-white text-neutral-800 font-bold text-[10px] rounded-lg transition-all cursor-pointer border border-neutral-200/70"
                                >
                                  Upravit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(index)}
                                  className="p-1.5 bg-neutral-50 border border-neutral-200 hover:bg-red-50 hover:text-red-650 hover:border-red-200 text-neutral-400 rounded-lg transition-all cursor-pointer h-7 w-7 flex items-center justify-center border border-neutral-200/70"
                                  title="Odstranit"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Grand totals of count and area right at the end of the form per user request */}
                      <div className="bg-indigo-50 border border-indigo-150/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 my-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-600 rounded-xl text-white">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">Celkové parametry měření</h4>
                            <p className="text-[10px] text-indigo-500 font-semibold mt-0.5 leading-tight">Počet prvků a celková plocha stínění v protokolu</p>
                          </div>
                        </div>
                        <div className="flex gap-4 sm:gap-6 self-stretch sm:self-auto justify-around sm:justify-end">
                          <div className="text-right pl-4 sm:pl-0">
                            <span className="block text-[8px] text-indigo-500 font-bold uppercase tracking-widest">KUSŮ CELKEM</span>
                            <span className="text-lg font-black text-indigo-950 font-mono leading-none mt-0.5 block">{aggregatedStats.count} ks</span>
                            <span className="text-[9px] text-indigo-400 font-mono font-bold">z {items.length} pozic</span>
                          </div>
                          <div className="text-right border-l border-indigo-200/60 pl-4 sm:pl-6">
                            <span className="block text-[8px] text-indigo-500 font-bold uppercase tracking-widest">CELKOVÁ PLOCHA</span>
                            <span className="text-lg font-black text-indigo-950 font-mono leading-none mt-0.5 block">{aggregatedStats.area.toFixed(3)} m²</span>
                            <span className="text-[9px] text-indigo-400 font-mono font-bold">~ {aggregatedStats.weight.toFixed(1)} kg</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex py-1 justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setWizardEditingItem(null);
                            setIsWizardOpen(true);
                          }}
                          className="px-4 py-2.5 border-2 border-dashed border-neutral-300 hover:border-black hover:bg-white text-neutral-600 font-bold text-xs rounded-xl transition flex items-center gap-1.5 w-full justify-center cursor-pointer select-none"
                        >
                          <Plus className="w-4 h-4 text-neutral-650" />
                          Konfigurovat další stínění (Zaměřovací dotazník)
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>


            {/* Right Sidebar Workspace (4/12 weight): Customer Information, Aggregates & Actions */}
            <div className="lg:col-span-4 space-y-4">

              {/* Technician & Client Information card */}
              <div className="bg-white rounded-2xl border border-neutral-200/55 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-100 select-none">
                  <UserCheck className="w-4 h-4 text-neutral-700 shrink-0" />
                  <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider">Zaměření & Zákazník</h3>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Zaměřující technik (Vy):
                    </label>
                    <input
                      type="text"
                      value={technicianName}
                      onChange={(e) => setTechnicianName(e.target.value)}
                      placeholder="Jméno technika QAPI"
                      className="w-full text-xs rounded-xl bg-[#F2F2F7] border border-neutral-200 p-2.5 text-neutral-800 font-medium placeholder:text-neutral-400 focus:bg-white focus:border-black focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2 border-t border-neutral-100/60 space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        Jméno zákazníka:
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Jan Novák, s.r.o."
                        className="w-full text-xs rounded-xl bg-[#F2F2F7] border border-neutral-200 p-2.5 text-neutral-800 font-medium placeholder:text-neutral-400 focus:bg-white focus:border-black focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        Telefon zákazníka:
                      </label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+420 777 123 456"
                        className="w-full text-xs rounded-xl bg-[#F2F2F7] border border-neutral-200 p-2.5 text-neutral-800 font-medium placeholder:text-neutral-400 focus:bg-white focus:border-black focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        Adresa montáže / stavby:
                      </label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Spálená 12, Praha 1"
                        className="w-full text-xs rounded-xl bg-[#F2F2F7] border border-neutral-200 p-2.5 text-neutral-800 font-medium placeholder:text-neutral-400 focus:bg-white focus:border-black focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Send & SMTP Dispatch Action Card */}
              <div className="bg-white rounded-2xl border border-neutral-200/55 p-5 shadow-xs space-y-4 font-semibold text-xs text-neutral-700">
                <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-100 select-none">
                  <Mail className="w-4 h-4 text-neutral-700 shrink-0" />
                  <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider">Odeslání protokolu e-mailem</h3>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      E-mail příjemce (Zákazník):
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="klient@podnik.cz"
                      className="w-full text-xs rounded-xl bg-[#F2F2F7] border border-neutral-200 p-2.5 text-neutral-850 font-medium placeholder:text-neutral-400 focus:bg-white focus:border-black focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Obchodník v kopii (CC):
                    </label>
                    <input
                      type="email"
                      value={ccEmail}
                      onChange={(e) => setCcEmail(e.target.value)}
                      placeholder="obchodnik@qapi.cz"
                      className="w-full text-xs rounded-xl bg-[#F2F2F7] border border-neutral-200 p-2.5 text-neutral-850 font-medium placeholder:text-neutral-400 focus:bg-white focus:border-black focus:outline-hidden font-mono"
                    />
                    <span className="block text-[9px] text-neutral-400 font-medium leading-tight mt-1.5">
                      Obchodní zástupce automaticky obdrží kopii protokolu o měření.
                    </span>
                  </div>
                </div>

                {/* Technical validity checks indicator banner */}
                {items.length > 0 && allAlerts.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t border-neutral-100 select-none">
                    <div className="text-[9px] font-black text-red-650 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Rozměrové vady ({allAlerts.length})
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-normal font-semibold">
                      Prosím klikněte na "Upravit" u červeně zvýrazněných položek a sjednoťte je s parametry katalogu QAPI.
                    </p>
                  </div>
                ) : items.length > 0 ? (
                  <div className="p-2.5 rounded-lg bg-neutral-900 text-white text-[10px] font-black flex items-center gap-2 border border-black/10 select-none">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neutral-200 shrink-0" />
                    Všechny prvky odpovídají limitům QAPI!
                  </div>
                ) : null}

                {/* Master Call-To-Action controls */}
                <div className="pt-1 space-y-2 select-none">
                  <button
                    onClick={handleSendEmail}
                    disabled={items.length === 0 || hasErrors || isSendingEmail || !recipientEmail || !recipientEmail.includes("@")}
                    className={`w-full py-3 px-4 font-bold text-xs rounded-xl transition duration-150 flex items-center justify-center gap-2 ${
                      items.length === 0 || hasErrors || isSendingEmail || !recipientEmail || !recipientEmail.includes("@")
                        ? 'bg-neutral-100 text-neutral-400 border border-neutral-200/50 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-97 cursor-pointer'
                    }`}
                  >
                    {isSendingEmail ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-white animate-spin" />
                        Odesílám přes SMTP...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-white" />
                        Odeslat měření e-mailem
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      playTactileClick();
                      setIsPrintOverlayOpen(true);
                    }}
                    disabled={items.length === 0}
                    className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl border transition duration-150 flex items-center justify-center gap-2 ${
                      items.length === 0
                        ? 'bg-[#F2F2F7] text-neutral-300 border-neutral-200 cursor-not-allowed'
                        : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-300 cursor-pointer active:scale-97 shadow-3xs'
                    }`}
                  >
                    <Printer className="w-4 h-4 text-neutral-600" />
                    Ukázat PDF náhled k tisku
                  </button>

                  {hasErrors && (
                    <span className="block text-[9px] text-red-650 text-center mt-2 font-bold leading-normal uppercase">
                      🔒 Odeslání je uzamčeno z důvodu vad.
                    </span>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Corporate QAPI footer */}
      <footer className="mt-12 bg-white border-t border-slate-200/60 py-6 text-center text-[11px] text-slate-450 px-4 print:hidden">
        <div className="max-w-7xl mx-auto space-y-1">
          <p className="font-bold text-slate-700">QAPI Shading Systems Q2/2026 Core Engine</p>
          <p className="text-slate-400 font-mono">
            Uživatel: {navigator.userAgent.includes('Mobile') ? 'Mobilní klient' : 'Tablet/PC'} • Aktivní normy a standardy QAPI
          </p>
        </div>
      </footer>

      {/* PERFECT PRINT PREVIEW OVERLAY */}
      {isPrintOverlayOpen && (
        <div id="print-overlay" className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 overflow-y-auto p-4 sm:p-10 flex justify-center [color-scheme:light] print:absolute print:inset-0 print:p-0 print:bg-white print:z-auto print:overflow-visible">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col print:shadow-none print:border-none print:rounded-none">
            {/* Control bar - hidden in print */}
            <div className="bg-slate-900 px-6 py-4 flex flex-col md:flex-row items-center justify-between text-white shrink-0 print:hidden select-none gap-4">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span className="font-extrabold text-xs uppercase tracking-tight text-indigo-100">Zaměřovací protokol a stínicí prvky QAPI</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { playTactileClick(); window.print(); }}
                  className="px-4 py-1.8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Tisk nebo uložit do PDF
                </button>
                <button
                  onClick={() => { playTactileClick(); setIsPrintOverlayOpen(false); }}
                  className="px-3.5 py-1.8 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition font-black text-xs cursor-pointer active:scale-95"
                >
                  Zavřít náhled
                </button>
              </div>
            </div>

            {/* Printable Content page */}
            <div className="flex-1 p-6 sm:p-12 space-y-8 overflow-y-auto print:overflow-visible print:p-0 print:text-black">
              {/* Header */}
              <div className="flex justify-between items-start gap-4 border-b border-slate-205 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 bg-indigo-650 flex items-center justify-center rounded-xl text-white font-extrabold uppercase text-xs print:bg-black">
                      QAPI
                    </div>
                    <div>
                      <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none print:text-black">QAPI STÍNICÍ TECHNIKA</h1>
                      <span className="text-[9px] text-slate-400 font-bold print:text-slate-500">www.qapi.cz • Objednávkový systém</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-lg print:border print:border-black print:bg-white">
                    {orderNumber || 'NÁVRH OBJEDNÁVKY'}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 print:text-slate-505">Datum: {new Date().toLocaleDateString('cs-CZ')}</p>
                </div>
              </div>

              {/* Customer and Seller metadata card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 print:bg-white print:border-slate-300">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest block print:text-indigo-950">Zákazník a zaměření</span>
                  <div className="text-xs space-y-1 font-semibold text-slate-700 print:text-black">
                    <p className="font-black text-slate-900 text-sm">{customerName || 'Nespecifikovaný zákazník'}</p>
                    {customerPhone && <p>Telefon: <span className="font-mono">{customerPhone}</span></p>}
                    {customerAddress && <p>Adresa montáže: {customerAddress}</p>}
                    <p className="pt-2 border-t border-slate-200 mt-2 font-bold text-slate-800">
                      Zaměřující technik: <span className="text-indigo-650 print:text-black font-extrabold">{technicianName || 'Nespecifikováno'}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6 print:border-slate-350">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block print:text-slate-600">SPECIFIKACE ZAKÁZKY VÝROBY</span>
                  <div className="text-xs space-y-1 text-slate-700 print:text-black font-medium">
                    <p>Výrobní číslo zakázky: <span className="font-mono font-bold text-slate-900">{orderNumber}</span></p>
                    <p>Počet nakonfigurovaných oken: <span className="font-bold text-slate-900">{items.length} ks</span></p>
                    <p>Celková váha stínění: <span className="font-bold text-slate-900">{aggregatedStats.weight.toFixed(1)} kg</span></p>
                    {generalNotes ? (
                      <p className="pt-1.5 border-t border-slate-150 mt-1.5 text-slate-500 font-normal">
                        Poznámka k nakládce: <span className="font-medium text-slate-800 break-words">{generalNotes}</span>
                      </p>
                    ) : (
                      <p className="text-slate-400 italic font-normal">Bez dodatečných poznámek</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-200 print:text-black print:border-black">
                  Přehled stínicích prvků ({items.length})
                </h3>

                <div className="overflow-hidden border border-slate-200 rounded-xl print:rounded-none">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-650 font-black border-b border-slate-200 select-none print:bg-slate-50 print:text-black">
                        <th className="p-3 w-10 text-center font-mono">#</th>
                        <th className="p-3">Popis prvku a parametry</th>
                        <th className="p-3 text-center">Š x V (mm)</th>
                        <th className="p-3 text-center">Plocha / Ks</th>
                        <th className="p-3 text-center">Množství</th>
                        <th className="p-3 text-right">Celková plocha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 print:divide-slate-300">
                      {items.map((item, idx) => {
                        const priceSingle = calculateItemPrice({ ...item, quantity: 1 });
                        const priceTotal = calculateItemPrice(item);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 bg-white">
                            <td className="p-3 text-center font-mono font-bold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="p-3 space-y-1">
                              <p className="font-extrabold text-slate-900 print:text-black">
                                {getProductTypeLabel(item.productType)}
                              </p>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500 font-medium">
                                <span>Lamela: <strong className="text-slate-700 font-mono">{item.lamellaSize}</strong></span>
                                <span>Barva: <strong className="text-indigo-700 print:text-slate-800">{item.lamellaColor}</strong> / <strong className="text-slate-700">{item.topProfileColor}</strong></span>
                                <span>Ovládání: <strong className="text-slate-700 font-mono">{item.controlSide}</strong></span>
                                {item.isCelostin && <span className="text-indigo-650 font-bold">Celostín</span>}
                                {item.isSlant && <span className="text-amber-700 font-bold">Šikmý atyp</span>}
                                {item.hasGearbox && <span className="text-emerald-700 font-bold">S převodovkou</span>}
                                {item.awningWindSensor && <span className="text-emerald-800 font-bold">Větrný senzor</span>}
                              </div>
                              {item.notes && <p className="text-[10px] italic text-slate-400 font-medium">Poznámka: "{item.notes}"</p>}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-slate-800">
                              {item.width} × {item.height}
                            </td>
                            <td className="p-3 text-center font-mono text-slate-600">
                              {((item.width * item.height) / 1000000).toFixed(3)} m²
                            </td>
                            <td className="p-3 text-center font-bold text-slate-800">
                              {item.quantity} ks
                            </td>
                            <td className="p-3 text-right font-mono font-extrabold text-slate-900">
                              {((item.width * item.height * item.quantity) / 1000000).toFixed(3)} m²
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Technical summary block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-500 space-y-2 font-medium">
                  <p className="font-bold text-slate-800 text-sm print:text-black">Technická specifikace a doložka</p>
                  <p className="leading-relaxed">
                    Tento dokument slouží jako zaměřovací a předávací protokol stínicích prvků QAPI. Uvedené rozměry a parametry plně odpovídají výrobní normativě výrobce a byly prověřeny integrovaným bezpečnostním validátorem.
                  </p>
                  {generalNotes && (
                    <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-655 italic print:bg-white print:border-slate-300">
                      <span className="font-bold text-slate-600 block uppercase text-[8px] tracking-wider mb-1">Poznámka k zakázce:</span>
                      "{generalNotes}"
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 font-semibold text-xs text-slate-705 print:bg-white print:border-slate-350">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Bilance zakázky</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Celkový počet pozic:</span>
                    <span className="font-mono text-slate-800 font-bold">{items.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Celkový počet kusů:</span>
                    <span className="font-mono text-slate-800 font-bold">{aggregatedStats.count} ks</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Celková plocha stínění:</span>
                    <span className="font-mono text-indigo-650 font-black text-sm">{aggregatedStats.area.toFixed(3)} m²</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Celková hmotnost stínění:</span>
                    <span className="font-mono text-slate-800 font-bold">{aggregatedStats.weight.toFixed(1)} kg</span>
                  </div>
                </div>
              </div>

              {/* Signature section */}
              <div className="grid grid-cols-2 gap-12 pt-14 border-t border-slate-200 text-center text-xs text-slate-450 select-none page-break-inside-avoid print:pt-14">
                <div className="space-y-12">
                  <div className="border-b border-dashed border-slate-350 mx-auto w-48 h-8"></div>
                  <p className="font-bold text-slate-700">Podpis TECHNIKA</p>
                </div>
                <div className="space-y-12">
                  <div className="border-b border-dashed border-slate-350 mx-auto w-48 h-8"></div>
                  <p className="font-bold text-slate-700">Podpis OBCHODNÍKA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
