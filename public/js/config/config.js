import { createInfusionUI, createBolusUI } from '../modules/calculadora/uiTemplates.js';
import { initBolusCard } from '../modules/calculadora/cardManagerBolus.js';
import { initInfusionCard } from '../modules/calculadora/cardManagerInfusion.js';
import { medicationsDB } from '../../data/medicationsDB.js';

export const configAba = {
  iot:      { removable: false },
  infusion: { removable: false },
  bolus:    { removable: false },
  universal:{ removable: true }
};

export const cardStrategies = {
  bolus: {
    createUI: (cardId, medKey, config) => createBolusUI(cardId, medKey, config),
    init:    (cardId, medKey, config) => initBolusCard(cardId, medKey, config)
  },
  infusion: {
    createUI: (cardId, medKey, config) => createInfusionUI(cardId, medKey, config),
    init:    (cardId, medKey, config) => initInfusionCard(cardId, medKey, config)
  }
};

export const configCardsPorAba = {
  iot: [
    { key: 'fentanila',  type: 'bolus', doseOptionId: 'iot', isLocked: true },
    { key: 'midazolam',  type: 'bolus', doseOptionId: 'iot', presentationIndex: 1, isLocked: true },
    { key: 'cetamina',   type: 'bolus', doseOptionId: 'iot', presentationIndex: 1, isLocked: true },
    { key: 'etomidato',  type: 'bolus', doseOptionId: 'iot', isLocked: true },
    { key: 'rocuronio',  type: 'bolus', doseOptionId: 'iot', isLocked: true }
  ],
  infusion: Object.keys(medicationsDB)
    .filter(medKey => medicationsDB[medKey].admtype?.infusion)
    .map(medKey => {
      const medInf = medicationsDB[medKey].admtype.infusion;
      const doseOptionId = medInf.doseOptions?.[0]?.id;
      return {
        key: medKey,
        type: 'infusion',
        doseOptionId: doseOptionId || null,
        presentationIndex: 0
      };
    }),
  bolus: Object.keys(medicationsDB)
    .filter(medKey => medicationsDB[medKey].admtype?.bolus)
    .map(medKey => ({
      key: medKey,
      type: 'bolus',
      presentationIndex: 0
    })),
  universal: []  // começa vazia; usuário adiciona cards dinamicamente
};
