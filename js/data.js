/**
 * THE HUMAN LEDGER - Canonical Dataset
 * 
 * Every figure is strictly documented with:
 * - label: Human-readable descriptor
 * - value: Numeric baseline figure
 * - unit: Unit of measurement
 * - year: Observation or publication benchmark year
 * - source: Primary international authority
 * - citationUrl: Public reference URL
 * - notes: Contextual clarification
 * 
 * To update any statistic, change the `value` and corresponding metadata below.
 */

const HUMAN_LEDGER_DATA = {
  metadata: {
    title: "The Human Ledger",
    subtitle: "Living Dashboard of the World's Vital Signs",
    disclaimer: "Estimated figures based on annual statistical surveillance models. Not real-time sensor tallies.",
    lastUpdatedAudit: "2024-2026 International Demographic Releases",
    secondsPerYear: 31536000 // 365 days * 24 hours * 3600 seconds
  },

  // Core global demographic rates for real-time tickers
  coreRates: {
    deaths: {
      id: "global-deaths",
      label: "Global Deaths",
      annualValue: 61000000, // ~61 million per year
      unit: "deaths/year",
      dailyAverage: 167123,
      perSecond: 61000000 / 31536000, // ~1.934 deaths/second
      year: "2024",
      source: "UN World Population Prospects & WHO Global Health Estimates",
      citationUrl: "https://population.un.org/wpp/",
      notes: "Projected annual mortality baseline across all ages and causes."
    },
    births: {
      id: "global-births",
      label: "Global Births",
      annualValue: 133000000, // ~133 million per year
      unit: "births/year",
      dailyAverage: 364383,
      perSecond: 133000000 / 31536000, // ~4.217 births/second
      year: "2024",
      source: "UN World Population Prospects (2024 Revision)",
      citationUrl: "https://population.un.org/wpp/",
      notes: "Global live births annually. Net global population increases by ~72M annually."
    }
  },

  // Leading causes of mortality
  causesOfDeath: [
    {
      id: "cancer",
      label: "Cancer (All Types)",
      sublabel: "Malignant neoplasms",
      annualValue: 9700000,
      year: "2022-2024",
      source: "WHO / IARC (Globocan 2022 & GHE)",
      citationUrl: "https://gco.iarc.who.int/",
      category: "Non-communicable",
      color: "#ff5252",
      notes: "Leading sites include lung, colorectal, liver, stomach, and female breast cancers."
    },
    {
      id: "heart-disease",
      label: "Ischaemic Heart Disease",
      sublabel: "Coronary artery disease & myocardial infarction",
      annualValue: 9000000,
      year: "2021-2024",
      source: "WHO Global Health Estimates & IHME GBD",
      citationUrl: "https://www.who.int/news-room/fact-sheets/detail/the-top-10-causes-of-death",
      category: "Cardiovascular",
      color: "#ff7043",
      notes: "The world's single biggest killer, responsible for ~16% of total deaths."
    },
    {
      id: "stroke",
      label: "Stroke",
      sublabel: "Cerebrovascular accident (ischemic & hemorrhagic)",
      annualValue: 6600000,
      year: "2021-2024",
      source: "WHO Global Health Estimates / World Stroke Organization",
      citationUrl: "https://www.who.int/news-room/fact-sheets/detail/the-top-10-causes-of-death",
      category: "Cardiovascular",
      color: "#ffa726",
      notes: "Second leading cause of death globally, causing ~11% of all deaths."
    },
    {
      id: "tuberculosis",
      label: "Tuberculosis",
      sublabel: "Mycobacterium tuberculosis infection",
      annualValue: 1250000,
      year: "2023",
      source: "WHO Global Tuberculosis Report 2024",
      citationUrl: "https://www.who.int/teams/global-tuberculosis-programme/tb-reports",
      category: "Infectious",
      color: "#ffd54f",
      notes: "Returned to the top rank of infectious disease mortality following pandemic fluctuations."
    },
    {
      id: "road-traffic",
      label: "Road Traffic Injuries",
      sublabel: "Vehicle collisions, pedestrians, cyclists",
      annualValue: 1190000,
      year: "2023",
      source: "WHO Global Status Report on Road Safety",
      citationUrl: "https://www.who.int/publications/i/item/9789240086517",
      category: "Injuries",
      color: "#80cbc4",
      notes: "Leading cause of death globally for children and young people aged 5-29."
    },
    {
      id: "suicide",
      label: "Suicide",
      sublabel: "Intentional self-harm mortality",
      annualValue: 727000,
      year: "2021-2024",
      source: "WHO Mental Health & Suicide Prevention",
      citationUrl: "https://www.who.int/news-room/fact-sheets/detail/suicide",
      category: "Mental Health / Injury",
      color: "#b39ddb",
      notes: "One person dies by suicide every 40-43 seconds globally. Every death is preventable."
    },
    {
      id: "malaria",
      label: "Malaria",
      sublabel: "Plasmodium falciparum & vivax parasitic transmission",
      annualValue: 600000,
      year: "2023",
      source: "WHO World Malaria Report 2023/2024",
      citationUrl: "https://www.who.int/teams/global-malaria-programme/reports/world-malaria-report-2023",
      category: "Infectious",
      color: "#81d4fa",
      notes: "Disproportionately impacts children under age 5 in the WHO African Region."
    }
  ],

  // Mental health prevalence dataset
  mentalHealth: {
    baselinePopulation: 8200000000, // 8.2 billion humans
    treatmentGap: {
      percentLMIC: "75% - 85%",
      label: "The Treatment Gap",
      headline: "In low- and middle-income countries, between 75% and 85% of people with mental health conditions receive no care or treatment.",
      source: "WHO World Mental Health Report: Transforming mental health for all",
      year: "2022-2024",
      reasons: [
        "Severe shortage of psychiatrists, psychologists, and specialized social workers",
        "Deep societal stigma and fear of discrimination",
        "Health budgets allocate less than 2% of total national expenditure to mental health on average"
      ]
    },
    conditions: [
      {
        id: "depression",
        label: "Depression",
        prevalence: 280000000, // 280 million
        displayValue: "280 million",
        ratioLabel: "Approx. 1 in 20 adults (3.8% of global population)",
        gridDotsOutOf1000: 34, // (280M / 8200M) * 1000 = 34.1 dots
        color: "#00ff88",
        year: "2023",
        source: "WHO Fact Sheets: Depressive disorder",
        citationUrl: "https://www.who.int/news-room/fact-sheets/detail/depression",
        summary: "Characterized by persistent sadness, lack of interest or pleasure, guilt, and disturbed sleep. Highly treatable with psychotherapy and medical intervention."
      },
      {
        id: "anxiety",
        label: "Anxiety Disorders",
        prevalence: 300000000, // 300 million
        displayValue: "300 million",
        ratioLabel: "Approx. 3.7% of total world population",
        gridDotsOutOf1000: 37, // (300M / 8200M) * 1000 = 36.6 dots
        color: "#ffaa00",
        year: "2023",
        source: "WHO Fact Sheets & IHME Global Burden of Disease",
        citationUrl: "https://www.who.int/news-room/fact-sheets/detail/anxiety-disorders",
        summary: "The most common of all mental disorders worldwide, including generalized anxiety, panic disorder, and social anxiety."
      },
      {
        id: "all_mental_disorders",
        label: "All Mental Disorders",
        prevalence: 970000000, // 970 million
        displayValue: "970 million",
        ratioLabel: "Approx. 1 in 8 people globally (~11.8% of humanity)",
        gridDotsOutOf1000: 118, // (970M / 8200M) * 1000 = 118.3 dots
        color: "#38bdf8",
        year: "2022-2024",
        source: "WHO World Mental Health Report / IHME GBD",
        citationUrl: "https://www.who.int/publications/i/item/9789240049338",
        summary: "Encompasses depressive, anxiety, bipolar, eating, and schizophrenia spectrum disorders across all demographics."
      }
    ]
  },

  // More Vital Signs - Horizontal Cards
  vitalSignsCards: [
    {
      id: "world-population",
      title: "World Population",
      metric: "8.20 Billion",
      subtext: "Global human headcount",
      icon: "globe",
      year: "2024",
      source: "UN World Population Prospects (2024)",
      citationUrl: "https://population.un.org/wpp/",
      detail: "Growing by approximately 70-73 million people annually, with fertility rates decelerating globally.",
      accent: "#00ff88"
    },
    {
      id: "life-expectancy",
      title: "Global Life Expectancy",
      metric: "73.4 Years",
      subtext: "At birth, both sexes combined",
      icon: "timeline",
      year: "2024",
      source: "UN WPP 2024 & WHO GHE",
      citationUrl: "https://www.who.int/data/gho/data/indicators/indicator-details/GHO/life-expectancy-at-birth-(years)",
      detail: "Rebounded past pre-pandemic levels (72.8 years in 2019), but with a 33-year gap between highest and lowest national averages.",
      accent: "#38bdf8"
    },
    {
      id: "hunger",
      title: "Global Hunger",
      metric: "733 Million",
      subtext: "People facing chronic undernourishment",
      icon: "wheat",
      year: "2024",
      source: "FAO / IFAD / UNICEF / WFP / WHO (SOFI 2024)",
      citationUrl: "https://www.fao.org/publications/home/fao-flagship-publications/the-state-of-food-security-and-nutrition-in-the-world",
      detail: "Equivalent to 1 out of 11 people globally (and 1 in 5 in Africa) facing hunger daily.",
      accent: "#ffaa00"
    },
    {
      id: "safe-water",
      title: "Lack of Safely Managed Water",
      metric: "2.20 Billion",
      subtext: "People without safe drinking water at home",
      icon: "droplet",
      year: "2023",
      source: "WHO / UNICEF Joint Monitoring Programme (JMP)",
      citationUrl: "https://washdata.org/",
      detail: "Over a quarter of the human population lacks drinking water services managed free from contamination.",
      accent: "#81d4fa"
    },
    {
      id: "air-pollution",
      title: "Air Pollution Deaths",
      metric: "8.10 Million / yr",
      subtext: "Ambient (outdoor) & household particulate matter",
      icon: "cloud",
      year: "2024",
      source: "State of Global Air 2024 (HEI / IHME)",
      citationUrl: "https://www.stateofglobalair.org/",
      detail: "Now the second leading global risk factor for early death, surpassing tobacco and poor diet.",
      accent: "#f472b6"
    },
    {
      id: "tobacco-mortality",
      title: "Tobacco-Related Deaths",
      metric: "8.00 Million / yr",
      subtext: "Direct use & second-hand exposure",
      icon: "smoke",
      year: "2023",
      source: "WHO Tobacco Fact Sheet",
      citationUrl: "https://www.who.int/news-room/fact-sheets/detail/tobacco",
      detail: "More than 7 million from direct consumption; approximately 1.3 million non-smokers from passive smoke.",
      accent: "#fb923c"
    }
  ],

  // Scale Canvas Configuration
  scaleData: {
    unitDefinition: "1 dot = 1 million living human beings",
    totalWorldDots: 8200, // 8,200 million = 8.2 billion
    milestones: [
      {
        id: "world",
        name: "World Population",
        dots: 8200,
        populationDisplay: "8.2 Billion",
        color: "#475569",
        activeColor: "#e2e8f0",
        description: "All 8,200 dots represent every person currently living on Earth."
      },
      {
        id: "mental",
        name: "All Mental Disorders",
        dots: 970,
        populationDisplay: "970 Million",
        color: "#38bdf8",
        activeColor: "#38bdf8",
        description: "970 dots (11.8% of all humans) experience a diagnosable mental disorder."
      },
      {
        id: "hunger",
        name: "Chronic Hunger",
        dots: 733,
        populationDisplay: "733 Million",
        color: "#ffaa00",
        activeColor: "#ffaa00",
        description: "733 dots (8.9% of humanity) endure chronic food deprivation."
      },
      {
        id: "births",
        name: "Annual Births",
        dots: 133,
        populationDisplay: "133 Million / yr",
        color: "#00ff88",
        activeColor: "#00ff88",
        description: "133 dots enter the human ledger every single year."
      },
      {
        id: "deaths",
        name: "Annual Deaths",
        dots: 61,
        populationDisplay: "61 Million / yr",
        color: "#f43f5e",
        activeColor: "#f43f5e",
        description: "61 dots depart the ledger each year across all ages and causes."
      }
    ]
  },

  // Crisis and Support Lines
  crisisSupport: {
    headline: "If you or someone you know is struggling, you are not alone.",
    subtext: "Free, confidential, and compassionate support is available 24 hours a day, 7 days a week.",
    resources: [
      {
        name: "Find A Helpline (Worldwide)",
        number: "findahelpline.com",
        type: "Free, confidential support across 130+ countries",
        url: "https://findahelpline.com",
        isGlobal: true,
        tag: "Global Directory"
      },
      {
        name: "Tele-MANAS (India)",
        number: "14416 / 1800-891-4416",
        type: "24/7 National Tele-Mental Health Programme of India (toll-free)",
        url: "tel:14416",
        isPhone: true,
        tag: "India (National)"
      },
      {
        name: "988 Suicide & Crisis Lifeline (US & Canada)",
        number: "Dial 988",
        type: "24/7 Call and Text support in English and Spanish",
        url: "tel:988",
        isPhone: true,
        tag: "US & Canada"
      },
      {
        name: "Crisis Text Line",
        number: "Text HOME to 741741",
        type: "Free 24/7 crisis support via SMS in the US, UK, and Canada",
        url: "https://www.crisistextline.org/",
        tag: "US / UK / CA"
      },
      {
        name: "Befrienders Worldwide",
        number: "befrienders.org",
        type: "Global network of emotional support centers",
        url: "https://www.befrienders.org/",
        tag: "International"
      }
    ]
  },

  // Curated Fact Ticker Items
  tickerFacts: [
    "BIRTH SURPLUS: Worldwide, approximately 2.18 births occur for every single death recorded.",
    "EQUITY GAP: More than 75% of individuals experiencing mental distress in low- and middle-income nations receive zero clinical care.",
    "PREVENTION: Suicide is preventable. Early identification, environmental restriction, and compassionate dialogue save lives.",
    "AIR RISKS: Ambient and household air pollution now claim 8.1 million lives annually, predominantly in vulnerable communities.",
    "WATER ACCESS: 2.2 billion humans still live without reliably safe, treated drinking water on their premises.",
    "CHRONIC CONDITIONS: Non-communicable diseases (cancers, cardiovascular conditions) account for over 74% of all annual deaths.",
    "YOUTH MORTALITY: Road traffic injuries remain the primary cause of premature death globally among youth aged 5 to 29."
  ]
};

// Freeze the dataset to protect against inadvertent runtime mutation
Object.freeze(HUMAN_LEDGER_DATA);
