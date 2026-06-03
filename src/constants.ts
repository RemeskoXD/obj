import { BlindOrderItem, ValidationAlert } from './types';

export const LAMELLA_COLORS = [
  { code: '9010', name: 'Bílá (RAL 9010)', surcharge: 0 },
  { code: '8017', name: 'Tmavě hnědá (RAL 8017)', surcharge: 0 },
  { code: '9006', name: 'Stříbrná (RAL 9006)', surcharge: 10 },
  { code: '7016', name: 'Antracit (RAL 7016)', surcharge: 15 },
  { code: '1013', name: 'Slonová kost (RAL 1013)', surcharge: 15 },
  { code: '8004', name: 'Měděná / Hnědá (RAL 8004)', surcharge: 15 },
  { code: 'W91', name: 'Imitace dřeva - Borovice (W91)', surcharge: 35 },
  { code: 'W92', name: 'Imitace dřeva - Buk (W92)', surcharge: 35 },
  { code: 'W93', name: 'Imitace dřeva - Dub (W93)', surcharge: 35 },
  { code: 'W95', name: 'Imitace dřeva - Zlatý dub (W95)', surcharge: 35 },
  { code: 'W96', name: 'Imitace dřeva - Ořech (W96)', surcharge: 35 },
  { code: 'W98', name: 'Imitace dřeva - Mahagon (W98)', surcharge: 35 },
  { code: 'AWN_STD_BG', name: 'Markýzová tkanina Béžová (Standard)', surcharge: 0 },
  { code: 'AWN_STD_GR', name: 'Markýzová tkanina Šedá (Standard)', surcharge: 0 },
  { code: 'AWN_PREM_ST', name: 'Markýzová tkanina Stripes (Prémiová)', surcharge: 25 },
];

export const PROFILE_COLORS = [
  { code: 'RAL9010', name: 'Bílá (RAL 9010)', surcharge: 0 },
  { code: 'RAL8017', name: 'Tm. hnědá (RAL 8017)', surcharge: 0 },
  { code: 'RAL9006', name: 'Stříbrná (RAL 9006)', surcharge: 15 },
  { code: 'RAL7016', name: 'Antracit (RAL 7016)', surcharge: 25 },
  { code: 'RE_OAK', name: 'Renolit Fólie - Zlatý dub', surcharge: 45 },
  { code: 'RE_NUTS', name: 'Renolit Fólie - Ořech', surcharge: 45 },
  { code: 'AWN_ALU_W', name: 'Konstrukce Bílá plech', surcharge: 0 },
  { code: 'AWN_ALU_A', name: 'Konstrukce Antracit lak', surcharge: 15 },
];

