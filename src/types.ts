export type ProductType =
  // Horizontální žaluzie (Kat 01)
  | 'HZ_25_19'
  | 'HZ_27_19'
  | 'ISOLINE'
  | 'ISOLINE_LOCO'
  | 'ISOLINE_PRIM'
  | 'ISOLINE_ECO'
  // Dřevěné žaluzie (Kat 03)
  | 'WOOD_25'
  | 'WOOD_35'
  | 'WOOD_50'
  // Vertikální stínění (Kat 04)
  | 'VERT_STOFF_89'
  | 'VERT_STOFF_127'
  | 'VERT_PVC'
  // Textilní roletky (Kat 05)
  | 'ROLL_STREAM_S'
  | 'ROLL_STREAM_PLUS'
  | 'ROLL_SONATA'
  | 'ROLL_OPUS_OPTIMA_COLLETE'
  | 'ROLL_LEGEND'
  | 'ROLL_JAZZ'
  // Sítě proti hmyzu a dveřní sítě (Kat 07)
  | 'SCREEN_FIX_W'
  | 'SCREEN_DOOR_OPEN'
  | 'SCREEN_DOOR_SLIDE'
  | 'SCREEN_DOOR_PLEAT'
  | 'SCREEN_SLIDE_TRACKS'
  | 'SCREEN_SLIDE_FRAME'
  | 'SCREEN_SLANT'
  | 'SCREEN_ROLLER_VERSA'
  | 'SCREEN_ROLLER_DAROS'
  // Venkovní screenové rolety a markýzy (nové)
  | 'EXT_TARA_PREMIO_I'
  | 'EXT_TARA_PREMIO_II'
  | 'EXT_GHIBLI_UNION'
  | 'AWN_UNION_DROP'
  | 'EXT_ROLO_VENKOVNI'
  | 'EXT_ROLO_HELUZ'
  // Venkovní žaluzie (Kat 09)
  | 'EXT_Z90'
  | 'EXT_S90'
  | 'EXT_C80'
  | 'EXT_F80'
  // Markýzy (Kat 13)
  | 'AWN_CASABLANCA'
  | 'AWN_DAKOTA'
  | 'AWN_ITALIA'
  // Plisé žaluzie
  | 'PLISSE_DARNI'
  | 'PLISSE_LAGARTA'
  // Japonská stěna
  | 'JAP_STENA';

export type ProductCategory = 
  | 'HORIZONTAL' 
  | 'WOODEN' 
  | 'VERTICAL' 
  | 'ROLETKY' 
  | 'SCREENS' 
  | 'EXTERNAL' 
  | 'AWNING'
  | 'PLISSE'
  | 'JAPANESE';

export type LamellaSize = '25x0.18' | '25x0.21' | '16x0.21' | 'Z90' | 'S90' | 'C80' | 'F80' | 'Tkanina Premium' | 'Tkanina Standard';

export type ControlSide =
  | 'RP'   // Řetízek Vpravo
  | 'RL'   // Řetízek Vlevo
  | 'P'    // Brzda/Klika Vpravo
  | 'L'    // Brzda/Klika Vlevo
  | 'M'    // Meziskelní (HZ)
  | 'MF'   // Meziskelní s fixací (HZ)
  | 'IF'   // Boční vývod bowden (HZ)
  | 'IB'   // Brzda, šnek, tyčka (HZ)
  | 'IBF'  // Brzda, šnek, tyčka, fixace (HZ)
  | 'IBS'  // Brzda, šnek, tyčka, střešní fixace (HZ)
  | 'IRB'  // Čelní bowden, brzda (HZ)
  | 'IRBF' // Čelní bowden, brzda, fixace (HZ)
  | 'MOTOR_IO' // Motorické dálkové Somfy IO
  | 'MOTOR_SWITCH'; // Motorické dálkové na vypínač

export interface BlindOrderItem {
  id: string;
  category: ProductCategory;
  productType: ProductType;
  width: number;       // in mm
  height: number;      // in mm
  quantity: number;
  lamellaSize: LamellaSize | string;
  lamellaColor: string;
  topProfileColor: string;
  bottomProfileColor: string;
  controlSide: ControlSide | string;
  isCelostin: boolean; // Domykatelné provedení / Celostín
  isSlant: boolean;    // Šikmina
  hasBrake: boolean;   // Specific for Prim or others
  hasGearbox: boolean; // Specific for Prim or others
  motorBrand?: 'SOMFY' | 'ELERO' | 'MOCK' | 'NONE'; // Motor selection
  awningWindSensor?: boolean; // Markýza větrné čidlo
  notes?: string;

  // New attributes for insect screens, doors, and window screens
  profileType?: string;
  screenType?: string;
  screenColor?: string;
  threshold?: string;
  meshColor?: string;
  coverBar?: boolean;
  supportingProfile?: boolean;
  mountingLProfile?: boolean;

  // Door Screens specific
  rivetingPants?: boolean;
  pantsSide?: 'L' | 'P';
  pantsCountStandard?: number;
  pantsCountSelfClose?: number;
  kickPlate?: boolean;
  brushProfile?: boolean;
  doorBarPosition?: string;
  handleMagnet?: boolean;

