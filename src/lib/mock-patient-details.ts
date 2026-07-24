import { syntheticPatients, type SyntheticPatient } from "@/lib/mock-hospital-data"

export type ClinicalStatus = "critical" | "high" | "abnormal" | "normal" | "pending"

export type PatientDetail = {
  patient: SyntheticPatient
  demographics: { label: string; value: string }[]
  symptoms: { name: string; detail: string; onset: string }[]
  vitals: { name: string; value: string; unit: string; status: ClinicalStatus; trend: string }[]
  medications: { name: string; dose: string; route: string; schedule: string; status: string }[]
  allergies: { substance: string; reaction: string; severity: "Severe" | "Moderate" | "Mild" }[]
  labs: { test: string; value: string; range: string; status: ClinicalStatus; collected: string }[]
  imaging: { study: string; time: string; impression: string; findings: string }[]
  notes: { author: string; role: string; time: string; text: string }[]
  timeline: { time: string; title: string; detail: string; tone: ClinicalStatus }[]
  recommendations: { priority: "Immediate" | "High" | "Routine"; action: string; rationale: string; owner: string }[]
  history: string[]
}

const caseProfiles: Record<string, {
  dob: string; history: string[]; symptoms: PatientDetail["symptoms"]
  medications: PatientDetail["medications"]; allergies: PatientDetail["allergies"]
  labs: PatientDetail["labs"]; imaging: PatientDetail["imaging"]
  note: string; recommendations: PatientDetail["recommendations"]
}> = {
  "MED-1042": {
    dob: "1953-03-14",
    history: ["Chronic kidney disease stage 3", "Hypertension", "Type 2 diabetes", "Community-acquired pneumonia (2023)"],
    symptoms: [
      { name: "Shortness of breath", detail: "Progressive at rest; productive cough", onset: "2 days" },
      { name: "Fever and chills", detail: "Home temperature 39.1°C", onset: "18 hours" },
      { name: "Confusion", detail: "New disorientation reported by daughter", onset: "3 hours" },
      { name: "Generalized weakness", detail: "Unable to ambulate without assistance", onset: "Today" },
    ],
    medications: [
      { name: "Metformin", dose: "500 mg", route: "PO", schedule: "Twice daily", status: "Held" },
      { name: "Lisinopril", dose: "20 mg", route: "PO", schedule: "Daily", status: "Held" },
      { name: "Atorvastatin", dose: "40 mg", route: "PO", schedule: "Nightly", status: "Active" },
      { name: "Normal saline", dose: "1,000 mL", route: "IV", schedule: "Bolus", status: "Infusing" },
    ],
    allergies: [{ substance: "Penicillin", reaction: "Anaphylaxis with airway swelling", severity: "Severe" }, { substance: "Sulfonamides", reaction: "Diffuse urticaria", severity: "Moderate" }],
    labs: [
      { test: "Lactate", value: "4.7 mmol/L", range: "0.5–2.2", status: "critical", collected: "09:12" },
      { test: "WBC", value: "18.6 K/µL", range: "4.0–11.0", status: "high", collected: "09:12" },
      { test: "Creatinine", value: "2.1 mg/dL", range: "0.6–1.2", status: "high", collected: "09:12" },
      { test: "eGFR", value: "24 mL/min", range: ">60", status: "abnormal", collected: "09:12" },
      { test: "Procalcitonin", value: "6.8 ng/mL", range: "<0.10", status: "high", collected: "09:12" },
      { test: "Blood cultures", value: "In process", range: "No growth", status: "pending", collected: "09:18" },
    ],
    imaging: [{ study: "Portable chest radiograph", time: "09:24", impression: "Right lower-lobe airspace opacity concerning for pneumonia. Small right pleural effusion.", findings: "Patchy right basilar consolidation with air bronchograms. No pneumothorax. Cardiomediastinal silhouette mildly enlarged." }],
    note: "72-year-old woman with CKD, diabetes, and severe penicillin allergy presents with acute hypoxemic respiratory failure and shock physiology. Suspected pulmonary source. Sepsis pathway initiated; cultures obtained prior to antimicrobial selection.",
    recommendations: [
      { priority: "Immediate", action: "Continue sepsis resuscitation and reassess perfusion after current fluid bolus", rationale: "Hypotension, lactate 4.7 mmol/L, altered mentation", owner: "ED physician + RN" },
      { priority: "Immediate", action: "Select empiric antimicrobials with pharmacist review", rationale: "Suspected severe infection with documented penicillin anaphylaxis and renal impairment", owner: "Physician + pharmacist" },
      { priority: "High", action: "Repeat lactate and renal function after resuscitation", rationale: "Assess clearance and guide subsequent fluid and medication decisions", owner: "ED physician" },
      { priority: "High", action: "Escalate oxygen support and request ICU evaluation", rationale: "SpO₂ 88% with shock physiology and 3 ICU beds available", owner: "Respiratory therapy + ICU" },
    ],
  },
  "MED-1038": {
    dob: "1967-10-02", history: ["Hyperlipidemia", "Tobacco use disorder", "Family history of premature CAD"],
    symptoms: [{ name: "Chest pain", detail: "Crushing, substernal, radiating to left arm", onset: "45 minutes" }, { name: "Diaphoresis", detail: "Profuse with nausea", onset: "40 minutes" }],
    medications: [{ name: "Aspirin", dose: "324 mg", route: "PO", schedule: "Once", status: "Given" }, { name: "Nitroglycerin", dose: "0.4 mg", route: "SL", schedule: "As directed", status: "Active" }],
    allergies: [{ substance: "No known drug allergies", reaction: "—", severity: "Mild" }],
    labs: [{ test: "High-sensitivity troponin", value: "186 ng/L", range: "<19", status: "critical", collected: "09:31" }, { test: "Potassium", value: "4.1 mmol/L", range: "3.5–5.1", status: "normal", collected: "09:31" }],
    imaging: [{ study: "12-lead ECG", time: "09:27", impression: "ST elevation in leads II, III, and aVF.", findings: "Reciprocal changes in I and aVL. Sinus tachycardia at 104 bpm." }],
    note: "Presentation and ECG are concerning for acute inferior STEMI. Cardiology notified and catheterization laboratory activation initiated.",
    recommendations: [{ priority: "Immediate", action: "Continue STEMI pathway and cardiology handoff", rationale: "Diagnostic ECG changes with ongoing ischemic symptoms", owner: "ED physician + cardiology" }, { priority: "High", action: "Continuous rhythm and hemodynamic monitoring", rationale: "Inferior infarction carries conduction risk", owner: "RN" }],
  },
  "MED-1035": {
    dob: "1991-06-22", history: ["Polycystic ovary syndrome", "Prior ovarian cyst"],
    symptoms: [{ name: "Abdominal pain", detail: "Sharp right lower quadrant pain with guarding", onset: "12 hours" }, { name: "Nausea", detail: "Two episodes of emesis", onset: "8 hours" }],
    medications: [{ name: "Acetaminophen", dose: "1,000 mg", route: "IV", schedule: "Once", status: "Given" }],
    allergies: [{ substance: "Latex", reaction: "Contact dermatitis", severity: "Moderate" }],
    labs: [{ test: "WBC", value: "14.2 K/µL", range: "4.0–11.0", status: "high", collected: "09:02" }, { test: "β-hCG", value: "Pending", range: "Negative", status: "pending", collected: "09:02" }],
    imaging: [{ study: "Right upper/lower quadrant ultrasound", time: "09:40", impression: "Study in progress.", findings: "Final radiology interpretation pending." }],
    note: "Focal RLQ tenderness with leukocytosis. Pregnancy status pending before further imaging selection.",
    recommendations: [{ priority: "High", action: "Review pregnancy result before selecting additional imaging", rationale: "Imaging pathway depends on pregnancy status", owner: "ED physician" }, { priority: "High", action: "Serial abdominal examinations", rationale: "Monitor for evolving peritoneal signs", owner: "ED physician" }],
  },
  "MED-1029": {
    dob: "1958-01-19", history: ["Atrial fibrillation", "Hypertension", "Hyperlipidemia"],
    symptoms: [{ name: "Left-sided weakness", detail: "Face, arm, and leg involvement", onset: "52 minutes" }, { name: "Slurred speech", detail: "Witnessed by spouse", onset: "52 minutes" }],
    medications: [{ name: "Apixaban", dose: "5 mg", route: "PO", schedule: "Twice daily", status: "Last dose uncertain" }],
    allergies: [{ substance: "No known drug allergies", reaction: "—", severity: "Mild" }],
    labs: [{ test: "Glucose", value: "126 mg/dL", range: "70–140", status: "normal", collected: "08:57" }, { test: "INR", value: "1.2", range: "0.9–1.1", status: "abnormal", collected: "09:06" }],
    imaging: [{ study: "CT head without contrast", time: "09:13", impression: "No acute intracranial hemorrhage.", findings: "Subtle loss of gray-white differentiation in the right insular cortex. ASPECTS 8." }],
    note: "Acute focal neurologic deficit with last-known-well under one hour. Stroke team at bedside; anticoagulant timing being verified.",
    recommendations: [{ priority: "Immediate", action: "Complete stroke-team eligibility review", rationale: "Time-sensitive focal deficit with no hemorrhage on CT", owner: "Stroke neurologist" }, { priority: "High", action: "Verify last apixaban dose with family and pharmacy", rationale: "Essential for reperfusion risk assessment", owner: "Pharmacist + RN" }],
  },
  "MED-1021": {
    dob: "1999-12-08", history: ["Moderate persistent asthma", "Seasonal allergic rhinitis"],
    symptoms: [{ name: "Wheezing", detail: "Persistent despite home rescue inhaler", onset: "6 hours" }, { name: "Chest tightness", detail: "Worse with exertion", onset: "6 hours" }],
    medications: [{ name: "Albuterol-ipratropium", dose: "3 mL", route: "Neb", schedule: "Every 20 min ×3", status: "Active" }, { name: "Prednisone", dose: "60 mg", route: "PO", schedule: "Once", status: "Given" }],
    allergies: [{ substance: "Shellfish", reaction: "Urticaria", severity: "Moderate" }],
    labs: [{ test: "Venous pCO₂", value: "43 mmHg", range: "38–50", status: "normal", collected: "08:48" }, { test: "Viral panel", value: "Negative", range: "Negative", status: "normal", collected: "09:16" }],
    imaging: [{ study: "Chest radiograph", time: "09:22", impression: "No acute cardiopulmonary abnormality.", findings: "Mild hyperinflation. No focal airspace disease or pleural effusion." }],
    note: "Asthma exacerbation with improving air movement after initial bronchodilator treatment; remains mildly hypoxemic.",
    recommendations: [{ priority: "High", action: "Continue bronchodilator pathway and reassess peak flow", rationale: "Persistent wheeze and SpO₂ 93%", owner: "Respiratory therapy" }, { priority: "Routine", action: "Review controller adherence and discharge readiness", rationale: "Reduce relapse risk after stabilization", owner: "ED physician" }],
  },
}

