// src/app/dashboard/adviceData.js
// Fallback advice content for all 18 items × 12 languages
// Used when translation keys aren't present in the loaded translation file

const ADVICE = {
  en: [
    { id:"1",  title:"Managing cravings in the moment",         body:"When a craving hits, try the 15-minute rule: delay acting on it for 15 minutes. Cravings are waves — they peak and subside. Distract yourself with a short walk, a cold drink, or calling someone." },
    { id:"2",  title:"Identifying your craving triggers",        body:"Keep a note of when cravings appear strongest — time of day, place, emotion, or social setting. Recognising patterns is the first step to managing them proactively." },
    { id:"3",  title:"Low mood and substance use",              body:"Low mood and substance use often reinforce each other. When mood dips, reach out to someone you trust instead of using. Even a short conversation can shift your state." },
    { id:"4",  title:"Building a mood-lifting routine",          body:"Small daily habits — a 10-minute walk, sunlight in the morning, or a regular meal — can stabilise mood over time more reliably than larger occasional efforts." },
    { id:"5",  title:"Sleep and recovery",                      body:"Sleep is when your brain heals. Aim for a consistent bedtime, avoid screens 30 minutes before sleep, and keep the room cool and dark. Poor sleep increases cravings the next day." },
    { id:"6",  title:"What disrupts sleep during recovery",     body:"Alcohol and stimulants fragment sleep even when they seem to help you fall asleep. As your system adjusts, sleep quality usually improves significantly within weeks." },
    { id:"7",  title:"Taking medication consistently",          body:"Prescribed medication works best when taken at the same time every day. Set a phone reminder and keep medication somewhere visible so it becomes part of your routine." },
    { id:"8",  title:"Talking to your doctor about medication", body:"If you have concerns about side effects or how a medication makes you feel, write them down before your appointment so you can explain clearly. Never stop medication without consulting your doctor first." },
    { id:"9",  title:"What wellbeing means in recovery",        body:"Wellbeing is not just the absence of symptoms — it includes having purpose, connection, and small things to look forward to. Recovery goes best when you build a life you want to live." },
    { id:"10", title:"Physical activity and wellbeing",         body:"Even light physical activity — a 20-minute walk three times a week — has been shown to reduce anxiety, improve sleep, and lower cravings. You don't need a gym." },
    { id:"11", title:"Stress and relapse risk",                 body:"Stress is one of the most common relapse triggers. Identify your top two or three stressors and think in advance about one practical step you can take for each." },
    { id:"12", title:"Breathing to reduce stress",             body:"Slow breathing activates the parasympathetic nervous system and reduces the stress response within minutes. Try inhaling for 4 counts, holding for 4, exhaling for 6." },
    { id:"13", title:"Talking to people you trust",            body:"Isolation increases risk. Having at least one person you can be honest with — about how you're really doing — is one of the strongest protective factors in recovery." },
    { id:"14", title:"Setting boundaries in relationships",    body:"It's okay to say no to situations or people that put your recovery at risk. You can be direct without being harsh: 'I'm not in a place where I can do that right now.'" },
    { id:"15", title:"What to do after a setback",            body:"A setback is not a failure — it's information. Try to identify what happened without judgment, talk to someone, and restart your routine as quickly as possible. Progress is rarely a straight line." },
    { id:"16", title:"Celebrating small progress",            body:"Recovery involves hundreds of small decisions every day. Acknowledging them — even just noticing a good choice you made — builds confidence and momentum over time." },
    { id:"17", title:"Asking for help",                       body:"Asking for help is a sign of self-awareness, not weakness. Whether it's your doctor, a support line, or someone close to you — reaching out early is always better than waiting until a crisis." },
    { id:"18", title:"Planning for difficult moments",        body:"Think about the situations that are hardest for you and make a simple plan: who will you call, what will you do, where will you go? Having a plan reduces the chance that stress leads to use." },
  ],
  no: [
    { id:"1",  title:"Håndtere sug i øyeblikket",               body:"Når suget melder seg, prøv 15-minutters-regelen: utsett å handle på det i 15 minutter. Sug er bølger — de topper seg og avtar. Distraher deg selv med en kort tur, noe kaldt å drikke, eller ring noen." },
    { id:"2",  title:"Identifisere utløsere for sug",            body:"Noter når suget er sterkest — tidspunkt, sted, følelse eller sosial situasjon. Å gjenkjenne mønstre er første steg mot å håndtere dem proaktivt." },
    { id:"3",  title:"Lavt humør og rusbruk",                   body:"Lavt humør og rusbruk forsterker hverandre. Når humøret synker, kontakt noen du stoler på i stedet for å bruke. Selv en kort samtale kan endre tilstanden din." },
    { id:"4",  title:"Bygge en humørfremmende rutine",           body:"Små daglige vaner — en 10-minutters tur, sollys om morgenen eller et regelmessig måltid — kan stabilisere humøret over tid mer pålitelig enn store, tilfeldige innsatser." },
    { id:"5",  title:"Søvn og bedring",                         body:"Søvn er når hjernen heles. Sikt på et konsistent leggetidspunkt, unngå skjermer 30 minutter før søvn, og hold rommet kjølig og mørkt. Dårlig søvn øker suget dagen etter." },
    { id:"6",  title:"Hva forstyrrer søvnen under bedring",     body:"Alkohol og stimulanser fragmenterer søvnen selv om de ser ut til å hjelpe deg å sovne. Etter hvert som systemet ditt tilpasser seg, forbedres søvnkvaliteten vanligvis betydelig." },
    { id:"7",  title:"Ta medisiner konsekvent",                 body:"Foreskrevne medisiner virker best når de tas til samme tid hver dag. Sett en telefonpåminnelse og ha medisinen et synlig sted så det blir en del av rutinen." },
    { id:"8",  title:"Snakke med legen om medisiner",           body:"Skriv ned bekymringer om bivirkninger før avtalen så du kan forklare tydelig. Slutt aldri med medisiner uten å konsultere legen din først." },
    { id:"9",  title:"Hva velvære betyr i bedring",             body:"Velvære er ikke bare fravær av symptomer — det inkluderer å ha formål, tilknytning og små ting å se frem til. Bedring går best når du bygger et liv du ønsker å leve." },
    { id:"10", title:"Fysisk aktivitet og velvære",             body:"Selv lett fysisk aktivitet — en 20-minutters tur tre ganger i uken — er vist å redusere angst, forbedre søvn og redusere sug. Du trenger ikke treningsstudio." },
    { id:"11", title:"Stress og tilbakefallsrisiko",            body:"Stress er en av de vanligste utløserne for tilbakefall. Identifiser dine to eller tre største stressorer og tenk på forhånd på ett praktisk steg du kan ta for hver." },
    { id:"12", title:"Pust for å redusere stress",              body:"Langsom pust aktiverer det parasympatiske nervesystemet og reduserer stressresponsen på få minutter. Prøv å puste inn i 4 sekunder, holde i 4, puste ut i 6." },
    { id:"13", title:"Snakke med folk du stoler på",            body:"Isolasjon øker risikoen. Å ha minst én person du kan være ærlig med — om hvordan du faktisk har det — er en av de sterkeste beskyttelsesfaktorene i bedring." },
    { id:"14", title:"Sette grenser i relasjoner",              body:"Det er greit å si nei til situasjoner eller mennesker som setter bedringen din i fare. Du kan være direkte uten å være hard: 'Jeg er ikke i en posisjon der jeg kan gjøre det nå.'" },
    { id:"15", title:"Hva du gjør etter et tilbakefall",        body:"Et tilbakefall er ikke en fiasko — det er informasjon. Prøv å identifisere hva som skjedde uten å dømme, snakk med noen, og gjenstart rutinen din så raskt som mulig." },
    { id:"16", title:"Feire små fremskritt",                    body:"Bedring innebærer hundrevis av små beslutninger hver dag. Å anerkjenne dem — selv bare å merke et godt valg du tok — bygger selvtillit og momentum over tid." },
    { id:"17", title:"Be om hjelp",                             body:"Å be om hjelp er et tegn på selvbevissthet, ikke svakhet. Enten det er legen din, en støttelinje eller noen nær deg — å ta kontakt tidlig er alltid bedre enn å vente til en krise." },
    { id:"18", title:"Planlegge for vanskelige øyeblikk",       body:"Tenk på situasjonene som er vanskeligst for deg og lag en enkel plan: hvem ringer du, hva gjør du, hvor går du? Å ha en plan reduserer sjansen for at stress fører til bruk." },
  ],
};

// For languages without a full translation, fall back to English
const FALLBACK_LANGS = ["sv","da","de","fr","nl","it","es","fi","pt","pl"];
FALLBACK_LANGS.forEach(l => { ADVICE[l] = ADVICE.en; });

export function getAdvice(lang) {
  return ADVICE[lang] ?? ADVICE.en;
}

export function getAdviceItem(lang, id) {
  const list = getAdvice(lang);
  return list.find(a => a.id === String(id)) ?? { id, title: `Advice ${id}`, body: "" };
}
