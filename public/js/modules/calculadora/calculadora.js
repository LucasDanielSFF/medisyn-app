import { configAba } from '../../config/config.js';
import { carregarCardsAutomaticos, updateCardContent } from './cardManagerShared.js';
import { medicationsDB } from '../../../data/medicationsDB.js';
import { createCardLayout } from '../../utils/cardComponent.js';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', e => {
      const target = e.target.getAttribute('data-bs-target').replace('#', '');
      carregarCardsAutomaticos(target);
    });
  });

  const firstTab = document.querySelector('button[data-bs-toggle="tab"]'); 
  if(firstTab) {
    new bootstrap.Tab(firstTab).show();

    carregarCardsAutomaticos(firstTab.getAttribute('data-bs-target').replace('#', ''));
  }
});

window.removeCard = (cardId) => document.getElementById(cardId)?.remove();
window.addCard = (containerType = 'universal') => {
  if (!configAba[containerType]?.addButton) return;
  const map = {
    infusion: 'infusion-container',
    bolus: 'bolus-container',
    universal: 'universal-container'
  };

  const isRemovable = configAba[containerType]?.removable;
  const cardId = `card-${Date.now()}-${Math.random()}`;
  const initialType = containerType === 'infusion' ? 'infusion' : 'bolus';

  const cardHTML = createCardLayout(cardId, {
    removable: isRemovable,
    headerContent: `
      <button class="btn btn-danger btn-sm btn-remove-card" onclick="removeCard('${cardId}')">×</button>
          <select class="form-select tipo-medicamento w-auto" onchange="changeCardType('${cardId}', this.value)">
            <option value="bolus" ${initialType === 'bolus' ? 'selected' : ''}>Bolus</option>
            <option value="infusion" ${initialType === 'infusion' ? 'selected' : ''}>Infusão</option>
        </select>
    `,
    content: `<div id="${cardId}-content"></div>`
  });

  const initialMedKey = Object.keys(medicationsDB).find(key => 
    medicationsDB[key]?.admtype?.[initialType]
  );

  document.getElementById(map[containerType]).insertAdjacentHTML('beforeend', cardHTML);

updateCardContent(cardId, initialType, initialMedKey || '');
}