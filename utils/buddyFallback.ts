export type BuddyMessageLike = {
  role?: string;
  content?: string;
};

export const BUDDY_FALLBACK_SIGNATURES = [
  'My live AI connection is slow',
  'मेरा live AI connection',
  'In an emergency, stop work immediately',
  'Emergency में काम तुरंत रोक दें',
  "I don't understand",
  'mujhe samajh',
];

type BuddyMode = 'english' | 'hinglish';

const EMERGENCY_KEYWORDS = [
  'emergency',
  'fire',
  'alarm',
  'evacuate',
  'evacuation',
  'spill',
  'leak',
  'gas',
  'explosion',
  'blast',
  'injury',
  'first aid',
  'rescue',
  'chemical release',
];

export function getBuddyModeFromMessages(messages: BuddyMessageLike[]): BuddyMode {
  const systemMessage = messages.find((message) => message.role === 'system' && typeof message.content === 'string');
  const content = typeof systemMessage?.content === 'string' ? systemMessage.content : '';
  return content.includes('[LANGUAGE_MODE: HINGLISH]') ? 'hinglish' : 'english';
}

export function getLatestBuddyUserMessage(messages: BuddyMessageLike[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.role === 'user' && typeof message.content === 'string' && message.content.trim()) {
      return message.content.trim();
    }
  }

  return '';
}

type SafetyKnowledgeEntry = {
  triggers: string[];
  en: string;
  hi: string;
};

