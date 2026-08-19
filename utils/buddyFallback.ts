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
];

function isEmergencyPrompt(text: string): boolean {
  const normalized = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function buildBuddyFallbackResponse(userMessage: string, mode: BuddyMode): string {
  const query = userMessage.toLowerCase().trim();

  // Try matching domain safety knowledge base
  for (const entry of SAFETY_KNOWLEDGE_BASE) {
    if (entry.triggers.some((trigger) => query.includes(trigger))) {
      return mode === 'hinglish' ? entry.hi : entry.en;
    }
  }

  if (isEmergencyPrompt(userMessage)) {
    return mode === 'hinglish'
      ? '⚠️ Emergency में काम तुरंत रोक दें, alarm raise करें, supervisor या EHS team को inform करें, area को isolate करें, और nearest emergency exit से evacuate करें. Exact hazard बताओगे तो मैं सही SOP बता दूंगा.'
      : '⚠️ In an emergency, stop work immediately, raise the alarm, inform your supervisor or EHS team, isolate the area, and evacuate through the nearest exit route. Tell me the specific hazard for exact SOP guidance.';
  }

  return mode === 'hinglish'
    ? 'नमस्ते! मैं Buddy AI हूँ, आपका Industrial Safety व Chemical Plant Assistant. आप मुझसे Safety Protocols (PPE, LOTO, Chemical Spill, Fire Safety, Confined Space, First Aid) के बारे में कोई भी सवाल पूछ सकते हैं.'
    : 'Hello! I am Buddy AI, your Industrial Safety and Plant Training Assistant. You can ask me about Safety Protocols (PPE, LOTO, Chemical Spill, Fire Emergency, Confined Space Entry, Electrical Safety, or First Aid). How can I assist you today?';
}
