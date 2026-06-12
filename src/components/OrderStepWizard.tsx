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

const HORIZONTAL_PROFILE_COLORS = [
  { value: 'RAL 9010 - bílá', label: 'RAL 9010 - bílá', color: '#ffffff', isRenolit: false },
  { value: 'RAL 8017 - tm. hnědá', label: 'RAL 8017 - tm. hnědá', color: '#402218', isRenolit: false },
  { value: 'RAL 9006 - stříbrná', label: 'RAL 9006 - stříbrná', color: '#A6A6A6', isRenolit: false },
  { value: 'RAL 8004 - hnědá', label: 'RAL 8004 - hnědá', color: '#8F3E2B', isRenolit: false },
  { value: 'RAL 8003 - hnědá', label: 'RAL 8003 - hnědá', color: '#A16A47', isRenolit: false },
  { value: 'RAL 1013 - sl. kost', label: 'RAL 1013 - sl. kost', color: '#EAE6D8', isRenolit: false },
  { value: 'RAL 7016 - antracit', label: 'RAL 7016 - antracit', color: '#373F43', isRenolit: false },
  { value: 'RAL 8023 - hnědá (Al)', label: 'RAL 8023 - hnědá (Al)', color: '#A25934', isRenolit: false },
  { value: 'Gold 1', label: 'Gold 1 (k lamele č. 714)', color: '#D4AF37', isRenolit: false },
  { value: 'Gold 2', label: 'Gold 2 (k lamele č. 700)', color: '#C5A029', isRenolit: false },
  { value: 'Renolit 21 - šedá', label: 'Renolit 21 - zlatý dub / šedá', color: 'wood', isRenolit: true },
  { value: 'Renolit 22 - třešeň', label: 'Renolit 22 - třešeň / amaretto', color: 'wood', isRenolit: true },
  { value: 'Renolit 23 - borovice horská', label: 'Renolit 23 - borovice horská', color: 'wood', isRenolit: true },
  { value: 'Renolit 24 - tmavý dub', label: 'Renolit 24 - tmavý dub', color: 'wood', isRenolit: true },
  { value: 'Renolit 25 - vlašský ořech', label: 'Renolit 25 - vlašský ořech', color: 'wood', isRenolit: true },
  { value: 'Renolit 26 - sapeli', label: 'Renolit 26 - sapeli', color: 'wood', isRenolit: true },
  { value: 'Renolit 27 - přírodní dub', label: 'Renolit 27 - přírodní dub', color: 'wood', isRenolit: true },
  { value: 'Renolit 28 - tmavý ořech', label: 'Renolit 28 - tmavý ořech', color: 'wood', isRenolit: true },
  { value: 'Renolit 29 - douglas', label: 'Renolit 29 - douglas', color: 'wood', isRenolit: true },
  { value: 'Renolit 30 - oregon', label: 'Renolit 30 - oregon 4', color: 'wood', isRenolit: true },
  { value: 'Renolit 31 - rustikální dub', label: 'Renolit 31 - rustikální dub', color: 'wood', isRenolit: true },
  { value: 'Renolit 32 - bahenní dub', label: 'Renolit 32 - bahenní dub', color: 'wood', isRenolit: true },
  { value: 'Renolit 33 - antracit', label: 'Renolit 33 - antracit', color: '#2B3134', isRenolit: true },
  { value: 'Renolit 35 - přírodní ořech', label: 'Renolit 35 - přírodní ořech', color: 'wood', isRenolit: true },
  { value: 'Renolit 36 - winchester', label: 'Renolit 36 - winchester', color: 'wood', isRenolit: true },
];

