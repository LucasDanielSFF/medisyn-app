import { configAba } from '../../config/config.js';
import { carregarCardsAutomaticos } from './cardManagerShared.js';
import { medicationsDB } from '../../../data/medicationsDB.js';
import { createCardLayout, createCardSystem } from '../../utils/cardComponent.js';
import { addUniversalCard } from '../../utils/cardComponent.js';

// Configura sistema de tabs e containers de cards
createCardSystem();

// Gera um ID único para cada novo card
export function generateCardId() {
  return `card-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
}

// Função global para remover um card pelo ID (usada nos botões "×" do card)
window.removeCard = (cardId) => {
  document.getElementById(cardId)?.remove();
};
