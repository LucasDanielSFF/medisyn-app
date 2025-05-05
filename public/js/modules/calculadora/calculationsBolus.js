import { medicationsDB } from '../../../data/medicationsDB.js';
import { getGlobalWeight } from './cardManagerShared.js';

function calcularDoseTotal(unit, dose, weight) {
  const [massUnit] = unit.split('/');
  // Converte dose para microgramas conforme unidade e multiplica pelo peso
  const doseInMcg = (massUnit === 'mg') ? dose * 1000 
                 : (massUnit === 'g') ? dose * 1000000 
                 : dose;
  return doseInMcg * weight;
}

export function calcularBolus(cardId) {
  const card = document.getElementById(cardId);
  const weight = getGlobalWeight();
  const medKey = card.querySelector('.bolus-med-select').value;
  const med = medicationsDB[medKey];
  const bolusConfig = med.admtype.bolus;

  const doseSelect = card.querySelector('.bolus-dose-select');
  const selectedDoseId = doseSelect?.value;
  const doseConfig = bolusConfig.doseOptions?.find(opt => opt.id === selectedDoseId) || bolusConfig.dose;

  const dose = parseFloat(card.querySelector('.bolus-dose-slider').value);
  const concentracao = parseFloat(card.querySelector('.bolus-pres-select').value);

  const doseTotalMcg = calcularDoseTotal(doseConfig.unit, dose, weight);
  const volume = doseTotalMcg / concentracao;

  card.querySelector('.volume-result').textContent = volume.toFixed(2);
  card.querySelector('.dose-value').textContent = dose.toFixed(2);
}