const PRODUCT_XLS_GUIDELINES: { [key: string]: { file: string; title: string; rules: string[] } } = {
  HORIZONTAL: {
    file: '01_formular_horizontalni_zaluzie.xls',
    title: 'Horizontální stínění (Isoline, Loco, Prim, Eco, HZ)',
    rules: [
      'U řetízku Isoline standard/Loco se zadává standardní ovládání RP (pravé) nebo RL (levé).',
      'U modelu Isoline Prim s převodovkou a brzdou řetízku lze zvolit pouze délky nekonečného řetízku: 50, 75, 100, 125, 150, 175, 200, 225 cm.',
      'U plochy nad 2.4 m² je pro udělení záruky QAPI u modelů Prim vyžadována planetová převodovka s brzdou!',
      'Materiál nosných profilů: Fe (železo), nebo Al (hliník - povoleno pouze pro standardní Isoline a Eco).',
      'Pro HZ 25/27x19 ovládání: M - meziskelní, IB - interiérová s brzdou a šnekem, MF - meziskelní s fixací, IBF - interiérová s brzdou, šnekem a fixací, IF - boční vývod s fixací, IRB/IRBF - čelní vývod s brzdou (s/bez fixace), IBS - s brzdou, šnekem a střešní fixací.',
      'Atypická šikmá provedení (šikminy) se provádějí výhradně na silném HZ profilu 27x19 mm!',
      'Rozměrový limit Isoline řady: šířka 200 - 2400 mm, výška 300 - 2500 mm. Max plocha 2.4 m² (Prim až 5.28 m²).'
    ]
  },
  SCREENS: {
    file: '07_a_08_formular_site_proti_hmyzu.xls',
    title: 'Sítě proti hmyzu (Okenní pevné, Dveřní pevné, Plisé sítě)',
    rules: [
      'Pevné okenní sítě: tolerance z rozměru rámu okna je pro montáž snížena o -3 mm.',
      'Síťovina s nanovláknem (N) je povolena výhradně pro luxusní hliníkové profily LUX (např. OE 32x11 LUX, ISSO OE 34x9 LUX). Nelze do profilů DV 50x20 a DE 50x20!',
      'Protipylová síťovina a pet screen (odolná) jsou doporučeny do extrudovaných profilů. Protipylovou nelze namontovat do dveřního profilu DV 50x20.',
      'Povolené výšky Z-držáků: Pro ISSO OV 19x8 jsou: 10, 12, 14, 15, 17, 20 mm. Pro OE 32x11 LUX: 8, 10, 12, 14, 16, 18, 20, 22, 24, 30 mm.',
      'Dveřní sítě: doporučeno minimálně 3 panty celkem (standardní + samozavírací) pro spolehlivou fixaci křídla.',
      'U plisé sítě Stellar musí být šířka o min. 200 mm menší než výška kvůli vyvažovacím lankům!',
      'U modelů Stellar Lux a Stellar Lux opona platí: Pokud je výška sítě menší než dual-šířka + 140 mm (H < 2*W + 140 mm), bude automaticky dodán široký pevný profil.'
    ]
  },
  ROLETKY: {
    file: '05_formular_textilni_roletky.xls',
    title: 'Textilní roletky (Jazz, Legend, Opus, Optima, Collete)',
    rules: [
      'Modely Opus/Optima/Collete: maximální šířka a výška nesmí současně překročit 1950 mm. Pokud šířka přesáhne 1950 mm, maximální výška je omezena na 1850 mm!',
      'Ovládání: Ř – řetízek (ruční), M1 – Motor 230 V (typ FD25AE), M2 – Motor 12 V (typ FD25BE).',
      'Při motorickém ovládání lze zvolit dálkové bezdrátové radio ovladače ERTE (1, 2, 5 nebo 15-kanálové).',
      'U modelu Collete s krycí lištou se rozlišuje plochá (plochá) nebo zaoblená (radius) krycí lišta.',
      'Opus obsahuje specifické úchyty na stěnu (1 - stěna) nebo strop (2 - strop) a umožňuje krycí látku.'
    ]
  },
  EXTERNAL: {
    file: '09_formular_venkovni_zaluzie.xlsx',
    title: 'Venkovní žaluzie (Z-90, S-90, C-80, F-80)',
    rules: [
      'Garantované provozní rozměry: šířka 400 - 4500 mm. Ruční klika vyžaduje min. šířku 400 mm, elektrické motory vyžadují šířku min. 600 mm.',
      'Maximální povolená plocha jednoho kusu pro kliku je 8.0 m², pro motorický pohon Somfy IO nebo spínač je limit 16.0 m².',
      'Při šířce nad 2500 mm systém doporučuje přídavné silné vodicí lišty s ocelovým lanem pro eliminaci hluku a větru.',
      'Model Z-90 se zalisovanou gumou garantuje nejlepší zatemňovací schopnost a hlukovou izolaci interiéru.'
    ]
  },
  AWNING: {
    file: '13_formular_markyzy.xls',
    title: 'Kasetové terasové a okenní markýzy (Casablanca, Dakota, Italia)',
    rules: [
      'Vezměte v úvahu, že Casablanca a Dakota vyžadují minimální šířku 2000 mm kvůli pákám kloubových ramen.',
      'Způsob uchycení: pevný materiál (cihla, beton), nebo přes zateplení (chemická kotva se závitovou tyčí).',
      'Důrazně doporučujeme u motorových verzí osadit protivětrné otřesové čidlo Somfy Eolis 3D pro spolehlivou samočinnou ochranu před letní vichřicí.'
    ]
  },
  WOODEN: {
    file: '03_formular_drevene_zaluzie.xls',
    title: 'Dřevěné horizontální žaluzie (Wood 25 / 35 / 50 mm)',
    rules: [
      'Dřevěná žaluzie 25/35 mm: Šířka 400 - 1800 mm, výška 400 - 2200 mm. Maximální garantovaná plocha je 3.6 m².',
      'Velkoformátová dřevěná žaluzie 50 mm: Šířka 500 - 2400 mm, výška 500 - 3000 mm. Maximální plocha je 6.0 m².',
      'Skládání lamel (nábal): u dřevěných žaluzií je výška vytaženého svazku značná a vyžaduje dostatek místa nad oknem.'
    ]
  },
  VERTICAL: {
    file: '04_formular_vertikalni_stineni.xls',
    title: 'Vertikální stínění (Látka 89/127 mm, PVC lamely)',
    rules: [
      'Látkové vertikální stínění: Šířka 400 - 5800 mm, Výška 500 - 4500 mm.',
      'PVC omyvatelné stínění: Šířka 400 - 4000 mm, Výška 500 - 3000 mm.',
      'Směr stahování lamel: k ovládání (A), od ovládání (B), opona (C), nebo doprostřed (D).'
    ]
  }
};

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
    case 'ROLL_STREAM_S':
      return {
        minWidth: 300,
        maxWidth: 1500,
        minHeight: 300,
        maxHeight: 1600,
      };
    case 'ROLL_STREAM_PLUS':
      return {
        minWidth: 300,
        maxWidth: 2400,
        minHeight: 300,
        maxHeight: 2500,
      };
    case 'ROLL_SONATA':
      return {
        minWidth: 300,
        maxWidth: 2400,
        minHeight: 300,
        maxHeight: 2500,
      };
    case 'ROLL_OPUS_OPTIMA_COLLETE':
      return {
        minWidth: 300,
        maxWidth: 2400,
        minHeight: 300,
        maxHeight: 2500,
      };
    case 'ROLL_LEGEND':
      return {
        minWidth: 300,
        maxWidth: 1500,
        minHeight: 300,
        maxHeight: 1800,
      };
    case 'ROLL_JAZZ':
      return {
        minWidth: 300,
        maxWidth: 2400,
        minHeight: 300,
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
    case 'SCREEN_SLIDE_TRACKS':
      return {
        minWidth: 400,
        maxWidth: 2000,
        minHeight: 500,
        maxHeight: 2500,
      };
    case 'SCREEN_SLIDE_FRAME':
      return {
        minWidth: 500,
        maxWidth: 3000,
        minHeight: 500,
        maxHeight: 2500,
      };
    case 'SCREEN_SLANT':
      return {
        minWidth: 200,
        maxWidth: 1800,
        minHeight: 200,
        maxHeight: 2200,
      };
    case 'SCREEN_DOOR_PLEAT':
      return {
        minWidth: 500,
        maxWidth: 3000,
        minHeight: 1000,
        maxHeight: 2800,
      };
    case 'SCREEN_ROLLER_VERSA':
      return {
        minWidth: 400,
        maxWidth: 2000,
        minHeight: 400,
        maxHeight: 2500,
      };
    case 'SCREEN_ROLLER_DAROS':
      return {
        minWidth: 500,
        maxWidth: 1600,
        minHeight: 1000,
        maxHeight: 2500,
      };
    case 'PLISSE_DARNI':
      return {
        minWidth: 300,
        maxWidth: 1800,
        minHeight: 300,
        maxHeight: 2600,
      };
    case 'PLISSE_LAGARTA':
      return {
        minWidth: 300,
        maxWidth: 1500,
        minHeight: 300,
        maxHeight: 2500,
      };
    case 'JAP_STENA':
      return {
        minWidth: 1000,
        maxWidth: 5500,
        minHeight: 300,
        maxHeight: 3000,
      };
    // Nové rozměrové limity
    case 'EXT_TARA_PREMIO_I':
    case 'EXT_TARA_PREMIO_II':
      return {
        minWidth: 400,
        maxWidth: 6000,
        minHeight: 500,
        maxHeight: 5000,
      };
    case 'EXT_GHIBLI_UNION':
      return {
        minWidth: 400,
        maxWidth: 4000,
        minHeight: 500,
        maxHeight: 3000,
      };
    case 'AWN_UNION_DROP':
      return {
        minWidth: 800,
        maxWidth: 6000,
        minHeight: 500,
        maxHeight: 1600,
      };
    case 'EXT_ROLO_VENKOVNI':
    case 'EXT_ROLO_HELUZ':
      return {
        minWidth: 400,
        maxWidth: 4000,
        minHeight: 400,
        maxHeight: 3200,
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

  // Specialized Custom parameters for Blinds, Screens, and Rollers from spreadsheets
  const [profileType, setProfileType] = useState<string>('');
  const [screenType, setScreenType] = useState<string>('');
  const [screenColor, setScreenColor] = useState<string>('1 - bílá mat');
  const [threshold, setThreshold] = useState<string>('1a - standard');
  const [meshColor, setMeshColor] = useState<string>('černá');
  const [coverBar, setCoverBar] = useState<boolean>(false);
  const [supportingProfile, setSupportingProfile] = useState<boolean>(false);
  const [mountingLProfile, setMountingLProfile] = useState<boolean>(false);

  // Door Screens
  const [rivetingPants, setRivetingPants] = useState<boolean>(false);
  const [pantsSide, setPantsSide] = useState<'L' | 'P'>('L');
  const [pantsCountStandard, setPantsCountStandard] = useState<number>(3);
  const [pantsCountSelfClose, setPantsCountSelfClose] = useState<number>(0);
  const [kickPlate, setKickPlate] = useState<boolean>(false);
  const [brushProfile, setBrushProfile] = useState<boolean>(false);
  const [doorBarPosition, setDoorBarPosition] = useState<string>('bez příčky');
  const [handleMagnet, setHandleMagnet] = useState<boolean>(false);

  // Window Screens
  const [brushType, setBrushType] = useState<string>('1 - bez kartáčku');
  const [brushHeight, setBrushHeight] = useState<string>('3');
  const [holderType, setHolderType] = useState<string>('OD - otočný držák');
  const [holderHeight, setHolderHeight] = useState<string>('0');
  const [riveting, setRiveting] = useState<boolean>(false);
  const [cornersLook, setCornersLook] = useState<string>('vnitřní');
  const [windowBarCount, setWindowBarCount] = useState<number>(0);
  const [windowBarHeight1, setWindowBarHeight1] = useState<number>(0);
  const [windowBarHeight2, setWindowBarHeight2] = useState<number>(0);

  // Roller Blinds
  const [controlMethod, setControlMethod] = useState<string>('Ř - řetízek');
  const [electronicsType, setElectronicsType] = useState<string>('bez motoru');
  const [chainLength, setChainLength] = useState<string>('standard');
  const [coverFabric, setCoverFabric] = useState<boolean>(false);
  const [mountingOpus, setMountingOpus] = useState<string>('1 - stěna');
  const [safetyElement, setSafetyElement] = useState<boolean>(false);
  const [coverBarCollete, setCoverBarCollete] = useState<'plochá' | 'radius'>('plochá');

  // Horizontal Blinds
  const [lamellaType, setLamellaType] = useState<string>('25 x 0.18');
  const [profileMaterial, setProfileMaterial] = useState<'Fe' | 'Al'>('Fe');
  const [locoColor, setLocoColor] = useState<string>('RAL 9010 - bílá');
  const [profileColorTab, setProfileColorTab] = useState<'RAL' | 'RENOLIT'>('RAL');
  const [colorHarmony, setColorHarmony] = useState<boolean>(false);
  const [controlLengthCustom, setControlLengthCustom] = useState<string>('standard');
  const [controlAccessory, setControlAccessory] = useState<string>('NONE');
  const [windowMaterial, setWindowMaterial] = useState<string>('PVC');
  const [spacerCount, setSpacerCount] = useState<number>(0);
  const [safetyElementBlinds, setSafetyElementBlinds] = useState<boolean>(false);
  const [mountingSupport, setMountingSupport] = useState<boolean>(false);
  
  // Plisse Blinds
  const [plisseModel, setPlisseModel] = useState<string>('AB 42');
  const [firstFabric, setFirstFabric] = useState<string>('Vzorník látek / Pearl 01');
  const [secondFabric, setSecondFabric] = useState<string>('');
  const [mountingType, setMountingType] = useState<string>('Zasklívací lišta standard');
  const [extensionRod, setExtensionRod] = useState<string>('NONE');
  const [plisseCoverBar, setPlisseCoverBar] = useState<string>('');
  const [childSafety, setChildSafety] = useState<boolean>(false);

  // Textile Roller Blinds Specific States
  const [submodelType, setSubmodelType] = useState<string>('OPTIMA');
  const [unreelingDir, setUnreelingDir] = useState<string>('1 - ke zdi');
  const [bracketColor, setBracketColor] = useState<string>('B - bílá');
  const [profileColorState, setProfileColorState] = useState<string>('A - bílá');
  const [windowManufacturer, setWindowManufacturer] = useState<string>('1 - Velux');
  const [extraHooksPairs, setExtraHooksPairs] = useState<number>(1);
  const [guideRailsOption, setGuideRailsOption] = useState<boolean>(false);
  const [guideRailsWidth, setGuideRailsWidth] = useState<string>('1 - úzká');
  const [telescopicPoleCount, setTelescopicPoleCount] = useState<number>(0);

  // Vertical Blinds
  const [verticalLimitation, setVerticalLimitation] = useState<string>('1 - bez omezení');
  const [verticalDesign, setVerticalDesign] = useState<string>('1 - standard');
  const [verticalColorsCount, setVerticalColorsCount] = useState<number>(1);
  const [verticalExtraBrackets, setVerticalExtraBrackets] = useState<number>(0);
  const [verticalControlLength, setVerticalControlLength] = useState<string>('standard');

  // Japanese Wall
  const [panelWidth, setPanelWidth] = useState<number>(540);
  const [panelCount, setPanelCount] = useState<number>(4);
  const [japTrackType, setJapTrackType] = useState<string>('2-drážková');
  const [japTrackColor, setJapTrackColor] = useState<string>('bílá (standard)');
  const [japTrackRal, setJapTrackRal] = useState<string>('');
  const [japMagnetsEnabled, setJapMagnetsEnabled] = useState<boolean>(false);
  const [japMagnetCount, setJapMagnetCount] = useState<number>(0);

  // New Exterior and Screen Shading variables
  const [boxType, setBoxType] = useState<string>('');
  const [boxColor, setBoxColor] = useState<string>('');
  const [guideType, setGuideType] = useState<string>('');
  const [fabricType, setFabricType] = useState<string>('');
  const [rollDirection, setRollDirection] = useState<string>('');
  const [awningDrop, setAwningDrop] = useState<string>('');
  const [integratedMesh, setIntegratedMesh] = useState<boolean>(false);
  const [endProfileType, setEndProfileType] = useState<string>('');
  const [endProfileColor, setEndProfileColor] = useState<string>('');
  const [gasketType, setGasketType] = useState<string>('');
  const [mountingTypeCustom, setMountingTypeCustom] = useState<string>('');
  const [fabricOrientation, setFabricOrientation] = useState<string>('');
  const [capColor, setCapColor] = useState<string>('');
  const [distanceProfile, setDistanceProfile] = useState<string>('');
  const [electronicsReceiver, setElectronicsReceiver] = useState<string>('');
  const [preDrilling, setPreDrilling] = useState<string>('');
  const [externalCoverPlate, setExternalCoverPlate] = useState<string>('');
  const [internalCoverPlate, setInternalCoverPlate] = useState<string>('');
  const [awningHood, setAwningHood] = useState<boolean>(false);
  const [bracketExtra, setBracketExtra] = useState<number>(0);
  
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

      setProfileType(editingItem.profileType || '');
      setScreenType(editingItem.screenType || '');
      setScreenColor(editingItem.screenColor || '1 - bílá mat');
      setThreshold(editingItem.threshold || '1a - standard');
      setMeshColor(editingItem.meshColor || 'černá');
      setCoverBar(!!editingItem.coverBar);
      setSupportingProfile(!!editingItem.supportingProfile);
      setMountingLProfile(!!editingItem.mountingLProfile);

      setRivetingPants(!!editingItem.rivetingPants);
      setPantsSide(editingItem.pantsSide || 'L');
      setPantsCountStandard(editingItem.pantsCountStandard !== undefined ? editingItem.pantsCountStandard : 3);
      setPantsCountSelfClose(editingItem.pantsCountSelfClose !== undefined ? editingItem.pantsCountSelfClose : 0);
      setKickPlate(!!editingItem.kickPlate);
      setBrushProfile(!!editingItem.brushProfile);
      setDoorBarPosition(editingItem.doorBarPosition || 'bez příčky');
      setHandleMagnet(!!editingItem.handleMagnet);

      setBrushType(editingItem.brushType || '1 - bez kartáčku');
      setBrushHeight(editingItem.brushHeight || '3');
      setHolderType(editingItem.holderType || 'OD - otočný držák');
      setHolderHeight(editingItem.holderHeight || '0');
      setRiveting(!!editingItem.riveting);
      setCornersLook(editingItem.cornersLook || 'vnitřní');
      setWindowBarCount(editingItem.windowBarCount || 0);
      setWindowBarHeight1(editingItem.windowBarHeight1 || 0);
      setWindowBarHeight2(editingItem.windowBarHeight2 || 0);

      setControlMethod(editingItem.controlMethod || 'Ř - řetízek');
      setElectronicsType(editingItem.electronicsType || 'bez motoru');
      setChainLength(editingItem.chainLength || 'standard');
      setCoverFabric(!!editingItem.coverFabric);
      setMountingOpus(editingItem.mountingOpus || '1 - stěna');
      setSafetyElement(!!editingItem.safetyElement);
      setCoverBarCollete(editingItem.coverBarCollete || 'plochá');

      // Textile Roller Blinds specific loader
      setSubmodelType(editingItem.submodelType || 'OPTIMA');
      setUnreelingDir(editingItem.unreelingDir || '1 - ke zdi');
      setBracketColor(editingItem.bracketColor || 'B - bílá');
      setProfileType(editingItem.profileType || 'ne');
      setProfileColorState(editingItem.profileColor || 'A - bílá');
      setWindowManufacturer(editingItem.windowManufacturer || '1 - Velux');
      setExtraHooksPairs(editingItem.extraHooksPairs !== undefined ? editingItem.extraHooksPairs : 1);
      setGuideRailsOption(!!editingItem.guideRailsOption);
      setGuideRailsWidth(editingItem.guideRailsWidth || '1 - úzká');
      setTelescopicPoleCount(editingItem.telescopicPoleCount || 0);

      setLamellaType(editingItem.lamellaType || '25 x 0.18');
      setProfileMaterial(editingItem.profileMaterial || 'Fe');
      setLocoColor(editingItem.locoColor || 'RAL 9010 - bílá');
      setIsCelostin(!!editingItem.isCelostin);
      setColorHarmony(!!editingItem.colorHarmony);
      setControlLengthCustom(editingItem.controlLengthCustom || 'standard');
      setControlAccessory(editingItem.controlAccessory || 'NONE');
      setWindowMaterial(editingItem.windowMaterial || 'PVC');
      setSpacerCount(editingItem.spacerCount || 0);
      setSafetyElementBlinds(!!editingItem.safetyElementBlinds);
      setMountingSupport(!!editingItem.mountingSupport);

      // Plisse specific loader
      setPlisseModel(editingItem.plisseModel || 'AB 42');
      setFirstFabric(editingItem.firstFabric || 'Vzorník látek / Pearl 01');
      setSecondFabric(editingItem.secondFabric || '');
      setMountingType(editingItem.mountingType || 'Zasklívací lišta standard');
      setExtensionRod(editingItem.extensionRod || 'NONE');
      setPlisseCoverBar(editingItem.plisseCoverBar || '');
      setChildSafety(!!editingItem.childSafety);

      // Vertical Blinds specific loader
      setVerticalLimitation(editingItem.verticalLimitation || '1 - bez omezení');
      setVerticalDesign(editingItem.verticalDesign || '1 - standard');
      setVerticalColorsCount(editingItem.verticalColorsCount || 1);
      setVerticalExtraBrackets(editingItem.verticalExtraBrackets || 0);
      setVerticalControlLength(editingItem.verticalControlLength || 'standard');

      // Japanese Wall specific loader
      setPanelWidth(editingItem.panelWidth || 540);
      setPanelCount(editingItem.panelCount || 4);
      setJapTrackType(editingItem.japTrackType || '2-drážková');
      setJapTrackColor(editingItem.japTrackColor || 'bílá (standard)');
      setJapTrackRal(editingItem.japTrackRal || '');
      setJapMagnetsEnabled(!!editingItem.japMagnetsEnabled);
      setJapMagnetCount(editingItem.japMagnetCount || 0);

      // New Exterior and Screen Shading loader
      setBoxType(editingItem.boxType || '');
      setBoxColor(editingItem.boxColor || '');
      setGuideType(editingItem.guideType || '');
      setFabricType(editingItem.fabricType || '');
      setRollDirection(editingItem.rollDirection || '');
      setAwningDrop(editingItem.awningDrop || '');
      setIntegratedMesh(!!editingItem.integratedMesh);
      setEndProfileType(editingItem.endProfileType || '');
      setEndProfileColor(editingItem.endProfileColor || '');
      setGasketType(editingItem.gasketType || '');
      setMountingTypeCustom(editingItem.mountingTypeCustom || '');
      setFabricOrientation(editingItem.fabricOrientation || '');
      setCapColor(editingItem.capColor || '');
      setDistanceProfile(editingItem.distanceProfile || '');
      setElectronicsReceiver(editingItem.electronicsReceiver || '');
      setPreDrilling(editingItem.preDrilling || '');
      setExternalCoverPlate(editingItem.externalCoverPlate || '');
      setInternalCoverPlate(editingItem.internalCoverPlate || '');
      setAwningHood(!!editingItem.awningHood);
      setBracketExtra(editingItem.bracketExtra || 0);
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
      setLamellaSize('Látka 89 mm');
      setLamellaColor('9010');
      setTopProfileColor('bílá');
      setBottomProfileColor('bílá');
      setControlSide('1'); // 1 - stahování k ovladači
      setVerticalLimitation('1 - bez omezení');
      setVerticalDesign('1 - standard');
      setVerticalColorsCount(1);
      setVerticalExtraBrackets(0);
      setVerticalControlLength('standard');
      setChildSafety(false);
    } else if (selectedCat === 'JAPANESE') {
      defaultType = 'JAP_STENA';
      setProductType(defaultType);
      setLamellaSize('Panel standard');
      setLamellaColor('Standard bílá');
      setTopProfileColor('bílá (standard)');
      setBottomProfileColor('bílá (standard)');
      setControlSide('rucni');
      setPanelWidth(540);
      setPanelCount(4);
      setJapTrackType('2-drážková');
      setJapTrackColor('bílá (standard)');
      setJapTrackRal('');
      setJapMagnetsEnabled(false);
      setJapMagnetCount(0);
    } else if (selectedCat === 'ROLETKY') {
      defaultType = 'ROLL_OPUS_OPTIMA_COLLETE';
      setProductType(defaultType);
      setLamellaSize('Tkanina Standard');
      setLamellaColor('9010');
      setTopProfileColor('RAL9010');
      setBottomProfileColor('RAL9010');
      setControlSide('RP');
      setSubmodelType('OPTIMA');
      setUnreelingDir('1 - ke zdi');
      setBracketColor('B - bílá');
      setProfileColorState('A - bílá');
      setWindowManufacturer('1 - Velux');
      setExtraHooksPairs(1);
      setGuideRailsOption(false);
      setGuideRailsWidth('1 - úzká');
      setTelescopicPoleCount(0);
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
    } else if (selectedCat === 'PLISSE') {
      defaultType = 'PLISSE_DARNI';
      setProductType(defaultType);
      setLamellaSize('Plisé látka 20 mm');
      setLamellaColor('Bílá Pearl');
      setTopProfileColor('bílá');
      setBottomProfileColor('bílá');
      setControlSide('madlo');
      setPlisseModel('AB 42');
      setFirstFabric('Pearl 01');
      setSecondFabric('');
      setMountingType('Zasklívací lišta standard');
      setExtensionRod('NONE');
      setPlisseCoverBar('');
      setChildSafety(false);
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
      
      // Initialize screen-specific options
      if (selectedType === 'SCREEN_FIX_W') {
        setProfileType('OV 25x10');
        setHolderType('OD - otočný držák');
        setHolderHeight('10');
        setScreenColor('bílá');
        setMeshColor('Š - šedá');
        setBrushType('1 - bez kartáčku');
        setBrushHeight('3');
        setCornersLook('vnitřní');
        setWindowBarCount(0);
        setRiveting(false);
      } else if (selectedType === 'SCREEN_SLIDE_TRACKS') {
        setProfileType('PS1');
        setScreenColor('bílá');
        setMeshColor('Š - šedá');
        setDoorBarPosition('1ks - v 1/3');
      } else if (selectedType === 'SCREEN_SLIDE_FRAME') {
        setProfileType('PSR1');
        setThreshold('pouze rám');
        setScreenColor('bílá');
        setMeshColor('Š - šedá');
        setBrushType('standardně 1/2 šířky sítě');
        setDoorBarPosition('v 1/2');
      } else if (selectedType === 'SCREEN_SLANT') {
        setProfileType('OV 25x10');
        setScreenColor('bílá');
        setHolderType('OD - otočný držák');
        setMeshColor('Š - šedá');
        setHolderHeight('10');
        setCornersLook('vnější');
        setRiveting(false);
      } else if (selectedType === 'SCREEN_DOOR_PLEAT') {
        setScreenType('a - Stellar');
        setScreenColor('1 - bílá mat');
        setThreshold('2a - standard');
        setMeshColor('Č - černá (plisovaná)');
      } else if (selectedType === 'SCREEN_DOOR_OPEN') {
        setProfileType('1 - DV 50x20');
        setMeshColor('Š - šedá');
        setThreshold('rám');
        setScreenColor('bílá');
        setBrushType('bez kartáčku');
        setDoorBarPosition('v 1/2 po křídle');
        setHandleMagnet(true);
      } else if (selectedType === 'SCREEN_ROLLER_VERSA') {
        setScreenColor('B - bílá');
        setMeshColor('Š - šedá');
        setThreshold('rám okna');
        setHolderType('1 - šrouby + klipsy');
        setBrushType('1 - koncový doraz');
        setHasBrake(false);
      } else if (selectedType === 'SCREEN_ROLLER_DAROS') {
        setScreenColor('B - bílá');
        setMeshColor('Š - šedá');
        setThreshold('rám dveří');
        setHolderType('1 - šrouby + klipsy');
        setBrushType('3 - magnetická lišta');
        setHasBrake(false);
      }
    } else if (selectedType.startsWith('EXT_')) {
      // External defaults
      setControlSide('MOTOR_IO'); // default to high utility motor
      if (selectedType === 'EXT_Z90') setLamellaSize('Z90');
      else if (selectedType === 'EXT_S90') setLamellaSize('S90');
      else if (selectedType === 'EXT_C80') setLamellaSize('C80');
      else if (selectedType === 'EXT_F80') setLamellaSize('F80');
      else if (selectedType === 'EXT_TARA_PREMIO_I') {
        setBoxType('125 H - 125 hranatý');
        setBoxColor('RAL 7016 struktura');
        setGuideType('J - jednoduché (pouze pro box 90, 105, 120, 125)');
        setEndProfileType('PŠ - přiznaná široká (platí pro box 105, 120, 125)');
        setGasketType('G - guma');
        setMountingTypeCustom('a - do ostění');
        setFabricType('SOLTIS HORIZON');
        setFabricOrientation('B - ze zadní strany boxu');
        setControlSide('MOTOR_IO');
      } else if (selectedType === 'EXT_TARA_PREMIO_II') {
        setBoxType('105 T2 - 105 standard');
        setBoxColor('RAL 7016 struktura');
        setGuideType('JU - jednoduché uzavřené (pro box 90, 105, 120, 125)');
        setEndProfileType('PS - přiznaná standard (platí pro box 90, 105)');
        setGasketType('G - guma');
        setCapColor('Č - černá');
        setMountingTypeCustom('a - do ostění');
        setFabricType('SOLTIS HORIZON');
        setFabricOrientation('B - ze zadní strany boxu');
        setControlSide('MOTOR_IO');
      } else if (selectedType === 'EXT_GHIBLI_UNION') {
        setBoxType('1- Union - L');
        setBoxColor('bílá (RAL 9010)');
        setMountingTypeCustom('1 - stěna');
        setDistanceProfile('1 - stěna');
        setControlMethod('2 - motorové');
        setElectronicsReceiver('5 - Sunea 50 io - 30, 50 Nm');
        setFabricType('Soltis Horizont 86 (B)');
      } else if (selectedType === 'EXT_ROLO_VENKOVNI') {
        setBoxType('1 - Radix');
        setBoxColor('Bílá');
        setRollDirection('L - levotočivá');
        setEndProfileType('LA 39 - hliníková lamela vypl. PUR pěnou');
        setEndProfileColor('Bílá');
        setGuideType('F1');
        setPreDrilling('ne');
        setIntegratedMesh(false);
        setControlMethod('1 - ruční');
        setControlSide('LD - levé, dolní');
      } else if (selectedType === 'EXT_ROLO_HELUZ') {
        setBoxType('Heluz 165');
        setEndProfileType('LA 39 - hliníková lamela');
        setExternalCoverPlate('Bílá');
        setInternalCoverPlate('Bílá');
        setGuideType('ZP - zaomítací pouzdro');
        setControlMethod('1 - pásek');
        setControlSide('L - levé');
      }
    } else if (selectedType.startsWith('AWN_')) {
      setControlSide('MOTOR_IO');
      setLamellaSize('Tkanina Premium');
      if (selectedType === 'AWN_UNION_DROP') {
        setBoxType('UNION');
        setAwningDrop('VÝKLOP 1000 mm');
        setBoxColor('RAL 9010 bílá');
        setMountingTypeCustom('ÚCHYT stěna');
        setControlMethod('MANUÁLNÍ - klika');
        setControlSide('pravá');
        setDistanceProfile('1500 mm');
        setGasketType('standardní výška 23 cm');
      }
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
    notes,

    profileType,
    screenType,
    screenColor,
    threshold,
    meshColor,
    coverBar,
    supportingProfile,
    mountingLProfile,

    rivetingPants,
    pantsSide,
    pantsCountStandard,
    pantsCountSelfClose,
    kickPlate,
    brushProfile,
    doorBarPosition,
    handleMagnet,

    brushType,
    brushHeight,
    holderType,
    holderHeight,
    riveting,
    cornersLook,
    windowBarCount,
    windowBarHeight1,
    windowBarHeight2,

    controlMethod,
    electronicsType,
    chainLength,
    coverFabric,
    mountingOpus,
    safetyElement,
    coverBarCollete,

    lamellaType,
    profileMaterial,
    locoColor,
    colorHarmony,
    controlLengthCustom,
    controlAccessory,
    windowMaterial,
    spacerCount,
    safetyElementBlinds,
    mountingSupport,

    // Plisse specific
    plisseModel,
    firstFabric,
    secondFabric,
    mountingType,
    extensionRod,
    plisseCoverBar,
    childSafety,

    // Textile Roller Blinds Specific
    submodelType,
    unreelingDir,
    bracketColor,
    profileColor: profileColorState,
    windowManufacturer,
    extraHooksPairs,
    guideRailsOption,
    guideRailsWidth,
    telescopicPoleCount,

    // Vertical specific
    verticalLimitation,
    verticalDesign,
    verticalColorsCount,
    verticalExtraBrackets,
    verticalControlLength,

    // Japanese specific
    panelWidth,
    panelCount,
    japTrackType,
    japTrackColor,
    japTrackRal,
    japMagnetsEnabled,
    japMagnetCount,

    // New Exterior and Screen Shading variables
    boxType,
    boxColor,
    guideType,
    fabricType,
    rollDirection,
    awningDrop,
    integratedMesh,
    endProfileType,
    endProfileColor,
    gasketType,
    mountingTypeCustom,
    fabricOrientation,
    capColor,
    distanceProfile,
    electronicsReceiver,
    preDrilling,
    externalCoverPlate,
    internalCoverPlate,
    awningHood,
    bracketExtra
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
        <div className="mt-5 hidden md:block border-t border-neutral-800 pt-5">
          <div className="space-y-1 mb-2.5">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Reálný vizuální náhled</span>
          </div>
          <BlindLivePreview item={currentPayloadItem} />
        </div>
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
              className="text-xs text-slate-400 hover:text-slate-600 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition font-semibold"
            >
              Stornovat
            </button>
          </div>

          {/* Unified iOS-first Live Preview for mobile and tablet screens, always updated instantly */}
          <div className="block md:hidden bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden active:scale-[0.99] transition-transform duration-150">
            <div className="absolute top-2.5 left-4 flex items-center gap-1.5 z-25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[7.5px] uppercase font-black text-slate-450 tracking-widest leading-none">Aktivní proud změn QAPI</span>
            </div>
            <div className="pt-2">
              <BlindLivePreview item={currentPayloadItem} />
            </div>
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
                      onClick={() => handleTypeSelect('ROLL_OPUS_OPTIMA_COLLETE')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'ROLL_OPUS_OPTIMA_COLLETE' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">📦</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Roletky OPUS / OPTIMA / COLLETE</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Prémiové roletky v krycích boxech s vodicími lištami. Collete nabízí ploché/radius lišty, Opus montáže na stěnu/strop a motorizaci.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('ROLL_JAZZ')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'ROLL_JAZZ' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🎷</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Univerzální roletky JAZZ</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Univerzální řady Jazz 17, Expert, 32, 38 Motor, 45. Výhodou Jazz 17 je bezvrtná montáž na křídlo okna pomocí plastových úchytů.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('ROLL_SONATA')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'ROLL_SONATA' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🎛️</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Textilní roletky SONATA / XL</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Základní i XL řada, možnost provedení Den/Noc. U verze XL je k dispozici pokročilé motorické ovládání Somfy IO/RTS.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('ROLL_STREAM_S')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'ROLL_STREAM_S' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🪟</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Střešní roletka STREAM-S</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Speciálně navržená pro střešní okna (Velux, Fakro, Roto). Polohování a stínění látky je zajištěno pomocí polohovacích háčků.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('ROLL_STREAM_PLUS')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'ROLL_STREAM_PLUS' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🪢</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Interiérová roletka STREAM PLUS</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Stylová varianta s ovládací šňůrou zespodu všitého dřevěného těžítka. Možnost instalace ke zdi či ode zdi s montážním profilem.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('ROLL_LEGEND')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'ROLL_LEGEND' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🏔️</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Střešní roletka LEGEND</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Premium střešní roleta s bočními vodicími Alu lištami. Ovládání plynulým tahem madla, ideální pro vysoká okna s teleskopickou tyčí.</p>
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
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'SCREEN_FIX_W' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🛡️</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Pevné okenní sítě</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Základní i LUX hliníkové profily (OV 25x10, OE 24x24, ISSO OV/OE, LUX atd.) s možností protipylové sítě či nanovlákna.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('SCREEN_DOOR_OPEN')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'SCREEN_DOOR_OPEN' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🚪</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Pevné dveřní sítě</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Křídlové dveřní profily DV/DE 50x20 a podroletový LUX 40x20. Volba samozavíracích pantů, okopové lišty a kartáčku.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('SCREEN_SLIDE_TRACKS')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'SCREEN_SLIDE_TRACKS' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">↔️</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Posuvné sítě v lištách</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Jednokřídlé posuvné sítě v horní/dolní liště (profil PS1, PS1 ECO). Křídlo se lištami posouvá po rámu okna bez vrtání křídla.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('SCREEN_SLIDE_FRAME')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'SCREEN_SLIDE_FRAME' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🖼️</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Posuvné sítě v rámu</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Profily PSR1/PSR2 a ECO varianty. Posuv křídla uvnitř celoobvodového rámu, montáž na rám okna či do ostění.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('SCREEN_SLANT')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'SCREEN_SLANT' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">📐</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Pevné sítě - šikminy</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Atypické sítě pro šikmé okenní otvory ze speciálních profilů (OV 25x10, ISSO OV 25x10, ISSO OE 19x8).</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('SCREEN_DOOR_PLEAT')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'SCREEN_DOOR_PLEAT' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">✨</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Plisovaná dveřní síť QAPI</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Luxusní skládané sítě se stabilní polohou v jakémkoliv místě roztažení, nízkým bezbariérovým prahem a profily Stellar.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('SCREEN_ROLLER_VERSA')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'SCREEN_ROLLER_VERSA' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🌀</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Rolovací okenní síť VERSA</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Okenní samonavíjecí síť proti hmyzu. Box s vodicími lištami, tlumenou pružinou a koncovými dorazy.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('SCREEN_ROLLER_DAROS')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-32 cursor-pointer ${
                        productType === 'SCREEN_ROLLER_DAROS' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🔄</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Rolovací dveřní síť DAROS</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Horizontální rolovací dveřní síť. Boční kazetový box, magnetická uzavírací lišta a bezbariérový průchod.</p>
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

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('EXT_TARA_PREMIO_I')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'EXT_TARA_PREMIO_I' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">📦</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Screenová roleta TARA PREMIO I</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Špičková screenová clona s velkou kapacitou boxu (125, 150 mm) a tichým chodem. Vhodná pro velké rozměry a zaomítací boxy.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('EXT_TARA_PREMIO_II')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'EXT_TARA_PREMIO_II' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🪐</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Screenová roleta TARA PREMIO II</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Kompaktní verze (box 90, 105, 120 mm) screenů s možností barvy koncovek v černé či antracitové barvě.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('EXT_GHIBLI_UNION')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'EXT_GHIBLI_UNION' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🎭</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Screen roleta GHIBLI I / UNION-L</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Klasická exteriérová látková roleta. Union-L na lanko do 4x3m, Ghibli I s kazetou do 4x2.5m (pouze motor).</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('EXT_ROLO_VENKOVNI')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'EXT_ROLO_VENKOVNI' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🌀</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Venkovní roleta RADIX / COVERT</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Hliníkové lamely s polyuretanovou výplní. Volba integrované sítě, boxů Radix R1/R2, Covert, či Combi.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('EXT_ROLO_HELUZ')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'EXT_ROLO_HELUZ' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🏢</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Rolety do překladu HELUZ</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Speciální provedení pro stavební překlady Heluz 165 a 220. Čistá integrace přímo do zdiva stavby.</p>
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

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('AWN_UNION_DROP')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'AWN_UNION_DROP' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">⛺</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Výklopná markýza UNION / K / B</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Elegantní výklopná markýza vhodná pro balkóny a výlohy. Typy Union, kasetový Union-K, či manuální Union-B.</p>
                      </div>
                    </button>
                  </>
                )}

                {/* Plisse Options */}
                {category === 'PLISSE' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTypeSelect('PLISSE_DARNI')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'PLISSE_DARNI' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🎋</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Plisé DARNI (Komfort řada)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Mimořádně flexibilní řada pro širokou škálu oken. Nabízí modely AB, DB, PB ovládané madlem nebo modely AO s provázkem.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeSelect('PLISSE_LAGARTA')}
                      className={`p-4 rounded-xl border text-left transition hover:border-indigo-300 flex items-start gap-3 h-28 cursor-pointer ${
                        productType === 'PLISSE_LAGARTA' ? 'bg-indigo-50/30 border-indigo-550 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-lg bg-white p-2 rounded-lg border border-slate-100 shrink-0">🦎</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Plisé LAGARTA (Slim design)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Kompaktní designová řada pro moderní okenní rámy. Nabízí modely řady PM (madlo) nebo PP (s dětskou pojistkou).</p>
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

              {/* Mobile preview handled globally at the top */}
            </div>
          )}

          {/* STEP 4: Colors & Materials */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-normal">
                {category === 'SCREENS' || category === 'ROLETKY' || category === 'HORIZONTAL'
                  ? 'Vyplňte detailní technické parametry podle požadavků výroby.'
                  : 'Vyberte vzhled stínění. Provedení lamel a profilů ovlivňuje cenu i expedici.'}
              </p>

              {category === 'SCREENS' && (
                <div className="space-y-4 bg-slate-50 border border-slate-205 p-4 rounded-xl">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black uppercase text-indigo-650 tracking-wider">Dotazník na míru: SÍTĚ PROTI HMYZU</span>
                  </div>

                  {productType === 'SCREEN_DOOR_PLEAT' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Plisé sítě */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ Plisé sítě</label>
                        <select
                          value={screenType}
                          onChange={(e) => setScreenType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="">-- Vyberte model --</option>
                          <option value="a - Stellar">a - Stellar (Plisé)</option>
                          <option value="b - Stellar opona">b - Stellar opona</option>
                          <option value="c - Stellar Lux">c - Stellar Lux (Prvkový)</option>
                          <option value="d - Stellar Lux opona">d - Stellar Lux opona</option>
                          <option value="e - Stellar Mini">e - Stellar Mini</option>
                          <option value="f - Stellar Neo">f - Stellar Neo</option>
                          <option value="g - Stellar Neo opona">g - Stellar Neo opona</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva profilu</label>
                        <select
                          value={screenColor}
                          onChange={(e) => setScreenColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="1 - bílá mat">1 - bílá mat</option>
                          <option value="2 - hnědá mat">2 - hnědá mat</option>
                          <option value="3 - antracit mat">3 - antracit mat</option>
                          <option value="4 - DB 703">4 - DB 703</option>
                          <option value="5 - antracit str.">5 - antracit str.</option>
                          <option value="6 - nástřik - zlatý dub (Stellar Mini)">6 - nástřik - zlatý dub (Jen Stellar Mini)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ Prahu</label>
                        <select
                          disabled={screenType.includes('Neo')}
                          value={threshold}
                          onChange={(e) => setThreshold(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800 disabled:opacity-50"
                        >
                          {screenType.includes('Mini') ? (
                            <>
                              <option value="1a - standard">1a - standard (Mini)</option>
                              <option value="1b - zešikmený">1b - zešikmený</option>
                            </>
                          ) : (
                            <>
                              <option value="2a - standard">2a - standard</option>
                              <option value="2b - s praporkem">2b - s praporkem</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva síťoviny</label>
                        <select
                          value={meshColor}
                          onChange={(e) => setMeshColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="černá">Černá plisovaná (standard)</option>
                          <option value="šedá (pouze Stellar mini)">Šedá (pro Mini)</option>
                        </select>
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-2 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={coverBar}
                            disabled={!screenType.includes('Mini')}
                            onChange={(e) => setCoverBar(e.target.checked)}
                            className="rounded text-indigo-600"
                          />
                          Krycí lišta (Mini)
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={supportingProfile}
                            disabled={screenType.includes('Mini') || screenType.includes('Neo')}
                            onChange={(e) => setSupportingProfile(e.target.checked)}
                            className="rounded text-indigo-600"
                          />
                          Vynášecí profil
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={mountingLProfile}
                            disabled={screenType.includes('Mini')}
                            onChange={(e) => setMountingLProfile(e.target.checked)}
                            className="rounded text-indigo-600"
                          />
                          Montážní L-profil
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Rolovací sítě (VERSA okenní & DAROS dveřní) */}
                  {(productType === 'SCREEN_ROLLER_VERSA' || productType === 'SCREEN_ROLLER_DAROS') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Barva profilu (Box + vodicí lišty) */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva (box + vodicí lišty)</label>
                        <select
                          value={screenColor}
                          onChange={(e) => setScreenColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="B - bílá">B - bílá</option>
                          <option value="H - hnědá">H - hnědá</option>
                          <option value="zlatý dub - 21">zlatý dub - 21 (Renolit)</option>
                          <option value="tmavý dub - 24">tmavý dub - 24 (Renolit)</option>
                          <option value="sapeli - 26">sapeli - 26 (Renolit)</option>
                          <option value="tmavý ořech - 28">tmavý ořech - 28 (Renolit)</option>
                          <option value="RAL - č.">RAL - č. (nástřik, uveďte odstín v poznámce)</option>
                        </select>
                      </div>

                      {/* Barva síťoviny */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva síťoviny</label>
                        <select
                          value={meshColor}
                          onChange={(e) => setMeshColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="Š - šedá">Š - šedá</option>
                          <option value="Č - černá">Č - černá</option>
                        </select>
                      </div>

                      {/* Montáž */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Montáž sítě</label>
                        <select
                          value={threshold}
                          onChange={(e) => setThreshold(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="ostění">v ostění</option>
                          <option value="rám okna">na rám okna</option>
                          <option value="rám dveří">na rám dveří</option>
                          <option value="střešní okno">na střešní okno</option>
                        </select>
                      </div>

                      {/* Typ montáže */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ montáže</label>
                        <select
                          value={holderType}
                          onChange={(e) => setHolderType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="1 - šrouby + klipsy">1 - šrouby + klipsy</option>
                          <option value="2 - plastový montážní úchyt">2 - plastový montážní úchyt</option>
                          <option value="3 - plastový montážní úchyt + klipsy">3 - plastový montážní úchyt + klipsy</option>
                        </select>
                      </div>

                      {/* Typ dorazů */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ dorazů</label>
                        <select
                          value={brushType}
                          onChange={(e) => setBrushType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          {productType === 'SCREEN_ROLLER_VERSA' ? (
                            <>
                              <option value="1 - koncový doraz">1 - koncový doraz</option>
                              <option value="2 - záchytná lišta">2 - záchytná lišta</option>
                            </>
                          ) : (
                            <>
                              <option value="3 - magnetická lišta">3 - magnetická lišta</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Brzda & Informace */}
                      <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-200 flex flex-col gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-850 text-xs">
                          <input
                            type="checkbox"
                            checked={hasBrake}
                            onChange={(e) => setHasBrake(e.target.checked)}
                            className="rounded text-indigo-600"
                          />
                          Brzda (ANO / NE) - pomalé plynulé navíjení
                        </label>
                        <span className="text-[10px] text-slate-400 italic">
                          Poznámka: Při lakování do odstínu RAL se automaticky přiřazují černé plastové komponenty.
                        </span>
                      </div>
                    </div>
                  )}

                  {productType === 'SCREEN_DOOR_OPEN' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Pevné dveřní sítě s panty */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ dveřního profilu</label>
                        <select
                          value={profileType}
                          onChange={(e) => setProfileType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="">-- Vyberte profil --</option>
                          <option value="1 - DV 50x20">1 - DV 50x20</option>
                          <option value="2 - DE 50x20">2 - DE 50x20</option>
                          <option value="3 - DE 50x20 LUX">3 - DE 50x20 LUX</option>
                          <option value="4a - DE 40x20 LUX standard">4a - DE 40x20 LUX standard</option>
                          <option value="4b - DE 40x20 LUX rám R4">4b - DE 40x20 LUX rám R4</option>
                          <option value="4c - DE 40x20 LUX rám R3">4c - DE 40x20 LUX rám R3</option>
                          <option value="4d - DE 40x20 LUX dvoukřídlo R4">4d - DE 40x20 LUX dvoukřídlo R4</option>
                          <option value="4e - DE 40x20 LUX dvoukřídlo R3">4e - DE 40x20 LUX dvoukřídlo R3</option>
                          <option value="5 - DE 40x20 LUX pod roletu">5 - DE 40x20 LUX pod roletu</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Síťovina / Vlákno</label>
                        <select
                          value={meshColor}
                          onChange={(e) => setMeshColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="Š - šedá">Š – šedá</option>
                          <option value="Č - černá">Č – černá</option>
                          <option value="P - protipylová černá">P – protipylová černá (nelze pro DV50x20)</option>
                          <option value="N - s nanovláknem černá">N – s nanovláknem černá (pouze LUX)</option>
                          <option value="PSČ - pet screen černá">PSČ – pet screen černá</option>
                          <option value="PSŠ - pet screen šedá">PSŠ – pet screen šedá</option>
                        </select>
                      </div>

                      <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">Nýtování pantů</label>
                          <input
                            type="checkbox"
                            checked={rivetingPants}
                            onChange={(e) => setRivetingPants(e.target.checked)}
                            className="rounded text-indigo-600 font-mono"
                          />
                        </div>
                        {rivetingPants && (
                          <div className="flex gap-4 text-xs font-semibold mt-1">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="pantsSide"
                                checked={pantsSide === 'L'}
                                onChange={() => setPantsSide('L')}
                                className="text-indigo-600"
                              />
                              L – levá
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="pantsSide"
                                checked={pantsSide === 'P'}
                                onChange={() => setPantsSide('P')}
                                className="text-indigo-600"
                              />
                              P – pravá
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Počet pantů</label>
                        <div className="grid grid-cols-2 gap-2 mt-0.5">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block">Standardní ks:</span>
                            <input
                              type="number"
                              min="0"
                              value={pantsCountStandard}
                              onChange={(e) => setPantsCountStandard(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full p-1 border rounded border-slate-200 text-xs text-center font-mono font-bold"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block">Samozavírací ks:</span>
                            <input
                              type="number"
                              min="0"
                              value={pantsCountSelfClose}
                              onChange={(e) => setPantsCountSelfClose(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full p-1 border rounded border-slate-200 text-xs text-center font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Dveřní příčka – poloha</label>
                        <select
                          value={doorBarPosition}
                          onChange={(e) => setDoorBarPosition(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="bez příčky">Bez příčky</option>
                          <option value="1ks - v 1/3">1ks - v 1/3 výšky</option>
                          <option value="1ks - vlastní poloha">1ks - vlastní poloha</option>
                          <option value="2ks - v 1/3 a ve 2/3">2ks - v 1/3 a ve 2/3 výšky</option>
                          <option value="2ks - vlastní polohy">2ks - vlastní polohy</option>
                        </select>
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-2 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={kickPlate}
                            onChange={(e) => setKickPlate(e.target.checked)}
                            className="rounded text-indigo-600"
                          />
                          Okopová příčka (100 mm)
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={brushProfile}
                            onChange={(e) => setBrushProfile(e.target.checked)}
                            className="rounded text-indigo-600"
                          />
                          Profil s kartáčkem
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={handleMagnet}
                            onChange={(e) => setHandleMagnet(e.target.checked)}
                            className="rounded text-indigo-600"
                          />
                          Madlo a magnet
                        </label>
                      </div>
                    </div>
                  )}

                  {productType === 'SCREEN_FIX_W' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Pevné okenní sítě */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ okenního profilu</label>
                        <select
                          value={profileType}
                          onChange={(e) => setProfileType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="">-- Vyberte profil --</option>
                          <option value="OV 25x10">OV 25x10 (Pevná síťovina)</option>
                          <option value="OE 24x24">OE 24x24</option>
                          <option value="ISSO OV 19x8">ISSO OV 19x8 (Meziskelní / Rám)</option>
                          <option value="ISSO OV 25x10">ISSO OV 25x10</option>
                          <option value="ISSO OE 34x9 LUX">ISSO OE 34x9 LUX</option>
                          <option value="ISSO OE 19x8">ISSO OE 19x8</option>
                          <option value="ISSO OE 25x10">ISSO OE 25x10</option>
                          <option value="ISSO 37x10">ISSO 37x10</option>
                          <option value="OE 32x11 LUX">OE 32x11 LUX</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Způsob uchycení</label>
                        <select
                          value={holderType}
                          onChange={(e) => setHolderType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="OD - otočný držák">OD - otočný držák</option>
                          <option value="O - obrtlík">O - obrtlík (vrtaný)</option>
                          <option value="Z - Z držák">Z - Z držák</option>
                          <option value="P - pružinový kolík">P - pružinový kolík</option>
                        </select>
                      </div>

                      {(holderType === 'OD - otočný držák' || holderType === 'Z - Z držák') && (
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">
                            Výška držáku mm
                          </label>
                          <select
                            value={holderHeight}
                            onChange={(e) => setHolderHeight(e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                          >
                            {holderType === 'Z - Z držák' ? (
                              profileType === 'ISSO OV 19x8' || profileType.includes('19x8') ? (
                                <>
                                  <option value="10">10 (standard)</option>
                                  <option value="12">12</option>
                                  <option value="14">14</option>
                                  <option value="15">15</option>
                                  <option value="17">17</option>
                                  <option value="20">20</option>
                                </>
                              ) : (
                                <>
                                  <option value="8">8</option>
                                  <option value="10">10</option>
                                  <option value="12">12</option>
                                  <option value="14">14</option>
                                  <option value="16">16 (standard)</option>
                                  <option value="18">18</option>
                                  <option value="20">20</option>
                                  <option value="22">22</option>
                                  <option value="24">24</option>
                                  <option value="30">30</option>
                                </>
                              )
                            ) : (
                              <>
                                <option value="0">0</option>
                                <option value="4">4</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="9">9</option>
                                <option value="11">11 (standard)</option>
                                <option value="12">12</option>
                                <option value="13">13</option>
                                <option value="15">15</option>
                                <option value="17">17</option>
                                <option value="19">19</option>
                                <option value="21">21</option>
                                <option value="23">23</option>
                              </>
                            )}
                          </select>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Síťovina / Vlákno</label>
                        <select
                          value={meshColor}
                          onChange={(e) => setMeshColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="Š - šedá">Š – šedá</option>
                          <option value="Č - černá">Č – černá</option>
                          <option value="P - protipylová černá">P – Protipylová černá</option>
                          <option value="N - s nanovláknem černá">N – s nanovláknem černá</option>
                          <option value="PSČ - pet screen černá">PSČ – pet screen černá</option>
                          <option value="PSŠ - pet screen šedá">PSŠ – pet screen šedá</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">Kartáček</label>
                          <select
                            value={brushType}
                            onChange={(e) => setBrushType(e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2 text-slate-800 font-semibold"
                          >
                            <option value="1 - bez kartáčku">bez kartáčku</option>
                            <option value="2 - na výšku">na výšku</option>
                            <option value="3 - na šířku">na šířku</option>
                            <option value="4 - po celým obvodu">po celém obvodu</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">Výška (mm)</label>
                          <select
                            disabled={brushType.includes('bez')}
                            value={brushHeight}
                            onChange={(e) => setBrushHeight(e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2 text-slate-800 font-semibold disabled:opacity-50"
                          >
                            <option value="3">3 mm</option>
                            <option value="5">5 mm</option>
                            <option value="8">8 mm</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">Provedení rohů</label>
                          <select
                            value={cornersLook}
                            onChange={(e) => setCornersLook(e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2 text-slate-800 font-semibold"
                          >
                            <option value="vnitřní">vnitřní (skryté)</option>
                            <option value="vnější">vnější (OV 25x10 / OE 24x24)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">Příčka ks</label>
                          <input
                            type="number"
                            min="0"
                            max="2"
                            value={windowBarCount}
                            onChange={(e) => setWindowBarCount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2 font-bold font-mono text-center"
                          />
                        </div>
                      </div>

                      {windowBarCount > 0 && (
                        <div className="col-span-1 sm:col-span-2 space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Poloha okenní příčky (odspodu na střed)</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block">Příčka 1 (mm):</span>
                              <input
                                type="number"
                                value={windowBarHeight1}
                                onChange={(e) => setWindowBarHeight1(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full p-1.5 border rounded text-xs font-mono text-center font-bold"
                              />
                            </div>
                            {windowBarCount > 1 && (
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold block">Příčka 2 (mm):</span>
                                <input
                                  type="number"
                                  value={windowBarHeight2}
                                  onChange={(e) => setWindowBarHeight2(Math.max(0, parseInt(e.target.value) || 0))}
                                  className="w-full p-1.5 border rounded text-xs font-mono text-center font-bold"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="col-span-1 sm:col-span-2 pt-1 text-xs flex gap-4 font-bold text-slate-800">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={riveting}
                            onChange={(e) => setRiveting(e.target.checked)}
                            className="rounded text-indigo-600"
                          />
                          Nýtování rohů
                        </label>
                      </div>
                    </div>
                  )}

                  {productType === 'SCREEN_SLIDE_TRACKS' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Posuvné sítě v lištách */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ - profil křídla</label>
                        <select
                          value={profileType}
                          onChange={(e) => setProfileType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="PS1">PS1 (Profil 13 × 62, standard)</option>
                          <option value="PS1 ECO">PS1 ECO (Profil 12 × 37)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva profilu</label>
                        <select
                          value={screenColor}
                          onChange={(e) => setScreenColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="bílá">bílá</option>
                          <option value="hnědá">hnědá</option>
                          <option value="zlatý dub - renolit">zlatý dub - renolit</option>
                          <option value="RAL">nástřik RAL (uveďte číslo do poznámky)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva síťoviny</label>
                        <select
                          value={meshColor}
                          onChange={(e) => setMeshColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="Š - šedá">Š – šedá (standard)</option>
                          <option value="Č - černá">Č – černá</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Poloha příčky</label>
                        <select
                          value={doorBarPosition}
                          onChange={(e) => setDoorBarPosition(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="1ks - v 1/3">1ks - v 1/3 výšky (standard)</option>
                          <option value="1ks - vlastní poloha">1ks - vlastní poloha (uveďte v poznámce v mm)</option>
                        </select>
                      </div>

                      <div className="col-span-1 sm:col-span-2 bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl text-[11px] text-slate-600 space-y-1.5 font-medium">
                        <div className="font-bold text-indigo-900 flex items-center gap-1">
                          <span>💡</span> Doplňující informace pro výrobu:
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600">
                          <li>Materiál je z extrudovaného hliníkového profilu.</li>
                          <li>Dveřní příčka se používá <span className="font-bold text-slate-800">pouze u profilu ECO</span>, zároveň slouží jako madlo.</li>
                          <li>Uchycení je možné <span className="font-bold text-indigo-900">pouze do rámu okna</span>.</li>
                          <li>Při polepu do fólie zlatý dub nelze polepit drážku profilu (základ je hnědý profil).</li>
                          <li className="text-indigo-800 font-bold">Standardní délka lišt je dvojnásobek šířky křídla + 20 mm pro dorazy.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {productType === 'SCREEN_SLIDE_FRAME' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Posuvné sítě v rámu */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ - profil křídla</label>
                        <select
                          value={profileType}
                          onChange={(e) => setProfileType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="PSR1">PSR1 (Profil 13 × 62, standard)</option>
                          <option value="PSR1 ECO">PSR1 ECO (Profil 12 × 37)</option>
                          <option value="PSR2">PSR2 (Profil 13 × 62, dvoukřídlá vně)</option>
                          <option value="PSR2 ECO">PSR2 ECO (Profil 12 × 37, dvoukřídlá vně)</option>
                          <option value="PSR1 T">PSR1 T (Profil 13 × 62 s příčkou)</option>
                          <option value="PSR2 T">PSR2 T (Profil 13 × 62 dvoukřídlá T)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Způsob montáže</label>
                        <select
                          disabled={profileType === 'PSR1' || profileType === 'PSR1 ECO'}
                          value={profileType === 'PSR1' || profileType === 'PSR1 ECO' ? 'pouze rám' : threshold}
                          onChange={(e) => setThreshold(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800 disabled:opacity-60"
                        >
                          {profileType === 'PSR1' || profileType === 'PSR1 ECO' ? (
                            <option value="pouze rám">Pouze rám</option>
                          ) : (
                            <>
                              <option value="rám">rám (standard)</option>
                              <option value="ostění">ostění (dveřní rám do zdi)</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva profilu</label>
                        <select
                          value={screenColor}
                          onChange={(e) => setScreenColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="bílá">bílá</option>
                          <option value="hnědá">hnědá</option>
                          <option value="zlatý dub - renolit">zlatý dub - renolit</option>
                          <option value="RAL">nástřik RAL (uveďte číslo do poznámky)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva síťoviny</label>
                        <select
                          value={meshColor}
                          onChange={(e) => setMeshColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="Š - šedá">Š – šedá (standard)</option>
                          <option value="Č - černá">Č – černá</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Šířka křídla</label>
                        <select
                          value={brushType}
                          onChange={(e) => setBrushType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="standardně 1/2 šířky sítě">Standardně (1/2 z celkové šířky sítě)</option>
                          <option value="vlastní šířka křídla">Vlastní šířka křídla (zadejte rozměr do poznámky)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Poloha příčky</label>
                        <select
                          value={doorBarPosition}
                          onChange={(e) => setDoorBarPosition(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="v 1/2">v 1/2 výšky (standard)</option>
                          <option value="v 1/3">v 1/3 výšky</option>
                          <option value="vlastní (mm)">vlastní poloha (zadejte do poznámky)</option>
                        </select>
                      </div>

                      <div className="col-span-1 sm:col-span-2 bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl text-[11px] text-slate-600 space-y-1.5 font-medium">
                        <div className="font-bold text-indigo-900 flex items-center gap-1">
                          <span>💡</span> Konstrukční pokyny:
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600">
                          <li>Materiál je z extrudovaného hliníkového profilu.</li>
                          <li>Dveřní příčka se používá <span className="font-bold text-slate-800">pouze u profilu ECO</span>, zároveň slouží jako madlo.</li>
                          <li>Předvrtání montážních otvorů není součástí dodávky sítě.</li>
                          <li>Montáž PSR1 a PSR1 ECO se provádí pouze na rám. Montáž PSR2 / ECO / T je možná na rám i do ostění.</li>
                          <li>Příčka je standardně umístěna od spodní hrany křídla do 1/3 výšky, není-li zvoleno jinak.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {productType === 'SCREEN_SLANT' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Pevné sítě šikminy */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Profil - typ okenní sítě</label>
                        <select
                          value={profileType}
                          onChange={(e) => {
                            setProfileType(e.target.value);
                            // default holder Heights guide
                            if (e.target.value === 'ISSO OE 19x8') {
                              setHolderHeight('11');
                            } else {
                              setHolderHeight('10');
                            }
                          }}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="OV 25x10">OV 25x10</option>
                          <option value="ISSO OV 25x10">ISSO OV 25x10</option>
                          <option value="ISSO OE 19x8">ISSO OE 19x8 (LUX / Tenký)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva profilu</label>
                        <select
                          value={screenColor}
                          onChange={(e) => setScreenColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="bílá">bílá</option>
                          <option value="hnědá">hnědá</option>
                          <option value="antracit">antracit</option>
                          <option value="zlatý dub">zlatý dub</option>
                          <option value="RAL">nástřik RAL (uveďte číslo do poznámky)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Způsob uchycení sítě</label>
                        <select
                          value={holderType}
                          onChange={(e) => setHolderType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="OD - otočný držák">OD - otočný držák</option>
                          <option value="O - obrtlík">O - obrtlík (vrtaný)</option>
                          <option value="Z - Z držák">Z - Z držák (pro OV 25x10)</option>
                          <option value="P - pružinový kolík">P - pružinový kolík (vrtaný)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Síťovina</label>
                        <select
                          value={meshColor}
                          onChange={(e) => setMeshColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="Š - šedá">Š – šedá (standard)</option>
                          <option value="Č - černá">Č – černá</option>
                          {profileType === 'ISSO OE 19x8' && (
                            <>
                              <option value="P - protipylová černá">P – Protipylová černá (pouze 19x8)</option>
                              <option value="PSČ - pet screen černá">PSČ – Pet screen černá (odolná, pouze 19x8)</option>
                              <option value="PSŠ - pet screen šedá">PSŠ – Pet screen šedá (odolná, pouze 19x8)</option>
                            </>
                          )}
                        </select>
                      </div>

                      {(holderType === 'OD - otočný držák' || holderType === 'Z - Z držák') && (
                        <div className="space-y-1 col-span-1 sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">Výška držáku (mm)</label>
                          <select
                            value={holderHeight}
                            onChange={(e) => setHolderHeight(e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                          >
                            {profileType === 'ISSO OE 19x8' ? (
                              <>
                                <option value="0">0</option>
                                <option value="4">4</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="9">9</option>
                                <option value="11">11 (Standard okno)</option>
                                <option value="12">12</option>
                                <option value="13">13</option>
                                <option value="15">15</option>
                                <option value="17">17</option>
                                <option value="19">19</option>
                                <option value="21">21</option>
                                <option value="23">23</option>
                              </>
                            ) : (
                              <>
                                <option value="10">10 (Standard OV)</option>
                                <option value="12">12</option>
                                <option value="14">14</option>
                                <option value="15">15</option>
                                <option value="17">17</option>
                                <option value="20">20</option>
                              </>
                            )}
                          </select>
                        </div>
                      )}

                      <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[11px] text-slate-800">
                          <input
                            type="checkbox"
                            checked={riveting}
                            onChange={(e) => setRiveting(e.target.checked)}
                            className="rounded text-indigo-600"
                          />
                          Nýtování rohů
                        </label>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase font-bold">Provedení rohů</span>
                          <select
                            value={cornersLook}
                            onChange={(e) => setCornersLook(e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-white p-1.5 font-semibold text-slate-800"
                          >
                            <option value="vnější">vnější (plastové rohy)</option>
                            <option value="vnitřní">vnitřní (skryté rohy)</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-span-1 sm:col-span-2 bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-800 space-y-1 font-semibold">
                        <div className="flex items-center gap-1">
                          <span>❗</span> Upozornění pro výrobu šikmin:
                        </div>
                        <p>Při použití pružinového kolíku, nebo obrtlíku je nutné vrtat přímo do rámu okna. Výrobní tolerance u okenních atypických sítí je -3 mm. Dodržte přesný nákres tvaru okna z pohledu z exteriéru nebo interiéru!</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {category === 'ROLETKY' && (
                <div className="space-y-4 bg-slate-50 border border-slate-205 p-4 rounded-xl">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Dotazník na míru: TEXTILNÍ ROLETKY</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Ovládání roletky</label>
                      <select
                        value={controlMethod}
                        onChange={(e) => setControlMethod(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                      >
                        <option value="Ř - řetízek">Ř – řetízek (Ruční)</option>
                        <option value="M1 - Motor 230 V">M1 – Motor 230 V (FD25AE)</option>
                        <option value="M2 - Motor 12 V">M2 – Motor 12 V (FD25BE)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-650 uppercase">Radio ovladač ERTE</label>
                      <select
                        disabled={controlMethod === 'Ř - řetízek'}
                        value={electronicsType}
                        onChange={(e) => setElectronicsType(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800 disabled:opacity-50"
                      >
                        <option value="bez motoru">-- Vyberte ovladač --</option>
                        <option value="RE05 1 kanálový">RE05 1 kanálový - bílý</option>
                        <option value="RE06 2 kanálový">RE06 2 kanálový - bílý</option>
                        <option value="RE07 1 kanálový">RE07 1 kanálový - bílý</option>
                        <option value="RE07 5 kanálový">RE07 5 kanálový - bílý</option>
                        <option value="RE07 15 kanálový">RE07 15 kanálový - bílý</option>
                        <option value="RE08 1 kanálový">RE08 1 kanálový - bílý</option>
                        <option value="RE08 5 kanálový">RE08 5 kanálový - bílý</option>
                        <option value="RE08 15 kanálový">RE08 15 kanálový - bílý</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Délka řetízku (mm)</label>
                      <input
                        type="text"
                        value={chainLength}
                        onChange={(e) => setChainLength(e.target.value)}
                        placeholder="standard nebo hodnota v mm"
                        className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-850 font-mono text-center"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Krycí lišta Collete</label>
                      <select
                        value={coverBarCollete}
                        onChange={(e) => setCoverBarCollete(e.target.value as any)}
                        className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                      >
                        <option value="plochá">Plochá lišta</option>
                        <option value="radius">Radius lišta</option>
                      </select>
                    </div>

                    {productType.includes('OPUS') && (
                      <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 col-span-1 sm:col-span-2 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-650 uppercase mb-0.5">Uchycení Opus</label>
                          <select
                            value={mountingOpus}
                            onChange={(e) => setMountingOpus(e.target.value)}
                            className="w-full p-2 border rounded text-xs select font-bold text-slate-800"
                          >
                            <option value="1 - stěna">1 - stěna</option>
                            <option value="2 - strop">2 - strop</option>
                          </select>
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs">
                            <input
                              type="checkbox"
                              checked={coverFabric}
                              onChange={(e) => setCoverFabric(e.target.checked)}
                              className="rounded text-indigo-600"
                            />
                            Krycí látka
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                        <input
                          type="checkbox"
                          checked={safetyElement}
                          onChange={(e) => setSafetyElement(e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        Bezpečnostní prvek pro prevenci uškrcení (ČSN EN 13120)
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {category === 'HORIZONTAL' && (
                <div className="space-y-6">
                  {/* Premium Apple-Style Header Card */}
                  <div className="bg-[#F2F2F7] p-4 rounded-2xl border border-neutral-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest block leading-none">Technické parametry</span>
                      <h3 className="text-sm font-black text-slate-900 mt-1 uppercase tracking-tight">
                        {productType === 'HZ_25_19' || productType === 'HZ_27_19' 
                          ? 'Tradiční HZ řada (25/27x19 mm)' 
                          : `Systém Isoline (${productType.replace('ISOLINE_', '')})`}
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Konstrukční parametry splňují garanci a standardy kvality QAPI.
                      </p>
                    </div>
                    <div className="px-2.5 py-1.5 bg-[#007AFF] text-white text-[9px] font-black rounded-lg uppercase tracking-wider leading-none shrink-0 shadow-xs">
                      {productType === 'HZ_25_19' || productType === 'HZ_27_19' ? 'HZ - Klasik' : 'Isoline řada'}
                    </div>
                  </div>

                  {/* SUB-FORM 1: TRADIČNÍ HZ ŘADA (HZ 25x19, HZ 27x19) */}
                  {(productType === 'HZ_25_19' || productType === 'HZ_27_19') ? (
                    <div className="space-y-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Ovládání - Strana (P / L) */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">
                            Strana ovládání (P / L) <span className="text-indigo-600 font-normal lowercase">(pohled z místnosti)</span>
                          </label>
                          <div className="flex p-0.5 bg-[#F2F2F7] rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => { playTactileClick(); setControlSide('P'); }}
                              className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition duration-100 ${
                                controlSide === 'P' || controlSide === 'RP'
                                  ? 'bg-white text-[#007AFF] shadow-2xs'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              Pravé (P)
                            </button>
                            <button
                              type="button"
                              onClick={() => { playTactileClick(); setControlSide('L'); }}
                              className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition duration-100 ${
                                controlSide === 'L' || controlSide === 'RL'
                                  ? 'bg-white text-[#007AFF] shadow-2xs'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              Levé (L)
                            </button>
                          </div>
                        </div>

                        {/* Typ žaluzie / Ovládání */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Typ mechanického systému</label>
                          <select
                            value={['M', 'MF', 'IF', 'IRB', 'IRBF', 'IB', 'IBF', 'IBS'].includes(controlSide) ? controlSide : 'M'}
                            onChange={(e) => { playTactileClick(); setControlSide(e.target.value); }}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800 focus:ring-1 focus:ring-indigo-505 focus:border-indigo-505 outline-hidden min-h-[40px] shadow-3xs"
                          >
                            <optgroup label="S bovdenem (táhlo)">
                              <option value="M">M – meziskelní provedení</option>
                              <option value="MF">MF – meziskelní s drátovou fixací</option>
                              <option value="IF">IF – interiérová (boční vývod, fixace)</option>
                              <option value="IRB">IRB – interiérová s brzdou (čelní vývod)</option>
                              <option value="IRBF">IRBF – interiérová s brzdou a drátovou fixací</option>
                            </optgroup>
                            <optgroup label="S plastovou tyčkou a šnekem">
                              <option value="IB">IB – interiérová s brzdou a šnekem</option>
                              <option value="IBF">IBF – interiérová s brzdou, šnekem a fixací</option>
                              <option value="IBS">IBS – interiérová s brzdou, šnekem a střešní fixací</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>

                      {/* Barva profilu pro HZ řadu */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Barva HZ nosného profilu (25 / 27x19 mm)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { value: 'bílá', label: 'Bílá', hex: '#ffffff' },
                            { value: 'hnědá', label: 'Hnědá', hex: '#593E30' },
                            { value: 'stříbrná', label: 'Stříbrná', hex: '#A6A6A6' },
                            { value: 'slonová kost', label: 'Slonová kost', hex: '#EAE6D8' },
                            { value: 'světlá káva', label: 'Světlá káva', hex: '#C2B29E' },
                            { value: 'zlatá 700', label: 'Zlatá ocel 700', hex: '#D4B453' },
                            { value: 'zlatá 714', label: 'Zlatá ocel 714', hex: '#C5A029' }
                          ].map((itemCol) => {
                            const isSelected = locoColor === itemCol.value || (itemCol.value === 'bílá' && locoColor.includes('bílá')) || (itemCol.value === 'hnědá' && locoColor.includes('hnědá')) || (itemCol.value === 'stříbrná' && locoColor.includes('stříbrná'));
                            return (
                              <button
                                key={itemCol.value}
                                type="button"
                                onClick={() => { playTactileClick(); setLocoColor(itemCol.value); }}
                                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition duration-700 select-none cursor-pointer text-[10.5px] font-black ${
                                  isSelected 
                                    ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]' 
                                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                                }`}
                              >
                                <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: itemCol.hex }} />
                                <span className="truncate">{itemCol.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Tloušťka / šířka lamely */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Šířka x tloušťka lamely</label>
                          <select
                            value={lamellaType}
                            onChange={(e) => { playTactileClick(); setLamellaType(e.target.value); }}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-850"
                          >
                            <option value="25 x 0.18">25 × 0.18 mm</option>
                            <option value="25 x 0.21">25 × 0.21 mm (Zesílená)</option>
                            <option value="16 x 0.21">16 × 0.21 mm (Minimalistická úzká)</option>
                          </select>
                        </div>

                        {/* Barva lamely */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Barevný kód lamely stínění</label>
                          <select
                            value={lamellaColor}
                            onChange={(e) => { playTactileClick(); setLamellaColor(e.target.value); }}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-850"
                          >
                            <option value="9010">Bílá (Kód: 9010)</option>
                            <option value="8017">Hnědá (Kód: 8017)</option>
                            <option value="9006">Stříbrná (Kód: 9006)</option>
                            <option value="1013">Slonová kost (Kód: 1013)</option>
                            <option value="8004">Měděně hnědá (Kód: 8004)</option>
                            <option value="8003">Koňakově hnědá (Kód: 8003)</option>
                            <option value="7016">Antracit (Kód: 7016)</option>
                            <option value="W95">Zlatý Dub (Kód: W95)</option>
                          </select>
                        </div>
                      </div>

                      {/* Doplňky a materiály */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Materiál okenního rámu</label>
                          <select
                            value={windowMaterial}
                            onChange={(e) => setWindowMaterial(e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2 font-bold text-slate-800"
                          >
                            <option value="PVC">Plastové (PVC)</option>
                            <option value="dřevo">Dřevěný europrofil</option>
                            <option value="hliník">Hliníkové (Al)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Distanční podložky (ks)</label>
                          <input
                            type="number"
                            min="0"
                            max="8"
                            value={spacerCount}
                            onChange={(e) => setSpacerCount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2 font-bold font-mono text-center"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Standard ovládání (mm)</label>
                          <input
                            type="text"
                            value={controlLengthCustom}
                            onChange={(e) => setControlLengthCustom(e.target.value)}
                            placeholder="standard"
                            className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2 font-bold font-mono text-center"
                          />
                        </div>
                      </div>

                      {/* Boolean Options list */}
                      <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 select-none">
                          <input
                            type="checkbox"
                            checked={isCelostin}
                            onChange={(e) => setIsCelostin(e.target.checked)}
                            className="h-4 w-4 text-[#007AFF] focus:ring-[#007AFF] rounded border-slate-350"
                          />
                          <div>
                            <span className="block text-xs font-black text-slate-900 leading-tight">Domykatelné provedení (Celostín)</span>
                            <span className="block text-[9px] text-slate-400 mt-0.5">Výraznější překrytí stínicích lamel proti prvkům světla.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 select-none">
                          <input
                            type="checkbox"
                            checked={colorHarmony}
                            onChange={(e) => setColorHarmony(e.target.checked)}
                            className="h-4 w-4 text-[#007AFF] focus:ring-[#007AFF] rounded border-slate-350"
                          />
                          <div>
                            <span className="block text-xs font-black text-slate-900 leading-tight">Sladění žebříku + texbandu</span>
                            <span className="block text-[9px] text-slate-400 mt-0.5">Textilní šňůry stoprocentně sladěny s tónem lamely.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 select-none col-span-1 sm:col-span-2">
                          <input
                            type="checkbox"
                            checked={safetyElementBlinds}
                            onChange={(e) => setSafetyElementBlinds(e.target.checked)}
                            className="h-4 w-4 text-[#007AFF] focus:ring-[#007AFF] rounded border-slate-350"
                          />
                          <div>
                            <span className="block text-xs font-black text-slate-900 leading-tight">Systém dětské bezpečnosti (Norma ČSN)</span>
                            <span className="block text-[9px] text-slate-400 mt-0.5">Splňuje unijní nařízení o ochraně batolat.</span>
                          </div>
                        </label>
                      </div>

                    </div>
                  ) : (
                    /* SUB-FORM 2: ŘADA ISOLINE, LOCO, PRIM, ECO */
                    <div className="space-y-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Materiál profilu s iOS Segmented Control */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Materiál nosného profilu</label>
                            {profileMaterial === 'Al' && (
                              <span className="text-[10px] text-amber-600 font-bold">Standard Isoline & Eco</span>
                            )}
                          </div>
                          <div className="flex p-0.5 bg-[#F2F2F7] rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => { playTactileClick(); setProfileMaterial('Fe'); }}
                              className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition duration-100 ${
                                profileMaterial === 'Fe'
                                  ? 'bg-white text-[#007AFF] shadow-2xs'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              Fe – Ocel s polyesterovým lakem
                            </button>
                            <button
                              type="button"
                              disabled={productType === 'ISOLINE_PRIM' || productType === 'ISOLINE_LOCO'}
                              onClick={() => { playTactileClick(); setProfileMaterial('Al'); }}
                              className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition duration-100 disabled:opacity-30 disabled:cursor-not-allowed ${
                                profileMaterial === 'Al'
                                  ? 'bg-white text-[#007AFF] shadow-2xs'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              Al – Hliník extruze
                            </button>
                          </div>
                          {(productType === 'ISOLINE_PRIM' || productType === 'ISOLINE_LOCO') && (
                            <span className="text-[9px] text-slate-400 block italic leading-none">
                              * Vyžaduje železný Fe profil. Al profil není povolen pro řady Loco a Prim v XLS specifikaci.
                            </span>
                          )}
                        </div>

                        {/* Doplněk ovládání řetízku */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Doplněk ovládání</label>
                          <select
                            value={controlAccessory}
                            onChange={(e) => { playTactileClick(); setControlAccessory(e.target.value); }}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800 outline-hidden focus:ring-1 focus:ring-[#007AFF]"
                          >
                            <option value="NONE">Standardní provedení (přímý trn)</option>
                            <option value="B - brzda">B – brzda kuličkového řetízku</option>
                            {productType === 'ISOLINE_PRIM' && (
                              <option value="PB - převodovka s brzdou">PB – převodovka s tichou planetovou brzdou (povinná nad 2.4 m²)</option>
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Barva krycí lišty / nosných profilů s RAL vs Renolit záložkami */}
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <label className="block text-[11.5px] font-black text-slate-700 uppercase tracking-wide">
                            Barva krycí lišty / profilů <span className="text-indigo-650">({locoColor})</span>
                          </label>
                          {/* iOS styled Segmented buttons */}
                          <div className="flex p-0.5 bg-[#F2F2F7] rounded-lg border border-slate-100 shrink-0 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => { playTactileClick(); setProfileColorTab('RAL'); }}
                              className={`px-3 py-1 text-center text-[10px] font-black rounded-md transition duration-100 ${
                                profileColorTab === 'RAL'
                                  ? 'bg-white text-slate-900 shadow-2xs'
                                  : 'text-slate-500'
                              }`}
                            >
                              Standard lak RAL
                            </button>
                            <button
                              type="button"
                              onClick={() => { playTactileClick(); setProfileColorTab('RENOLIT'); }}
                              className={`px-3 py-1 text-center text-[10px] font-black rounded-md transition duration-100 ${
                                profileColorTab === 'RENOLIT'
                                  ? 'bg-white text-slate-900 shadow-2xs'
                                  : 'text-slate-500'
                              }`}
                            >
                              Renolit dřevodekory
                            </button>
                          </div>
                        </div>

                        {/* Filtered grid blocks */}
                        <div className="max-h-60 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-1.5 scrollbar-thin">
                          {HORIZONTAL_PROFILE_COLORS.filter(col => profileColorTab === 'RENOLIT' ? col.isRenolit : !col.isRenolit).map((col) => {
                            const isSelected = locoColor === col.value;
                            let blockBg = col.color;
                            if (col.color === 'wood') {
                              blockBg = 'linear-gradient(45deg,#b45309_25%,#78350f_50%,#b45309_75%)';
                            }

                            return (
                              <button
                                key={col.value}
                                type="button"
                                onClick={() => {
                                  playTactileClick();
                                  setLocoColor(col.value);
                                }}
                                className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition duration-100 active:scale-[0.99] w-full cursor-pointer min-h-[44px] ${
                                  isSelected 
                                    ? 'border-[#007AFF] bg-indigo-50/15 ring-1 ring-[#007AFF]/30 font-black' 
                                    : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span 
                                    className="h-5 w-5 rounded-full border shrink-0 shadow-3xs" 
                                    style={{ background: blockBg, borderColor: col.color === '#ffffff' ? '#cbd5e1' : 'transparent' }} 
                                  />
                                  <span className="text-[11.5px] font-bold truncate">
                                    {col.label}
                                  </span>
                                </div>
                                {col.isRenolit && (
                                  <span className="px-1.5 py-0.5 text-[8px] bg-amber-50 text-amber-800 border border-amber-200/50 rounded-md uppercase font-black shrink-0 tracking-wider">
                                    imitace
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                        {/* Typ lamely */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Šířka a tloušťka lamely</label>
                          <select
                            value={lamellaType}
                            onChange={(e) => setLamellaType(e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                          >
                            <option value="25 x 0.18">25 × 0.18 mm</option>
                            <option value="25 x 0.21">25 × 0.21 mm (Zesílená)</option>
                            <option value="16 x 0.21">16 × 0.21 mm (Úzká lamela)</option>
                          </select>
                        </div>

                        {/* Barva lamely */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Barevný vzorník lamely stínění</label>
                          <select
                            value={lamellaColor}
                            onChange={(e) => setLamellaColor(e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                          >
                            <option value="9010">Bílá matná (Kód: 9010)</option>
                            <option value="8017">Hnědá tavenina (Kód: 8017)</option>
                            <option value="9006">Stříbro mat (Kód: 9006)</option>
                            <option value="1013">Slonová kost (Kód: 1013)</option>
                            <option value="8004">Měď (Kód: 8004)</option>
                            <option value="8003">Koňak (Kód: 8003)</option>
                            <option value="7016">Antracit mat (Kód: 7016)</option>
                            <option value="W95">Zlatý Dub (Kód: W95)</option>
                          </select>
                        </div>
                      </div>

                      {/* Délka ovládání s chytrou brzdou / převodovkou Prim */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                        <div className="space-y-1.5 col-span-1 sm:col-span-2">
                          <div className="flex justify-between items-baseline">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">
                              Délka nekonečného řetízku
                            </label>
                            {(productType === 'ISOLINE_PRIM' && (controlAccessory === 'PB - převodovka s brzdou' || hasGearbox || hasBrake)) && (
                              <span className="text-[10px] text-[#007AFF] font-bold">Standardizované délky Prim</span>
                            )}
                          </div>

                          {(productType === 'ISOLINE_PRIM' && (controlAccessory === 'PB - převodovka s brzdou' || hasGearbox || hasBrake)) ? (
                            <div className="space-y-2">
                              {/* Pill selectors for standard lengths in cm */}
                              <div className="flex flex-wrap gap-1.5 bg-[#F2F2F7] p-1.5 rounded-xl border border-slate-200">
                                {['50', '75', '100', '125', '150', '175', '200', '225', 'standard'].map((len) => (
                                  <button
                                    key={len}
                                    type="button"
                                    onClick={() => { playTactileClick(); setControlLengthCustom(len); }}
                                    className={`px-3 py-1.5 text-xs font-black rounded-lg transition ${
                                      controlLengthCustom === len 
                                        ? 'bg-white text-[#007AFF] shadow-2xs' 
                                        : 'text-slate-655 hover:text-slate-900'
                                    }`}
                                  >
                                    {len === 'standard' ? 'Standard' : `${len} cm`}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[9px] text-slate-400">
                                * Podle XLS specifikace má Isoline Prim s planetární převodovkou zúženou škálu povolených délek kuličkových řetězů.
                              </p>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={controlLengthCustom}
                                onChange={(e) => setControlLengthCustom(e.target.value)}
                                placeholder="Např. standard nebo délka v mm"
                                className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold font-mono text-center text-slate-800"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Okenní lišty a distanční podložky */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Materiál okna</label>
                          <select
                            value={windowMaterial}
                            onChange={(e) => setWindowMaterial(e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                          >
                            <option value="PVC">Plastové (PVC)</option>
                            <option value="dřevo">Dřevěný europrofil</option>
                            <option value="hliník">Hliník (Al)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Distanční podložky (ks)</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={spacerCount}
                            onChange={(e) => setSpacerCount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold font-mono text-center"
                          />
                        </div>
                      </div>

                      {/* Boolean checkboxes list */}
                      <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 select-none">
                          <input
                            type="checkbox"
                            checked={isCelostin}
                            onChange={(e) => setIsCelostin(e.target.checked)}
                            className="h-4 w-4 text-[#007AFF] focus:ring-[#007AFF] rounded border-slate-350"
                          />
                          <div>
                            <span className="block text-xs font-black text-slate-900 leading-tight">Domykatelné provedení (Celostín)</span>
                            <span className="block text-[9px] text-slate-400 mt-0.5">Zajišťuje dokonale těsnější překrytí lamel při zaklapnutí.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 select-none">
                          <input
                            type="checkbox"
                            checked={colorHarmony}
                            onChange={(e) => setColorHarmony(e.target.checked)}
                            className="h-4 w-4 text-[#007AFF] focus:ring-[#007AFF] rounded border-slate-350"
                          />
                          <div>
                            <span className="block text-xs font-black text-slate-900 leading-tight">Barevné sladění žebříku a textilií</span>
                            <span className="block text-[9px] text-slate-400 mt-0.5">Všechny provázky a textilní pásky sladěny s lamelami.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 select-none">
                          <input
                            type="checkbox"
                            checked={safetyElementBlinds}
                            onChange={(e) => setSafetyElementBlinds(e.target.checked)}
                            className="h-4 w-4 text-[#007AFF] focus:ring-[#007AFF] rounded border-slate-350"
                          />
                          <div>
                            <span className="block text-xs font-black text-slate-900 leading-tight">ČSN Dětská bezpečnostní konfekce</span>
                            <span className="block text-[9px] text-slate-400 mt-0.5">Aktivuje unijní systém pojistek přetržení řetězu.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 select-none disabled:opacity-50">
                          <input
                            type="checkbox"
                            checked={mountingSupport}
                            disabled={productType !== 'ISOLINE_PRIM'}
                            onChange={(e) => setMountingSupport(e.target.checked)}
                            className="h-4 w-4 text-[#007AFF] focus:ring-[#007AFF] rounded border-slate-350 disabled:opacity-30"
                          />
                          <div>
                            <span className="block text-xs font-black text-slate-950 leading-tight">Montážní podpěra (pouze Prim)</span>
                            <span className="block text-[9px] text-slate-400 mt-0.5">Speciální aretační klip pro rozměry nad 1.5 m.</span>
                          </div>
                        </label>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {category === 'PLISSE' && (
                <div className="space-y-6">
                  {/* Premium Apple-Style Header Card */}
                  <div className="bg-[#F2F2F7] p-4 rounded-2xl border border-neutral-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest block leading-none">Technický dotazník</span>
                      <h3 className="text-sm font-black text-slate-900 mt-1 uppercase tracking-tight">
                        {productType === 'PLISSE_DARNI' ? 'Série PLISÉ DARNI (Komfortní systém)' : 'Série PLISÉ LAGARTA (Slim design)'}
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Vyplňte technické specifikace plisé žaluzie pro zaručenou výrobu v České republice.
                      </p>
                    </div>
                    <div className="px-2.5 py-1.5 bg-[#007AFF] text-white text-[9px] font-black rounded-lg uppercase tracking-wider leading-none shrink-0 shadow-xs">
                      {productType === 'PLISSE_DARNI' ? 'DARNI (cm)' : 'LAGARTA (mm)'}
                    </div>
                  </div>

                  {/* Main Form Fields wrapper */}
                  <div className="space-y-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Model Plisé */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Model Plisé</label>
                        <select
                          value={plisseModel}
                          onChange={(e) => {
                            playTactileClick();
                            const val = e.target.value;
                            setPlisseModel(val);
                            // Auto adjust control based on model type
                            if (val.startsWith('AO') || val.startsWith('PP')) {
                              setControlSide('provazek_P');
                            } else {
                              setControlSide('madlo');
                            }
                          }}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        >
                          {productType === 'PLISSE_DARNI' ? (
                            <>
                              <optgroup label="Madlo (posuv přímo za profily)">
                                <option value="AB 42">AB 42 (Klasické madlo - horní i dolní posuv)</option>
                                <option value="AB 49">AB 49 (Jednostranný posuv)</option>
                                <option value="AB 50">AB 50 (Fixní horní profil, dolní posuvný)</option>
                                <option value="AB 51">AB 51 (Atypické střešní - s vodicím lankem)</option>
                                <option value="AB 61">AB 61 (Zesílený horní/dolní profil)</option>
                                <option value="AB 62">AB 62 (Zesílený spodní tah)</option>
                              </optgroup>
                              <optgroup label="Provázek (řízení boční šňůrou)">
                                <option value="AO 43">AO 43 (Provázkové ovládání)</option>
                                <option value="AO 45">AO 45 (Provázek - střešní varianta)</option>
                              </optgroup>
                              <optgroup label="Dva typy látek (Duální den / noc)">
                                <option value="DB 11">DB 11 (Dvě nezávislé látky se středním profilem)</option>
                                <option value="DB 21">DB 21 (Dvě látky - střešní s vodicím drátem)</option>
                              </optgroup>
                              <optgroup label="Atypické / RAL modely">
                                <option value="PB 10">PB 10 (Atypické trojúhelník)</option>
                                <option value="PB 61">PB 61 (Pětivrtná pologuľa)</option>
                                <option value="PB 62">PB 62 (Atypický s RAL profilem)</option>
                              </optgroup>
                            </>
                          ) : (
                            <>
                              <optgroup label="Série PM (ovládání madlem)">
                                <option value="PM1">PM1 (Tension model standard)</option>
                                <option value="PM2">PM2 (Pevný horní profil)</option>
                                <option value="PM3">PM3 (Rozšířený profil se zámkem)</option>
                                <option value="PM3M">PM3M (Dvě látky pro den/noc)</option>
                                <option value="PM4">PM4 (Pro střešní výlezy, vodicí lanko)</option>
                                <option value="PM5">PM5 (Komfortní profil)</option>
                              </optgroup>
                              <optgroup label="Série PP (ovládání s dětskou pojistkou)">
                                <option value="PP1">PP1 (Provázkový s tahem s pojistkou lomu)</option>
                                <option value="PP2">PP2 (Zesílené provázkové PP stínění)</option>
                              </optgroup>
                              <optgroup label="Ostatní design řady">
                                <option value="PS3">PS3 (Vysoce napnutý fixní rám)</option>
                                <option value="AM1">AM1 (Dřevodekor a imitace)</option>
                                <option value="AM2">AM2 (Zesílená kovová lanka)</option>
                                <option value="AP1">AP1 (Architektonické plisé skel)</option>
                              </optgroup>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Barva profilu */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Barva AL profilu</label>
                        <select
                          value={topProfileColor}
                          onChange={(e) => {
                            playTactileClick();
                            setTopProfileColor(e.target.value);
                            setBottomProfileColor(e.target.value);
                          }}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        >
                          {productType === 'PLISSE_DARNI' ? (
                            <>
                              <option value="bílá">Bílá (standard)</option>
                              <option value="béžová">Béžová</option>
                              <option value="hnědá">Hnědá</option>
                              <option value="stříbrná">Stříbrná elox</option>
                              <option value="antracit">Antracit (RAL 7016)</option>
                              <option value="zlatý dub">Zlatý dub (polep/lak)</option>
                              <option value="ořech">Ořech (polep/lak)</option>
                              <option value="mahagon">Mahagon (polep)</option>
                              <option value="winchester">Winchester (polep)</option>
                              <option value="bahenní dub">Bahenní dub (polep)</option>
                              <option value="RAL č. ....">RAL č. .... (Zakázková barva lakování)</option>
                            </>
                          ) : (
                            <>
                              <option value="bílá">Bílá (standard)</option>
                              <option value="antracit">Antracit matný</option>
                              <option value="hnědá">Hnědá tmavá</option>
                              <option value="krémová">Krémová champagne</option>
                              <option value="černá">Černá hluboká</option>
                              <option value="stříbrná">Stříbrná matná</option>
                              <option value="zlatý dub">Zlatý dub (renolit)</option>
                              <option value="tmavý ořech">Tmavý ořech (renolit)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                      {/* První látka */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">První látka (horní)</label>
                        <input
                          type="text"
                          value={firstFabric}
                          onChange={(e) => setFirstFabric(e.target.value)}
                          placeholder="Kód látky ze vzorníku (např. Pearl 01)"
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800 focus:ring-1 focus:ring-indigo-501"
                        />
                        <span className="block text-[9px] text-slate-400">Specifikujte přesný kód ze standardního vzorníku plisé látek.</span>
                      </div>

                      {/* Druhá látka (visible only for double-fabric system) */}
                      {(plisseModel.startsWith('DB') || plisseModel === 'PM3M') ? (
                        <div className="space-y-1.5 bg-yellow-50/50 p-2.5 rounded-xl border border-yellow-200/50">
                          <label className="block text-[11px] font-black text-amber-700 uppercase tracking-wide">Druhá látka (dolní - Den/Noc)</label>
                          <input
                            type="text"
                            value={secondFabric}
                            onChange={(e) => setSecondFabric(e.target.value)}
                            placeholder="Kód druhé doplňkové látky"
                            className="w-full text-xs rounded-xl border border-amber-300 bg-white p-2.5 font-bold text-slate-800 focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="block text-[9px] text-amber-600 font-medium">Byl zvolen dvou-látkový model. Druhá látka slouží pro noční/zastiňující režim.</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5 opacity-40">
                          <label className="block text-[11px] font-black text-slate-405 uppercase tracking-wide">Druhá látka (dolní)</label>
                          <input
                            type="text"
                            disabled
                            placeholder="Není určena pro zvolený model"
                            className="w-full text-xs rounded-xl border border-slate-200 bg-slate-100 p-2.5 font-bold cursor-not-allowed"
                          />
                          <span className="block text-[9px] text-slate-405">Tato možnost je aktivní pouze u modelů DB 11, DB 21 nebo PM3M.</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                      {/* Montáž - Typ uchycení */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Způsob montáže / uchycení</label>
                        <select
                          value={mountingType}
                          onChange={(e) => { playTactileClick(); setMountingType(e.target.value); }}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        >
                          <option value="Zasklívací lišta standard">Do zasklívací lišty (invazivní - standard)</option>
                          <option value="Na okenní křídlo - klipy">Na rám/okraj křídla (vrtané klipy)</option>
                          <option value="Svorky na křídlo (bez vrtání)">Bez vrtání (neinvazivní svěrné držáky na křídlo)</option>
                          <option value="Do zasklívací lišty s polepem">Nalepovací boční lišty (invazivně bez šroubů)</option>
                          <option value="Do stropu/stěny">Na stěnu, nadpraží nebo strop (držák úhelník)</option>
                        </select>
                      </div>

                      {/* Prodlužovací tyč (pro vysoká okna) */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Prodlužovací tyč (pro vysoké stropy & světlíky)</label>
                        <select
                          value={extensionRod}
                          onChange={(e) => { playTactileClick(); setExtensionRod(e.target.value); }}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        >
                          <option value="NONE">Nepožaduji prodlužovací tyč</option>
                          <option value="100">Prodlužovací tyč - délka 100 cm (+190 Kč)</option>
                          <option value="150">Prodlužovací tyč - délka 150 cm (+190 Kč)</option>
                          <option value="200">Prodlužovací tyč - délka 200 cm (+190 Kč)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                      {/* Ovládání strany */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">
                          Strana ovládání (uvádí se u provázkových typů)
                        </label>
                        <div className="flex p-0.5 bg-[#F2F2F7] rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => { playTactileClick(); setControlSide('provazek_L'); }}
                            className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition duration-100 ${
                              controlSide === 'provazek_L'
                                ? 'bg-white text-[#007AFF] shadow-2xs'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            Vlevo (L)
                          </button>
                          <button
                            type="button"
                            onClick={() => { playTactileClick(); setControlSide('provazek_P'); }}
                            className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition duration-100 ${
                              controlSide === 'provazek_P' || controlSide === 'madlo'
                                ? 'bg-white text-[#007AFF] shadow-2xs'
                                : 'text-slate-500 hover:text-slate-705'
                            }`}
                          >
                            Vpravo (P) / Madlo
                          </button>
                        </div>
                      </div>

                      {/* Krycí profil / lišta (zaměření pro DB 41, atd.) */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Krycí lišta profilu</label>
                        <select
                          value={plisseCoverBar}
                          onChange={(e) => setPlisseCoverBar(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        >
                          <option value="">Bez doplňkové krycí lišty</option>
                          <option value="lišta DB 41">Svrchní krycí lišta typ DB 41</option>
                          <option value="hliníkový zákryt">Hliníkový boční zakrývací prvek</option>
                        </select>
                      </div>
                    </div>

                    {/* Dětská pojistka Checkbox */}
                    <div className="border-t border-slate-100 pt-3">
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 select-none">
                        <input
                          type="checkbox"
                          checked={childSafety}
                          onChange={(e) => setChildSafety(e.target.checked)}
                          className="h-4 w-4 text-[#007AFF] focus:ring-[#007AFF] rounded border-slate-350"
                        />
                        <div>
                          <span className="block text-xs font-black text-slate-900 leading-tight">
                            Bezpečnostní úchyt / dětská pojistka (ČSN EN 13120)
                          </span>
                          <span className="block text-[9px] text-slate-400 mt-0.5">
                            {productType === 'PLISSE_DARNI' 
                              ? 'Bezpečnostní úchyt pro bezpečné ukotvení ovládacího provázku u modelů typu AO.'
                              : 'Speciální dětská trhací pojistka pro model řady PP chránící před nebezpečím smyčky.'}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {category === 'VERTICAL' && (
                <div className="space-y-6">
                  {/* Premium Apple-Style Header Card */}
                  <div className="bg-[#F2F2F7] p-4 rounded-2xl border border-neutral-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in">
                    <div>
                      <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest block leading-none">Vertikální stínění</span>
                      <h3 className="text-sm font-black text-slate-900 mt-1 uppercase tracking-tight">
                        Vertikální žaluzie (Kat. 04)
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Konfigurace interiérových lamelových žaluzií s volbou atypického stahování a barvy.
                      </p>
                    </div>
                    <div className="px-2.5 py-1.5 bg-[#30B0C7] text-white text-[9px] font-black rounded-lg uppercase tracking-wider leading-none shrink-0 shadow-xs">
                      VERTIKÁL
                    </div>
                  </div>

                  {/* Main Form Fields wrapper */}
                  <div className="space-y-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Omezení typ */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Omezení typ</label>
                        <select
                          value={verticalLimitation}
                          onChange={(e) => {
                            playTactileClick();
                            setVerticalLimitation(e.target.value);
                          }}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        >
                          <option value="1 - bez omezení">1 - bez omezení (kompletní žaluzie)</option>
                          <option value="2a - pouze látka - čistá výška látky">2a - pouze látka (čistá výška látky bez lišty)</option>
                          <option value="2b - pouze látka - výška včetně lišty">2b - pouze látka (vč. horní lišty a jezdce)</option>
                          <option value="3 - pouze profil">3 - pouze profil (samostatný Al profil s jezdci)</option>
                        </select>
                      </div>

                      {/* Provedení */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Provedení typ</label>
                        <div className="flex p-0.5 bg-[#F2F2F7] rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => { playTactileClick(); setVerticalDesign('1 - standard'); }}
                            className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition duration-100 ${
                              verticalDesign === '1 - standard'
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            1 - Standard
                          </button>
                          <button
                            type="button"
                            onClick={() => { playTactileClick(); setVerticalDesign('2 - lux'); }}
                            className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition duration-100 ${
                              verticalDesign === '2 - lux'
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            2 - Lux
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                      {/* Šířka lamely */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Šířka lamely (látky)</label>
                        <select
                          value={lamellaSize}
                          onChange={(e) => {
                            playTactileClick();
                            const val = e.target.value;
                            setLamellaSize(val);
                            if (val.includes('127')) {
                              setProductType('VERT_STOFF_127');
                            } else if (val.includes('PVC')) {
                              setProductType('VERT_PVC');
                            } else {
                              setProductType('VERT_STOFF_89');
                            }
                          }}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        >
                          <option value="Látka 89 mm">Látka 89 mm (standard)</option>
                          <option value="Látka 127 mm">Látka 127 mm (široká)</option>
                          <option value="PVC 89 mm">PVC lamela 89 mm (omyvatelná)</option>
                        </select>
                      </div>

                      {/* Barva lamel */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Kód barvy látky</label>
                        <input
                          type="text"
                          value={lamellaColor}
                          onChange={(e) => setLamellaColor(e.target.value)}
                          placeholder="Kód barvy (u více barev oddělte lomítkem např. 0901/1402)"
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800 focus:ring-1 focus:ring-indigo-501"
                        />
                        <span className="block text-[9px] text-slate-400">Při střídání barev na jednom profilu zapište kódy oddělené lomítkem.</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                      {/* Typ stahování */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Typ stahování lamel</label>
                        <select
                          value={controlSide}
                          onChange={(e) => { playTactileClick(); setControlSide(e.target.value); }}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        >
                          <option value="1">1 - stahování k ovladači (standard)</option>
                          <option value="2">2 - stahování od ovladače</option>
                          <option value="3">3 - stahování od středu (opona/divadlo)</option>
                          <option value="4">4 - stahování do středu</option>
                          <option value="5">5 - oboustranné ovládání na jednom profilu</option>
                          <option value="8/1">8/1 - dvoje k ovladači (s překrytím)</option>
                          <option value="8/2">8/2 - dvoje od ovladače (s překrytím)</option>
                          <option value="8/3">8/3 - dvoje od středu (s překrytím)</option>
                          <option value="8/4">8/4 - dvoje do středu (s překrytím)</option>
                        </select>
                      </div>

                      {/* Uchycení */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Způsob uchycení</label>
                        <div className="flex p-0.5 bg-[#F2F2F7] rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => { playTactileClick(); setMountingType('strop'); }}
                            className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition duration-100 ${
                              mountingType === 'strop' || mountingType?.includes('strop') || mountingType === '1 - strop' || !mountingType
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            Strop (standard)
                          </button>
                          <button
                            type="button"
                            onClick={() => { playTactileClick(); setMountingType('stěna'); }}
                            className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition duration-100 ${
                              mountingType === 'stěna' || mountingType?.includes('stěna') || mountingType === '2 - stěna'
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            Stěna (s konzolou)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                      {/* Uchycení navíc (ks) */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Uchycení navíc (ks)</label>
                        <input
                          type="number"
                          value={verticalExtraBrackets}
                          min={0}
                          onChange={(e) => setVerticalExtraBrackets(parseInt(e.target.value) || 0)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        />
                        <span className="block text-[9px] text-slate-400">Přidejte dodatečné klipy nad rámec standardního počtu pro vyztužení.</span>
                      </div>

                      {/* Délka ovládání */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Délka ovládací šňůry/řetízku</label>
                        <select
                          value={verticalControlLength}
                          onChange={(e) => setVerticalControlLength(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        >
                          <option value="standard">Standardní zkrácení (vzhledem k výšce)</option>
                          <option value="1000">100 cm</option>
                          <option value="1500">150 cm</option>
                          <option value="2000">200 cm</option>
                          <option value="2500">250 cm</option>
                        </select>
                      </div>
                    </div>

                    {/* Dětská pojistka Toggle */}
                    <div className="border-t border-slate-100 pt-3">
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 select-none">
                        <input
                          type="checkbox"
                          checked={childSafety}
                          onChange={(e) => setChildSafety(e.target.checked)}
                          className="h-4 w-4 text-[#007AFF] focus:ring-[#007AFF] rounded border-slate-350"
                        />
                        <div>
                          <span className="block text-xs font-black text-slate-900 leading-tight">
                            Bezpečnostní prvek pro děti (v souladu s ČSN EN 13120)
                          </span>
                          <span className="block text-[9px] text-slate-400 mt-0.5">
                            Automaticky instalované závaží napnutí šňůry nebo dělící spojka s bezpečnostním rozpojením při zatížení.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {category === 'JAPANESE' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Premium Apple-Style Header Card */}
                  <div className="bg-[#F2F2F7] p-4 rounded-2xl border border-neutral-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest block leading-none">Japonská stěna</span>
                      <h3 className="text-sm font-black text-slate-900 mt-1 uppercase tracking-tight">
                        Japonská posuvná stěna (Kat. 06)
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Vznešené rozdělení místností a zastínění oken. Panely se posouvají v profilu s libovolným počtem drážek.
                      </p>
                    </div>
                    <div className="px-2.5 py-1.5 bg-[#FF9500] text-white text-[9px] font-black rounded-lg uppercase tracking-wider leading-none shrink-0 shadow-xs">
                      JAPANESE
                    </div>
                  </div>

                  {/* Main Form Fields wrapper */}
                  <div className="space-y-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Počet panelů */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Počet posuvných panelů</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="2"
                            max="8"
                            value={panelCount}
                            onChange={(e) => {
                              playTactileClick();
                              const count = parseInt(e.target.value) || 2;
                              setPanelCount(count);
                              // Auto calculate panel width
                              const calcWidth = Math.round((width - 50) / count + 50);
                              setPanelWidth(calcWidth);
                            }}
                            className="w-full accent-[#FF9500] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                          <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 border border-slate-200 px-2 py-1 rounded shrink-0">
                            {panelCount} panelů
                          </span>
                        </div>
                        <span className="block text-[9px] text-slate-400">Nastavte požadované dělení panelů (min 2, max 8).</span>
                      </div>

                      {/* Displaying computed Panel Width */}
                      <div className="space-y-1.5 bg-[#F2F2F7]/50 p-2.5 rounded-xl border border-neutral-200/50 flex flex-col justify-center">
                        <span className="block text-[10px] uppercase font-black tracking-wide text-neutral-500 leading-none">Vypočítaná šířka panelu</span>
                        <div className="text-sm font-black text-slate-850 mt-1">
                          {panelWidth} mm <span className="font-normal text-[10px] text-neutral-500 ml-1">(Předpis s přesahem)</span>
                        </div>
                        <span className="block text-[8px] text-slate-400 mt-0.5">
                          Metodika: (délka lišty {width} - 50) ÷ {panelCount} + 50 = {panelWidth} mm.
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                      {/* Vodicí lišta (VL) - typ */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Kolejnice - Drážky profilu</label>
                        <select
                          value={japTrackType}
                          onChange={(e) => { playTactileClick(); setJapTrackType(e.target.value); }}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        >
                          <option value="2-drážková">2-drážková profilová lišta</option>
                          <option value="3-drážková">3-drážková profilová lišta</option>
                          <option value="4-drážková">4-drážková profilová lišta</option>
                          <option value="5-drážková">5-drážková profilová lišta (top komfort)</option>
                        </select>
                      </div>

                      {/* Vodicí lišta (VL) - barva */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Barva profilu kolejnice</label>
                        <select
                          value={japTrackColor}
                          onChange={(e) => { playTactileClick(); setJapTrackColor(e.target.value); }}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        >
                          <option value="bílá (standard)">bílá (standard)</option>
                          <option value="RAL 7016">antracit (RAL 7016)</option>
                          <option value="RAL 9006">stříbrná (RAL 9006)</option>
                          <option value="RAL 9007">šedá matná (RAL 9007)</option>
                          <option value="RAL č. ...">Vlastní odstín RAL kódování ...</option>
                        </select>
                      </div>
                    </div>

                    {japTrackColor === 'RAL č. ...' && (
                      <div className="space-y-1.5 bg-amber-50/50 p-3 rounded-xl border border-amber-200/50 animate-fade-in">
                        <label className="block text-[11px] font-black text-amber-700 uppercase tracking-wide">Zadejte barvu RAL lišty</label>
                        <input
                          type="text"
                          value={japTrackRal}
                          onChange={(e) => setJapTrackRal(e.target.value)}
                          placeholder="Např. RAL 1015"
                          className="w-full text-xs rounded-xl border border-amber-300 bg-white p-2.5 font-bold text-slate-800"
                        />
                        <span className="block text-[9px] text-amber-600">Specifikujte přesný čtyřmístný kód mezinárodní palety barev RAL.</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                      {/* Uchycení */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Způsob uchycení kolejnice</label>
                        <div className="flex p-0.5 bg-[#F2F2F7] rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => { playTactileClick(); setMountingType('1 - strop'); }}
                            className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition duration-100 ${
                              mountingType === '1 - strop' || mountingType === 'strop' || !mountingType
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-705'
                            }`}
                          >
                            1 - Do stropu
                          </button>
                          <button
                            type="button"
                            onClick={() => { playTactileClick(); setMountingType('2 - stěna'); }}
                            className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition duration-100 ${
                              mountingType === '2 - stěna' || mountingType === 'stěna'
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-705'
                            }`}
                          >
                            2 - Na stěnu
                          </button>
                        </div>
                      </div>

                      {/* Barva látky panelů */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Barva / Název látky panelů</label>
                        <input
                          type="text"
                          value={lamellaColor}
                          onChange={(e) => setLamellaColor(e.target.value)}
                          placeholder="Název a kód barvy látky panelů"
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800 focus:ring-1 focus:ring-indigo-501"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                      {/* Typ ovládání */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Typ ovládání posunu</label>
                        <select
                          value={controlSide}
                          onChange={(e) => { playTactileClick(); setControlSide(e.target.value); }}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        >
                          <option value="rucni">Volně ručním tahem za panely (standard)</option>
                          <option value="snura">Ovládání šňůrou s těžítkem</option>
                          <option value="tahlo">Ovládacím transparentním táhlem</option>
                        </select>
                      </div>

                      {/* Typ tkaniny */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wide">Kategorie panelové tkaniny</label>
                        <select
                          value={lamellaSize}
                          onChange={(e) => { playTactileClick(); setLamellaSize(e.target.value); }}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-slate-50 p-2.5 font-bold text-slate-800"
                        >
                          <option value="Panel standard">Standard fabric (třída A)</option>
                          <option value="Panel Premium">Premium textured fabric (třída B)</option>
                          <option value="Panel Dimout">Dimout (částečně zatemňující)</option>
                        </select>
                      </div>
                    </div>

                    {/* Magnetické úchytky toggle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 select-none">
                        <input
                          type="checkbox"
                          checked={japMagnetsEnabled}
                          onChange={(e) => {
                            playTactileClick();
                            const en = e.target.checked;
                            setJapMagnetsEnabled(en);
                            setJapMagnetCount(en ? 2 : 0);
                          }}
                          className="h-4 w-4 text-[#FF9500] focus:ring-[#FF9500] rounded border-slate-350"
                        />
                        <div>
                          <span className="block text-xs font-black text-slate-900 leading-tight">
                            Aktivovat magnetické úchyty panelů
                          </span>
                          <span className="block text-[9px] text-slate-400 mt-0.5">
                            Umožní pevnější dopnutí panelů a dokonalé seřazení v zavřeném stavu.
                          </span>
                        </div>
                      </label>

                      {japMagnetsEnabled && (
                        <div className="space-y-1.5 bg-[#FF9500]/5 p-2.5 rounded-xl border border-[#FF9500]/20 animate-fade-in flex flex-col justify-center">
                          <label className="block text-[10px] font-black text-amber-800 uppercase tracking-wide leading-none">Počet magnetických úchytů (párů)</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={japMagnetCount}
                            onChange={(e) => setJapMagnetCount(parseInt(e.target.value) || 1)}
                            className="w-full text-xs rounded-lg border border-amber-300 bg-white p-2 font-bold text-amber-950 mt-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* EXTERNAL (Vnější žaluzie, screeny a rolety) */}
              {category === 'EXTERNAL' && (
                <div className="space-y-4 bg-slate-50 border border-slate-205 p-4 rounded-xl">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black uppercase text-indigo-650 tracking-wider">Dotazník na míru: VENKOVNÍ STÍNĚNÍ A SCREENY</span>
                  </div>

                  {/* Standardní venkovní žaluzie Z90, S90, C80, F80 */}
                  {['EXT_Z90', 'EXT_S90', 'EXT_C80', 'EXT_F80'].includes(productType) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Kód lamely QAPI</label>
                        <select
                          value={lamellaColor}
                          onChange={(e) => setLamellaColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="7016">7016 - Antracitová šedá</option>
                          <option value="9016">9016 - Dopravní bílá</option>
                          <option value="9006">9006 - Světle stříbrná</option>
                          <option value="9007">9007 - Tmavě stříbrná</option>
                          <option value="8014">8014 - Hnědá</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Způsob ovládání</label>
                        <select
                          value={controlSide}
                          onChange={(e) => setControlSide(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="MOTOR_IO">Somfy IO dálkový motor (+6500 Kč)</option>
                          <option value="MOTOR_SWITCH">Standardní motor na vypínač (+4000 Kč)</option>
                          <option value="KLIKA_Standard">Manuální klika / převodovka (+800 Kč)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Tara Premio I & II */}
                  {(productType === 'EXT_TARA_PREMIO_I' || productType === 'EXT_TARA_PREMIO_II') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ Boxu a Sestava</label>
                        <select
                          value={boxType}
                          onChange={(e) => setBoxType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          {productType === 'EXT_TARA_PREMIO_I' ? (
                            <>
                              <option value="125 H - 125 hranatý">125 H - 125 hranatý</option>
                              <option value="125 K - 125 kulatý">125 K - 125 kulatý</option>
                              <option value="125 P - 125 zaomítací">125 P - 125 zaomítací</option>
                              <option value="150 H - 150 hranatý">150 H - 150 hranatý</option>
                              <option value="150 K - 150 kulatý">150 K - 150 kulatý</option>
                              <option value="150 P - 150 zaomítací">150 P - 150 zaomítací</option>
                            </>
                          ) : (
                            <>
                              <option value="90 standard">90 standard (hranatý/oblá)</option>
                              <option value="105 standard">105 standard (hranatý/oblá)</option>
                              <option value="120 standard">120 standard (hranatý/oblá)</option>
                              <option value="120 H pod omítku">120 H pod omítku</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Lakování boxu a vodicích lišt</label>
                        <select
                          value={boxColor}
                          onChange={(e) => setBoxColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="RAL 7016 struktura">RAL 7016 struktura (Antracit)</option>
                          <option value="RAL 9016 mat">RAL 9016 mat (Dopravní bílá)</option>
                          <option value="RAL 9500 jemná struktura">RAL 9500 jemná struktura</option>
                          <option value="Lakování do jiné RAL">Specifické lakování do jiné RAL</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Vodicí lišta / Lanko</label>
                        <select
                          value={guideType}
                          onChange={(e) => setGuideType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="J - jednoduché (pouze pro box 90, 105, 120, 125)">J - jednoduché (standardní)</option>
                          <option value="JU - jednoduché uzavřené (pro box 90, 105, 120, 125)">JU - jednoduché uzavřené</option>
                          <option value="D - dvojité pro spojené sestavy">D - dvojité pro spojené sestavy</option>
                          <option value="L - ocelové lanko d=3 mm">L - nerezové lanko d=3 mm</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ koncové lišty</label>
                        <select
                          value={endProfileType}
                          onChange={(e) => setEndProfileType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="PS - přiznaná standard (platí pro box 90, 105)">PS - přiznaná standard</option>
                          <option value="PŠ - přiznaná široká (platí pro box 105, 120, 125)">PŠ - přiznaná široká</option>
                          <option value="Z - zapuštěná (všechny typy boxů mimo 90)">Z - zapuštěná (minimalistický vzhled)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Těsnění dolní hrany</label>
                        <select
                          value={gasketType}
                          onChange={(e) => setGasketType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="G - guma">G - guma (optimální těsnost)</option>
                          <option value="K - kartáček">K - kartáček (lehčí chod)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Způsob montáže</label>
                        <select
                          value={mountingTypeCustom}
                          onChange={(e) => setMountingTypeCustom(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="a - do ostění">a - do ostění (vrtání vodicích lišt)</option>
                          <option value="b - na fasádu čelně">b - na fasádu (čelní kotvení)</option>
                          <option value="c - do zaomítacího pouzdra">c - do zaomítacího pouzdra (skrytá lišta)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Tkanina / Screen materiál</label>
                        <select
                          value={fabricType}
                          onChange={(e) => setFabricType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="SOLTIS HORIZON">SOLTIS HORIZON (vynikající viditelnost ven)</option>
                          <option value="SOLTIS PERFORM">SOLTIS PERFORM (maximální odraz tepla)</option>
                          <option value="SCREEN SPECIAL šedá">SCREEN SPECIAL šedá / černá</option>
                          <option value="SATEEN ZIP - blackout">SATEEN ZIP - absolutní tma (blackout)</option>
                          {productType === 'EXT_TARA_PREMIO_I' && (
                            <option value="SCREEN F12">SCREEN F12 (odolná prémiová)</option>
                          )}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Odvýměna / Směr odvíjení</label>
                        <select
                          value={fabricOrientation}
                          onChange={(e) => setFabricOrientation(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="B - ze zadní strany boxu">B - ze zadní strany boxu (tradiční)</option>
                          <option value="A - z čelní strany boxu">A - z čelní strany boxu (předsunuté)</option>
                        </select>
                      </div>

                      {productType === 'EXT_TARA_PREMIO_II' && (
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva plastových koncovek</label>
                          <select
                            value={capColor}
                            onChange={(e) => setCapColor(e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                          >
                            <option value="Č - černá">Č - černá (standard)</option>
                            <option value="A - antracit">A - antracit (sjednocení s RAL 7016)</option>
                            <option value="B - bílá">B - bílá</option>
                            <option value="Š - šedá">Š - šedá</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ghibli I a Union-L */}
                  {productType === 'EXT_GHIBLI_UNION' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Varianta systému</label>
                        <select
                          value={boxType}
                          onChange={(e) => setBoxType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="1- Union - L">1- Union - L (lehké provedení na nerez lanko)</option>
                          <option value="2- Ghibli I (pouze s motory bez NHK)">2- Ghibli I (kasetová clona s hliníkovou kazetou)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva hliníkových dílů</label>
                        <select
                          value={boxColor}
                          onChange={(e) => setBoxColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="bílá (RAL 9010)">bílá (RAL 9010)</option>
                          <option value="stříbrná (RAL 9006)">stříbrná (RAL 9006)</option>
                          <option value="antracit (RAL 7016)">antracit (RAL 7016)</option>
                          <option value="nástřik do jiné barvy RAL">Nástřik do libovolné jiné RAL barvy</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Kotvení / Typ držáku</label>
                        <select
                          value={mountingTypeCustom}
                          onChange={(e) => setMountingTypeCustom(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="1 - stěna">1 - stěna (čelní montáž)</option>
                          <option value="2 - strop">2 - strop (vertikální montáž)</option>
                          <option value="3 - výklenek">3 - výklenek (do ostění okna)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Distanční úchyty / Lanko</label>
                        <select
                          value={distanceProfile}
                          onChange={(e) => setDistanceProfile(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="1 - stěna">1 - stěna (standard 50 mm)</option>
                          <option value="2 - strop">2 - strop (přímý horní úchyt)</option>
                          <option value="3 - boční prodloužené konzoly">3 - boční prodloužené konzoly (100 - 150 mm)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Pohon</label>
                        <select
                          value={controlMethod}
                          onChange={(e) => setControlMethod(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="2 - motorové">2 - motorové (pohodlné dálkové ovládání)</option>
                          <option value="1 - ruční">1 - ruční klika (pouze pro Union - L)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ somfy / elero elektro motoru</label>
                        <select
                          value={electronicsReceiver}
                          onChange={(e) => setElectronicsReceiver(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="5 - Sunea 50 io - 30, 50 Nm">5 - Sunea 50 io (30/50 Nm, dvousměrný rádio signál)</option>
                          <option value="6 - Sunea 50 io + NHK">6 - Sunea 50 io + NHK (snouzovou převodovkou na kliku)</option>
                          <option value="7 - LT 50 jet - mechanický">7 - LT 50 jet (mechanický pro drátový vypínač)</option>
                          <option value="8 - Elero dálkový motor">8 - Elero RolTop (šetrný inteligentní motor)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Screenová tkanina</label>
                        <select
                          value={fabricType}
                          onChange={(e) => setFabricType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="Soltis Horizont 86 (B)">Soltis Horizont 86 (pohledová strana B)</option>
                          <option value="Soltis Perform 92 (B)">Soltis Perform 92 (pohledová strana B)</option>
                          <option value="Satine Special mat (B)">Satine Special (skelné vlákno s PVC nátěrem)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Rolety Radix Covert Combi */}
                  {productType === 'EXT_ROLO_VENKOVNI' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Základní typ systému / Boxu</label>
                        <select
                          value={boxType}
                          onChange={(e) => setBoxType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="1 - Radix">1 - Radix (klasický hranatý zkosený)</option>
                          <option value="2 - Radix R1">2 - Radix R1 (s půlkulatým plastovým nosem)</option>
                          <option value="3 - Radix R2">3 - Radix R2 (s kompletně zaoblenou kasetou)</option>
                          <option value="4 - Covert">4 - Covert (provedení určené pod omítku)</option>
                          <option value="5 - Combi">5 - Combi (univerzální pro dodatečnou montáž)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva hliníkového boxu</label>
                        <select
                          value={boxColor}
                          onChange={(e) => setBoxColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="Bílá">Bílá (standard bez příplatku)</option>
                          <option value="Hnědá">Hnědá RAL 8014</option>
                          <option value="Antracit">Antracit RAL 7016 mat</option>
                          <option value="Lakování na přání - RAL">Vlastní lakování dle vzorníku RAL</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ pancíře a lamely</label>
                        <select
                          value={endProfileType}
                          onChange={(e) => setEndProfileType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="LA 39 - hliníková lamela vypl. PUR pěnou">LA 39 - hliník zateplený pěnou (39 mm)</option>
                          <option value="LA 52 - hliníková lamela pro velké rozměry">LA 52 - hliník zateplený pěnou (52 mm)</option>
                          <option value="Mřížková ocelová lamela zabezpečovací">Mřížkový bezpečnostní profil</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva roletového pancíře</label>
                        <select
                          value={endProfileColor}
                          onChange={(e) => setEndProfileColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="Bílá">Bílá</option>
                          <option value="Šedá alu">Šedá (stříbrná RAL 9006)</option>
                          <option value="Antracit">Antracit (RAL 7016)</option>
                          <option value="Zlatý dub imitace">Zlatý dub (atypická folie)</option>
                          <option value="Tmavošedá RAL 7021">Tmavošedá RAL 7021</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Směr navíjení (z interiéru)</label>
                        <select
                          value={rollDirection}
                          onChange={(e) => setRollDirection(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="L - levotočivá">L - levotočivá (standardní směr k oknu)</option>
                          <option value="P - pravotočivá">P - pravotočivá (směr od okna)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Vodicí lišty</label>
                        <select
                          value={guideType}
                          onChange={(e) => setGuideType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="F1">F1 (standardní 53x22 mm)</option>
                          <option value="F2">F2 (vrtání s bočním krytem)</option>
                          <option value="F8 PVC">F8 PVC (speciální pro Combi)</option>
                          <option value="F10 AL">F10 AL (vyztužená hliníková)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase font-bold text-emerald-800 flex items-center gap-1">Předvrtání vodicích lišt</label>
                        <select
                          value={preDrilling}
                          onChange={(e) => setPreDrilling(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="ne">ne (vrtání až při montáži na místě)</option>
                          <option value="ano vodicí lišta čelně">ano - čelně (do ostění / fasáda)</option>
                          <option value="ano vodicí lišta bočně">ano - bočně (do okenního rámu)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Ovládání</label>
                        <select
                          value={controlMethod}
                          onChange={(e) => setControlMethod(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="1 - ruční">1 - ruční (šňůra / popruh do navíječe)</option>
                          <option value="2 - motorové">2 - motorové (Somfy io dálkové)</option>
                          <option value="3 - motor - vypínač">3 - motorové (mechanické na vypínač)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Průchodka / Výstup ovládání</label>
                        <select
                          value={controlSide}
                          onChange={(e) => setControlSide(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="LD - levé, dolní">LD - levé, dolní</option>
                          <option value="LH - levé, horní">LH - levé, horní</option>
                          <option value="PD - pravé, dolní">PD - pravé, dolní</option>
                          <option value="PH - pravé, horní">PH - pravé, horní</option>
                        </select>
                      </div>

                      <div className="col-span-1 sm:col-span-2 flex items-center gap-3 pt-2">
                        <input
                          id="integrated_mesh_opt"
                          type="checkbox"
                          checked={integratedMesh}
                          onChange={(e) => setIntegratedMesh(e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded border-slate-350 cursor-pointer"
                        />
                        <label htmlFor="integrated_mesh_opt" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                          Integrovaná síť proti hmyzu v boxu rolety (+1500 Kč)
                          <span className="block text-[9px] text-slate-400 font-medium font-sans">
                            Box obsahuje vestavěnou rolovací síťku, kterou lze nezávisle stahovat.
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Rolety Heluz */}
                  {productType === 'EXT_ROLO_HELUZ' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ Heluz překladu</label>
                        <select
                          value={boxType}
                          onChange={(e) => setBoxType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="Heluz 165">Heluz 165 (pro nosné stavební překlady šířky 165 mm)</option>
                          <option value="Heluz 220">Heluz 220 (pro široké nosné stavební překlady šířky 220 mm)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva vnějších komponentů</label>
                        <select
                          value={boxColor}
                          onChange={(e) => setBoxColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="RAL 7016 Antracit mat">RAL 7016 Antracit mat</option>
                          <option value="RAL 9016 Bílá">RAL 9016 Bílá</option>
                          <option value="RAL 8017 Hnědá">RAL 8017 Hnědá</option>
                          <option value="Vlastní lakování do RAL">Vlastní lakování do jiné RAL</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva venkovní krycí desky</label>
                        <select
                          value={externalCoverPlate}
                          onChange={(e) => setExternalCoverPlate(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="Bílá">Bílá (komaxitovaná lakovaná AL deska)</option>
                          <option value="Antracit šedá">Antracit šedá (RAL 7016)</option>
                          <option value="přírodní elox hliník">přírodní elox hliník</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva přechodové lišty interiér</label>
                        <select
                          value={internalCoverPlate}
                          onChange={(e) => setInternalCoverPlate(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="Bílá">Bílá (interiérová plastová úchytná deska)</option>
                          <option value="Šedá / RAL lak">Šedá / RAL lak</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ venkovní lamely</label>
                        <select
                          value={endProfileType}
                          onChange={(e) => setEndProfileType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="LA 39 - hliníková lamela">LA 39 - hliník vypl. PUR pěnou (39 mm)</option>
                          <option value="LA 52 - hliníková lamela">LA 52 - masivní hliníková lamela (52 mm)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Vodicí prvek okna</label>
                        <select
                          value={guideType}
                          onChange={(e) => setGuideType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="ZP - zaomítací pouzdro">ZP - zaomítací pouzdro (skrytá estetická montáž)</option>
                          <option value="VF - vnější vodicí lišta">VF - vnější vodicí lišta (hliníkový profil na rám)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Styl ovládání</label>
                        <select
                          value={controlMethod}
                          onChange={(e) => setControlMethod(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="1 - pásek">1 - pásek (tradiční plochý samonavíječ)</option>
                          <option value="2 - šňůra">2 - šňůra (kulatý samonavíječ)</option>
                          <option value="3 - motorové">3 - motorové (Somfy dálkové rádio)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Vyvedení ovládání (při pohledu zevnitř)</label>
                        <select
                          value={controlSide}
                          onChange={(e) => setControlSide(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="L - levé">L - levé</option>
                          <option value="P - pravé">P - pravé</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AWNING (Výklopné, kasetové a kloubové markýzy) */}
              {category === 'AWNING' && (
                <div className="space-y-4 bg-slate-50 border border-slate-205 p-4 rounded-xl">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black uppercase text-indigo-650 tracking-wider">Dotazník na míru: MARKÝZY A EXTERIÉROVÉ CLONY</span>
                  </div>

                  {/* Výklopná markýza UNION / K / B */}
                  {productType === 'AWN_UNION_DROP' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ / Konstrukce markýzy</label>
                        <select
                          value={boxType}
                          onChange={(e) => setBoxType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="UNION">UNION - Klasická lehká bez kazety (švový šev)</option>
                          <option value="UNION-K">UNION-K - Kasetová (látka plně kryta v Al boxu)</option>
                          <option value="UNION-B">UNION-B - Bez kety, pouze manuální klika (balkónová bez motorů)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Vyložení / Délka Výklopu ramene</label>
                        <select
                          value={awningDrop}
                          onChange={(e) => setAwningDrop(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="VÝKLOP 1000 mm">VÝKLOP 1000 mm</option>
                          <option value="VÝKLOP 1200 mm">VÝKLOP 1200 mm</option>
                          <option value="VÝKLOP 1500 mm">VÝKLOP 1500 mm</option>
                          <option value="VÝKLOP 1800 mm">VÝKLOP 1800 mm (pouze do šířky 4500 mm)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Barva hliníkové konstrukce</label>
                        <select
                          value={boxColor}
                          onChange={(e) => setBoxColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="RAL 9010 bílá">RAL 9010 bílá (lehký lesk)</option>
                          <option value="RAL 7016 antracit struktura">RAL 7016 antracit jemná struktura</option>
                          <option value="RAL 9006 šedostříbrná">RAL 9006 šedostříbrná</option>
                          <option value="Atypický komaxit - lak QAPI">Atypický komaxit lak RAL (+30%)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Kotvení markýzy</label>
                        <select
                          value={mountingTypeCustom}
                          onChange={(e) => setMountingTypeCustom(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="ÚCHYT stěna">ÚCHYT na stěnu (standard)</option>
                          <option value="ÚCHYT strop">ÚCHYT na strop</option>
                          <option value="ÚCHYT výklenek">ÚCHYT do ostění / rámu dveří</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Typ pohonu</label>
                        <select
                          disabled={boxType === 'UNION-B'}
                          value={controlMethod}
                          onChange={(e) => setControlMethod(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800 disabled:opacity-50"
                        >
                          <option value="MANUÁLNÍ - klika">MANUÁLNÍ - klika (standard)</option>
                          <option value="MOTORICKÉ">MOTORICKÉ (pohodlný motor Somfy)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Strana ovládání (pohled z exteriéru)</label>
                        <select
                          value={controlSide}
                          onChange={(e) => setControlSide(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="pravá">pravá</option>
                          <option value="levá">levá</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Délka kliky (pro manuální pohon)</label>
                        <select
                          value={distanceProfile}
                          onChange={(e) => setDistanceProfile(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="1500 mm">1500 mm (standard)</option>
                          <option value="1200 mm">1200 mm</option>
                          <option value="1800 mm">1800 mm</option>
                          <option value="2200 mm">2200 mm</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Spodní lem / Tvar volánu</label>
                        <select
                          value={gasketType}
                          onChange={(e) => setGasketType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="standardní výška 23 cm">standardní výška 23 cm (tvar vlna)</option>
                          <option value="rovný volán 23 cm">rovný moderní volán 23 cm</option>
                          <option value="bez volánu">bez volánu (čisté zakončení profilem)</option>
                        </select>
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-3 pt-2">
                        <div className="flex items-center gap-3">
                          <input
                            id="awning_hood_opt"
                            type="checkbox"
                            checked={awningHood}
                            onChange={(e) => setAwningHood(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded border-slate-350 cursor-pointer"
                          />
                          <label htmlFor="awning_hood_opt" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                            Přidat horní krycí AL-stříšku (+1800 Kč)
                            <span className="block text-[9px] text-slate-400 font-medium font-sans">
                              Chrání navinutou látku shora před deštěm a listím u modelů bez kazety (Union).
                            </span>
                          </label>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            id="wind_shaker_opt"
                            type="checkbox"
                            checked={awningWindSensor}
                            onChange={(e) => setAwningWindSensor(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded border-slate-350 cursor-pointer"
                          />
                          <label htmlFor="wind_shaker_opt" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                            Přidat Somfy Eolis 3D otřesové čidlo větru (+2400 Kč)
                            <span className="block text-[9px] text-slate-400 font-medium font-sans">
                              Při silných otřesech způsobených větrem automaticky zatáhne markýzu a ochrání ramena.
                            </span>
                          </label>
                        </div>

                        <div className="space-y-1 max-w-sm">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase">Počet konzol navíc (nad rámec standardu)</label>
                          <input
                            type="number"
                            min="0"
                            max="4"
                            value={bracketExtra}
                            onChange={(e) => setBracketExtra(parseInt(e.target.value) || 0)}
                            className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2 text-slate-800 font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Casablanca, Dakota, Italia standardní kasetové markýzy */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Design tkaniny Terasa</label>
                        <select
                          value={lamellaColor}
                          onChange={(e) => setLamellaColor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="AWN_GREY">AWN-01 Uni Šedá prémiová</option>
                          <option value="AWN_STRIPE_BLUE">AWN-02 Modrobílý proužek</option>
                          <option value="AWN_BEIGE">AWN-03 Krémová naturální</option>
                          <option value="AWN_CREAM">AWN-04 Slonovobílá</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">ZPŮSOB OVLÁDÁNÍ</label>
                        <select
                          value={controlSide}
                          onChange={(e) => setControlSide(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-250 bg-white p-2.5 font-semibold text-slate-800"
                        >
                          <option value="MOTOR_IO">Somfy IO dálkový motor (+7500 Kč)</option>
                          <option value="MOTOR_SWITCH">Standardní motor na vypínač (+4500 Kč)</option>
                          <option value="KLIKA">Ruční klika / manuální</option>
                        </select>
                      </div>

                      <div className="col-span-1 sm:col-span-2 pt-2">
                        <div className="flex items-center gap-3">
                          <input
                            id="wind_sensor_basic"
                            type="checkbox"
                            checked={awningWindSensor}
                            onChange={(e) => setAwningWindSensor(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded border-slate-350 cursor-pointer"
                          />
                          <label htmlFor="wind_sensor_basic" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                            Aktivovat otřesové čidlo větru Somfy (+2400 Kč)
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Keep the fallback for remaining categories like wooden and awnings */}
              {category !== 'SCREENS' && category !== 'ROLETKY' && category !== 'HORIZONTAL' && category !== 'PLISSE' && category !== 'VERTICAL' && category !== 'JAPANESE' && category !== 'EXTERNAL' && category !== 'AWNING' && (
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
                    <div className="flex flex-col gap-2">
                      {LAMELLA_COLORS.map((col) => {
                        const isAwnColor = col.code.startsWith('AWN_');
                        if (category === 'AWNING' && !isAwnColor) return null;
                        if (category !== 'AWNING' && isAwnColor) return null;

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
                            className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition duration-100 active:scale-[0.98] text-xs text-slate-800 font-bold cursor-pointer w-full shadow-xs ${
                              isSelected ? 'border-indigo-600 bg-indigo-50/15 ring-1 ring-indigo-600/30' : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`h-7 w-7 rounded-full border shrink-0 shadow-2xs ${blockColor}`} />
                              <span className="text-xs sm:text-sm text-slate-800 font-bold tracking-tight leading-snug whitespace-normal break-words">
                                {col.name}
                              </span>
                            </div>
                            <span className={`px-2.5 py-1 text-[9px] font-mono rounded-full font-bold uppercase shrink-0 tracking-wider ${
                              col.surcharge > 0 ? 'bg-amber-100 text-amber-800 font-black' : 'bg-slate-100 text-slate-500 font-medium'
                            }`}>
                              {col.surcharge > 0 ? `+${col.surcharge}%` : 'Základ'}
                            </span>
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
                    <div className="flex flex-col gap-2">
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
                            className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition duration-100 active:scale-[0.98] text-xs text-slate-800 font-bold cursor-pointer w-full shadow-xs ${
                              isSelected ? 'border-indigo-600 bg-indigo-50/15 ring-1 ring-indigo-600/30' : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`h-7 w-7 rounded-full border shrink-0 shadow-2xs ${blockColor}`} />
                              <span className="text-xs sm:text-sm text-slate-800 font-bold tracking-tight leading-snug whitespace-normal break-words">
                                {col.name}
                              </span>
                            </div>
                            <span className={`px-2.5 py-1 text-[9px] font-mono rounded-full font-bold uppercase shrink-0 tracking-wider ${
                              col.surcharge > 0 ? 'bg-amber-100 text-amber-800 font-black' : 'bg-slate-100 text-slate-500 font-medium'
                            }`}>
                              {col.surcharge > 0 ? `+${col.surcharge}%` : 'Standard'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* iOS-Style Guidelines Card from XLS Sheet */}
              {PRODUCT_XLS_GUIDELINES[category] && (
                <div className="mt-6 bg-[#F2F2F7] border border-neutral-200/40 rounded-2xl p-4 space-y-3 animate-fade-in shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-neutral-900 rounded-xl text-white">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black uppercase text-neutral-800 tracking-wider">
                        Pravidla a limity pro {PRODUCT_XLS_GUIDELINES[category].title}
                      </h5>
                      <span className="text-[9px] text-[#8E8E93] font-bold block">
                        Technologický list ze souboru: {PRODUCT_XLS_GUIDELINES[category].file}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pl-1.5 border-l-2 border-indigo-500/30">
                    {PRODUCT_XLS_GUIDELINES[category].rules.map((rule, idx) => (
                      <div key={idx} className="flex gap-2 text-[11px] text-[#1C1C1E] leading-normal font-semibold">
                        <span className="text-indigo-600 shrink-0 select-none">•</span>
                        <p>{rule}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile preview handled globally at the top */}
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

              {/* iOS-Style Guidelines Card from XLS Sheet */}
              {PRODUCT_XLS_GUIDELINES[category] && (
                <div className="mt-6 bg-[#F2F2F7] border border-neutral-200/40 rounded-2xl p-4 space-y-3 animate-fade-in shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-neutral-900 rounded-xl text-white">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black uppercase text-neutral-800 tracking-wider">
                        Pravidla, pohony a limity pro {PRODUCT_XLS_GUIDELINES[category].title}
                      </h5>
                      <span className="text-[9px] text-[#8E8E93] font-bold block">
                        Technologický list ze souboru: {PRODUCT_XLS_GUIDELINES[category].file}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pl-1.5 border-l-2 border-indigo-500/30">
                    {PRODUCT_XLS_GUIDELINES[category].rules.map((rule, idx) => (
                      <div key={idx} className="flex gap-2 text-[11px] text-[#1C1C1E] leading-normal font-semibold">
                        <span className="text-indigo-600 shrink-0 select-none">•</span>
                        <p>{rule}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile preview handled globally at the top */}
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

                  {category === 'PLISSE' && (
                    <>
                      <div className="flex justify-between border-t border-indigo-100/50 pt-1.5 division-y">
                        <span className="text-slate-400">Plisé model:</span>
                        <span className="font-bold text-slate-800">{plisseModel} ({controlSide === 'madlo' ? 'Madlo' : 'Provázek'})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">První látka:</span>
                        <span className="font-semibold text-slate-800">{firstFabric}</span>
                      </div>
                      {(plisseModel.startsWith('DB') || plisseModel === 'PM3M') && secondFabric && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Druhá látka:</span>
                          <span className="font-semibold text-slate-800">{secondFabric}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Uchycení:</span>
                        <span className="font-semibold text-slate-850 text-right">{mountingType}</span>
                      </div>
                      {extensionRod !== 'NONE' && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Prodlužovací tyč:</span>
                          <span className="font-semibold text-slate-800">{extensionRod} cm</span>
                        </div>
                      )}
                      {childSafety && (
                        <div className="text-[10px] text-[#007AFF] font-bold bg-white p-1 rounded border border-blue-100 text-center mt-1">
                          ✓ Dětská bezpečnost (ČSN EN 13120)
                        </div>
                      )}
                    </>
                  )}

                  {category === 'VERTICAL' && (
                    <>
                      <div className="flex justify-between border-t border-indigo-100/50 pt-1.5">
                        <span className="text-slate-400">Omezení typ:</span>
                        <span className="font-bold text-slate-800">{verticalLimitation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Provedení:</span>
                        <span className="font-semibold text-slate-800">{verticalDesign}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Louver velikost:</span>
                        <span className="font-semibold text-slate-800">{lamellaSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Stahování lamel:</span>
                        <span className="font-semibold text-slate-850">Typ {controlSide}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Uchycení:</span>
                        <span className="font-semibold text-slate-800">{mountingType || 'Strop'}</span>
                      </div>
                      {verticalExtraBrackets > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Úchyty navíc:</span>
                          <span className="font-bold text-emerald-700">+{verticalExtraBrackets} ks</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Délka ovládání:</span>
                        <span className="font-semibold text-slate-800">{verticalControlLength === 'standard' ? 'Standardní' : `${verticalControlLength} mm`}</span>
                      </div>
                      {childSafety && (
                        <div className="text-[10px] text-[#007AFF] font-bold bg-white p-1 rounded border border-blue-100 text-center mt-1">
                          ✓ Dětská bezpečnost (Závaží / Spojka)
                        </div>
                      )}
                    </>
                  )}

                  {category === 'JAPANESE' && (
                    <>
                      <div className="flex justify-between border-t border-indigo-100/50 pt-1.5">
                        <span className="text-slate-400">Posuvné panely:</span>
                        <span className="font-bold text-slate-800">{panelCount} panelů</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Šířka panelu:</span>
                        <span className="font-bold text-indigo-700">{panelWidth} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kolejnice - Drážky:</span>
                        <span className="font-semibold text-slate-850">{japTrackType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Barva kolejnice:</span>
                        <span className="font-semibold text-slate-800">{japTrackColor === 'RAL č. ...' ? `RAL lakování: ${japTrackRal}` : japTrackColor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Uchycení:</span>
                        <span className="font-semibold text-slate-800">{mountingType === '2 - stěna' || mountingType === 'stěna' ? 'Na stěnu' : 'Do stropu'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tkanina panelu:</span>
                        <span className="font-semibold text-slate-800">{lamellaSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Typ ovládání:</span>
                        <span className="font-semibold text-slate-850">
                          {controlSide === 'rucni' ? 'Ruční volný tah' : controlSide === 'snura' ? 'Šňůra s těžítkem' : 'Transparentní táhlo'}
                        </span>
                      </div>
                      {japMagnetsEnabled && (
                        <div className="text-[10px] text-[#FF9500] font-bold bg-amber-50 p-1 rounded border border-amber-100 text-center mt-1">
                          ✓ Magnetické úchyty ({japMagnetCount} párů)
                        </div>
                      )}
                    </>
                  )}

                  {category === 'EXTERNAL' && (
                    <>
                      {boxType && (
                        <div className="flex justify-between border-t border-indigo-100/50 pt-1.5">
                          <span className="text-slate-400">Typ boxu / Profilu:</span>
                          <span className="font-bold text-slate-800">{boxType}</span>
                        </div>
                      )}
                      {boxColor && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Barva boxu / lišt:</span>
                          <span className="font-semibold text-slate-800">{boxColor}</span>
                        </div>
                      )}
                      {guideType && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vodicí prvek:</span>
                          <span className="font-semibold text-slate-800">{guideType}</span>
                        </div>
                      )}
                      {fabricType && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Screenová tkanina:</span>
                          <span className="font-bold text-indigo-700">{fabricType}</span>
                        </div>
                      )}
                      {rollDirection && (
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold text-indigo-800">Směr navíjení:</span>
                          <span className="font-semibold text-slate-800">{rollDirection}</span>
                        </div>
                      )}
                      {endProfileType && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Koncová lišta / Lamela:</span>
                          <span className="font-semibold text-slate-800">{endProfileType}</span>
                        </div>
                      )}
                      {endProfileColor && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Víko / Barva konc. lišty:</span>
                          <span className="font-semibold text-slate-800">{endProfileColor}</span>
                        </div>
                      )}
                      {gasketType && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Těsnění dolní hrany:</span>
                          <span className="font-semibold text-slate-800">{gasketType}</span>
                        </div>
                      )}
                      {mountingTypeCustom && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Způsob kotvení:</span>
                          <span className="font-semibold text-slate-800">{mountingTypeCustom}</span>
                        </div>
                      )}
                      {fabricOrientation && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Směr odvíjení:</span>
                          <span className="font-semibold text-slate-800">{fabricOrientation}</span>
                        </div>
                      )}
                      {capColor && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Barva koncovek plastů:</span>
                          <span className="font-semibold text-slate-800">{capColor}</span>
                        </div>
                      )}
                      {distanceProfile && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Distanční úchyty:</span>
                          <span className="font-semibold text-slate-800">{distanceProfile}</span>
                        </div>
                      )}
                      {electronicsReceiver && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pohon / Motor:</span>
                          <span className="font-semibold text-slate-800">{electronicsReceiver}</span>
                        </div>
                      )}
                      {preDrilling && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Předvrtání lišt:</span>
                          <span className="font-bold text-indigo-700">{preDrilling}</span>
                        </div>
                      )}
                      {externalCoverPlate && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vnější krycí deska:</span>
                          <span className="font-semibold text-slate-800">{externalCoverPlate}</span>
                        </div>
                      )}
                      {internalCoverPlate && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vnitřní přechod. lišta:</span>
                          <span className="font-semibold text-slate-800">{internalCoverPlate}</span>
                        </div>
                      )}
                      {integratedMesh && (
                        <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 p-1 rounded border border-emerald-100 text-center mt-1">
                          ✓ Integrovaná rolovací síť proti hmyzu
                        </div>
                      )}
                    </>
                  )}

                  {category === 'AWNING' && (
                    <>
                      {productType === 'AWN_UNION_DROP' && (
                        <>
                          <div className="flex justify-between border-t border-indigo-100/50 pt-1.5">
                            <span className="text-slate-400">Konstrukce markýzy:</span>
                            <span className="font-bold text-slate-800">{boxType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold text-indigo-800">Délka vyložení ramene:</span>
                            <span className="font-semibold text-slate-800">{awningDrop}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Barva konstrukce AL:</span>
                            <span className="font-semibold text-slate-800">{boxColor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Typ kotvení:</span>
                            <span className="font-semibold text-slate-800">{mountingTypeCustom}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Délka kliky (pohon):</span>
                            <span className="font-semibold text-slate-800">{distanceProfile}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Spodní volán / Tvar:</span>
                            <span className="font-semibold text-slate-800">{gasketType}</span>
                          </div>
                          {awningHood && (
                            <div className="text-[10px] text-indigo-700 font-bold bg-indigo-50 p-1.5 rounded border border-indigo-100 text-center mt-1">
                              ✓ S horní AL stříškou
                            </div>
                          )}
                          {bracketExtra > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Extra držáky konzol:</span>
                              <span className="font-bold text-amber-700">+{bracketExtra} ks</span>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

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
