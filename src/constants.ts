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
          message: 'U řetízku Isoline standard/Loco se zadává standardní ovládání RP (pravé) nebo RL (levé).',
        });
      }

      // Al material restriction for Loco (only standard Isoline and ISOLINE_ECO support Al)
      if (item.profileMaterial === 'Al' && item.productType === 'ISOLINE_LOCO') {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'profileMaterial',
          message: 'Materiál Al (hliníkový) profil je u řady Loco zakázán. Je povolen pouze pro standardní Isoline a Isoline Eco!',
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
          message: `U plochy nad 2.4 m² (${areaM2.toFixed(3)} m²) je pro udělení záruky QAPI vyžadována planetová převodovka s brzdou (PB)!`,
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

      // Al material restriction for Prim
      if (item.profileMaterial === 'Al') {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'profileMaterial',
          message: 'Materiál nosných profilů Al (hliník) je pro model Prim nepovolený. Lze použít výhradně Fe profily!',
        });
      }

      // Limited lengths logic
      if (item.hasGearbox || item.hasBrake) {
        const allowedLengths = ['50', '75', '100', '125', '150', '175', '200', '225'];
        const currentLength = String(item.controlLengthCustom || '').trim();
        if (currentLength && currentLength !== 'standard' && !allowedLengths.includes(currentLength)) {
          alerts.push({
            itemId: item.id,
            type: 'warning',
            field: 'controlLengthCustom',
            message: `U modelu Isoline Prim s převodovkou/brzdou řetízku lze zvolit pouze normalizované délky nekonečného řetízku: 50, 75, 100, 125, 150, 175, 200, 225 cm. Zadáno: ${currentLength}.`,
          });
        }
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

      if (!['P', 'L'].includes(item.controlSide as string) && !['M', 'MF', 'IF', 'IRB', 'IRBF', 'IB', 'IBF', 'IBS'].includes(item.controlSide as string)) {
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

      // HZ allowable controls check
      const allowedHzControls = ['M', 'MF', 'IF', 'IRB', 'IRBF', 'IB', 'IBF', 'IBS', 'P', 'L'];
      if (!allowedHzControls.includes(item.controlSide as string)) {
        alerts.push({
          itemId: item.id,
          type: 'warning',
          field: 'controlSide',
          message: `Pro HZ 25/27x19 jsou povolené varianty ovládání: M (meziskelní), MF (meziskelní s fixací), IF (boční vývod s fixací), IRB/IRBF (čelní vývod s brzdou s/bez fixace), IB/IBF (interiérová s brzdou a šnekem s/bez fixace) nebo IBS (se střešní fixací).`,
        });
      }

      // Slant restriction is strictly profile 27x19 (strana 3 - FIXACE ŠIKMINA pouze profil 27x19)
      if (item.isSlant && item.productType === 'HZ_25_19') {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'isSlant',
          message: 'Atypická šikmá provedení (šikminy) se provádějí výhradně na silném HZ profilu 27x19 mm!',
        });
      }
      break;
    }

    // Plisé žaluzie checks (DARNI, LAGARTA)
    case 'PLISSE_DARNI':
    case 'PLISSE_LAGARTA': {
      const isLagarta = item.productType === 'PLISSE_LAGARTA';
      const label = isLagarta ? 'Plisé LAGARTA' : 'Plisé DARNI';
      
      if (item.width < 300) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: `${label} vyžaduje minimální šířku 300 mm. Zadáno: ${item.width} mm.`,
        });
      }
      
      const maxW = isLagarta ? 1500 : 1800;
      if (item.width > maxW) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: `${label} umožňuje maximální šířku ${maxW} mm. Zadáno: ${item.width} mm.`,
        });
      }

      if (item.height < 300) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: `${label} vyžaduje minimální výšku 300 mm. Zadáno: ${item.height} mm.`,
        });
      }

      if (item.height > 2605) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: `${label} umožňuje maximální výšku 2600 mm. Zadáno: ${item.height} mm.`,
        });
      }

      // Check for dual fabrics if model is double fabric (DARNI DB 11, DB 21 etc. or other double fabric models)
      const plModel = item.plisseModel || '';
      const isDualFabric = plModel.startsWith('DB') || plModel === 'PM3M'; // DB or PM3M have special double fabric potential
      if (isDualFabric && !item.secondFabric) {
        alerts.push({
          itemId: item.id,
          type: 'warning',
          field: 'secondFabric',
          message: `Model ${plModel} je systém pro dvě látky (horní / dolní). Doporučujeme vyplnit položku "Druhá látka (dolní)".`,
        });
      }
      
      // Control options check
      if (isLagarta && plModel.startsWith('PP') && !item.childSafety) {
        alerts.push({
          itemId: item.id,
          type: 'info',
          field: 'childSafety',
          message: `Unijní nařízení pro typy PP u Lagarty doporučuje aktivovat "Dětskou pojistku".`,
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
    case 'ROLL_STREAM_S': {
      if (item.width < 300 || item.width > 1500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Stream-S střešní roletka: šířka musí být v rozmezí 300 - 1500 mm.',
        });
      }
      if (item.height < 300 || item.height > 1600) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Stream-S střešní roletka: výška musí být v rozmezí 300 - 1600 mm.',
        });
      }
      break;
    }

    case 'ROLL_STREAM_PLUS': {
      if (item.width < 300 || item.width > 2400) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Stream Plus: Šířka musí být v rozmezí 300 - 2400 mm.',
        });
      }
      if (item.height < 300 || item.height > 2500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Stream Plus: Výška musí být v rozmezí 300 - 2500 mm.',
        });
      }
      // "Maximální rozměry: šířka a výška nesmí současně překročit 1950 mm. Pokud šířka přesáhne 1950 mm, maximální výška je 1850 mm."
      if (item.width > 1950 && item.height > 1850) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'dimensions',
          message: 'STREAM PLUS limit: Šířka a výška nesmí současně překročit 1950 mm. Pokud šířka přesáhne 1950 mm, max výška je 1850 mm!',
        });
      }
      break;
    }

    case 'ROLL_SONATA': {
      if (item.width < 300 || item.width > 2400) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Sonata: Šířka musí být v rozmezí 300 - 2400 mm.',
        });
      }
      if (item.height < 300 || item.height > 2500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Sonata: Výška musí být v rozmezí 300 - 2500 mm.',
        });
      }
      
      const submodel = item.submodelType || 'Sonata';
      // "Sonata, Sonata XL - Maximální rozměry: šířka a výška nesmí současně překročit 1950 mm. Pokud šířka přesáhne 1950 mm, maximální výška je 1850 mm."
      if (item.width > 1950 && item.height > 1850) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'dimensions',
          message: 'Sonata limit: Šířka a výška nesmí současně překročit 1950 mm. Pokud šířka přesáhne 1950 mm, max výška je 1850 mm!',
        });
      }

      // Motorized option is only for Sonata XL & Sonata XL D/N
      const isMotor = item.controlMethod && item.controlMethod !== 'Ř - řetízek';
      const isXL = submodel.includes('XL');
      if (isMotor && !isXL) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'controlMethod',
          message: 'Motorické ovládání je povoleno výhradně pro řady Sonata XL a Sonata XL Den/Noc!',
        });
      }

      // Guide rails wall mounting check
      if (item.guideRailsOption && item.mountingType && item.mountingType.toLowerCase().includes('strop')) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'mountingType',
          message: 'V případě použití vodicích lišt u roletky Sonata je možná pouze montáž na stěnu!',
        });
      }
      break;
    }

    case 'ROLL_OPUS_OPTIMA_COLLETE': {
      const subType = item.submodelType || 'OPTIMA';
      if (item.width < 300 || item.width > 2400) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: `${subType}: Šířka musí být v rozmezí 300 - 2400 mm.`,
        });
      }
      if (item.height < 300 || item.height > 2500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: `${subType}: Výška musí být v rozmezí 300 - 2500 mm.`,
        });
      }

      // "Opus, Opus motorová, Optima - Maximální rozměry: šířka a výška nesmí současně překročit 1950 mm. Pokud šířka přesáhne 1950 mm, maximální výška je 1850 mm."
      const isOpusOrOptima = subType.toUpperCase().includes('OPUS') || subType.toUpperCase().includes('OPTIMA');
      if (isOpusOrOptima && item.width > 1950 && item.height > 1850) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'dimensions',
          message: `${subType} limit: Šířka a výška nesmí současně překročit 1950 mm v jednom okamžiku. Pokud šířka > 1950 mm, max výška je 1850 mm.`,
        });
      }
      break;
    }

    case 'ROLL_LEGEND': {
      if (item.width < 300 || item.width > 1500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Legend střešní roletka: šířka musí být v rozmezí 300 - 1500 mm.',
        });
      }
      if (item.height < 300 || item.height > 1800) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Legend střešní roletka: výška musí být v rozmezí 300 - 1800 mm.',
        });
      }
      break;
    }

    case 'ROLL_JAZZ': {
      const subType = item.submodelType || 'JAZZ 17';
      if (item.width < 300 || item.width > 2400) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: `${subType}: Šířka musí být v rozmezí 300 - 2400 mm.`,
        });
      }
      if (item.height < 300 || item.height > 2500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: `${subType}: Výška musí být v rozmezí 300 - 2500 mm.`,
        });
      }

      // "Jazz Expert, Jazz 32, Jazz 38 Motorová - Maximální rozměry: šířka a výška nesmí současně překročit 1950 mm. Pokud šířka přesáhne 1950 mm, maximální výška je 1850 mm."
      const isRestrictedJazz = subType.includes('Expert') || subType.includes('32') || subType.includes('38');
      if (isRestrictedJazz && item.width > 1950 && item.height > 1850) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'dimensions',
          message: `${subType} limit: Šířka a výška nesmí současně překročit 1950 mm. Pokud šířka přesáhne 1950 mm, max výška je 1850 mm!`,
        });
      }

      // Mounting profile cannot be used for JAZZ 45
      if (subType === 'JAZZ 45' && item.profileType && item.profileType !== 'ne') {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'profileType',
          message: 'Montážní profil nelze použít u typu JAZZ 45!',
        });
      }

      // Plastový úchyt (3 or 4) only valid for JAZZ 17 or JAZZ 17 Den / Noc
      const isPlast = item.mountingType === '3 - plastový úchyt' || item.mountingType === '4 - plastový úchyt + fixace';
      const isJazz17 = subType.includes('JAZZ 17');
      if (isPlast && !isJazz17) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'mountingType',
          message: 'Plastový bezvrtný úchyt (s/bez fixace) lze zvolit pouze u produktové řady JAZZ 17!',
        });
      }
      break;
    }

    // Sítě proti hmyzu - Okenní pevné (Kat 07)
    case 'SCREEN_FIX_W': {
      alerts.push({
        itemId: item.id,
        type: 'info',
        field: 'tolerance',
        message: 'Výrobní tolerance u okenních sítí je -3 mm.',
      });

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

      // "Síťovina s nanovláknem pouze pro profily LUX."
      if (item.meshColor === 'N - s nanovláknem černá') {
        const isLux = item.profileType && (item.profileType.includes('LUX') || item.profileType.includes('34x9') || item.profileType.includes('32x11'));
        if (!isLux) {
          alerts.push({
            itemId: item.id,
            type: 'error',
            field: 'meshColor',
            message: 'Síťovina s nanovláknem je povolena výhradně pro profily LUX (např. OE 32x11 LUX, ISSO OE 34x9 LUX).',
          });
        }
      }

      // "Protipylová síťovina a pet screen pouze do extrud. profilů."
      if (item.meshColor && (item.meshColor.includes('protipylová') || item.meshColor.includes('pet screen'))) {
        const isExtruded = item.profileType && !item.profileType.includes('ISSO OV');
        if (!isExtruded) {
          alerts.push({
            itemId: item.id,
            type: 'warning',
            field: 'meshColor',
            message: 'Protipylová síťovina a pet screen jsou doporučeny výhradně do extrudovaných profilů (ne ISSO).',
          });
        }
      }

      // "Z - Z držák" list checking for holders
      if (item.holderType === 'Z - Z držák' && item.profileType && item.holderHeight) {
        if (item.profileType.includes('19x8')) {
          const allowed = ['10', '12', '14', '15', '17', '20'];
          if (!allowed.includes(String(item.holderHeight))) {
            alerts.push({
              itemId: item.id,
              type: 'warning',
              field: 'holderHeight',
              message: `Pro profil 19x8 jsou povolené výšky Z držáku: ${allowed.join(', ')} mm.`,
            });
          }
        } else if (item.profileType.includes('32x11')) {
          const allowed = ['8', '10', '12', '14', '16', '18', '20', '22', '24', '30'];
          if (!allowed.includes(String(item.holderHeight))) {
            alerts.push({
              itemId: item.id,
              type: 'warning',
              field: 'holderHeight',
              message: `Pro profil OE 32x11 LUX jsou povolené výšky Z držáku: ${allowed.join(', ')} mm.`,
            });
          }
        }
      }

      // "Při použití pružinového kolíku, nebo obrtlíku nutno vrtat do rámu okna."
      if (item.holderType === 'P - pružinový kolík' || item.holderType === 'O - obrtlík') {
        alerts.push({
          itemId: item.id,
          type: 'info',
          field: 'holderType',
          message: 'Při použití pružinového kolíku nebo obrtlíku je nutné vrtat do rámu okna.',
        });
      }
      break;
    }

    // Dveřní pevné sítě s panty (Kat 07)
    case 'SCREEN_DOOR_OPEN': {
      alerts.push({
        itemId: item.id,
        type: 'info',
        field: 'tolerance',
        message: 'Výrobní tolerance u dveřních sítí je -3 mm.',
      });

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

      // Panty: standard + samozavírací total count recommend min. 3
      const stdPants = item.pantsCountStandard || 0;
      const selfPants = item.pantsCountSelfClose || 0;
      if (stdPants + selfPants < 3) {
        alerts.push({
          itemId: item.id,
          type: 'warning',
          field: 'pantsCountStandard',
          message: 'Doporučujeme, aby celkový počet pantů (standard + samozavírací) byl minimálně 3 ks.',
        });
      }

      // "Protipylová síťovina nelze u profilu DV 50x20."
      if (item.profileType === '1 - DV 50x20' && item.meshColor === 'P - protipylová černá') {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'meshColor',
          message: 'Protipylová síťovina nelze použít u profilu DV 50x20.',
        });
      }

      // "Síťovina s nanovláknem nelze u DV50x20 a DE50x20."
      if ((item.profileType === '1 - DV 50x20' || item.profileType === '2 - DE 50x20') && item.meshColor === 'N - s nanovláknem černá') {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'meshColor',
          message: 'Síťovina s nanovláknem nelze použít u profilů DV 50x20 a DE 50x20.',
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

    // Plisé sítě proti hmyzu (Kat 07)
    case 'SCREEN_DOOR_PLEAT': {
      alerts.push({
        itemId: item.id,
        type: 'info',
        field: 'tolerance',
        message: 'Výrobní tolerance plisé sítí je -2 mm.',
      });

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

      // "Stellar - šířka musí být o 200 mm menší, než výška."
      const isStellarType = item.screenType && (item.screenType === 'a - Stellar' || item.screenType === 'b - Stellar opona' || item.screenType.includes('Stellar'));
      if (isStellarType) {
        if (item.width >= item.height - 200) {
          alerts.push({
            itemId: item.id,
            type: 'error',
            field: 'dimensions',
            message: 'U sítě Stellar musí být šířka o minimálně 200 mm menší než výška!',
          });
        }
      }

      // "Stellar Lux / Stellar Lux opona - pokud je výška sítě menší než 2x šířka + 140 mm, je vždy pevný profil široký..."
      const isStellarLux = item.screenType && (item.screenType === 'c - Stellar Lux' || item.screenType === 'd - Stellar Lux opona');
      if (isStellarLux) {
        const thresholdLimit = 2 * item.width + 140;
        if (item.height < thresholdLimit) {
          alerts.push({
            itemId: item.id,
            type: 'info',
            field: 'screenType',
            message: 'Výška je menší než (2x šířka + 140 mm) -> bude automaticky dodán široký pevný profil.',
          });
        } else {
          alerts.push({
            itemId: item.id,
            type: 'info',
            field: 'screenType',
            message: 'Výška je větší nebo rovna (2x šířka + 140 mm) -> bude automaticky dodán úzký pevný profil.',
          });
        }
      }
      break;
    }

    // Posuvné sítě v lištách (Kat 07)
    case 'SCREEN_SLIDE_TRACKS': {
      if (item.width < 400 || item.width > 2000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Posuvná síť v lištách vyžaduje šířku od 400 mm do 2000 mm.',
        });
      }
      if (item.height < 500 || item.height > 2500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Posuvná síť v lištách vyžaduje výšku od 500 mm do 2500 mm.',
        });
      }
      alerts.push({
        itemId: item.id,
        type: 'info',
        field: 'tolerance',
        message: 'Délka pojezdových lišt je standardně dvojnásobek šířky křídla + 20 mm.',
      });
      break;
    }

    // Posuvné sítě v rámu (Kat 07)
    case 'SCREEN_SLIDE_FRAME': {
      if (item.width < 500 || item.width > 3000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Posuvná síť v rámu vyžaduje celkovou šířku od 500 mm do 3000 mm.',
        });
      }
      if (item.height < 500 || item.height > 2500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Posuvná síť v rámu vyžaduje výšku od 500 mm do 2500 mm.',
        });
      }
      if ((item.profileType === 'PSR1' || item.profileType === 'PSR1 ECO') && item.threshold === 'ostění') {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'threshold',
          message: 'Profil PSR1 a PSR1 ECO lze montovat pouze na rám okna, nikoliv do ostění.',
        });
      }
      break;
    }

    // Pevné sítě šikminy (Kat 07)
    case 'SCREEN_SLANT': {
      alerts.push({
        itemId: item.id,
        type: 'info',
        field: 'tolerance',
        message: 'Výrobní tolerance u atypických šikmých sítí je -3 mm.',
      });
      if (item.width < 200 || item.width > 1800) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Šikmá pevná síť vyžaduje šířku od 200 mm do 1800 mm.',
        });
      }
      if (item.height < 200 || item.height > 2200) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Šikmá pevná síť vyžaduje výšku od 200 mm do 2200 mm.',
        });
      }
      if (item.meshColor === 'N - s nanovláknem černá') {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'meshColor',
          message: 'Síťovina s nanovláknem není dostupná pro šikmé atypické sítě.',
        });
      }
      if (item.meshColor && (item.meshColor.includes('protipylová') || item.meshColor.includes('pet screen')) && item.profileType !== 'ISSO OE 19x8') {
        alerts.push({
          itemId: item.id,
          type: 'warning',
          field: 'meshColor',
          message: 'Protipylová síťovina a pet screen jsou u šikmin povoleny pouze pro profil ISSO OE 19x8.',
        });
      }
      break;
    }

    // Rolovací sítě okenní VERSA
    case 'SCREEN_ROLLER_VERSA': {
      alerts.push({
        itemId: item.id,
        type: 'info',
        field: 'tolerance',
        message: 'Pro správnou funkčnost sítě je nutné dodržení pravých úhlů.',
      });
      if (item.screenColor && (item.screenColor.includes('RAL') || item.screenColor.includes('nástřik'))) {
        alerts.push({
          itemId: item.id,
          type: 'info',
          field: 'screenColor',
          message: 'Při lakování do odstínu RAL se automaticky přiřazují černé komponenty.',
        });
      }
      if (item.width < 400 || item.width > 2000) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Rolovací okenní sítě VERSA vyžadují šířku od 400 mm do 2000 mm.',
        });
      }
      if (item.height < 400 || item.height > 2500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Rolovací okenní sítě VERSA vyžadují výšku od 400 mm do 2500 mm.',
        });
      }
      break;
    }

    // Rolovací sítě dveřní DAROS
    case 'SCREEN_ROLLER_DAROS': {
      alerts.push({
        itemId: item.id,
        type: 'info',
        field: 'tolerance',
        message: 'Pro správnou funkčnost sítě je nutné dodržení pravých úhlů.',
      });
      if (item.screenColor && (item.screenColor.includes('RAL') || item.screenColor.includes('nástřik'))) {
        alerts.push({
          itemId: item.id,
          type: 'info',
          field: 'screenColor',
          message: 'Při lakování do odstínu RAL se automaticky přiřazují černé komponenty.',
        });
      }
      if (item.width < 500 || item.width > 1600) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'width',
          message: 'Rolovací dveřní sítě DAROS vyžadují šířku od 500 mm do 1600 mm.',
        });
      }
      if (item.height < 1000 || item.height > 2500) {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'height',
          message: 'Rolovací dveřní sítě DAROS vyžadují výšku od 1000 mm do 2500 mm.',
        });
      }
      break;
    }

    // Tara Premio I
    case 'EXT_TARA_PREMIO_I': {
      if (item.fabricType?.includes('SCREEN F12')) {
        // SCREEN F12 is allowed
      }
      if (item.capColor) {
        alerts.push({
          itemId: item.id,
          type: 'warning',
          field: 'capColor',
          message: 'Barvu koncovek vodicí a koncové lišty lze vybrat pouze u Tara Premio II (box 90, 105, 120, 120H).',
        });
      }
      break;
    }

    // Tara Premio II
    case 'EXT_TARA_PREMIO_II': {
      if (item.fabricType === 'SCREEN F12 (pouze Tara Premio I)') {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'fabricType',
          message: 'Látka SCREEN F12 je povolena pouze u modelů Tara Premio I.',
        });
      }
      break;
    }

    // Ghibli I a Union-L
    case 'EXT_GHIBLI_UNION': {
      const isGhibli = item.boxType?.includes('Ghibli I') || item.boxType === '2- Ghibli I (pouze s motory bez NHK)';
      const isUnion = item.boxType?.includes('Union - L') || item.boxType === '1- Union - L';

      if (isUnion) {
        if (item.width > 4000 || item.height > 3000) {
          alerts.push({
            itemId: item.id,
            type: 'error',
            field: 'dimensions',
            message: 'Rozměrový limit pro Union-L je 4000 mm šířka x 3000 mm výška.',
          });
        }
      }

      if (isGhibli) {
        if (item.width > 4000 || item.height > 2500) {
          alerts.push({
            itemId: item.id,
            type: 'error',
            field: 'dimensions',
            message: 'Rozměrový limit pro Ghibli I je 4000 mm šířka x 2500 mm výška.',
          });
        }
        if (item.controlMethod === '1 - ruční') {
          alerts.push({
            itemId: item.id,
            type: 'error',
            field: 'controlMethod',
            message: 'Screenová roleta Ghibli I se dodává výhradně v motorovém provedení.',
          });
        }
        if (item.electronicsReceiver?.includes('NHK') || item.notes?.toLowerCase().includes('nhk')) {
          alerts.push({
            itemId: item.id,
            type: 'error',
            field: 'electronicsReceiver',
            message: 'Ghibli I se dodává pouze s motory bez nouzové převodovky (bez NHK).',
          });
        }
      }
      alerts.push({
        itemId: item.id,
        type: 'info',
        field: 'fabricOrientation',
        message: 'Pokud není určeno, považuje se za pohledovou strana B.',
      });
      break;
    }

    // Výklopné markýzy UNION / K / B
    case 'AWN_UNION_DROP': {
      const isUnionB = item.boxType?.includes('UNION-B') || item.boxType === 'UNION-B';
      if (isUnionB && item.controlMethod === 'MOTORICKÉ') {
        alerts.push({
          itemId: item.id,
          type: 'error',
          field: 'controlMethod',
          message: 'Výklopná markýza UNION-B je určena výhradně pro manuální ovládání klikou.',
        });
      }
      if (item.width > 5000) {
        alerts.push({
          itemId: item.id,
          type: 'warning',
          field: 'width',
          message: 'U výklopných markýz šířky nad 5000 mm doporučujeme konzultovat pevnost kotvení.',
        });
      }
      break;
    }

    // Venkovní rolety Radix / Covert / Combi
    case 'EXT_ROLO_VENKOVNI': {
      const isCombi = item.boxType?.includes('Combi') || item.boxType === '5 - Combi';
      if (isCombi && item.guideType && !['F8 PVC', 'F10 AL', 'F10 PVC', 'F10 AL oboustranná', 'F10 AL (52)'].includes(item.guideType)) {
        alerts.push({
          itemId: item.id,
          type: 'warning',
          field: 'guideType',
          message: 'Pro typ rolety Combi jsou určeny specifické vodicí lišty (F8 / F10).',
        });
      }
      if (item.integratedMesh) {
        alerts.push({
          itemId: item.id,
          type: 'info',
          field: 'integratedMesh',
          message: 'Integrovanou síť proti hmyzu lze integrovat do boxu rolety, max. výška sítě je omezena kapacitou boxu.',
        });
      }
      break;
    }

    // Rolety do překladu HELUZ
    case 'EXT_ROLO_HELUZ': {
      alerts.push({
        itemId: item.id,
        type: 'info',
        field: 'notes',
        message: 'U spojených sestav rolet se uvádí pozice vždy zleva od ostění při pohledu z interiéru.',
      });
      alerts.push({
        itemId: item.id,
        type: 'info',
        field: 'boxColor',
        message: 'U rolet do překladu HELUZ nutno specifikovat barvu samonavíječe a komponentů.',
      });
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
  
  // External Blinds formulas (Venkovní žaluzie a rolety)
  else if (item.category === 'EXTERNAL') {
    let basePricePerM2 = 1450;
    switch (item.productType) {
      case 'EXT_Z90': basePricePerM2 = 1850; break;
      case 'EXT_S90': basePricePerM2 = 1850; break;
      case 'EXT_C80': basePricePerM2 = 1650; break;
      case 'EXT_F80': basePricePerM2 = 1550; break;
      // Nové vnější produkty
      case 'EXT_TARA_PREMIO_I': basePricePerM2 = 2300; break;
      case 'EXT_TARA_PREMIO_II': basePricePerM2 = 2450; break;
      case 'EXT_GHIBLI_UNION': basePricePerM2 = 1950; break;
      case 'EXT_ROLO_VENKOVNI': basePricePerM2 = 1850; break;
      case 'EXT_ROLO_HELUZ': basePricePerM2 = 2200; break;
    }

    const billingArea = Math.max(areaM2, 1.0); // min billing for external is 1m2
    let flatSurcharge = 0;

    // Motorized options surcharges (podporuje i nové screeny se stylem ovládání z interiéru)
    const isMotor = item.controlSide === 'MOTOR_IO' || 
                    item.controlSide === 'MOTOR_SWITCH' || 
                    item.controlMethod === '2 - motorové' || 
                    (item.electronicsReceiver && item.electronicsReceiver !== '1 - ruční' && !item.electronicsReceiver.includes('ruční'));

    if (isMotor) {
      if (item.controlSide === 'MOTOR_IO') {
        flatSurcharge += 6500; // Somfy IO motor
      } else {
        flatSurcharge += 4000; // Standardní motor
      }
    } else {
      flatSurcharge += 800; // Manuální ovládání / klika / šňůra / pásek
    }

    // Integrovaná síť surcharge
    if (item.integratedMesh) {
      flatSurcharge += 1500;
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
      case 'AWN_UNION_DROP':
        basePrice = 8500;
        pricePerExtensionM2 = 1600;
        break;
    }

    let flatSurcharge = 0;

    const isMotor = item.controlSide === 'MOTOR_IO' || 
                    item.controlSide === 'MOTOR_SWITCH' || 
                    item.controlMethod === 'MOTORICKÉ';

    if (isMotor) {
      if (item.controlSide === 'MOTOR_IO') {
        flatSurcharge += 7500; // heavier markýza motor io
      } else {
        flatSurcharge += 4500; // mechanical motor
      }
    }

    if (item.awningWindSensor) {
      flatSurcharge += 2400; // wind shaker sensor
    }

    if (item.awningHood) {
      flatSurcharge += 1800; // Al-extrudovaná stříška
    }

    if (item.bracketExtra && item.bracketExtra > 0) {
      flatSurcharge += item.bracketExtra * 650; // Konzola navíc
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
    let basePricePerM2 = 540; // Default (JAZZ)
    if (item.productType === 'ROLL_STREAM_S') {
      basePricePerM2 = 590;
    } else if (item.productType === 'ROLL_STREAM_PLUS') {
      basePricePerM2 = 620;
    } else if (item.productType === 'ROLL_SONATA') {
      basePricePerM2 = 720;
    } else if (item.productType === 'ROLL_OPUS_OPTIMA_COLLETE') {
      basePricePerM2 = 820;
    } else if (item.productType === 'ROLL_LEGEND') {
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
    } else if (item.productType === 'SCREEN_SLIDE_TRACKS') {
      basePricePerM2 = 1400;
    } else if (item.productType === 'SCREEN_SLIDE_FRAME') {
      basePricePerM2 = 1600;
    } else if (item.productType === 'SCREEN_SLANT') {
      basePricePerM2 = 1100;
    } else if (item.productType === 'SCREEN_ROLLER_VERSA') {
      basePricePerM2 = 1350;
    } else if (item.productType === 'SCREEN_ROLLER_DAROS') {
      basePricePerM2 = 1750;
    }
    const billingArea = Math.max(areaM2, 0.8); // min billing area for screens
    finalPrice = (basePricePerM2 * billingArea);
  }

  // Plisé žaluzie
  else if (item.category === 'PLISSE') {
    let basePricePerM2 = 1250; // DARNI Komfort
    if (item.productType === 'PLISSE_LAGARTA') {
      basePricePerM2 = 1155; // LAGARTA Slim
    }
    const billingArea = Math.max(areaM2, 0.5);
    let flatSurcharge = 0;
    if (item.secondFabric) {
      flatSurcharge += 450; // Dvojitá látka (horní + dolní)
    }
    if (item.childSafety) {
      flatSurcharge += 95; // Bezpečnostní úchyt / dětská pojistka
    }
    if (item.extensionRod && item.extensionRod !== 'NONE' && item.extensionRod !== '') {
      flatSurcharge += 190; // Prodlužovací tyč
    }
    finalPrice = (basePricePerM2 * billingArea) + flatSurcharge;
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
  } else if (item.category === 'PLISSE') {
    weightPerM2 = 1.1; // light tension cords and profile bars
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
    case 'ROLL_STREAM_S':
      return 'Skleněná střešní roletka STREAM-S';
    case 'ROLL_STREAM_PLUS':
      return 'Textilní roletka STREAM PLUS (šňůrová)';
    case 'ROLL_SONATA':
      return 'Textilní roletka SONATA / XL';
    case 'ROLL_OPUS_OPTIMA_COLLETE':
      return 'Textilní roletka OPUS / OPTIMA / COLLETE';
    case 'ROLL_LEGEND':
      return 'Střešní roletka LEGEND';
    case 'ROLL_JAZZ':
      return 'Textilní roletka JAZZ';
    
    // Plisé žaluzie
    case 'PLISSE_DARNI':
      return 'Plisé DARNI';
    case 'PLISSE_LAGARTA':
      return 'Plisé LAGARTA';
    
    // Sítě proti hmyzu a dveřní stínění (Kat 07)
    case 'SCREEN_FIX_W':
      return 'Pevná okenní síť proti hmyzu';
    case 'SCREEN_DOOR_OPEN':
      return 'Pevná dveřní síť proti hmyzu';
    case 'SCREEN_DOOR_SLIDE':
      return 'Posuvná dveřní síť v rámu';
    case 'SCREEN_SLIDE_TRACKS':
      return 'Posuvná dveřní síť v lištách';
    case 'SCREEN_SLIDE_FRAME':
      return 'Posuvná dveřní síť v rámu';
    case 'SCREEN_SLANT':
      return 'Pevná síť proti hmyzu - šikmina';
    case 'SCREEN_DOOR_PLEAT':
      return 'Prémiová plisovaná dveřní síť QAPI';
    case 'SCREEN_ROLLER_VERSA':
      return 'Rolovací okenní síť VERSA';
    case 'SCREEN_ROLLER_DAROS':
      return 'Rolovací dveřní síť DAROS';

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
    // Nové typy
    case 'EXT_TARA_PREMIO_I':
      return 'Screenová roleta TARA PREMIO I';
    case 'EXT_TARA_PREMIO_II':
      return 'Screenová roleta TARA PREMIO II';
    case 'EXT_GHIBLI_UNION':
      return 'Screenová roleta GHIBLI I / UNION-L';
    case 'AWN_UNION_DROP':
      return 'Výklopná markýza UNION / K / B';
    case 'EXT_ROLO_VENKOVNI':
      return 'Venkovní roleta RADIX / COVERT / COMBI';
    case 'EXT_ROLO_HELUZ':
      return 'Venkovní roleta do překladu HELUZ';
    default:
      return type;
  }
}
