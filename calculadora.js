// calculadora.js

// ==================================================
// ►►► Helpers & Funções de Cálculo
// ==================================================

/*
 * Obtém o peso global do paciente selecionado
 * @returns {number} Peso em kg
 */
function getGlobalWeight() {
  return parseFloat(document.getElementById('patient-weight').value);
}
/**
 * Calcula o valor médio entre dois números
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Média aritmética
 */
function calcularValorMedio(min, max) {
  return (parseFloat(min) + parseFloat(max)) / 2;
}

// Configuração de abas, se os cards serão removíveis ou não
const configAba = {
  sri: {
    addButton: false, // Não mostra o botão de adicionar
    removable: false // Cards não podem ser removidos
  },
  infusion: {
    addButton: false, // Não mostra o botão de adicionar
    removable: false // Cards não podem ser removidos
  },
  bolus: {
    addButton: false, // Não mostra o botão de adicionar
    removable: false // Cards não podem ser removidos
  },
  universal: {
    addButton: true,
    removable: true
  }
}

/**
 * Cria a interface completa para medicação em Bolus
 * @param {string} medKey - Chave do medicamento no banco de dados (medicationsDB)
 * @returns {string} HTML do card pronto para renderização
 */
function createBolusUI(medKey) {
  // Acessa os dados específicos do medicamento
  const med = medicationsDB[medKey]?.admtype?.bolus;
  
  // Fallback para erro de carregamento
  if (!med || !med.dose) {
    return '<div class="text-danger">Erro ao carregar medicação</div>';
  }

  // Calcula valores iniciais
  const valorMedio = calcularValorMedio(med.dose.min, med.dose.max);
  
  // Gera dinamicamente as opções de medicamentos
  const optionsMedicacoes = Object.entries(medicationsDB)
    .map(([key, m]) => m.admtype?.bolus 
      ? `<option value="${key}" ${key === medKey ? 'selected' : ''}>${m.name}</option>`
      : ''
    ).join('');

  // Gera dinamicamente as opções de apresentação
  const optionsApresentacoes = med.presentations
    .map(p => `<option value="${p.value}">${p.label}</option>`)
    .join('');

  return `
    <div class="row">
      <div class="col-md-6">
        <div class="mb-3">
          <label class="form-label">Medicação</label>
          <select class="form-select bolus-med-select">
            ${optionsMedicacoes}
          </select>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="mb-3">
          <label class="form-label">Apresentação</label>
          <select class="form-select bolus-pres-select">
            ${optionsApresentacoes}
          </select>
        </div>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label">
        Dose: <span class="dose-value">${valorMedio.toFixed(2)}</span>
        <span class="dose-unit">${med.dose.unit}</span>
        <span class="dose-info">(Faixa: ${med.dose.min} - ${med.dose.max} ${med.dose.unit})</span>
      </label>
      <input type="range" 
             class="form-range bolus-dose-slider" 
             min="${med.dose.min}" 
             max="${med.dose.max}" 
             step="${med.dose.step}" 
             value="${valorMedio}">
    </div>

    <div class="resultado-container">
      <p class="mb-0">Volume calculado: 
        <span class="volume-result">0.00</span> mL
      </p>
    </div>
  `;
}

/**
 * Cria a interface completa para infusão contínua de medicamentos
 * @param {string} medKey - Chave do medicamento no banco de dados (medicationsDB)
 * @returns {string} HTML do card pronto para renderização
 */
