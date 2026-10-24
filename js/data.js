/* =====================================================================
   Bloom Cycle — content data
   All the labels, copy and exercise/remedy content lives here so the
   pages stay easy to read and you can edit wording in one place.
   ===================================================================== */

window.BloomData = {
  /* ---------------- Symptoms you can log each day ---------------- */
  symptoms: [
    { id: "cramps", label: "Cramps", emoji: "🌀" },
    { id: "bloating", label: "Bloating", emoji: "🫧" },
    { id: "headache", label: "Headache", emoji: "🤕" },
    { id: "fatigue", label: "Fatigue", emoji: "😴" },
    { id: "acne", label: "Acne", emoji: "✨" },
    { id: "moodSwings", label: "Mood swings", emoji: "🎢" },
    { id: "breastTenderness", label: "Breast tenderness", emoji: "💗" }
  ],

  /* ------------------------- Daily moods ------------------------- */
  moods: [
    { id: "happy", label: "Happy", emoji: "😊" },
    { id: "calm", label: "Calm", emoji: "🌿" },
    { id: "energetic", label: "Energetic", emoji: "🌞" },
    { id: "sensitive", label: "Sensitive", emoji: "🥺" },
    { id: "irritable", label: "Irritable", emoji: "⚡" },
    { id: "anxious", label: "Anxious", emoji: "😰" },
    { id: "sad", label: "Sad", emoji: "🌧️" }
  ],

  /* ------------------------ Flow intensity ----------------------- */
  flow: [
    { id: "none", label: "None", emoji: "○" },
    { id: "light", label: "Light", emoji: "💧" },
    { id: "medium", label: "Medium", emoji: "💧💧" },
    { id: "heavy", label: "Heavy", emoji: "💧💧💧" }
  ],

  /* ------------------------ Energy levels ------------------------ */
  energy: {
    1: "Drained",
    2: "Low",
    3: "Okay",
    4: "Good",
    5: "Energised"
  },

  /* ------------------------ Cycle phases ------------------------- */
  phases: {
    menstrual: {
      key: "menstrual",
      label: "Menstrual",
      emoji: "🌙",
      tone: "rose",
      blurb: "Your period is here. Rest, warmth and iron-rich food often help most.",
      dot: "rose"
    },
    follicular: {
      key: "follicular",
      label: "Follicular",
      emoji: "🌱",
      tone: "violet",
      blurb: "Energy usually builds here — a lovely window for movement and plans.",
      dot: "violet"
    },
    ovulation: {
      key: "ovulation",
      label: "Ovulation",
      emoji: "☀️",
      tone: "peach",
      blurb: "Often the most energetic days. An estimated fertile window — not a guarantee.",
      dot: "peach"
    },
    luteal: {
      key: "luteal",
      label: "Luteal",
      emoji: "🍂",
      tone: "lilac",
      blurb: "PMS can show up here. Gentler movement, sleep and steady meals help.",
      dot: "lilac"
    }
  },

  /* --------------------- Daily wellness tips --------------------- */
  tips: [
    "A warm water bottle on your lower belly for 15–20 minutes can ease cramps.",
    "Sip water steadily through the day — mild dehydration can make headaches worse.",
    "Try a 5-minute cat-cow stretch when your back feels tight.",
    "A handful of almonds or a banana is an easy magnesium-rich snack.",
    "Caffeine late in the day can disturb sleep, and poor sleep makes PMS feel louder.",
    "Ten slow breaths with a longer exhale can calm a spike of irritability.",
    "Gentle walking often helps bloating more than sitting still.",
    "Keep a small note of what helped you today. Patterns get clearer each cycle.",
    "Warm baths can settle both muscle tension and a busy mind.",
    "If your symptoms disrupt work or sleep, it is okay to ask a doctor for help."
  ],

  /* ------------------------ PMS remedies ------------------------- */
  remedies: [
    {
      emoji: "🔥",
      name: "Heating pad or warm water bottle",
      howTo: [
        "Fill a water bottle with warm (not boiling) water, or switch on a heating pad.",
        "Wrap it in a thin towel so it feels comfortably warm, never hot.",
        "Rest it on your lower belly or lower back for 15–20 minutes."
      ],
      benefits: [
        "Warmth relaxes the muscles of the uterus, which can ease cramping.",
        "The comfort of heat alone can help you feel calmer."
      ],
      precautions:
        "Avoid direct heat on bare skin, keep it off while sleeping, and use extra care if you have reduced skin sensation."
    },
    {
      emoji: "💧",
      name: "Water and balanced meals",
      howTo: [
        "Keep a bottle nearby and sip 6–8 glasses across the day.",
        "Build meals around protein, whole grains and vegetables.",
        "Prefer regular small meals over long gaps — steady blood sugar helps mood."
      ],
      benefits: [
        "Good hydration may reduce bloating and headaches.",
        "Balanced meals help keep energy and mood more stable."
      ],
      precautions:
        "If you have a condition that limits fluid intake, follow your doctor's advice."
    },
    {
      emoji: "🥬",
      name: "Magnesium and calcium rich foods",
      howTo: [
        "Add greens, almonds, pumpkin seeds, beans or dark chocolate for magnesium.",
        "Include yoghurt, milk, tofu or leafy greens for calcium.",
        "Spread them across the day instead of all at once."
      ],
      benefits: [
        "Some people notice less cramping and less muscle tension.",
        "These minerals support sleep and normal muscle function."
      ],
      precautions:
        "Food sources are usually safest. Ask a pharmacist or doctor before starting supplements, especially with other medication."
    },
    {
      emoji: "🌙",
      name: "Adequate sleep",
      howTo: [
        "Aim for 7–9 hours and keep wake-up times fairly consistent.",
        "Dim lights and screens 30 minutes before bed.",
        "Keep your room cool and quiet, and try a light stretching routine first."
      ],
      benefits: [
        "Better sleep often reduces irritability and sensitivity to pain.",
        "Rest supports hormone regulation and next-day energy."
      ],
      precautions:
        "If sleep problems last for weeks, or you snore heavily and wake unrefreshed, speak to a healthcare professional."
    },
    {
      emoji: "🧘",
      name: "Gentle stretching and relaxation",
      howTo: [
        "Set aside 5–10 minutes in a quiet spot.",
        "Move slowly through child's pose, cat-cow or a gentle side stretch.",
        "Finish with slow breathing, letting each exhale be a little longer."
      ],
      benefits: [
        "Loosens lower-back and hip tension.",
        "Steadies your breathing and lowers the sense of stress."
      ],
      precautions:
        "Stop if a stretch causes sharp pain. Never push into a painful range."
    },
    {
      emoji: "☕",
      name: "Less caffeine if it makes things worse",
      howTo: [
        "Notice when you drink coffee, tea, cola or energy drinks.",
        "Swap the second cup for water, herbal tea or decaf.",
        "Cut down gradually over a week to avoid withdrawal headaches."
      ],
      benefits: [
        "Less caffeine may mean less breast tenderness and jitteriness.",
        "Often improves sleep quality in the second half of the cycle."
      ],
      precautions:
        "Ease off slowly. Sudden caffeine withdrawal can cause headaches and tiredness."
    },
    {
      emoji: "🛁",
      name: "Warm baths and winding down",
      howTo: [
        "Run a warm — not hot — bath and add plain epsom salts if you like.",
        "Spend 15–20 minutes without your phone.",
        "Follow with loose clothing and a warm drink."
      ],
      benefits: [
        "Eases muscle tension and cramp discomfort.",
        "Creates a clear signal to your body that the day is ending."
      ],
      precautions:
        "Get out slowly if you feel light-headed, and skip very hot baths during pregnancy or if you faint easily."
    }
  ],

  /* -------------------- Exercises for PMS relief ----------------- */
  exercises: [
    {
      id: "gentle-yoga",
      emoji: "🧘‍♀️",
      name: "Gentle yoga flow",
      duration: "10–15 min",
      minutes: 12,
      difficulty: "Beginner",
      description:
        "A slow sequence of seated and standing poses that loosens the hips and lower back.",
      steps: [
        "Sit comfortably and take five slow breaths.",
        "Move into cat-cow for a minute, following your breath.",
        "Come to standing and hold a gentle side stretch on each side.",
        "Finish in child's pose for two minutes, breathing slowly."
      ],
      benefits: "Relaxes the lower back, eases cramps and calms a busy mind.",
      tags: ["cramps", "stress", "lowMood", "fatigue"]
    },
    {
      id: "walking",
      emoji: "🚶‍♀️",
      name: "Mindful walking",
      duration: "10–20 min",
      minutes: 15,
      difficulty: "Beginner",
      description:
        "An easy-paced walk, indoors or out, with attention on your breath and steps.",
      steps: [
        "Choose a comfortable, flat route.",
        "Walk at a pace where you can still chat.",
        "Name three things you can see and two you can hear.",
        "Slow down for the last two minutes and breathe deeply."
      ],
      benefits: "Helps with bloating, lifts low mood and improves circulation.",
      tags: ["bloating", "fatigue", "stress", "lowMood"]
    },
    {
      id: "cat-cow",
      emoji: "🐈",
      name: "Cat-cow stretch",
      duration: "3–5 min",
      minutes: 4,
      difficulty: "Beginner",
      description:
        "A flowing spine stretch on hands and knees, moving with your breath.",
      steps: [
        "Start on hands and knees, wrists under shoulders.",
        "Inhale, drop your belly and lift your chest (cow).",
        "Exhale, round your spine and tuck your chin (cat).",
        "Repeat slowly for 8–10 rounds."
      ],
      benefits: "Eases lower-back tightness and warms up the spine gently.",
      tags: ["cramps", "stress", "fatigue"]
    },
    {
      id: "childs-pose",
      emoji: "🌿",
      name: "Child's pose",
      duration: "2–5 min",
      minutes: 3,
      difficulty: "Beginner",
      description:
        "A resting forward fold that lets the back release completely.",
      steps: [
        "Kneel, then sit back towards your heels.",
        "Fold forward and rest your forehead on a cushion or the floor.",
        "Stretch your arms forward or rest them alongside you.",
        "Breathe slowly into your back for 1–3 minutes."
      ],
      benefits: "Releases back tension and signals safety and rest to the body.",
      tags: ["cramps", "stress", "fatigue", "lowMood"]
    },
    {
      id: "butterfly",
      emoji: "🦋",
      name: "Butterfly stretch",
      duration: "3–5 min",
      minutes: 4,
      difficulty: "Beginner",
      description:
        "A seated hip opener that gently stretches the inner thighs.",
      steps: [
        "Sit tall with the soles of your feet together.",
        "Let your knees fall out to a comfortable width.",
        "Hold your feet and lengthen your spine.",
        "Fold forward slightly and breathe for 1–2 minutes."
      ],
      benefits: "Opens the hips, which many people find eases period cramps.",
      tags: ["cramps", "bloating", "stress"]
    },
    {
      id: "light-stretch",
      emoji: "🌤️",
      name: "Full-body light stretch",
      duration: "5–10 min",
      minutes: 7,
      difficulty: "Beginner",
      description:
        "A short head-to-toe stretch you can do standing or beside your bed.",
      steps: [
        "Roll your shoulders back five times.",
        "Reach overhead and lean gently to each side.",
        "Do a slow standing forward fold, knees soft.",
        "Finish with a gentle neck tilt on each side."
      ],
      benefits: "Wakes up stiff muscles without demanding much energy.",
      tags: ["fatigue", "bloating", "stress", "cramps"]
    },
    {
      id: "breathing",
      emoji: "🫧",
      name: "Box breathing",
      duration: "3–5 min",
      minutes: 4,
      difficulty: "Beginner",
      description:
        "A simple counting breath that steadies a racing or irritable mind.",
      steps: [
        "Sit comfortably with your feet on the floor.",
        "Breathe in for a count of four.",
        "Hold for four, then breathe out for four.",
        "Hold for four and repeat for 8–10 rounds."
      ],
      benefits: "Lowers stress, can help headaches and makes rest easier.",
      tags: ["stress", "headache", "lowMood"]
    }
  ],

  /* --------------- Symptom → routine suggestions ---------------- */
  generatorSymptoms: [
    { id: "cramps", label: "Cramps", emoji: "🌀" },
    { id: "bloating", label: "Bloating", emoji: "🫧" },
    { id: "fatigue", label: "Fatigue", emoji: "😴" },
    { id: "stress", label: "Stress", emoji: "😮‍💨" },
    { id: "headache", label: "Headache", emoji: "🤕" },
    { id: "lowMood", label: "Low mood", emoji: "🌧️" }
  ]
};
