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
  | 'ROLL_OPTIMA'
  | 'ROLL_ROLOLITE'
  // Sítě proti hmyzu a dveřní sítě (Kat 07)
  | 'SCREEN_FIX_W'
  | 'SCREEN_DOOR_OPEN'
  | 'SCREEN_DOOR_SLIDE'
  | 'SCREEN_DOOR_PLEAT'
  // Venkovní žaluzie (Kat 09)
  | 'EXT_Z90'
  | 'EXT_S90'
  | 'EXT_C80'
  | 'EXT_F80'
  // Markýzy (Kat 13)
  | 'AWN_CASABLANCA'
  | 'AWN_DAKOTA'
  | 'AWN_ITALIA';

export type ProductCategory = 
  | 'HORIZONTAL' 
  | 'WOODEN' 
  | 'VERTICAL' 
  | 'ROLETKY' 
  | 'SCREENS' 
  | 'EXTERNAL' 
  | 'AWNING';

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
