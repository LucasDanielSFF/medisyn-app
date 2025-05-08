import { medicationsDB } from '../../../data/medicationsDB.js';
import { getGlobalWeight } from './sharedUtils.js';
import { convertMassUnit, formatConcentration, computeFinalConcentration } from './calculationsShared.js';

function calcBolusDose(unit, dose, weight) {
  const multipliers = { 'mg/kg': 1000, 'g/kg': 1_000_000 };
  return dose * weight * (multipliers[unit] || 1);
}

export function calcBolus(cardId) {
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

  const doseTotalMcg = calcBolusDose(doseConfig.unit, dose, weight);
  const volume = doseTotalMcg / concentracao;

  card.querySelector('.volume-result').textContent = volume.toFixed(2);
  card.querySelector('.dose-value').textContent = dose.toFixed(2);
}

export function calcInfusion(cardId, doseOverride = null) {
  const card = document.getElementById(cardId);
  const weight = getGlobalWeight();

  const elements = {
    medSelect: card.querySelector('.infusion-med-select'),
    doseSlider: card.querySelector('.infusion-dose-slider'),
    doseSelect: card.querySelector('.infusion-dose-select'),
    timeUnit: card.querySelector('.infusion-time-unit'),
    massUnit: card.querySelector('.infusion-mass-unit'),
    medVolume: card.querySelector('.infusion-med-volume'),
    solVolume: card.querySelector('.infusion-sol-volume'),
    concValue: card.querySelector('.infusion-conc-value'),
    concUnit: card.querySelector('.infusion-conc-unit')
  };
  if (!elements.medSelect || !elements.doseSlider) return;

  const medKey = elements.medSelect.value;
  const medInf = medicationsDB[medKey]?.admtype?.infusion;
  if (!medInf || !medInf.dose) {
    card.querySelector('.dose-value').textContent = 'ERRO';
    return;
  }

  let doseConfig;
  if (elements.doseSelect?.value && medInf.doseOptions) {
    doseConfig = medInf.doseOptions.find(opt => opt.id === elements.doseSelect.value);
  } else {
    doseConfig = medInf.dose;
  }

  let dose = Number(doseOverride) || Number(elements.doseSlider.value);
  if (isNaN(dose)) {
    dose = calcMedian(doseConfig.min, doseConfig.max);
  }

  try {
    //const selectedMassUnit = baseUnit;
    //const selectedTimeUnit = originalTime;
    const [baseUnit, originalTime] = doseConfig.unit.split('/');
    const selectedMassUnit = elements.massUnit?.value || baseUnit;
    const selectedTimeUnit = elements.timeUnit?.value || originalTime;
    if (selectedMassUnit !== baseUnit) {
      dose = convertMassUnit(dose, baseUnit, selectedMassUnit);
    }
    if (selectedTimeUnit !== originalTime) {
      if (originalTime === 'min' && selectedTimeUnit === 'h') {
        dose *= 60;
      } else if (originalTime === 'h' && selectedTimeUnit === 'min') {
        dose /= 60;
      }
    }
    const minConv = convertMassUnit(doseConfig.min, baseUnit, selectedMassUnit);
    const maxConv = convertMassUnit(doseConfig.max, baseUnit, selectedMassUnit);
    dose = Math.min(Math.max(dose, minConv), maxConv);
  } catch (error) {
    console.error('Erro na conversão de unidades:', error);
    dose = calcMedian(doseConfig.min, doseConfig.max);
  }

  dose = Math.min(Math.max(dose, doseConfig.min), doseConfig.max);

  elements.doseSlider.value = dose.toFixed(2);
  card.querySelector('.dose-value').textContent = dose.toFixed(2);

  const massUnit = elements.massUnit?.value || doseConfig.unit.split('/')[0];
  const timeUnit = elements.timeUnit?.value || doseConfig.unit.split('/').pop();

  try {
    const medVol = Number(elements.medVolume.value) || 0;
    const solVol = Number(elements.solVolume.value) || 0;
    const concVal = Number(elements.concValue.value) || 0;
    const concUnit = elements.concUnit.value;
    const finalConc = computeFinalConcentration(medVol, solVol, concVal, concUnit);

    const doseUnitMass = doseConfig.unit.split('/')[0];
    const doseInMcg = convertMassUnit(dose, doseUnitMass, 'mcg');
    const flowRateBase = (doseInMcg * weight) / finalConc || 0;
    const flowRate = (timeUnit === 'min') ? flowRateBase * 60 : flowRateBase;

    card.querySelector('.flow-result').textContent = flowRate.toFixed(2);
    card.querySelector('.final-conc').textContent = formatConcentration(finalConc);
  } catch (error) {
    console.error('Erro nos cálculos principais:', error);
    card.querySelector('.flow-result').textContent = '0.00';
    card.querySelector('.final-conc').textContent = '0.00';
  }
}

export function calcRevInfusion(cardId) {
  const card = document.getElementById(cardId);
  const weight = getGlobalWeight();

  const elements = {
    medSelect: card.querySelector('.infusion-med-select'),
    doseSelect: card.querySelector('.infusion-dose-select'),
    reverseFlowInput: card.querySelector('.reverse-flow-input')
  };
  const medInf = medicationsDB[elements.medSelect?.value]?.admtype?.infusion;
  if (!medInf) return;

  const doseConfig = medInf.doseOptions?.find(opt => opt.id === elements.doseSelect?.value) || medInf.dose;
  const doseTimeUnit = doseConfig.unit.split('/').pop();

  const medVol = Number(card.querySelector('.infusion-med-volume').value) || 0;
  const solVol = Number(card.querySelector('.infusion-sol-volume').value) || 0;
  const concVal = Number(card.querySelector('.infusion-conc-value').value) || 0;
  const concUnit = card.querySelector('.infusion-conc-unit').value;
  const finalConc = computeFinalConcentration(medVol, solVol, concVal, concUnit);

  const flowRate = parseFloat(elements.reverseFlowInput.value) || 0;
  let dose;
  if (doseTimeUnit === 'min') {
    dose = ((flowRate / 60) * finalConc) / weight;
  } else {
    dose = (flowRate * finalConc) / weight;
  }

  card.querySelector('.reverse-dose-result').textContent = dose.toFixed(2);
  card.querySelector('.dose-info').textContent = `(Faixa: ${doseConfig.min} - ${doseConfig.max} ${doseConfig.unit})`;
  card.querySelector('.dose-info-reverse').textContent = `Concentração final: ${formatConcentration(finalConc)}`;
}