function createInfusionUI(medKey) {
  // Acessa os dados específicos do medicamento
  const med = medicationsDB[medKey]?.admtype?.infusion;
  
  // Fallback para erro de carregamento
  if (!med || !med.dose) {
    return '<div class="text-danger">Erro ao carregar medicação</div>';
  }

  // Valores padrão seguros
  const primeiraDiluicao = med.diluicoes[0] || {};
  const valorMedio = calcularValorMedio(med.dose.min, med.dose.max);

  // Gera dinamicamente as opções de medicamentos
  const optionsMedicacoes = Object.entries(medicationsDB)
    .map(([key, m]) => m.admtype?.infusion 
      ? `<option value="${key}" ${key === medKey ? 'selected' : ''}>${m.name}</option>`
      : ''
    ).join('');

  // Gera dinamicamente as opções de diluição
  const optionsDiluição = med.diluicoes
    .map((d, i) => `<option value="${i}">${d.label}</option>`)
    .join('');

  return `
    <div class="row">
      <div class="col-md-6">
        <div class="mb-3">
          <label class="form-label">Medicação</label>
          <select class="form-select infusion-med-select">
            ${optionsMedicacoes}
          </select>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="mb-3">
          <label class="form-label">Diluição</label>
          <select class="form-select infusion-dilution-select">
            <option value="custom">Personalizada</option>
            ${optionsDiluição}
          </select>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <!-- Grupo de inputs de diluição -->
      <div class="col-md-4">
        <div class="mb-3">
          <label class="form-label">Medicamento (mL)</label>
          <input type="number" 
                 class="form-control infusion-med-volume" 
                 min="1" 
                 step="0.1" 
                 value="${primeiraDiluicao.medVolume || 10}">
        </div>
      </div>

      <div class="col-md-4">
        <div class="mb-3">
          <label class="form-label">Concentração</label>
          <div class="input-group">
            <input type="number" 
                   class="form-control infusion-conc-value" 
                   value="${primeiraDiluicao.concValue || 50}" 
                   step="0.1">
            <select class="form-select infusion-conc-unit">
              <option value="mcg" ${primeiraDiluicao.concUnit === 'mcg' ? 'selected' : ''}>mcg/mL</option>
              <option value="mg" ${primeiraDiluicao.concUnit === 'mg' ? 'selected' : ''}>mg/mL</option>
              <option value="g" ${primeiraDiluicao.concUnit === 'g' ? 'selected' : ''}>g/mL</option>
            </select>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="mb-3">
          <label class="form-label">Solução (mL)</label>
          <input type="number" 
                 class="form-control infusion-sol-volume" 
                 min="1" 
                 step="0.1" 
                 value="${primeiraDiluicao.solVolume || 50}">
        </div>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label">
        Dose: <span class="dose-value">${valorMedio.toFixed(2)}</span>
        <span class="dose-unit">${med.dose.unit}</span>
        <span class="dose-info">(Faixa: ${med.dose.min} - ${med.dose.max} ${med.dose.unit})</span>
      </label>
      <input type="range" 
             class="form-range infusion-dose-slider" 
             min="${med.dose.min}" 
             max="${med.dose.max}" 
             step="${med.dose.step}" 
             value="${valorMedio}">
    </div>

    <div class="resultado-container">
      <p class="mb-0">Vazão calculada: 
        <span class="flow-result">0.00</span> mL/h
      </p>
      <small class="dose-info">
        Concentração final: <span class="final-conc">0.00</span> µg/mL
      </small>
    </div>
  `;
}

// ==================================================
// ►►► Estratégias e Gerenciamento de Cards
// ==================================================

/**
 * Estratégias para cada tipo de card
 */
const cardStrategies = {
  bolus: {
    createUI: createBolusUI,
    init: initBolusCard,
    calculate: calcularBolus
  },
  infusion: {
    createUI: createInfusionUI,
    init: initInfusionCard,
    calculate: calcularInfusion
  }
};

/**
 * Atualiza o conteúdo de um card existente
 * @param {string} cardId - ID do container do card
 * @param {string} type - Tipo de card ('bolus' ou 'infusion')
 * @param {string} medKey - Chave do medicamento no DB
 */
function updateCardContent(cardId, type, medKey) {
  const strategy = cardStrategies[type];
  document.getElementById(`${cardId}-content`).innerHTML = strategy.createUI(medKey);
  strategy.init(cardId, medKey);
}

// ==================================================
// ►►► Inicialização de Cards
// ==================================================

/**
 * Inicializa um card do tipo Bolus
 * @param {string} cardId - ID do card
 * @param {string} medKey - Chave do medicamento
 */
