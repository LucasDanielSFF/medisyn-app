// ==================================================
// ►►► Templates de UI
// ==================================================

import { calcularValorMedio } from './calculations.js';
import { medicationsDB } from '../../../data/medicationsDB.js';

export function createBolusUI(medKey, config = {}) {
  // Acessa os dados específicos do medicamento
  const med = medicationsDB[medKey]?.admtype?.bolus;
  
  // Fallback para erro de carregamento
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

  // Usa a dose específica se existir, senão usa a padrão
  const doseConfig = config.doseOptionId 
  ? med.doseOptions.find(opt => opt.id === config.doseOptionId)
  : med.dose;

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
    .map((p, i) => `<option value="${p.value}" ${i === presentationIndex ? 'selected' : ''}>${p.label}</option>`)
    .join('');

  return `
    ${(med.doseOptions && !config.isLocked) ? ` <!-- Só mostra se houver opções e não estiver bloqueado -->
      <div class="mb-3 ${config.isLocked ? 'd-none' : ''}"> <!-- d-none é classe do Bootstrap para esconder -->
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

export function createInfusionUI(medKey, config = {}) {
  const med = medicationsDB[medKey]?.admtype?.infusion;
  
  if (!med || !med.dose) {
    return '<div class="text-danger">Erro ao carregar medicação</div>';
  }

  // Obter dose configurada
  const doseConfig = config.doseOptionId 
    ? med.doseOptions?.find(opt => opt.id === config.doseOptionId)
    : med.dose;

  const valorMedio = calcularValorMedio(doseConfig.min, doseConfig.max);
  const primeiraDiluicao = med.diluicoes[0] || {};

  // Geração de opções de dose
  const doseOptionsHTML = med.doseOptions 
    ? med.doseOptions.map(opt => `
        <option value="${opt.id}" ${config.doseOptionId === opt.id ? 'selected' : ''}>
          ${opt.label}
        </option>
      `).join('')
    : '';

  return `
    ${(med.doseOptions && !config.isLocked) ? `
      <div class="mb-3 ${config.isLocked ? 'd-none' : ''}">
        <label class="form-label">Perfil de Dose</label>
        <select class="form-select infusion-dose-select">
          ${doseOptionsHTML}
        </select>
      </div>
    ` : ''}

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

    <div class="row g-3">
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
              <option value="mcg" ${primeiraDiluicao.concUnit === 'mcg' ? 'selected' : ''}>mcg/mL</option>
              <option value="mg" ${primeiraDiluicao.concUnit === 'mg' ? 'selected' : ''}>mg/mL</option>
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
        Concentração final: <span class="final-conc">0.00</span> µg/mL
      </small>
    </div>
  `;
}