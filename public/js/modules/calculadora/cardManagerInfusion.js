import { medicationsDB } from '../../../data/medicationsDB.js';
import { calcularInfusion, calcularDoseReverso } from './calculationsInfusion.js';
import { calcularValorMedio } from './calculationsShared.js';
import { updateSliderAndUI, updateCardContent } from './cardManagerShared.js';

export function initInfusionCard(cardId, medKey, config = {}) {
  const card = document.getElementById(cardId);
  const selectMed = card.querySelector('.infusion-med-select');

  const medEntry = medicationsDB[medKey];
  if (!medEntry?.admtype?.infusion) { 
    console.error(`Medicação "${medKey}" não possui configuração de infusão válida.`);
    return;
  }

  const med = medEntry.admtype.infusion;

  const originalUnit = med.dose.unit;
  const originalTimePart = originalUnit.split('/').pop();

  if (!med) return;

  const doseConfig = config.doseOptionId 
    ? med.doseOptions.find(opt => opt.id === config.doseOptionId)
    : med.dose;

  const valorMedio = calcularValorMedio(doseConfig.min, doseConfig.max);
  updateSliderAndUI(card, doseConfig, valorMedio, 'infusion');

  const doseSelect = card.querySelector('.infusion-dose-select');
  if (doseSelect && !config.isLocked) {
    doseSelect.addEventListener('change', () => {
      const newDoseId = doseSelect.value;
      const newDose = med.doseOptions.find(opt => opt.id === newDoseId);
      updateSliderAndUI(card, newDose, calcularValorMedio(newDose.min, newDose.max), 'infusion');
      calcularInfusion(cardId);
    });
  }

  const timeUnitSelect = card.querySelector('.infusion-time-unit');
  if (timeUnitSelect) {
    timeUnitSelect.addEventListener('change', () => {
      const selectedTimeUnit = timeUnitSelect.value;
      const doseUnitElement = card.querySelector('.dose-unit');
      const originalUnit = med.dose.unit;
      const hasKg = originalUnit.includes('kg');
      const massUnit = card.querySelector('.infusion-mass-unit')?.value || originalUnit.split('/')[0];
      
      doseUnitElement.textContent = hasKg 
        ? `${massUnit}/kg/${selectedTimeUnit}`
        : `${massUnit}/${selectedTimeUnit}`;
      
      calcularInfusion(cardId);
    });
  }

  const massUnitSelect = card.querySelector('.infusion-mass-unit');
  if (massUnitSelect) {
    massUnitSelect.addEventListener('change', () => {
      const selectedMassUnit = massUnitSelect.value;
      const doseUnitElement = card.querySelector('.dose-unit');
      const originalUnit = med.dose.unit;
      const hasKg = originalUnit.includes('kg');
      const timeUnit = card.querySelector('.infusion-time-unit')?.value || originalUnit.split('/').pop();
      
      doseUnitElement.textContent = hasKg 
        ? `${selectedMassUnit}/kg/${timeUnit}`
        : `${selectedMassUnit}/${timeUnit}`;
      
      calcularInfusion(cardId);
    });
  }

  selectMed.addEventListener('change', () => {
    updateCardContent(cardId, 'infusion', selectMed.value, config);
  });

  card.querySelectorAll(
    '.infusion-dose-slider, .infusion-med-volume, .infusion-sol-volume, .infusion-conc-value, .infusion-conc-unit'
  ).forEach(el => el.addEventListener('input', () => calcularInfusion(cardId)));

  card.querySelector('.reverse-flow-input')?.addEventListener('input', () => {
    calcularDoseReverso(cardId);
  });

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
      const d = med.diluicoes[dilSelect.value];
      medVolumeInput.value = d.medVolume;
      solVolumeInput.value = d.solVolume;
      concValueInput.value = d.concValue;
      concUnitSelect.value = d.concUnit; 
      setCustomMode(false);
      calcularInfusion(cardId);
    }
    calcularInfusion(cardId);
  };

  dilSelect.addEventListener('change', handleDilutionSelect);
  customBtn.addEventListener('click', () => {
    medVolumeInput.readOnly = !medVolumeInput.readOnly;
    solVolumeInput.readOnly = !solVolumeInput.readOnly;
    concValueInput.readOnly = !concValueInput.readOnly;
    concUnitSelect.disabled = !concUnitSelect.disabled;
    calcularInfusion(cardId);
  });

  calcularInfusion(cardId);
}