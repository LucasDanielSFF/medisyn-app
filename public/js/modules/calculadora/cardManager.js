import { cardStrategies, configCardsPorAba, configAba } from '../../config/config.js';
import { medicationsDB } from '../../../data/medicationsDB.js';
import { calcBolus, calcInfusion, calcRevInfusion } from './calculations.js';
import { calcMedian } from './calculationsShared.js';
import { generateCardId } from './calculadora.js';
import { updateSliderAndUI, removeAllCards } from './sharedUtils.js';

export function initCard(cardId, medKey, config, type, selectors) {
  const card = document.getElementById(cardId);
  const selectMed = card.querySelector(selectors.medSelect);
  const medData = medicationsDB[medKey]?.admtype?.[type];
  if (!medData) {
    console.error(`Medicação "${medKey}" não possui configuração para tipo ${type}.`);
    return;
  }
  const doseConfig = config.doseOptionId && medData.doseOptions
    ? medData.doseOptions.find(opt => opt.id === config.doseOptionId)
    : medData.dose;
  const valorMedio = calcMedian(doseConfig.min, doseConfig.max);
  updateSliderAndUI(card, doseConfig, valorMedio, type);

  const doseSelect = card.querySelector(selectors.doseSelect);
  if (doseSelect && !config.isLocked) {
    if (config.doseOptionId) {
      doseSelect.value = config.doseOptionId;
    }
    doseSelect.addEventListener('input', () => {
      const newDoseId = doseSelect.value;
      const newDose = medData.doseOptions.find(opt => opt.id === newDoseId);
      updateSliderAndUI(card, newDose, calcMedian(newDose.min, newDose.max), type);
      selectors.calcularFunction(cardId);
    });
  }

  selectMed.addEventListener('input', () => {
    const newMedKey = selectMed.value;
    const cardElement = document.getElementById(cardId);
    const titleElement = cardElement.querySelector('.medication-title');
    
    if (titleElement) {
      titleElement.textContent = medicationsDB[newMedKey]?.name || 'Nova Medicação';
    }
    
    updateCardContent(cardId, type, selectMed.value, config);
  });

  card.querySelectorAll(selectors.inputElements).forEach(el => {
    el.addEventListener('input', () => selectors.calcularFunction(cardId));
  });

  selectors.calcularFunction(cardId);
}

export function initBolusCard(cardId, medKey, config = {}) {
  const selectors = {
    medSelect: '.bolus-med-select',
    doseSelect: '.bolus-dose-select',
    inputElements: '.bolus-dose-slider, .bolus-pres-select',
    calcularFunction: calcBolus
  };

  initCard(cardId, medKey, config, 'bolus', selectors);

  const doseSelect = document.getElementById(cardId).querySelector('.bolus-dose-select');
  if (doseSelect && config.doseOptionId) {
    doseSelect.value = config.doseOptionId;
    doseSelect.dispatchEvent(new Event('input'));
  }
}

