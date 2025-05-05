import { medicationsDB } from '../../../data/medicationsDB.js';
import { getGlobalWeight } from './cardManagerShared.js';
import { convertToMcg, convertMassUnit, formatConcentration, computeFinalConcentration } from './calculationsShared.js';

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
  const medInf = medicationsDB[medKey]?.admtype?.infusion;
  if (!medInf || !medInf.dose) {
    card.querySelector('.dose-value').textContent = 'ERRO';
    return;
  }

  // Determina o perfil de dose selecionado
  let doseConfig;
  if (elements.doseSelect?.value && medInf.doseOptions) {
    doseConfig = medInf.doseOptions.find(opt => opt.id === elements.doseSelect.value);
  } else {
    doseConfig = medInf.dose;  // perfil padrão
  }

  // Obtém dose atual (override ou valor do slider) e garante que seja numérica
  let dose = Number(doseOverride) || Number(elements.doseSlider.value);
  if (isNaN(dose)) {
    dose = calcularValorMedio(doseConfig.min, doseConfig.max);
  }

  try {
    // Unidades originais da medicação (ex: mg/kg/min)
    const [baseUnit, originalTime] = doseConfig.unit.split('/');
    // Unidades selecionadas pelo usuário nos dropdowns (ou as originais, se não customizáveis)
    const selectedMassUnit = elements.massUnit?.value || baseUnit;
    const selectedTimeUnit = elements.timeUnit?.value || originalTime;
    // Converte unidade de massa da dose se necessário (ex: mg -> mcg)
    if (selectedMassUnit !== baseUnit) {
      dose = convertMassUnit(dose, baseUnit, selectedMassUnit);
    }
    // Converte unidade de tempo se necessário (min <-> h)
    if (selectedTimeUnit !== originalTime) {
      if (originalTime === 'min' && selectedTimeUnit === 'h') {
        dose *= 60;   // de dose/min para dose/hora
      } else if (originalTime === 'h' && selectedTimeUnit === 'min') {
        dose /= 60;   // de dose/h para dose/min
      }
    }
    // Clampa dose dentro dos limites após conversões
    const minConv = convertMassUnit(doseConfig.min, baseUnit, selectedMassUnit);
    const maxConv = convertMassUnit(doseConfig.max, baseUnit, selectedMassUnit);
    dose = Math.min(Math.max(dose, minConv), maxConv);
  } catch (error) {
    console.error('Erro na conversão de unidades:', error);
    // Em caso de erro, retorna ao valor médio padrão
    dose = calcularValorMedio(doseConfig.min, doseConfig.max);
  }

  // Garante dose nos limites originais também
  dose = Math.min(Math.max(dose, doseConfig.min), doseConfig.max);

  // Atualiza slider e valor de dose exibido
  elements.doseSlider.value = dose.toFixed(2);
  card.querySelector('.dose-value').textContent = dose.toFixed(2);

  // Define unidades atuais (após possíveis mudanças)
  const massUnit = elements.massUnit?.value || doseConfig.unit.split('/')[0];
  const timeUnit = elements.timeUnit?.value || doseConfig.unit.split('/').pop();

  try {
    // Calcula concentração final da solução (mcg/mL)
    const medVol = Number(elements.medVolume.value) || 0;
    const solVol = Number(elements.solVolume.value) || 0;
    const concVal = Number(elements.concValue.value) || 0;
    const concUnit = elements.concUnit.value;
    const finalConc = computeFinalConcentration(medVol, solVol, concVal, concUnit);

    // Calcula vazão (mL/h) com base na dose (mcg/kg/tempo), peso e concentração final
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

export function calcularDoseReverso(cardId) {
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
  const doseTimeUnit = doseConfig.unit.split('/').pop();  // 'min' ou 'h'

  // Obtém dados de diluição atuais
  const medVol = Number(card.querySelector('.infusion-med-volume').value) || 0;
  const solVol = Number(card.querySelector('.infusion-sol-volume').value) || 0;
  const concVal = Number(card.querySelector('.infusion-conc-value').value) || 0;
  const concUnit = card.querySelector('.infusion-conc-unit').value;
  const finalConc = computeFinalConcentration(medVol, solVol, concVal, concUnit);

  // Converte vazão inserida em dose (mcg/kg/tempo)
  const flowRate = parseFloat(elements.reverseFlowInput.value) || 0;
  let dose;
  if (doseTimeUnit === 'min') {
    dose = ((flowRate / 60) * finalConc) / weight;  // entrada em mL/h convertida para mL/min
  } else {
    dose = (flowRate * finalConc) / weight;         // entrada já em mL/h
  }

  // Atualiza resultados exibidos
  card.querySelector('.reverse-dose-result').textContent = dose.toFixed(2);
  card.querySelector('.dose-info').textContent = `(Faixa: ${doseConfig.min} - ${doseConfig.max} ${doseConfig.unit})`;
  card.querySelector('.dose-info-reverse').textContent = `Concentração final: ${formatConcentration(finalConc)}`;
}
