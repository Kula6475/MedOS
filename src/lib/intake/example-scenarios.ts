// Client-safe constants (no server imports) used to pre-fill the intake UI for a reliable demo.
// Each scenario is intentionally detailed — symptoms, history, medications, full vitals, labs, and
// an imaging/ECG finding — so the agents have concrete evidence in the record to ground their
// analysis (sparse notes cause the safety gate to block outputs for want of evidence).

export interface ExampleScenario {
  label: string
  text: string
}

export const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    label: "Chest pain (STEMI)",
    text: `54-year-old male brought in by EMS with sudden crushing substernal chest pain radiating to the left arm, started 40 minutes ago at rest. Diaphoretic and nauseated, pain 9/10. History of hypertension, type 2 diabetes, and hyperlipidemia. Home medications: lisinopril 20 mg daily, metformin 1000 mg twice daily, atorvastatin 40 mg nightly. Allergic to penicillin (hives). Vitals: HR 104, BP 158/95, RR 22, SpO2 94% on room air, temp 36.9C. 12-lead ECG shows 2 mm ST elevation in leads II, III, and aVF with reciprocal depression in I and aVL. Labs: initial troponin I 0.9 ng/mL (elevated), glucose 212 mg/dL, potassium 4.1 mmol/L. Portable chest X-ray shows no acute infiltrate.`,
  },
  {
    label: "Sepsis / pneumonia",
    text: `68-year-old female with 3 days of productive cough, fever, and progressive shortness of breath, now acutely confused. History of COPD and stage 3 chronic kidney disease. Home medications: tiotropium inhaler daily, furosemide 40 mg daily, albuterol as needed. No known drug allergies. Vitals: HR 122, BP 88/54, RR 28, SpO2 89% on room air, temp 38.9C. Exam: coarse crackles at the right base, using accessory muscles. Labs: WBC 18.2 (high), lactate 3.8 mmol/L (high), creatinine 2.3 mg/dL (baseline 1.4), procalcitonin 6.1. Chest X-ray shows dense right lower lobe consolidation. Concern for septic shock from community-acquired pneumonia.`,
  },
  {
    label: "Anaphylaxis",
    text: `26-year-old male with sudden lip and tongue swelling, diffuse urticaria, and wheezing that began 15 minutes after eating shrimp. Known shellfish allergy with a prior anaphylaxis episode; carries an epinephrine auto-injector but did not use it. No other medical history, no daily medications. Vitals: HR 128, BP 92/60, RR 26, SpO2 91% on room air, temp 37.0C. Exam: audible stridor, accessory muscle use, and diffuse hives over the chest and arms. Labs: tryptase pending. Received IM epinephrine 0.3 mg on arrival.`,
  },
]

export const EXAMPLE_INTAKE_TEXT = EXAMPLE_SCENARIOS[0].text
