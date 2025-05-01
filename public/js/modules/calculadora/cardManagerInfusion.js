import { medicationsDB } from '../../../data/medicationsDB.js';
import { calcularInfusion, calcularDoseReverso } from './calculationsInfusion.js';
import { calcularValorMedio } from './calculationsShared.js';
import { updateSliderAndUI, updateCardContent, initCard } from './cardManagerShared.js';

export function initInfusionCard(cardId, medKey, config = {}) {
  const selectors = {
    medSelect: '.infusion-med-select',
    doseSelect: '.infusion-dose-select',
    inputElements: '.infusion-dose-slider, .infusion-med-volume, .infusion-sol-volume, .infusion-conc-value, .infusion-conc-unit',
    calcularFunction: calcularInfusion
  };

  initCard(cardId, medKey, config, 'infusion', selectors);

  // Lógica específica de infusão
  const card = document.getElementById(cardId);
  const toggleBtn = card.querySelector('.btn-toggle-reverse');
  const reverseSection = card.querySelector('.reverse-calculation');
  
  toggleBtn?.addEventListener('click', () => {
    reverseSection.classList.toggle('hidden');
    card.querySelector('.dose-info').classList.toggle('hidden', !reverseSection.classList.contains('hidden'));
    card.querySelector('.dose-value').classList.toggle('hidden', !reverseSection.classList.contains('hidden'));
    card.querySelector('.infusion-dose-slider').classList.toggle('hidden', !reverseSection.classList.contains('hidden'));
    card.querySelector('.flow-result').classList.toggle('hidden', !reverseSection.classList.contains('hidden'));
    card.querySelector('.resultado-container').classList.toggle('hidden', !reverseSection.classList.contains('hidden'));
    card.querySelector('.dose-section').classList.toggle('hidden', !reverseSection.classList.contains('hidden'));
    toggleBtn.textContent = reverseSection.classList.contains('hidden') ? '▼ Cálculo Reverso' : '▲ Ocultar';
  });

  // Lógica de diluição personalizada (readicionada)
  const dilSelect = card.querySelector('.infusion-dilution-select');
  const customBtn = card.querySelector('.btn-custom-dilution');
  const medVolumeInput = card.querySelector('.infusion-med-volume');
  const solVolumeInput = card.querySelector('.infusion-sol-volume');
  const concValueInput = card.querySelector('.infusion-conc-value');
  const concUnitSelect = card.querySelector('.infusion-conc-unit');

  const setCustomMode = (isActive) => {
    customBtn.classList.toggle('active', isActive);
    medVolumeInput.readOnly = !isActive;
    solVolumeInput.readOnly = !isActive;
    concValueInput.readOnly = !isActive;
    concUnitSelect.disabled = !isActive;
  }

  setCustomMode(false);

  const handleDilutionSelect = () => {
    if (dilSelect.value !== '') {
      const d = medicationsDB[medKey]?.admtype?.infusion.diluicoes[dilSelect.value];
      if (d) {
        medVolumeInput.value = d.medVolume;
        solVolumeInput.value = d.solVolume;
        concValueInput.value = d.concValue;
        concUnitSelect.value = d.concUnit;
        setCustomMode(false);
        calcularInfusion(cardId); // Atualizar cálculos
      }
    }
  };

  // Event listeners para controles de diluição
  dilSelect?.addEventListener('change', handleDilutionSelect);
  
  customBtn?.addEventListener('click', () => {
    const isCustomActive = !medVolumeInput.readOnly;
    setCustomMode(!isCustomActive);
    
    calcularInfusion(cardId);
  });

  // Listener para cálculo reverso
  card.querySelector('.reverse-flow-input')?.addEventListener('input', () => {
    calcularDoseReverso(cardId);
  });

  // Atualizar unidades de concentração dinamicamente
  const timeUnitSelect = card.querySelector('.infusion-time-unit');
  const massUnitSelect = card.querySelector('.infusion-mass-unit');
  
  const updateConcentrationUnits = () => {
    const timeUnit = timeUnitSelect?.value || 'hora';
    const massUnit = massUnitSelect?.value || 'mg';
    concUnitSelect.querySelectorAll('option').forEach(option => {
      option.textContent = `${massUnit}/${timeUnit}`;
    });
  };

  timeUnitSelect?.addEventListener('change', updateConcentrationUnits);
  massUnitSelect?.addEventListener('change', updateConcentrationUnits);
}