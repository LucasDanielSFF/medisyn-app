import { calcularBolus } from './calculationsBolus.js';
import { updateSliderAndUI, updateCardContent, initCard } from './cardManagerShared.js';

export function initBolusCard(cardId, medKey, config = {}) {
  const selectors = {
    medSelect: '.bolus-med-select',
    doseSelect: '.bolus-dose-select',
    inputElements: '.bolus-dose-slider, .bolus-pres-select',
    calcularFunction: calcularBolus
  };

  initCard(cardId, medKey, config, 'bolus', selectors);

  // Se um perfil de dose inicial foi especificado, garante sincronização da UI
  const doseSelect = document.getElementById(cardId).querySelector('.bolus-dose-select');
  if (doseSelect && config.doseOptionId) {
    doseSelect.value = config.doseOptionId;
    // Dispara evento de input para atualizar slider e cálculo com o perfil selecionado
    doseSelect.dispatchEvent(new Event('input'));
  }
}
