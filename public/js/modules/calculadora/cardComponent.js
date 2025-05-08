import { initialCardLoading, changeCardType } from "./cardManager.js";
import { sanitizeInteger, updateAllCardsOnWeightChange } from './sharedUtils.js'

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

let universalCardCounter = 0;
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

export function createCardLayout(cardId, options = {}) {
  return `
    <div class="card-medicamento card-wrapper" id="${cardId}">
      <div class="card-body">
        ${options.isRemovable ? `
          <div class="card-actions d-flex justify-content-between align-items-center gap-2 mb-3">
            <select class="form-select card-type-select" style="width: 120px">
              <option value="bolus">Bolus</option>
              <option value="infusion">Infusão</option>
            </select>
            <button class="btn btn-danger btn-sm btn-remove-card">×</button>
          </div>` : ''}
        <div id="${cardId}-content">${options.content || ''}</div>
      </div>
    </div>
  `;
}

window.addCard = (containerType = 'universal') => {
  if (containerType === 'universal') {
    addUniversalCard();
  }};

export function initEventListeners() {
  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tabBtn => {
    tabBtn.addEventListener('shown.bs.tab', e => {
      const abaAtiva = e.target.getAttribute('data-bs-target').replace('#', '');
      initialCardLoading(abaAtiva);
    });
  });

  const weightInput = document.getElementById('patient-weight');
  const errorDiv = document.getElementById('weight-error');
  let errorTimeout = null;

  const validateWeight = () => {
    const rawValue = weightInput.value;
    const num = parseInt(rawValue, 10);
    const isValid = !isNaN(num) && num >= 40 && num <= 300;
    weightInput.classList.toggle('is-invalid', !isValid);
    if (!isValid && rawValue !== "") {
      errorDiv.classList.add('show');
      if (errorTimeout) clearTimeout(errorTimeout);
      errorTimeout = setTimeout(() => errorDiv.classList.remove('show'), 5000);
    } else {
      errorDiv.classList.remove('show');
    }
    return isValid;
  };

  weightInput.addEventListener('input', () => {
    weightInput.value = weightInput.value.replace(/[^0-9]/g, '');
    validateWeight();
  });
  weightInput.addEventListener('blur', () => {
    weightInput.value = sanitizeInteger(weightInput.value);
    validateWeight();
  });
  weightInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      weightInput.blur();
      if (validateWeight()) {
        updateAllCardsOnWeightChange();
      }
    }
  });
  weightInput.addEventListener('change', () => {
    updateAllCardsOnWeightChange();
  });
}