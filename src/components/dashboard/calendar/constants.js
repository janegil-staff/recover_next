// Pure data constants for the calendar dashboard.
// No React, no side effects — safe to import anywhere.

// Substance colors — semantic, look the same in light and dark modes
export const SC = {
  alcohol: "#7986cb",
  cannabis: "#66bb6a",
  cocaine: "#ef5350",
  opioids: "#ab47bc",
  amphetamines: "#ff7043",
  benzodiazepines: "#26a69a",
  tobacco: "#8d6e63",
  prescription: "#42a5f5",
  mdma: "#ec407a",
  ecstasy: "#ec407a",
  ghb: "#00acc1",
  acid: "#9c27b0",
  other: "#bdbdbd",
};

// Frequency enum → numeric score (used in dayScore + trends)
export const FREQ_SCORE = {
  none: 0,
  once: 1,
  few_times: 2,
  daily: 3,
  multiple_daily: 4,
};

// Same enum, different name — kept separate to avoid coupling trend bars
// to the heat-map scoring (they may diverge in the future).
export const FREQ_VAL = {
  none: 0,
  once: 1,
  few_times: 2,
  daily: 3,
  multiple_daily: 4,
};

// Day-cell heat-map bucketed by avg score 0–5. Matches mobile app palette.
export const SCORE_COLORS = {
  0: "#22C55E", // green   — best
  1: "#7AABDB", // blue
  2: "#FBBF24", // yellow
  3: "#FB923C", // orange
  4: "#EF4444", // red
  5: "#991B1B", // dark red — worst
};

// Questionnaire score scale labels (0–3) used in detail modal
export const SCORE_LABELS = [
  "Not at all",
  "Several days",
  "More than half the days",
  "Nearly every day",
];

// Right-column questionnaire summary list
export const QC = [
  {
    key: "latestGad7",
    label: "GAD-7",
    max: 21,
    color: "#7C3AED",
    fn: (s) =>
      s <= 4 ? "Minimal" : s <= 9 ? "Mild" : s <= 14 ? "Moderate" : "Severe",
  },
  {
    key: "latestPhq9",
    label: "PHQ-9",
    max: 27,
    color: "#DC2626",
    fn: (s) =>
      s <= 4
        ? "Minimal"
        : s <= 9
          ? "Mild"
          : s <= 14
            ? "Moderate"
            : s <= 19
              ? "Mod-severe"
              : "Severe",
  },
  {
    key: "latestAudit",
    label: "AUDIT",
    max: 40,
    color: "#D97706",
    fn: (s) =>
      s <= 7
        ? "Low risk"
        : s <= 15
          ? "Hazardous"
          : s <= 19
            ? "Harmful"
            : "Likely dep.",
  },
  {
    key: "latestDast10",
    label: "DAST-10",
    max: 10,
    color: "#059669",
    fn: (s) =>
      s === 0
        ? "No problem"
        : s <= 2
          ? "Low"
          : s <= 5
            ? "Moderate"
            : s <= 8
              ? "Substantial"
              : "Severe",
  },
  {
    key: "latestCage",
    label: "CAGE",
    max: 4,
    color: "#0284C7",
    fn: (s) => (s <= 1 ? "Unlikely" : s <= 2 ? "Possible" : "Likely dep."),
  },
  {
    key: "latestReadiness",
    label: "Readiness to change",
    max: 30,
    color: "#0891B2",
    fn: (s) => (s <= 10 ? "Not ready" : s <= 20 ? "Considering" : "Ready"),
  },
];

