import * as XLSX from 'xlsx';
import { BlindOrderItem, ProductCategory, ProductType } from '../types';

// Helper to generate unique IDs
const generateId = () => 'item_xls_' + Math.random().toString(36).substring(2, 9);

/**
 * Clean up text values for parsing
 */
function cleanVal(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

/**
 * Check if string suggests affirmative
 */
function isYes(val: any): boolean {
  const s = cleanVal(val).toUpperCase();
  return s === 'ANO' || s === 'A' || s === 'YES' || s === 'Y' || s === 'TRUE' || s === '1';
}

/**
 * Extract numeric value from any cell representation
 */
function parseNum(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse an Excel file template into an array of BlindOrderItems
 */
export async function parseXlsOrderFile(file: File): Promise<{
  category: ProductCategory;
  items: BlindOrderItem[];
  fileName: string;
  orderInfo?: {
    customerName?: string;
    orderNumber?: string;
    notes?: string;
  };
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Nelze přečíst data ze souboru.');
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to 2D array matrix to inspect row by row
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Let's identify the category and template type
        let category: ProductCategory = 'HORIZONTAL';
        let fileTitle = '';

        // Safely inspect top rows for identifying titles
        for (let rIdx = 0; rIdx < Math.min(10, rows.length); rIdx++) {
          const row = rows[rIdx];
          if (!row) continue;
          for (let cIdx = 0; cIdx < row.length; cIdx++) {
            const cellVal = cleanVal(row[cIdx]).toUpperCase();
            if (cellVal.includes('HORIZONTÁLNÍ ŽALUZIE')) {
              category = 'HORIZONTAL';
              fileTitle = 'Horizontální žaluzie';
            } else if (cellVal.includes('PLISE') || cellVal.includes('PLISÉ')) {
              category = 'HORIZONTAL'; // Treated under horizontal or custom plise
              fileTitle = 'Plisé žaluzie';
            } else if (cellVal.includes('DŘEVĚNÉ ŽALUZIE') || cellVal.includes('DREVENE')) {
              category = 'WOODEN';
              fileTitle = 'Dřevěné žaluzie';
            } else if (cellVal.includes('VERTIKÁLNÍ ŽALUZIE') || cellVal.includes('VERTICAL')) {
              category = 'VERTICAL';
              fileTitle = 'Vertikální stínění';
            } else if (cellVal.includes('LÁTKOVÉ ROLETKY') || cellVal.includes('ROLETA') || cellVal.includes('TEXTILNÍ ROLETKY')) {
              category = 'ROLETKY';
              fileTitle = 'Textilní roletky';
            } else if (cellVal.includes('SÍŤ PROTI HMYZU') || cellVal.includes('SITE PROTI HMYZU')) {
              category = 'SCREENS';
              fileTitle = 'Sítě proti hmyzu';
            } else if (cellVal.includes('VENKOVNÍ ŽALUZIE') || cellVal.includes('VENKOVNI ZALUZIE')) {
              category = 'EXTERNAL';
              fileTitle = 'Venkovní žaluzie';
            } else if (cellVal.includes('MARKÝZY') || cellVal.includes('MARKYZY') || cellVal.includes('AWNING')) {
              category = 'AWNING';
              fileTitle = 'Markýzy';
            }
          }
        }

        // Try to locate the customer or metadata
        let customerName = '';
        let orderNumber = '';
        let notes = '';

        for (let rIdx = 0; rIdx < Math.min(15, rows.length); rIdx++) {
          const row = rows[rIdx];
          if (!row) continue;
          row.forEach((cell, cIdx) => {
            const cv = cleanVal(cell).toLowerCase();
            if (cv.includes('odběratel:') || cv.includes('odberatel:')) {
              customerName = cleanVal(row[cIdx + 1] || row[cIdx + 2]);
            }
            if (cv.includes('označení objednávky:') || cv.includes('oznaceni objednavky:') || cv.includes('číslo zakázky:') || cv.includes('cislo zakazky:')) {
              orderNumber = cleanVal(row[cIdx + 1] || row[cIdx + 2]);
            }
          });
        }

        // In QAPI order forms, headers start at Row 7 (index 6) or search for "pozice"
        let headerRowIdx = -1;
        let pWidthIdx = -1;
        let pHeightIdx = -1;
        let pQuantityIdx = -1;

        // Find the index of key coordinates "šířka", "výška", "ks", "pozice"
        for (let rIdx = 0; rIdx < Math.min(30, rows.length); rIdx++) {
          const row = rows[rIdx];
          if (!row) continue;
          const isHeaderCandidate = row.some(cell => {
            const val = cleanVal(cell).toLowerCase();
            return val === 'pozice' || val.includes('rozměry') || val === 'ks' || val === 'šířka' || val === 'výška';
          });

          if (isHeaderCandidate) {
            headerRowIdx = rIdx;
            // Let's sweep the columns to locate fields
            row.forEach((cell, cIdx) => {
              const val = cleanVal(cell).toLowerCase();
              if (val.includes('pozice')) {
                // Pozice indicator
              }
            });
            break;
          }
        }

        // If headers weren't found, default to Row 7 (index 6)
        if (headerRowIdx === -1) {
          headerRowIdx = 6;
        }

        const headers = rows[headerRowIdx] || [];
        const subHeaders = rows[headerRowIdx + 1] || [];
        const helperHeaders = rows[headerRowIdx + 2] || [];

        // Build mapping of columns
        const colMap: { [fieldName: string]: number } = {};

        headers.forEach((cell, cIdx) => {
          const hVal = cleanVal(cell).toLowerCase();
          const subVal = subHeaders[cIdx] ? cleanVal(subHeaders[cIdx]).toLowerCase() : '';
          const helpVal = helperHeaders[cIdx] ? cleanVal(helperHeaders[cIdx]).toLowerCase() : '';

          if (hVal.includes('pozice')) {
            colMap['pozice'] = cIdx;
          } else if (hVal.includes('rozměr') || hVal.includes('rozmer') || hVal === 'šířka' || hVal === 'šírka' || hVal === 'sirka') {
            colMap['width'] = cIdx;
          } else if (hVal.includes('výška') || hVal === 'vyska') {
            colMap['height'] = cIdx;
          } else if (hVal === 'ks' || hVal.includes('kusů') || hVal.includes('kusu')) {
            colMap['quantity'] = cIdx;
          } else if (hVal.includes('ovládání') || hVal === 'ovladani') {
            colMap['control'] = cIdx;
          } else if (hVal.includes('profil') || hVal.includes('materiál profilu') || hVal.includes('material profilu') || hVal.includes('typ profilu')) {
            colMap['profile_material'] = cIdx;
          } else if (hVal.includes('typ žaluzie') || hVal.includes('typ zaluzie') || hVal.includes('typ stínění') || hVal.includes('typ stineni') || hVal === 'typ') {
            colMap['product_type'] = cIdx;
          } else if (hVal.includes('barva profilu')) {
            colMap['profile_color'] = cIdx;
          } else if (hVal.includes('krycí lišta') || hVal.includes('kryci lista') || hVal.includes('barva krycí lišty')) {
            colMap['loco_color'] = cIdx;
          } else if (hVal.includes('typ lamely')) {
            colMap['lamella_type'] = cIdx;
          } else if (hVal.includes('barva lamely') || hVal.includes('barva latky') || hVal.includes('barva látky') || hVal.includes('tkanina')) {
            colMap['lamella_color'] = cIdx;
          } else if (hVal.includes('domyk') || hVal.includes('domykavost') || hVal.includes('domykavé')) {
            colMap['isCelostin'] = cIdx;
          } else if (hVal.includes('délka ovládání') || hVal.includes('delka ovladani')) {
            colMap['control_length'] = cIdx;
          } else if (hVal.includes('materiál okna') || hVal.includes('material okna')) {
            colMap['window_material'] = cIdx;
          } else if (hVal.includes('distanční podložky') || hVal.includes('podložky') || hVal.includes('podlozky')) {
            colMap['spacer'] = cIdx;
          } else if (hVal.includes('žebřík') || hVal.includes('zebrik') || hVal.includes('sladění') || hVal.includes('sladeni')) {
            colMap['color_harmony'] = cIdx;
          } else if (hVal.includes('bezpečnost') || hVal.includes('bezpecnost')) {
            colMap['safety'] = cIdx;
          } else if (hVal.includes('podpěra') || hVal.includes('podpera')) {
            colMap['support'] = cIdx;
          } else if (hVal.includes('poznámka') || hVal.includes('poznamka') || hVal.includes('pozn.')) {
            colMap['notes'] = cIdx;
          }
        });

        // Fallback or secondary sweep if subheaders contain the actual keys
        if (colMap['width'] === undefined) {
          subHeaders.forEach((cell, cIdx) => {
            const sVal = cleanVal(cell).toLowerCase();
            if (sVal === 'šířka' || sVal === 'sirka') colMap['width'] = cIdx;
            if (sVal === 'výška' || sVal === 'vyska') colMap['height'] = cIdx;
          });
        }

        // Default columns mapping if we are in horizontal QAPI sheets
        if (colMap['width'] === undefined) colMap['width'] = 1;
        if (colMap['height'] === undefined) colMap['height'] = 2;
        if (colMap['quantity'] === undefined) colMap['quantity'] = 3;

        // Rows starting index is generally headerRowIdx + 3 representing lines below headers
        const dataStartRowIdx = headerRowIdx + 3;
        const parsedItems: BlindOrderItem[] = [];

        for (let rIdx = dataStartRowIdx; rIdx < rows.length; rIdx++) {
          const row = rows[rIdx];
          if (!row || row.length === 0) continue;

          // Dimension values
          const rawWidth = row[colMap['width']];
          const rawHeight = row[colMap['height']];
          const rawQuantity = row[colMap['quantity']];

          const wVal = parseNum(rawWidth);
          const hVal = parseNum(rawHeight);
          const qVal = parseNum(rawQuantity) || 1;

          // Stop parsing if we reach a summary row or double empty space
          if (wVal <= 0 && hVal <= 0) {
            // Check if there is anything in other columns to avoid early exit
            const hasAnyData = row.slice(0, 10).some(cell => cleanVal(cell) !== '');
            if (!hasAnyData) {
              // Might be empty spacer, continue or break or let's just skip
              continue;
            }
            continue;
          }

          // Generate default and resolved fields
          const positionStr = colMap['pozice'] !== undefined ? cleanVal(row[colMap['pozice']]) : '';
          const rawControl = colMap['control'] !== undefined ? cleanVal(row[colMap['control']]) : 'P';
          const rawProfileMaterial = colMap['profile_material'] !== undefined ? cleanVal(row[colMap['profile_material']]) : 'Fe';
          const rawProductType = colMap['product_type'] !== undefined ? cleanVal(row[colMap['product_type']]) : 'Isoline';
          const rawProfileColor = colMap['profile_color'] !== undefined ? cleanVal(row[colMap['profile_color']]) : '9010';
          const rawLocoColor = colMap['loco_color'] !== undefined ? cleanVal(row[colMap['loco_color']]) : '';
          const rawLamellaType = colMap['lamella_type'] !== undefined ? cleanVal(row[colMap['lamella_type']]) : '25 x 0.18';
          const rawLamellaColor = colMap['lamella_color'] !== undefined ? cleanVal(row[colMap['lamella_color']]) : '9010';
          const rawIsCelostin = colMap['isCelostin'] !== undefined ? isYes(row[colMap['isCelostin']]) : false;
          const rawControlLength = colMap['control_length'] !== undefined ? cleanVal(row[colMap['control_length']]) : 'standard';
          const rawWindowMaterial = colMap['window_material'] !== undefined ? cleanVal(row[colMap['window_material']]) : 'PVC';
          const rawSpacer = colMap['spacer'] !== undefined ? parseNum(row[colMap['spacer']]) : 0;
          const rawHarmony = colMap['color_harmony'] !== undefined ? isYes(row[colMap['color_harmony']]) : false;
          const rawSafety = colMap['safety'] !== undefined ? isYes(row[colMap['safety']]) : false;
          const rawSupport = colMap['support'] !== undefined ? isYes(row[colMap['support']]) : false;
          const rawNotes = colMap['notes'] !== undefined ? cleanVal(row[colMap['notes']]) : '';

          // Let's map productType correctly
          let resolvedProductType: ProductType = 'ISOLINE';
          const rptUpper = rawProductType.toUpperCase();
          if (rptUpper.includes('LOCO')) {
            resolvedProductType = 'ISOLINE_LOCO';
          } else if (rptUpper.includes('PRIM')) {
            resolvedProductType = 'ISOLINE_PRIM';
          } else if (rptUpper.includes('ECO') || rptUpper.includes('EKONOM')) {
            resolvedProductType = 'ISOLINE_ECO';
          } else if (rptUpper.includes('HZ 25') || rptUpper.includes('25X19')) {
            resolvedProductType = 'HZ_25_19';
          } else if (rptUpper.includes('HZ 27') || rptUpper.includes('27X19')) {
            resolvedProductType = 'HZ_27_19';
          } else if (category === 'ROLETKY') {
            if (rptUpper.includes('STREAM-S') || rptUpper.includes('STREAM S')) {
              resolvedProductType = 'ROLL_STREAM_S';
            } else if (rptUpper.includes('STREAM PLUS') || rptUpper.includes('STREAM+')) {
              resolvedProductType = 'ROLL_STREAM_PLUS';
            } else if (rptUpper.includes('SONATA')) {
              resolvedProductType = 'ROLL_SONATA';
            } else if (rptUpper.includes('LEGEND')) {
              resolvedProductType = 'ROLL_LEGEND';
            } else if (rptUpper.includes('JAZZ')) {
              resolvedProductType = 'ROLL_JAZZ';
            } else {
              resolvedProductType = 'ROLL_OPUS_OPTIMA_COLLETE';
            }
          } else {
            // Default depending on category
            resolvedProductType = category === 'WOODEN' ? 'WOOD_25' : 
                                  category === 'SCREENS' ? 'SCREEN_FIX_W' : 'ISOLINE';
          }

          // Clean control code
          let resolvedControlSide = 'RP';
          const rcUpper = rawControl.toUpperCase();
          if (rcUpper.startsWith('L') || rcUpper.includes('LEVE') || rcUpper.includes('LEVÉ')) {
            resolvedControlSide = 'RL';
          } else if (rcUpper.startsWith('P') || rcUpper.includes('PRAVE') || rcUpper.includes('PRAVÉ')) {
            resolvedControlSide = 'RP';
          } else if (rcUpper.startsWith('M') && !rcUpper.includes('FIX')) {
            resolvedControlSide = 'M';
          } else if (rcUpper.includes('MF') || rcUpper.includes('MEZISKELNÍ S FIXACÍ')) {
            resolvedControlSide = 'MF';
          } else if (rcUpper.includes('IF') || rcUpper.includes('BOČNÍ VÝVOD')) {
            resolvedControlSide = 'IF';
          } else if (rcUpper.includes('IBF')) {
            resolvedControlSide = 'IBF';
          } else if (rcUpper.includes('IB')) {
            resolvedControlSide = 'IB';
          } else if (rcUpper.includes('MOTOR')) {
            resolvedControlSide = 'MOTOR_IO';
          }

          // Clean lamella size/type representation
          let resolvedLamellaSize = rawLamellaType.replace(/\s+/g, '');
          if (!resolvedLamellaSize) {
            resolvedLamellaSize = '25x0.18';
          }

          // Combine position and notes safely
          let itemNotesStr = '';
          if (positionStr) itemNotesStr += `Pozice: ${positionStr}`;
          if (rawNotes) itemNotesStr += (itemNotesStr ? ' | ' : '') + rawNotes;

          const newItem: BlindOrderItem = {
            id: generateId(),
            category,
            productType: resolvedProductType,
            width: wVal,
            height: hVal,
            quantity: qVal,
            lamellaSize: resolvedLamellaSize,
            lamellaColor: rawLamellaColor.replace(/^RAL\s*/i, '').trim(),
            topProfileColor: rawProfileColor.replace(/^RAL\s*/i, '').trim(),
            bottomProfileColor: rawProfileColor.replace(/^RAL\s*/i, '').trim(),
            controlSide: resolvedControlSide,
            isCelostin: rawIsCelostin,
            isSlant: fileTitle.toLowerCase().includes('atyp') || rawNotes.toLowerCase().includes('atyp') || positionStr.toLowerCase().includes('atyp'),
            hasBrake: rawControl.includes('brzda') || rawNotes.includes('brzda'),
            hasGearbox: rawNotes.includes('převodovka') || rawNotes.includes('prevodovka'),
            notes: itemNotesStr || undefined,

            // Horizontal Blinds specific properties mapped directly
            lamellaType: rawLamellaType,
            profileMaterial: rawProfileMaterial.startsWith('Al') ? 'Al' : 'Fe',
            locoColor: rawLocoColor || undefined,
            colorHarmony: rawHarmony,
            controlLengthCustom: rawControlLength,
            controlAccessory: rawNotes.toLowerCase().includes('brzda') ? 'B - brzda' : undefined,
            windowMaterial: rawWindowMaterial,
            spacerCount: rawSpacer,
            safetyElementBlinds: rawSafety,
            mountingSupport: rawSupport
          };

          parsedItems.push(newItem);
        }

        resolve({
          category,
          items: parsedItems,
          fileName: file.name,
          orderInfo: {
            customerName,
            orderNumber,
          }
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (e) => reject(new Error('Chyba při čtení souboru.'));
    reader.readAsArrayBuffer(file);
  });
}
