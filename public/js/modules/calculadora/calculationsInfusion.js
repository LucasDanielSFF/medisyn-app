import { medicationsDB } from '../../../data/medicationsDB.js';
import { getGlobalWeight } from './cardManagerShared.js';
import { convertToMcg, convertMassUnit,formatConcentration } from './calculationsShared.js';

export function calcularInfusion(cardId, doseOverride = null) {
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
  const medInfusion = medicationsDB[medKey]?.admtype?.infusion;

  if (!medInfusion || !medInfusion.dose) {
    card.querySelector('.dose-value').textContent = 'ERRO';
    return;
  }

  let doseConfig;
  if (elements.doseSelect?.value && medInfusion.doseOptions) {
    doseConfig = medInfusion.doseOptions.find(opt => opt.id === elements.doseSelect.value) || medInfusion.dose;
  } else {
    doseConfig = medInfusion.dose;
  }

  let dose = Number(doseOverride) || Number(elements.doseSlider.value);
  if (isNaN(dose)) {
    dose = calcularValorMedio(doseConfig.min, doseConfig.max);
  }

  let baseUnit, originalTimePart;

  try {
    const originalUnitParts = doseConfig.unit.split('/');
    const baseUnit = originalUnitParts.find(p => ['mcg', 'mg', 'g'].includes(p)) || 'mcg';
    const originalTimePart = originalUnitParts.pop();
  
    const selectedMassUnit = elements.massUnit?.value || baseUnit;
    const timeUnit = elements.timeUnit?.value || originalTimePart;

    if (selectedMassUnit && baseUnit && selectedMassUnit !== baseUnit) {
      dose = convertMassUnit(
        Math.min(Math.max(dose, doseConfig.min), 
        baseUnit, 
        selectedMassUnit
      ));
    }
 
    if (timeUnit !== originalTimePart) {
      if (originalTimePart === 'min' && timeUnit === 'h') {
        dose = Math.min(dose * 60, doseConfig.max * 60);
      } else if (originalTimePart === 'h' && timeUnit === 'min') {
        dose = Math.max(dose / 60, doseConfig.min / 60);
      }
    }

  } catch (error) {
    console.error('Erro na conversão de unidades:', error);
    dose = calcularValorMedio(doseConfig.min, doseConfig.max);
  }

  dose = Math.min(Math.max(dose, doseConfig.min), doseConfig.max);
  elements.doseSlider.value = dose.toFixed(2);
  elements.doseSlider.min = doseConfig.min;
  elements.doseSlider.max = doseConfig.max;
  elements.doseSlider.step = doseConfig.step || 0.1;

  card.querySelector('.dose-value').textContent = dose.toFixed(2);
  const massUnit = elements.massUnit?.value || doseConfig.unit.split('/')[0];
  const timeUnit = elements.timeUnit?.value || doseConfig.unit.split('/').pop();

  try {
    const medVolume = Number(elements.medVolume.value) || 0;
    const solVolume = Number(elements.solVolume.value) || 0;
    const concValue = Number(elements.concValue.value) || 0;
    const concUnit = elements.concUnit.value;

    const totalVolume = medVolume + solVolume || 0.1;
    const concMcgPerMl = convertToMcg(concValue, concUnit);
    const totalDrug = medVolume * concMcgPerMl;
    const finalConcentration = totalDrug / totalVolume;

    const doseUnit = doseConfig.unit.split('/')[0];
    const doseInMcg = convertMassUnit(dose, doseUnit, 'mcg');
    const flowRateBase = (doseInMcg * weight) / finalConcentration || 0;

    let flowRate;
    if (timeUnit === 'min') {
      flowRate = flowRateBase * 60;
    } else {
      flowRate = flowRateBase;
    }
    
    card.querySelector('.flow-result').textContent = flowRate.toFixed(2);
    card.querySelector('.final-conc').textContent = formatConcentration(finalConcentration);
  } catch (error) {
    console.error('Erro nos cálculos principais:', error);
    card.querySelector('.flow-result').textContent = '0.00';
    card.querySelector('.final-conc').textContent = '0.00';
  }
}

export function calcularDoseReverso(cardId) {
  const card = document.getElementById(cardId);
  const weight = getGlobalWeight();

  const elements = {
    medSelect: card.querySelector('.infusion-med-select'),
    doseSelect: card.querySelector('.infusion-dose-select'),
    reverseFlowInput: card.querySelector('.reverse-flow-input')
  };

  const medInfusion = medicationsDB[elements.medSelect?.value]?.admtype?.infusion;
  if (!medInfusion) return;

  const doseConfig = medInfusion.doseOptions?.find(opt => opt.id === elements.doseSelect?.value) || medInfusion.dose;
  const doseTimeUnit = doseConfig.unit.split('/').pop(); // Extrai 'min' ou 'h'

  // Obter dados de diluição
  const medVolume = Number(card.querySelector('.infusion-med-volume').value) || 0;
  const solVolume = Number(card.querySelector('.infusion-sol-volume').value) || 0;
  const concValue = Number(card.querySelector('.infusion-conc-value').value) || 0;
  const concUnit = card.querySelector('.infusion-conc-unit').value;

  // Calcular concentração final (mcg/mL)
  const totalVolume = medVolume + solVolume || 0.1;
  const concMcgPerMl = convertToMcg(concValue, concUnit);
  const totalDrug = medVolume * concMcgPerMl;
  const finalConcentration = totalDrug / totalVolume;

  // Calcular dose
  const flowRate = parseFloat(elements.reverseFlowInput.value) || 0;
  let dose;

  if (doseTimeUnit === 'min') {
    dose = ( (flowRate / 60) * finalConcentration ) / weight; // mL/h → mL/min
  } else {
    dose = (flowRate * finalConcentration) / weight; // mL/h
  }

  // Atualizar UI
  card.querySelector('.reverse-dose-result').textContent = dose.toFixed(2);
  card.querySelector('.dose-info').textContent = `(Faixa: ${doseConfig.min} - ${doseConfig.max} ${doseConfig.unit})`;
}