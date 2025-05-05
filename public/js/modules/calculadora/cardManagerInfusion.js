import { medicationsDB } from '../../../data/medicationsDB.js';
import { calcularInfusion, calcularDoseReverso } from './calculationsInfusion.js';
import { updateSliderAndUI, initCard } from './cardManagerShared.js';

export function initInfusionCard(cardId, medKey, config = {}) {
  const selectors = {
    medSelect: '.infusion-med-select',
    doseSelect: '.infusion-dose-select',
    inputElements: '.infusion-dose-slider, .infusion-med-volume, .infusion-sol-volume, .infusion-conc-value, .infusion-conc-unit',
    calcularFunction: calcularInfusion
  };

  initCard(cardId, medKey, config, 'infusion', selectors);

  const card = document.getElementById(cardId);
  const toggleBtn = card.querySelector('.btn-toggle-reverse');
  const reverseSection = card.querySelector('.reverse-calculation');

  // Botão para exibir/ocultar seção de cálculo reverso
  toggleBtn?.addEventListener('click', () => {
    const isHidden = !reverseSection.classList.toggle('hidden');
    card.querySelector('.dose-info').classList.toggle('hidden', !isHidden);
    card.querySelector('.dose-value').classList.toggle('hidden', !isHidden);
    card.querySelector('.infusion-dose-slider').classList.toggle('hidden', !isHidden);
    card.querySelector('.flow-result').classList.toggle('hidden', !isHidden);
    card.querySelector('.resultado-container').classList.toggle('hidden', !isHidden);
    card.querySelector('.dose-section').classList.toggle('hidden', !isHidden);
    toggleBtn.textContent = isHidden ? '▼ Cálculo Reverso' : '▲ Ocultar';
  });

  // Ajusta select de perfil de dose inicial, se especificado
  const doseSelect = card.querySelector('.infusion-dose-select');
  if (doseSelect && config.doseOptionId) {
    doseSelect.value = config.doseOptionId;
  }

  // Controles de diluição
  const dilSelect = card.querySelector('.infusion-dilution-select');
  const customBtn = card.querySelector('.btn-custom-dilution');
  const medVolumeInput = card.querySelector('.infusion-med-volume');
  const solVolumeInput = card.querySelector('.infusion-sol-volume');
  const concValueInput = card.querySelector('.infusion-conc-value');
  const concUnitSelect = card.querySelector('.infusion-conc-unit');

  const setCustomMode = (active) => {
    customBtn.classList.toggle('active', active);
    medVolumeInput.readOnly = !active;
    solVolumeInput.readOnly = !active;
    concValueInput.readOnly = !active;
    concUnitSelect.disabled = !active;
  };
  setCustomMode(false);

  const handleDilutionSelect = () => {
    if (dilSelect.value !== '') {
      const d = medicationsDB[medKey]?.admtype?.infusion.diluicoes[dilSelect.value];
      if (d) {
        // Salva doseOptionId atual para restaurar depois da mudança de diluição
        const currentDoseId = doseSelect?.value;
        medVolumeInput.value = d.medVolume;
        solVolumeInput.value = d.solVolume;
        concValueInput.value = d.concValue;
        concUnitSelect.value = d.concUnit;
        setCustomMode(false);
        if (currentDoseId) {
          doseSelect.value = currentDoseId;  // Restaura o perfil de dose selecionado anteriormente
        }
        calcularInfusion(cardId);
        calcularDoseReverso(cardId);
      }
    }
  };

  dilSelect?.addEventListener('input', handleDilutionSelect);
  customBtn?.addEventListener('click', () => {
    const isActive = !medVolumeInput.readOnly;
    setCustomMode(!isActive);
    calcularInfusion(cardId);
    calcularDoseReverso(cardId);
  });

  // Listener para recálculo reverso quando vazão muda
  card.querySelector('.reverse-flow-input')?.addEventListener('input', () => {
    calcularDoseReverso(cardId);
  });

  // Atualiza unidades de concentração dinamicamente ao alterar unidade de massa/tempo
  const timeUnitSelect = card.querySelector('.infusion-time-unit');
  const massUnitSelect = card.querySelector('.infusion-mass-unit');
  const updateConcentrationUnits = () => {
    const timeUnit = timeUnitSelect?.value || 'hora';
    const massUnit = massUnitSelect?.value || 'mg';
    concUnitSelect.querySelectorAll('option').forEach(option => {
      option.textContent = `${massUnit}/${timeUnit}`;
    });
  };
  massUnitSelect?.addEventListener('input', () => {
    calcularInfusion(cardId);
    calcularDoseReverso(cardId);
    updateConcentrationUnits();
  });
  timeUnitSelect?.addEventListener('input', () => {
    calcularInfusion(cardId);
    calcularDoseReverso(cardId);
    updateConcentrationUnits();
  });
  massUnitSelect?.addEventListener('change', updateConcentrationUnits);
  timeUnitSelect?.addEventListener('change', updateConcentrationUnits);

  // Recalcula infusão e reverso quando inputs de volumes/concentração mudam
  card.querySelectorAll('.infusion-med-volume, .infusion-sol-volume, .infusion-conc-value, .infusion-conc-unit')
    .forEach(el => {
      el.addEventListener('input', () => {
        calcularInfusion(cardId);
        calcularDoseReverso(cardId);
      });
    });
}