function initBolusCard(cardId, medKey) {
  const card = document.getElementById(cardId);
  const selectMed = card.querySelector('.bolus-med-select');
  const medWrapper = medicationsDB[selectMed.value];
  const med       = medWrapper?.admtype?.bolus;
  if (!med || !med.dose) return;
  const slider    = card.querySelector('.bolus-dose-slider');
  const valorMedio= calcularValorMedio(med.dose.min, med.dose.max);

  slider.min   = med.dose.min;
  slider.max   = med.dose.max;
  slider.step  = med.dose.step;
  slider.value = valorMedio;

  card.querySelector('.dose-value').textContent = valorMedio.toFixed(2);
  card.querySelector('.dose-unit').textContent  = med.dose.unit;
  card.querySelector('.dose-info').textContent  = `(Faixa: ${med.dose.min} - ${med.dose.max} ${med.dose.unit})`;
  card.querySelector('.bolus-pres-select').value = med.presentations[0].value;

  // Atualiza o card ao trocar medicação (passando medKey selecionada)
  selectMed.addEventListener('change', function() {
    updateCardContent(cardId, 'bolus', this.value);
  });
  card.querySelectorAll('.bolus-dose-slider, .bolus-pres-select')
      .forEach(el => el.addEventListener('input', () => calcularBolus(cardId)));

  calcularBolus(cardId);
}

/**
 * Inicializa um card do tipo Infusão
 * @param {string} cardId - ID do card
 * @param {string} medKey - Chave do medicamento
 */
function initInfusionCard(cardId, medKey) {
  const card = document.getElementById(cardId);
  const selectMedInf = card.querySelector('.infusion-med-select');
  const medWrapper   = medicationsDB[selectMedInf.value];
  const med          = medWrapper?.admtype?.infusion;
  if (!med || !med.dose) return;
  const sliderInf    = card.querySelector('.infusion-dose-slider');
  const valorMedio   = calcularValorMedio(med.dose.min, med.dose.max);

  function updateDilutions() {
    const dilSelect = card.querySelector('.infusion-dilution-select');
    const dils = med.diluicoes || [];
  
    if (dilSelect.value !== 'custom') {
      const index = parseInt(dilSelect.value);
      const d = dils[index];
      card.querySelector('.infusion-med-volume').value = d.medVolume;
      card.querySelector('.infusion-sol-volume').value = d.solVolume;
      card.querySelector('.infusion-conc-value').value = d.concValue;
      card.querySelector('.infusion-conc-unit').value = d.concUnit;
    }
  
    sliderInf.min = med.dose.min;
    sliderInf.max = med.dose.max;
    sliderInf.step = med.dose.step;
    sliderInf.value = valorMedio;
  
    card.querySelector('.dose-value').textContent = valorMedio.toFixed(2);
    card.querySelector('.dose-unit').textContent = med.dose.unit;
  
    calcularInfusion(cardId); // Adiciona recálculo ao trocar diluição
  }

  updateDilutions();
  // Atualiza o card ao trocar medicação (passando medKey selecionada)
  selectMedInf.addEventListener('change', function() {
    updateCardContent(cardId, 'infusion', this.value);
  });
  card.querySelector('.infusion-dilution-select')
      .addEventListener('change', updateDilutions);
  card.querySelectorAll(
    '.infusion-dose-slider, .infusion-med-volume, .infusion-sol-volume, .infusion-conc-value, .infusion-conc-unit'
  ).forEach(el => el.addEventListener('input', () => calcularInfusion(cardId)));

  calcularInfusion(cardId);
}

