import { calcularValorMedio } from './calculationsShared.js';
import { medicationsDB } from '../../../data/medicationsDB.js';

// ====================== HELPER FUNCTIONS ======================
const getMedOptions = (admType, currentKey) => 
  Object.entries(medicationsDB)
    .map(([key, med]) => med.admtype?.[admType] 
      ? `<option value="${key}" ${key === currentKey ? 'selected' : ''}>${med.name}</option>`
      : ''
    ).join('');

const getDoseOptionsHTML = (doseOptions, selectedId) =>
  doseOptions?.map(opt => `
    <option value="${opt.id}" ${selectedId === opt.id ? 'selected' : ''}>
      ${opt.label}
    </option>
  `).join('') || '';

const validateMedication = (med, dosePath) => {
  const admData = med?.admtype?.[dosePath];
  return admData?.dose ? admData : null;
};

const buildDoseSection = (doseConfig, valorMedio, cssClass) => `
  <label class="form-label">
    Dose: <span class="dose-value">${valorMedio.toFixed(2)}</span>
    <span class="dose-unit">${doseConfig.unit}</span>
    <span class="dose-info">(Faixa: ${doseConfig.min} - ${doseConfig.max} ${doseConfig.unit})</span>
  </label>
  <input type="range" 
         class="form-range ${cssClass}-dose-slider" 
         min="${doseConfig.min}" 
         max="${doseConfig.max}" 
         step="${doseConfig.step}" 
         value="${valorMedio}">
`;

// ====================== MAIN TEMPLATES ======================
export function createBolusUI(cardId, medKey, config = {}) {
  const med = validateMedication(medicationsDB[medKey], 'bolus');
  if (!med) return '<div class="text-danger">Erro ao carregar medicação</div>';

  const presentationIndex = config.presentationIndex || 0;
  const doseConfig = config.doseOptionId 
    ? med.doseOptions.find(opt => opt.id === config.doseOptionId) 
    : med.dose;

  const valorMedio = calcularValorMedio(doseConfig.min, doseConfig.max);

  return `
    ${med.doseOptions && !config.isLocked ? `
      <div class="mb-3">
        <label class="form-label">Perfil de Dose</label>
        <select class="form-select bolus-dose-select">
          ${getDoseOptionsHTML(med.doseOptions, config.doseOptionId)}
        </select>
      </div>
    ` : ''}

    <div class="row">
      <div class="col-md-6">
        <div class="mb-3">
          <label class="form-label">Medicação</label>
          <select class="form-select bolus-med-select">
            ${getMedOptions('bolus', medKey)}
          </select>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="mb-3">
          <label class="form-label">Apresentação</label>
          <select class="form-select bolus-pres-select">
            ${med.presentations.map((p, i) => `
              <option value="${p.value}" ${i === presentationIndex ? 'selected' : ''}>${p.label}</option>
            `).join('')}
          </select>
        </div>
      </div>
    </div>

    <div class="mb-3">
      ${buildDoseSection(doseConfig, valorMedio, 'bolus')}
    </div>

    <div class="resultado-container">
      <p class="mb-0">Volume calculado: 
        <span class="volume-result">0.00</span> mL
      </p>
    </div>
  `;
}

