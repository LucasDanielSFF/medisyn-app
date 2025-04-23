// main.js

// Helpers
function getGlobalWeight() {
  return parseFloat(document.getElementById('patient-weight').value);
}
function calcularValorMedio(min, max) {
  return (parseFloat(min) + parseFloat(max)) / 2;
}

// UI creation functions
function createBolusUI(medKey = null) {
  if (medKey) {
    const med = medicationsDB[medKey]?.admtype?.bolus;
    if (!med || !med.dose) return '<div class="text-danger">Erro ao carregar medicação</div>';
    const valorMedio = calcularValorMedio(med.dose.min, med.dose.max);
    return `
      <div class="row">
        <div class="col-md-6"><div class="mb-3">
            <label class="form-label">Medicação</label>
            <select class="form-select bolus-med-select">
              ${Object.entries(medicationsDB).map(([key, m]) =>
                m.admtype?.bolus ? `<option value="${key}" ${key === medKey ? 'selected' : ''}>${m.name}</option>` : ''
              ).join('')}
            </select>
        </div></div>
        <div class="col-md-6"><div class="mb-3">
            <label class="form-label">Apresentação</label>
            <select class="form-select bolus-pres-select">
              ${med.presentations.map(p => `<option value="${p.value}">${p.label}</option>`).join('')}
            </select>
        </div></div>
      </div>
      <div class="mb-3">
        <label class="form-label">
          Dose: <span class="dose-value">${valorMedio.toFixed(2)}</span>
          <span class="dose-unit">${med.dose.unit}</span>
          <span class="dose-info">(Faixa: ${med.dose.min} - ${med.dose.max} ${med.dose.unit})</span>
        </label>
        <input type="range" class="form-range bolus-dose-slider" min="${med.dose.min}" max="${med.dose.max}" step="${med.dose.step}" value="${valorMedio}">
      </div>
      <div class="resultado-container">
        <p class="mb-0">Volume calculado: <span class="volume-result">0.00</span> mL</p>
      </div>
    `;
  } else {
    const firstKey = Object.keys(medicationsDB).find(k => medicationsDB[k].admtype?.bolus);
    return createBolusUI(firstKey);
  }
}

function createInfusionUI(medKey = null) {
  if (medKey) {
    const med = medicationsDB[medKey]?.admtype?.infusion;
    if (!med || !med.dose) return '<div class="text-danger">Erro ao carregar medicação</div>';
    const valorMedio = calcularValorMedio(med.dose.min, med.dose.max);
    return `
      <div class="row">
        <div class="col-md-6"><div class="mb-3">
            <label class="form-label">Medicação</label>
            <select class="form-select infusion-med-select">
              ${Object.entries(medicationsDB).map(([key, m]) =>
                m.admtype?.infusion ? `<option value="${key}" ${key === medKey ? 'selected' : ''}>${m.name}</option>` : ''
              ).join('')}
            </select>
        </div></div>
        <div class="col-md-6"><div class="mb-3">
            <label class="form-label">Diluição</label>
            <select class="form-select infusion-dilution-select">
              <option value="custom">Personalizada</option>
              ${med.diluicoes.map((d, i) => `<option value="${i}">${d.label}</option>`).join('')}
            </select>
        </div></div>
      </div>
      <div class="row g-3">
        <div class="col-md-4"><div class="mb-3">
            <label class="form-label">Medicamento (mL)</label>
            <input type="number" class="form-control infusion-med-volume" min="1" step="0.1" value="${med.diluicoes[0]?.medVolume || 10}">
        </div></div>
        <div class="col-md-4"><div class="mb-3">
            <label class="form-label">Concentração</label>
            <div class="input-group">
              <input type="number" class="form-control infusion-conc-value" value="${med.diluicoes[0]?.concValue || 50}" step="0.1">
              <select class="form-select infusion-conc-unit">
                <option value="mcg" ${med.diluicoes[0]?.concUnit === 'mcg' ? 'selected' : ''}>mcg/mL</option>
                <option value="mg" ${med.diluicoes[0]?.concUnit === 'mg' ? 'selected' : ''}>mg/mL</option>
                <option value="g" ${med.diluicoes[0]?.concUnit === 'g' ? 'selected' : ''}>g/mL</option>
              </select>
            </div>
        </div></div>
            <div class="col-md-4"><div class="mb-3">
            <label class="form-label">Solução (mL)</label>
              <input type="number" class="form-control infusion-sol-volume" min="1" step="0.1" value="${med.diluicoes[0]?.solVolume || 50}">
        </div></div>
      </div>
      <div class="mb-3">
        <label class="form-label">
          Dose: <span class="dose-value">${valorMedio.toFixed(2)}</span>
          <span class="dose-unit">${med.dose.unit}</span>
          <span class="dose-info">(Faixa: ${med.dose.min} - ${med.dose.max} ${med.dose.unit})</span>
        </label>
        <input type="range" class="form-range infusion-dose-slider" min="${med.dose.min}" max="${med.dose.max}" step="${med.dose.step}" value="${valorMedio}">
      </div>
      <div class="resultado-container">
        <p class="mb-0">Vazão calculada: <span class="flow-result">0.00</span> mL/h</p>
        <small class="dose-info">Concentração final: <span class="final-conc">0.00</span> µg/mL</small>
      </div>
    `;
  } else {
    const firstKey = Object.keys(medicationsDB).find(k => medicationsDB[k].admtype?.infusion);
    return createInfusionUI(firstKey);
  }
}

