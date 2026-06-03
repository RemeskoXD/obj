import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Wrench,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash,
  Maximize2,
  Palette,
  Cpu,
  Bookmark,
  Sparkles,
  Info
} from 'lucide-react';
import { BlindOrderItem, ProductCategory, ProductType, ControlSide } from '../types';
import {
  LAMELLA_COLORS,
  PROFILE_COLORS,
  validateBlindItem,
  calculateItemPrice,
  calculateItemWeight,
  getProductTypeLabel
} from '../constants';
import { playTactileClick, playErrorHum } from '../utils/sound';
import BlindLivePreview from './BlindLivePreview';

interface OrderStepWizardProps {
  onSaveItem: (item: BlindOrderItem) => void;
  onCancel: () => void;
  editingItem?: BlindOrderItem | null;
}

const generateId = () => 'item_' + Math.random().toString(36).substring(2, 9);

export interface ProductLimits {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export function getLimitsForProduct(
  productType: ProductType,
  lamellaSize?: string,
  hasGearbox?: boolean,
  hasBrake?: boolean
): ProductLimits {
  switch (productType) {
    case 'ISOLINE':
    case 'ISOLINE_LOCO':
      return {
        minWidth: lamellaSize === '16x0.21' ? 330 : 200,
        maxWidth: 2400,
        minHeight: 300,
        maxHeight: 2500,
      };
    case 'ISOLINE_PRIM':
      return {
        minWidth: hasGearbox ? 350 : hasBrake ? 330 : 240,
        maxWidth: 2200,
        minHeight: 300,
        maxHeight: 2400,
      };
    case 'ISOLINE_ECO':
      return {
        minWidth: lamellaSize === '16x0.21' ? 330 : 200,
        maxWidth: 2400,
        minHeight: 300,
        maxHeight: 2500,
      };
    case 'HZ_25_19':
    case 'HZ_27_19':
      return {
        minWidth: 150,
        maxWidth: 2000,
        minHeight: 300,
        maxHeight: 2500,
      };
    case 'EXT_Z90':
    case 'EXT_S90':
    case 'EXT_C80':
    case 'EXT_F80':
      return {
        minWidth: 400,
        maxWidth: 4500,
        minHeight: 500,
        maxHeight: 4000,
      };
    case 'AWN_CASABLANCA':
    case 'AWN_DAKOTA':
      return {
        minWidth: 2000,
        maxWidth: 6000,
        minHeight: 1500,
        maxHeight: 3500,
      };
    case 'AWN_ITALIA':
      return {
        minWidth: 1000,
        maxWidth: 5000,
        minHeight: 1000,
        maxHeight: 1800,
      };
    case 'WOOD_25':
    case 'WOOD_35':
      return {
        minWidth: 400,
        maxWidth: 1800,
        minHeight: 400,
        maxHeight: 2200,
      };
    case 'WOOD_50':
      return {
        minWidth: 500,
        maxWidth: 2400,
        minHeight: 500,
        maxHeight: 3000,
      };
    case 'VERT_STOFF_89':
    case 'VERT_STOFF_127':
      return {
        minWidth: 400,
        maxWidth: 5800,
        minHeight: 500,
        maxHeight: 4500,
      };
    case 'VERT_PVC':
      return {
        minWidth: 400,
        maxWidth: 4000,
        minHeight: 500,
        maxHeight: 3000,
      };
    case 'ROLL_OPTIMA':
      return {
        minWidth: 300,
        maxWidth: 1500,
        minHeight: 300,
        maxHeight: 2000,
      };
    case 'ROLL_ROLOLITE':
      return {
        minWidth: 400,
        maxWidth: 2000,
        minHeight: 400,
        maxHeight: 2500,
      };
    case 'SCREEN_FIX_W':
      return {
        minWidth: 300,
        maxWidth: 1800,
        minHeight: 300,
        maxHeight: 2000,
      };
    case 'SCREEN_DOOR_OPEN':
      return {
        minWidth: 500,
        maxWidth: 1200,
        minHeight: 1000,
        maxHeight: 2400,
      };
    case 'SCREEN_DOOR_SLIDE':
      return {
        minWidth: 600,
        maxWidth: 2000,
        minHeight: 1000,
        maxHeight: 2500,
      };
    case 'SCREEN_DOOR_PLEAT':
      return {
        minWidth: 500,
        maxWidth: 3000,
        minHeight: 1000,
        maxHeight: 2800,
      };
    default:
      return {
        minWidth: 200,
        maxWidth: 2400,
        minHeight: 300,
        maxHeight: 2500,
      };
  }
}

export default function OrderStepWizard({ onSaveItem, onCancel, editingItem }: OrderStepWizardProps) {
  // Current active step from 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Default initial wizard state
  const [category, setCategory] = useState<ProductCategory>('HORIZONTAL');
  const [productType, setProductType] = useState<ProductType>('ISOLINE');
  const [width, setWidth] = useState<number>(1000);
  const [height, setHeight] = useState<number>(1200);
  const [quantity, setQuantity] = useState<number>(1);
  const [lamellaSize, setLamellaSize] = useState<string>('25x0.18');
  const [lamellaColor, setLamellaColor] = useState<string>('9010');
  const [topProfileColor, setTopProfileColor] = useState<string>('RAL9010');
  const [bottomProfileColor, setBottomProfileColor] = useState<string>('RAL9010');
  const [controlSide, setControlSide] = useState<string>('RP');
  const [isCelostin, setIsCelostin] = useState<boolean>(false);
  const [isSlant, setIsSlant] = useState<boolean>(false);
  const [hasBrake, setHasBrake] = useState<boolean>(false);
  const [hasGearbox, setHasGearbox] = useState<boolean>(false);
  const [motorBrand, setMotorBrand] = useState<'SOMFY' | 'ELERO' | 'MOCK' | 'NONE'>('NONE');
  const [awningWindSensor, setAwningWindSensor] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  
  // Active help tooltip identifiers
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  
  // Custom non-blocking notifications
  const [stepNotification, setStepNotification] = useState<{message: string, isError: boolean} | null>(null);

  // Active technical size ranges based on modern QAPI configuration
  const activeLimits = getLimitsForProduct(productType, lamellaSize, hasGearbox, hasBrake);

  // Clear notification on step change
  useEffect(() => {
    setStepNotification(null);
  }, [currentStep]);

  // Load editing item if defined
  useEffect(() => {
    if (editingItem) {
      setCategory(editingItem.category || 'HORIZONTAL');
      setProductType(editingItem.productType);
      setWidth(editingItem.width);
      setHeight(editingItem.height);
      setQuantity(editingItem.quantity);
      setLamellaSize(editingItem.lamellaSize);
      setLamellaColor(editingItem.lamellaColor);
      setTopProfileColor(editingItem.topProfileColor);
      setBottomProfileColor(editingItem.bottomProfileColor);
      setControlSide(editingItem.controlSide);
      setIsCelostin(editingItem.isCelostin);
      setIsSlant(editingItem.isSlant);
      setHasBrake(editingItem.hasBrake);
      setHasGearbox(editingItem.hasGearbox);
      setMotorBrand(editingItem.motorBrand || 'NONE');
      setAwningWindSensor(!!editingItem.awningWindSensor);
      setNotes(editingItem.notes || '');
    }
  }, [editingItem]);

  // Helper to clamp dimensions when products/categories change
  const clampDimensionsForType = (type: ProductType, currentW: number, currentH: number) => {
    const limits = getLimitsForProduct(type);
    const newW = Math.max(limits.minWidth, Math.min(limits.maxWidth, currentW));
    const newH = Math.max(limits.minHeight, Math.min(limits.maxHeight, currentH));
    setWidth(newW);
    setHeight(newH);
  };

  // Adjust defaults when Category changes
  const handleCategorySelect = (selectedCat: ProductCategory) => {
    setCategory(selectedCat);
    let defaultType: ProductType = 'ISOLINE';
    if (selectedCat === 'HORIZONTAL') {
      defaultType = 'ISOLINE';
      setProductType(defaultType);
      setLamellaSize('25x0.18');
      setLamellaColor('9010');
      setTopProfileColor('RAL9010');
      setBottomProfileColor('RAL9010');
      setControlSide('RP');
    } else if (selectedCat === 'WOODEN') {
      defaultType = 'WOOD_25';
      setProductType(defaultType);
      setLamellaSize('25 mm');
      setLamellaColor('W95'); // Dub / Zlatý dub
      setTopProfileColor('RAL8017');
      setBottomProfileColor('RAL8017');
      setControlSide('RP');
    } else if (selectedCat === 'VERTICAL') {
      defaultType = 'VERT_STOFF_89';
      setProductType(defaultType);
      setLamellaSize('89 mm');
      setLamellaColor('9010');
      setTopProfileColor('RAL9010');
      setBottomProfileColor('RAL9010');
      setControlSide('RP');
    } else if (selectedCat === 'ROLETKY') {
      defaultType = 'ROLL_OPTIMA';
      setProductType(defaultType);
      setLamellaSize('Tkanina Standard');
      setLamellaColor('9010');
      setTopProfileColor('RAL9010');
      setBottomProfileColor('RAL9010');
      setControlSide('RP');
    } else if (selectedCat === 'SCREENS') {
      defaultType = 'SCREEN_FIX_W';
      setProductType(defaultType);
      setLamellaSize('Síťovina šedá');
      setLamellaColor('9010');
      setTopProfileColor('RAL9010');
      setBottomProfileColor('RAL9010');
      setControlSide('none');
    } else if (selectedCat === 'EXTERNAL') {
      defaultType = 'EXT_Z90';
      setProductType(defaultType);
      setLamellaSize('Z90');
      setLamellaColor('9006');
      setTopProfileColor('RAL9006');
      setBottomProfileColor('RAL9006');
      setControlSide('P');
    } else if (selectedCat === 'AWNING') {
      defaultType = 'AWN_CASABLANCA';
      setProductType(defaultType);
      setLamellaSize('Tkanina Premium');
      setLamellaColor('AWN_STD_BG');
      setTopProfileColor('AWN_ALU_W');
      setBottomProfileColor('AWN_ALU_W');
      setControlSide('P'); // manually operated arm crank by default
    }
    
    // Clamp dimensions to the bounds of the new default product type
    clampDimensionsForType(defaultType, width, height);
    setCurrentStep(2); // Auto proceed to step 2 code selection
  };

  // Adjust defaults when ProductType changes
  const handleTypeSelect = (selectedType: ProductType) => {
    setProductType(selectedType);

    if (selectedType === 'ISOLINE_ECO') {
      setControlSide('P');
      setLamellaSize('25x0.18');
    } else if (selectedType.startsWith('HZ_')) {
      setControlSide('IB');
      setLamellaSize('25x0.18');
    } else if (selectedType.startsWith('WOOD_')) {
      setControlSide('RP');
      if (selectedType === 'WOOD_50') setLamellaSize('50 mm');
      else if (selectedType === 'WOOD_35') setLamellaSize('35 mm');
      else setLamellaSize('25 mm');
    } else if (selectedType.startsWith('VERT_')) {
      setControlSide('RP');
      if (selectedType === 'VERT_STOFF_127') setLamellaSize('127 mm');
      else if (selectedType === 'VERT_PVC') setLamellaSize('89 mm PVC');
      else setLamellaSize('89 mm');
    } else if (selectedType.startsWith('ROLL_')) {
      setControlSide('RP');
      setLamellaSize('Tkanina Standard');
    } else if (selectedType.startsWith('SCREEN_')) {
      setControlSide('none');
      setLamellaSize('Síťovina šedá');
    } else if (selectedType.startsWith('EXT_')) {
      // External defaults
      setControlSide('MOTOR_IO'); // default to high utility motor
      if (selectedType === 'EXT_Z90') setLamellaSize('Z90');
      else if (selectedType === 'EXT_S90') setLamellaSize('S90');
      else if (selectedType === 'EXT_C80') setLamellaSize('C80');
      else if (selectedType === 'EXT_F80') setLamellaSize('F80');
    } else if (selectedType.startsWith('AWN_')) {
      setControlSide('MOTOR_IO');
      setLamellaSize('Tkanina Premium');
    } else {
      setControlSide('RP');
    }

    // Clamp dimensions to the bounds of the newly selected product type
    clampDimensionsForType(selectedType, width, height);
    setCurrentStep(3); // proceed to dimensions step
  };

  // Construct standard BlindOrderItem payload for real-time computations
  const currentPayloadItem: BlindOrderItem = {
    id: editingItem?.id || 'wizard_temp',
    category,
    productType,
    width,
    height,
    quantity,
    lamellaSize,
    lamellaColor,
    topProfileColor,
    bottomProfileColor,
    controlSide,
    isCelostin,
    isSlant,
    hasBrake,
    hasGearbox,
    motorBrand,
    awningWindSensor,
    notes
  };

  // Run technical validations
  const alerts = validateBlindItem(currentPayloadItem);
  const validationErrors = alerts.filter(al => al.type === 'error');
  const validationWarnings = alerts.filter(al => al.type === 'warning');

  const stepDetails = [
    { nr: 1, title: 'Kategorie stínění', desc: 'Typ stínicí techniky' },
    { nr: 2, title: 'Model a systém', desc: 'Série a konstrukční profil' },
    { nr: 3, title: 'Rozměry a počet Kusů', desc: 'Přesné rozměry v milimetrech' },
    { nr: 4, title: 'Barvy a design', desc: 'Lamel, tkaniny a komponentů' },
    { nr: 5, title: 'Ovládání a výbava', desc: 'Brzda, kliky, motor, čidla' },
    { nr: 6, title: 'Závěrečný souhrn', desc: 'Kontrola prvků, odhad ceny' }
  ];

  // Logic to save the item
  const handleFinalSave = () => {
    if (validationErrors.length > 0) {
      setStepNotification({ message: 'Tento prvek nelze uložit kvůli závažným konstrukčním nebo rozměrovým chybám.', isError: true });
      return;
    }
    const finalItem: BlindOrderItem = {
      ...currentPayloadItem,
      id: editingItem?.id || generateId()
    };
    onSaveItem(finalItem);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/50 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[580px]">
      
      {/* Sidebar step status listing */}
      <div className="w-full md:w-80 bg-[#1C1C1E] text-white p-6 justify-between flex flex-col border-r border-neutral-800">
        <div className="space-y-6">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#007AFF]/90">Dotazník na míru QAPI</span>
            <h2 className="text-base font-bold text-neutral-100 tracking-tight flex items-center gap-2 mt-1 select-none">
              <ClipboardList className="w-4 h-4 text-[#007AFF]" />
              {editingItem ? 'Úprava prvku stínění' : 'Nový prvek stínění'}
            </h2>
            <p className="text-[11px] text-neutral-400 mt-2 font-medium leading-relaxed">
              Průvodce krok za krokem zaručuje bezchybné objednání i podpora v terénu pro nezkušené prodejce.
            </p>
          </div>

          {/* Stepper display indicators (Adaptive Desktop/Mobile) */}
          {/* Mobile version: Compact horizontal touch-friendly row */}
          <div className="flex md:hidden items-center justify-between gap-1.5 bg-[#2C2C2E] p-2 rounded-xl border border-neutral-800 shadow-inner select-none">
            {stepDetails.map((step) => {
              const isCompleted = step.nr < currentStep;
              const isActive = step.nr === currentStep;

              return (
                <button
                  key={step.nr}
                  onClick={() => {
                    if (step.nr < currentStep) {
                      playTactileClick();
                      setCurrentStep(step.nr);
                    }
                  }}
                  disabled={step.nr > currentStep}
                  className="flex-1 flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed text-center select-none"
                >
                  <div className={`h-8 w-8 rounded-full text-xs font-mono font-bold flex items-center justify-center border transition-all ${
                    isActive
                      ? 'bg-[#007AFF] text-white border-transparent shadow-sm scale-105'
                      : isCompleted
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-300'
                      : 'border-neutral-800 text-neutral-600 bg-neutral-900'
                  }`}>
                    {isCompleted ? '✓' : step.nr}
                  </div>
                  <span className={`text-[8px] font-bold uppercase tracking-wider truncate max-w-[48px] ${isActive ? 'text-[#007AFF]' : 'text-neutral-500'}`}>
                    {step.title.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop version: Complete vertical list with full details */}
          <div className="hidden md:block space-y-3">
            {stepDetails.map((step) => {
              const isCompleted = step.nr < currentStep;
              const isActive = step.nr === currentStep;

              return (
                <button
                  key={step.nr}
                  onClick={() => {
                    if (step.nr < currentStep) {
                      playTactileClick();
                      setCurrentStep(step.nr);
                    }
                  }}
                  disabled={step.nr > currentStep}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition text-left cursor-pointer disabled:cursor-not-allowed group ${
                    isActive
                      ? 'bg-neutral-800 text-white font-semibold'
                      : isCompleted
                      ? 'text-neutral-300 hover:bg-neutral-800/40'
                      : 'text-neutral-500'
                  }`}
                >
                  <div className={`h-6 w-6 rounded-full text-xs font-mono font-bold flex items-center justify-center shrink-0 border transition ${
                    isActive
                      ? 'bg-[#007AFF] text-white border-transparent'
                      : isCompleted
                      ? 'bg-neutral-800 border-neutral-705 text-neutral-300'
                      : 'border-neutral-800 text-neutral-600'
                  }`}>
                    {isCompleted ? '✓' : step.nr}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold tracking-tight">{step.title}</div>
                    <div className="text-[10px] text-neutral-400 font-normal leading-tight group-hover:text-neutral-300 transition">
                      {step.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live area estimation card at the footer step status */}
        <div className="mt-6 border-t border-neutral-800 pt-4 space-y-2 select-none">
          <div className="flex justify-between items-baseline text-xs text-neutral-400 font-medium font-bold">
            <span>Rozměr:</span>
            <span className="font-mono text-neutral-300 font-bold">{width} × {height} mm</span>
          </div>
          <div className="flex justify-between items-baseline text-xs text-neutral-400">
            <span>Plocha kusu:</span>
            <span className="font-mono text-neutral-300 font-bold">{((width * height) / 1000000).toFixed(3)} m²</span>
          </div>
          {quantity > 1 && (
            <div className="flex justify-between items-baseline text-xs text-neutral-400">
              <span>Celková plocha ({quantity} ks):</span>
              <span className="font-mono text-indigo-400 font-bold">{(((width * height) / 1000000) * quantity).toFixed(3)} m²</span>
            </div>
          )}
          <div className="flex justify-between items-baseline text-xs text-neutral-400">
            <span>Hmotnost:</span>
            <span className="font-mono text-neutral-300 font-bold">{calculateItemWeight(currentPayloadItem)} kg</span>
          </div>
        </div>

        {/* Live CSS/SVG schematic rendering for tablets and desktops */}
        {currentStep >= 3 && (
          <div className="mt-5 hidden md:block border-t border-neutral-800 pt-5">
            <BlindLivePreview item={currentPayloadItem} />
          </div>
        )}
      </div>

      {/* Main interactive questionnaire steps display body */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between bg-white text-slate-800">
        
        <div className="space-y-6">
          {/* Active step head label */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400">Průvodce • Dotazník {currentStep}/6</span>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {stepDetails[currentStep - 1].title}
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
            >
              Stornovat průvodce
            </button>
          </div>

          {/* Verification Warning notice inside any step if width error exists */}
          {currentStep > 2 && alerts.length > 0 && (
            <div className={`p-3 rounded-xl flex items-start gap-2.5 text-xs border ${
              validationErrors.length > 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-800 border-amber-100'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Technické upozornění QAPI:</span> {alerts[0].message}
              </div>
            </div>
          )}

          {/* STEP 1: Select Shading Category */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500 leading-relaxed">
                Vyberte základní kategorii výrobku. Každá kategorie má specifické rozměrové tolerance a barevné vzorníky QAPI.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {/* Horizontal Blinds */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('HORIZONTAL')}
                  className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between h-40 cursor-pointer ${
                    category === 'HORIZONTAL'
                      ? 'border-[#007AFF] bg-neutral-50 shadow-2xs'
                      : 'border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50/40'
                  }`}
                >
                  <div className="h-10 w-10 bg-neutral-100 text-neutral-800 rounded-xl flex items-center justify-center font-bold shadow-3xs select-none">
                    🪟
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Horizontální žaluzie</h4>
                    <p className="text-[10px] text-neutral-450 mt-1 leading-tight">
                      Interiérové huliníkové žaluzie Isoline, Isoline Loco, Prim a klasické meziskelní HZ.
                    </p>
                  </div>
                  {category === 'HORIZONTAL' && (
                    <span className="absolute top-4 right-4 bg-[#007AFF] text-white text-[9px] font-bold p-1 px-2 rounded-full leading-none">
                      Zvoleno
                    </span>
                  )}
                </button>

                {/* Wooden Blinds */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('WOODEN')}
                  className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between h-40 cursor-pointer ${
                    category === 'WOODEN'
                      ? 'border-[#007AFF] bg-neutral-50 shadow-2xs'
                      : 'border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50/40'
                  }`}
                >
                  <div className="h-10 w-10 bg-neutral-100 text-neutral-800 rounded-xl flex items-center justify-center font-bold shadow-3xs select-none">
                    🪵
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Dřevěné žaluzie</h4>
                    <p className="text-[10px] text-neutral-450 mt-1 leading-tight">
                      Prémiové interiérové dřevěné žaluzie v provedeních lamel 25 mm, 35 mm a robustní 50 mm.
                    </p>
                  </div>
                  {category === 'WOODEN' && (
                    <span className="absolute top-4 right-4 bg-[#007AFF] text-white text-[9px] font-bold p-1 px-2 rounded-full leading-none">
                      Zvoleno
                    </span>
                  )}
                </button>

                {/* Vertical Shading */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('VERTICAL')}
                  className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between h-40 cursor-pointer ${
                    category === 'VERTICAL'
                      ? 'border-[#007AFF] bg-neutral-50 shadow-2xs'
                      : 'border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50/40'
                  }`}
                >
                  <div className="h-10 w-10 bg-neutral-100 text-neutral-800 rounded-xl flex items-center justify-center font-bold shadow-3xs select-none">
                    ↔️
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Vertikální stínění</h4>
                    <p className="text-[10px] text-neutral-450 mt-1 leading-tight">
                      Elegantní vertikální látkové i omyvatelné PVC žaluzie pro zastínění velkých ploch a francouzských dveří.
                    </p>
                  </div>
                  {category === 'VERTICAL' && (
                    <span className="absolute top-4 right-4 bg-[#007AFF] text-white text-[9px] font-bold p-1 px-2 rounded-full leading-none">
                      Zvoleno
                    </span>
                  )}
                </button>

                {/* Textile Roller Blinds */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('ROLETKY')}
                  className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between h-40 cursor-pointer ${
                    category === 'ROLETKY'
                      ? 'border-[#007AFF] bg-neutral-50 shadow-2xs'
                      : 'border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50/40'
                  }`}
                >
                  <div className="h-10 w-10 bg-neutral-100 text-neutral-800 rounded-xl flex items-center justify-center font-bold shadow-3xs select-none">
                    📜
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Textilní roletky</h4>
                    <p className="text-[10px] text-neutral-450 mt-1 leading-tight">
                      Látkové rolety Optima v krycích lištách s bočním vedením a univerzální volně visící Rololite.
                    </p>
                  </div>
                  {category === 'ROLETKY' && (
                    <span className="absolute top-4 right-4 bg-[#007AFF] text-white text-[9px] font-bold p-1 px-2 rounded-full leading-none">
                      Zvoleno
                    </span>
                  )}
                </button>

                {/* Insect Screens & Door Nets */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('SCREENS')}
                  className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between h-40 cursor-pointer ${
                    category === 'SCREENS'
                      ? 'border-[#007AFF] bg-neutral-50 shadow-2xs'
                      : 'border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50/40'
                  }`}
                >
                  <div className="h-10 w-10 bg-neutral-100 text-neutral-800 rounded-xl flex items-center justify-center font-bold shadow-3xs select-none">
                    🛡️
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Sítě pro okna a dveře</h4>
                    <p className="text-[10px] text-neutral-450 mt-1 leading-tight">
                      Pevné okenní sítě, křídlové otevíravé dveřní sítě a prémiové plisované posuvné bariéry QAPI.
                    </p>
                  </div>
                  {category === 'SCREENS' && (
                    <span className="absolute top-4 right-4 bg-[#007AFF] text-white text-[9px] font-bold p-1 px-2 rounded-full leading-none">
                      Zvoleno
                    </span>
                  )}
                </button>

                {/* External Blinds */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('EXTERNAL')}
                  className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between h-40 cursor-pointer ${
                    category === 'EXTERNAL'
                      ? 'border-[#007AFF] bg-neutral-50 shadow-2xs'
                      : 'border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50/40'
                  }`}
                >
                  <div className="h-10 w-10 bg-neutral-100 text-neutral-800 rounded-xl flex items-center justify-center font-bold shadow-3xs select-none">
                    🏢
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Venkovní žaluzie</h4>
                    <p className="text-[10px] text-neutral-450 mt-1 leading-tight">
                      Robustní venkovní stínění typu Z-90, S-90, C-80, F-80. Vhodné na dálkové motorové ovládání.
                    </p>
                  </div>
                  {category === 'EXTERNAL' && (
                    <span className="absolute top-4 right-4 bg-[#007AFF] text-white text-[9px] font-bold p-1 px-2 rounded-full leading-none">
                      Zvoleno
                    </span>
                  )}
                </button>

                {/* Awnings */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('AWNING')}
                  className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between h-40 cursor-pointer ${
                    category === 'AWNING'
                      ? 'border-[#007AFF] bg-neutral-50 shadow-2xs'
                      : 'border-neutral-200 hover:border-neutral-350 hover:bg-neutral-50/40'
                  }`}
                >
                  <div className="h-10 w-10 bg-neutral-100 text-neutral-800 rounded-xl flex items-center justify-center font-bold shadow-3xs select-none">
                    ⛺
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Markýzy QAPI</h4>
                    <p className="text-[10px] text-neutral-450 mt-1 leading-tight">
                      Luxusní kasetové i kloubové terasové markýzy. Casablanca, Dakota a svislé okenní markýzy Italia.
                    </p>
                  </div>
                  {category === 'AWNING' && (
                    <span className="absolute top-4 right-4 bg-[#007AFF] text-white text-[9px] font-bold p-1 px-2 rounded-full leading-none">
                      Zvoleno
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Product Type & Series Selector */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-normal">
                Vyberte konkrétní konstrukční model QAPI z rodiny stínění <strong className="text-indigo-600">
                  {category === 'HORIZONTAL' ? 'Horizontální' : 
                   category === 'WOODEN' ? 'Dřevěné' : 
                   category === 'VERTICAL' ? 'Vertikální stínění' : 
                   category === 'ROLETKY' ? 'Textilní roletky' : 
                   category === 'SCREENS' ? 'Sítě a dveře' : 
                   category === 'EXTERNAL' ? 'Venkovní' : 'Markýzy'}
                </strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Horizontal Option lists */}
                {category === 'HORIZONTAL' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTypeSelect('ISOLINE')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'ISOLINE' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🪟</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Isoline Standard (řetízková)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Nejžádanější klasická žaluzie, upevněná do zasklívací lišty s převodem na jemný kuličkový řetízek.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('ISOLINE_LOCO')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'ISOLINE_LOCO' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🪵</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Isoline Loco (Plochá lišta)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Díky ploché elegantní krycí liště dokonale splývá s rámem okna. Top design pro eurookna a plastová okna.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('ISOLINE_PRIM')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'ISOLINE_PRIM' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">✨</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Isoline Prim (Prémiový oblý profil)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Luxusní zaoblení lišty, ideální pro velkoformátová okna. Unikátní převodovka s tichou brzdou pro plochy až 5.28 m².</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('ISOLINE_ECO')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'ISOLINE_ECO' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🌿</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Isoline Eco (Tyčka / Brzda)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Cenově nejdostupnější řada ovládání pomocí otočné tyčky s horní plechovou lištou. Použití i do střešních oken.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('HZ_27_19')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'HZ_27_19' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">📐</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">HZ 27x19 (Klasická silnější)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Tradiční meziskelní žaluzie se silnějším profilem. Jediná řada, která plně podporuje atypické šikmé řezy.</p>
                      </div>
                    </button>
                  </>
                )}

                {/* Wooden Options */}
                {category === 'WOODEN' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTypeSelect('WOOD_25')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'WOOD_25' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🪵</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Dřevěná žaluzie 25 mm</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Klasická přírodní lamela 25 mm, vhodná pro standardní křídla oken do šířky 1.8m s příjemným a teplým tónem dřeva.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('WOOD_35')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'WOOD_35' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">📐</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Dřevěná žaluzie 35 mm</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Zlatá střední cesta. Elegantní šířka lamely 35 mm, která dává dokonale vyniknout přírodní textuře dřeva.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('WOOD_50')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'WOOD_50' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">✨</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Prémiová dřevěná žaluzie 50 mm</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Luxusní retro provedení s robustními 50mm lamelami. Ideální pro velká celistvá prosklení, až do celkové plochy 6.0 m².</p>
                      </div>
                    </button>
                  </>
                )}

                {/* Vertical Options */}
                {category === 'VERTICAL' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTypeSelect('VERT_STOFF_89')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'VERT_STOFF_89' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">↔️</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Vertikální žaluzie - látka 89 mm</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Jemnější rozteč lamel o šířce 89 mm. Velký výběr designových protipožárních a dekorativních látek.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('VERT_STOFF_127')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'VERT_STOFF_127' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">📐</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Vertikální žaluzie - látka 127 mm</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Klasická šířka lamely 127 mm pro maximální prostupnost světla při otevření a rychlou instalaci.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('VERT_PVC')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'VERT_PVC' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🧽</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Vertikální žaluzie - omyvatelná PVC</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Vysoce hygienické plastové lamely 89 mm. Nepohlcují prach ani pachy, ideální do ordinací a kuchyní.</p>
                      </div>
                    </button>
                  </>
                )}

                {/* Textile Roller Options */}
                {category === 'ROLETKY' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTypeSelect('ROLL_OPTIMA')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'ROLL_OPTIMA' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">📜</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Textilní roletka Optima v lištách</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Luxusní interiérová roleta s hliníkovým krycím boxem a postranními vodicími lištami s nulovým únikem světla.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('ROLL_ROLOLITE')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'ROLL_ROLOLITE' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🧣</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Textilní roletka Rololite</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Elegantní volně visící látková roletka s řetízkovým převodem bez krycí schránky pro vzdušné stínění.</p>
                      </div>
                    </button>
                  </>
                )}

                {/* Sítě a dveřní stínění Options */}
                {category === 'SCREENS' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTypeSelect('SCREEN_FIX_W')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'SCREEN_FIX_W' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🛡️</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Pevná okenní síť ISSO proti hmyzu</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Základní hliníkový rám s odolnou sklovláknovou síťovinou. Snadná bezvrtná instalace otočnými západkovými klipy.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('SCREEN_DOOR_OPEN')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'SCREEN_DOOR_OPEN' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🚪</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Dveřní síť otvíravá s panty</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Křídlový otočný hliníkový profil s samozavíracími pružinovými panty a magnetickou aretací do terasových a balkónových dveří.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('SCREEN_DOOR_SLIDE')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'SCREEN_DOOR_SLIDE' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">滑</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Dveřní posuvná síť v rámu</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Síťové křídlo tiše se pohybující po pojezdových vodicích lištách. Minimální náročnost na prostor před dveřmi.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('SCREEN_DOOR_PLEAT')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'SCREEN_DOOR_PLEAT' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">✨</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Prémiová plisovaná dveřní síť QAPI</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Luxusní skládaná síťovina se stabilní polohou v jakémkoliv místě roztažení a bezbariérovým spodním prahem 4 mm.</p>
                      </div>
                    </button>
                  </>
                )}

                {/* External Options */}
                {category === 'EXTERNAL' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTypeSelect('EXT_Z90')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'EXT_Z90' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">⭐</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Venkovní žaluzie Z-90 (Zpevněná)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Tvar lamel písmene Z zajišťuje dokonalou těsnost lamel do sebe. Integrované těsnění na vnějším křídle tlumí vítr.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('EXT_S90')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'EXT_S90' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🟢</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Venkovní žaluzie S-90 (Oblá)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Lamely ve tvaru písmene S doplňují organickou a oblou fasádní architekturu. Velmi elegantní stínění.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('EXT_C80')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'EXT_C80' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🌊</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Venkovní žaluzie C-80 (Tradiční)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Klasický zahnutý profil ve tvaru písmene C o šířce lamel 80 mm s možností naklápění oběma směry.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('EXT_F80')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'EXT_F80' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">⬜</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Venkovní žaluzie F-80 (Plochá)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Ploché lamelové zavěšení ideální pro minimalistický vzhled, s menší celkovou výškou staženého balíku lamel.</p>
                      </div>
                    </button>
                  </>
                )}

                {/* Awning Options */}
                {category === 'AWNING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTypeSelect('AWN_CASABLANCA')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'AWN_CASABLANCA' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🏖️</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Casablanca Kasetová markýza</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Luxusní celohliníková kazeta chrání navinutou látku i kloubová ramena před sněhem a nepřízní počasí na zahradách.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('AWN_DAKOTA')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'AWN_DAKOTA' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">💎</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Dakota Prémiová kasetová</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Zesílená konstrukce pro velkoplošné zakrytí velkých teras. Dlouhá trvanlivost s patentovaným pohonem ramen.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('AWN_ITALIA')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'AWN_ITALIA' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🇮🇹</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Svislá okenní markýza Italia</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Skladná a vysoce funkční balkónová a okenní látková zábrana s lehkou konstrukcí bez krycí kazety.</p>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Dimensions & Quantity */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Zadejte celkové rozměry v milimetrech (mm). Široké, vysoké nebo atypické prvky automaticky vyhodnocujeme. Pro rychlou úpravu na mobilních zařízeních použijte okamžitá tlačítka.
              </p>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5">
                
                {/* Width selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-indigo-505" />
                      Šířka prvku (v mm)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setActiveHelp(activeHelp === 'width' ? null : 'width');
                      }}
                      className={`h-5 w-5 rounded-full flex items-center justify-center font-black text-[10px] cursor-pointer transition select-none ${
                        activeHelp === 'width' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                      title="Nápověda pro šířku"
                    >
                      i
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="100"
                      max="10000"
                      value={width || ''}
                      onChange={(e) => setWidth(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-base md:text-sm font-semibold rounded-xl border border-slate-250 bg-white p-3 pr-10 text-slate-800 font-mono text-center focus:border-indigo-500 focus:outline-hidden min-h-[44px]"
                    />
                    <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-bold">mm</span>
                  </div>

                  {activeHelp === 'width' && (
                    <div className="p-3 bg-amber-50 border border-amber-150 rounded-xl text-[10px] text-amber-850 leading-relaxed font-semibold animate-fade-in my-1.55">
                      <strong>📐 Výrobní limit šířky QAPI:</strong>
                      <p className="mt-1">Pro aktuálně vybraný model <span className="font-bold text-indigo-600">({getProductTypeLabel(productType)})</span> je povolená šířka <span className="font-bold underline">{activeLimits.minWidth} – {activeLimits.maxWidth} mm</span>.</p>
                      <ul className="list-disc pl-3.5 mt-2 space-y-1 font-medium text-[9px] text-amber-900 border-t border-amber-200/50 pt-1.5 col-span-2">
                        <li>Horizontální žaluzie: 150 – 2400 mm</li>
                        <li>Dřevěné žaluzie: 400 – 2400 mm</li>
                        <li>Venkovní žaluzie: 400 – 4500 mm</li>
                        <li>Vertikální stínění: 400 – 5800 mm</li>
                        <li>Textilní roletky: 300 – 2000 mm</li>
                        <li>Sítě proti hmyzu: 300 – 3000 mm</li>
                        <li>Markýzy: 1000 – 6000 mm</li>
                      </ul>
                    </div>
                  )}
                  
                  {/* iPad & iPhone Tactile increments */}
                  <div className="flex gap-1 justify-center">
                    {[-100, -10, 10, 100].map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setWidth(Math.max(100, width + inc));
                        }}
                        className="flex-1 py-1 px-1.5 bg-white border border-slate-200 hover:bg-slate-100 font-mono text-[10px] font-bold text-slate-600 rounded-lg active:bg-slate-200"
                      >
                        {inc > 0 ? `+${inc}` : inc}
                      </button>
                    ))}
                  </div>

                  <span className="block text-[11px] text-indigo-600 font-bold mt-1 bg-indigo-50/50 border border-indigo-150/40 p-1 px-2 rounded-lg text-center">
                    Technický limit: {activeLimits.minWidth} – {activeLimits.maxWidth} mm
                  </span>
                </div>

                {/* Height / Reach selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
                      {category === 'AWNING' ? 'Výsuv ramena (v mm)' : 'Výška prvku (v mm)'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setActiveHelp(activeHelp === 'height' ? null : 'height');
                      }}
                      className={`h-5 w-5 rounded-full flex items-center justify-center font-black text-[10px] cursor-pointer transition select-none ${
                        activeHelp === 'height' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-605 hover:bg-slate-300'
                      }`}
                      title="Nápověda pro výšku"
                    >
                      i
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="100"
                      max="10000"
                      value={height || ''}
                      onChange={(e) => setHeight(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-base md:text-sm font-semibold rounded-xl border border-slate-250 bg-white p-3 pr-10 text-slate-800 font-mono text-center focus:border-indigo-500 focus:outline-hidden min-h-[44px]"
                    />
                    <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-bold">mm</span>
                  </div>

                  {activeHelp === 'height' && (
                    <div className="p-3 bg-amber-50 border border-amber-150 rounded-xl text-[10px] text-amber-850 leading-relaxed font-semibold animate-fade-in my-1.5">
                      <strong>📐 Výrobní limit výšky / výsuvu QAPI:</strong>
                      <p className="mt-1">Pro aktuálně vybraný model <span className="font-bold text-indigo-600">({getProductTypeLabel(productType)})</span> je povolený rozměr <span className="font-bold underline">{activeLimits.minHeight} – {activeLimits.maxHeight} mm</span>.</p>
                      <ul className="list-disc pl-3.5 mt-2 space-y-1 font-medium text-[9px] text-amber-900 border-t border-amber-200/50 pt-1.5">
                        <li>Horizontální žaluzie: 300 – 2500 mm</li>
                        <li>Dřevěné žaluzie: 400 – 3000 mm</li>
                        <li>Venkovní žaluzie: 500 – 4000 mm</li>
                        <li>Vertikální stínění: 500 – 4500 mm</li>
                        <li>Textilní roletky: 300 – 2500 mm</li>
                        <li>Sítě proti hmyzu: 300 – 2800 mm</li>
                        <li>Markýzy: 1000 – 3500 mm</li>
                      </ul>
                    </div>
                  )}

                  {/* iPad & iPhone Tactile increments */}
                  <div className="flex gap-1 justify-center">
                    {[-100, -10, 10, 100].map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setHeight(Math.max(100, height + inc));
                        }}
                        className="flex-1 py-1 px-1.5 bg-white border border-slate-200 hover:bg-slate-100 font-mono text-[10px] font-bold text-slate-600 rounded-lg active:bg-slate-200"
                      >
                        {inc > 0 ? `+${inc}` : inc}
                      </button>
                    ))}
                  </div>

                  <span className="block text-[11px] text-indigo-600 font-bold mt-1 bg-indigo-50/50 border border-indigo-150/40 p-1 px-2 rounded-lg text-center">
                    {category === 'AWNING' ? 'Limit výsuvu' : 'Limit výšky'}: {activeLimits.minHeight} – {activeLimits.maxHeight} mm
                  </span>
                </div>

                {/* Quantity selection */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-indigo-500" />
                    Počet kusů (Ks)
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setQuantity(Math.max(1, quantity - 1));
                      }}
                      className="px-3.5 py-3 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-l-xl border border-r-0 border-slate-250 transition select-none min-h-[44px] min-w-[44px] flex items-center justify-center text-lg md:text-xs"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-base md:text-sm font-semibold rounded-none border border-slate-250 bg-white p-3 text-slate-800 font-mono text-center focus:border-indigo-500 focus:outline-hidden min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setQuantity(quantity + 1);
                      }}
                      className="px-3.5 py-3 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-r-xl border border-l-0 border-slate-250 transition select-none min-h-[44px] min-w-[44px] flex items-center justify-center text-lg md:text-xs"
                    >
                      +
                    </button>
                  </div>
                  <span className="block text-[10px] text-slate-400 text-center font-normal">
                    Stejné upevnění pro více oken
                  </span>
                </div>

              </div>

              {/* IOS Styled common window size presets */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Rychlé rozměrové šablony QAPI (Uložit po zaměření)
                </span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { label: 'Užší okno', w: 600, h: 1200 },
                    { label: 'Standardní okno', w: 1000, h: 1300 },
                    { label: 'Širší okno okno', w: 1400, h: 1400 },
                    { label: 'Balkonové dveře', w: 900, h: 2000 },
                    { label: 'Dvojkřídlý portál', w: 1800, h: 2200 }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setWidth(preset.w);
                        setHeight(preset.h);
                      }}
                      className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 rounded-xl text-left border border-slate-200 transition active:scale-95 cursor-pointer flex flex-col justify-between"
                    >
                      <span className="text-[10px] font-bold block leading-tight">{preset.label}</span>
                      <span className="font-mono text-[9px] text-slate-400 font-bold mt-1 block">{preset.w} × {preset.h} mm</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time area tracker warning */}
              <div className="p-3 bg-indigo-50 border border-indigo-100/60 rounded-xl flex items-center justify-between text-xs text-indigo-900 font-medium">
                <span className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-550 shrink-0" />
                  Poměr plochy stínění:
                </span>
                <span className="font-mono font-bold bg-white text-indigo-600 px-2 py-0.5 rounded border border-indigo-200">
                  {((width * height) / 1000000).toFixed(3)} m² {(width * height / 1000000 > 2.4 && category === 'HORIZONTAL') && '⚠️ (Vyžaduje Prim převodovku)'}
                </span>
              </div>

              {/* Mobile visual live preview - visible from Step 3 */}
              <div className="block md:hidden mt-3">
                <span className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-wider">
                  Mobilní vizuální podhled QAPI
                </span>
                <BlindLivePreview item={currentPayloadItem} />
              </div>
            </div>
          )}

          {/* STEP 4: Colors & Materials */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-normal">
                Vyberte vzhled stínění. Provedení lamel a profilů ovlivňuje cenu i expedici.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Lamella / Fabric selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-indigo-600" />
                      {category === 'AWNING' ? 'Design tkaniny Terasa' : 'Kód lamely QAPI'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setActiveHelp(activeHelp === 'color' ? null : 'color');
                      }}
                      className={`h-5 w-5 rounded-full flex items-center justify-center font-black text-[10px] cursor-pointer transition select-none ${
                        activeHelp === 'color' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                      title="Nápověda pro barvy"
                    >
                      i
                    </button>
                  </div>

                  {activeHelp === 'color' && (
                    <div className="p-3 bg-amber-50 border border-amber-150 rounded-xl text-[10px] text-amber-850 leading-relaxed font-semibold animate-fade-in my-1.5">
                      <strong>🎨 Informace k barvám lamel a profilů:</strong>
                      <p className="font-medium mt-1">
                        Barvy s označením příplatku (např. imitace dřeva nebo vlastní RAL laky) navyšují cenu stínění o 15% až 30%. Standardní barvy (RAL 9010 bílá, RAL 9006 stříbrná budova, RAL 7016 antracit) jsou bez příplatku s rychlou expedicí do 5 pracovních dnů.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {LAMELLA_COLORS.map((col) => {
                      const isAwnColor = col.code.startsWith('AWN_');
                      // Filter colors suitable for categories
                      if (category === 'AWNING' && !isAwnColor) return null;
                      if (category !== 'AWNING' && isAwnColor) return null;

                      // Visual preview helpers for swatches
                      let blockColor = 'bg-slate-250';
                      if (col.code === '9010') blockColor = 'bg-white border-slate-350';
                      else if (col.code === '8017') blockColor = 'bg-[#402218]';
                      else if (col.code === '9006') blockColor = 'bg-[#A6A6A6]';
                      else if (col.code === '7016') blockColor = 'bg-[#373F43]';
                      else if (col.code === '1013') blockColor = 'bg-[#EAE6D8]';
                      else if (col.code === '8004') blockColor = 'bg-[#8F3E2B]';
                      else if (col.code.startsWith('W')) blockColor = 'bg-amber-800 bg-[linear-gradient(45deg,#b45309_25%,#78350f_50%,#b45309_75%)]';
                      else if (col.code.includes('BG')) blockColor = 'bg-[#F2EBD9]';
                      else if (col.code.includes('GR')) blockColor = 'bg-[#9CA3AF]';
                      else if (col.code.includes('ST')) blockColor = 'bg-[repeating-linear-gradient(45deg,#3B82F6,#3B82F6_5px,#F3F4F6_5px,#F3F4F6_10px)]';

                      const isSelected = lamellaColor === col.code;

                      return (
                        <button
                          key={col.code}
                          type="button"
                          onClick={() => setLamellaColor(col.code)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition active:scale-95 text-xs text-slate-800 font-bold cursor-pointer ${
                            isSelected ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className={`h-6 w-6 rounded-full border shrink-0 ${blockColor}`} />
                          <div className="min-w-0 pr-1">
                            <span className="block truncate text-[10px] sm:text-xs leading-tight">{col.name}</span>
                            <span className="text-[9px] text-slate-400 font-normal">
                              {col.surcharge > 0 ? `+${col.surcharge}% příplatek` : 'Základní cena'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Profil frame color */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-indigo-600" />
                    {category === 'AWNING' ? 'Hliníkové lakování krytí' : 'Svrchní krycí lišta'}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {PROFILE_COLORS.map((col) => {
                      const isAwnProf = col.code.startsWith('AWN_');
                      if (category === 'AWNING' && !isAwnProf) return null;
                      if (category !== 'AWNING' && isAwnProf) return null;

                      let blockColor = 'bg-slate-250';
                      if (col.code === 'RAL9010') blockColor = 'bg-white border-slate-350';
                      else if (col.code === 'RAL8017') blockColor = 'bg-[#402218]';
                      else if (col.code === 'RAL9006') blockColor = 'bg-[#A6A6A6]';
                      else if (col.code === 'RAL7016') blockColor = 'bg-[#373F43]';
                      else if (col.code.startsWith('RE_')) blockColor = 'bg-amber-805 bg-[linear-gradient(45deg,#92400e_25%,#451a03_50%,#92400e_75%)]';
                      else if (col.code.includes('AWN_ALU_W')) blockColor = 'bg-white border-slate-300';
                      else if (col.code.includes('AWN_ALU_A')) blockColor = 'bg-[#373F43]';

                      const isSelected = topProfileColor === col.code;

                      return (
                        <button
                          key={col.code}
                          type="button"
                          onClick={() => {
                            setTopProfileColor(col.code);
                            setBottomProfileColor(col.code);
                          }}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition active:scale-95 text-xs text-slate-800 font-bold cursor-pointer ${
                            isSelected ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className={`h-6 w-6 rounded-full border shrink-0 ${blockColor}`} />
                          <div className="min-w-0 pr-1">
                            <span className="block truncate text-[10px] sm:text-xs leading-tight">{col.name}</span>
                            <span className="text-[9px] text-slate-400 font-normal">
                              {col.surcharge > 0 ? `+${col.surcharge}% příplatek` : 'Standardní profil'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Extra visual design check boxes if interior horizontal is selected */}
              {category === 'HORIZONTAL' && (
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800">
                      <input
                        type="checkbox"
                        checked={isCelostin}
                        onChange={(e) => setIsCelostin(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      Domykatelné provedení (Celostín)
                    </label>
                    <p className="text-[10px] text-slate-400 pl-5 leading-normal">
                      Excentricky proražené dírky v lamelách zaručují splynutí v dokonalou tmu. Vhodné do ložnic (+15%).
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800">
                      <input
                        type="checkbox"
                        checked={isSlant}
                        onChange={(e) => setIsSlant(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      Šikmý atypický řez (Šikmina)
                    </label>
                    <p className="text-[10px] text-slate-400 pl-5 leading-normal">
                      Pro netypická podkrovní, trojúhelníková nebo trapézová křídla. Garance pouze na tlusté liště HZ 27x19 (+60%).
                    </p>
                  </div>
                </div>
              )}

              {/* Mobile visual live preview - visible from Step 4 */}
              <div className="block md:hidden mt-3 pt-3 border-t border-slate-150">
                <span className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-wider">
                  Mobilní vizuální podhled QAPI
                </span>
                <BlindLivePreview item={currentPayloadItem} />
              </div>
            </div>
          )}

          {/* STEP 5: Controls & Accessories */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-normal">
                Zvolte způsob ručního nebo elektrického motorového pohonu.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Control mechanism */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-indigo-600" />
                      Způsob ovládání
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setActiveHelp(activeHelp === 'control' ? null : 'control');
                      }}
                      className={`h-5 w-5 rounded-full flex items-center justify-center font-black text-[10px] cursor-pointer transition select-none ${
                        activeHelp === 'control' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                      title="Nápověda k ovládání"
                    >
                      i
                    </button>
                  </div>

                  {activeHelp === 'control' && (
                    <div className="p-3 bg-amber-50 border border-amber-150 rounded-xl text-[10px] text-amber-850 leading-relaxed font-semibold animate-fade-in my-1.5">
                      <strong>⚙️ Informace k pohonům a ovládání:</strong>
                      <ul className="list-disc pl-3 mt-1 font-medium space-y-1">
                        <li>RP/RL: Tradiční kuličkový řetízek, upevněný na rámu okna.</li>
                        <li>Somfy IO: Bezdrátový motor s technologií obousměrného signálu. Umožňuje automatizaci nebo propojení s chytrým telefonem technika i zákazníka.</li>
                        <li>Nerezová ruční klika: Odolný robustní kardanový kloub vedený skrz zeď pro ruční stahování.</li>
                      </ul>
                    </div>
                  )}

                  <select
                    value={controlSide}
                    onChange={(e) => setControlSide(e.target.value)}
                    className="w-full text-base md:text-xs rounded-xl border border-slate-250 bg-slate-50 p-3 text-slate-800 font-semibold focus:border-indigo-500 focus:outline-hidden min-h-[44px]"
                  >
                    {category === 'HORIZONTAL' && (
                      <>
                        <option value="RP">RP (Kuličkový řetízek vpravo)</option>
                        <option value="RL">RL (Kuličkový řetízek vlevo)</option>
                        <option value="P">P (Brzda, šnek střešní vpravo)</option>
                        <option value="L">L (Brzda, šnek střešní vlevo)</option>
                        <option value="IB">IB (Brzda, šnek a tyčka)</option>
                      </>
                    )}
                    {category === 'EXTERNAL' && (
                      <>
                        <option value="MOTOR_IO">Somfy IO (Chytrý motor, radiový signál)</option>
                        <option value="MOTOR_SWITCH">Jednofázový motor na stěnový vypínač</option>
                        <option value="P">Nerezová ruční klika (pravá)</option>
                        <option value="L">Nerezová ruční klika (levá)</option>
                      </>
                    )}
                    {category === 'AWNING' && (
                      <>
                        <option value="MOTOR_IO">Somfy IO iO-homecontrol s dálkovým ovladačem</option>
                        <option value="MOTOR_SWITCH">Motorický na vypínač</option>
                        <option value="P">Ruční vyklápěcí klika</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Extra systems based on options */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    Záruční doplňky QAPI
                  </h4>

                  {category === 'AWNING' ? (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={awningWindSensor}
                          onChange={(e) => setAwningWindSensor(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 mt-1"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-800 block">Bezdrátové větrné čidlo Eolis</span>
                          <span className="text-[10px] text-slate-400 leading-normal block mt-1">
                            Při zaznamenání otřesů nebo větru se markýza automaticky bezpečně stáhne do kazety.
                          </span>
                        </div>
                      </label>
                    </div>
                  ) : productType === 'ISOLINE_PRIM' ? (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-slate-800">
                        <input
                          type="checkbox"
                          checked={hasBrake}
                          onChange={(e) => setHasBrake(e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        Brzda stoupání řetízku
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-slate-800">
                        <input
                          type="checkbox"
                          checked={hasGearbox}
                          onChange={(e) => setHasGearbox(e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        Převodovka s brzdou
                      </label>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-slate-50 text-slate-450 text-[11px] rounded-xl border border-slate-100 leading-relaxed">
                      Záruka QAPI zahrnuje standardní nylonovou nebo ocelovou vodicí strunu pro dokonalé stabilní ukotvení do oken stavby.
                    </div>
                  )}

                </div>

              </div>

              {/* Mobile visual live preview - visible from Step 5 */}
              <div className="block md:hidden mt-3 pt-3 border-t border-slate-150">
                <span className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-wider">
                  Mobilní vizuální podhled QAPI
                </span>
                <BlindLivePreview item={currentPayloadItem} />
              </div>
            </div>
          )}

          {/* STEP 6: Overview and Final Note */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-normal">
                Zde je rekapitulace parametru Vašeho prvku. Chcete jej opatřit popiskem pro montážníky?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Visual spec sheet of the element */}
                <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 text-xs text-slate-800 space-y-2.5">
                  <h4 className="font-bold text-indigo-900 border-b border-indigo-100 pb-1 flex items-center gap-1.5 uppercase text-[10px] tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    Konfigurace prvku stínění
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Produktová řada:</span>
                    <span className="font-bold text-slate-800">{getProductTypeLabel(productType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Přesný rozměr:</span>
                    <span className="font-mono font-bold">{width} × {height} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Množství:</span>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-100/60 px-1.5 rounded">{quantity} ks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Barva lamely / látka:</span>
                    <span className="font-semibold text-slate-800 select-all">{lamellaColor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Svrchní barva krytí:</span>
                    <span className="font-semibold text-slate-800">{topProfileColor}</span>
                  </div>
                  {awningWindSensor && (
                    <div className="text-[10px] text-emerald-650 font-bold bg-white p-1 rounded border border-emerald-100 text-center">
                      ✓ S protivětrným čidlem Somfy Eolis
                    </div>
                  )}
                </div>

                {/* Technician Location / Notes */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-emerald-600" />
                    Označení žaluzie (Místnost)
                  </h4>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Např: Kuchyň vlevo, Ložnice dětský pokoj"
                    className="w-full text-base md:text-xs rounded-xl border border-slate-250 bg-slate-50 p-3 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden min-h-[44px]"
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Tento text bude vytištěn na samolepicí expediční štítek QAPI pro snadné vybalení a bezproblémové osazení na okna stavby.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Custom inline notifications (no alert blocks on iPad/OS) */}
        {stepNotification && (
          <div className={`mt-4 p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-fade-in ${
            stepNotification.isError 
              ? 'bg-red-50 border-red-200 text-red-700 font-semibold' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div>{stepNotification.message}</div>
          </div>
        )}

        {/* Wizard Footer - Navigating buttons */}
        <div className="pt-6 border-t border-neutral-100 flex justify-between items-center mt-6">
          
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => {
              playTactileClick();
              setCurrentStep(Math.max(1, currentStep - 1));
            }}
            className="px-4 py-2 bg-[#F2F2F7] hover:bg-neutral-200 border border-neutral-300/40 rounded-xl text-neutral-800 text-xs font-semibold hover:shadow-2xs active:scale-95 transition flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed select-none min-h-[44px] min-w-[80px] justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět
          </button>

          <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 hidden sm:block">
            Krok {currentStep}: {stepDetails[currentStep - 1].title}
          </div>

          {currentStep === 6 ? (
            <button
              type="button"
              onClick={() => {
                if (validationErrors.length > 0) {
                  playErrorHum();
                  setStepNotification({ message: 'Tento prvek nelze uložit kvůli závažným konstrukčním nebo rozměrovým chybám.', isError: true });
                } else {
                  playTactileClick();
                  handleFinalSave();
                }
              }}
              disabled={validationErrors.length > 0}
              className={`px-5 py-2 rounded-xl text-xs font-bold leading-normal uppercase tracking-tight shadow-sm active:scale-95 transition-all flex items-center gap-1.5 focus:outline-hidden select-none min-h-[44px] ${
                validationErrors.length > 0
                  ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                  : 'bg-black hover:opacity-90 text-white cursor-pointer'
              }`}
            >
              <span>Uložit konfiguraci okna</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (currentStep >= 3 && validationErrors.length > 0) {
                  playErrorHum();
                  setStepNotification({
                    message: 'Před pokračováním opravte červeně označenou rozměrovou vadu produktu.',
                    isError: true
                  });
                  return;
                }
                playTactileClick();
                setCurrentStep(Math.min(6, currentStep + 1));
              }}
              className="px-5 py-2 bg-black hover:opacity-90 text-white font-bold text-xs uppercase tracking-tight rounded-xl transition-all flex items-center gap-1.5 active:scale-95 select-none min-h-[44px]"
            >
              Pokračovat
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
