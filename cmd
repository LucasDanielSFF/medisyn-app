node generate-sw.js
tree /F

C:.
├── public/                  # Todos os assets acessíveis pelo navegador
│   ├── css/
│   │   └── styles.css       # CSS global
│   │
│   └── js/
│       ├── modules/         # Módulos específicos de funcionalidades
│       │   ├── calculadora/
│       │   │   ├── calculadora.js      # Lógica principal da calculadora
│       │   │   ├── cardManager.js
│       │   │   └── calculations.js
│       │   │
│       │   └── themeManager.js         # Módulo usado globalmente
│       │
│       ├── libs/            # Bibliotecas de terceiros
│       ├── utils/           # Funções utilitárias
│       │   └── domHelpers.js
│       │
│       ├── config/          # Configurações
│       │   ├── config.js
│       │   └── medicationsDB.js
│       │
│       └── app.js           # Ponto de entrada global (se necessário)
│
├── icons/                   # Ícones e imagens
├── scripts/                 # Scripts de build/dev (se usar ferramentas)
└── sw/                      # Service Worker e PWA
    ├── service-worker.js
    └── generate-sw.js