export function createInfusionUI(cardId, medKey, config = {}) {
  const med = validateMedication(medicationsDB[medKey], 'infusion');
  if (!med) return '<div class="text-danger">Erro ao carregar medicação</div>';

  const doseConfig = config.doseOptionId 
    ? med.doseOptions?.find(opt => opt.id === config.doseOptionId) 
    : med.dose;

  const diluicao = med.diluicoes[0] || {};
  const [massUnit, timeUnit] = doseConfig.unit.split('/');
  const valorMedio = calcularValorMedio(doseConfig.min, doseConfig.max);
  const canToggle = ['min', 'h'].includes(timeUnit);

  const unitControlsHTML = config.showUnitControls ? `
    <div class="row mb-3">
      <div class="col-3">
        <div class="mb-1">
          <label class="form-label">Unidade de Massa</label>
          <select class="form-select infusion-mass-unit">
            <option value="mcg" ${massUnit === 'mcg' ? 'selected' : ''}>mcg</option>
            <option value="mg" ${massUnit === 'mg' ? 'selected' : ''}>mg</option>
            <option value="g" ${massUnit === 'g' ? 'selected' : ''}>g</option>
          </select>
        </div>
      </div>
      ${canToggle ? `
      <div class="col-3">
        <label class="form-label">Unidade de Tempo</label>
        <select class="form-select infusion-time-unit">
          <option value="min" ${timeUnit === 'min' ? 'selected' : ''}>/min</option>
          <option value="h" ${timeUnit === 'h' ? 'selected' : ''}>/h</option>
        </select>
      </div>` : ''}
    </div>
  ` : '';

  return `
    <div class="row">
      <div class="col-md-6">
        <div class="mb-3">
          <label class="form-label">Medicação</label>
          <select class="form-select infusion-med-select">
            ${getMedOptions('infusion', medKey)}
          </select>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="mb-3 d-flex align-items-end gap-2">
          <div class="flex-grow-1">
            <label class="form-label">Diluição</label>
            <select class="form-select infusion-dilution-select">
              ${med.diluicoes.map((d, i) => `
                <option value="${i}">${d.label}</option>
              `).join('')}
            </select>
          </div>
          <button class="btn btn-accent btn-custom-dilution">
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
                 value="${diluicao.medVolume || 10}">
        </div>
      </div>
      <div class="col-md-4">
        <div class="mb-3">
          <label class="form-label">Concentração</label>
          <div class="input-group">
            <input type="number"
                   class="form-control infusion-conc-value"
                   value="${diluicao.concValue || 50}">
            <select class="form-select infusion-conc-unit">
              <option value="mcg/mL" ${diluicao.concUnit === 'mcg/mL' ? 'selected' : ''}>mcg/mL</option>
              <option value="mg/mL" ${diluicao.concUnit === 'mg/mL' ? 'selected' : ''}>mg/mL</option>
              <option value="g/mL" ${diluicao.concUnit === 'g/mL' ? 'selected' : ''}>g/mL</option>
            </select>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="mb-3">
          <label class="form-label">Solução (mL)</label>
          <input type="number"
                 class="form-control infusion-sol-volume"
                 value="${diluicao.solVolume || 50}">
        </div>
      </div>
    </div>

    ${unitControlsHTML}

    ${med.doseOptions && !config.isLocked ? `
      <div class="mb-3">
        <label class="form-label">Perfil de Dose</label>
        <select class="form-select infusion-dose-select">
          ${getDoseOptionsHTML(med.doseOptions, config.doseOptionId)}
        </select>
      </div>
    ` : ''}

    ${config.showUnitControls ? `
    <div class="unit-controls bg-light p-3 rounded mb-3">
      <h6 class="mb-3">Conversão de Unidades</h6>
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Unidade Base Original</label>
          <div class="form-control-plaintext">
            ${baseUnit}/${originalTimePart}
          </div>
        </div>
        
        <div class="col-md-4">
          <label class="form-label">Nova Unidade de Massa</label>
          <select class="form-select infusion-mass-unit">
            <option value="mcg" ${massUnit === 'mcg' ? 'selected' : ''}>mcg</option>
            <option value="mg" ${massUnit === 'mg' ? 'selected' : ''}>mg</option>
            <option value="g" ${massUnit === 'g' ? 'selected' : ''}>g</option>
          </select>
        </div>

        ${canToggle ? `
        <div class="col-md-4">
          <label class="form-label">Nova Unidade de Tempo</label>
          <select class="form-select infusion-time-unit">
            <option value="min" ${timeUnit === 'min' ? 'selected' : ''}>minuto</option>
            <option value="h" ${timeUnit === 'h' ? 'selected' : ''}>hora</option>
          </select>
        </div>` : ''}
      </div>
      
      <small class="text-muted mt-2 d-block">
        A conversão mantém equivalência terapêutica automática
      </small>
    </div>
    ` : ''}


    <div class="mb-3 dose-section">
      ${buildDoseSection(doseConfig, valorMedio, 'infusion')}
    </div>

    <div class="resultado-container">
      <p class="mb-0">Vazão calculada: 
        <span class="flow-result">0.00</span> mL/h
      </p>
      <small class="dose-info">
        Concentração final: <span class="final-conc">0.00</span>
      </small>
    </div>

    <button class="btn btn-toggle-reverse btn-sm mt-2">▼ Cálculo Reverso</button>

    <div class="reverse-calculation mt-4 hidden">
      <div class="row">
        <div class="col-md-4">
          <div class="mb-3">
            <label class="form-label">Vazão (mL/h)</label>
            <input type="number" class="form-control reverse-flow-input">
          </div>
        </div>
      </div>
      <p class="resultado-container">
        Dose calculada: 
        <span class="reverse-dose-result">0.00</span> 
        <span class="dose-unit">${doseConfig.unit}</span>
        <span class="dose-info-reverse">(Faixa: ${doseConfig.min} - ${doseConfig.max} ${doseConfig.unit})</span>
      </p>
    </div>
  `;
}