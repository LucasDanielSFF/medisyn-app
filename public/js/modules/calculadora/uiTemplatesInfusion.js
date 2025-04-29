import { calcularValorMedio } from './calculationsShared.js';
import { medicationsDB } from '../../../data/medicationsDB.js';

export function createInfusionUI(cardId, medKey, config = {}) {
  const med = medicationsDB[medKey]?.admtype?.infusion;
  if (!med || !med.dose) {
    return '<div class="text-danger">Erro ao carregar medicação</div>';
  }

const doseConfig = config.doseOptionId 
  ? med.doseOptions?.find(opt => opt.id === config.doseOptionId)
  : med.dose;

const unitParts = doseConfig.unit.split('/');
const timePart = unitParts.pop();

const showUnitControls = config.showUnitControls;
const canToggle = ['min', 'h'].includes(timePart);

const unitControlsHTML = showUnitControls ? `
  <div class="row mb-3">
    <div class="col-3">
      <div class="mb-1">
        <label class="form-label">Unidade de Massa</label>
        <select class="form-select infusion-mass-unit">
          <option value="mcg" ${unitParts[0] === 'mcg' ? 'selected' : ''}>mcg</option>
          <option value="mg" ${unitParts[0] === 'mg' ? 'selected' : ''}>mg</option>
          <option value="g" ${unitParts[0] === 'g' ? 'selected' : ''}>g</option>
        </select>
      </div>
    </div>
    ${canToggle ? `
    <div class="col-3">
        <label class="form-label">Unidade de Tempo</label>
        <select class="form-select infusion-time-unit">
          <option value="min" ${timePart === 'min' ? 'selected' : ''}>/min</option>
          <option value="h" ${timePart === 'h' ? 'selected' : ''}>/h</option>
        </select>
        </div>
      </div>
    </div>` : ''}
  </div>
` : '';

const valorMedio = calcularValorMedio(doseConfig.min, doseConfig.max);
const primeiraDiluicao = med.diluicoes[0] || {};

const doseOptionsHTML = med.doseOptions 
  ? med.doseOptions.map(opt => `
      <option value="${opt.id}" ${config.doseOptionId === opt.id ? 'selected' : ''}>
        ${opt.label}
      </option>
    `).join('')
  : '';

return `
  <div class="row">
    <div class="col-md-6">
      <div class="mb-3">
        <label class="form-label">Medicação</label>
        <select class="form-select infusion-med-select">
          ${Object.entries(medicationsDB)
            .map(([key, m]) => m.admtype?.infusion 
              ? `<option value="${key}" ${key === medKey ? 'selected' : ''}>${m.name}</option>`
              : '')
            .join('')}
        </select>
      </div>
    </div>
    
    <div class="col-md-6">
      <div class="mb-3 d-flex align-items-end gap-2">
        <div class="flex-grow-1">
          <label class="form-label">Diluição</label>
          <select class="form-select infusion-dilution-select">
            ${med.diluicoes
              .map((d, i) => `<option value="${i}">${d.label}</option>`)
              .join('')}
          </select>
        </div>
        <button class="btn btn-accent btn-custom-dilution d-flex align-items-center gap-2" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <div class="row g-2">
    <div class="col-md-4">
      <div class="mb-3">
        <label class="form-label">Medicamento (mL)</label>
        <input type="number" 
                class="form-control infusion-med-volume" 
                value="${primeiraDiluicao.medVolume || 10}">
      </div>
    </div>
    <div class="col-md-4">
      <div class="mb-3">
        <label class="form-label">Concentração</label>
        <div class="input-group">
          <input type="number"
                class="form-control infusion-conc-value"
                value="${primeiraDiluicao.concValue || 50}">
          <select class="form-select infusion-conc-unit">
          <option value="mcg/mL" ${primeiraDiluicao.concUnit === 'mcg/mL' ? 'selected' : ''}>mcg/mL</option>
          <option value="mg/mL" ${primeiraDiluicao.concUnit === 'mg/mL' ? 'selected' : ''}>mg/mL</option>
          <option value="g/mL" ${primeiraDiluicao.concUnit === 'g/mL' ? 'selected' : ''}>g/mL</option>
        </select>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="mb-3">
        <label class="form-label">Solução (mL)</label>
        <input type="number"
                class="form-control infusion-sol-volume"
                value="${primeiraDiluicao.solVolume || 50}">
      </div>
    </div>
  </div>

  ${unitControlsHTML}
  ${(med.doseOptions && !config.isLocked) ? `
    <div class="mb-3 ${config.isLocked ? 'd-none' : ''}">
      <label class="form-label">Perfil de Dose</label>
      <select class="form-select infusion-dose-select">
        ${doseOptionsHTML}
      </select>
    </div>
  ` : ''}

  <div class="mb-3">
    <label class="form-label">
      Dose: <span class="dose-value">${valorMedio.toFixed(2)}</span>
      <span class="dose-unit">${doseConfig.unit}</span>
      <span class="dose-info">(Faixa: ${doseConfig.min} - ${doseConfig.max} ${doseConfig.unit})</span>
    </label>
    <input type="range"
            class="form-range infusion-dose-slider"
            min="${doseConfig.min}"
            max="${doseConfig.max}"
            step="${doseConfig.step}"
            value="${valorMedio}">
  </div>

  <div class="resultado-container">
    <p class="mb-0">Vazão calculada: 
      <span class="flow-result">0.00</span> mL/h
    </p>
    <small class="dose-info">
      Concentração final: <span class="final-conc">0.00</span>
    </small>
  </div>

  <div class="reverse-calculation mt-4">
    <h6>Cálculo Reverso</h6>
    <div class="row">
      <div class="col-md-4">
        <div class="mb-3">
          <label class="form-label">Vazão (mL/h)</label>
          <input type="number" class="form-control reverse-flow-input">
        </div>
      </div>
      <div class="col-md-8 d-flex align-items-end">
      </div>
    </div>
    <p class="resultado-container">
      Dose calculada: 
      <span class="reverse-dose-result">0.00</span> 
      <span class="dose-unit">${doseConfig.unit}</span>
    </p>
  </div>
`;
}