// Technical validation of single items according to QAPI guidelines
export function validateBlindItem(item: BlindOrderItem): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];
  const areaM2 = (item.width * item.height) / 1000000;

  // 1. Common checks
  if (item.width <= 0 || item.height <= 0) {
    alerts.push({
      itemId: item.id,
      type: 'error',
      field: 'dimensions',
      message: 'Šířka i výška (výsuv) musí být větší než 0 mm.',
    });
    return alerts; // Stop further checks on zero dimensions
  }

  // 2. Specific product checks
  switch (item.productType) {
    case 'ISOLINE':
    case 'ISOLINE_LOCO': {
      // Min/Max Width
      if (item.width < 200) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: `Minimální šířka pro Isoline je 200 mm. Zadáno: ${item.width} mm.`,
        });
      }
      if (item.width > 2400) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: `Maximální šířka pro Isoline je 2400 mm. Zadáno: ${item.width} mm.`,
        });
      }

      // 16x0.21 lamella minimum width restriction (strana 5)
      if (item.lamellaSize === '16x0.21' && item.width < 330) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'lamellaSize',
          message: `Při použití úzké lamely 16x0.21 mm je minimální šířka 330 mm! Zadáno: ${item.width} mm.`,
        });
      }

      // Min/Max Height
      if (item.height < 300) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: `Minimální výška pro Isoline je 300 mm. Zadáno: ${item.height} mm.`,
        });
      }
      if (item.height > 2500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: `Maximální výška pro Isoline je 2500 mm. Zadáno: ${item.height} mm.`,
        });
      }

      // Area restriction (2.4 m2)
      if (areaM2 > 2.4) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'dimensions',
          message: `Maximální garantovaná plocha Isoline je 2.4 m². Zadáno: ${areaM2.toFixed(2)} m².`,
        });
      }

      // Isoline control validation
      if (!['RP', 'RL'].includes(item.controlSide as string)) {
        alerts.push({
          itemId: item.id,
          type: 'warning',
          field: 'controlSide',
          message: 'Isoline standardně využívá řetízkové ovládání ŘP nebo ŘL.',
        });
      }
      break;
    }

    case 'ISOLINE_PRIM': {
      // Prim ranges (strana 9)
      const minW = item.hasGearbox ? 350 : item.hasBrake ? 330 : 240;
      if (item.width < minW) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: `Minimální šířka Isoline Prim je ${minW} mm (standard: 240mm, s brzdou: 330mm, s převodovkou: 350mm). Zadáno: ${item.width} mm.`,
        });
      }
      if (item.width > 2200) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: `Maximální šířka Isoline Prim je 2200 mm. Zadáno: ${item.width} mm.`,
        });
      }

      // Heights
      if (item.height < 300) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: `Minimální výška pro Isoline Prim je 300 mm.`,
        });
      }
      if (item.height > 2400) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: `Maximální výška pro Isoline Prim je 2400 mm.`,
        });
      }

      // Gearbox requirement for areas above 2.4 m2 (strana 9)
      if (areaM2 > 2.4 && !item.hasGearbox) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'hasGearbox',
          message: `U plochy nad 2.4 m² (${areaM2.toFixed(2)} m²) je pro zachování záruky QAPI VYŽADOVÁNA převodovka s brzdou, jinak nelze objednat!`,
        });
      }

      if (areaM2 > 5.28) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'dimensions',
          message: `Absolutní limit plochy Isoline Prim s převodovkou je 5.28 m². Zadáno: ${areaM2.toFixed(2)} m².`,
        });
      }

      // Mounting brackets indicator (strana 10)
      if (item.width >= 1500) {
        alerts.push({
          itemId: item.id,
          type: 'info',
          field: 'width',
          message: 'Při šířce nad 1.5 m budou automaticky dodány 2 ks montážních podpěr standardu Prim.',
        });
      } else if (item.width > 0) {
        alerts.push({
          itemId: item.id,
          type: 'info',
          field: 'width',
          message: 'Šířka pod 1.5 m vyžaduje 1 ks montážní podpěry Prim.',
        });
      }
      break;
    }

    case 'ISOLINE_ECO': {
      if (item.width < 200) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Minimální šířka Isoline Eco je 200 mm.',
        });
      }
      if (item.width > 2400) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Maximální šířka Isoline Eco je 2400 mm.',
        });
      }
      if (item.height < 300) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Minimální výška Isoline Eco je 300 mm.',
        });
      }
      if (item.height > 2500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Maximální výška Isoline Eco je 2500 mm.',
        });
      }
      if (areaM2 > 2.4) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'dimensions',
          message: `Maximální plocha Isoline Eco je 2.4 m². Zadáno: ${areaM2.toFixed(2)} m².`,
        });
      }

      if (item.lamellaSize === '16x0.21' && item.width < 330) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'lamellaSize',
          message: `Při úzké lamele 16x0.21 mm je minimální šířka Isoline Eco 330 mm!`,
        });
      }

      if (!['P', 'L'].includes(item.controlSide as string)) {
        alerts.push({
          itemId: item.id,
          type: 'warning',
          field: 'controlSide',
          message: 'Isoline Eco využívá ovládání pomocí tyčky a brzdy vpravo (P) nebo vlevo (L).',
        });
      }
      break;
    }

    case 'HZ_25_19':
    case 'HZ_27_19': {
      // Classic horizontal (strana 3)
      if (item.width < 150) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Minimální šířka HZ žaluzie je 150 mm.',
        });
      }
      if (item.width > 2000) {
        alerts.push({
          itemId: item.id,
          type: 'warning',
          field: 'width',
          message: 'Šířka nad 2000 mm pro tyčkové HZ žaluzie je na uvážení výroby.',
        });
      }

      // Slant restriction is strictly profile 27x19 (strana 3 - FIXACE ŠIKMINA pouze profil 27x19)
      if (item.isSlant && item.productType === 'HZ_25_19') {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'isSlant',
          message: 'Šikminy (atypické šikmé rezy) jsou podporovány výhradně na silnějším profilu HZ 27x19 mm!',
        });
      }
      break;
    }

    // Venkovní žaluzie checks (Z-90, S-90, C-80, F-80)
    case 'EXT_Z90':
    case 'EXT_S90':
    case 'EXT_C80':
    case 'EXT_F80': {
      if (item.width < 400) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Minimální šířka venkovní žaluzie je 400 mm (při klice). Motorické vyžadují aspoň 600 mm.',
        });
      }
      if (item.width > 4500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Maximální šířka jednoho kusu venkovní žaluzie je 4500 mm z důvodu větrné zátěže.',
        });
      }
      if (item.height < 500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Minimální výška venkovní žaluzie je 500 mm.',
        });
      }
      if (item.height > 4000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Maximální výška venkovní žaluzie je 4000 mm.',
        });
      }

      const isMotor = ['MOTOR_IO', 'MOTOR_SWITCH'].includes(item.controlSide as string);
      const maxArea = isMotor ? 16.0 : 8.0;
      if (areaM2 > maxArea) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'dimensions',
          message: `Překročena maximální plocha pro typ ovládání. Limit pro ${
            isMotor ? 'motor' : 'klikový pohon'
          } je ${maxArea} m². Zadáno: ${areaM2.toFixed(2)} m².`,
        });
      }

      if (item.width > 2500) {
        alerts.push({
          itemId: item.id,
          type: 'info',
          field: 'width',
          message: 'Tento rozměr vyžaduje přídavné silné vodicí lišty s ocelovým lanem pro zvýšení torzní stability ve větru.',
        });
      }
      break;
    }

    // Markýzy checks
    case 'AWN_CASABLANCA':
    case 'AWN_DAKOTA': {
      if (item.width < 2000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Kasetové terasové markýzy vyžadují minimální konstrukční šířku 2000 mm.',
        });
      }
      if (item.width > 6000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Maximální šířka jednoho kusu kasetové markýzy QAPI je 6000 mm.',
        });
      }
      // Reach limits
      if (item.height < 1500 || item.height > 3500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Výsuv markýzy (reach) se musí pohybovat v rozmezí 1500 mm až 3500 mm (dle konstrukce kloubových ramen).',
        });
      }

      // Wind sensor alert
      const isMotorized = ['MOTOR_IO', 'MOTOR_SWITCH'].includes(item.controlSide as string);
      if (isMotorized && !item.awningWindSensor) {
        alerts.push({
          itemId: item.id,
          type: 'warning',
          field: 'awningWindSensor',
          message: 'K motorické markýze důrazně doporučujeme přidat větrné/otřesové čidlo Somfy Eolis pro ochranu před poryvy větru.',
        });
      }
      break;
    }

    case 'AWN_ITALIA': {
      if (item.width < 1000 || item.width > 5000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Okenní markýza Italia vyžaduje šířku v rozmezí 1000 mm až 5000 mm.',
        });
      }
      if (item.height < 1000 || item.height > 1800) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Výsuv ramen markýzy Italia musí být od 1000 mm do 1800 mm.',
        });
      }
      break;
    }

    // Dřevěné žaluzie (Kat 03)
    case 'WOOD_25':
    case 'WOOD_35': {
      if (item.width < 400 || item.width > 1800) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Dřevěné žaluzie (25/35mm) vyžadují šířku od 400 mm do 1800 mm.',
        });
      }
      if (item.height < 400 || item.height > 2200) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Dřevěné žaluzie (25/35mm) vyžadují výšku od 400 mm do 2200 mm.',
        });
      }
      if (areaM2 > 3.6) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'dimensions',
          message: `Maximální limit plochy dřevěné žaluzie 25/35mm je 3.6 m². Zadáno: ${areaM2.toFixed(2)} m².`,
        });
      }
      break;
    }

    case 'WOOD_50': {
      if (item.width < 500 || item.width > 2400) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Dřevěná žaluzie 50mm vyžaduje šířku od 500 mm do 2400 mm.',
        });
      }
      if (item.height < 500 || item.height > 3000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Dřevěná žaluzie 50mm vyžaduje výšku od 500 mm do 3000 mm.',
        });
      }
      if (areaM2 > 6.0) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'dimensions',
          message: `Maximální garantovaná plocha dřevěné žaluzie 50mm je 6.0 m². Zadáno: ${areaM2.toFixed(2)} m².`,
        });
      }
      break;
    }

    // Vertikální stínění (Kat 04)
    case 'VERT_STOFF_89':
    case 'VERT_STOFF_127': {
      if (item.width < 400 || item.width > 5800) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Vertikální stínění (látka) vyžaduje šířku od 400 mm do 5800 mm.',
        });
      }
      if (item.height < 500 || item.height > 4500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Vertikální stínění (látka) vyžaduje výšku od 500 mm do 4500 mm.',
        });
      }
      break;
    }

    case 'VERT_PVC': {
      if (item.width < 400 || item.width > 4000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Vertikální stínění (PVC) vyžaduje šířku od 400 mm do 4000 mm.',
        });
      }
      if (item.height < 500 || item.height > 3000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Vertikální stínění (PVC) vyžaduje výšku od 500 mm do 3000 mm.',
        });
      }
      break;
    }

    // Textilní roletky (Kat 05)
    case 'ROLL_OPTIMA': {
      if (item.width < 300 || item.width > 1500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Roletka Optima vyžaduje šířku od 300 mm do 1500 mm.',
        });
      }
      if (item.height < 300 || item.height > 2000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Roletka Optima vyžaduje výšku od 300 mm do 2000 mm.',
        });
      }
      break;
    }

    case 'ROLL_ROLOLITE': {
      if (item.width < 400 || item.width > 2000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Roletka Rololite vyžaduje šířku od 400 mm do 2000 mm.',
        });
      }
      if (item.height < 400 || item.height > 2500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Roletka Rololite vyžaduje výšku od 400 mm do 2500 mm.',
        });
      }
      break;
    }

    // Sítě proti hmyzu (Kat 07)
    case 'SCREEN_FIX_W': {
      if (item.width < 300 || item.width > 1800) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Pevná okenní sítě vyžaduje šířku od 300 mm do 1800 mm.',
        });
      }
      if (item.height < 300 || item.height > 2000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Pevná okenní sítě vyžaduje výšku od 300 mm do 2000 mm.',
        });
      }
      break;
    }

    case 'SCREEN_DOOR_OPEN': {
      if (item.width < 500 || item.width > 1200) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Dveřní síť otvíravá vyžaduje šířku od 500 mm do 1200 mm.',
        });
      }
      if (item.height < 1000 || item.height > 2400) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Dveřní síť otvíravá vyžaduje výšku od 1000 mm do 2400 mm.',
        });
      }
      break;
    }

    case 'SCREEN_DOOR_SLIDE': {
      if (item.width < 600 || item.width > 2000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Posuvná dveřní síť vyžaduje šířku od 600 mm do 2000 mm.',
        });
      }
      if (item.height < 1000 || item.height > 2500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Posuvná dveřní síť vyžaduje výšku od 1000 mm do 2500 mm.',
        });
      }
      break;
    }

    case 'SCREEN_DOOR_PLEAT': {
      if (item.width < 500 || item.width > 3000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Plisovaná dveřní síť vyžaduje šířku od 500 mm do 3000 mm.',
        });
      }
      if (item.height < 1000 || item.height > 2800) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Plisovaná dveřní síť vyžaduje výšku od 1000 mm do 2800 mm.',
        });
      }
      break;
    }
  }

  return alerts;
}

