"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const T = {
  en: {
    headline: "Your Recovery",
    subtitle: "Evidence-based care, available whenever you need it.",
    description:
      "Recovery looks different for everyone. Recover provides structured daily check-ins, progress tracking, and clinically validated resources — so you always have the support you deserve.",
    importTitle: "Import Data",
    importLabel: "Code (from mobile app):",
    placeholder: "Enter code",
    importBtn: "Start",
    available: "Available on App Store and Google Play.",
    download: "Download for free on your smartphone.",
  },
  no: {
    headline: "Din bedring",
    subtitle: "Evidensbasert hjelp – tilgjengelig når du trenger det.",
    description:
      "Bedring ser forskjellig ut for alle. Recover gir deg strukturerte daglige innsjekk, fremdriftssporing og klinisk validerte ressurser – slik at du alltid har støtten du fortjener.",
    importTitle: "Importer Data",
    importLabel: "Kode (fra mobilapp):",
    placeholder: "Skriv inn kode",
    importBtn: "Start",
    available: "Tilgjengelig på App Store og Google Play.",
    download: "Last ned gratis på din smarttelefon.",
  },
  sv: {
    headline: "Din återhämtning",
    subtitle: "Evidensbaserad hjälp – tillgänglig när du behöver den.",
    description:
      "Återhämtning ser ut på olika sätt för alla. Recover erbjuder strukturerade dagliga incheckningar, framstegsuppföljning och kliniskt validerade resurser – så att du alltid har det stöd du förtjänar.",
    importTitle: "Importera Data",
    importLabel: "Kod (från mobilapp):",
    placeholder: "Ange kod",
    importBtn: "Starta",
    available: "Tillgänglig på App Store och Google Play.",
    download: "Ladda ner gratis på din smartphone.",
  },
  da: {
    headline: "Din bedring",
    subtitle: "Evidensbaseret hjælp – tilgængelig når du har brug for det.",
    description:
      "Bedring ser forskellig ud for alle. Recover tilbyder strukturerede daglige check-ins, fremskridtssporing og klinisk validerede ressourcer – så du altid har den støtte, du fortjener.",
    importTitle: "Importer Data",
    importLabel: "Kode (fra mobilapp):",
    placeholder: "Indtast kode",
    importBtn: "Start",
    available: "Tilgængelig på App Store og Google Play.",
    download: "Download gratis på din smartphone.",
  },
  fi: {
    headline: "Toipumisesi",
    subtitle: "Näyttöön perustuva tuki – aina kun tarvitset sitä.",
    description:
      "Toipuminen näyttää erilaiselta jokaiselle. Recover tarjoaa jäsenneltyjä päivittäisiä check-ineja, edistymisen seurantaa ja kliinisesti validoituja resursseja – jotta sinulla on aina ansaitsemasi tuki.",
    importTitle: "Tuo Tiedot",
    importLabel: "Koodi (mobiilisovelluksesta):",
    placeholder: "Syötä koodi",
    importBtn: "Aloita",
    available: "Saatavilla App Storessa ja Google Playssa.",
    download: "Lataa ilmaiseksi älypuhelimellesi.",
  },
  nl: {
    headline: "Jouw herstel",
    subtitle:
      "Evidentiegerichte zorg – beschikbaar wanneer jij het nodig hebt.",
    description:
      "Herstel ziet er voor iedereen anders uit. Recover biedt gestructureerde dagelijkse check-ins, voortgangsregistratie en klinisch gevalideerde middelen – zodat je altijd de ondersteuning krijgt die je verdient.",
    importTitle: "Importeer Gegevens",
    importLabel: "Code (van mobiele app):",
    placeholder: "Voer code in",
    importBtn: "Start",
    available: "Beschikbaar op App Store en Google Play.",
    download: "Download gratis op uw smartphone.",
  },
  fr: {
    headline: "Votre rétablissement",
    subtitle:
      "Des soins fondés sur des preuves – disponibles quand vous en avez besoin.",
    description:
      "Le rétablissement est différent pour chacun. Recover propose des bilans quotidiens structurés, un suivi des progrès et des ressources cliniquement validées – pour que vous ayez toujours le soutien que vous méritez.",
    importTitle: "Importer les Données",
    importLabel: "Code (depuis l'application mobile) :",
    placeholder: "Entrer le code",
    importBtn: "Démarrer",
    available: "Disponible sur App Store et Google Play.",
    download: "Téléchargez gratuitement sur votre smartphone.",
  },
  de: {
    headline: "Deine Genesung",
    subtitle: "Evidenzbasierte Unterstützung – immer wenn du sie brauchst.",
    description:
      "Genesung sieht für jeden anders aus. Recover bietet strukturierte tägliche Check-ins, Fortschrittsverfolgung und klinisch validierte Ressourcen – damit du stets die Unterstützung hast, die du verdienst.",
    importTitle: "Daten Importieren",
    importLabel: "Code (aus der mobilen App):",
    placeholder: "Code eingeben",
    importBtn: "Starten",
    available: "Verfügbar im App Store und bei Google Play.",
    download: "Kostenlos auf Ihrem Smartphone herunterladen.",
  },
  it: {
    headline: "Il tuo percorso",
    subtitle:
      "Assistenza basata su evidenze – disponibile quando ne hai bisogno.",
    description:
      "Il percorso di guarigione è diverso per ognuno. Recover offre check-in quotidiani strutturati, monitoraggio dei progressi e risorse clinicamente validate – così da avere sempre il supporto che meriti.",
    importTitle: "Importa Dati",
    importLabel: "Codice (dall'app mobile):",
    placeholder: "Inserisci codice",
    importBtn: "Avvia",
    available: "Disponibile su App Store e Google Play.",
    download: "Scarica gratuitamente sul tuo smartphone.",
  },
  es: {
    headline: "Tu recuperación",
    subtitle: "Atención basada en evidencia – disponible cuando la necesites.",
    description:
      "La recuperación es diferente para cada persona. Recover ofrece registros diarios estructurados, seguimiento del progreso y recursos clínicamente validados – para que siempre tengas el apoyo que mereces.",
    importTitle: "Importar Datos",
    importLabel: "Código (de la aplicación móvil):",
    placeholder: "Introducir código",
    importBtn: "Iniciar",
    available: "Disponible en App Store y Google Play.",
    download: "Descargue gratis en su smartphone.",
  },
  pl: {
    headline: "Twój powrót do zdrowia",
    subtitle: "Opieka oparta na dowodach – dostępna kiedy jej potrzebujesz.",
    description:
      "Powrót do zdrowia wygląda inaczej dla każdego. Recover oferuje ustrukturyzowane codzienne meldunki, śledzenie postępów i klinicznie zweryfikowane zasoby – abyś zawsze miał wsparcie, na jakie zasługujesz.",
    importTitle: "Importuj Dane",
    importLabel: "Kod (z aplikacji mobilnej):",
    placeholder: "Wprowadź kod",
    importBtn: "Rozpocznij",
    available: "Dostępne w App Store i Google Play.",
    download: "Pobierz bezpłatnie na swój smartfon.",
  },
  pt: {
    headline: "A sua recuperação",
    subtitle: "Cuidados baseados em evidências – disponíveis quando precisar.",
    description:
      "A recuperação é diferente para cada pessoa. O Recover oferece check-ins diários estruturados, acompanhamento do progresso e recursos clinicamente validados – para que tenha sempre o apoio que merece.",
    importTitle: "Importar Dados",
    importLabel: "Código (da aplicação móvel):",
    placeholder: "Introduzir código",
    importBtn: "Iniciar",
    available: "Disponível na App Store e Google Play.",
    download: "Descarregue gratuitamente no seu smartphone.",
  },
};

