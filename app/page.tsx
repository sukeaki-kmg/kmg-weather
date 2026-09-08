"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, ChevronDown, CloudRain, Compass, ExternalLink, MapPin, ShieldCheck, Umbrella } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const regions = [
  { name: "北海道", x: 82, y: 10, w: 16, h: 14, color: "#7cc8d8", prefs: ["北海道"] },
  { name: "東北", x: 74, y: 27, w: 14, h: 17, color: "#88cdb1", prefs: ["青森県","岩手県","宮城県","秋田県","山形県","福島県"] },
  { name: "関東", x: 69, y: 48, w: 14, h: 17, color: "#f2c86c", prefs: ["茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県"] },
  { name: "中部", x: 52, y: 42, w: 15, h: 20, color: "#ef9b70", prefs: ["新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県","愛知県"] },
  { name: "近畿", x: 42, y: 57, w: 13, h: 17, color: "#c49bd6", prefs: ["三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県"] },
  { name: "中国", x: 25, y: 55, w: 15, h: 13, color: "#79b9e5", prefs: ["鳥取県","島根県","岡山県","広島県","山口県"] },
  { name: "四国", x: 30, y: 71, w: 14, h: 11, color: "#e998aa", prefs: ["徳島県","香川県","愛媛県","高知県"] },
  { name: "九州", x: 12, y: 64, w: 14, h: 21, color: "#9cc86b", prefs: ["福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県"] },
  { name: "沖縄", x: 2, y: 87, w: 12, h: 9, color: "#65c7bd", prefs: ["沖縄県"] },
];
const prefectures = regions.flatMap(region => region.prefs);
const coordinates: Record<string, [number, number]> = {
  "北海道":[43.06,141.35],"青森県":[40.82,140.74],"岩手県":[39.70,141.15],"宮城県":[38.27,140.87],"秋田県":[39.72,140.10],"山形県":[38.24,140.36],"福島県":[37.75,140.47],
  "茨城県":[36.34,140.45],"栃木県":[36.57,139.88],"群馬県":[36.39,139.06],"埼玉県":[35.86,139.65],"千葉県":[35.61,140.12],"東京都":[35.68,139.65],"神奈川県":[35.45,139.64],
  "新潟県":[37.90,139.02],"富山県":[36.70,137.21],"石川県":[36.59,136.63],"福井県":[36.07,136.22],"山梨県":[35.66,138.57],"長野県":[36.65,138.18],"岐阜県":[35.39,136.72],"静岡県":[34.98,138.38],"愛知県":[35.18,136.91],
  "三重県":[34.73,136.51],"滋賀県":[35.00,135.87],"京都府":[35.01,135.77],"大阪府":[34.69,135.50],"兵庫県":[34.69,135.18],"奈良県":[34.69,135.83],"和歌山県":[34.23,135.17],
  "鳥取県":[35.50,134.24],"島根県":[35.47,133.05],"岡山県":[34.66,133.93],"広島県":[34.40,132.46],"山口県":[34.19,131.47],"徳島県":[34.07,134.56],"香川県":[34.34,134.04],"愛媛県":[33.84,132.77],"高知県":[33.56,133.53],
  "福岡県":[33.59,130.40],"佐賀県":[33.25,130.30],"長崎県":[32.75,129.87],"熊本県":[32.79,130.74],"大分県":[33.24,131.61],"宮崎県":[31.91,131.42],"鹿児島県":[31.56,130.56],"沖縄県":[26.21,127.68],
};
const providers = [
  { name: "気象庁 JMA", key: "jma_seamless", tint: "#e8f0ff" },
  { name: "NOAA GFS", key: "gfs_seamless", tint: "#f0f1f4" },
  { name: "ECMWF IFS", key: "ecmwf_ifs025", tint: "#fff2e6" },
  { name: "DWD ICON Global", key: "icon_global", tint: "#e8f7ef" },
];
const warningNames: Record<string, string> = {
  "02":"暴風雪警報", "03":"大雨警報", "04":"洪水警報", "05":"暴風警報", "06":"大雪警報", "07":"波浪警報", "08":"高潮警報",
  "10":"大雨注意報", "12":"大雪注意報", "13":"風雪注意報", "14":"雷注意報", "15":"強風注意報", "16":"波浪注意報", "17":"融雪注意報",
  "18":"洪水注意報", "19":"高潮注意報", "20":"濃霧注意報", "21":"乾燥注意報", "22":"なだれ注意報", "23":"低温注意報", "24":"霜注意報", "25":"着氷注意報", "26":"着雪注意報",
  "32":"暴風雪特別警報", "33":"大雨特別警報", "35":"暴風特別警報", "36":"大雪特別警報", "37":"波浪特別警報", "38":"高潮特別警報",
};
const links = ["ウェザーニュース", "Yahoo!天気", "tenki.jp"];
const cities = [
  { name:"札幌", pref:"北海道", region:"北海道", icon:"🌤️", temp:"27°", left:77, top:9 },
  { name:"仙台", pref:"宮城県", region:"東北", icon:"🌦️", temp:"29°", left:72, top:31 },
  { name:"新潟", pref:"新潟県", region:"中部", icon:"☀️", temp:"31°", left:57, top:35 },
  { name:"東京", pref:"東京都", region:"関東", icon:"🌧️", temp:"30°", left:70, top:47 },
  { name:"金沢", pref:"石川県", region:"中部", icon:"🌤️", temp:"30°", left:44, top:43 },
  { name:"名古屋", pref:"愛知県", region:"中部", icon:"☀️", temp:"33°", left:52, top:55 },
  { name:"大阪", pref:"大阪府", region:"近畿", icon:"🌤️", temp:"32°", left:42, top:61 },
  { name:"広島", pref:"広島県", region:"中国", icon:"☀️", temp:"32°", left:27, top:59 },
  { name:"高松", pref:"香川県", region:"四国", icon:"🌤️", temp:"31°", left:34, top:69 },
  { name:"福岡", pref:"福岡県", region:"九州", icon:"🌦️", temp:"30°", left:14, top:66 },
  { name:"鹿児島", pref:"鹿児島県", region:"九州", icon:"🌧️", temp:"29°", left:12, top:82 },
  { name:"那覇", pref:"沖縄県", region:"沖縄", icon:"🌦️", temp:"30°", left:17, top:25 },
];
const officeCodeFor = (pref: string) => pref === "北海道" ? "016000" : pref === "鹿児島県" ? "460100" : pref === "沖縄県" ? "471000" : `${String(prefectures.indexOf(pref) + 1).padStart(2, "0")}0000`;