// Calculate estimate based on realistic formula (using dimensions + factors + surcharge)
export function calculateItemPrice(item: BlindOrderItem): number {
  const areaM2 = (item.width * item.height) / 1000000;
  let finalPrice = 0;

  // Horizontal blind formulas
  if (item.category === 'HORIZONTAL' || !item.category) {
    let basePricePerM2 = 450;
    switch (item.productType) {
      case 'ISOLINE': basePricePerM2 = 480; break;
      case 'ISOLINE_LOCO': basePricePerM2 = 540; break;
      case 'ISOLINE_PRIM': basePricePerM2 = 620; break;
      case 'ISOLINE_ECO': basePricePerM2 = 510; break;
      case 'HZ_25_19': basePricePerM2 = 390; break;
      case 'HZ_27_19': basePricePerM2 = 420; break;
    }

    const billingArea = Math.max(areaM2, 0.5);
    let percentageSurcharge = 0;
    let flatSurcharge = 0;

    if (item.isCelostin) percentageSurcharge += 15;
    if (item.isSlant) percentageSurcharge += 60;

    if (item.productType === 'ISOLINE_PRIM') {
      if (item.hasBrake) flatSurcharge += 80;
      if (item.hasGearbox) flatSurcharge += 350;
    }

    const lamellaCol = LAMELLA_COLORS.find(c => c.code === item.lamellaColor) || LAMELLA_COLORS[0];
    const profileCol = PROFILE_COLORS.find(p => p.code === item.topProfileColor) || PROFILE_COLORS[0];
    const colorAddMultiplier = 1 + (lamellaCol.surcharge + profileCol.surcharge) / 100;

    finalPrice = (basePricePerM2 * billingArea * (1 + percentageSurcharge / 100) + flatSurcharge) * colorAddMultiplier;
  } 
  
  // External Blinds formulas (Venkovní žaluzie)
  else if (item.category === 'EXTERNAL') {
    let basePricePerM2 = 1450;
    switch (item.productType) {
      case 'EXT_Z90': basePricePerM2 = 1850; break;
      case 'EXT_S90': basePricePerM2 = 1850; break;
      case 'EXT_C80': basePricePerM2 = 1650; break;
      case 'EXT_F80': basePricePerM2 = 1550; break;
    }

    const billingArea = Math.max(areaM2, 1.0); // min billing for external is 1m2
    let flatSurcharge = 0;

    // Motorized options surcharges
    if (item.controlSide === 'MOTOR_IO') {
      flatSurcharge += 6500; // Somfy IO motor
    } else if (item.controlSide === 'MOTOR_SWITCH') {
      flatSurcharge += 4000; // Switch motor
    } else {
      flatSurcharge += 800; // Manual crank bevel gearbox
    }

    const lamellaCol = LAMELLA_COLORS.find(c => c.code === item.lamellaColor) || LAMELLA_COLORS[0];
    const colorAddMultiplier = 1 + (lamellaCol.surcharge) / 100;

    finalPrice = (basePricePerM2 * billingArea + flatSurcharge) * colorAddMultiplier;
  } 
  
  // Awnings formulas (Markýzy)
  else if (item.category === 'AWNING') {
    let basePrice = 12000;
    let pricePerExtensionM2 = 2500;

    switch (item.productType) {
      case 'AWN_CASABLANCA':
        basePrice = 19500;
        pricePerExtensionM2 = 3200;
        break;
      case 'AWN_DAKOTA':
        basePrice = 24500;
        pricePerExtensionM2 = 3800;
        break;
      case 'AWN_ITALIA':
        basePrice = 9000;
        pricePerExtensionM2 = 1800;
        break;
    }

    let flatSurcharge = 0;

    if (item.controlSide === 'MOTOR_IO') {
      flatSurcharge += 7500; // heavier markýza motor
    } else if (item.controlSide === 'MOTOR_SWITCH') {
      flatSurcharge += 4500;
    }

    if (item.awningWindSensor) {
      flatSurcharge += 2400; // wind shaker sensor
    }

    const lamellaCol = LAMELLA_COLORS.find(c => c.code === item.lamellaColor) || LAMELLA_COLORS[12];
    const colorAddMultiplier = 1 + (lamellaCol.surcharge) / 100;

    finalPrice = (basePrice + (areaM2 * pricePerExtensionM2) + flatSurcharge) * colorAddMultiplier;
  }
  
  // Dřevěné žaluzie (Kat 03)
  else if (item.category === 'WOODEN') {
    let basePricePerM2 = 1450;
    if (item.productType === 'WOOD_50') {
      basePricePerM2 = 1850;
    } else if (item.productType === 'WOOD_35') {
      basePricePerM2 = 1580;
    }
    const billingArea = Math.max(areaM2, 0.5);
    const lamellaCol = LAMELLA_COLORS.find(c => c.code === item.lamellaColor) || LAMELLA_COLORS[0];
    const colorAddMultiplier = 1 + (lamellaCol.surcharge) / 100;
    finalPrice = (basePricePerM2 * billingArea) * colorAddMultiplier;
  }

  // Vertikální stínění (Kat 04)
  else if (item.category === 'VERTICAL') {
    let basePricePerM2 = 380;
    if (item.productType === 'VERT_STOFF_89') {
      basePricePerM2 = 420;
    } else if (item.productType === 'VERT_PVC') {
      basePricePerM2 = 550;
    }
    const billingArea = Math.max(areaM2, 1.0); // standard min area for vertical
    finalPrice = (basePricePerM2 * billingArea);
  }

  // Textilní roletky (Kat 05)
  else if (item.category === 'ROLETKY') {
    let basePricePerM2 = 450; // ROLOLITE
    if (item.productType === 'ROLL_OPTIMA') {
      basePricePerM2 = 680;
    }
    const billingArea = Math.max(areaM2, 0.5);
    finalPrice = (basePricePerM2 * billingArea);
  }

  // Sítě proti hmyzu (Kat 07)
  else if (item.category === 'SCREENS') {
    let basePricePerM2 = 380; // okenní pevná
    if (item.productType === 'SCREEN_DOOR_OPEN') {
      basePricePerM2 = 850;
    } else if (item.productType === 'SCREEN_DOOR_SLIDE') {
      basePricePerM2 = 1200;
    } else if (item.productType === 'SCREEN_DOOR_PLEAT') {
      basePricePerM2 = 1950;
    }
    const billingArea = Math.max(areaM2, 0.8); // min billing area for screens
    finalPrice = (basePricePerM2 * billingArea);
  }

  return Math.round(finalPrice * item.quantity);
}