  // Window Screens specific
  brushType?: string;
  brushHeight?: string;
  holderType?: string;
  holderHeight?: string;
  riveting?: boolean;
  cornersLook?: string;
  windowBarCount?: number;
  windowBarHeight1?: number;
  windowBarHeight2?: number;

  // Roller Blinds specific
  controlMethod?: string;
  electronicsType?: string;
  chainLength?: string;
  coverFabric?: boolean;
  mountingOpus?: string;
  safetyElement?: boolean;
  coverBarCollete?: 'plochá' | 'radius';

  // Horizontal Blinds specific
  lamellaType?: string;
  profileMaterial?: 'Fe' | 'Al';
  locoColor?: string;
  isDomykave?: boolean;
  colorHarmony?: boolean;
  controlLengthCustom?: string;
  controlAccessory?: string;
  windowMaterial?: string;
  spacerCount?: number;
  safetyElementBlinds?: boolean;
  mountingSupport?: boolean;

  // Plisse Blinds specific
  plisseModel?: string;           // AO 43, PM1, etc.
  firstFabric?: string;           // první látka (horní)
  secondFabric?: string;          // druhá látka (dolní)
  mountingType?: string;          // typ uchycení
  extensionRod?: string;          // prodlužovací tyč (cm)
  plisseCoverBar?: string;        // krycí lišta
  childSafety?: boolean;          // dětská pojistka (PP) / bezpečnostní úchyt (AO)

  // Vertical Blinds specific
  verticalLimitation?: string;    // Omezení typ (1, 2a, 2b, 3)
  verticalDesign?: string;        // Provedení (1 - standard, 2 - lux)
  verticalStahovani?: string;     // Typ stahování (1, 2, 3, 4, 5, 8/1, 8/2, ...)
  verticalColorsCount?: number;   // Počet barev
  verticalExtraBrackets?: number; // Uchycení navíc (ks)
  verticalControlLength?: string; // Délka ovládání

  // Japanese Wall specific
  panelWidth?: number;           // Šířka panelu (mm)
  panelCount?: number;            // Počet panelů
  japTrackType?: string;          // VL typ (2 až 5 drážková)
  japTrackColor?: string;         // VL barva (bílá, RAL, atd.)
  japTrackRal?: string;           // VL barva RAL kód
  japMagnetsEnabled?: boolean;    // Magnetické úchyty
  japMagnetCount?: number;        // Magnetické úchyty - počet párů

  // Textile Roller Blinds specific
  submodelType?: string;          // Sonata / JAZZ / OPUS-OPTIMA-COLLETE submodels
  unreelingDir?: string;          // odvíjení: ke zdi / ode zdi
  bracketColor?: string;          // barva komponentů
  profileColor?: string;          // barva montážního profilu / boxu
  windowManufacturer?: string;    // výrobce okna (Velux, Fakro, Roto, kolmé hrany, jiné)
  extraHooksPairs?: number;       // počet páru háčků navíc
  guideRailsOption?: boolean;     // vodicí lišty (ANO/NE)
  guideRailsWidth?: string;       // šířka vodicí lišty
  telescopicPoleCount?: number;   // teleskopická tyč (ks)

  // Nové atributy pro venkovní rolety, screeny a markýzy
  boxType?: string;               // Typ boxu
  boxColor?: string;              // Barva boxu / konstrukce
  guideType?: string;             // Typ vedení (J, JU, D, lanko, atd.)
  guideLeft?: string;             // Levá vodicí lišta / distance
  guideRight?: string;            // Pravá vodicí lišta / distance
  endProfileType?: string;        // Koncová lišta / lamela typ
  endProfileColor?: string;       // Barva koncové lišty / lamely
  gasketType?: string;            // Těsnění (G - guma, K - kartáček)
  capColor?: string;              // Barva koncovek
  distanceProfile?: string;       // Distanční profil
  mountingTypeCustom?: string;    // Typ montáže (do ostění, jekl, atd.)
  fabricType?: string;            // Typ látky (Soltis, Serge, atd.)
  fabricOrientation?: string;     // Orientace / strana látky
  rollDirection?: string;         // Směr odvíjení (L - levotočivá, P - pravotočivá)
  externalCoverPlate?: string;    // Vnější revizní klapka
  internalCoverPlate?: string;    // Vnitřní revizní klapka
  bracketExtra?: number;          // Konzola navíc pro výklopné markýzy
  awningDrop?: string;            // Výklop v mm (500, 700, atd.)
  awningHood?: boolean;           // Stříška Al-extrud.
  integratedMesh?: boolean;       // Integrovaná síť proti hmyzu
  preDrilling?: string;           // Předvrtání (ne, rám, ostění)
  electronicsReceiver?: string;   // Čidla, přijímač, dálkový ovladač
  electronicsApp?: string;        // Ovládací panely a aplikace
}

export interface QapiOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  ownerEmail: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  items: BlindOrderItem[];
  status: 'draft' | 'validated' | 'submitted';
  totalPriceEstimate: number;
  notes?: string;
}

export interface ValidationAlert {
  itemId: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  field: string;
}

export interface ParseResponse {
  success: boolean;
  items?: Partial<BlindOrderItem>[];
  orderMetadata?: {
    orderNumber?: string;
    customerName?: string;
    notes?: string;
  };
  error?: string;
}
