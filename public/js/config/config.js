// ==================================================
// ►►► Configurações gerais
// ==================================================

import { createBolusUI, createInfusionUI } from '../modules/calculadora/uiTemplates.js';
import { initBolusCard, initInfusionCard } from '../modules/calculadora/cardManager.js';

export const configAba = {
  iot: { addButton: false, removable: false },
  infusion: { addButton: false, removable: false },
  bolus: { addButton: false, removable: false },
  universal: { addButton: true, removable: true }
};

export const cardStrategies = {
  bolus: { 
    createUI: (medKey, config) => createBolusUI(medKey, config),
    init: (cardId, medKey, config) => initBolusCard(cardId, medKey, config?.presentationIndex)
  },
  infusion: { 
    createUI: (medKey, config) => createInfusionUI(medKey, config),
    init: (cardId, medKey, config) => initInfusionCard(cardId, medKey, config?.dilutionIndex)
  }
};

export const configCardsPorAba = {
  iot: [ 
    { key: 'fentanil', type: 'bolus', dilutionIndex: 0 }, 
    { key: 'midazolam', type: 'bolus',  doseOptionId: 'iot', presentationIndex: 1 } 
  ],
  infusion: [ 
    { key: 'fentanil', type: 'infusion', dilutionIndex: 0 }, 
    { key: 'dexmedetomidina', type: 'infusion', doseOptionId: 'pos-operatorio', isLocked: true, presentationIndex: 0 } 
  ],
  bolus: [ 
    { key: 'fentanil', type: 'bolus', dilutionIndex: 0 }, 
    { key: 'midazolam', type: 'bolus', presentationIndex: 0 } 
  ],
  universal: []
};