export function initInfusionCard(cardId, medKey, config = {}) {
  const selectors = {
    medSelect: '.infusion-med-select',
    doseSelect: '.infusion-dose-select',
    inputElements: '.infusion-dose-slider, .infusion-med-volume, .infusion-sol-volume, .infusion-conc-value, .infusion-conc-unit',
    calcularFunction: calcInfusion
  };

  initCard(cardId, medKey, config, 'infusion', selectors);

  const card = document.getElementById(cardId);
  const toggleBtn = card.querySelector('.btn-toggle-reverse');
  const reverseSection = card.querySelector('.reverse-calculation');

  toggleBtn?.addEventListener('click', () => {
    const isHidden = reverseSection.classList.toggle('hidden');
    
    // Elementos relacionados à dose (verificação segura)
    const elementsToToggle = [
      '.infusion-dose-select-text',
      '.infusion-dose-select',
      '.dose-info',
      '.dose-value',
      '.infusion-dose-slider',
      '.flow-result',
      '.resultado-container',
      '.dose-section'
    ];

    elementsToToggle.forEach(selector => {
      const el = card.querySelector(selector);
      if (el) el.classList.toggle('hidden', !isHidden);
    });

    // Atualização segura do texto do botão
    if (toggleBtn) {
      toggleBtn.textContent = isHidden ? '▼ Cálculo Reverso' : '▲ Ocultar';
    }
  });

  const doseSelect = card.querySelector('.infusion-dose-select');
  if (doseSelect && config.doseOptionId) {
    doseSelect.value = config.doseOptionId;
  }

  const dilSelect = card.querySelector('.infusion-dilution-select');
  const customBtn = card.querySelector('.btn-custom-dilution');
  const medVolumeInput = card.querySelector('.infusion-med-volume');
  const solVolumeInput = card.querySelector('.infusion-sol-volume');
  const concValueInput = card.querySelector('.infusion-conc-value');
  const concUnitSelect = card.querySelector('.infusion-conc-unit');

  const setCustomMode = (active) => {
    customBtn.classList.toggle('active', active);
    medVolumeInput.readOnly = !active;
    solVolumeInput.readOnly = !active;
    concValueInput.readOnly = !active;
    concUnitSelect.disabled = !active;
  };
  setCustomMode(false);

  const handleDilutionSelect = () => {
    if (dilSelect.value !== '') {
      const d = medicationsDB[medKey]?.admtype?.infusion.diluicoes[dilSelect.value];
      if (d) {
        const currentDoseId = doseSelect?.value;
        medVolumeInput.value = d.medVolume;
        solVolumeInput.value = d.solVolume;
        concValueInput.value = d.concValue;
        concUnitSelect.value = d.concUnit;
        setCustomMode(false);
        if (currentDoseId) {
          doseSelect.value = currentDoseId;
        }
        calcInfusion(cardId);
        calcRevInfusion(cardId);
      }
    }
  };

  dilSelect?.addEventListener('input', handleDilutionSelect);
  customBtn?.addEventListener('click', () => {
    const isActive = !medVolumeInput.readOnly;
    setCustomMode(!isActive);
    calcInfusion(cardId);
    calcRevInfusion(cardId);
  });

  card.querySelector('.reverse-flow-input')?.addEventListener('input', () => {
    calcRevInfusion(cardId);
  });

  /*const timeUnitSelect = card.querySelector('.infusion-time-unit');
  const massUnitSelect = card.querySelector('.infusion-mass-unit');
  const updateConcentrationUnits = () => {
    const timeUnit = timeUnitSelect?.value || 'hora';
    const massUnit = massUnitSelect?.value || 'mg';
    concUnitSelect.querySelectorAll('option').forEach(option => {
      option.textContent = `${massUnit}/${timeUnit}`;
    });
  };
  massUnitSelect?.addEventListener('input', () => {
    calcInfusion(cardId);
    calcRevInfusion(cardId);
    updateConcentrationUnits();
  });
  timeUnitSelect?.addEventListener('input', () => {
    calcInfusion(cardId);
    calcRevInfusion(cardId);
    updateConcentrationUnits();
  });
  massUnitSelect?.addEventListener('change', updateConcentrationUnits);
  timeUnitSelect?.addEventListener('change', updateConcentrationUnits);*/

  card.querySelectorAll('.infusion-med-volume, .infusion-sol-volume, .infusion-conc-value, .infusion-conc-unit')
    .forEach(el => {
      el.addEventListener('input', () => {
        calcInfusion(cardId);
        calcRevInfusion(cardId);
      });
    });
}

export function updateCardContent(cardId, type, medKey, config = {}) {
  const contentDiv = document.getElementById(`${cardId}-content`);

  const titleElement = contentDiv.closest('.card-medicamento').querySelector('.medication-title');
  
  if (titleElement) {
    titleElement.textContent = medicationsDB[medKey]?.name || 'Nova Medicação';
  }

  const strategy = cardStrategies[type];
  contentDiv.innerHTML = strategy.createUI(cardId, medKey, config);
  strategy.init(cardId, medKey, config);
}

export function changeCardType(cardId, newType) {
  const initialMedKey = Object.keys(medicationsDB).find(key =>
    medicationsDB[key]?.admtype?.[newType]
  );
  updateCardContent(cardId, newType, initialMedKey || '', { showUnitControls: true });
}

export function initialCardLoading(aba) {
  const containers = {
    iot: 'iot-container',
    infusion: 'infusion-container',
    bolus: 'bolus-container',
    universal: 'universal-container'
  };
  const containerId = containers[aba];
  removeAllCards(containerId);

  configCardsPorAba[aba].forEach(medConfig => {
    const cardId = generateCardId();
    const cardCol = document.createElement('div');
    cardCol.className = 'col-12';
    cardCol.id = cardId;
    cardCol.dataset.isLocked = medConfig.isLocked ? 'true' : 'false';
    if (medConfig.doseOptionId) {
      cardCol.dataset.doseOptionId = medConfig.doseOptionId;
    }
    cardCol.innerHTML = `
      <div class="card-medicamento">
        ${configAba[aba].removable ? `
          <div class="d-flex align-items-center gap-2 mb-3">
            <button class="btn btn-danger btn-sm btn-remove-card" onclick="removeCard('${cardId}')">×</button>
          </div>` : ''}
        <div id="${cardId}-content"></div>
      </div>
    `;
    document.getElementById(containerId).appendChild(cardCol);
    updateCardContent(cardId, medConfig.type, medConfig.key, {
      ...medConfig,
      isLocked: aba !== 'universal',
      showUnitControls: aba === 'universal'
    });
  });
}