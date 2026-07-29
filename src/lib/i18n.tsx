import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LangCode =
  | "en" | "hi" | "bn" | "te" | "mr" | "ta" | "gu" | "kn" | "ml" | "pa" | "or" | "ur" | "as";

export const LANGUAGES: { code: LangCode; label: string; english: string }[] = [
  { code: "en", label: "English", english: "English" },
  { code: "hi", label: "हिन्दी", english: "Hindi" },
  { code: "bn", label: "বাংলা", english: "Bengali" },
  { code: "te", label: "తెలుగు", english: "Telugu" },
  { code: "mr", label: "मराठी", english: "Marathi" },
  { code: "ta", label: "தமிழ்", english: "Tamil" },
  { code: "gu", label: "ગુજરાતી", english: "Gujarati" },
  { code: "kn", label: "ಕನ್ನಡ", english: "Kannada" },
  { code: "ml", label: "മലയാളം", english: "Malayalam" },
  { code: "pa", label: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "or", label: "ଓଡ଼ିଆ", english: "Odia" },
  { code: "as", label: "অসমীয়া", english: "Assamese" },
  { code: "ur", label: "اردو", english: "Urdu" },
];

type Key =
  | "nav.dashboard" | "nav.scan" | "nav.yield" | "nav.marketplace" | "nav.prices"
  | "nav.schemes" | "nav.calendar" | "nav.chat" | "nav.signOut"
  | "lang.title" | "lang.subtitle" | "lang.continue" | "lang.change"
  | "common.loading" | "common.send" | "common.speak" | "common.generate" | "common.ask";

type Dict = Partial<Record<Key, string>>;

const en: Record<Key, string> = {
  "nav.dashboard": "Dashboard",
  "nav.scan": "Scan",
  "nav.yield": "Yield",
  "nav.marketplace": "Marketplace",
  "nav.prices": "Prices",
  "nav.schemes": "Schemes",
  "nav.calendar": "Calendar",
  "nav.chat": "AI Assistant",
  "nav.signOut": "Sign out",
  "lang.title": "Choose your language",
  "lang.subtitle": "CropGuard AI speaks your language. You can change this anytime.",
  "lang.continue": "Continue",
  "lang.change": "Language",
  "common.loading": "Loading...",
  "common.send": "Send",
  "common.speak": "Speak",
  "common.generate": "Generate",
  "common.ask": "Ask anything about your farm...",
};

