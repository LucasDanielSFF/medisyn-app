import { medicationsDB } from '../../../data/medicationsDB.js';
import { getGlobalWeight } from './cardManagerShared.js';

export function calcularBolus(cardId) {
  const card = document.getElementById(cardId);
  const weight = getGlobalWeight();
  const medKey = card.querySelector('.bolus-med-select').value;
  const med = medicationsDB[medKey];

  const bolusConfig = med.admtype.bolus;

  const doseConfig = bolusConfig.doseOptions && card.querySelector('.bolus-dose-select')?.value
    ? bolusConfig.doseOptions.find(opt => opt.id === card.querySelector('.bolus-dose-select').value)
    : bolusConfig.dose;

  const dose = parseFloat(card.querySelector('.bolus-dose-slider').value);
  const concentracao = parseFloat(card.querySelector('.bolus-pres-select').value);
  const doseTotal = dose * weight;

  let doseTotalMcg;

  if (doseConfig.unit === 'mg/kg') {
    doseTotalMcg = dose * weight * 1000;
  } else if (doseConfig.unit === 'g/kg') {
    doseTotalMcg = dose * weight * 1000000;
  } else {
    doseTotalMcg = dose * weight;
  }

  const volume = doseTotalMcg / concentracao;

  card.querySelector('.volume-result').textContent = volume.toFixed(2);
  card.querySelector('.dose-value').textContent = dose.toFixed(2);
}