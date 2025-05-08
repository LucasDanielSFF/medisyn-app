import { cardStrategies, configCardsPorAba, configAba } from '../../config/config.js';
import { medicationsDB } from '../../../data/medicationsDB.js';
import { calcBolus, calcInfusion } from './calculations.js';
import { calcMedian } from './calculationsShared.js';

export function getGlobalWeight() {
  const rawValue = document.getElementById('patient-weight').value;
  const weight = parseInt(rawValue, 10);
  const isValid = !isNaN(weight) && weight >= 40 && weight <= 300;
  return isValid ? weight : 70;
}

export function sanitizeInteger(value) {
  if (value === "") return 0;
  const num = parseInt(value, 10) || 0;
  return Math.min(Math.max(num, 40), 300);
}

const validateWeight = () => {
  const rawValue = weightInput.value;
  const num = parseInt(rawValue, 10);
  const isValid = !isNaN(num) && num >= 40 && num <= 300;
  weightInput.classList.toggle('is-invalid', !isValid);
  if (!isValid && rawValue !== "") {
    errorDiv.classList.add('show');
    if (errorTimeout) clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => errorDiv.classList.remove('show'), 5000);
  } else {
    errorDiv.classList.remove('show');
  }
  return isValid;
};

export function updateSliderAndUI(card, doseConfig, valorMedio, type) {
  const slider = card.querySelector(`.${type}-dose-slider`);
  if (!slider) return;

  // Resetar completamente o slider
  slider.min = doseConfig.min;
  slider.max = doseConfig.max;
  slider.step = doseConfig.step;
  slider.value = valorMedio;

  // Forçar atualização visual
  const event = new Event('input', { bubbles: true });
  slider.dispatchEvent(event);

  // Atualizar textos
  const doseValueSpan = card.querySelector('.dose-value');
  const doseUnitSpan = card.querySelector('.dose-unit');
  const doseInfoSpan = card.querySelector('.dose-info');
  
  if (doseValueSpan) doseValueSpan.textContent = valorMedio.toFixed(2);
  if (doseUnitSpan) doseUnitSpan.textContent = doseConfig.unit;
  if (doseInfoSpan) {
    doseInfoSpan.textContent = `(Faixa: ${parseFloat(doseConfig.min).toFixed(2)} - ${parseFloat(doseConfig.max).toFixed(2)} ${doseConfig.unit})`;
  }
}

export function updateAllCardsOnWeightChange() {
  document.querySelectorAll('.col-12[id^="card-"]').forEach(cardEl => {
    const cardId = cardEl.id;
    const content = document.getElementById(`${cardId}-content`);
    if (!content) return;

    if (content.querySelector('.bolus-med-select')) {
      const medKey = content.querySelector('.bolus-med-select').value;
      const bolusData = medicationsDB[medKey]?.admtype?.bolus;
      if (bolusData) {
        const isLocked = cardEl.dataset.isLocked === 'true';
        const doseOptionId = isLocked 
          ? cardEl.dataset.doseOptionId 
          : content.querySelector('.bolus-dose-select')?.value;
        const doseConfig = doseOptionId
          ? bolusData.doseOptions.find(opt => opt.id === doseOptionId)
          : bolusData.dose;
        const valorMedio = calcMedian(doseConfig.min, doseConfig.max);
        updateSliderAndUI(cardEl, doseConfig, valorMedio, 'bolus');
        calcBolus(cardId);
      }
    } else if (content.querySelector('.infusion-med-select')) {
      const medKey = content.querySelector('.infusion-med-select').value;
      const infData = medicationsDB[medKey]?.admtype?.infusion;
      if (infData) {
        const doseOptionId = content.querySelector('.infusion-dose-select')?.value;
        const doseConfig = doseOptionId
          ? infData.doseOptions.find(opt => opt.id === doseOptionId)
          : infData.dose;
        const valorMedio = calcMedian(doseConfig.min, doseConfig.max);
        updateSliderAndUI(cardEl, doseConfig, valorMedio, 'infusion');
        calcInfusion(cardId);
      }
    }
  });
}

export function removeAllCards(containerId) {
  const container = document.getElementById(containerId);
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}