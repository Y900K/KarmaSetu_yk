export type QuizQuestion = {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
};

// ─── Topic Question Banks (Hinglish & English) ────────────────────────────────

export const TOPIC_BANKS: Record<string, { hi: QuizQuestion[]; en: QuizQuestion[] }> = {
  ventilation: {
    hi: [
      {
        q: "Chemical plants में Local Exhaust Ventilation (LEV) का मुख्य कार्य क्या है?",
        options: ["Plant को ठंडा रखना", "Toxic fumes व vapors को उनके source पर capture करना", "हवा में oxygen बढ़ाना", "Floor की धूल साफ करना"],
        correct: 1,
        explanation: "LEV सिस्टम खतरनाक vapors और dust को कामगारों के सांस लेने के zone से पहले ही capture कर लेता है।"
      },
      {
        q: "Fume Hood में काम करते समय Sash की सही height क्या होनी चाहिए?",
        options: ["पूरी तरह खुली", "Marked safety arrow level (12-18 inches) पर", "पूरी तरह बंद", "सिर के ऊपर"],
        correct: 1,
        explanation: "Sash को designated safe level पर रखने से airflow velocity सही बनी रहती है और containment सुनिश्चित होता है।"
      },
      {
        q: "Dilution Ventilation कब use की जाती है?",
        options: ["अत्यधिक toxic gases के लिए", "कम toxicity वाले non-corrosive vapors को disperse करने के लिए", "Fire extinguish करने के लिए", "Emergency evacuation में"],
        correct: 1,
        explanation: "Dilution ventilation कम जोखिम वाले air contaminants को fresh air मिलाकर सुरक्षित level तक dilute करती है।"
      },
      {
        q: "Ventilation duct में airflow block होने पर सबसे पहले क्या संकेत मिलता है?",
        options: ["Magnehelic gauge का pressure drop", "Lights flicker होना", "Water leakage", "Temperature अचानक गिरना"],
        correct: 0,
        explanation: "Differential pressure gauge (Magnehelic) से duct blockage या filter clogging का तुरंत पता चलता है।"
      },
      {
        q: "Confined Space में Positive Pressure Mechanical Ventilation क्यों आवश्यक है?",
        options: ["कामगारों को नींद न आए", "Toxic gas accumulation रोकना और 19.5% - 23.5% Oxygen maintain रखना", "Machine का noise कम करना", "Dust को सुखाना"],
        correct: 1,
        explanation: "Continuous forced air ventilation से toxic gases बाहर निकलती हैं और पर्याप्त oxygen बनी रहती है।"
      },
      {
        q: "Solvent handling area में ventilation fans किस type के होने चाहिए?",
        options: ["Normal domestic fans", "Explosion-proof (Flame-proof / ATEX rated)", "Silent ceiling fans", "Water mist fans"],
        correct: 1,
        explanation: "Flammable vapors के क्षेत्र में motors से spark न निकले, इसलिए Flame-proof/ATEX rated fans अनिवार्य हैं।"
      },
      {
        q: "Chemical storage warehouse में Minimum Air Changes per Hour (ACH) का क्या महत्व है?",
        options: ["Smell कम करना", "Hazardous vapor concentration को LEL के सुरक्षित स्तर से नीचे रखना", "Electricity बचाना", "Inventory cool रखना"],
        correct: 1,
        explanation: "पर्याप्त ACH से volatile vapors जमा नहीं हो पाते, जिससे आग और toxic exposure का खतरा खत्म होता है।"
      },
      {
        q: "यदि LEV का exhaust filter choke हो जाए, तो worker को क्या करना चाहिए?",
        options: ["काम जारी रखें और खिड़की खोलें", "काम तुरंत रोकें और maintenance / supervisor को report करें", "Filter हटाकर फेंक दें", "Fan की speed बढ़ाएं"],
        correct: 1,
        explanation: "Choked filter से toxic vapors worker के breathing zone में लौट सकते हैं, अतः काम रोककर report करें।"
      },
      {
        q: "HEPA Filters किस प्रकार के industrial hazards को capture करने के लिए design किए गए हैं?",
        options: ["0.3 microns या उससे बड़े 99.97% particulate matter व dust", "Pure toxic gases", "Steam vapors", "Liquid acid drops"],
        correct: 0,
        explanation: "HEPA (High-Efficiency Particulate Air) 0.3 micron तक के हानिकारक धूल व कणों को 99.97% दक्षता से रोकता है।"
      },
      {
        q: "Ventilation stack का discharge point कहाँ स्थित होना चाहिए?",
        options: ["Building के air intake vent के पास", "Roof के ऊपर, fresh air intake से पर्याप्त दूरी व ऊँचाई पर", "Ground floor के दरवाज़े पर", "Window के ठीक बाहर"],
        correct: 1,
        explanation: "Stack discharge को fresh air intake vents से दूर व ऊँचा होना चाहिए ताकि re-entrainment न हो।"
      }
    ],
    en: [
      {
        q: "What is the primary function of a Local Exhaust Ventilation (LEV) system in chemical plants?",
        options: ["To cool down the workspace", "To capture hazardous fumes and vapors at their point of generation", "To increase ambient oxygen levels", "To blow floor dust outside"],
        correct: 1,
        explanation: "LEV captures airborne contaminants directly at the emission source before they reach the worker's breathing zone."
      },
      {
        q: "What is the recommended sash height when operating a Laboratory / Plant Fume Hood?",
        options: ["Fully raised to the top", "At the marked safe operating height (usually 12-18 inches)", "Completely sealed shut", "Above head level"],
        correct: 1,
        explanation: "Operating at the marked sash height maintains proper face velocity (80-120 fpm) and containment."
      },
      {
        q: "When is General Dilution Ventilation appropriate to use?",
        options: ["For highly toxic or carcinogenic gases", "For low-toxicity, non-corrosive volatile compounds in low concentrations", "During high-temperature fires", "Inside unventilated pipelines"],
        correct: 1,
        explanation: "Dilution ventilation is suitable only for widely dispersed contaminants of low toxicity."
      },
      {
        q: "Which instrument is used to monitor differential pressure across ventilation filters?",
        options: ["Magnehelic / Manometer Gauge", "Barometer", "Hygrometer", "Hydrometer"],
        correct: 0,
        explanation: "A differential pressure gauge indicates when filters are loaded and require maintenance."
      },
      {
        q: "Why is forced mechanical ventilation mandatory during confined space operations?",
        options: ["To reduce equipment noise", "To purge toxic gases and maintain an oxygen level between 19.5% and 23.5%", "To dry wet walls", "To prevent static electricity only"],
        correct: 1,
        explanation: "Continuous forced ventilation prevents atmospheric stratification and maintains safe respirable air."
      },
      {
        q: "What type of exhaust fans must be installed in flammable solvent handling rooms?",
        options: ["Standard household fans", "Explosion-proof (Flame-proof / ATEX rated) fans with non-sparking blades", "Oscillating floor fans", "High-velocity ceiling fans"],
        correct: 1,
        explanation: "Explosion-proof designs prevent electrical sparks from igniting flammable solvent vapors."
      },
      {
        q: "What does 'Air Changes per Hour' (ACH) signify in industrial safety?",
        options: ["The speed of exhaust fan motor", "The number of times the total room air volume is replaced with fresh air per hour", "The filter replacement frequency", "The room cooling rate"],
        correct: 1,
        explanation: "ACH measures room air replacement frequency to ensure contaminants stay well below occupational exposure limits."
      },
      {
        q: "What immediate action is required if an LEV failure alarm triggers during chemical dispensing?",
        options: ["Continue work with open doors", "Halt dispensing immediately, secure chemicals, and report to EHS", "Increase pump speed", "Remove respirator"],
        correct: 1,
        explanation: "Halting work prevents hazardous vapor accumulation in the absence of mechanical extraction."
      },
      {
        q: "What is the efficiency rating of a standard HEPA filter?",
        options: ["99.97% removal of particles 0.3 microns in size", "50% removal of organic vapors", "100% removal of nitrogen gases", "75% removal of liquid drops"],
        correct: 0,
        explanation: "HEPA filters capture at least 99.97% of airborne particles down to 0.3 micrometers."
      },
      {
        q: "Where should the final discharge outlet of a hazardous exhaust stack be located?",
        options: ["Near building fresh air intakes", "Above roof level, directed upward and away from recirculating intakes", "Near main pedestrian doors", "At ground floor level"],
        correct: 1,
        explanation: "Proper stack elevation prevents hazardous exhaust from being drawn back into the facility's air intake."
      }
    ]
  },

  chemical_mixing: {
    hi: [
      {
        q: "Acid और Water को mix करते समय universal safety rule क्या है?",
        options: ["पानी को acid में डालें", "Acid को धीरे-धीरे पानी में डालें (AAA: Always Add Acid)", "दोनों को एक साथ तेजी से डालें", "पहले गर्म पानी डालें फिर acid"],
        correct: 1,
        explanation: "Always Add Acid to water (AAA rule) क्योंकि acid में पानी डालने से exothermic reaction से violent splash हो सकता है।"
      },
      {
        q: "Flammable chemicals की mixing के दौरान Electrostatic discharge रोकने के लिए क्या अनिवार्य है?",
        options: ["Bonding और Grounding wires लगाना", "Plastic containers use करना", "Fan बंद कर देना", "Metal spoons use करना"],
        correct: 0,
        explanation: "Containers को electrically bond और ground करने से static charge neutral हो जाता है और spark नहीं बनता।"
      },
      {
        q: "Chemical mixing vessel में agitator start करने से पहले क्या जांचना जरूरी है?",
        options: ["Liquid level impeller के ऊपर है और vessel vent खुला है", "Lights off हैं", "Temperature sensor बंद है", "Emergency stop दबा हुआ है"],
        correct: 0,
        explanation: "पर्याप्त liquid level और open vent से motor overload, splash और pressure build-up नहीं होता।"
      },
      {
        q: "Unknown chemical batch में exothermic runaway (अचानक तापमान बढ़ना) होने पर पहला कदम क्या है?",
        options: ["Emergency cooling (chiller) चालू करें, feed रोकें और alarm बजाएं", "पानी का मग डालें", "Vessel का lid खोलकर झांकें", "Plant छोड़कर भाग जाएं बिना बताए"],
        correct: 0,
        explanation: "Feed valve बंद करना और jacket cooling supply शुरू करना runaway reaction को काबू में करता है।"
      },
      {
        q: "Hazardous chemicals की compatibility जांचने के लिए किस document का संदर्भ लेना चाहिए?",
        options: ["Purchase Invoice", "Safety Data Sheet (SDS) Section 10: Stability and Reactivity", "Quality Certificate", "Store Register"],
        correct: 1,
        explanation: "SDS Section 10 में रासायनिक असंगति (incompatible materials) और hazardous decomposition की पूरी जानकारी होती है।"
      },
      {
        q: "Corrosive liquid mixing area में किस प्रकार का eye protection अनिवार्य है?",
        options: ["Normal reading glasses", "Indirectly vented Chemical Splash Goggles और Full Face Shield", "Sunglasses", "Welding glass"],
        correct: 1,
        explanation: "Chemical splash goggles आँखों को सील करती हैं और face shield पूरे चेहरे को splashes से बचाती है।"
      },
      {
        q: "Volatile organic solvents की mixing किस वातावरण में की जानी चाहिए?",
        options: ["Closed chamber with Local Exhaust Ventilation (LEV)", "धूप में खुले मैदान में", "बिना खिड़की वाले कमरे में", "Canteen के पास"],
        correct: 0,
        explanation: "LEV से volatile vapors तुरंत बाहर निकल जाती हैं, जिससे toxicity और आग का खतरा नहीं रहता।"
      },
      {
        q: "Chemical mixing tanks में Nitrogen Blanketing (Inerting) क्यों की जाती है?",
        options: ["Chemical को सुगंधित करने के लिए", "Oxygen displace करके explosive vapor atmosphere को निष्क्रिय करने के लिए", "Tanks को रंगने के लिए", "Weight बढ़ाने के लिए"],
        correct: 1,
        explanation: "Nitrogen inerting से vessel में oxygen concentration safe limit (MOC) से नीचे बनी रहती है।"
      },
      {
        q: "Mixing room में chemical spill होने पर spill kit का कौन सा material पहले use करेंगे?",
        options: ["Absorbent booms / socks चारों तरफ बाउंड्री बनाने के लिए", "Water pipe", "Dry broom", "Cardboard box"],
        correct: 0,
        explanation: "Absorbent booms से spill के फैलाव को तुरंत रोककर उसे confined area में सीमित किया जाता है।"
      },
      {
        q: "Mixing complete होने के बाद vessel sampling लेते समय क्या सावधानी आवश्यक है?",
        options: ["Dedicated dip-pipe / sample valve use करें और full chemical PPE पहनें", "हाथ डालकर sample निकालें", "गला लगाकर सूंघें", "बिना gloves के bottle भरें"],
        correct: 0,
        explanation: "Sampling points से toxic/corrosive exposure का सर्वाधिक खतरा होता है, अतः PPE और closed sampler अनिवार्य है।"
      }
    ],
    en: [
      {
        q: "What is the cardinal rule when diluting concentrated acid with water?",
        options: ["Always add water to acid", "Always add acid slowly to water (AAA rule)", "Pour both simultaneously at high speed", "Add boiling water first"],
        correct: 1,
        explanation: "Adding acid to water dissipates generated heat safely and prevents violent exothermic boiling/splatter."
      },
      {
        q: "Why is electrical bonding and grounding required during flammable solvent transfers?",
        options: ["To prevent static charge accumulation and spark ignition", "To speed up fluid flow", "To cool the liquid", "To measure fluid density"],
        correct: 0,
        explanation: "Bonding equalizes electrical potential between vessels while grounding dissipates charges safely to earth."
      },
      {
        q: "Which section of a Safety Data Sheet (SDS) lists chemical incompatibility and reactivity hazards?",
        options: ["Section 1: Identification", "Section 10: Stability and Reactivity", "Section 14: Transport", "Section 4: First Aid"],
        correct: 1,
        explanation: "Section 10 provides critical data on dangerous reactions, incompatible substances, and decomposition products."
      },
      {
        q: "What is the primary function of nitrogen purging (blanketing) in chemical mixing reactors?",
        options: ["To lower raw material cost", "To displace oxygen and reduce the atmosphere below the Limiting Oxygen Concentration (LOC)", "To increase reaction speed", "To eliminate the need for PPE"],
        correct: 1,
        explanation: "Nitrogen blanketing renders the vapor space inert, eliminating the oxidizer needed for combustion."
      },
      {
        q: "What is the initial emergency response upon detecting an uncontrolled exothermic runaway reaction?",
        options: ["Halt raw material feeds, maximize jacket cooling, and sound emergency protocol", "Add tap water", "Open the top manway lid", "Turn off all plant power"],
        correct: 0,
        explanation: "Stopping reactant addition and maximizing cooling capacity prevents reactor over-pressurization."
      },
      {
        q: "Which PPE combination is mandatory when sampling hot corrosive mixtures?",
        options: ["Safety glasses only", "Chemical splash goggles, full-face shield, heavy-duty chemical apron, and butyl/nitrile gloves", "Dust mask and cotton gloves", "Standard leather gloves"],
        correct: 1,
        explanation: "A full-face shield over splash goggles protects against facial and ocular chemical burns."
      },
      {
        q: "Why must mixing vessel agitators not be operated below minimum liquid submersion levels?",
        options: ["It wastes electricity only", "It can cause mechanical whipping, static generation, seal damage, and volatile splashing", "It increases liquid clarity", "It makes the product too thick"],
        correct: 1,
        explanation: "Running impellers partially submerged generates excessive static and mechanical vibration."
      },
      {
        q: "What device is installed on mixing reactors to protect against sudden pressure surges?",
        options: ["Rupture Disc / Pressure Safety Valve (PSV)", "Rotameter", "Sight glass", "Float switch"],
        correct: 0,
        explanation: "PSVs and rupture discs safely vent over-pressure to dedicated scrubbers or catch tanks."
      },
      {
        q: "How should contaminated absorbent pads from a chemical spill cleanup be handled?",
        options: ["Placed in regular office trash", "Bagged, labeled, and disposed of in designated Hazardous Waste containers", "Washed in the sink", "Left to evaporate"],
        correct: 1,
        explanation: "Absorbed hazardous chemicals must be managed as regulated hazardous waste according to environmental norms."
      },
      {
        q: "What is the purpose of Secondary Containment (bunding) around chemical mixing stations?",
        options: ["To provide extra walking room", "To retain 110% of the largest vessel capacity in the event of tank rupture or leak", "To store extra tools", "To collect rainwater"],
        correct: 1,
        explanation: "Secondary bunds prevent chemical spills from reaching soil, storm drains, or surrounding plant floors."
      }
    ]
  },

  hazard_identification: {
    hi: [
      {
        q: "Hazard Identification (खतरे की पहचान) का प्राथमिक उद्देश्य क्या है?",
        options: ["Employees पर जुर्माना लगाना", "कार्यस्थल में उन स्थितियों व पदार्थों को पहचानना जो हानि या चोट पहुंचा सकते हैं", "काम की गति धीमी करना", "Safety equipment का खर्च बढ़ाना"],
        correct: 1,
        explanation: "खतरे की पहचान से दुर्घटना होने से पहले ही जोखिम को नियंत्रित करने के उपाय किए जाते हैं।"
      },
      {
        q: "Hierarchy of Controls में सबसे प्रभावी (Most Effective) सुरक्षा उपाय कौन सा है?",
        options: ["PPE (Personal Protective Equipment)", "Elimination (खतरे को जड़ से हटाना)", "Administrative controls", "Warning signs"],
        correct: 1,
        explanation: "Elimination खतरे को पूरी तरह समाप्त कर देता है, जो सबसे सुरक्षित और प्रभावी नियंत्रण है।"
      },
      {
        q: "HIRA का पूर्ण रूप (Full Form) क्या है?",
        options: ["Hazard Identification and Risk Assessment", "Health Insurance and Risk Analysis", "High Intensity Radiation Area", "Hazard Inspection and Report Action"],
        correct: 0,
        explanation: "HIRA औद्योगिक सुरक्षा का आधार स्तंभ है, जिसमें खतरों की पहचान और उनके जोखिम का आकलन किया जाता है।"
      },
      {
        q: "किसी Chemical Plant में 'Physical Hazard' का उदाहरण क्या है?",
        options: ["Toxic gas inhalation", "High noise, vibration, tripping hazards और unguarded rotating parts", "Bacterial infection", "Job stress"],
        correct: 1,
        explanation: "शोर, कंपन, फिसलने की जगहें और घूमने वाली मशीनें Physical Hazards की श्रेणी में आती हैं।"
      },
      {
        q: "'Near Miss' (बाल-बाल बचना) की रिपोर्टिंग क्यों महत्वपूर्ण है?",
        options: ["भविष्य में होने वाले गंभीर हादसों (Fatalities/Injuries) को रोकने के लिए", "Supervisor को व्यस्त रखने के लिए", "काम बंद कराने के लिए", "Shift समय बढ़ाने के लिए"],
        correct: 0,
        explanation: "Near miss घटनाओं का विश्लेषण करने से बड़े खतरों को गंभीर दुर्घटना बनने से पहले सुधारा जा सकता है।"
      },
      {
        q: "Job Safety Analysis (JSA) कब की जानी चाहिए?",
        options: ["दुर्घटना होने के बाद", "किसी भी नए, गैर-नियमित (non-routine) या उच्च जोखिम वाले कार्य को शुरू करने से पहले", "साल में केवल एक बार", "जब Auditor आए"],
        correct: 1,
        explanation: "JSA कार्य को चरणों में बांटकर हर चरण के खतरों और सुरक्षा उपायों को पहले से निर्धारित करता है।"
      },
      {
        q: "Safety Walkthrough Inspection के दौरान क्या देखना चाहिए?",
        options: ["केवल floor की सफाई", "Unsafe Acts (असुरक्षित कार्य) और Unsafe Conditions (असुरक्षित स्थितियां)", "Workers की उपस्थिति", "Machinery का रंग"],
        correct: 1,
        explanation: "Safety inspections का मुख्य ध्यान काम करने के गलत तरीकों और खराब उपकरणों को सुधारने पर होता है।"
      },
      {
        q: "Chemical Health Hazard में 'Acute Exposure' का क्या अर्थ है?",
        options: ["कई सालों में धीरे-धीरे असर होना", "कम समय में अधिक मात्रा में exposure होने से तुरंत दुष्प्रभाव (जैसे चक्कर, जलन)", "बिना किसी लक्षण का exposure", "केवल त्वचा पर असर"],
        correct: 1,
        explanation: "Acute exposure कम समय के भारी संपर्क से तुरंत होने वाले हानिकारक प्रभावों को दर्शाता है।"
      },
      {
        q: "Safety Data Sheet (SDS) में Hazard Pictograms किस मानक के तहत आते हैं?",
        options: ["ISO 9001", "GHS (Globally Harmonized System)", "Income Tax Act", "Traffic rules"],
        correct: 1,
        explanation: "GHS मानक विश्वभर में रासायनिक खतरों के लाल हीरे वाले प्रतीकों (pictograms) को परिभाषित करता है।"
      },
      {
        q: "Working at Height (ऊंचाई पर कार्य) में Fall Hazard कब माना जाता है?",
        options: ["0.5 meter से ऊपर", "1.8 meters (6 feet) या उससे अधिक ऊंचाई पर", "10 meters से ऊपर", "केवल roof पर"],
        correct: 1,
        explanation: "औद्योगिक मानकों के अनुसार 1.8 मीटर या अधिक ऊंचाई पर गिरने से सुरक्षा (Fall Protection) अनिवार्य है।"
      }
    ],
    en: [
      {
        q: "What is the fundamental objective of Hazard Identification in workplace safety?",
        options: ["To penalize workers", "To systematically detect conditions, practices, or substances with potential to cause harm", "To slow plant operations", "To justify equipment purchases"],
        correct: 1,
        explanation: "Hazard identification allows safety controls to be applied proactively before incidents occur."
      },
      {
        q: "According to the Hierarchy of Controls, which method is the MOST effective?",
        options: ["Personal Protective Equipment (PPE)", "Elimination of the hazard", "Administrative procedures", "Engineering warnings"],
        correct: 1,
        explanation: "Elimination physically removes the hazard completely, providing the highest level of safety."
      },
      {
        q: "What does the safety acronym 'HIRA' stand for?",
        options: ["Hazard Identification and Risk Assessment", "Health Inspection and Regulatory Audit", "Hazard Index Reporting Analysis", "High Impact Radiation Assessment"],
        correct: 0,
        explanation: "HIRA is the cornerstone methodology for identifying hazards and quantifying their risk level."
      },
      {
        q: "Which of the following represents an Ergonomic Hazard in an industrial plant?",
        options: ["Exposure to chlorine gas", "Repetitive heavy manual lifting, awkward posture, and poor workstation layout", "High voltage panel", "Unguarded belt drive"],
        correct: 1,
        explanation: "Ergonomic hazards cause musculoskeletal disorders through repetitive strain and awkward body positioning."
      },
      {
        q: "Why is reporting 'Near Miss' incidents considered vital for safety management?",
        options: ["To identify root causes and implement corrective actions before real injuries occur", "To track worker attendance", "To delay project timelines", "To satisfy audits without real change"],
        correct: 0,
        explanation: "Near-miss analysis reveals latent safety weaknesses before they manifest as severe injuries or fatalities."
      },
      {
        q: "When must a Job Safety Analysis (JSA / JHA) be conducted?",
        options: ["Only after a major injury occurs", "Prior to initiating new, hazardous, or non-routine maintenance tasks", "Once every decade", "Only during annual holidays"],
        correct: 1,
        explanation: "A JSA breaks a specific job down into steps to identify hazards and controls before commencing work."
      },
      {
        q: "What is the difference between a Hazard and a Risk?",
        options: ["They are identical concepts", "A hazard is a source of potential harm; risk is the likelihood and severity of harm occurring", "Risk is physical, hazard is chemical", "Hazard is always minor, risk is fatal"],
        correct: 1,
        explanation: "A hazard is the intrinsic dangerous property (e.g. acid); risk depends on exposure frequency and controls."
      },
      {
        q: "Under GHS labeling, what does the 'Corrosion' pictogram (two test tubes pouring onto metal/hands) indicate?",
        options: ["Explosive under heat", "Causes severe skin burns, serious eye damage, or is corrosive to metals", "Radioactive source", "Flammable gas under pressure"],
        correct: 1,
        explanation: "The corrosion pictogram warns of severe chemical burns to flesh and corrosion to metal surfaces."
      },
      {
        q: "Which control is an example of an 'Engineering Control' for noise hazard?",
        options: ["Wearing earplugs", "Installing acoustic enclosures around loud compressor motors", "Putting up 'Noisy Area' signs", "Rotating operators every 2 hours"],
        correct: 1,
        explanation: "Engineering controls isolate workers from the hazard by modifying equipment or physical environment."
      },
      {
        q: "What trigger height mandates active Fall Protection (harness/guardrails) in general industry?",
        options: ["1.8 meters (6 feet) or higher above lower levels", "0.3 meters", "10 meters", "Only above 25 meters"],
        correct: 0,
        explanation: "OSHA/IS standards require fall protection systems for working heights at or above 1.8 meters."
      }
    ]
  }
};

