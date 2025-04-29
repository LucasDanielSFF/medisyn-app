import { cardStrategies, configCardsPorAba, configAba } from '../../config/config.js';
import { medicationsDB } from '../../../data/medicationsDB.js';
import { calcularBolus } from './calculationsBolus.js';
import { calcularInfusion } from './calculationsInfusion.js';
import { calcularValorMedio } from './calculationsShared.js';

export function getGlobalWeight() {
  const rawValue = document.getElementById('patient-weight').value;
  const weight = parseInt(rawValue, 10);
  const isValid = !isNaN(weight) && weight >= 40 && weight <= 300;
  
  return isValid ? weight : 70;
}

function sanitizeInteger(value) {
  if (value === "") return 0;
  const num = parseInt(value, 10) || 0;
  return Math.min(Math.max(num, 40), 300);
}

function removerTodosCards(containerId) {
  const container = document.getElementById(containerId);
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

export function updateCardContent(cardId, type, medKey, config = {}) {
  const strategy = cardStrategies[type];
  const content = document.getElementById(`${cardId}-content`);
  
  content.innerHTML = strategy.createUI(cardId, medKey, config);
  strategy.init(cardId, medKey, config);
}

export function carregarCardsAutomaticos(aba) {
  const containers = { 
    iot: 'iot-container',
    infusion: 'infusion-container', 
    bolus: 'bolus-container', 
    universal: 'universal-container'
  };

  const container = containers[aba];
  removerTodosCards(container);

  configCardsPorAba[aba].forEach(medConfig => {
    const cardId = `card-${Date.now()}-${Math.random()}`;
    
    const cardHTML = `
      <div class="col-12" id="${cardId}">
        <div class="card-medicamento">
          ${configAba[aba].removable ? `
            <div class="d-flex align-items-center justify-content-start gap-2 mb-3">
              <button class="btn btn-danger btn-sm btn-remove-card" onclick="removeCard('${cardId}')">×</button>
            </div>` : ''}
          <div id="${cardId}-content"></div>
        </div>
      </div>`;

    document.getElementById(container).insertAdjacentHTML('beforeend', cardHTML);
    
    updateCardContent(cardId, medConfig.type, medConfig.key, {
      ...medConfig,
      isLocked: aba !== 'universal',
      showUnitControls: aba === 'universal'
    });
  });
}

export function changeCardType(cardId, newType) {
  const initialMedKey = Object.keys(medicationsDB).find(key => 
    medicationsDB[key]?.admtype?.[newType]
  );

  updateCardContent(cardId, newType, initialMedKey || '');
}

export function initEventListeners() {
  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', e => {
      const target = e.target.getAttribute('data-bs-target').replace('#', '');
      carregarCardsAutomaticos(target);
    });
  });

  const weightInput = document.getElementById('patient-weight');
  const errorDiv = document.getElementById('weight-error');
  let errorTimeout = null;

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

  weightInput.addEventListener('input', () => {
    weightInput.value = weightInput.value.replace(/[^0-9]/g, '');
    validateWeight();
  });

  weightInput.addEventListener('blur', () => {
    weightInput.value = sanitizeInteger(weightInput.value);
    validateWeight();
  });

  weightInput.addEventListener('change', () => updateAllCardsOnWeightChange());
  weightInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      weightInput.blur();
      validateWeight() && updateAllCardsOnWeightChange();
    }
  });
}

export function updateSliderAndUI(card, doseConfig, valorMedio, type) {
  const slider = card.querySelector(`.${type}-dose-slider`);
  const doseValue = card.querySelector('.dose-value');
  const doseUnit = card.querySelector('.dose-unit');
  const doseInfo = card.querySelector('.dose-info');

  slider.min = doseConfig.min;
  slider.max = doseConfig.max;
  slider.step = doseConfig.step;
  slider.value = valorMedio;

  doseValue.textContent = valorMedio.toFixed(2);
  doseUnit.textContent = doseConfig.unit;
  doseInfo.textContent = `(Faixa: ${parseFloat(doseConfig.min).toFixed(2)} - ${parseFloat(doseConfig.max).toFixed(2)} ${doseConfig.unit})`;
}

export function updateAllCardsOnWeightChange() {
  document.querySelectorAll('.col-12[id^="card-"]').forEach(cardEl => {
    const id = cardEl.id;
    const content = document.getElementById(`${id}-content`);
    if (!content) return;

    const isBolus = content.querySelector('.bolus-med-select');
    const isInfusion = content.querySelector('.infusion-med-select');

    if (isBolus) {
      const medKey = content.querySelector('.bolus-med-select').value;
      const med = medicationsDB[medKey]?.admtype?.bolus;
      if (med) {
        const doseOptionId = content.querySelector('.bolus-dose-select')?.value;
        const doseConfig = doseOptionId 
          ? med.doseOptions.find(opt => opt.id === doseOptionId)
          : med.dose;
        const valorMedio = calcularValorMedio(doseConfig.min, doseConfig.max);
        updateSliderAndUI(cardEl, doseConfig, valorMedio, 'bolus'); // <-- Corrigido
        calcularBolus(id);
      }
    } else if (isInfusion) {
      const medKey = content.querySelector('.infusion-med-select').value;
      const med = medicationsDB[medKey]?.admtype?.infusion;
      if (med) {
        const doseOptionId = content.querySelector('.infusion-dose-select')?.value;
        const doseConfig = doseOptionId 
          ? med.doseOptions.find(opt => opt.id === doseOptionId)
          : med.dose;
        const valorMedio = calcularValorMedio(doseConfig.min, doseConfig.max);
        updateSliderAndUI(cardEl, doseConfig, valorMedio, 'infusion');
        calcularInfusion(id);
      }
    }
  });
}

window.changeCardType = (cardId, newType) => {
  const initialMedKey = Object.keys(medicationsDB).find(key => 
    medicationsDB[key]?.admtype?.[newType]
  );
  updateCardContent(cardId, newType, initialMedKey || '');
};

window.removeCard = (cardId) => document.getElementById(cardId)?.remove();