const SAFETY_KNOWLEDGE_BASE: SafetyKnowledgeEntry[] = [
  {
    triggers: ['chemical spill', 'spill', 'chemical leak', 'leak', 'acid spill', 'solvent spill'],
    en: '⚠️ Chemical Spill Emergency SOP:\n1. Evacuate non-essential personnel immediately.\n2. Identify the chemical from SDS and check hazards.\n3. Put on appropriate chemical PPE (nitrile/butyl gloves, splash goggles, respirator).\n4. Stop the source if safe to do so.\n5. Contain with spill kit absorbents/neutralizers from perimeter inwards.\n6. Dispose contaminated waste in hazardous waste bins.\n7. Report to EHS Officer immediately.',
    hi: '⚠️ Chemical Spill Emergency SOP:\n1. Non-essential personnel को तुरंत evacuate करें।\n2. SDS (Safety Data Sheet) से chemical identify करें और hazards check करें।\n3. Appropriate PPE (Chemical gloves, splash goggles, respirator) पहनें।\n4. यदि safe हो तो spill का source बंद करें।\n5. Spill kit absorbents से चारों तरफ से अंदर की ओर contain करें।\n6. Contaminated material को hazardous waste bin में डालें।\n7. EHS Officer को तुरंत report करें।',
  },
  {
    triggers: ['ppe', 'personal protective equipment', 'safety gear', 'helmet', 'gloves', 'safety shoes'],
    en: '🛡️ Mandatory Plant PPE Protocol:\n- Head: Hard Hat (EN 397 / IS 2925) at all plant floors.\n- Eyes: Safety Spectacles / Splash Goggles when handling fluids or grinding.\n- Hands: Nitrile gloves for chemicals, Cut-resistant Level 5 for machining, Leather for hot work.\n- Feet: Steel-toe anti-static safety boots (IS 15298).\n- Respiratory: N95 for dust/particulates, Organic Vapor (OV) cartridge for solvent areas.',
    hi: '🛡️ Plant PPE Protocol:\n- Head: Hard Hat (Industrial Safety Helmet) अनिवार्य है।\n- Eyes: Safety Glasses या Splash Goggles fluids/grinding के दौरान पहनें।\n- Hands: Chemicals के लिए Nitrile gloves, Machining के लिए Cut-resistant Level 5 gloves।\n- Feet: Steel-toe Safety Boots पहनना अनिवार्य है।\n- Respiratory: Dust के लिए N95 mask, Solvents/Vapors के लिए OV Cartridge Respirator use करें।',
  },
  {
    triggers: ['loto', 'lockout', 'tagout', 'lock out', 'energy isolation', 'machine maintenance'],
    en: '🔒 LOTO (Lockout / Tagout) 6-Step SOP:\n1. Preparation: Notify affected operators and identify all energy sources (electrical, pneumatic, hydraulic, chemical).\n2. Shutdown: Turn off equipment using standard controls.\n3. Isolation: Disconnect all energy isolation devices.\n4. Lock & Tag: Apply personal padlock and warning tag.\n5. Stored Energy Release: Bleed pressure, discharge capacitors, block gravity-fed parts.\n6. Verification (Zero Energy Check): Attempt restart to confirm machine is fully de-energized.',
    hi: '🔒 LOTO (Lockout / Tagout) 6-Step SOP:\n1. Preparation: Operators को inform करें और सभी energy sources identify करें।\n2. Shutdown: Equipment को standard switch से बंद करें।\n3. Isolation: Main electrical/pneumatic breaker disconnect करें।\n4. Lock & Tag: अपना personal padlock और warning tag लगाएं।\n5. Stored Energy Release: Pressure bleed करें, capacitors discharge करें।\n6. Zero Energy Check: Test start करके verify करें कि machine dead है।',
  },
  {
    triggers: ['fire', 'extinguisher', 'pass', 'fire alarm', 'aag'],
    en: '🔥 Fire Emergency & PASS Technique:\n1. Pull fire alarm and shout "Fire!".\n2. Evacuate via nearest green emergency exit route.\n3. If trained and fire is small (incipient stage), use extinguisher with PASS:\n   - P: Pull the pin.\n   - A: Aim at the base of the fire.\n   - S: Squeeze the trigger.\n   - S: Sweep side to side.\n4. Never turn your back on a fire. Proceed to Emergency Assembly Point.',
    hi: '🔥 Fire Emergency & PASS Technique:\n1. तुरंत Fire Alarm बजाएं और सबको alert करें।\n2. Nearest Emergency Exit से सुरक्षित बाहर निकलें।\n3. छोटी आग होने पर PASS method से Fire Extinguisher use करें:\n   - P: Pin pull करें।\n   - A: Fire के base पर Aim करें।\n   - S: Trigger Squeeze (दबाएं) करें।\n   - S: Side-to-side Sweep करें।\n4. Assembly Point पर पहुंचकर headcount confirm करें।',
  },
  {
    triggers: ['confined space', 'tank entry', 'vessel', 'manhole', 'gas test'],
    en: '🕳️ Confined Space Entry Rules:\n1. Never enter without a valid Confined Space Work Permit.\n2. Continuous 4-Gas atmospheric testing required (Oxygen: 19.5% - 23.5%, LEL < 10%, CO < 25ppm, H2S < 10ppm).\n3. Positive ventilation must run throughout the entry.\n4. Dedicated Standby Attendant (Hole Watcher) stationed outside at all times.\n5. Full body harness with retrieval lifeline connected.',
    hi: '🕳️ Confined Space Entry Rules:\n1. Valid Confined Space Permit के बिना कभी अंदर न जाएं।\n2. Multi-Gas detector से Oxygen (19.5%-23.5%), Flammable gas (<10% LEL), Toxic gas check करें।\n3. Continuous mechanical ventilation चालू रखें।\n4. बाहर Standby Attendant (Hole Watcher) हमेशा तैनात होना चाहिए।\n5. Safety Harness और Lifeline rope connect रखें।',
  },
  {
    triggers: ['electrical', 'shock', 'arc flash', 'high voltage', 'electric'],
    en: '⚡ Electrical Safety Standards:\n1. Assume all wires and circuits are live until tested with a calibrated multi-meter / voltage tester.\n2. Maintain minimum 1-meter clearance in front of electrical panels.\n3. Use insulated tools rated for 1000V (IEC 60900).\n4. In case of electric shock: Do NOT touch the victim directly. Shut off master power or use non-conductive rescue hook.\n5. Apply CPR immediately if pulse is lost and call emergency medical services.',
    hi: '⚡ Electrical Safety Standards:\n1. जब तक verify न हो, सभी wires को live मानें।\n2. Electrical panels के सामने कम से कम 1 meter clearance रखें।\n3. 1000V rated insulated tools use करें।\n4. Electric shock लगने पर victim को सीधे हाथ न लगाएं; main breaker off करें या wooden stick/rescue hook use करें।\n5. जरूरत पड़ने पर तुरंत CPR दें और medical emergency call करें।',
  },
  {
    triggers: ['first aid', 'eyewash', 'chemical in eye', 'burn', 'injury', 'cut'],
    en: '🩹 Emergency First Aid:\n- Chemical in Eyes: Flush eyes at Emergency Eyewash Station for minimum 15 minutes continuously holding eyelids open.\n- Chemical on Skin: Use Emergency Safety Shower, strip contaminated clothing, wash for 15 minutes.\n- Minor Thermal Burn: Cool with running potable water for 10-20 minutes. Do not pop blisters.\n- Deep Cut/Bleeding: Apply direct pressure with clean sterile gauze, elevate limb, seek medical aid.',
    hi: '🩹 Emergency First Aid:\n- आँखों में Chemical जाने पर: Emergency Eyewash station पर कम से कम 15 minutes आँखें खोलकर धोएं।\n- Body पर Chemical गिरने पर: Emergency Safety Shower चालू करें और कपड़े हटाकर 15 min धोएं।\n- जलने पर (Burn): सादे बहते पानी से 10-20 मिनट ठंडा करें, blister न फोड़ें।\n- Cut / Bleeding: Sterile cloth से direct pressure लगाएं और immediate First Aider से help लें।',
  },
  {
    triggers: ['hazard identification', 'hazard', 'खतरे की पहचान', 'खतरा', 'hira', 'risk assessment', 'hazard kya hai'],
    en: '⚠️ Hazard Identification Guide:\nHazard Identification is the systematic process of finding workplace conditions, substances, or actions that can cause injury or illness.\n\n5 Major Hazard Categories:\n1. Physical: Noise, vibration, unguarded machines, slip/trip points.\n2. Chemical: Toxic vapors, corrosive acids, flammable solvents, dust.\n3. Biological: Fungi, bacteria, bio-waste.\n4. Ergonomic: Heavy repetitive lifting, awkward posture.\n5. Psychosocial: Fatigue, high stress.\n\nMethodology: Conduct regular workplace walkthroughs, review SDS, analyze past Near Misses, and perform HIRA before new operations.',
    hi: '⚠️ Hazard Identification (खतरे की पहचान):\nHazard Identification वह व्यवस्थित प्रक्रिया है जिससे कार्यस्थल पर मौजूद उन सभी स्थितियों, पदार्थों या कार्य-प्रणालियों की पहचान की जाती है जो चोट, बीमारी या नुकसान पहुंचा सकती हैं।\n\nमुख्य 5 प्रकार के Hazards:\n1. Physical Hazards: तेज आवाज, कंपन, खुली घूमने वाली मशीनें, फिसलने वाले फर्श।\n2. Chemical Hazards: जहरीली गैसें, एसिड, सॉल्वैंट्स, हानिकारक धूल।\n3. Ergonomic Hazards: भारी वजन गलत तरीके से उठाना, लंबे समय तक गलत posture।\n4. Biological Hazards: बैक्टीरिया, फंगस व बायो-वेस्ट।\n5. Psychosocial: अत्यधिक तनाव व थकान।\n\nकैसे करें: Regular Walkthroughs करें, SDS का अध्ययन करें, Near Miss रिपोर्ट देखें और HIRA (Hazard Identification & Risk Assessment) लागू करें।',
  },
  {
    triggers: ['safety inspection', 'inspection', 'सुरक्षा निरीक्षण', 'निरीक्षण कैसे करें', 'inspection kaise kare', 'audit', 'safety audit', 'walkthrough'],
    en: '📋 Step-by-Step Safety Inspection Procedure:\n1. Preparation: Review area risk assessments (HIRA/JSA), past incident logs, and obtain a standard Safety Inspection Checklist.\n2. Physical Walkthrough:\n   - Check Housekeeping: Clear aisles, clean walkways, no leaks.\n   - Verify PPE Compliance: All workers wearing mandated gear.\n   - Machine Guarding: Interlocks functional, emergency stops unblocked.\n   - Chemical Safety: Secondary containment intact, SDS accessible, containers labeled.\n   - Fire & Electrical: Fire extinguishers inspected, panel doors closed, emergency exits clear.\n3. Identify & Classify: Note Unsafe Acts (worker behavior) and Unsafe Conditions (equipment defects).\n4. Report & CAPA: Document findings with photos, assign Corrective and Preventive Actions (CAPA) with target dates, and conduct follow-up verification.',
    hi: '📋 Safety Inspection (सुरक्षा निरीक्षण) करने की सही विधि:\n1. पूर्व तैयारी (Preparation):\n   - क्षेत्र का Safety Checklist लें और पिछले Near Miss / Incident रिकॉर्ड्स की समीक्षा करें।\n2. कार्यस्थल Walkthrough (Physical Check):\n   - Housekeeping: रास्ते साफ हों, तेल/केमिकल का फैलाव न हो।\n   - PPE Compliance: सभी कामगार सही PPE पहने हों।\n   - Machine Guarding: सभी सुरक्षा गार्ड लगे हों और Emergency Stop Switch काम कर रहे हों।\n   - Chemical Safety: ड्रमों पर GHS Labels लगे हों और SDS उपलब्ध हो।\n   - Fire Safety: Fire Extinguishers व Eyewash Station के रास्ते में कोई बाधा न हो।\n3. कमियों की पहचान: Unsafe Acts (गलत आदतें) और Unsafe Conditions (खराब उपकरण) नोट करें।\n4. CAPA व रिपोर्टिंग: Findings की रिपोर्ट बनाएं, सुधारात्मक कदम (CAPA) तय करें और follow-up verification करें।',
  },
  {
    triggers: ['ventilation', 'वेंटिलेशन', 'fume hood', 'exhaust', 'lev', 'air quality'],
    en: '💨 Industrial Ventilation Standards:\n1. Local Exhaust Ventilation (LEV): Captures toxic fumes/vapors directly at the emission point.\n2. Fume Hood Operation: Keep sash at certified operating height (12-18 inches), never block back baffles.\n3. Flammable Vapor Rooms: Require explosion-proof/ATEX certified exhaust fans.\n4. Dilution Ventilation: Maintains safe Air Changes per Hour (ACH) in chemical storage.\n5. Confined Space: Mandatory continuous positive pressure forced ventilation providing 19.5% - 23.5% Oxygen.',
    hi: '💨 Industrial Ventilation (वेंटिलेशन) मानक:\n1. Local Exhaust Ventilation (LEV): जहरीले धुएं व वाष्प को उनके स्रोत पर ही खींचकर बाहर निकालता है।\n2. Fume Hood का उपयोग: Sash को निर्धारित safe height (12-18 इंच) पर रखें और अंदर airflow vents ब्लॉक न करें।\n3. ज्वलनशील सॉल्वेंट क्षेत्र: Flame-proof (ATEX rated) exhaust fans का ही उपयोग करें।\n4. केमिकल स्टोरेज: पर्याप्त Air Changes per Hour (ACH) से वाष्प जमा होने से रोकें।\n5. Confined Space: काम के दौरान लगातार Forced Air Ventilation चालू रखें ताकि Oxygen 19.5%-23.5% बनी रहे।',
  },
  {
    triggers: ['chemical mixing', 'केमिकल मिक्सिंग', 'mixing sop', 'acid mixing', 'solvent mixing'],
    en: '🧪 Chemical Mixing Safety SOP:\n1. AAA Rule: Always Add Acid slowly to water; NEVER add water to acid.\n2. Electrostatic Bonding & Grounding: Connect earthing clamps to metal drums before dispensing flammable solvents.\n3. Vessel Readiness: Verify agitator liquid submersion, open vents, and cooling supply.\n4. Incompatibility Check: Consult SDS Section 10 before mixing any unfamiliar chemicals.\n5. PPE: Chemical splash goggles, face shield, butyl/nitrile gloves, and rubber apron are mandatory.',
    hi: '🧪 Chemical Mixing Safety SOP:\n1. AAA Rule: हमेशा Acid को धीरे-धीरे पानी में मिलाएं; कभी भी पानी को एसिड में न डालें।\n2. Earthing & Bonding: ज्वलनशील केमिकल्स ट्रांसफर करते समय static spark रोकने के लिए grounding wires जरूर लगाएं।\n3. Vessel Check: Agitator शुरू करने से पहले liquid level और vessel vent खुला होना जांचें।\n4. Compatibility: नए केमिकल मिक्स करने से पहले SDS Section 10 में असंगति (reactivity) चेक करें।\n5. अनिवार्य PPE: Chemical splash goggles, face shield, nitrile/butyl gloves और chemical apron पहनें।',
  },
  {
    triggers: ['resin handling', 'रेजिन', 'resin', 'polymerization', 'catalyst'],
    en: '🧬 Resin Handling Safety Guide:\n1. Exothermic Control: Monitor temperature closely; adding excess catalyst (MEKP) causes violent thermal runaway.\n2. Vapor Containment: Resin monomers (Styrene) emit heavy vapors; operate under high-velocity exhaust.\n3. Skin Contact: Uncured resins cause severe contact dermatitis; use barrier cream and chemical nitrile gloves.\n4. Storage: Store resin drums in cool, shaded, well-ventilated areas away from direct sunlight and oxidizers.',
    hi: '🧬 Resin Handling Safety Guide:\n1. Exothermic Control: Catalyst (जैसे MEKP) सही अनुपात में मिलाएं; अधिक मात्रा से अत्यधिक गर्मी व आग लग सकती है।\n2. Vapor Extraction: रेजिन से निकलने वाले Styrene vapors भारी होते हैं; Local Exhaust के पास ही कार्य करें।\n3. Skin Protection: Uncured resin से त्वचा रोग (Dermatitis) हो सकता है; Nitrile gloves व barrier cream लगाएं।\n4. Storage: रेजिन ड्रमों को ठंडी, छायादार और हवादार जगह पर हीट सोर्सेज से दूर रखें।',
  },
  {
    triggers: ['hazardous waste', 'खतरनाक अपशिष्ट', 'waste disposal', 'chemical waste', 'toxic waste'],
    en: '♻️ Hazardous Waste Disposal Protocol:\n1. Segregation: Never mix incompatible waste streams (e.g., acids with cyanides or solvents with oxidizers).\n2. Container Compliance: Store in UN-approved, sealed, leak-proof drums with secondary containment.\n3. GHS Labeling: Clearly label with waste chemical name, date of generation, and hazard pictograms.\n4. Manifesting & TSDF: Hand over only to authorized hazardous waste recyclers/TSDF facilities with valid manifest.',
    hi: '♻️ Hazardous Waste (खतरनाक अपशिष्ट) निपटान SOP:\n1. पृथक्करण (Segregation): अलग-अलग केमिकल्स (जैसे Acid और Solvent) को एक साथ कभी न मिलाएं।\n2. Containers: केमिकल वेस्ट को सील बंद, लीक-प्रूफ व सेकेंडरी कंटेनमेंट वाले ड्रमों में रखें।\n3. GHS Labeling: ड्रम पर अपशिष्ट का नाम, उत्पादन की तारीख और Hazard Pictogram अनिवार्य रूप से लगाएं।\n4. Authorized Disposal: कचरे का निपटान केवल अधिकृत TSDF (Hazardous Waste Treatment) फैसिलिटी के माध्यम से करें।',
  },
  {
    triggers: ['machine guarding', 'मशीन गार्डिंग', 'machine safety', 'interlock', 'nip point'],
    en: '⚙️ Machine Guarding Standards:\n1. Guard Types: Fixed barriers, interlocked access gates, and presence-sensing light curtains.\n2. Pinch Points: All rotating shafts, gears, pulleys, and nip points must be 100% guarded.\n3. Interlock Integrity: Never bypass, tape over, or defeat safety limit switches.\n4. Emergency Stops: E-stop buttons must be clearly visible, red mushroom style, and tested daily.',
    hi: '⚙️ Machine Guarding (मशीन गार्डिंग) नियम:\n1. Guarding के प्रकार: Fixed Guards, Interlocked Gates और Safety Light Curtains।\n2. Pinch Points: सभी घूमने वाले शाफ्ट, बेल्ट, पुली व गियर्स पर मजबूत गार्ड लगे होने चाहिए।\n3. Interlocks: सेफ्टी लिमिट स्विच को कभी बाईपास या टेप न करें।\n4. Emergency Stop: रेड मशरूम टाइप E-Stop बटन हमेशा साफ दिखने चाहिए और डेली टेस्ट होने चाहिए।',
  },
  {
    triggers: ['factory navigation', 'फैक्ट्री नेविगेशन', 'walkway', 'forklift', 'plant traffic'],
    en: '🚶 Plant Navigation & Traffic Safety:\n1. Designated Walkways: Always walk inside yellow pedestrian lines; never take shortcuts through machinery zones.\n2. Blind Corners: Stop, look, and listen at all intersections; sound horn if operating material handling equipment.\n3. Forklift Clearance: Maintain minimum 3-meter safety distance from moving forklifts; never walk under raised forks.\n4. Distraction-Free: No mobile phone usage while walking on plant operational floors.',
    hi: '🚶 Factory Navigation (फैक्ट्री नेविगेशन) सुरक्षा:\n1. Pedestrian Walkways: हमेशा पीले रंग की पैदल लेन (Yellow Walkways) के अंदर ही चलें।\n2. Blind Corners: मोड़ों पर रुकें और देखें; Forklift का हॉर्न ध्यान से सुनें।\n3. Forklift Safety: चलती फोर्कलिफ्ट से कम से कम 3 मीटर की दूरी रखें और उठे हुए सामान के नीचे कभी न खड़े हों।\n4. No Mobile Zone: प्लांट फ्लोर पर चलते समय मोबाइल फोन का उपयोग सख्त मना है।',
  },
  {
    triggers: ['ergonomics', 'एर्गोनॉमिक्स', 'back pain', 'manual lifting', 'lifting posture'],
    en: '🏋️ Industrial Ergonomics & Manual Handling:\n1. Power Zone Lifting: Keep heavy loads close to your body between mid-thigh and chest height.\n2. Proper Posture: Bend your knees and hips—NOT your lower back. Keep feet shoulder-width apart.\n3. Weight Limits: Maximum manual lift for a single person is 20-25 kg; use mechanical hoists or two-person lift for heavier loads.\n4. Repetitive Strain: Take micro-breaks, stretch, and adjust workstation heights to neutral elbow levels.',
    hi: '🏋️ Workplace Ergonomics (कार्यस्थल एर्गोनॉमिक्स):\n1. वजन उठाने का सही तरीका: घुटने मोड़कर बैठें और पैरों की ताकत से उठें, कमर को कभी न झुकाएं।\n2. Load को पास रखें: सामान को शरीर के करीब रखें, दूर रखकर उठाने से रीढ़ की हड्डी पर 10 गुना दबाव पड़ता है।\n3. वजन सीमा: एक व्यक्ति अधिकतम 20-25 kg ही उठाए; भारी सामान के लिए Hoist/Crane या सहकर्मी की मदद लें।\n4. Micro-Breaks: लगातार एक ही मुद्रा में काम करने के बीच 30 सेकंड का स्ट्रेचिंग ब्रेक लें।',
  },
  {
    triggers: ['apprentice', 'trainee', 'apprenticeship', 'naps', 'intern', 'प्रशिक्षु', 'apprentice koun', 'who is apprentice'],
    en: '👷 Industrial Apprentice & Trainee Guide:\nAn Apprentice (प्रशिक्षु) is a technical trainee undergoing structured On-the-Job Training (OJT) under experienced plant engineers per the Apprenticeship Act / NAPS.\n\nKey Responsibilities:\n1. Safety Compliance: Strictly wear mandatory PPE (Helmet, Safety Boots, Goggles) and adhere to plant safety rules.\n2. SOP Adherence: Learn and follow validated Standard Operating Procedures for chemical handling, mixing, and valve operations.\n3. Zero Unsupervised Operations: Never operate machinery, enter confined spaces, or open chemical lines without certified mentor authorization.\n4. Hazard & Near-Miss Reporting: Immediately report any unsafe acts, chemical leaks, or faulty gauges to your shift supervisor.',
    hi: '👷 Industrial Apprentice (प्रशिक्षु) की जानकारी व जिम्मेदारियां:\nApprentice (प्रशिक्षु) वह कामगार होता है जो Apprenticeship Act / NAPS के तहत Chemical Plant में अनुभवी इंजीनियर्स व सुपरवाइजर्स की देखरेख में व्यावहारिक कार्य प्रशिक्षण (On-the-Job Training) प्राप्त करता है।\n\nमुख्य जिम्मेदारियां:\n1. 100% सुरक्षा नियम: अनिवार्य PPE (Safety Shoes, Helmet, Goggles) पहनना और प्लांट के सेफ्टी प्रोटोकॉल का पालन करना।\n2. SOP का पालन: केमिकल हैंडलिंग, मिक्सिंग व वाल्व ऑपरेशन के लिए निर्धारित Standard Operating Procedures का अध्ययन व पालन करना।\n3. बिना अनुमति काम न करना: सुपरवाइजर की अनुमति व देखरेख के बिना किसी भी भारी मशीन या केमिकल वॉल्व को न छुएं।\n4. Near Miss रिपोर्टिंग: किसी भी खतरे, केमिकल रिसाव या खराब उपकरण की सूचना तुरंत शिफ्ट सुपरवाइजर को दें।',
  },
  {
    triggers: ['future trend', 'chemical plant future', 'future', 'trend', 'industry 4.0', 'automation', 'green chemistry', 'ai in chemical', 'भविष्य'],
    en: '🚀 Future Trends in Chemical & Process Industries:\n1. Industry 4.0 & Digital Twins: Real-time 3D simulation of reactors and pipelines using IoT sensors to predict equipment failure before it occurs.\n2. AI & Advanced Process Control (APC): Machine learning algorithms optimizing reaction yield, temperature control, and energy efficiency automatically.\n3. Green Chemistry & Circular Economy: Shifting to bio-based feedstocks, non-toxic solvents, and Zero Liquid Discharge (ZLD) effluent treatment.\n4. Robotics & Drones: Using ATEX-rated robotic crawlers for confined space and tank inspections to eliminate human exposure.\n5. Connected Worker Wearables: Smart helmets with heads-up displays, real-time gas exposure monitors, and biometric fatigue tracking.',
    hi: '🚀 Chemical Plants में भविष्य के मुख्य रुझान (Future Trends):\n1. Industry 4.0 & Digital Twins: IoT सेंसर्स द्वारा प्लांट का डिजिटल मॉडल बनाकर खराबी आने से पहले ही प्रेडिक्टिव मेंटेनेंस करना।\n2. AI व Advanced Process Control: AI द्वारा केमिकल मिक्सिंग, तापमान और ऊर्जा खपत को ऑटोमैटिक ऑप्टिमाइज करना।\n3. Green Chemistry व Sustainability: पर्यावरण-अनुकूल सॉल्वैंट्स, बायो-पॉलीमर्स और Zero Liquid Discharge (ZLD) से प्रदूषण शून्य करना।\n4. Robotics व Drones: Confined space और ऊंचे टैंकों के निरीक्षण के लिए इंसानों की जगह रोबोट्स व ड्रोन्स का उपयोग।\n5. Smart Worker Wearables: कामगारों के लिए गैस डिटेक्टिंग स्मार्ट हेलमेट और AR-आधारित सुरक्षित मेंटेनेंस टूल्स।',
  },
  {
    triggers: ['aur pucho', 'aur batao', 'kuch aur', 'next question', 'ask me', 'quiz me', 'aur puchho', 'aur poochho', 'another question', 'aur pucho na'],
    en: '🎯 Ready for your next Safety Practice Question!\n\nQuestion:\n"What is the first step you should take when a chemical splash accidentally enters a worker\'s eyes?"\n\nA) Apply an ice pack\nB) Flush at the Emergency Eyewash Station for at least 15 minutes\nC) Rub the eye with sterile cotton\nD) Wait for medical staff without flushing\n\n👉 Reply with your answer (A, B, C, or D), or ask me about any industrial SOP!',
    hi: '🎯 आपके लिए अगला सेफ्टी सवाल तैयार है!\n\nसवाल:\n"यदि किसी कामगार की आँख में गलती से एसिड या केमिकल छलक जाए, तो तुरंत क्या करना चाहिए?"\n\nA) आँख पर बर्फ लगाएं\nB) Emergency Eyewash Station पर कम से कम 15 मिनट आँखें खोलकर धोएं\nC) आँख को कपड़े से रगड़ें\nD) बिना धोए डॉक्टर का इंतज़ार करें\n\n👉 अपना जवाब (A, B, C, या D) लिखें, या मुझसे कोई भी प्लांट सेफ्टी टॉपिक पूछें!',
  },
  {
    triggers: ['safety officer', 'supervisor', 'ehs role', 'role of safety officer', 'जिम्मेदारी'],
    en: '🛡️ Safety Officer & Supervisor Responsibilities:\n1. Hazard Audits: Daily inspections of plant areas, equipment guards, and chemical storage.\n2. Work Permits: Reviewing and issuing Hot Work, Confined Space, and Height Work permits.\n3. Safety Training: Conducting Toolbox Talks (TBT) and training apprentices on SOPs.\n4. Incident Investigation: Root cause analysis (RCA) of accidents and near misses to prevent recurrence.\n5. Regulatory Compliance: Ensuring OSHA/Factory Act compliance and maintaining emergency response readiness.',
    hi: '🛡️ Safety Officer व Supervisor की जिम्मेदारियां:\n1. सुरक्षा निरीक्षण: प्लांट एरिया, मशीन गार्डिंग और केमिकल स्टोरेज की दैनिक जांच।\n2. वर्क परमिट: Hot Work, Confined Space और Height Work परमिट की समीक्षा व जारी करना।\n3. सुरक्षा प्रशिक्षण: शिफ्ट से पहले Toolbox Talk (TBT) देना और कामगारों को SOPs सिखाना।\n4. दुर्घटना जांच: Near Miss और हादसों के मूल कारणों (RCA) की जांच कर दोबारा होने से रोकना।\n5. अनुपालन: Factory Act/EHS नियमों का पालन सुनिश्चित करना और Emergency readiness बनाए रखना।',
  },
  {
    triggers: ['distillation', 'reactor', 'boiler', 'heat exchanger', 'pump', 'valve', 'scada', 'plc'],
    en: '🏭 Plant Unit Operations & Equipment Safety:\n1. Reactors: Monitor jacket pressure, agitator speed, and temperature sensors to prevent thermal runaways.\n2. Distillation Columns: Maintain safe reflux ratios and verify pressure relief valve (PRV) calibration.\n3. Boilers: Test low-water cutoffs, blowdown valves, and burner interlocks daily.\n4. Pumps & Valves: Never throttle suction valves on centrifugal pumps; verify LOTO before opening process pipe flanges.\n5. SCADA/PLC: Respond immediately to high-high priority alarms; never disable interlock trips.',
    hi: '🏭 Plant Equipment व Unit Operations सुरक्षा:\n1. Reactors: Runaway रिएक्शन रोकने के लिए तापमान, प्रेशर और Agitator की स्पीड पर नजर रखें।\n2. Distillation Columns: Reflux ratio संतुलित रखें और Pressure Relief Valve (PRV) की टेस्टिंग जांचें।\n3. Boilers: Water level interlock और Burner safety cutoff को नियमित चेक करें।\n4. Pumps & Valves: सेंट्रीफ्यूगल पंप का सक्शन वॉल्व कभी बंद न करें; मेंटेनेंस से पहले LOTO लगाएं।\n5. SCADA/PLC: हाई-प्रायोरिटी अलार्म को तुरंत अटेंड करें और सेफ्टी इंटरलॉक को कभी बाईपास न करें।',
  },
  {
    triggers: ['permit', 'work permit', 'ptw', 'hot work', 'height work', 'tbt', 'toolbox talk', 'near miss'],
    en: '📋 Permit-to-Work (PTW) & Safe System of Work:\n1. Hot Work Permit: Mandatory for welding, cutting, grinding in hazardous areas; gas test LEL < 1% required.\n2. Working at Height: Mandatory for work at 1.8m+ height; full body harness tied to certified anchor point.\n3. Confined Space Permit: Oxygen (19.5%-23.5%), toxic gas test, standby attendant required.\n4. Toolbox Talk (TBT): 5-10 minute safety briefing before shift on task hazards and PPE.\n5. Near-Miss Reporting: Report all near misses to fix root causes before injuries happen.',
    hi: '📋 Permit-to-Work (PTW) और सुरक्षित कार्य प्रणाली:\n1. Hot Work Permit: वेल्डिंग, कटिंग, ग्राइंडिंग के लिए अनिवार्य; गैस टेस्ट में LEL < 1% होना चाहिए।\n2. Working at Height: 1.8 मीटर या अधिक ऊंचाई पर फुल बॉडी हार्नेस और लाइफलाइन अनिवार्य है।\n3. Confined Space Permit: 4-गैस डिटेक्शन टेस्ट, लगातार वेंटिलेशन और बाहर स्टैंडबाय अटेंडेंट अनिवार्य।\n4. Toolbox Talk (TBT): हर शिफ्ट से पहले 5-10 मिनट की सुरक्षा ब्रीफिंग जिसमें खतरों और PPE की चर्चा हो।\n5. Near Miss Reporting: हर बाल-बाल बची घटना की रिपोर्ट करें ताकि बड़ी दुर्घटना को पहले ही रोका जा सके।',
  },
  {
    triggers: ['safety kya hai', 'suraksha kya hai', 'what is safety', 'safety definition', 'सुरक्षा क्या है'],
    en: '🛡️ Industrial Safety Definition & Core Principles:\nIndustrial Safety is the systematic management of workplace hazards to prevent injury, occupational illness, equipment damage, and environmental harm.\n\n4 Core Safety Pillars:\n1. Engineering Controls: Machine guarding, ventilation (LEV), automatic shutdown interlocks.\n2. Administrative Controls: SOPs, Permit-to-Work (PTW), regular safety audits, and training.\n3. Safe Behavior: Wearing mandatory PPE, reporting near misses, and avoiding unsafe shortcuts.\n4. Emergency Preparedness: Clear evacuation routes, fire drills, and trained first-aid responders.',
    hi: '🛡️ Industrial Safety (औद्योगिक सुरक्षा) क्या है:\nIndustrial Safety कार्यस्थल पर मौजूद खतरों का वह व्यवस्थित प्रबंधन है, जिसका उद्देश्य कामगारों को चोट, बीमारियों, मशीनरी नुकसान और पर्यावरणीय क्षति से बचाना है।\n\n4 मुख्य सुरक्षा स्तंभ:\n1. Engineering Controls: मशीनों पर सेफ्टी गार्ड, वेंटिलेशन (LEV) और ऑटोमैटिक इमरजेंसी ट्रिप।\n2. Administrative Controls: SOPs, वर्क परमिट (PTW), सेफ्टी ऑडिट और कामगारों का नियमित प्रशिक्षण।\n3. Safe Work Culture: सही PPE पहनना, शॉर्टकट न अपनाना और Near Miss रिपोर्ट करना।\n4. Emergency Preparedness: फायर ड्रिल, साफ इमरजेंसी निकास और फर्स्ट-एड की त्वरित उपलब्धता।',
  },
];

