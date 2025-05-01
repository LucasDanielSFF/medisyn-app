// ==================================================
// ►►► Configurações gerais
// ==================================================

import { createInfusionUI , createBolusUI } from '../modules/calculadora/uiTemplates.js'
import { initBolusCard } from '../modules/calculadora/cardManagerBolus.js';
import { initInfusionCard } from '../modules/calculadora/cardManagerInfusion.js';
import { medicationsDB } from '../../data/medicationsDB.js'; // Ajuste o caminho conforme necessário

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
  infusion: Object.keys(medicationsDB)
  .filter(medKey => medicationsDB[medKey].admtype?.infusion)
  .map(medKey => ({
    key: medKey,
    type: 'infusion',
   /* doseOptionId: 'padrao', // Define um ID padrão (opcional, ajuste conforme necessário)*/
    presentationIndex: 0 // Assume primeira apresentação como padrão
    })),
  bolus: Object.keys(medicationsDB)
  .filter(medKey => medicationsDB[medKey].admtype?.infusion)
  .map(medKey => ({
    key: medKey,
    type: 'bolus',
   /* doseOptionId: 'padrao', // Define um ID padrão (opcional, ajuste conforme necessário)*/
    presentationIndex: 0 // Assume primeira apresentação como padrão
    })),
  universal: []
};
