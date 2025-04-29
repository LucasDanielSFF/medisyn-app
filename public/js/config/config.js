// ==================================================
// ►►► Configurações gerais
// ==================================================

import { createInfusionUI } from '../modules/calculadora/uiTemplatesInfusion.js';
import { createBolusUI } from '../modules/calculadora/uiTemplatesBolus.js'
import { initBolusCard } from '../modules/calculadora/cardManagerBolus.js';
import { initInfusionCard } from '../modules/calculadora/cardManagerInfusion.js';

export const configAba = {
  iot: { addButton: false, removable: false },
  infusion: { addButton: false, removable: false },
  bolus: { addButton: false, removable: false },
  universal: { addButton: true, removable: true }
};

export const cardStrategies = {
  bolus: { 
    createUI: (cardId, medKey, config) => createBolusUI(cardId, medKey, config),
    init: (cardId, medKey, config) => initBolusCard(cardId, medKey, config)
  },
  infusion: { 
    createUI: (cardId, medKey, config) => createInfusionUI(cardId, medKey, config),
    init: (cardId, medKey, config) => initInfusionCard(cardId, medKey, config)
  }
};

export const configCardsPorAba = {
  iot: [ 
    { key: 'fentanil', type: 'bolus', doseOptionId: 'iot' }, 
    { key: 'midazolam', type: 'bolus',  doseOptionId: 'iot', presentationIndex: 1 }, 
    { key: 'cetamina', type: 'bolus',  doseOptionId: 'iot', presentationIndex: 1 },
    { key: 'etomidato', type: 'bolus',  doseOptionId: 'iot'}
  ],
  infusion: [ 
    { key: 'fentanil', type: 'infusion' }, 
    { key: 'dexmedetomidina', type: 'infusion', doseOptionId: 'pos-operatorio', isLocked: true, presentationIndex: 0 } 
  ],
  bolus: [ 
    { key: 'fentanil', type: 'bolus' }, 
    { key: 'midazolam', type: 'bolus', presentationIndex: 0 } 
  ],
  universal: []
};