const medicationsDB = {
  fentanil: {
    id: 'fentanil',
    name: 'Fentanil',
    nome_generico: 'Citrato de Fentanila',
    classe_terapeutica: 'Opioide analgésico',
    mecanismo_acao: 'Agonista potente dos receptores opioides μ, promovendo analgesia intensa e depressão do SNC (especialmente respiratória).',
    farmacocinetica: 'Início de ação rápido (2-5 min IV) e curta duração (30-60 min). Metabolizado no fígado (CYP3A4) e excretado pelos rins.',
    posologia_adulto: 'Analgesia IV: 25-100 µg em bolus lento conforme necessidade. Sedação/analgesia em UTI: infusão contínua de 1-4 µg/kg/h. Indução anestésica: 2-5 µg/kg IV (doses altas para anestesia).',
    posologia_pediatrica: 'Analgesia IV: 1-2 µg/kg (dose única lenta). Sedação ventilatória: infusão 1-5 µg/kg/h ajustada pela resposta. Em recém-nascidos, administrar com cautela (risco de rigidez torácica em bolus rápido).',
    reconstituicao: 'Solução injetável pronta (50 µg/mL); pode ser diluído em SF 0,9% para infusão contínua.',
    ajuste_dose: 'Reduzir dose em idosos e insuficiência hepática. Sem necessidade de ajuste significativo na insuficiência renal, porém monitorar efeitos.',
    uso_gestacao: 'Atravessa a placenta; uso com cautela (risco de depressão respiratória neonatal se utilizado no trabalho de parto).',
    uso_lactacao: 'Excretado no leite; uso pontual sob vigilância do lactente (pode causar sedação ou depressão respiratória).',
    interacoes: 'Potencializa efeito de outros depressores do SNC (benzodiazepínicos, álcool). Inibidores de CYP3A4 (ex: cetoconazol, ritonavir) podem aumentar níveis de fentanil. Contraindicado com IMAOs (reação grave).',
    observacoes_gerais: 'Monitorar respiração e nível de consciência; naloxona disponível para reversão. Bolus IV rápido pode causar rigidez muscular torácica; tratar com ventilação assistida e relaxantes musculares se necessário.',
    admtype: {
      bolus: {
        presentations: [
          { label: '50 mcg/mL', value: 50 },
          { label: '100 mcg/mL', value: 100 }
        ],
        dose: { min: 0.5, max: 5, step: 0.1, unit: 'mcg/kg' }
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
    name: 'Midazolam',
    nome_generico: 'Cloridrato de Midazolam',
    classe_terapeutica: 'Benzodiazepínico sedativo/hipnótico',
    mecanismo_acao: 'Potencializa o efeito do GABA no SNC ao ligar-se aos receptores GABA-A, produzindo sedação, efeito ansiolítico, anticonvulsivante e relaxante muscular.',
    farmacocinetica: 'Início de ação rápido (1-5 min IV). Duração curta (1-2 h). Metabolizado no fígado (CYP3A4) com metabólito ativo. Excreção renal (metabólitos podem se acumular na IR).',
    posologia_adulto: 'Sedação consciente: 1-2 mg IV lento, repetir até efeito (dose usual 2-5 mg). Indução anestésica: ~0,2 mg/kg IV. Sedação contínua UTI: infusão 0,02-0,1 mg/kg/h, ajustar conforme sedação desejada.',
    posologia_pediatrica: 'Sedação (procedimento): 0,05-0,1 mg/kg IV (máx geralmente 2-4 mg/dose). Em crianças pequenas, titulação lenta. Infusão UTI: 0,03-0,1 mg/kg/h conforme resposta.',
    reconstituicao: 'Forma de apresentação em solução (ex: 5 mg/mL); diluir em SF 0,9% ou SG 5% para infusão contínua se necessário.',
    ajuste_dose: 'Reduzir dose em idosos e em insuficiência hepática (metabolismo reduzido). Em insuficiência renal, atenção à sedação prolongada pelo metabólito ativo. Em obesos, considerar peso ideal para dosagem.',
    uso_gestacao: 'Categoria D. Evitar especialmente no 1º trimestre (risco de malformações); uso no final da gestação pode causar depressão neonatal. Usar somente se benefício superar risco.',
    uso_lactacao: 'Excreção no leite; pode causar sedação no bebê. Se usar dose única, considerar aguardar 4-6 h antes de retomar amamentação.',
    interacoes: 'Depressores do SNC (opioides, álcool) aumentam risco de depressão respiratória. Inibidores de CYP3A4 (ex: cetoconazol, eritromicina) prolongam efeito; indutores (rifampicina) reduzem efeito. Flumazenil antagoniza seus efeitos.',
    observacoes_gerais: 'Causa amnésia anterógrada útil em procedimentos. Monitorar função respiratória, especialmente em infusões prolongadas. Possui antídoto (flumazenil) se necessário, com cautela.',
    admtype: {
      bolus: {
        presentations: [
          { label: '1 mg/mL', value: 1000 },
          { label: '5 mg/mL', value: 5000 }
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
  dexmedetomidina: {
    id: 'dexmedetomidina',
    name: 'Dexmedetomidina',
    nome_generico: 'Dexmedetomidina',
    classe_terapeutica: 'Sedativo agonista alfa-2 adrenérgico',
    mecanismo_acao: 'Agonista seletivo de receptores adrenérgicos alfa-2 no SNC, diminuindo a liberação de noradrenalina e promovendo sedação e analgesia leve, com mínima depressão respiratória.',
    farmacocinetica: 'Início de sedação em 15-30 min (com dose de ataque). Meia-vida ~2 h. Metabolização hepática (glucuronidação/CYP2A6) e excreção renal. Infusões prolongadas podem prolongar efeitos.',
    posologia_adulto: 'Sedação em UTI: dose de ataque 0,5–1 µg/kg IV em 10-20 min (opcional), manutenção 0,2–0,7 µg/kg/h, ajustar conforme nível de sedação desejado. Geralmente até 24h de infusão contínua.',
    posologia_pediatrica: 'Uso pediátrico off-label: infusão 0,1–0,5 µg/kg/h (sem bolus inicial na maioria dos casos, para evitar bradicardia). Ajustar dose conforme resposta e FC/PA.',
    reconstituicao: 'Diluir concentrado antes do uso: adicionar 2 mL (200 µg) de dexmedetomidina em 48 mL de SF 0,9%, obtendo concentração ~4 µg/mL para infusão.',
    ajuste_dose: 'Insuficiência hepática: reduzir dose (metabolismo diminuído). Insuficiência renal: não requer ajuste específico. Monitorar bradicardia/hipotensão e ajustar infusão conforme necessário.',
    uso_gestacao: 'Categoria C. Não há estudos adequados; usar somente se essencial, pois pode causar bradicardia fetal.',
    uso_lactacao: 'Desconhecido se excretada no leite; devido à falta de dados, evitar ou monitorar possível sedação no lactente.',
    interacoes: 'Potencializa outros depressores do SNC (opioides, sedativos). Associada a bradicardia acentuada se combinada a betabloqueadores ou bloqueadores de canal de cálcio. Pode reduzir necessidade de anestésicos e opioides.',
    observacoes_gerais: 'Proporciona sedação onde paciente pode despertar e cooperar se estimulado. Comum ocorrer bradicardia e hipotensão, reversíveis com redução ou suspensão da infusão. Necessária monitorização contínua cardiovascular.',
    admtype: {
      infusion: {
        dose: { min: 0.2, max: 1.4, step: 0.1, unit: 'µg/kg/h' },
        diluicoes: [
          { label: 'Diluição 50mL', medVolume: 2, solVolume: 50, concValue: 4, concUnit: 'mcg' },
          { label: 'Diluição 100mL', medVolume: 4, solVolume: 100, concValue: 4, concUnit: 'mcg' }
        ]
      }
    }
  }
};

const medKeysBolus = Object.keys(medicationsDB).filter(key => medicationsDB[key].admtype?.bolus);
const medKeysInfusion = Object.keys(medicationsDB).filter(key => medicationsDB[key].admtype?.infusion);

const configCardsPorAba = {
  infusion: ['fentanil', 'dexmedetomidina', 'midazolam'],
  bolus:    ['fentanil', 'midazolam'],
  universal: []
};