// Strategy pattern for cards
const cardStrategies = {
  bolus:    { createUI: createBolusUI,    init: initBolusCard,    calculate: calcularBolus    },
  infusion: { createUI: createInfusionUI, init: initInfusionCard, calculate: calcularInfusion }
};

// Update card content generically
function updateCardContent(cardId, type, medKey = null) {
  const strategy = cardStrategies[type];
  document.getElementById(`${cardId}-content`).innerHTML = strategy.createUI(medKey);
  strategy.init(cardId, medKey);
}

// Initialization for Bolus card
function initBolusCard(cardId, medKey = null) {
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

// Initialization for Infusion card
function initInfusionCard(cardId, medKey = null) {
  const card         = document.getElementById(cardId);
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

function carregarCardsAutomaticos(aba) {
  const containers = { infusion: 'infusion-container', bolus: 'bolus-container', universal: 'universal-container' };
  const container = containers[aba];
  removerTodosCards(container);
  configCardsPorAba[aba].forEach(medKey => {
    const cardId = `card-${Date.now()}-${Math.random()}`;
    // Monta o card com seleção de tipo apropriada para aba universal
    let tipoSelectAttr = aba === 'universal' ? '' : 'disabled';
    let selectedBolus = '';
    let selectedInfusion = '';
    if (aba === 'bolus') selectedBolus = 'selected';
    if (aba === 'infusion') selectedInfusion = 'selected';
    if (aba === 'universal') {
      const medData = medicationsDB[medKey]?.admtype;
      if (medData?.bolus && !medData?.infusion) {
        selectedBolus = 'selected';
      } else if (!medData?.bolus && medData?.infusion) {
        selectedInfusion = 'selected';
      } else {
        // Se a medicação tem ambos os tipos (ou nenhum, caso improvável), default para Bolus
        selectedBolus = 'selected';
      }
    }
    const cardHTML = `<div class="col-12" id="${cardId}">
      <div class="card-medicamento">
        <div class="d-flex align-items-center justify-content-start gap-2 mb-3">
          <button class="btn btn-danger btn-sm btn-remove-card" onclick="removeCard('${cardId}')">×</button>
          <select class="form-select tipo-medicamento w-auto" onchange="changeCardType('${cardId}', this.value)" ${tipoSelectAttr}>
            <option value="bolus" ${selectedBolus}>Bolus</option>
            <option value="infusion" ${selectedInfusion}>Infusão</option>
          </select>
        </div>
        <div id="${cardId}-content"></div>
      </div>
    </div>`;
    document.getElementById(container).insertAdjacentHTML('beforeend', cardHTML);
    if (aba === 'universal') {
      const medWrapper = medicationsDB[medKey];
      if (medWrapper?.admtype?.bolus && medWrapper?.admtype?.infusion) {
        updateCardContent(cardId, 'bolus', medKey);
      } else if (medWrapper?.admtype?.bolus) {
        updateCardContent(cardId, 'bolus', medKey);
      } else if (medWrapper?.admtype?.infusion) {
        updateCardContent(cardId, 'infusion', medKey);
      } else {
        updateCardContent(cardId, 'bolus', medKey);
      }
    } else {
      updateCardContent(cardId, aba, medKey);
    }
  });
}

function addCard(containerType = 'universal') {
  const map = {
    infusion: 'infusion-container',
    bolus: 'bolus-container',
    universal: 'universal-container'
  };
  const cardId = `card-${Date.now()}-${Math.random()}`;
  const initialType = containerType === 'infusion' ? 'infusion' : 'bolus';

  const cardHTML = `<div class="col-12" id="${cardId}">
    <div class="card-medicamento">
      <div class="d-flex align-items-center justify-content-start gap-2 mb-3">
        <button class="btn btn-danger btn-sm btn-remove-card" onclick="removeCard('${cardId}')">×</button>
        <select class="form-select tipo-medicamento w-auto" onchange="changeCardType('${cardId}', this.value)" ${containerType === 'universal' ? '' : 'disabled'}>
          <option value="bolus" ${initialType === 'bolus' ? 'selected' : ''}>Bolus</option>
          <option value="infusion" ${initialType === 'infusion' ? 'selected' : ''}>Infusão</option>
        </select>
      </div>
      <div id="${cardId}-content"></div>
    </div>
  </div>`;

  document.getElementById(map[containerType]).insertAdjacentHTML('beforeend', cardHTML);
  updateCardContent(cardId, initialType);
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