function isEmergencyPrompt(text: string): boolean {
  const normalized = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function synthesizeSmartResponse(query: string, mode: BuddyMode): string {
  const q = query.toLowerCase();

  if (q.includes('hi') || q.includes('hello') || q.includes('namaste') || q.includes('hey') || q.includes('kaise ho')) {
    return mode === 'hinglish'
      ? 'नमस्ते! मैं Buddy AI हूँ, आपका Chemical Plant व Industrial Safety Assistant।\n\nआप मुझसे निम्न विषयों पर पूछ सकते हैं:\n• Safety Protocols (PPE, LOTO, Chemical Spill, Fire PASS, Confined Space)\n• Plant Procedures (Chemical Mixing SOP, Hazard Identification, Safety Inspection)\n• Apprentice / Trainee Guidance & Future Trends in Chemical Plants\n\nबताइए, आज मैं आपकी क्या मदद करूँ?'
      : 'Hello! I am Buddy AI, your Chemical Plant and Industrial Safety Assistant.\n\nYou can ask me about:\n• Safety Protocols (PPE, LOTO, Chemical Spill, Fire PASS, Confined Space)\n• Plant Procedures (Chemical Mixing SOP, Hazard Identification, Safety Inspection)\n• Apprentice / Trainee Guidance & Future Trends in Process Manufacturing\n\nHow can I assist you today?';
  }

  // Answer general industrial / plant queries systematically
  return mode === 'hinglish'
    ? `🏭 Industrial Safety & Plant Guidance:\n\n1. Job Safety Assessment (JSA): किसी भी कार्य को शुरू करने से पहले उससे जुड़े संभावित खतरों का आकलन करें और कार्य परमिट (PTW) प्राप्त करें।\n2. Mandatory PPE: कार्य के अनुसार प्रमाणित सुरक्षा उपकरण (Safety Shoes, Helmet, Splash Goggles व Gloves) का उपयोग अनिवार्य है।\n3. Standard Operating Procedure (SOP): केमिकल प्लांट मैन्युअल और वरिष्ठ सुपरवाइजर द्वारा प्रमाणित सुरक्षित कार्यविधि का ही पालन करें।\n4. Emergency Preparedness: किसी भी असामान्य स्थिति में तुरंत Emergency Stop Switch का उपयोग करें और EHS Officer को सूचित करें।\n\n💡 आप मुझसे किसी विशिष्ट विषय (जैसे: PPE, LOTO, Chemical Spill, Inspection, Apprentice, या Future Trends) पर भी विस्तार से पूछ सकते हैं!`
    : `🏭 Industrial Safety & Plant Guidance:\n\n1. Job Safety Assessment (JSA): Evaluate potential workplace hazards and secure a valid Permit-to-Work (PTW) before initiating tasks.\n2. Certified PPE: Always wear task-appropriate safety gear (Hard hat, Steel-toe shoes, Splash goggles, and rated gloves).\n3. SOP Compliance: Follow validated Standard Operating Procedures and consult your plant operations manual.\n4. Emergency Response: In case of anomaly, activate the Emergency Stop and notify the EHS Safety Officer immediately.\n\n💡 You can also ask me about specific topics like PPE, LOTO, Chemical Spill, Inspection, Apprentice roles, or Future Trends!`;
}

export function buildBuddyFallbackResponse(userMessage: string, mode: BuddyMode): string {
  const query = userMessage.toLowerCase().trim();

  // 1. Try matching domain safety & plant knowledge base
  for (const entry of SAFETY_KNOWLEDGE_BASE) {
    if (entry.triggers.some((trigger) => query.includes(trigger))) {
      return mode === 'hinglish' ? entry.hi : entry.en;
    }
  }

  // 2. Check for emergency triggers
  if (isEmergencyPrompt(userMessage)) {
    return mode === 'hinglish'
      ? '⚠️ Emergency में काम तुरंत रोक दें, alarm raise करें, supervisor या EHS team को inform करें, area को isolate करें, और nearest emergency exit से evacuate करें. Exact hazard बताओगे तो मैं सही SOP बता दूंगा.'
      : '⚠️ In an emergency, stop work immediately, raise the alarm, inform your supervisor or EHS team, isolate the area, and evacuate through the nearest exit route. Tell me the specific hazard for exact SOP guidance.';
  }

  // 3. Synthesize smart contextual response for all other inquiries
  return synthesizeSmartResponse(query, mode);
}
