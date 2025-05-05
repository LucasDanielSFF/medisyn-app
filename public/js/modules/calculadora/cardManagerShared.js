import { cardStrategies, configCardsPorAba, configAba } from '../../config/config.js';
import { medicationsDB } from '../../../data/medicationsDB.js';
import { calcularBolus } from './calculationsBolus.js';
import { calcularInfusion } from './calculationsInfusion.js';
import { calcularValorMedio } from './calculationsShared.js';
import { generateCardId } from './calculadora.js';
import { createBolusUI, createInfusionUI } from './uiTemplates.js';
import { initBolusCard } from './cardManagerBolus.js';
import { initInfusionCard } from './cardManagerInfusion.js';

export function getGlobalWeight() {
  const rawValue = document.getElementById('patient-weight').value;
  const weight = parseInt(rawValue, 10);
  const isValid = !isNaN(weight) && weight >= 40 && weight <= 300;
  return isValid ? weight : 70;  // peso padrão 70 se inválido
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
  const contentDiv = document.getElementById(`${cardId}-content`);
  const strategy = cardStrategies[type];
  // Gera o HTML do card conforme tipo e inicializa eventos internos
  contentDiv.innerHTML = strategy.createUI(cardId, medKey, config);
  strategy.init(cardId, medKey, config);
}

export function carregarCardsAutomaticos(aba) {
  const containers = {
    iot: 'iot-container',
    infusion: 'infusion-container',
    bolus: 'bolus-container',
    universal: 'universal-container'
  };
  const containerId = containers[aba];
  removerTodosCards(containerId);

  // Cria todos os cards pré-configurados daquela aba
  configCardsPorAba[aba].forEach(medConfig => {
    const cardId = generateCardId();
    const cardCol = document.createElement('div');
    cardCol.className = 'col-12';
    cardCol.id = cardId;
    cardCol.dataset.isLocked = medConfig.isLocked ? 'true' : 'false';
    if (medConfig.doseOptionId) {
      cardCol.dataset.doseOptionId = medConfig.doseOptionId;
    }
    // Monta o card HTML básico (botão remover e área de conteúdo)
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
    // Carrega conteúdo específico do card (UI e eventos) de acordo com o tipo e medicação
    updateCardContent(cardId, medConfig.type, medConfig.key, {
      ...medConfig,
      isLocked: aba !== 'universal',
      showUnitControls: aba === 'universal'
    });
  });
}

export function initCard(cardId, medKey, config, type, selectors) {
  const card = document.getElementById(cardId);
  const selectMed = card.querySelector(selectors.medSelect);
  const medData = medicationsDB[medKey]?.admtype?.[type];
  if (!medData) {
    console.error(`Medicação "${medKey}" não possui configuração para tipo ${type}.`);
    return;
  }
  // Seleciona a configuração de dose (perfil) adequada
  const doseConfig = config.doseOptionId && medData.doseOptions
    ? medData.doseOptions.find(opt => opt.id === config.doseOptionId)
    : medData.dose;
  // Define valor médio inicial da dose e atualiza slider/UI
  const valorMedio = calcularValorMedio(doseConfig.min, doseConfig.max);
  updateSliderAndUI(card, doseConfig, valorMedio, type);

  // Seletor de perfis de dose (se houver e card não estiver bloqueado)
  const doseSelect = card.querySelector(selectors.doseSelect);
  if (doseSelect && !config.isLocked) {
    if (config.doseOptionId) {
      doseSelect.value = config.doseOptionId;
    }
    doseSelect.addEventListener('input', () => {
      const newDoseId = doseSelect.value;
      const newDose = medData.doseOptions.find(opt => opt.id === newDoseId);
      updateSliderAndUI(card, newDose, calcularValorMedio(newDose.min, newDose.max), type);
      selectors.calcularFunction(cardId);
    });
  }

  // Troca de medicação no select principal do card
  selectMed.addEventListener('input', () => {
    updateCardContent(cardId, type, selectMed.value, config);
  });

  // Eventos de entrada (input) que disparam recálculo imediato
  card.querySelectorAll(selectors.inputElements).forEach(el => {
    el.addEventListener('input', () => selectors.calcularFunction(cardId));
  });

  // Cálculo inicial do card
  selectors.calcularFunction(cardId);
}