// Full questionnaire definitions used by the detail modal.
// Each entry: max, color, severity fn, and the question list (keys map back
// to the stored record fields; index fallback covers older numeric keys).
//
// ANSWER_SCALE_V2 — an entry MAY also declare `answerLabels` and
// `answerColors` (value → string / value → hex). When present, the detail
// modal uses them for each item's answer text + score dot. When absent, the
// modal falls back to the shared 0–3 SCORE_LABELS frequency scale and the
// legacy 0–3 green→red color ramp. Only Readiness to Change overrides them
// (it's a 5-point agreement Likert, not a frequency scale).
export const Q_DETAILS = {
  latestGad7: {
    label: "GAD-7 · Anxiety",
    max: 21,
    color: "#7C3AED",
    sev: (s) =>
      s <= 4 ? "Minimal" : s <= 9 ? "Mild" : s <= 14 ? "Moderate" : "Severe",
    questions: [
      { key: "feelingNervous", label: "Feeling nervous, anxious or on edge" },
      {
        key: "noWorryingControl",
        label: "Not being able to stop or control worrying",
      },
      { key: "worrying", label: "Worrying too much about different things" },
      { key: "troubleRelaxing", label: "Trouble relaxing" },
      {
        key: "restless",
        label: "Being so restless that it is hard to sit still",
      },
      { key: "easilyAnnoyed", label: "Becoming easily annoyed or irritable" },
      {
        key: "afraid",
        label: "Feeling afraid as if something awful might happen",
      },
    ],
  },
  latestPhq9: {
    label: "PHQ-9 · Depression",
    max: 27,
    color: "#DC2626",
    sev: (s) =>
      s <= 4
        ? "Minimal"
        : s <= 9
          ? "Mild"
          : s <= 14
            ? "Moderate"
            : s <= 19
              ? "Mod-severe"
              : "Severe",
    questions: [
      {
        key: "noPleasureDoingThings",
        label: "Little interest or pleasure in doing things",
      },
      { key: "depressed", label: "Feeling down, depressed, or hopeless" },
      {
        key: "stayingAsleep",
        label: "Trouble falling or staying asleep, or sleeping too much",
      },
      { key: "noEnergy", label: "Feeling tired or having little energy" },
      { key: "noAppetite", label: "Poor appetite or overeating" },
      {
        key: "selfPity",
        label: "Feeling bad about yourself — or that you are a failure",
      },
      { key: "troubleConcentration", label: "Trouble concentrating on things" },
      {
        key: "slowMovingSpeeking",
        label:
          "Moving or speaking so slowly that other people could have noticed",
      },
      {
        key: "suicidal",
        label:
          "Thoughts that you would be better off dead or of hurting yourself",
      },
    ],
  },
  latestAudit: {
    label: "AUDIT · Alcohol Use",
    max: 40,
    color: "#D97706",
    sev: (s) =>
      s <= 7
        ? "Low risk"
        : s <= 15
          ? "Hazardous"
          : s <= 19
            ? "Harmful"
            : "Likely dependent",
    questions: [
      {
        key: "frequency",
        label: "How often do you have a drink containing alcohol?",
      },
      {
        key: "typicalAmount",
        label: "How many units on a typical day when drinking?",
      },
      {
        key: "frequencyHeavy",
        label: "How often do you have 6 or more units on one occasion?",
      },
      {
        key: "unableToStop",
        label:
          "How often have you found you were unable to stop drinking once started?",
      },
      {
        key: "failedExpected",
        label:
          "How often have you failed to do what was normally expected due to drinking?",
      },
      {
        key: "morningDrink",
        label: "How often have you needed a drink in the morning?",
      },
      {
        key: "guilt",
        label: "How often have you had a feeling of guilt after drinking?",
      },
      {
        key: "memoryLoss",
        label:
          "How often have you been unable to remember the night before due to drinking?",
      },
      {
        key: "injured",
        label:
          "Have you or someone else been injured as a result of your drinking?",
      },
      {
        key: "concernedByOthers",
        label:
          "Has a relative, doctor or other person been concerned about your drinking?",
      },
    ],
  },
  latestDast10: {
    label: "DAST-10 · Drug Use",
    max: 10,
    color: "#059669",
    sev: (s) =>
      s === 0
        ? "No problem"
        : s <= 2
          ? "Low"
          : s <= 5
            ? "Moderate"
            : s <= 8
              ? "Substantial"
              : "Severe",
    questions: [
      {
        key: "usedDrugs",
        label:
          "Have you used drugs other than those required for medical reasons?",
      },
      {
        key: "abusedPrescription",
        label: "Do you abuse more than one drug at a time?",
      },
      {
        key: "unableToStop",
        label: "Are you always able to stop using drugs when you want to?",
      },
      {
        key: "blackouts",
        label: "Have you had blackouts or flashbacks as a result of drug use?",
      },
      {
        key: "guiltAboutDrugUse",
        label: "Do you ever feel bad or guilty about your drug use?",
      },
      {
        key: "spouseComplains",
        label:
          "Does your spouse/partner or parents ever complain about your involvement with drugs?",
      },
      {
        key: "neglectedFamily",
        label: "Have you neglected your family due to use of drugs?",
      },
      {
        key: "illegalActivities",
        label:
          "Have you engaged in illegal activities in order to obtain drugs?",
      },
      {
        key: "withdrawal",
        label:
          "Have you ever experienced withdrawal symptoms when you stopped taking drugs?",
      },
      {
        key: "medicalProblems",
        label: "Have you had medical problems as a result of drug use?",
      },
    ],
  },
  latestCage: {
    label: "CAGE · Alcohol Screening",
    max: 4,
    color: "#0284C7",
    sev: (s) =>
      s <= 1 ? "Unlikely" : s <= 2 ? "Possible" : "Likely dependent",
    questions: [
      {
        key: "cutDown",
        label: "Have you ever felt you should Cut down on your drinking?",
      },
      {
        key: "annoyed",
        label: "Have people Annoyed you by criticising your drinking?",
      },
      {
        key: "guilty",
        label: "Have you ever felt bad or Guilty about your drinking?",
      },
      {
        key: "eyeOpener",
        label:
          "Have you ever had a drink first thing in the morning (Eye opener)?",
      },
    ],
  },
  latestReadiness: {
    label: "Readiness to Change",
    max: 30,
    color: "#0891B2",
    sev: (s) => (s <= 10 ? "Not ready" : s <= 20 ? "Considering" : "Ready"),

    // READINESS_SCALE_V1 — 5-point AGREEMENT Likert, NOT the shared 0–3
    // frequency scale. Stored values: 0 = unanswered, 1–5 = the answers.
    // Without these, the modal indexed SCORE_LABELS (0–3) by value, so 4 and
    // 5 rendered blank ("—") and 3 showed the wrong "Nearly every day".
    answerLabels: {
      0: "Not answered",
      1: "Strongly disagree",
      2: "Disagree",
      3: "Neutral",
      4: "Agree",
      5: "Strongly agree",
    },
    // Neutral teal ramp — agreement isn't "good/bad", so don't reuse the
    // green→red severity colors. 0 (unanswered) is muted grey.
    answerColors: {
      0: "#b0bec5",
      1: "#0891B2",
      2: "#26a0b8",
      3: "#4ab3c4",
      4: "#7cc6d1",
      5: "#a8d8de",
    },
    questions: [
      { key: "q1", label: "I don't think I drink too much." },
      { key: "q2", label: "I am trying to drink less than I used to." },
      {
        key: "q3",
        label: "I enjoy my drinking but sometimes I drink too much.",
      },
      {
        key: "q4",
        label: "Sometimes I think I should cut down on my drinking.",
      },
      { key: "q5", label: "It's a waste of time thinking about my drinking." },
      { key: "q6", label: "I have just recently changed my drinking habits." },
    ],
  },
};

// Monthly trend bars — series shown in MonthlyTrendsCard
export const TREND_SERIES = [
  { key: "cravings", label: "Cravings", color: "#f4a07a", max: 5, icon: "🔥" },
  { key: "mood", label: "Mood", color: "#4a7ab5", max: 5, icon: "😊" },
  {
    key: "wellbeing",
    label: "Wellbeing",
    color: "#66bb6a",
    max: 5,
    icon: "💙",
  },
  {
    key: "frequency",
    label: "Frequency",
    color: "#ab47bc",
    max: 4,
    icon: "📅",
  },
  { key: "amount", label: "Amount", color: "#ff7043", max: 10, icon: "💊" },
];