import { changeCardType } from "../modules/calculadora/cardManagerShared.js";

export function createCardSystem() {
  const tabContent = document.createElement('div');
  tabContent.className = 'tab-content mt-3';
  
  const containers = {
    iot: createTabPane('iot', 'Intubação Orotraqueal - Sequência Rápida'),
    infusion: createTabPane('infusion', 'Infusões Contínuas'),
    bolus: createTabPane('bolus', 'Medicações em Bolus'),
    universal: createTabPane('universal', 'Cards Personalizados', true)
  };

  Object.values(containers).forEach(pane => tabContent.appendChild(pane));
  document.querySelector('.container.py-4').appendChild(tabContent);
}

function createTabPane(abaId, title, hasButton = false) {
  const pane = document.createElement('div');
  pane.className = `tab-pane fade${abaId === 'iot' ? ' show active' : ''}`;
  pane.id = abaId;

  const container = document.createElement('div');
  container.className = 'row g-2';
  container.id = `${abaId}-container`;

  pane.innerHTML = `
    <div class="row">
      <div class="col-12">
        <div class="medicamento-header d-flex justify-content-between align-items-center">
          <h3>${title}</h3>
          ${hasButton ? 
            '<button class="btn btn-universal">+ Novo Card</button>' : ''}
        </div>  
      </div>
    </div>
  `;

  pane.querySelector('.row').appendChild(container);
  if(hasButton) {
    const btn = pane.querySelector('.btn-universal');
    btn.addEventListener('click', () => addUniversalCard());
  }
  
  return pane;
}

export function createCardLayout(cardId, options = {}) {
  return `
    <div class="card-medicamento card-wrapper" id="${cardId}">
      <div class="card-body">
        ${options.isRemovable ? `
          <div class="card-actions d-flex align-items-center gap-2 mb-3">
            <button class="btn btn-danger btn-sm btn-remove-card">×</button>
            <select class="form-select card-type-select" style="width: 120px">
              <option value="bolus">Bolus</option>
              <option value="infusion">Infusão</option>
            </select>
          </div>` : ''}
        <div id="${cardId}-content">${options.content || ''}</div>
      </div>
    </div>
  `;
}

let universalCardCounter = 0;

window.addCard = (containerType = 'universal') => {
  if (containerType === 'universal') {
    addUniversalCard();
  }};

export function addUniversalCard() {
  const container = document.getElementById('universal-container');
  const cardId = `universal-card-${universalCardCounter++}`;
  
  const wrapper = document.createElement('div');
  wrapper.className = 'col-12';
  wrapper.id = cardId;
  wrapper.innerHTML = createCardLayout(cardId, {
    isRemovable: true,
    headerContent: `Card ${universalCardCounter}`
  });

  container.appendChild(wrapper);

  const typeSelect = wrapper.querySelector('.card-type-select');
  const removeBtn = wrapper.querySelector('.btn-remove-card');

  changeCardType(cardId, typeSelect.value);

  typeSelect.addEventListener('change', (e) => 
    changeCardType(cardId, e.target.value)
  );

  removeBtn.addEventListener('click', () => wrapper.remove());
}