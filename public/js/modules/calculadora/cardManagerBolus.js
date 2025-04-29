import { medicationsDB } from '../../../data/medicationsDB.js';
import { calcularBolus } from './calculationsBolus.js';
import { calcularValorMedio } from './calculationsShared.js';
import { updateSliderAndUI, updateCardContent } from './cardManagerShared.js';

export function initBolusCard(cardId, medKey, config = {}) {
  const card = document.getElementById(cardId);
  const selectMed = card.querySelector('.bolus-med-select');
  const med = medicationsDB[medKey]?.admtype?.bolus;

  const doseOptionId = config.doseOptionId;
  const doseConfig = doseOptionId 
    ? med.doseOptions?.find(opt => opt.id === doseOptionId) || med.dose
    : med.dose;

  if (!doseConfig) return;

  const valorMedio = calcularValorMedio(doseConfig.min, doseConfig.max);
  updateSliderAndUI(card, doseConfig, valorMedio, 'bolus');

  selectMed.addEventListener('change', () => {
    updateCardContent(cardId, 'bolus', selectMed.value, config);
  });

  const doseSelect = card.querySelector('.bolus-dose-select');
  if (doseSelect && !config.isLocked) {
    if (config.doseOptionId) {
      doseSelect.value = config.doseOptionId;
    }
    if (doseSelect && config.doseOptionId) {
      doseSelect.value = config.doseOptionId;
      doseSelect.dispatchEvent(new Event('change'));
    }
    doseSelect.addEventListener('change', () => {
      const newDoseId = doseSelect.value;
      const newDose = med.doseOptions.find(opt => opt.id === newDoseId);
      updateSliderAndUI(card, newDose, calcularValorMedio(newDose.min, newDose.max), 'bolus');
      calcularBolus(cardId);
    });
  }

  card.querySelectorAll('.bolus-dose-slider, .bolus-pres-select')
     .forEach(el => el.addEventListener('input', () => calcularBolus(cardId)));
  
  calcularBolus(cardId);
}