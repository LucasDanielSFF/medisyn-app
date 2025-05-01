import { medicationsDB } from '../../../data/medicationsDB.js';
import { calcularBolus } from './calculationsBolus.js';
import { calcularValorMedio } from './calculationsShared.js';
import { updateSliderAndUI, updateCardContent, initCard } from './cardManagerShared.js';

export function initBolusCard(cardId, medKey, config = {}) {
  const selectors = {
    medSelect: '.bolus-med-select',
    doseSelect: '.bolus-dose-select',
    inputElements: '.bolus-dose-slider, .bolus-pres-select',
    calcularFunction: calcularBolus
  };

  initCard(cardId, medKey, config, 'bolus', selectors);

  // Lógica específica de bolus (se necessária)
  const doseSelect = document.querySelector('.bolus-dose-select');
  if (doseSelect && config.doseOptionId) {
    doseSelect.value = config.doseOptionId;
    doseSelect.dispatchEvent(new Event('change'));
  }
}