// ─── Procedural Question Generator for Custom Topics ──────────────────────────

export function generateDynamicQuizForTopic(
  rawTopic: string,
  language: 'EN' | 'HINGLISH',
  count: number = 10
): QuizQuestion[] {
  const topic = rawTopic.toLowerCase().trim();
  const isHindi = language === 'HINGLISH';

  // Check direct bank matching
  if (topic.includes('ventilation') || topic.includes('वेंटिलेशन') || topic.includes('fume') || topic.includes('exhaust')) {
    const list = isHindi ? TOPIC_BANKS.ventilation.hi : TOPIC_BANKS.ventilation.en;
    return list.slice(0, count);
  }

  if (topic.includes('mix') || topic.includes('मिक्सिंग') || topic.includes('solvent') || topic.includes('acid') || topic.includes('chemical')) {
    const list = isHindi ? TOPIC_BANKS.chemical_mixing.hi : TOPIC_BANKS.chemical_mixing.en;
    return list.slice(0, count);
  }

  if (topic.includes('hazard') || topic.includes('पहचान') || topic.includes('inspection') || topic.includes('निरीक्षण') || topic.includes('risk')) {
    const list = isHindi ? TOPIC_BANKS.hazard_identification.hi : TOPIC_BANKS.hazard_identification.en;
    return list.slice(0, count);
  }

  // Synthesize tailored questions based on the topic
  const title = rawTopic.trim();

  const templatesHi = [
    {
      q: `${title} के दौरान कार्यस्थल पर सबसे पहला और अनिवार्य सुरक्षा कदम क्या है?`,
      options: ["बिना अनुमति कार्य शुरू करना", "Job Safety Analysis (JSA) और आवश्यक PPE की जांच करना", "काम की गति तेज करना", "Emergency exits को ब्लॉक करना"],
      correct: 1,
      explanation: `${title} शुरू करने से पहले JSA और उपयुक्त PPE की उपलब्धता सुनिश्चित करना प्राथमिक नियम है।`
    },
    {
      q: `${title} में कार्य करते समय ऑपरेटर को किस प्रकार के PPE का उपयोग करना चाहिए?`,
      options: ["केवल साधारण कपड़े", "Task-specific PPE (Safety Shoes, Helmet, Goggles व उपयुक्त Gloves)", "बिना जूते नंगे पैर", "Sunglasses"],
      correct: 1,
      explanation: `${title} में शामिल विशिष्ट खतरों से बचाव के लिए अनुमोदित सुरक्षा उपकरण अनिवार्य हैं।`
    },
    {
      q: `${title} क्षेत्र में किसी भी आपातकालीन स्थिति (Emergency) में पहला कदम क्या होना चाहिए?`,
      options: ["Emergency Alarm बजाएं और कार्य तुरंत रोकें", "अकेले समस्या सुलझाने का प्रयास करें", "चुपचाप वहां से चले जाएं", "काम जारी रखें"],
      correct: 0,
      explanation: "आपातकाल में तुरंत अलार्म बजाकर सभी को सतर्क करना और सुरक्षित इवैक्यूएशन करना चाहिए।"
    },
    {
      q: `${title} में प्रयुक्त उपकरणों के निरीक्षण (Inspection) का सही समय क्या है?`,
      options: ["दुर्घटना होने के बाद", "प्रत्येक Shift या कार्य प्रारंभ करने से पूर्व", "महीने में एक बार", "केवल ऑडिट के समय"],
      correct: 1,
      explanation: "कार्य शुरू करने से पहले Pre-use inspection करने से खराब उपकरणों से होने वाले हादसों को रोका जा सकता है।"
    },
    {
      q: `${title} से संबंधित SOP (Standard Operating Procedure) का पालन क्यों आवश्यक है?`,
      options: ["कागजी कार्रवाई बढ़ाने के लिए", "प्रक्रियागत गलतियों व सुरक्षा जोखिमों को शून्य करने के लिए", "काम को धीमा करने के लिए", "Shift बढ़ाने के लिए"],
      correct: 1,
      explanation: "SOP प्रमाणित सुरक्षित कार्यविधि है जिसका पालन कार्यस्थल सुरक्षा सुनिश्चित करता है।"
    },
    {
      q: `${title} में यदि कोई उपकरण असामान्य आवाज या गंध दे, तो क्या करना चाहिए?`,
      options: ["उपकरण तुरंत बंद करें और Supervisor/Maintenance को सूचित करें", "आवाज अनसुनी करके काम करते रहें", "पानी डाल दें", "Speed बढ़ाएं"],
      correct: 0,
      explanation: "असामान्य स्थिति में तुरंत मशीन बंद कर Lockout लगाना और रिपोर्ट करना चाहिए।"
    },
    {
      q: `${title} के दौरान Housekeeping (कार्यस्थल स्वच्छता) की क्या भूमिका है?`,
      options: ["केवल दिखावे के लिए", "Slips, Trips और Falls जैसे खतरों को रोकने के लिए", "कोई महत्व नहीं", "समय बर्बाद करने के लिए"],
      correct: 1,
      explanation: "साफ-सुथरा कार्यस्थल 50% से अधिक सामान्य दुर्घटनाओं को रोकने में सहायक होता है।"
    },
    {
      q: `${title} में कार्य करते समय First Aid Kit और Eyewash Station की जानकारी क्यों आवश्यक है?`,
      options: ["आकस्मिक चोट या रासायनिक संपर्क में त्वरित प्राथमिक उपचार के लिए", "निरीक्षण के समय दिखाने के लिए", "सजावट के लिए", "आवश्यक नहीं है"],
      correct: 0,
      explanation: "Emergency में समय बर्बाद किए बिना त्वरित उपचार हेतु आपातकालीन उपकरणों का स्थान पता होना चाहिए।"
    },
    {
      q: `${title} से संबंधित Hazardous Waste या अपशिष्ट का निपटान कैसे किया जाना चाहिए?`,
      options: ["नाली में बहा देना", "निर्धारित व लेबल लगे Hazardous Waste Containers में", "खुले मैदान में फेंकना", "जला देना"],
      correct: 1,
      explanation: "पर्यावरण व कार्यस्थल सुरक्षा हेतु खतरनाक कचरे को लेबल लगे कंटेनरों में सुरक्षित रखना अनिवार्य है।"
    },
    {
      q: `${title} में कार्य करने वाले नए प्रशिक्षुओं (Trainees) के लिए क्या अनिवार्य है?`,
      options: ["Supervisor की देखरेख में कार्य करना व उचित सुरक्षा प्रशिक्षण लेना", "बिना गाइडेंस मशीन चलाना", "Safety rules नजरअंदाज करना", "PPE न पहनना"],
      correct: 0,
      explanation: "नए कामगारों को पूर्ण प्रशिक्षण और पर्यवेक्षण के तहत ही कार्य करना चाहिए।"
    }
  ];

  const templatesEn = [
    {
      q: `What is the primary mandatory step before commencing any work related to ${title}?`,
      options: ["Begin work without prior approval", "Perform a Job Safety Analysis (JSA) and verify required PPE", "Bypass all safety interlocks", "Block emergency exit passages"],
      correct: 1,
      explanation: `Conducting a JSA and checking equipment readiness is essential before executing ${title}.`
    },
    {
      q: `Which PPE standard must operators strictly wear while executing ${title}?`,
      options: ["Regular street wear only", "Task-specific PPE including safety boots, hard hat, splash goggles, and rated gloves", "No footwear", "Casual sunglasses"],
      correct: 1,
      explanation: `Appropriate certified PPE protects against specific hazards involved in ${title}.`
    },
    {
      q: `What is the initial immediate response during an emergency while performing ${title}?`,
      options: ["Trigger the Emergency Alarm, halt operations, and notify supervisors", "Attempt to handle severe emergencies alone", "Ignore alarms and continue", "Hide the issue"],
      correct: 0,
      explanation: "Activating emergency alarms ensures rapid plant-wide response and safe worker evacuation."
    },
    {
      q: `When should pre-operational inspections for ${title} equipment be performed?`,
      options: ["Only after an equipment failure", "Prior to the start of each work shift", "Once per year", "Only during government audits"],
      correct: 1,
      explanation: "Pre-shift equipment inspection detects wear, leaks, or defects before hazardous operations begin."
    },
    {
      q: `Why is strict adherence to the Standard Operating Procedure (SOP) critical for ${title}?`,
      options: ["To increase bureaucratic paperwork", "To eliminate procedural errors and mitigate catastrophic safety risks", "To artificially slow down production", "To extend working hours"],
      correct: 1,
      explanation: "SOPs outline validated, safe operating steps to prevent accidents and chemical exposure."
    },
    {
      q: `What action is required if abnormal noise, vibration, or smoke occurs during ${title}?`,
      options: ["Isolate/shutdown the equipment immediately, apply LOTO if needed, and report", "Continue operating until the shift ends", "Pour water indiscriminately", "Increase operational speed"],
      correct: 0,
      explanation: "Stopping faulty machinery prevents catastrophic mechanical breakdown and operator injury."
    },
    {
      q: `What role does 5S / Housekeeping play in the safety of ${title}?`,
      options: ["Cosmetic appearance only", "Preventing slips, trips, falls, and blocked access to emergency gear", "No measurable safety role", "Wasting operator time"],
      correct: 1,
      explanation: "Good housekeeping eliminates common slip and trip hazards and keeps emergency pathways clear."
    },
    {
      q: `Why must workers know the location of emergency eyewash and first aid stations in the ${title} area?`,
      options: ["For immediate response during accidental chemical exposure or trauma", "Only for audit presentation", "For general plant decoration", "It is optional knowledge"],
      correct: 0,
      explanation: "Immediate flushing within the first 10 seconds of chemical eye contact prevents irreversible corneal damage."
    },
    {
      q: `How must contaminated materials or hazardous byproducts from ${title} be handled?`,
      options: ["Discharged into standard sewage drains", "Collected in labeled, compliant Hazardous Waste containers", "Dumped in open plant yards", "Burned on site"],
      correct: 1,
      explanation: "Hazardous byproducts must be segregated into sealed, labeled containers per environmental guidelines."
    },
    {
      q: `What is mandatory for newly inducted trainees assigned to ${title}?`,
      options: ["Direct supervision by experienced personnel and certified safety training", "Operating complex machines unsupervised", "Bypassing PPE rules", "Ignoring safety signs"],
      correct: 0,
      explanation: "Trainees must be mentored and thoroughly trained on SOPs before handling independent tasks."
    }
  ];

  const source = isHindi ? templatesHi : templatesEn;
  return source.slice(0, count);
}
