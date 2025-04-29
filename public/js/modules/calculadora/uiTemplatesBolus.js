import { calcularValorMedio } from './calculationsShared.js';
import { medicationsDB } from '../../../data/medicationsDB.js';

export function createBolusUI(cardId, medKey, config = {}) {
  const med = medicationsDB[medKey]?.admtype?.bolus;
  
  if (!med || !med.dose) {
    return '<div class="text-danger">Erro ao carregar medicação</div>';
  }

  const presentationIndex = (typeof config === 'object' && config.presentationIndex !== undefined) 
  ? config.presentationIndex 
  : 0;

  const doseOptionsHTML = med.doseOptions 
  ? med.doseOptions.map(opt => `
      <option value="${opt.id}" ${config.doseOptionId === opt.id ? 'selected' : ''}>
        ${opt.label}
      </option>
    `).join('')
  : '';

  const doseConfig = config.doseOptionId 
  ? med.doseOptions.find(opt => opt.id === config.doseOptionId)
  : med.dose;

  const valorMedio = calcularValorMedio(med.dose.min, med.dose.max);

  const optionsMedicacoes = Object.entries(medicationsDB)
    .map(([key, m]) => m.admtype?.bolus 
      ? `<option value="${key}" ${key === medKey ? 'selected' : ''}>${m.name}</option>`
      : ''
    ).join('');

  const optionsApresentacoes = med.presentations
    .map((p, i) => `<option value="${p.value}" ${i === presentationIndex ? 'selected' : ''}>${p.label}</option>`)
    .join('');

  return `
    ${(med.doseOptions && !config.isLocked) ? `
      <div class="mb-3 ${config.isLocked ? 'd-none' : ''}">
        <label class="form-label">Perfil de Dose</label>
        <select class="form-select bolus-dose-select">
          ${doseOptionsHTML}
        </select>
      </div>
    ` : ''}

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
        <span class="dose-unit">${doseConfig.unit}</span>
<span class="dose-info">(Faixa: ${doseConfig.min} - ${doseConfig.max} ${doseConfig.unit})</span>
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