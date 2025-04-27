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
  
  // Access the bolus-specific configuration
  const bolusConfig = med.admtype.bolus;

  // Get doseConfig from bolusConfig
  const doseConfig = bolusConfig.doseOptions && card.querySelector('.bolus-dose-select')?.value
    ? bolusConfig.doseOptions.find(opt => opt.id === card.querySelector('.bolus-dose-select').value)
    : bolusConfig.dose;

  const dose = parseFloat(card.querySelector('.bolus-dose-slider').value);
  const concentracao = parseFloat(card.querySelector('.bolus-pres-select').value);
  const doseTotal = dose * weight;

  // Calcular dose total com conversão condicional
  let doseTotalMcg;

  if (doseConfig.unit === 'mg/kg') {
    doseTotalMcg = dose * weight * 1000; // mg → mcg
  } else if (doseConfig.unit === 'g/kg') {
    doseTotalMcg = dose * weight * 1000000; // g → mcg
  } else {
    doseTotalMcg = dose * weight; // Já está em mcg/kg
  }

  const volume = doseTotalMcg / concentracao;

  // Atualizar UI
  card.querySelector('.volume-result').textContent = volume.toFixed(2);
  card.querySelector('.dose-value').textContent = dose.toFixed(2);
}

export function calcularInfusion(cardId, doseOverride = null) {
  const card = document.getElementById(cardId);

  const weight = getGlobalWeight();

  const medSelect = card.querySelector('.infusion-med-select');
  const doseSlider = card.querySelector('.infusion-dose-slider');
  const medVolumeInput = card.querySelector('.infusion-med-volume');
  const solVolumeInput = card.querySelector('.infusion-sol-volume');
  const concValueInput = card.querySelector('.infusion-conc-value');
  const concUnitSelect = card.querySelector('.infusion-conc-unit');

  // Se qualquer parte do DOM de infusão estiver ausente, interrompe
  if (!medSelect || !doseSlider || !medVolumeInput || !solVolumeInput || !concValueInput || !concUnitSelect) return;

  // Obter unidade de tempo selecionada
  const timeUnitSelect = card.querySelector('.infusion-time-unit');
  const timeUnit = timeUnitSelect ? timeUnitSelect.value : 'h';
  const originalUnit = med.admtype.infusion.dose.unit;

  const dose = doseOverride ?? parseFloat(doseSlider.value);

  // Ajustar dose conforme a unidade
  if (originalUnit.endsWith('/min') && timeUnit === 'h') {
    dose *= 60; // Converte de/min para/h
  } else if (originalUnit.endsWith('/h') && timeUnit === 'min') {
    dose /= 60; // Converte de/h para/min
  }

  // Calcular vazão
  const flowRate = (dose * weight) / finalConcentration;

  const medKey = medSelect.value;
  const med = medicationsDB[medKey];
  
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