const LANGS = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "nl", flag: "🇳🇱", label: "Nederlands" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "it", flag: "🇮🇹", label: "Italiano" },
  { code: "no", flag: "🇳🇴", label: "Norsk" },
  { code: "sv", flag: "🇸🇪", label: "Svenska" },
  { code: "da", flag: "🇩🇰", label: "Dansk" },
  { code: "fi", flag: "🇫🇮", label: "Suomi" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "pl", flag: "🇵🇱", label: "Polski" },
  { code: "pt", flag: "🇵🇹", label: "Português" },
];

const DOMAIN_LANG = { "focusapp.no": "no", "focusapp.com": "en" };

function detectLang() {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("focusapp_lang");
  if (saved && T[saved]) return saved;
  const domain = Object.keys(DOMAIN_LANG).find((d) =>
    window.location.hostname.includes(d),
  );
  if (domain) return DOMAIN_LANG[domain];
  const browser = navigator.language?.slice(0, 2);
  return T[browser] ? browser : "en";
}

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLang(detectLang());
  }, []);

  const t = T[lang] ?? T.en;

  const changeLang = (lc) => {
    setLang(lc);
    localStorage.setItem("focusapp_lang", lc);
  };

  const handleStart = async () => {
    const trimmed = code.trim().replace(/\s/g, "");
    if (!/^\d{6}$/.test(trimmed)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (data.valid) {
        sessionStorage.setItem("patientData", JSON.stringify(data.patient));
        router.push("/dashboard");
      } else {
        setError(data.message ?? "Code not found or has expired.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-[#2d4a6e] overflow-x-hidden">
      {/* ── Page content ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 pt-10 pb-20 md:px-7 md:pt-12">
        <div className="flex flex-col gap-5 mb-10 md:flex-row md:items-start md:gap-12 md:mb-12">
          {/* Left: brand + description + phones */}
          <div className="flex flex-col gap-5 md:flex-1 md:min-w-0">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Image
                src="/focus_logo.png"
                alt="Recover"
                width={64}
                height={64}
                className="rounded-2xl shadow-lg object-cover flex-shrink-0"
              />
              <div>
                <div className="text-3xl md:text-4xl font-black text-[#2d4a6e] leading-none">
                  {t.headline}
                </div>
                <div className="text-[11px] font-bold tracking-widest text-[#7AABDB] uppercase mt-1">
                  {t.subtitle}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm md:text-[15px] leading-relaxed text-[#3a5272] font-medium">
              {t.description}
            </p>

            {/* Phone screenshots — desktop only */}
            <div className="hidden md:flex items-end justify-start mt-2">
              <div
                className="relative"
                style={{ zIndex: 1, marginRight: "8px" }}
              >
                <Image
                  src="/phone1.png"
                  alt="Recover home"
                  width={160}
                  height={320}
                  className="w-[140px] h-auto rounded-[28px] border-[4px] border-black shadow-xl block"
                />
              </div>
              <div
                className="relative"
                style={{ zIndex: 3, marginTop: "24px" }}
              >
                <Image
                  src="/phone3.png"
                  alt="Recover diary"
                  width={160}
                  height={320}
                  className="w-[160px] h-auto rounded-[28px] border-[4px] border-black shadow-2xl block"
                />
              </div>
              <div
                className="relative"
                style={{ zIndex: 1, marginLeft: "8px" }}
              >
                <Image
                  src="/phone2.png"
                  alt="Recover progress"
                  width={160}
                  height={320}
                  className="w-[140px] h-auto rounded-[28px] border-[4px] border-black shadow-xl block"
                />
              </div>
            </div>
          </div>

          {/* Right: import card */}
          <div className="w-[260px] mx-auto md:mx-0 md:w-[400px] flex-shrink-0 md:sticky md:top-8">
            {/* Language selector */}
            <div className="relative mb-3">
              <select
                value={lang}
                onChange={(e) => changeLang(e.target.value)}
                className="w-full appearance-none bg-white border-2 border-[#dde8f4] rounded-xl px-4 py-3 text-sm font-semibold text-[#2d4a6e] cursor-pointer outline-none focus:border-[#4a7ab5] focus:ring-4 focus:ring-[#4a7ab5]/10 transition-all pr-10"
              >
                {LANGS.map(({ code: lc, flag, label }) => (
                  <option key={lc} value={lc}>
                    {flag} {label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8aaa]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-xl ring-1 ring-[#7AABDB]/20">
              {/* Card hero image */}
              <div className="relative bg-gradient-to-r from-[#2d4a6e] via-[#4a7ab5] to-[#7AABDB]">
                <Image
                  src="/welcome.png"
                  alt="Doctor and patient"
                  width={540}
                  height={320}
                  className="w-full h-auto block"
                />
                <Image
                  src="/focus_logo.png"
                  alt="Recover"
                  width={44}
                  height={44}
                  className="absolute top-3 right-3 rounded-xl shadow-lg object-cover"
                />
              </div>

              {/* Card body */}
              <div className="p-6">
                <h2 className="text-xs font-black tracking-[2px] text-[#2d4a6e] uppercase text-center mb-5">
                  {t.importTitle}
                </h2>
                <label
                  htmlFor="share-code"
                  className="block text-[11px] font-bold tracking-[1.5px] text-[#6b8aaa] uppercase mb-2"
                >
                  {t.importLabel}
                </label>
                <input
                  id="share-code"
                  type="text"
                  placeholder={t.placeholder}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleStart()}
                  maxLength={12}
                  autoComplete="off"
                  className="w-full border-2 border-[#dde8f4] rounded-xl px-4 py-3 text-[15px] text-[#2d4a6e] bg-[#f0f4f8] outline-none mb-3 tracking-wide placeholder:text-[#b0c4d8] placeholder:tracking-normal focus:border-[#4a7ab5] focus:ring-4 focus:ring-[#4a7ab5]/10 transition-all"
                />
                {error && (
                  <p className="text-xs text-red-500 mb-2 -mt-1">{error}</p>
                )}
                <button
                  onClick={handleStart}
                  className="w-full bg-gradient-to-br from-[#4a7ab5] to-[#2d4a6e] text-white rounded-xl py-4 text-sm font-black tracking-[2px] uppercase shadow-lg hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all"
                >
                  {loading ? "…" : t.importBtn}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: phones (mobile) + stores + flags */}
        <div className="flex flex-col items-center gap-7 text-center">
          {/* Phone screenshots — mobile only */}
          <div className="flex md:hidden items-end justify-center">
            <div className="relative" style={{ zIndex: 1, marginRight: "6px" }}>
              <Image
                src="/phone1.png"
                alt="Recover home"
                width={130}
                height={260}
                className="w-[110px] h-auto rounded-[24px] border-[4px] border-black shadow-xl block"
              />
            </div>
            <div className="relative" style={{ zIndex: 3, marginTop: "20px" }}>
              <Image
                src="/phone2.png"
                alt="Recover diary"
                width={130}
                height={260}
                className="w-[125px] h-auto rounded-[24px] border-[4px] border-black shadow-2xl block"
              />
            </div>
            <div className="relative" style={{ zIndex: 1, marginLeft: "6px" }}>
              <Image
                src="/phone3.png"
                alt="Recover progress"
                width={130}
                height={260}
                className="w-[110px] h-auto rounded-[24px] border-[4px] border-black shadow-xl block"
              />
            </div>
          </div>

          {/* Store badges */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-[#6b8aaa] leading-relaxed">
              {t.available}
              <br />
              {t.download}
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <a
                href="https://apps.apple.com/app/id6762452909"
                className="flex items-center gap-2 bg-[#2d4a6e] text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#4a7ab5] hover:-translate-y-0.5 transition-all no-underline whitespace-nowrap"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.qupda.recover"
                className="flex items-center gap-2 bg-[#2d4a6e] text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#4a7ab5] hover:-translate-y-0.5 transition-all no-underline whitespace-nowrap"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M3.18 23.76c.34.19.73.21 1.1.04l12.2-6.87-2.5-2.5-10.8 9.33zm-1.37-20.7A1.75 1.75 0 0 0 1.5 4.5v15c0 .47.18.9.31 1.24L13.9 8.65 1.81 3.06zm20.12 8.62L19.4 9.5l-2.77 2.76 2.77 2.77 2.55-1.44a1.75 1.75 0 0 0 0-3.01zM4.28.2C3.9.02 3.5.05 3.18.24L14.08 11.1 16.6 8.6 4.28.2z" />
                </svg>
                Google Play
              </a>
            </div>
          </div>

          {/* Language flags */}
          <div className="flex gap-2 flex-wrap items-center justify-center">
            {LANGS.map(({ code: lc, flag }) => (
              <button
                key={lc}
                onClick={() => changeLang(lc)}
                className={`text-[22px] bg-transparent border-none cursor-pointer p-0.5 leading-none transition-all duration-150
                  ${lang === lc ? "opacity-100 scale-[1.15]" : "opacity-45 hover:opacity-100 hover:scale-110"}`}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-5 px-6 text-xs text-[#6b8aaa] border-t border-[#4a7ab5]/10">
        Copyright 2026 – KBB Medic AS (org: 912 372 022) &nbsp;·&nbsp;
        <a
          href="mailto:post@kbbmedic.no"
          className="text-[#4a7ab5] no-underline hover:underline"
        >
          post@kbbmedic.no
        </a>
      </footer>
    </div>
  );
}