export default function Home() {
  const [pref, setPref] = useState("東京都");
  const [region, setRegion] = useState("関東");
  const [day, setDay] = useState("today");
  const [lastUpdated, setLastUpdated] = useState("");
  const [dateLabels, setDateLabels] = useState({ today: "--/--", tomorrow: "--/--" });
  const [weeklyDates, setWeeklyDates] = useState(Array(7).fill("--/--"));
  const [forecast, setForecast] = useState<any>(null);
  const [cityForecasts, setCityForecasts] = useState<any[]>([]);
  const [forecastError, setForecastError] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [hourlyOpen, setHourlyOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [warningStatus, setWarningStatus] = useState<any>({ level:"loading", title:"警報・注意報を確認中", names:[], headline:"", updated:"" });

  useEffect(() => {
    const now = new Date();
    const formatDate = (date: Date) => new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "numeric",
      day: "numeric",
    }).format(date);
    const formatUpdateTime = () => new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    setLastUpdated(formatUpdateTime());
    setDateLabels({
      today: formatDate(now),
      tomorrow: formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)),
    });
    const formatWeekDate = (date: Date) => new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "numeric",
      day: "numeric",
      weekday: "short",
    }).format(date);
    setWeeklyDates(Array.from({ length: 7 }, (_, i) => formatWeekDate(new Date(now.getTime() + i * 24 * 60 * 60 * 1000))));
    const refreshTimer = window.setInterval(() => window.location.reload(), 60 * 60 * 1000);
    return () => window.clearInterval(refreshTimer);
  }, []);
  useEffect(() => {
    const [latitude, longitude] = coordinates[pref] ?? coordinates["東京都"];
    const params = new URLSearchParams({
      latitude: String(latitude), longitude: String(longitude), timezone: "Asia/Tokyo", forecast_days: "7",
      forecast_hours: "24",
      models: providers.map(provider => provider.key).join(","),
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max",
      hourly: "precipitation_probability,precipitation,wind_speed_10m",
    });
    setForecastError("");
    fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      .then(response => { if (!response.ok) throw new Error("forecast request failed"); return response.json(); })
      .then(data => { setForecast(data); setLastUpdated(new Intl.DateTimeFormat("ja-JP", { timeZone:"Asia/Tokyo", hour:"2-digit", minute:"2-digit" }).format(new Date())); })
      .catch(() => { setForecast(null); setForecastError("予報データを取得できませんでした。しばらくしてから再読み込みしてください。"); });
  }, [pref]);
  useEffect(() => {
    const officeCode = officeCodeFor(pref);
    setWarningStatus({ level:"loading", title:"警報・注意報を確認中", names:[], headline:"", updated:"" });
    fetch(`https://www.jma.go.jp/bosai/warning/data/warning/${officeCode}.json`)
      .then(response => { if (!response.ok) throw new Error("warning request failed"); return response.json(); })
      .then(data => {
        const activeCodes = Array.from(new Set((data.areaTypes?.[0]?.areas ?? []).flatMap((area: any) => area.warnings ?? [])
          .filter((warning: any) => warning.code && warning.status !== "解除")
          .map((warning: any) => String(warning.code)))) as string[];
        const names = activeCodes.map(code => warningNames[code] ?? `気象警報・注意報（${code}）`);
        const hasSpecial = activeCodes.some(code => code.startsWith("3"));
        const hasWarning = activeCodes.some(code => { const number = Number(code); return number >= 2 && number <= 8; });
        const level = hasSpecial ? "special" : hasWarning ? "warning" : activeCodes.length ? "advisory" : "none";
        const formatTime = data.reportDatetime ? new Intl.DateTimeFormat("ja-JP", { timeZone:"Asia/Tokyo", hour:"2-digit", minute:"2-digit" }).format(new Date(data.reportDatetime)) : "";
        setWarningStatus({
          level,
          title: hasSpecial ? "特別警報が発表されています" : hasWarning ? "警報が発表されています" : activeCodes.length ? "注意報が発表されています" : "発表中の警報・注意報はありません",
          names,
          headline: data.headlineText ?? "",
          updated: formatTime,
        });
      })
      .catch(() => setWarningStatus({ level:"error", title:"警報・注意報を取得できません", names:[], headline:"気象庁の公式情報をご確認ください。", updated:"" }));
  }, [pref]);
  useEffect(() => {
    const cityCoordinates = cities.map(city => coordinates[city.pref]);
    const params = new URLSearchParams({
      latitude: cityCoordinates.map(point => point[0]).join(","),
      longitude: cityCoordinates.map(point => point[1]).join(","),
      timezone: "Asia/Tokyo", forecast_days: "2", models: providers.map(provider => provider.key).join(","),
      daily: "weather_code,temperature_2m_max",
    });
    fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      .then(response => { if (!response.ok) throw new Error("city forecast request failed"); return response.json(); })
      .then(data => setCityForecasts(Array.isArray(data) ? data : [data]))
      .catch(() => setCityForecasts([]));
  }, []);
  const tomorrow = day === "tomorrow" ? 1 : 0;
  const mapCities = useMemo(() => cities.map((city, cityIndex) => {
    const cityData = cityForecasts[cityIndex]?.daily;
    const modelValues = (name: string) => providers.map(provider => cityData?.[`${name}_${provider.key}`]?.[tomorrow]).filter((item: unknown): item is number => typeof item === "number");
    const temperatures = modelValues("temperature_2m_max");
    const codes = modelValues("weather_code");
    const conditions = codes.map(weatherInfo);
    const condition = conditions.length ? conditions.sort((a,b) => conditions.filter(item => item.weather === b.weather).length - conditions.filter(item => item.weather === a.weather).length)[0] : { weather:"取得中", icon:"…" };
    return { ...city, ...condition, temperature: temperatures.length ? Math.round(temperatures.reduce((a,b)=>a+b,0) / temperatures.length) : null };
  }), [cityForecasts, tomorrow]);
  function weatherInfo(code: number | null) { return code == null ? { weather:"取得なし", icon:"—" } : code <= 1 ? { weather:"晴れ", icon:"☀️" } : code <= 3 ? { weather:"くもり", icon:"☁️" } : code <= 57 ? { weather:"霧・霧雨", icon:"🌫️" } : code <= 67 ? { weather:"雨", icon:"🌧️" } : code <= 77 ? { weather:"雪", icon:"🌨️" } : code <= 82 ? { weather:"にわか雨", icon:"🌦️" } : { weather:"雷雨", icon:"⛈️" }; }
  const value = (name: string, model: string, index: number) => forecast?.daily?.[`${name}_${model}`]?.[index] ?? null;
  const rows = useMemo(() => providers.map(p => ({
    ...p, ...weatherInfo(value("weather_code", p.key, tomorrow)),
    hi: value("temperature_2m_max", p.key, tomorrow), lo: value("temperature_2m_min", p.key, tomorrow),
    rain: value("precipitation_probability_max", p.key, tomorrow), wind: value("wind_speed_10m_max", p.key, tomorrow),
  })), [forecast, tomorrow]);
  const hourlyRain = useMemo(() => {
    const modelAverage = (name: string, index: number, digits = 0) => {
      const values = providers.map(p => forecast?.hourly?.[`${name}_${p.key}`]?.[index]).filter((v: unknown): v is number => typeof v === "number");
      if (!values.length) return 0;
      const average = values.reduce((a,b)=>a+b,0) / values.length;
      return Number(average.toFixed(digits));
    };
    return Array.from({ length: 24 }, (_, index) => {
      const timestamp = forecast?.hourly?.time?.[index] ?? "";
      const [datePart, timePart] = timestamp.split("T");
      const hour = timePart ? Number(timePart.slice(0, 2)) : index;
      const [, month = "", date = ""] = datePart.split("-");
      const showDate = index === 0 || hour === 0;
      return {
        time: `${hour}時`,
        fullLabel: showDate && month && date ? `${Number(month)}/${Number(date)} ${hour}時` : `${hour}時`,
        dateLabel: showDate && month && date ? `${Number(month)}/${Number(date)}` : "",
        chance: modelAverage("precipitation_probability", index),
        precipitation: modelAverage("precipitation", index, 1),
        wind: modelAverage("wind_speed_10m", index, 1),
      };
    });
  }, [forecast, tomorrow]);
  const weeklyForecast = useMemo(() => weeklyDates.map((date, dayIndex) => {
    const numbers = (name: string) => providers.map(p => value(name, p.key, dayIndex)).filter((v): v is number => typeof v === "number");
    const average = (values: number[]) => values.length ? Math.round(values.reduce((sum, item) => sum + item, 0) / values.length) : null;
    const codes = numbers("weather_code");
    const conditions = codes.map(weatherInfo);
    const info = conditions.length ? conditions.sort((a,b) => conditions.filter(item => item.weather === b.weather).length - conditions.filter(item => item.weather === a.weather).length)[0] : weatherInfo(null);
    const highs = numbers("temperature_2m_max");
    const weatherAgreement = conditions.filter(item => item.weather === info.weather).length;
    const temperatureSpread = highs.length ? Math.max(...highs) - Math.min(...highs) : 0;
    const confidence = weatherAgreement === providers.length && temperatureSpread <= 2.5
      ? { label:"信頼度 高", style:"bg-emerald-100 text-emerald-700" }
      : weatherAgreement <= Math.floor(providers.length / 2) || temperatureSpread >= 5
        ? { label:"予報が不安定", style:"bg-rose-100 text-rose-700" }
        : { label:"信頼度 中", style:"bg-amber-100 text-amber-700" };
    return { date, high: average(highs), low: average(numbers("temperature_2m_min")), rain: average(numbers("precipitation_probability_max")), confidence, ...info };
  }), [forecast, weeklyDates]);
  const selectedForecast = weeklyForecast[tomorrow];
  const validRows = rows.filter(row => row.weather !== "取得なし");
  const agreement = Math.max(0, ...validRows.map(row => validRows.filter(other => other.weather === row.weather).length));
  const majorityWeather = validRows.length ? validRows.sort((a,b) => validRows.filter(item => item.weather === b.weather).length - validRows.filter(item => item.weather === a.weather).length)[0].weather : "取得中";
  const averageWind = (() => { const values = rows.map(row => row.wind).filter((v): v is number => typeof v === "number"); return values.length ? Math.round(values.reduce((a,b)=>a+b,0) / values.length) : null; })();
  const dayRainTotal = Number(hourlyRain.reduce((sum, item) => sum + item.precipitation, 0).toFixed(1));
  const dayMaxWind = Number(Math.max(...hourlyRain.map(item => item.wind)).toFixed(1));
  const maxHourlyRain = Number(Math.max(...hourlyRain.map(item => item.precipitation)).toFixed(1));
  const maxRainIndex = hourlyRain.findIndex(item => item.precipitation === maxHourlyRain);
  const maxWindIndex = hourlyRain.findIndex(item => item.wind === dayMaxWind);
  const umbrellaHours = forecast ? hourlyRain.map((item, index) => ({...item, index})).filter(item => item.chance >= 40 || item.precipitation >= 0.2) : [];
  const umbrellaRanges = umbrellaHours.reduce<{start:number,end:number}[]>((ranges, item) => {
    const last = ranges.at(-1);
    if (last && item.index === last.end + 1) last.end = item.index;
    else ranges.push({ start:item.index, end:item.index });
    return ranges;
  }, []);
  const rangeLabel = umbrellaRanges.slice(0, 2).map(range => `${hourlyRain[range.start]?.fullLabel}〜${hourlyRain[range.end]?.time}`).join("、");
  const umbrellaNeeded = umbrellaHours.length > 0 || dayRainTotal >= 0.5;
  const umbrellaAdvice = !forecast ? "降水データを取得中…" : !umbrellaNeeded ? "今後24時間は傘なしで過ごせそうです" : rangeLabel ? `${rangeLabel}は傘推奨（最大${maxHourlyRain}mm/h）` : `雨の可能性があります（24時間で${dayRainTotal}mm）`;
  const rainValues = rows.map(row => row.rain).filter((v): v is number => typeof v === "number");
  const highValues = rows.map(row => row.hi).filter((v): v is number => typeof v === "number");
  const lowValues = rows.map(row => row.lo).filter((v): v is number => typeof v === "number");
  const rainRange = rainValues.length ? `${Math.round(Math.min(...rainValues))}〜${Math.round(Math.max(...rainValues))}%` : "--";
  const temperatureRange = highValues.length && lowValues.length ? `${Math.round(Math.min(...lowValues))}〜${Math.round(Math.max(...highValues))}℃` : "--";
  const forecastStability = agreement === validRows.length && validRows.length === providers.length ? "予報の一致度が高いです" : agreement <= Math.floor(Math.max(validRows.length, 1) / 2) ? "予報が割れています" : "予報はおおむね一致";
  const officeCode = officeCodeFor(pref);
  const [selectedLatitude, selectedLongitude] = coordinates[pref] ?? coordinates["東京都"];
  const warningUrl = `https://www.jma.go.jp/bosai/warning/#area_type=offices&area_code=${officeCode}`;
  const riskMapUrl = `https://www.jma.go.jp/bosai/risk/#zoom:7/lat:${selectedLatitude}/lon:${selectedLongitude}/colordepth:normal/elements:land`;
  const warningTheme = warningStatus.level === "special" || warningStatus.level === "warning"
    ? "border-rose-300 bg-rose-50 text-rose-950"
    : warningStatus.level === "advisory" ? "border-amber-300 bg-amber-50 text-amber-950"
      : warningStatus.level === "none" ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : "border-slate-200 bg-slate-50 text-slate-800";
  const modelTheme = selectedForecast?.weather === "晴れ"
    ? "border-orange-300 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-300 shadow-orange-200/70"
    : selectedForecast?.weather === "くもり" || selectedForecast?.weather === "霧・霧雨"
      ? "border-slate-400 bg-gradient-to-br from-slate-600 via-slate-500 to-slate-400 shadow-slate-300/70"
      : selectedForecast?.weather === "雪"
        ? "border-cyan-200 bg-gradient-to-br from-sky-400 via-cyan-300 to-blue-200 shadow-cyan-200/70"
        : selectedForecast?.weather === "雷雨"
          ? "border-violet-400 bg-gradient-to-br from-violet-800 via-indigo-700 to-blue-600 shadow-indigo-300/70"
          : "border-blue-300 bg-gradient-to-br from-blue-700 via-blue-500 to-sky-400 shadow-blue-200/70";
  const active = regions.find(r => r.name === region) ?? regions[2];
  const chooseRegion = (name: string) => { const r = regions.find(x => x.name === name)!; setRegion(name); setPref(r.prefs[0]); };

  return <main className="min-h-screen bg-[#f3f7fb] text-[#13233b]">
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 md:px-8">
      <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#246bfd] text-white shadow-lg shadow-blue-200"><Compass size={24}/></span><div><h1 className="text-xl font-black tracking-tight">KMG天気予報</h1><p className="text-[11px] font-bold tracking-[.14em] text-slate-400">WEATHER FORECAST</p></div></div>
      <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 md:flex"><ShieldCheck size={16} className="text-emerald-500"/>4つの予報データを比較中</div>
    </div></header>
    <div className="mx-auto w-full max-w-[1680px] px-3 pt-3 sm:px-4 sm:pt-4 md:px-8 md:pt-8"><section className={`rounded-2xl border p-4 ${warningTheme}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/80"><AlertTriangle size={22}/></span><div><h2 className="text-lg font-black">{pref}：{warningStatus.title}</h2>{warningStatus.names.length > 0 && <p className="mt-1 text-sm font-bold">{warningStatus.names.slice(0, 4).join("・")}{warningStatus.names.length > 4 ? ` ほか${warningStatus.names.length - 4}件` : ""}</p>}<p className="mt-1 text-sm opacity-80">{warningStatus.headline || "気象庁発表の最新情報です。"}{warningStatus.updated && `（${warningStatus.updated}発表）`}</p></div></div><div className="grid shrink-0 grid-cols-2 gap-2 sm:flex"><a href={warningUrl} target="_blank" rel="noreferrer" className="min-h-11 rounded-xl border border-current bg-white px-4 py-2.5 text-center text-sm font-black">詳細を確認</a><a href={riskMapUrl} target="_blank" rel="noreferrer" className="min-h-11 rounded-xl bg-amber-600 px-4 py-2.5 text-center text-sm font-black text-white">キキクル</a></div></div></section></div>
    <div className="mx-auto grid w-full max-w-[1680px] gap-5 p-3 sm:p-4 md:p-8 xl:grid-cols-[minmax(520px,620px)_minmax(0,1fr)]">
      <aside className="order-1 min-w-0 space-y-5">
        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-5"><button type="button" onClick={()=>setLocationOpen(open => !open)} className="mb-3 flex min-h-12 w-full items-center justify-between text-left xl:pointer-events-none" aria-expanded={locationOpen}><div><p className="text-sm font-bold text-blue-600 md:text-xs">予報地点を選択</p><h2 className="text-xl font-black sm:text-base">{pref}・地点を変更</h2></div><span className="flex items-center gap-2"><MapPin className="shrink-0 text-blue-500"/><ChevronDown className={`xl:hidden transition ${locationOpen ? "rotate-180" : ""}`} size={20}/></span></button><div className={`${locationOpen ? "block" : "hidden"} xl:block`}>
          <div className="relative mx-auto aspect-square w-full max-w-[600px] overflow-hidden rounded-2xl bg-gradient-to-b from-sky-50 to-blue-50/40">
            <img src="/japan-prefectures.svg" alt="47都道府県の境界を表示した日本地図" className="h-full w-full object-contain p-1 opacity-90 sm:p-3"/>
            {mapCities.map(c=><button key={c.name} onClick={()=>{setRegion(c.region);setPref(c.pref)}} style={{left:`${c.left}%`,top:`${c.top}%`}} className="absolute z-20 hidden -translate-x-1/2 items-center gap-1 rounded-lg border border-white bg-white/95 px-1.5 py-1 text-left shadow-md transition hover:z-30 hover:scale-105 sm:flex"><span className="text-2xl leading-none">{c.icon}</span><span><b className="block text-[11px] leading-none">{c.name}</b><b className="text-sm font-black text-blue-700">{c.temperature == null ? "--" : `${c.temperature}°`}</b></span></button>)}
            <span className="absolute bottom-2 right-3 text-[10px] font-medium text-slate-500">地図: Geolonia / GFDL</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">{mapCities.map(c=><button key={c.name} onClick={()=>{setRegion(c.region);setPref(c.pref)}} className={`flex min-h-16 items-center gap-2 rounded-xl border p-2 text-left ${pref === c.pref ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}><span className="text-3xl leading-none">{c.icon}</span><span><b className="block text-sm font-black">{c.name}</b><b className="text-lg font-black text-blue-700">{c.temperature == null ? "--" : `${c.temperature}°`}</b></span></button>)}</div>
          <p className="mt-2 text-center text-xs text-slate-400">地図の天気・気温も4モデルの実データ平均</p>
          <div className="mt-4 grid grid-cols-2 gap-2"><Select value={region} onValueChange={chooseRegion}><SelectTrigger aria-label="地方を選択" className="h-12 text-base"><SelectValue/></SelectTrigger><SelectContent>{regions.map(r=><SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select><Select value={pref} onValueChange={setPref}><SelectTrigger aria-label="都道府県を選択" className="h-12 text-base"><SelectValue/></SelectTrigger><SelectContent>{active.prefs.map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
          </div>
        </section>
        <section className="hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:block"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold text-blue-600">FORECAST SOURCES</p><h2 className="text-xl font-black">4つの予報を比較</h2></div><p className="text-xs text-slate-400">更新 {lastUpdated || "--:--"}</p></div><div className="mt-4 grid gap-3">{rows.map(r=><article key={r.name} className="rounded-2xl border border-slate-200 p-3"><div className="flex items-center justify-between gap-3"><b>{r.name}</b><span className="flex items-center gap-2 text-sm font-bold"><span className="text-2xl" role="img" aria-label={r.weather}>{r.icon}</span>{r.weather}</span></div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm"><div className="rounded-xl bg-slate-50 p-2"><span className="block text-[11px] text-slate-400">最高 / 最低</span><b><span className="text-rose-500">{r.hi ?? "--"}°</span> / <span className="text-blue-500">{r.lo ?? "--"}°</span></b></div><div className="rounded-xl bg-slate-50 p-2"><span className="block text-[11px] text-slate-400">降水確率</span><b className="text-blue-700">{r.rain == null ? "非配信" : `${r.rain}%`}</b></div><div className="rounded-xl bg-slate-50 p-2"><span className="block text-[11px] text-slate-400">最大風速</span><b>{r.wind == null ? "--" : `${Math.round(r.wind)} km/h`}</b></div></div></article>)}</div></section>
        <section className="hidden gap-3 xl:grid">{links.map((l,i)=><a key={l} href={i===0?"https://weathernews.jp/":i===1?"https://weather.yahoo.co.jp/weather/":"https://tenki.jp/"} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 font-bold shadow-sm transition hover:border-blue-300 hover:shadow-md"><span><span className="mb-1 block text-[10px] font-bold text-slate-400">詳しい予報を見る</span>{l}</span><ExternalLink size={17} className="text-slate-400 group-hover:text-blue-500"/></a>)}</section>
      </aside>
      <div className="order-2 min-w-0 space-y-5">
        <Tabs value={day} onValueChange={setDay} className="w-full"><TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-white p-1 shadow-sm"><TabsTrigger value="today" className="rounded-xl text-sm font-black">今日 <span className="ml-2 text-xs font-medium text-slate-400">{dateLabels.today}</span></TabsTrigger><TabsTrigger value="tomorrow" className="rounded-xl text-sm font-black">明日 <span className="ml-2 text-xs font-medium text-slate-400">{dateLabels.tomorrow}</span></TabsTrigger></TabsList></Tabs>
        <section className={`rounded-[28px] border p-4 text-white shadow-xl transition-colors duration-500 sm:p-6 ${modelTheme}`} aria-labelledby="today-summary"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-black text-white/80">実予報モデル</p><h2 id="today-summary" className="mt-1 text-2xl font-black">{pref} · {day === "today" ? "今日" : "明日"}</h2><p className="mt-1 text-lg font-black">{forecastError || (forecast ? `${selectedForecast?.weather ?? "取得中"}の予報` : "予報を取得しています…")}</p><p className="mt-1 text-sm text-white/80">JMA・GFS・ECMWF・ICONの最新値を比較</p></div><div className="flex items-center gap-3"><span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/90 text-4xl shadow-md" role="img" aria-label={selectedForecast?.weather ?? "取得中"}>{selectedForecast?.icon ?? "…"}</span><div><b className="block text-4xl font-black">{selectedForecast?.high ?? "--"}°</b><span className="text-base font-bold text-white/90">最低 {selectedForecast?.low ?? "--"}°</span></div></div></div>
          <div className="mt-4 rounded-2xl bg-white/90 p-4 text-slate-900 shadow-sm"><p className="text-lg font-black">{umbrellaAdvice}</p><p className="mt-1 text-sm font-bold text-blue-700">24時間の予想降水量 {forecast ? `${dayRainTotal}mm` : "--"}</p></div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-2xl bg-white/15 p-3 backdrop-blur"><span className="text-sm font-bold text-white/75">降水確率平均</span><b className="mt-1 block text-xl">{selectedForecast?.rain == null ? "--" : `${selectedForecast.rain}%`}</b></div><div className="rounded-2xl bg-white/15 p-3 backdrop-blur"><span className="text-sm font-bold text-white/75">雨のピーク</span><b className="mt-1 block text-lg">{maxHourlyRain > 0 && maxRainIndex >= 0 ? `${hourlyRain[maxRainIndex].fullLabel}・${maxHourlyRain}mm/h` : "目立った雨なし"}</b></div><div className="rounded-2xl bg-white/15 p-3 backdrop-blur"><span className="text-sm font-bold text-white/75">最大風速平均</span><b className="mt-1 block text-xl">{averageWind == null ? "--" : `${averageWind}km/h`}</b><span className="mt-1 block text-xs font-bold text-white/70">ピーク {forecast && maxWindIndex >= 0 ? hourlyRain[maxWindIndex].fullLabel : "--"}</span></div><div className={`rounded-2xl border p-3 ${warningTheme}`}><span className="text-sm font-bold opacity-70">警報・注意報</span><b className="mt-1 block text-base">{warningStatus.title}</b></div></div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold"><span className="rounded-full bg-white/90 px-3 py-2 text-slate-800">{forecastStability}</span><span className="rounded-full bg-white/20 px-3 py-2">{validRows.length}/{providers.length}モデル有効</span><span className="rounded-full bg-white/20 px-3 py-2">多数派：{majorityWeather} {agreement}/{validRows.length || providers.length}</span><span className="rounded-full bg-white/20 px-3 py-2">降水確率 {rainRange}</span><span className="rounded-full bg-white/20 px-3 py-2">気温幅 {temperatureRange}</span></div>
        </section>
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-blue-600">NEXT 24 HOURS</p><h2 className="text-xl font-black">更新時刻から先の24時間</h2><p className="mt-1 text-xs text-slate-400">{pref}・過ぎた時間を除いた実予報モデルの平均</p></div><CloudRain className="mt-1 text-blue-500" size={25}/></div>
          <div className={`mt-4 flex items-center gap-3 rounded-2xl border p-4 ${umbrellaNeeded ? "border-blue-200 bg-blue-50 text-blue-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm"><Umbrella size={24}/></span><div><p className="text-sm font-bold opacity-70">傘のアドバイス</p><p className="text-lg font-black">{umbrellaAdvice}</p></div></div>
          <div className="mt-3 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-sky-50 p-3 text-center"><span className="block text-xs font-bold text-slate-500">今後24時間の総降水量</span><b className="mt-1 block text-xl text-blue-700">{forecast ? `${dayRainTotal} mm` : "--"}</b></div><div className="rounded-2xl bg-slate-50 p-3 text-center"><span className="block text-xs font-bold text-slate-500">今後24時間の最大風速</span><b className="mt-1 block text-xl text-slate-800">{forecast ? `${dayMaxWind} km/h` : "--"}</b></div></div>
          <button type="button" onClick={()=>setHourlyOpen(open => !open)} className="mt-4 flex min-h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-base font-black md:hidden" aria-expanded={hourlyOpen}>1時間ごとの詳しい予報<ChevronDown className={`transition ${hourlyOpen ? "rotate-180" : ""}`} size={20}/></button>
          <div className={`${hourlyOpen ? "block" : "hidden"} md:block`}><div className="mt-5 overflow-x-auto pb-2"><div className="min-w-[1440px]"><div className="grid h-44 grid-cols-[repeat(24,minmax(0,1fr))] items-end gap-1 border-b border-slate-200 px-1">{hourlyRain.map((h,index)=><div key={`${h.fullLabel}-${index}`} className="flex h-full flex-col items-center justify-end"><b className="mb-1 text-[11px] text-blue-700">{h.chance}%</b><div className="w-full max-w-10 rounded-t bg-gradient-to-t from-blue-600 to-sky-300 transition-all" style={{height:`${Math.max(6,h.chance)}%`}}/></div>)}</div>
          <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1 px-1 pt-2 text-center text-xs font-bold text-slate-600">{hourlyRain.map((h,index)=><span key={`${h.fullLabel}-${index}`}><span className="block h-4 text-[10px] text-blue-500">{h.dateLabel}</span>{h.time}</span>)}</div>
          <div className="mt-4 grid grid-cols-[repeat(24,minmax(0,1fr))] overflow-hidden rounded-xl border border-slate-200 text-center text-xs">{hourlyRain.map((h,index)=><div key={`${h.fullLabel}-${index}`} className="border-r border-slate-100 px-1 py-2 last:border-0"><span className="block h-4 text-[10px] font-bold text-blue-500">{h.dateLabel}</span><span className="block font-bold text-slate-600">{h.time}</span><span className="mt-1 block text-[10px] text-slate-400">降水確率</span><b className="block text-blue-700">{h.chance}%</b><span className="mt-1 block text-[10px] text-slate-400">降水量</span><b className="block text-sky-700">{h.precipitation}mm</b><span className="mt-1 block text-[10px] text-slate-400">風速</span><b className="block text-slate-700">{h.wind}km/h</b></div>)}</div></div></div></div>
        </section>
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-blue-600">7-DAY FORECAST</p><h2 className="text-xl font-black">週間天気</h2><p className="mt-1 text-sm text-slate-500">{pref}・JMA / GFS / ECMWF / ICONの平均予報</p></div><CalendarDays className="mt-1 text-blue-500" size={25}/></div>
          <div className="mt-5 overflow-x-auto pb-2"><div className="grid min-w-[840px] grid-cols-7 gap-3">{weeklyForecast.map((item, index)=><article key={`${item.date}-${index}`} className={`min-w-0 overflow-hidden rounded-2xl border px-2 py-3 text-center ${index === 0 ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50/70"}`}><div className="text-sm font-black text-slate-700">{index === 0 ? "今日" : item.date}</div><div className="my-3 text-4xl leading-none" role="img" aria-label={item.weather}>{item.icon}</div><div className="text-sm font-bold text-slate-600">{item.weather}</div><div className="mt-3 grid gap-1 rounded-xl bg-white px-2 py-2 text-sm font-black"><div className="flex items-center justify-between gap-1 whitespace-nowrap"><span className="text-[11px] text-slate-400">最高</span><span className="text-base text-rose-500">{item.high ?? "--"}°</span></div><div className="flex items-center justify-between gap-1 whitespace-nowrap"><span className="text-[11px] text-slate-400">最低</span><span className="text-base text-blue-500">{item.low ?? "--"}°</span></div></div><div className="mt-2 rounded-lg bg-white px-1 py-2 text-sm font-bold text-blue-700">降水 {item.rain == null ? "--" : `${item.rain}%`}</div><div className={`mt-2 rounded-full px-1 py-1.5 text-[11px] font-black ${item.confidence.style}`}>{item.confidence.label}</div></article>)}</div></div>
          <p className="mt-2 text-xs leading-5 text-slate-400">気温と天気傾向は4モデルの実データを集計。降水確率は各モデルで配信されている値だけを平均しています。</p>
        </section>
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6 xl:hidden"><button type="button" onClick={()=>setModelsOpen(open => !open)} className="flex min-h-12 w-full items-center justify-between text-left sm:pointer-events-none" aria-expanded={modelsOpen}><div><p className="text-sm font-bold text-blue-600 sm:text-xs">FORECAST SOURCES · {day === "today" ? "TODAY" : "TOMORROW"}</p><h2 className="text-xl font-black">4つの予報を比較</h2></div><ChevronDown className={`transition sm:hidden ${modelsOpen ? "rotate-180" : ""}`} size={21}/></button><p className="mt-1 text-sm font-medium text-slate-500" aria-live="polite">最終更新 {lastUpdated || "--:--"} · 1時間ごとに自動更新</p><div className={`${modelsOpen ? "block" : "hidden"} sm:block`}>
          <div className="mt-4 grid gap-3 sm:hidden">{rows.map(r=><article key={r.name} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><div><span className="mr-2 inline-block size-3 rounded-full" style={{background:r.tint,border:"1px solid #94a3b8"}}/><b className="text-base">{r.name}</b></div><span className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${tomorrow ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-800"}`}><span className="text-2xl" role="img" aria-label={r.weather}>{r.icon}</span>{r.weather}</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-slate-50 p-2"><span className="block text-xs text-slate-500">最高 / 最低</span><b className="text-base"><span className="text-rose-500">{r.hi ?? "--"}°</span> / <span className="text-blue-500">{r.lo ?? "--"}°</span></b></div><div className="rounded-xl bg-slate-50 p-2"><span className="block text-xs text-slate-500">降水確率</span><b className="text-lg text-blue-700">{r.rain == null ? "非配信" : `${r.rain}%`}</b></div><div className="rounded-xl bg-slate-50 p-2"><span className="block text-xs text-slate-500">最大風速</span><b className="text-base">{r.wind == null ? "--" : `${Math.round(r.wind)} km/h`}</b></div></div></article>)}</div>
          <div className="mt-5 hidden overflow-x-auto sm:block"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b text-xs text-slate-400"><th className="pb-3">予報モデル</th><th className="pb-3">天気</th><th className="pb-3">最高 / 最低</th><th className="pb-3">降水確率</th><th className="pb-3">最大風速</th></tr></thead><tbody>{rows.map(r=><tr key={r.name} className="border-b border-slate-100 last:border-0"><td className="py-4"><span className="mr-3 inline-block size-3 rounded-full" style={{background:r.tint,border:"1px solid #94a3b8"}}/><b>{r.name}</b></td><td className="py-4"><span className={`inline-flex min-w-36 items-center gap-3 rounded-xl px-3 py-2 font-bold ${tomorrow ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-800"}`}><span className="text-3xl" role="img" aria-label={r.weather}>{r.icon}</span>{r.weather}</span></td><td className="py-4 font-bold"><span className="text-rose-500">{r.hi ?? "--"}°</span> / <span className="text-blue-500">{r.lo ?? "--"}°</span></td><td className="py-4">{r.rain == null ? <b className="text-slate-400">非配信</b> : <div className="flex items-center gap-3"><Progress value={r.rain} className="h-2 w-20"/><b>{r.rain}%</b></div>}</td><td className="py-4">{r.wind == null ? "--" : `${Math.round(r.wind)} km/h`}</td></tr>)}</tbody></table></div></div></section>
        <section className="grid gap-3 md:grid-cols-3 xl:hidden">{links.map((l,i)=><a key={l} href={i===0?"https://weathernews.jp/":i===1?"https://weather.yahoo.co.jp/weather/":"https://tenki.jp/"} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 font-bold shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><span><span className="mb-1 block text-[10px] font-bold text-slate-400">詳しい予報を見る</span>{l}</span><ExternalLink size={17} className="text-slate-400 group-hover:text-blue-500"/></a>)}</section>
        <p className="px-2 text-center text-sm leading-6 text-slate-500 sm:text-xs">予報データ提供: Open-Meteo（JMA・NOAA GFS・ECMWF IFS・DWD ICON Global）。各都道府県庁所在地付近のモデル予報を集計した参考情報です。警報・避難情報は必ず気象庁や自治体の最新情報をご確認ください。</p>
      </div>
    </div>
  </main>;
}
