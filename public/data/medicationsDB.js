export const DB_VERSION = '0.2.0';
export const medicationsDB = {
  test: {
    id: 'test',
    name: 'Test',
    admtype: {
      bolus: {
        presentations: [
          { label: '1 mcg/mL', value: 1 },
          { label: '1 mg/mL', value: 1000 },
          { label: '1 g/mL', value: 1000000 }
        ],
        doseOptions: [
          { id: 'test', label: 'Test bolus dose option 1', min: 1, max: 2, step: 0.01, unit: 'mcg/kg' },
          { id: 'test', label: 'Test bolus dose option 1', min: 1, max: 2, step: 0.01, unit: 'mg/kg' }
        ],
        dose: { min: 1, max: 2, step: 0.1, unit: 'g/kg' }
      },
      infusion: {
        doseOptions: [
        { id: 'test', label: 'Test infusion option 1', min: 1, max: 2, step: 0.01, unit: 'mcg/kg/h' },
        { id: 'test', label: 'Test infusion option 1', min: 1, max: 2, step: 0.01, unit: 'mg/kg/min' }
        ],
        dose: { min: 0.1, max: 3, step: 0.1, unit: 'g/kg/h' },
        diluicoes: [
          { label: 'Test dilutions 1', medVolume: 10, solVolume: 90, concValue: 1, concUnit: 'mcg' },
          { label: 'Padrão 2 (80mL SF)', medVolume: 10, solVolume: 90, concValue: 1, concUnit: 'mg' }
        ]
      }
    }
  },
  cetamina: {
    id: 'cetamina',
    name: 'Cloridrato de Cetamina',
    admtype: {
      bolus: {
        presentations: [
          { label: '10 mg/mL', value: 10000 },
          { label: '50 mg/mL', value: 50000 },
          { label: '100 mg/mL', value: 100000 }
        ],
        doseOptions: [
          { id: 'iot', label: 'Intubação Orotraqueal - SRI (1 - 3 mg/kg)', min: 1, max: 2, step: 0.01, unit: 'mg/kg' }
        ],
        dose: { min: 1, max: 5, step: 0.1, unit: 'mg/kg' }
      },
    }
  },
  etomidato: {
    id: 'etomidato',
    name: 'Etomidato',
    admtype: {
      bolus: {
        presentations: [
          { label: '2 mg/mL', value: 2000 }
        ],
        doseOptions: [
          { id: 'iot', label: 'Intubação Orotraqueal - SRI (1 - 3 mg/kg)', min: 0.1, max: 0.3, step: 0.01, unit: 'mg/kg' }
        ],
        dose: { min: 1, max: 5, step: 0.1, unit: 'mg/kg' }
      },
    }
  },
  fentanil: {
    id: 'fentanil',
    name: 'Citrato de Fentanila',
    admtype: {
      bolus: {
        presentations: [
          { label: '50 mcg/mL', value: 50 },
        ],
        doseOptions: [
          { id: 'iot', label: 'Intubação Orotraqueal - SRI (1 - 3 mcg/kg)', min: 1, max: 3, step: 0.01, unit: 'mcg/kg' }
        ],
        dose: { min: 1, max: 5, step: 0.1, unit: 'mcg/kg' }
      },
      infusion: {
        dose: { min: 0.3, max: 3, step: 0.1, unit: 'µg/kg/h' },
        diluicoes: [
          { label: 'Padrão 1 (50mL SF)', medVolume: 50, solVolume: 50, concValue: 50, concUnit: 'mcg' },
          { label: 'Padrão 2 (80mL SF)', medVolume: 20, solVolume: 80, concValue: 50, concUnit: 'mcg' }
        ]
      }
    }
  },
  midazolam: {
    id: 'midazolam',
    name: 'Cloridrato de Midazolam',
    admtype: {
      bolus: {
        presentations: [
          { label: '1 mg/mL', value: 1000 },
          { label: '5 mg/mL', value: 5000 }
        ],
        doseOptions: [
          { id: 'iot', label: 'Intubação Orotraqueal - SRI (0.1 - 0.3 mg/kg)', min: 0.1, max: 0.3, step: 0.01, unit: 'mg/kg' }
        ],
        dose: { min: 0.05, max: 0.3, step: 0.01, unit: 'mg/kg' }
      },
      infusion: {
        dose: { min: 0.02, max: 0.2, step: 0.01, unit: 'mg/kg/h' },
        diluicoes: [
          { label: 'Midazolam 15mg/50mL (SF)', medVolume: 15, solVolume: 50, concValue: 0.3, concUnit: 'mg' }
        ]
      }
    }
  },
  noradrenalina: {
    id: 'noradrenalina',
    name: 'Hemitartarato de Noraepinefrina',
    admtype: {
      bolus: {
        presentations: [
          { label: '1 mg/mL', value: 1000 },
        ],
        doseOptions: [
          { id: 'iot', label: 'Intubação Orotraqueal - SRI (1 - 3 mcg/kg)', min: 1, max: 3, step: 0.01, unit: 'mcg/kg' }
        ],
        dose: { min: 1, max: 5, step: 0.1, unit: 'mcg/kg' }
      },
      infusion: {
        dose: { min: 0.3, max: 3, step: 0.1, unit: 'µg/kg/h' },
        diluicoes: [
          { label: '20mL + 180mL SF 0,9%)', medVolume: 20, solVolume: 180, concValue: 1000, concUnit: 'mcg' },
          { label: 'Padrão 2 (80mL SF)', medVolume: 20, solVolume: 80, concValue: 50, concUnit: 'mcg' }
        ]
      }
    }
  },
  dexmedetomidina: {
    id: 'dexmedetomidina',
    name: 'Dexmedetomidina',
    admtype: {
      infusion: {
        doseOptions: [
          { id: 'padrao', label: 'Dose Padrão (0.2-1.4 µg/kg/h)', min: 0.2, max: 1.4, step: 0.1, unit: 'µg/kg/h' },  
          { id: 'pos-operatorio', label: 'Pós-Operatório (0.4-0.8 µg/kg/h)', min: 0.4, max: 0.8, step: 0.1, unit: 'µg/kg/h' }
        ],
        dose: { min: 0.2, max: 1.4, step: 0.1, unit: 'µg/kg/h' },
        diluicoes: [
          { label: 'Diluição 50mL', medVolume: 2, solVolume: 50, concValue: 4, concUnit: 'mcg' },
          { label: 'Diluição 100mL', medVolume: 4, solVolume: 100, concValue: 4, concUnit: 'mcg' }
        ]
      }
    }
  },
  rocuronio: {
    id: 'rocuronio',
    name: 'Brometo de Rocurônio',
    admtype: {
      bolus: {
        presentations: [
          { label: '10 mg/mL', value: 10000 }
        ],
        doseOptions: [
          { id: 'iot', label: 'Intubação Orotraqueal - SRI (0.6 - 1.2 mg/kg)', min: 0.6, max: 1.2, step: 0.01, unit: 'mg/kg' }
        ],
        dose: { min: 0.05, max: 0.3, step: 0.01, unit: 'mg/kg' }
      }
    }
  }
};