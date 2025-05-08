
const medicationCache = {};

export async function getMedicationData(medKey) {
  const firstLetter = medKey[0].toLowerCase();
  if (!medicationCache[firstLetter]) {
    try {
      const module = await import(`../data/medications/${firstLetter}.js`);
      medicationCache[firstLetter] = Object.values(module)[0];
    } catch (error) {
      console.error(`Erro ao carregar dados de medicamentos para a letra ${firstLetter}:`, error);
      return null;
    }
  }
  return medicationCache[firstLetter][medKey];
}

/*
import { getMedicationData } from '../../getMedicationData.js';

const med = await getMedicationData(nomeMedicamento);
if (!med) {
  alert("Medicamento não encontrado.");
  return;
}
*/