// Calculate absolute weight in KG for transport estimate
export function calculateItemWeight(item: BlindOrderItem): number {
  const areaM2 = (item.width * item.height) / 1000000;
  let weightPerM2 = 1.6;

  if (item.category === 'EXTERNAL') {
    weightPerM2 = 4.2; // heavy exterior aluminium profile and ladders
  } else if (item.category === 'AWNING') {
    weightPerM2 = 12.0; // heavy folding arms & cassette structure
  } else if (item.category === 'WOODEN') {
    weightPerM2 = 2.8; // real solid wood lamellas
  } else if (item.category === 'VERTICAL') {
    weightPerM2 = 1.2; // vertical carriers & weights
  } else if (item.category === 'ROLETKY') {
    weightPerM2 = 1.0;
  } else if (item.category === 'SCREENS') {
    weightPerM2 = 1.4; // aluminum screen profiles
  } else {
    if (item.productType === 'ISOLINE_PRIM') {
      weightPerM2 = 1.9;
    }
  }

  return Number((areaM2 * weightPerM2 * item.quantity).toFixed(2));
}

// Translate product type to simple human string
export function getProductTypeLabel(type: string): string {
  switch (type) {
    case 'HZ_25_19':
      return 'HZ 25x19 (Klasická meziskelní)';
    case 'HZ_27_19':
      return 'HZ 27x19 (Klasická zesílená)';
    case 'ISOLINE':
      return 'Isoline řetízková (Standard)';
    case 'ISOLINE_LOCO':
      return 'Isoline LOCO (Plochá lišta)';
    case 'ISOLINE_PRIM':
      return 'Isoline PRIM (Obytný prémiový)';
    case 'ISOLINE_ECO':
      return 'Isoline ECO (Tyčka/Brzda)';
    
    // Dřevěné žaluzie (Kat 03)
    case 'WOOD_25':
      return 'Dřevěná horizontal. žaluzie 25 mm';
    case 'WOOD_35':
      return 'Dřevěná horizontal. žaluzie 35 mm';
    case 'WOOD_50':
      return 'Prémiová dřevěná žaluzie 50 mm';
    
    // Vertikální stínění (Kat 04)
    case 'VERT_STOFF_89':
      return 'Vertikální stínění - látka 89 mm';
    case 'VERT_STOFF_127':
      return 'Vertikální stínění - látka 127 mm';
    case 'VERT_PVC':
      return 'Vertikální stínění - PVC lamela 89 mm';
    
    // Textilní roletky (Kat 05)
    case 'ROLL_OPTIMA':
      return 'Textilní roletka Optima v krycí liště';
    case 'ROLL_ROLOLITE':
      return 'Textilní roletka Rololite (volně visící)';
    
    // Sítě proti hmyzu a dveřní stínění (Kat 07)
    case 'SCREEN_FIX_W':
      return 'Pevná okenní síť proti hmyzu ISSO';
    case 'SCREEN_DOOR_OPEN':
      return 'Dveřní síť otvíravá s auto-panty';
    case 'SCREEN_DOOR_SLIDE':
      return 'Dveřní síť posuvná v Alu rámu';
    case 'SCREEN_DOOR_PLEAT':
      return 'Prémiová plisovaná dveřní síť QAPI';

    case 'EXT_Z90':
      return 'Venkovní žaluzie Z-90 (Zpevněná)';
    case 'EXT_S90':
      return 'Venkovní žaluzie S-90 (Pohledná oblá)';
    case 'EXT_C80':
      return 'Venkovní žaluzie C-80 (Tradiční)';
    case 'EXT_F80':
      return 'Venkovní žaluzie F-80 (Minimalistická plochá)';
    case 'AWN_CASABLANCA':
      return 'Luxusní kasetová markýza Casablanca';
    case 'AWN_DAKOTA':
      return 'Prémiová robustní kasetová markýza Dakota';
    case 'AWN_ITALIA':
      return 'Okenní a balkónová markýza Italia';
    default:
      return type;
  }
}
