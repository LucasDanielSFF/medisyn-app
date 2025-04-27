// ==================================================
// ►►► Gerenciamento de Cards
// ==================================================

import { cardStrategies, configCardsPorAba, configAba } from '../../config/config.js';
import { medicationsDB } from '../../../data/medicationsDB.js';
import { calcularValorMedio, calcularInfusion, calcularBolus } from './calculations.js';

// ==================================================
// ►►► Funções Auxiliares
// ==================================================

export function getGlobalWeight() {
  const rawValue = document.getElementById('patient-weight').value;
  const weight = parseInt(rawValue, 10);
  const isValid = !isNaN(weight) && weight >= 40 && weight <= 300;
  
  return isValid ? weight : 70;
}

function sanitizeInteger(value) {
  if (value === "") return 0; // Permite campo vazio temporariamente
  const num = parseInt(value, 10) || 0;
  return Math.min(Math.max(num, 40), 300);
}

// ==================================================
// ►►► Funções Principais
// ==================================================

export function initBolusCard(cardId, medKey, config = {}) {
  const card = document.getElementById(cardId);
  const selectMed = card.querySelector('.bolus-med-select');
  const med = medicationsDB[medKey]?.admtype?.bolus;
  
  // Obter dose configurada
  const doseOptionId = config.doseOptionId;
  const doseConfig = doseOptionId 
    ? med.doseOptions?.find(opt => opt.id === doseOptionId) || med.dose // Fallback
    : med.dose;

  if (!doseConfig) return;

  // Atualizar UI com valores da dose
  const valorMedio = calcularValorMedio(doseConfig.min, doseConfig.max);
  updateSliderAndUI(card, doseConfig, valorMedio, 'bolus');

  // Configurar eventos
  selectMed.addEventListener('change', () => {
    updateCardContent(cardId, 'bolus', selectMed.value, config);
  });

  // Configurar seletor de dose se existir
  const doseSelect = card.querySelector('.bolus-dose-select');
  if (doseSelect && !config.isLocked) {
    if (config.doseOptionId) {
      doseSelect.value = config.doseOptionId;
    }
    if (doseSelect && config.doseOptionId) {
      doseSelect.value = config.doseOptionId;
      // Disparar evento change para forçar atualização
      doseSelect.dispatchEvent(new Event('change'));
    }
    doseSelect.addEventListener('change', () => {
      const newDoseId = doseSelect.value;
      const newDose = med.doseOptions.find(opt => opt.id === newDoseId);
      updateSliderAndUI(card, newDose, calcularValorMedio(newDose.min, newDose.max), 'bolus');
      calcularBolus(cardId);
    });
  }

  // Eventos de cálculo
  card.querySelectorAll('.bolus-dose-slider, .bolus-pres-select')
     .forEach(el => el.addEventListener('input', () => calcularBolus(cardId)));
  
  calcularBolus(cardId);
}

