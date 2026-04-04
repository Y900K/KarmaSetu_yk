export const SUGGESTED_QUESTIONS: Record<string, { HINGLISH: string[]; EN: string[] }> = {
  // Default (no course context)
  default: {
    HINGLISH: [
      "PPE क्या होता है?",
      "Safety inspection कैसे करें?",
      "Emergency procedure बताओ",
      "Hazard identification क्या है?",
    ],
    EN: [
      "What is PPE?",
      "How to conduct a safety inspection?",
      "Explain emergency procedures",
      "What is hazard identification?",
    ],
  },

  // Fire Safety & Emergency Response
  "TC-001": {
    HINGLISH: [
      "Fire extinguisher कैसे use करें?",
      "Evacuation route क्या होती है?",
      "PASS technique क्या है?",
      "Fire triangle explain करो",
    ],
    EN: [
      "How to use a fire extinguisher?",
      "What is an evacuation route?",
      "Explain the PASS technique",
      "What is the fire triangle?",
    ],
  },

  // Chemical Handling & SOP Compliance
  "TC-002": {
    HINGLISH: [
      "SDS sheet क्या होती है?",
      "Chemical spill procedure क्या है?",
      "PPE for chemical handling?",
      "HAZCHEM code क्या होता है?",
    ],
    EN: [
      "What is an SDS sheet?",
      "Chemical spill emergency procedure?",
      "What PPE is needed for chemicals?",
      "What is a HAZCHEM code?",
    ],
  },

  // Machine Operations & Lockout/Tagout
  "TC-003": {
    HINGLISH: [
      "LOTO procedure क्या है?",
      "Machine guarding क्यों जरूरी है?",
      "Zero energy state कैसे verify करें?",
      "Machine hazards कौन से होते हैं?",
    ],
    EN: [
      "What is the LOTO procedure?",
      "Why is machine guarding important?",
      "How to verify zero energy state?",
      "What are common machine hazards?",
    ],
  },

  // Electrical Safety
  "TC-004": {
    HINGLISH: [
      "Arc flash क्या होता है?",
      "Electrical PPE कौन सी होती है?",
      "Live wire को safely कैसे handle करें?",
      "Earthing क्यों जरूरी है?",
    ],
    EN: [
      "What is arc flash?",
      "What electrical PPE is required?",
      "How to safely handle live wires?",
      "Why is earthing important?",
    ],
  },

  // Quality Control
  "TC-005": {
    HINGLISH: [
      "ISO 9001 क्या है?",
      "Non-conformance कैसे report करें?",
      "Quality audit procedure क्या है?",
      "IS standards कहाँ मिलते हैं?",
    ],
    EN: [
      "What is ISO 9001?",
      "How to report a non-conformance?",
      "What is a quality audit procedure?",
      "Where to find IS standards?",
    ],
  },

  // Workplace Induction
  "TC-006": {
    HINGLISH: [
      "Induction training क्यों जरूरी है?",
      "Workplace rules क्या होते हैं?",
      "First day safety checklist?",
      "Incident reporting कैसे करें?",
    ],
    EN: [
      "Why is induction training important?",
      "What are workplace safety rules?",
      "First day safety checklist?",
      "How to report a workplace incident?",
    ],
  },
};
