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
    init: (cardId, medKey, config) => initBolusCard(cardId, medKey, config)
  },
  infusion: { 
    createUI: (medKey, config) => createInfusionUI(medKey, config),
    init: (cardId, medKey, config) => initInfusionCard(cardId, medKey, config)
  }
};

export const configCardsPorAba = {
  iot: [ 
    { key: 'fentanil', type: 'bolus', doseOptionId: 'iot' }, 
    { key: 'midazolam', type: 'bolus',  doseOptionId: 'iot', presentationIndex: 1 }, 
    { key: 'cetamina', type: 'bolus',  doseOptionId: 'iot', presentationIndex: 1 },
    { key: 'etomidato', type: 'bolus',  doseOptionId: 'iot'},
    { Key: 'rocuronio', type: 'bolus', doseOptionId: 'iot'}
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