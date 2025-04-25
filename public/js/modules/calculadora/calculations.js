// ==================================================
// ►►► Cálculos e Conversões
// ==================================================

import { medicationsDB } from '../../../data/medicationsDB.js';
import { getGlobalWeight } from './cardManager.js';

export function calcularValorMedio(min, max) {
  return (parseFloat(min) + parseFloat(max)) / 2;
}

export function convertToMcg(value, unit) { 
  switch(unit) { 
    case 'mg': return value * 1000; 
    case 'g':  return value * 1000000; 
    default:   return value; 
  }
}

export function calcularBolus(cardId) {
  const card = document.getElementById(cardId);
  const weight = getGlobalWeight();
  const medKey = card.querySelector('.bolus-med-select').value;
  const med = medicationsDB[medKey];
  
  const doseConfig = med.doseOptions && card.querySelector('.bolus-dose-select')?.value
    ? med.doseOptions.find(opt => opt.id === card.querySelector('.bolus-dose-select').value)
    : med.dose;
    
const dose = parseFloat(card.querySelector('.bolus-dose-slider').value);
  const concentracao = parseFloat(card.querySelector('.bolus-pres-select').value);
  const doseTotal = dose * weight;
  const volume = doseTotal / concentracao;
  card.querySelector('.volume-result').textContent = volume.toFixed(2);
  card.querySelector('.dose-value').textContent = dose.toFixed(2);
}

export function calcularInfusion(cardId, doseOverride = null) {
  const card = document.getElementById(cardId);
  if (!card) return;

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