export function initInfusionCard(cardId, medKey, config = {}) {
  const card = document.getElementById(cardId);
  const selectMed = card.querySelector('.infusion-med-select');
  const med = medicationsDB[medKey]?.admtype?.infusion;

  if (!med) return;

  // Obter configuração de dose
  const doseConfig = config.doseOptionId 
    ? med.doseOptions.find(opt => opt.id === config.doseOptionId)
    : med.dose;

  // Atualizar UI
  const valorMedio = calcularValorMedio(doseConfig.min, doseConfig.max);
  updateSliderAndUI(card, doseConfig, valorMedio, 'infusion');

  // Configurar seletor de dose
  const doseSelect = card.querySelector('.infusion-dose-select');
  if (doseSelect && !config.isLocked) {
    doseSelect.addEventListener('change', () => {
      const newDoseId = doseSelect.value;
      const newDose = med.doseOptions.find(opt => opt.id === newDoseId);
      updateSliderAndUI(card, newDose, calcularValorMedio(newDose.min, newDose.max), 'infusion');
      calcularInfusion(cardId);
    });
  }

  // Configurar eventos para o seletor de unidade de tempo
  const timeUnitSelect = card.querySelector('.infusion-time-unit');
  if (timeUnitSelect) {
    timeUnitSelect.addEventListener('change', () => {
      const selectedUnit = timeUnitSelect.value;
      const doseUnitElement = card.querySelector('.dose-unit');
      const unitParts = med.admtype.infusion.dose.unit.split('/');
      unitParts.pop();
      doseUnitElement.textContent = `${unitParts.join('/')}/${selectedUnit}`;
      calcularInfusion(cardId);
    });
  }

  // Configurar eventos de mudança de medicamento
  selectMed.addEventListener('change', () => {
    updateCardContent(cardId, 'infusion', selectMed.value, config);
  });

  // Configurar eventos de cálculo
  card.querySelectorAll(
    '.infusion-dose-slider, .infusion-med-volume, .infusion-sol-volume, .infusion-conc-value, .infusion-conc-unit'
  ).forEach(el => el.addEventListener('input', () => calcularInfusion(cardId)));

  // Restante da configuração de diluição...
  const dilSelect = card.querySelector('.infusion-dilution-select');
  const customBtn = card.querySelector('.btn-custom-dilution');
  const medVolumeInput = card.querySelector('.infusion-med-volume');
  const solVolumeInput = card.querySelector('.infusion-sol-volume');
  const concValueInput = card.querySelector('.infusion-conc-value');
  const concUnitSelect = card.querySelector('.infusion-conc-unit');

  const setCustomMode = (isActive) => {
    customBtn.classList.toggle('active', isActive);
    
    // Campos sempre bloqueados inicialmente
    medVolumeInput.readOnly = !isActive;
    solVolumeInput.readOnly = !isActive;
    concValueInput.readOnly = !isActive;
    concUnitSelect.disabled = !isActive;
  }

  setCustomMode(false);

  const handleDilutionSelect = () => {
    if (dilSelect.value !== '') {
      const d = med.diluicoes[dilSelect.value];
      medVolumeInput.value = d.medVolume;
      solVolumeInput.value = d.solVolume;
      concValueInput.value = d.concValue;
      concUnitSelect.value = d.concUnit;
      const isActive = !customBtn.classList.contains('active');
      setCustomMode(false);
      calcularInfusion(cardId);
    }
    calcularInfusion(cardId);
  };

  dilSelect.addEventListener('change', handleDilutionSelect);
  customBtn.addEventListener('click', () => {
    medVolumeInput.readOnly = !medVolumeInput.readOnly;
    solVolumeInput.readOnly = !solVolumeInput.readOnly;
    concValueInput.readOnly = !concValueInput.readOnly;
    concUnitSelect.disabled = !concUnitSelect.disabled;
    calcularInfusion(cardId);
  });

  // Cálculo inicial
  calcularInfusion(cardId);
}

// ==================================================
// ►►► Adição/Remoção de Cards
// ==================================================


function removerTodosCards(containerId) {
  const container = document.getElementById(containerId);
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

// ==================================================
// ►►► Funções de Atualização Dinâmica
// ==================================================

export function updateCardContent(cardId, type, medKey, config = {}) { // Movida para cima
  const strategy = cardStrategies[type];
  const content = document.getElementById(`${cardId}-content`);
  
  content.innerHTML = strategy.createUI(medKey, config);
  strategy.init(cardId, medKey, config);
}

// ==================================================
// ►►► Gerenciamento de Templates
// ==================================================

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
      isLocked: aba !== 'universal'
    });
  });
}

export function changeCardType(cardId, newType) {
  const initialMedKey = Object.keys(medicationsDB).find(key => 
    medicationsDB[key]?.admtype?.[newType]
  );

  updateCardContent(cardId, newType, initialMedKey || '');
}

// ==================================================
// ►►► Lógica de Eventos
// ==================================================

export function initEventListeners() {
  // Event Listeners para Tabs Bootstrap
  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', e => {
      const target = e.target.getAttribute('data-bs-target').replace('#', '');
      carregarCardsAutomaticos(target);
    });
  });

  // Elementos do Peso
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

  // Eventos do Peso
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

// ==================================================
// ►►► Função de Atualização de UI (Comum)
// ==================================================

function updateSliderAndUI(card, doseConfig, valorMedio, type) {
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

// ==================================================
// ►►► Função Auxiliar para Atualização Global
// ==================================================

function updateAllCardsOnWeightChange() {
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