function createPatientDetail(patient: SyntheticPatient): PatientDetail {
  const profile = caseProfiles[patient.id]
  const isCritical = patient.acuity === "ESI 1"
  return {
    patient,
    demographics: [
      { label: "Date of birth", value: profile.dob }, { label: "Medical record", value: patient.id },
      { label: "Language", value: patient.id === "MED-1042" ? "Spanish / English" : "English" },
      { label: "Code status", value: "Full code" }, { label: "Emergency contact", value: "Verified" },
      { label: "Encounter", value: "ED · Day shift" },
    ],
    symptoms: profile.symptoms,
    vitals: isCritical ? [
      { name: "Blood pressure", value: "82/48", unit: "mmHg", status: "critical", trend: "↓ from 94/56" },
      { name: "Heart rate", value: "128", unit: "bpm", status: "high", trend: "↑ 12" },
      { name: "Oxygen saturation", value: "88", unit: "%", status: "critical", trend: "Room air" },
      { name: "Respiratory rate", value: "30", unit: "/min", status: "high", trend: "↑ 4" },
      { name: "Temperature", value: "39.2", unit: "°C", status: "high", trend: "Oral" },
      { name: "GCS", value: "13", unit: "/15", status: "abnormal", trend: "Baseline 15" },
    ] : [
      { name: "Blood pressure", value: patient.vitals.match(/BP ([^·]+)/)?.[1]?.trim() ?? "118/74", unit: "mmHg", status: "abnormal", trend: "Latest" },
      { name: "Heart rate", value: patient.vitals.match(/HR ([^·]+)/)?.[1]?.trim() ?? "98", unit: "bpm", status: "high", trend: "Latest" },
      { name: "Oxygen saturation", value: patient.vitals.match(/SpO₂ ([^·]+)/)?.[1]?.replace("%", "").trim() ?? "96", unit: "%", status: "normal", trend: "Latest" },
      { name: "Respiratory rate", value: "20", unit: "/min", status: "normal", trend: "Stable" },
      { name: "Temperature", value: patient.id === "MED-1035" ? "38.1" : "37.1", unit: "°C", status: patient.id === "MED-1035" ? "high" : "normal", trend: "Oral" },
      { name: "Pain", value: patient.id === "MED-1038" ? "8" : "5", unit: "/10", status: "abnormal", trend: "Reported" },
    ],
    medications: profile.medications,
    allergies: profile.allergies,
    labs: profile.labs,
    imaging: profile.imaging,
    notes: [{ author: "Dr. Maya Morgan", role: "Emergency medicine", time: "09:36", text: profile.note }, { author: "Jordan Kim, RN", role: "Primary nurse", time: "09:28", text: `Patient transferred to ${patient.location}. Continuous monitoring established; safety checks and medication reconciliation completed.` }],
    timeline: [
      { time: "09:36", title: "Physician reassessment", detail: profile.note.split(".")[0] + ".", tone: isCritical ? "critical" : "high" },
      { time: "09:24", title: "Diagnostic study updated", detail: profile.imaging[0].impression, tone: profile.imaging[0].impression.includes("pending") ? "pending" : "abnormal" },
      { time: "09:12", title: "Laboratory specimens collected", detail: `${profile.labs.length} results available or processing.`, tone: "pending" },
      { time: "08:52", title: "Triage completed", detail: `${patient.acuity} assigned for ${patient.chiefComplaint.toLowerCase()}.`, tone: patient.acuity === "ESI 1" ? "critical" : "high" },
      { time: "08:47", title: "Emergency department arrival", detail: "Identity verified and synthetic encounter opened.", tone: "normal" },
    ],
    recommendations: profile.recommendations,
    history: profile.history,
  }
}

export const patientDetails = Object.fromEntries(syntheticPatients.map((patient) => [patient.id, createPatientDetail(patient)])) as Record<string, PatientDetail>

export function getPatientDetail(id: string) {
  return patientDetails[id]
}
