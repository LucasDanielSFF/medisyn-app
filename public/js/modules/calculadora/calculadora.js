// calculadora.js

// ==================================================
// ►►► Importações Necessárias
// ==================================================
import { configAba} from '../../config/config.js';
import { carregarCardsAutomaticos, updateCardContent} from './cardManager.js';
import { medicationsDB } from '../../../data/medicationsDB.js';

// ==================================================
// ►►► Inicialização da Página
// ==================================================

document.addEventListener('DOMContentLoaded', () => {
  // Configuração das abas
  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', e => {
      const target = e.target.getAttribute('data-bs-target').replace('#', '');
      carregarCardsAutomaticos(target);
    });
  });

  // Ativa a primeira aba e carrega os cards
  const firstTab = document.querySelector('button[data-bs-toggle="tab"]'); 
  if(firstTab) {
    new bootstrap.Tab(firstTab).show(); // Força ativação Bootstrap

    carregarCardsAutomaticos(firstTab.getAttribute('data-bs-target').replace('#', ''));
  }
});

// ==================================================
// ►►► Funções Globais no Window
// ==================================================
window.removeCard = (cardId) => document.getElementById(cardId)?.remove();
window.addCard = (containerType = 'universal') => {
  if (!configAba[containerType]?.addButton) return;
  const map = {
    infusion: 'infusion-container',
    bolus: 'bolus-container',
    universal: 'universal-container'
  };
  const cardId = `card-${Date.now()}-${Math.random()}`;
  const initialType = containerType === 'infusion' ? 'infusion' : 'bolus';

  const isRemovable = configAba[containerType]?.removable;

  const initialMedKey = Object.keys(medicationsDB).find(key => 
    medicationsDB[key]?.admtype?.[initialType]
  );

  const cardHTML = `<div class="col-12" id="${cardId}">
    <div class="card-medicamento">
      ${isRemovable ? `
        <div class="d-flex align-items-center justify-content-start gap-2 mb-3">
          <button class="btn btn-danger btn-sm btn-remove-card" onclick="removeCard('${cardId}')">×</button>
          <select class="form-select tipo-medicamento w-auto" onchange="changeCardType('${cardId}', this.value)">
            <option value="bolus" ${initialType === 'bolus' ? 'selected' : ''}>Bolus</option>
            <option value="infusion" ${initialType === 'infusion' ? 'selected' : ''}>Infusão</option>
          </select>
        </div>` : ''
      }
      <div id="${cardId}-content"></div>
    </div>
  </div>`;

  document.getElementById(map[containerType]).insertAdjacentHTML('beforeend', cardHTML);

updateCardContent(cardId, initialType, initialMedKey || ''); // Forçar passagem de chave válida
}