const dicts: Record<LangCode, Dict> = {
  en,
  hi: {
    "nav.dashboard": "डैशबोर्ड", "nav.scan": "स्कैन", "nav.yield": "उपज", "nav.marketplace": "बाज़ार",
    "nav.prices": "भाव", "nav.schemes": "योजनाएँ", "nav.calendar": "कैलेंडर", "nav.chat": "एआई सहायक",
    "nav.signOut": "साइन आउट", "lang.title": "अपनी भाषा चुनें",
    "lang.subtitle": "CropGuard AI आपकी भाषा बोलता है। आप इसे कभी भी बदल सकते हैं।",
    "lang.continue": "आगे बढ़ें", "lang.change": "भाषा", "common.loading": "लोड हो रहा है...",
    "common.send": "भेजें", "common.speak": "बोलें", "common.generate": "बनाएँ",
    "common.ask": "अपने खेत के बारे में कुछ भी पूछें...",
  },
  bn: {
    "nav.dashboard": "ড্যাশবোর্ড", "nav.scan": "স্ক্যান", "nav.yield": "ফলন", "nav.marketplace": "বাজার",
    "nav.prices": "দাম", "nav.schemes": "প্রকল্প", "nav.calendar": "ক্যালেন্ডার", "nav.chat": "এআই সহকারী",
    "nav.signOut": "সাইন আউট", "lang.title": "আপনার ভাষা বেছে নিন",
    "lang.subtitle": "CropGuard AI আপনার ভাষায় কথা বলে। যেকোনো সময় পরিবর্তন করতে পারেন।",
    "lang.continue": "এগিয়ে যান", "lang.change": "ভাষা", "common.loading": "লোড হচ্ছে...",
    "common.send": "পাঠান", "common.speak": "বলুন", "common.generate": "তৈরি করুন",
    "common.ask": "আপনার খামার সম্পর্কে কিছু জিজ্ঞাসা করুন...",
  },
  te: {
    "nav.dashboard": "డాష్‌బోర్డ్", "nav.scan": "స్కాన్", "nav.yield": "దిగుబడి", "nav.marketplace": "మార్కెట్",
    "nav.prices": "ధరలు", "nav.schemes": "పథకాలు", "nav.calendar": "క్యాలెండర్", "nav.chat": "AI సహాయకుడు",
    "nav.signOut": "సైన్ అవుట్", "lang.title": "మీ భాషను ఎంచుకోండి",
    "lang.subtitle": "CropGuard AI మీ భాషలో మాట్లాడుతుంది. ఎప్పుడైనా మార్చవచ్చు.",
    "lang.continue": "కొనసాగించు", "lang.change": "భాష", "common.loading": "లోడ్ అవుతోంది...",
    "common.send": "పంపు", "common.speak": "మాట్లాడు", "common.generate": "సృష్టించు",
    "common.ask": "మీ పొలం గురించి ఏదైనా అడగండి...",
  },
  mr: {
    "nav.dashboard": "डॅशबोर्ड", "nav.scan": "स्कॅन", "nav.yield": "उत्पादन", "nav.marketplace": "बाजार",
    "nav.prices": "दर", "nav.schemes": "योजना", "nav.calendar": "दिनदर्शिका", "nav.chat": "एआय सहाय्यक",
    "nav.signOut": "साइन आउट", "lang.title": "तुमची भाषा निवडा",
    "lang.subtitle": "CropGuard AI तुमच्या भाषेत बोलते. कधीही बदलू शकता.",
    "lang.continue": "पुढे चला", "lang.change": "भाषा", "common.loading": "लोड होत आहे...",
    "common.send": "पाठवा", "common.speak": "बोला", "common.generate": "तयार करा",
    "common.ask": "तुमच्या शेताबद्दल काहीही विचारा...",
  },
  ta: {
    "nav.dashboard": "டாஷ்போர்டு", "nav.scan": "ஸ்கேன்", "nav.yield": "மகசூல்", "nav.marketplace": "சந்தை",
    "nav.prices": "விலைகள்", "nav.schemes": "திட்டங்கள்", "nav.calendar": "நாள்காட்டி", "nav.chat": "AI உதவியாளர்",
    "nav.signOut": "வெளியேறு", "lang.title": "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    "lang.subtitle": "CropGuard AI உங்கள் மொழியில் பேசும். எப்போது வேண்டுமானாலும் மாற்றலாம்.",
    "lang.continue": "தொடரவும்", "lang.change": "மொழி", "common.loading": "ஏற்றுகிறது...",
    "common.send": "அனுப்பு", "common.speak": "பேசு", "common.generate": "உருவாக்கு",
    "common.ask": "உங்கள் பண்ணை பற்றி எதையும் கேளுங்கள்...",
  },
  gu: {
    "nav.dashboard": "ડેશબોર્ડ", "nav.scan": "સ્કેન", "nav.yield": "ઉપજ", "nav.marketplace": "બજાર",
    "nav.prices": "ભાવ", "nav.schemes": "યોજનાઓ", "nav.calendar": "કૅલેન્ડર", "nav.chat": "AI સહાયક",
    "nav.signOut": "સાઇન આઉટ", "lang.title": "તમારી ભાષા પસંદ કરો",
    "lang.subtitle": "CropGuard AI તમારી ભાષામાં વાત કરે છે. ગમે ત્યારે બદલી શકો છો.",
    "lang.continue": "આગળ વધો", "lang.change": "ભાષા", "common.loading": "લોડ થઈ રહ્યું છે...",
    "common.send": "મોકલો", "common.speak": "બોલો", "common.generate": "બનાવો",
    "common.ask": "તમારા ખેતર વિશે કંઈપણ પૂછો...",
  },
  kn: {
    "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "nav.scan": "ಸ್ಕ್ಯಾನ್", "nav.yield": "ಇಳುವರಿ", "nav.marketplace": "ಮಾರುಕಟ್ಟೆ",
    "nav.prices": "ಬೆಲೆಗಳು", "nav.schemes": "ಯೋಜನೆಗಳು", "nav.calendar": "ಕ್ಯಾಲೆಂಡರ್", "nav.chat": "AI ಸಹಾಯಕ",
    "nav.signOut": "ಸೈನ್ ಔಟ್", "lang.title": "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆರಿಸಿ",
    "lang.subtitle": "CropGuard AI ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡುತ್ತದೆ. ಯಾವಾಗ ಬೇಕಾದರೂ ಬದಲಾಯಿಸಿ.",
    "lang.continue": "ಮುಂದುವರಿಸಿ", "lang.change": "ಭಾಷೆ", "common.loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    "common.send": "ಕಳುಹಿಸಿ", "common.speak": "ಮಾತನಾಡಿ", "common.generate": "ರಚಿಸಿ",
    "common.ask": "ನಿಮ್ಮ ಹೊಲದ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ...",
  },
  ml: {
    "nav.dashboard": "ഡാഷ്‌ബോർഡ്", "nav.scan": "സ്കാൻ", "nav.yield": "വിളവ്", "nav.marketplace": "വിപണി",
    "nav.prices": "വില", "nav.schemes": "പദ്ധതികൾ", "nav.calendar": "കലണ്ടർ", "nav.chat": "AI സഹായി",
    "nav.signOut": "സൈൻ ഔട്ട്", "lang.title": "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
    "lang.subtitle": "CropGuard AI നിങ്ങളുടെ ഭാഷയിൽ സംസാരിക്കുന്നു. എപ്പോൾ വേണമെങ്കിലും മാറ്റാം.",
    "lang.continue": "തുടരുക", "lang.change": "ഭാഷ", "common.loading": "ലോഡ് ചെയ്യുന്നു...",
    "common.send": "അയയ്ക്കുക", "common.speak": "സംസാരിക്കുക", "common.generate": "സൃഷ്ടിക്കുക",
    "common.ask": "നിങ്ങളുടെ കൃഷിയെക്കുറിച്ച് എന്തും ചോദിക്കൂ...",
  },
  pa: {
    "nav.dashboard": "ਡੈਸ਼ਬੋਰਡ", "nav.scan": "ਸਕੈਨ", "nav.yield": "ਝਾੜ", "nav.marketplace": "ਮੰਡੀ",
    "nav.prices": "ਭਾਅ", "nav.schemes": "ਸਕੀਮਾਂ", "nav.calendar": "ਕੈਲੰਡਰ", "nav.chat": "AI ਸਹਾਇਕ",
    "nav.signOut": "ਸਾਈਨ ਆਉਟ", "lang.title": "ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ",
    "lang.subtitle": "CropGuard AI ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਬੋਲਦਾ ਹੈ। ਕਦੇ ਵੀ ਬਦਲੋ।",
    "lang.continue": "ਅੱਗੇ ਵਧੋ", "lang.change": "ਭਾਸ਼ਾ", "common.loading": "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    "common.send": "ਭੇਜੋ", "common.speak": "ਬੋਲੋ", "common.generate": "ਬਣਾਓ",
    "common.ask": "ਆਪਣੇ ਖੇਤ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ...",
  },
  or: {
    "nav.dashboard": "ଡ୍ୟାସବୋର୍ଡ", "nav.scan": "ସ୍କାନ", "nav.yield": "ଅମଳ", "nav.marketplace": "ବଜାର",
    "nav.prices": "ଦର", "nav.schemes": "ଯୋଜନା", "nav.calendar": "କ୍ୟାଲେଣ୍ଡର", "nav.chat": "AI ସହାୟକ",
    "nav.signOut": "ସାଇନ ଆଉଟ", "lang.title": "ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ",
    "lang.subtitle": "CropGuard AI ଆପଣଙ୍କ ଭାଷାରେ କଥା ହୁଏ। ଯେକୌଣସି ସମୟରେ ବଦଳାନ୍ତୁ।",
    "lang.continue": "ଆଗକୁ ଯାଆନ୍ତୁ", "lang.change": "ଭାଷା", "common.loading": "ଲୋଡ ହେଉଛି...",
    "common.send": "ପଠାନ୍ତୁ", "common.speak": "କୁହନ୍ତୁ", "common.generate": "ତିଆରି କରନ୍ତୁ",
    "common.ask": "ଆପଣଙ୍କ ଚାଷ ବିଷୟରେ କିଛି ପଚାରନ୍ତୁ...",
  },
  as: {
    "nav.dashboard": "ডেশ্বব’ৰ্ড", "nav.scan": "স্কেন", "nav.yield": "উৎপাদন", "nav.marketplace": "বজাৰ",
    "nav.prices": "দাম", "nav.schemes": "আঁচনি", "nav.calendar": "কেলেণ্ডাৰ", "nav.chat": "AI সহায়ক",
    "nav.signOut": "ছাইন আউট", "lang.title": "আপোনাৰ ভাষা বাছনি কৰক",
    "lang.subtitle": "CropGuard AI আপোনাৰ ভাষাত কথা কয়। যিকোনো সময়তে সলনি কৰক।",
    "lang.continue": "আগবাঢ়ক", "lang.change": "ভাষা", "common.loading": "ল’ড হৈ আছে...",
    "common.send": "পঠিয়াওক", "common.speak": "কওক", "common.generate": "সৃষ্টি কৰক",
    "common.ask": "আপোনাৰ পথাৰৰ বিষয়ে সোধক...",
  },
  ur: {
    "nav.dashboard": "ڈیش بورڈ", "nav.scan": "اسکین", "nav.yield": "پیداوار", "nav.marketplace": "منڈی",
    "nav.prices": "قیمتیں", "nav.schemes": "اسکیمیں", "nav.calendar": "کیلنڈر", "nav.chat": "اے آئی معاون",
    "nav.signOut": "سائن آؤٹ", "lang.title": "اپنی زبان منتخب کریں",
    "lang.subtitle": "CropGuard AI آپ کی زبان بولتا ہے۔ آپ اسے کبھی بھی بدل سکتے ہیں۔",
    "lang.continue": "جاری رکھیں", "lang.change": "زبان", "common.loading": "لوڈ ہو رہا ہے...",
    "common.send": "بھیجیں", "common.speak": "بولیں", "common.generate": "بنائیں",
    "common.ask": "اپنے کھیت کے بارے میں کچھ بھی پوچھیں...",
  },
};

const STORAGE_KEY = "cropguard.lang";

type Ctx = {
  lang: LangCode;
  languageName: string;
  setLang: (l: LangCode) => void;
  t: (k: Key) => string;
  chosen: boolean;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");
  const [chosen, setChosen] = useState(true);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved && saved in dicts) setLangState(saved as LangCode);
    else setChosen(false);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      chosen,
      languageName: LANGUAGES.find((l) => l.code === lang)?.english ?? "English",
      setLang: (l: LangCode) => {
        setLangState(l);
        setChosen(true);
        if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
        if (typeof document !== "undefined") {
          document.documentElement.lang = l;
          document.documentElement.dir = l === "ur" ? "rtl" : "ltr";
        }
      },
      t: (k: Key) => dicts[lang]?.[k] ?? en[k],
    }),
    [lang, chosen],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export const BCP47: Record<LangCode, string> = {
  en: "en-IN", hi: "hi-IN", bn: "bn-IN", te: "te-IN", mr: "mr-IN", ta: "ta-IN",
  gu: "gu-IN", kn: "kn-IN", ml: "ml-IN", pa: "pa-IN", or: "or-IN", as: "as-IN", ur: "ur-PK",
};