// Calculation and utility functions
function calcularBolus(cardId) {
  const card = document.getElementById(cardId);
  const weight = getGlobalWeight();
  const medKey = card.querySelector('.bolus-med-select').value;
  const med = medicationsDB[medKey];
  const dose = parseFloat(card.querySelector('.bolus-dose-slider').value);
  const concentracao = parseFloat(card.querySelector('.bolus-pres-select').value);
  const doseTotal = dose * weight;
  const volume = doseTotal / concentracao;
  card.querySelector('.volume-result').textContent = volume.toFixed(2);
  card.querySelector('.dose-value').textContent = dose.toFixed(2);
}
function convertToMcg(value, unit) { 
  switch(unit) { 
    case 'mg': return value * 1000; 
    case 'g':  return value * 1000000; 
    default:   return value; 
  }
}
function calcularInfusion(cardId, doseOverride = null) {
  const card = document.getElementById(cardId);
  if (!card) return;  // ← ESSENCIAL

  const weight = getGlobalWeight();

  const medSelect = card.querySelector('.infusion-med-select');
  const doseSlider = card.querySelector('.infusion-dose-slider');
  const medVolumeInput = card.querySelector('.infusion-med-volume');
  const solVolumeInput = card.querySelector('.infusion-sol-volume');
  const concValueInput = card.querySelector('.infusion-conc-value');
  const concUnitSelect = card.querySelector('.infusion-conc-unit');

  // Se qualquer parte do DOM de infusão estiver ausente, interrompe
  if (!medSelect || !doseSlider || !medVolumeInput || !solVolumeInput || !concValueInput || !concUnitSelect) return;

  const medKey = medSelect.value;
  const med = medicationsDB[medKey];
  const dose = doseOverride ?? parseFloat(doseSlider.value);
  const medVolume = parseFloat(medVolumeInput.value);
  const solVolume = parseFloat(solVolumeInput.value);
  const concValue = parseFloat(concValueInput.value);
  const concUnit = concUnitSelect.value;
  const totalVolume = medVolume + solVolume;
  const concMcg = convertToMcg(concValue, concUnit);
  const totalDrug = medVolume * concMcg;
  const finalConcentration = totalDrug / totalVolume;
  const flowRate = (dose * weight) / finalConcentration;

  const flowEl = card.querySelector('.flow-result');
  flowEl.textContent = flowRate.toFixed(2);
  flowEl.style.display = 'none';
  flowEl.offsetHeight;
  flowEl.style.display = '';
  card.querySelector('.final-conc').textContent = finalConcentration.toFixed(2);
  card.querySelector('.dose-value').textContent = dose.toFixed(2);
}
function removeCard(cardId) { 
  document.getElementById(cardId).remove(); 
}
function toggleModoClaro() { 
  document.body.classList.toggle('modo-claro'); 
}