export function changeCardType(cardId, newType) {
  // Ao mudar tipo de card universal, carrega a primeira med disponível daquele tipo
  const initialMedKey = Object.keys(medicationsDB).find(key =>
    medicationsDB[key]?.admtype?.[newType]
  );
  updateCardContent(cardId, newType, initialMedKey || '', { showUnitControls: true });
}

export function initEventListeners() {
  // Quando uma aba (tab) for ativada, carrega os cards automáticos correspondentes
  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tabBtn => {
    tabBtn.addEventListener('shown.bs.tab', e => {
      const abaAtiva = e.target.getAttribute('data-bs-target').replace('#', '');
      carregarCardsAutomaticos(abaAtiva);
    });
  });

  // Validação e efeitos para input de peso do paciente
  const weightInput = document.getElementById('patient-weight');
  const errorDiv = document.getElementById('weight-error');
  let errorTimeout = null;

  const validateWeight = () => {
    const rawValue = weightInput.value;
    const num = parseInt(rawValue, 10);
    const isValid = !isNaN(num) && num >= 40 && num <= 300;
    // Aplica/remover estilo de inválido
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

  // Permite apenas dígitos no campo de peso
  weightInput.addEventListener('input', () => {
    weightInput.value = weightInput.value.replace(/[^0-9]/g, '');
    validateWeight();
  });
  // Ao perder foco, sanitiza valor dentro dos limites e valida
  weightInput.addEventListener('blur', () => {
    weightInput.value = sanitizeInteger(weightInput.value);
    validateWeight();
  });
  // Ao confirmar (Enter), aplica validação final e atualiza cards se válido
  weightInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      weightInput.blur();
      if (validateWeight()) {
        updateAllCardsOnWeightChange();
      }
    }
  });
  // Quando valor de peso muda (ex.: via scroll no input number), recalcula todos os cards
  weightInput.addEventListener('change', () => {
    updateAllCardsOnWeightChange();
  });
}

export function updateSliderAndUI(card, doseConfig, valorMedio, type) {
  const slider = card.querySelector(`.${type}-dose-slider`);
  const doseValueSpan = card.querySelector('.dose-value');
  const doseUnitSpan = card.querySelector('.dose-unit');
  const doseInfoSpan = card.querySelector('.dose-info');

  // Configura o slider conforme os limites do perfil de dose
  slider.min = doseConfig.min;
  slider.max = doseConfig.max;
  slider.step = doseConfig.step;
  slider.value = valorMedio;

  // Atualiza textos na UI com os valores atuais
  doseValueSpan.textContent = valorMedio.toFixed(2);
  doseUnitSpan.textContent = doseConfig.unit;
  doseInfoSpan.textContent = `(Faixa: ${parseFloat(doseConfig.min).toFixed(2)} - ${parseFloat(doseConfig.max).toFixed(2)} ${doseConfig.unit})`;
}

export function updateAllCardsOnWeightChange() {
  // Recalcula todos os cards quando o peso global é alterado
  document.querySelectorAll('.col-12[id^="card-"]').forEach(cardEl => {
    const cardId = cardEl.id;
    const content = document.getElementById(`${cardId}-content`);
    if (!content) return;

    if (content.querySelector('.bolus-med-select')) {
      // Card de bolus: recalcula dose com novo peso
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
        const valorMedio = calcularValorMedio(doseConfig.min, doseConfig.max);
        updateSliderAndUI(cardEl, doseConfig, valorMedio, 'bolus');
        calcularBolus(cardId);
      }
    } else if (content.querySelector('.infusion-med-select')) {
      // Card de infusão: recalcula dose com novo peso
      const medKey = content.querySelector('.infusion-med-select').value;
      const infData = medicationsDB[medKey]?.admtype?.infusion;
      if (infData) {
        const doseOptionId = content.querySelector('.infusion-dose-select')?.value;
        const doseConfig = doseOptionId
          ? infData.doseOptions.find(opt => opt.id === doseOptionId)
          : infData.dose;
        const valorMedio = calcularValorMedio(doseConfig.min, doseConfig.max);
        updateSliderAndUI(cardEl, doseConfig, valorMedio, 'infusion');
        calcularInfusion(cardId);
      }
    }
  });
}