// Card management
function removerTodosCards(containerId) {
  const container = document.getElementById(containerId);
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

// ==================================================
// ►►► Gerenciamento de Containers
// ==================================================

/**
 * Carrega cards pré-configurados para uma aba específica
 * @param {string} aba - Nome da aba ('sri', 'infusion', etc)
 */
function carregarCardsAutomaticos(aba) {
  const containers = { 
    sri: 'sri-container',
    infusion: 'infusion-container', 
    bolus: 'bolus-container', 
    universal: 'universal-container'
  };
 
  const container = containers[aba];
  removerTodosCards(container);

  const allowRemove = configAba[aba]?.removable; // Define se os cards da aba são removíveis ou não

  // Ocultar/mostrar botão de adicionar conforme configuração
  const addButton = document.querySelector(`button[data-bs-target="#${aba}"] + .medicamento-header .btn`);
  if (addButton) addButton.style.display = configAba[aba]?.addButton ? '' : 'none';

  configCardsPorAba[aba].forEach(medConfig => {
    const cardId = `card-${Date.now()}-${Math.random()}`;

    const cardHTML = `
      <div class="col-12" id="${cardId}">
        <div class="card-medicamento">
          ${allowRemove ? `
            <div class="d-flex align-items-center justify-content-start gap-2 mb-3">
              <button class="btn btn-danger btn-sm btn-remove-card" onclick="removeCard('${cardId}')">×</button>
            </div>` : ''
          }
          <div id="${cardId}-content"></div>
        </div>
      </div>`;

      const tabPane = document.getElementById(aba);
        if (tabPane) {
          const addButton = tabPane.querySelector('.medicamento-header .btn');
          if (addButton) {
            addButton.style.display = configAba[aba]?.addButton ? '' : 'none';
          }
        }

    document.getElementById(container).insertAdjacentHTML('beforeend', cardHTML);
    updateCardContent(cardId, medConfig.type, medConfig.key);
  });
}

function addCard(containerType = 'universal') {
  if (!configAba[containerType]?.addButton) return; // Impede adição se não permitido
  const map = {
    infusion: 'infusion-container',
    bolus: 'bolus-container',
    universal: 'universal-container'
  };
  const cardId = `card-${Date.now()}-${Math.random()}`;
  const initialType = containerType === 'infusion' ? 'infusion' : 'bolus';

  // Encontrar a primeira medicação válida para o tipo
  const initialMedKey = Object.keys(medicationsDB).find(key => 
    medicationsDB[key]?.admtype?.[initialType]
  );

  const cardHTML = `<div class="col-12" id="${cardId}">
  <div class="card-medicamento">
    ${configAba[containerType]?.removable ? `
      <div class="d-flex align-items-center justify-content-start gap-2 mb-3">
        <button class="btn btn-danger btn-sm btn-remove-card" onclick="removeCard('${cardId}')">×</button>
        <select class="form-select tipo-medicamento w-auto" onchange="changeCardType('${cardId}', this.value)">
          <option value="bolus" ${initialType === 'bolus' ? 'selected' : ''}>Bolus</option>
          <option value="infusion" ${initialType === 'infusion' ? 'selected' : ''}>Infusão</option>
        </select>
      </div>` : ''
    }
    <div id="${cardId}-content"></div>
  </div>
</div>`;

  document.getElementById(map[containerType]).insertAdjacentHTML('beforeend', cardHTML);
  
  // Passar a chave válida como terceiro parâmetro
  updateCardContent(cardId, initialType, initialMedKey || ''); // Forçar passagem de chave válida
}

function changeCardType(cardId, newType) {
  updateCardContent(cardId, newType);
}

window.addEventListener('DOMContentLoaded', () => {
  // Carrega automaticamente os cards da aba ativa (infusão) e configura eventos de troca de aba
  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', e => {
      const target = e.target.getAttribute('data-bs-target').replace('#', '');
      carregarCardsAutomaticos(target);
    });
  });

  document.getElementById('patient-weight').addEventListener('change', () => {
    document.querySelectorAll('.col-12[id^="card-"]').forEach(cardEl => {
      const id = cardEl.id;
      try {
        const content = document.getElementById(`${id}-content`); // ← Correção chave
        if (!content) return;
  
        const isBolus = !!content.querySelector('.bolus-med-select');
        const isInfusion = !!content.querySelector('.infusion-med-select');
  
        if (isBolus) {
          const medKey = content.querySelector('.bolus-med-select')?.value;
          const med = medicationsDB[medKey]?.admtype?.bolus;
          if (med) {
            const slider = content.querySelector('.bolus-dose-slider');
            const valorMedio = calcularValorMedio(med.dose.min, med.dose.max);
            slider.value = valorMedio;
            content.querySelector('.dose-value').textContent = valorMedio.toFixed(2);
            calcularBolus(id);
          }
        } else if (isInfusion) {
          const medKey = content.querySelector('.infusion-med-select')?.value;
          const med = medicationsDB[medKey]?.admtype?.infusion;
          if (med) {
            const slider = content.querySelector('.infusion-dose-slider');
            const valorMedio = calcularValorMedio(med.dose.min, med.dose.max);
            slider.value = valorMedio;
            content.querySelector('.dose-value').textContent = valorMedio.toFixed(2);
            calcularInfusion(id, valorMedio);
          }
          calcularInfusion(id);
        }
      } catch (e) {
        console.warn(`Erro ao recalcular o card ${id}:`, e);
      }
    });
  });

  // Carrega inicialmente a aba Infusão com seus cards padrão
  carregarCardsAutomaticos('infusion');
});
