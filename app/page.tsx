"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CalendarDays, ChevronDown, CloudRain, Compass, ExternalLink, LocateFixed, MapPin, Search, ShieldCheck, Umbrella } from "lucide-react";
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
const confidenceWeights = { weather:30, rainStart:20, rainEnd:10, rainAmount:15, temperature:15, wind:10 };
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
  const [modelsOpen, setModelsOpen] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<any[]>([]);
  const [placeSearching, setPlaceSearching] = useState(false);
  const [placeSearchError, setPlaceSearchError] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [shortRain, setShortRain] = useState<any>(null);
  const [warningStatus, setWarningStatus] = useState<any>({ level:"loading", title:"警報・注意報を確認中", names:[], headline:"", updated:"" });
  const autoLocationRequested = useRef(false);

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
    const [latitude, longitude] = selectedPlace ? [selectedPlace.latitude, selectedPlace.longitude] : (coordinates[pref] ?? coordinates["東京都"]);
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
  }, [pref, selectedPlace]);
  useEffect(() => {
    const [latitude, longitude] = selectedPlace ? [selectedPlace.latitude, selectedPlace.longitude] : (coordinates[pref] ?? coordinates["東京都"]);
    const params = new URLSearchParams({ latitude:String(latitude), longitude:String(longitude), timezone:"Asia/Tokyo", minutely_15:"precipitation", forecast_minutely_15:"5" });
    fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      .then(response => { if (!response.ok) throw new Error("short rain request failed"); return response.json(); })
      .then(data => setShortRain(data.minutely_15 ?? null))
      .catch(() => setShortRain(null));
  }, [pref, selectedPlace]);
  useEffect(() => {
    const officeCode = officeCodeFor(pref);
    setWarningStatus({ level:"loading", title:"警報・注意報を確認中", names:[], headline:"", updated:"" });
    fetch(`https://www.jma.go.jp/bosai/warning/data/warning/${officeCode}.json`)
      .then(response => { if (!response.ok) throw new Error("warning request failed"); return response.json(); })
      .then(data => {
        const warningAreas = selectedPlace?.municipalityCode
          ? (data.areaTypes?.[1]?.areas ?? []).filter((area: any) => area.code === selectedPlace.municipalityCode)
          : (data.areaTypes?.[0]?.areas ?? []);
        const activeCodes = Array.from(new Set(warningAreas.flatMap((area: any) => area.warnings ?? [])
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
  }, [pref, selectedPlace?.municipalityCode]);
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
  const rows = useMemo(() => providers.map(p => {
    const hourlyTime = forecast?.hourly?.time ?? [];
    const probabilities = forecast?.hourly?.[`precipitation_probability_${p.key}`] ?? [];
    const precipitation = forecast?.hourly?.[`precipitation_${p.key}`] ?? [];
    const rainy = Array.from({ length:24 }, (_, index) => index).filter(index => (probabilities[index] ?? 0) >= 40 || (precipitation[index] ?? 0) >= 0.2);
    const peakIndex = precipitation.length ? precipitation.slice(0, 24).reduce((best: number, amount: number, index: number) => amount > (precipitation[best] ?? 0) ? index : best, 0) : -1;
    const hour = (index: number) => index >= 0 && hourlyTime[index] ? `${Number(hourlyTime[index].split("T")[1]?.slice(0, 2))}時` : "--";
    return {
      ...p, ...weatherInfo(value("weather_code", p.key, tomorrow)),
      hi:value("temperature_2m_max", p.key, tomorrow), lo:value("temperature_2m_min", p.key, tomorrow),
      rain:value("precipitation_probability_max", p.key, tomorrow), wind:value("wind_speed_10m_max", p.key, tomorrow),
      rainStart:rainy.length ? hour(rainy[0]) : "雨なし", rainEnd:rainy.length ? hour(rainy.at(-1) ?? -1) : "雨なし",
      rainStartIndex:rainy[0] ?? null, rainEndIndex:rainy.at(-1) ?? null, peak:peakIndex >= 0 && (precipitation[peakIndex] ?? 0) > 0 ? hour(peakIndex) : "--",
      rainAmount:Number(precipitation.slice(0, 24).reduce((sum: number, amount: number) => sum + (amount ?? 0), 0).toFixed(1)),
    };
  }), [forecast, tomorrow]);
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
  const shortRainValues = (shortRain?.precipitation ?? []).map((amount: unknown) => typeof amount === "number" ? amount : 0);
  const approachingRainIndex = shortRainValues.findIndex((amount: number) => amount >= 0.1);
  const approachingRainAmount = approachingRainIndex >= 0 ? Number((shortRainValues[approachingRainIndex] * 4).toFixed(1)) : 0;
  const rainApproachMessage = !shortRain ? "現在地周辺の短時間降水予測を取得中…" : approachingRainIndex === 0
    ? `現在、雨雲がかかる可能性があります（目安 ${approachingRainAmount}mm/h）`
    : approachingRainIndex > 0
      ? `約${approachingRainIndex * 15}分後に雨雲が接近する可能性があります（目安 ${approachingRainAmount}mm/h）`
      : "今後1時間は目立った雨雲の接近予測はありません";
  const rainValues = rows.map(row => row.rain).filter((v): v is number => typeof v === "number");
  const highValues = rows.map(row => row.hi).filter((v): v is number => typeof v === "number");
  const lowValues = rows.map(row => row.lo).filter((v): v is number => typeof v === "number");
  const rainRange = rainValues.length ? `${Math.round(Math.min(...rainValues))}〜${Math.round(Math.max(...rainValues))}%` : "--";
  const temperatureRange = highValues.length && lowValues.length ? `${Math.round(Math.min(...lowValues))}〜${Math.round(Math.max(...highValues))}℃` : "--";
  const forecastStability = agreement === validRows.length && validRows.length === providers.length ? "予報の一致度が高いです" : agreement <= Math.floor(Math.max(validRows.length, 1) / 2) ? "予報が割れています" : "予報はおおむね一致";
  const spreadScore = (values: number[], good: number, bad: number) => !values.length ? 0.5 : Math.max(0, Math.min(1, 1 - (Math.max(...values) - Math.min(...values) - good) / Math.max(1, bad - good)));
  const rainStarts = rows.map(row => row.rainStartIndex).filter((v): v is number => typeof v === "number");
  const rainEnds = rows.map(row => row.rainEndIndex).filter((v): v is number => typeof v === "number");
  const rainAmounts = rows.map(row => row.rainAmount).filter((v): v is number => typeof v === "number");
  const winds = rows.map(row => row.wind).filter((v): v is number => typeof v === "number");
  const confidenceScore = Math.round(
    (validRows.length ? agreement / validRows.length : 0) * confidenceWeights.weather
    + spreadScore(rainStarts, 1, 6) * confidenceWeights.rainStart
    + spreadScore(rainEnds, 1, 6) * confidenceWeights.rainEnd
    + spreadScore(rainAmounts, 1, 10) * confidenceWeights.rainAmount
    + spreadScore([...highValues, ...lowValues], 2, 8) * confidenceWeights.temperature
    + spreadScore(winds, 3, 15) * confidenceWeights.wind
  );
  const confidenceStars = `${"★".repeat(Math.max(1, Math.round(confidenceScore / 20)))}${"☆".repeat(Math.max(0, 5 - Math.round(confidenceScore / 20)))}`;
  const rainStartLabel = umbrellaRanges.length ? hourlyRain[umbrellaRanges[0].start]?.fullLabel : "雨の予想なし";
  const rainEndLabel = umbrellaRanges.length ? hourlyRain[umbrellaRanges[0].end]?.time : "--";
  const currentlyRaining = (hourlyRain[0]?.precipitation ?? 0) >= 0.2;
  const kmgHeadline = !forecast ? "4モデルの予報を解析中です" : umbrellaNeeded
    ? `${day === "today" ? "今日は" : "明日は"}${rainStartLabel}ごろから雨。傘を持って。`
    : `${day === "today" ? "今日は" : "明日は"}${selectedForecast?.weather ?? "穏やかな天気"}。傘なしで過ごせそうです。`;
  const sunnyDayIndex = weeklyForecast.reduce((best, item, index) => item.weather === "晴れ" && (best < 0 || (item.rain ?? 100) < (weeklyForecast[best].rain ?? 100)) ? index : best, -1);
  const wettestDayIndex = weeklyForecast.reduce((best, item, index) => (item.rain ?? -1) > (weeklyForecast[best]?.rain ?? -1) ? index : best, 0);
  const largestTempChangeIndex = weeklyForecast.reduce((best, item, index) => index > 0 && Math.abs((item.high ?? 0) - (weeklyForecast[index - 1].high ?? 0)) > (best > 0 ? Math.abs((weeklyForecast[best].high ?? 0) - (weeklyForecast[best - 1].high ?? 0)) : 0) ? index : best, -1);
  const weeklyPoints = [
    sunnyDayIndex >= 0 ? `☀️ 晴れ間を狙うなら${sunnyDayIndex === 0 ? "今日" : weeklyForecast[sunnyDayIndex].date}` : null,
    (weeklyForecast[wettestDayIndex]?.rain ?? 0) >= 50 ? `☔ ${wettestDayIndex === 0 ? "今日" : weeklyForecast[wettestDayIndex].date}は雨への備えを` : null,
    largestTempChangeIndex > 0 ? `🌡️ ${weeklyForecast[largestTempChangeIndex].date}は前日との気温差に注意` : null,
  ].filter((point): point is string => Boolean(point)).slice(0, 3);
  const displayLocation = selectedPlace?.name ?? pref;
  const officeCode = officeCodeFor(pref);
  const [selectedLatitude, selectedLongitude] = selectedPlace ? [selectedPlace.latitude, selectedPlace.longitude] : (coordinates[pref] ?? coordinates["東京都"]);
  const warningUrl = selectedPlace?.municipalityCode
    ? `https://www.jma.go.jp/bosai/warning/#area_type=class20s&area_code=${selectedPlace.municipalityCode}`
    : `https://www.jma.go.jp/bosai/warning/#area_type=offices&area_code=${officeCode}`;
  const riskMapUrl = `https://www.jma.go.jp/bosai/risk/#zoom:7/lat:${selectedLatitude}/lon:${selectedLongitude}/colordepth:normal/elements:land`;
  const warningTheme = warningStatus.level === "special" || warningStatus.level === "warning"
    ? "border-rose-300 bg-rose-50 text-rose-950"
    : warningStatus.level === "advisory" ? "border-amber-300 bg-amber-50 text-amber-950"
      : warningStatus.level === "none" ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : "border-slate-200 bg-slate-50 text-slate-800";
  const modelTheme = selectedForecast?.weather === "晴れ"
    ? "border-orange-300 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-300 shadow-orange-200/70"
    : selectedForecast?.weather === "くもり" || selectedForecast?.weather === "霧・霧雨"
      ? "border-slate-700 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-700 shadow-slate-400/60"
      : selectedForecast?.weather === "雪"
        ? "border-cyan-200 bg-gradient-to-br from-sky-400 via-cyan-300 to-blue-200 shadow-cyan-200/70"
        : selectedForecast?.weather === "雷雨"
          ? "border-violet-400 bg-gradient-to-br from-violet-800 via-indigo-700 to-blue-600 shadow-indigo-300/70"
          : "border-blue-300 bg-gradient-to-br from-blue-700 via-blue-500 to-sky-400 shadow-blue-200/70";
  const active = regions.find(r => r.name === region) ?? regions[2];
  const selectPrefecture = (name: string, regionName?: string) => {
    setSelectedPlace(null);
    setPref(name);
    setRegion(regionName ?? regions.find(item => item.prefs.includes(name))?.name ?? "関東");
  };
  const chooseRegion = (name: string) => { const r = regions.find(x => x.name === name)!; selectPrefecture(r.prefs[0], name); };
  const searchPlaces = async (event: FormEvent) => {
    event.preventDefault();
    const query = placeQuery.trim().replace(/[\s　]/g, "");
    if (query.length < 2) { setPlaceSearchError("市区町村名を2文字以上入力してください。"); return; }
    setPlaceSearching(true);
    setPlaceSearchError("");
    try {
      const fetchMunicipalityPoint = async (prefecture: string, municipality: string, town = "") => {
        const response = await fetch(`https://geolonia.github.io/japanese-addresses/api/ja/${encodeURIComponent(prefecture)}/${encodeURIComponent(municipality)}.json`);
        if (!response.ok) throw new Error("municipality point failed");
        const points = await response.json();
        const point = (town && points.find((item: any) => String(item.town).startsWith(town))) || points[0];
        if (!point) throw new Error("municipality point missing");
        return { latitude:point.lat, longitude:point.lng };
      };
      let candidates: { prefecture:string; municipality:string; town?:string; postalCode?:string }[] = [];
      const postalCode = query.replace(/-/g, "");
      if (/^\d{7}$/.test(postalCode)) {
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`);
        if (!response.ok) throw new Error("postal search failed");
        const data = await response.json();
        candidates = (data.results ?? []).map((item: any) => ({ prefecture:item.address1, municipality:item.address2, town:item.address3, postalCode:item.zipcode }));
      } else {
        const response = await fetch("https://geolonia.github.io/japanese-addresses/api/ja.json");
        if (!response.ok) throw new Error("municipality search failed");
        const municipalityMap = await response.json();
        candidates = Object.entries(municipalityMap).flatMap(([prefecture, municipalities]: any) =>
          municipalities.filter((municipality: string) => municipality.includes(query) || `${prefecture}${municipality}`.includes(query))
            .map((municipality: string) => ({ prefecture, municipality }))
        ).slice(0, 10);
      }
      const results = (await Promise.all(candidates.map(async (candidate, index) => ({
        id:`${candidate.prefecture}-${candidate.municipality}-${candidate.postalCode ?? index}`,
        name:candidate.municipality,
        admin1:candidate.prefecture,
        admin2:candidate.town ?? "",
        postalCode:candidate.postalCode,
        ...await fetchMunicipalityPoint(candidate.prefecture, candidate.municipality, candidate.town),
      }))));
      setPlaceResults(results);
      if (!results.length) setPlaceSearchError("該当する市区町村が見つかりませんでした。");
    } catch {
      setPlaceResults([]);
      setPlaceSearchError("地点を検索できませんでした。もう一度お試しください。");
    } finally { setPlaceSearching(false); }
  };
  const choosePlace = async (place: any) => {
    const nextRegion = regions.find(item => item.prefs.includes(place.admin1))?.name ?? "関東";
    const municipalityName = [place.name, place.admin2, place.admin3, place.admin4].find((name: unknown) => typeof name === "string" && /[市区町村]$/.test(name)) ?? place.name;
    let municipalityCode = "";
    try {
      const areaResponse = await fetch("https://www.jma.go.jp/bosai/common/const/area.json");
      if (areaResponse.ok) {
        const areaData = await areaResponse.json();
        const prefix = String(prefectures.indexOf(place.admin1) + 1).padStart(2, "0");
        municipalityCode = Object.entries(areaData.class20s ?? {}).find(([code, area]: any) => code.startsWith(prefix) && area.name === municipalityName)?.[0] ?? "";
      }
    } catch { municipalityCode = ""; }
    setPref(place.admin1);
    setRegion(nextRegion);
    setSelectedPlace({ name:municipalityName, prefecture:place.admin1, latitude:place.latitude, longitude:place.longitude, municipalityCode });
    setPlaceQuery("");
    setPlaceResults([]);
    setLocationOpen(false);
  };
  const useCurrentLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) { setLocationError("この端末は現在地取得に対応していません。"); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(async position => {
      const latitude = Number(position.coords.latitude.toFixed(5));
      const longitude = Number(position.coords.longitude.toFixed(5));
      setSelectedPlace({ name:"現在地", prefecture:pref, latitude, longitude, municipalityCode:"" });
      setPlaceQuery("");
      setPlaceResults([]);
      setLocationLoading(false);
      setLocationOpen(false);
      let municipalityName = "現在地";
      let municipalityCode = "";
      let nextPref = pref;
      try {
        const reverseResponse = await fetch(`https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${latitude}&lon=${longitude}`);
        const reverseData = reverseResponse.ok ? await reverseResponse.json() : null;
        const muniCd = String(reverseData?.results?.muniCd ?? "");
        if (muniCd.length >= 2) nextPref = prefectures[Number(muniCd.slice(0, 2)) - 1] ?? pref;
        const areaResponse = await fetch("https://www.jma.go.jp/bosai/common/const/area.json");
        const areaData = areaResponse.ok ? await areaResponse.json() : null;
        const municipality = muniCd ? Object.entries(areaData?.class20s ?? {}).find(([code]) => code.startsWith(muniCd)) : undefined;
        if (municipality) { municipalityCode = municipality[0]; municipalityName = (municipality[1] as any).name; }
      } catch { municipalityName = "現在地"; }
      setPref(nextPref);
      setRegion(regions.find(item => item.prefs.includes(nextPref))?.name ?? region);
      setSelectedPlace({ name:municipalityName, prefecture:nextPref, latitude, longitude, municipalityCode });
    }, error => {
      setLocationLoading(false);
      setLocationError(error.code === error.PERMISSION_DENIED ? "位置情報が許可されていません。端末の設定から許可してください。" : "現在地を取得できませんでした。もう一度お試しください。");
    }, { enableHighAccuracy:false, timeout:5000, maximumAge:60 * 60 * 1000 });
  };

  useEffect(() => {
    if (autoLocationRequested.current) return;
    autoLocationRequested.current = true;
    useCurrentLocation();
  }, []);

  useEffect(() => {
    if (window.location.hash !== "#rain-radar-mobile" && window.location.hash !== "#rain-radar-desktop") return;
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    window.requestAnimationFrame(() => window.scrollTo({ top:0, behavior:"auto" }));
  }, []);

  const scrollToRadar = (targetId: string) => {
    document.getElementById(targetId)?.scrollIntoView({ behavior:"smooth", block:"start" });
  };

  return <main className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#f3f7fb] text-[#13233b]">
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 md:px-8">
      <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#246bfd] text-white shadow-lg shadow-blue-200"><Compass size={24}/></span><div><h1 className="text-xl font-black tracking-tight">KMG天気予報</h1><p className="text-[11px] font-bold tracking-[.14em] text-slate-400">WEATHER FORECAST</p></div></div>
      <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 md:flex"><ShieldCheck size={16} className="text-emerald-500"/>4つの予報データを比較中</div>
    </div></header>
    <div className="mx-auto w-full max-w-[1680px] px-3 pt-3 sm:px-4 sm:pt-4 md:px-8 md:pt-8"><section className={`rounded-2xl border p-4 ${warningTheme}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/80"><AlertTriangle size={22}/></span><div><h2 className="text-lg font-black">{displayLocation}：{warningStatus.title}</h2>{warningStatus.names.length > 0 && <p className="mt-1 text-sm font-bold">{warningStatus.names.slice(0, 4).join("・")}{warningStatus.names.length > 4 ? ` ほか${warningStatus.names.length - 4}件` : ""}</p>}<p className="mt-1 text-sm opacity-80">{warningStatus.headline || "気象庁発表の最新情報です。"}{warningStatus.updated && `（${warningStatus.updated}発表）`}</p></div></div><div className="grid shrink-0 grid-cols-2 gap-2 sm:flex"><a href={warningUrl} target="_blank" rel="noreferrer" className="min-h-11 rounded-xl border border-current bg-white px-4 py-2.5 text-center text-sm font-black">詳細を確認</a><a href={riskMapUrl} target="_blank" rel="noreferrer" className="min-h-11 rounded-xl bg-amber-600 px-4 py-2.5 text-center text-sm font-black text-white">キキクル</a></div></div></section></div>
    <div className="mx-auto grid w-full min-w-0 max-w-[1680px] grid-cols-[minmax(0,1fr)] gap-5 p-3 sm:p-4 md:p-8 xl:grid-cols-[minmax(520px,620px)_minmax(0,1fr)]">
      <aside className="order-1 min-w-0 space-y-5">
        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-5"><div className="mb-3 hidden items-center justify-between xl:flex"><div><p className="text-xs font-bold text-blue-600">WEATHER MAP</p><h2 className="text-xl font-black">全国の天気</h2></div><MapPin className="text-blue-500" size={25}/></div><button type="button" onClick={()=>setLocationOpen(open => !open)} className="mb-3 flex min-h-12 w-full items-center justify-between text-left xl:hidden" aria-expanded={locationOpen}><div><p className="text-sm font-bold text-blue-600 md:text-xs">予報地点を選択</p><h2 className="text-xl font-black sm:text-base">{displayLocation}・地点を変更</h2></div><span className="flex items-center gap-2"><MapPin className="shrink-0 text-blue-500"/><ChevronDown className={`transition ${locationOpen ? "rotate-180" : ""}`} size={20}/></span></button><div className={`${locationOpen ? "block" : "hidden"} xl:block`}>
          <form onSubmit={searchPlaces} className="mb-4 rounded-2xl bg-blue-50 p-3 xl:hidden"><label htmlFor="place-search" className="mb-2 block text-sm font-black text-blue-900">全国の市区町村・郵便番号から検索</label><div className="flex gap-2"><input id="place-search" value={placeQuery} onChange={event=>setPlaceQuery(event.target.value)} placeholder="例：江東区、横浜市、1350043" className="min-h-12 min-w-0 flex-1 rounded-xl border border-blue-200 bg-white px-3 text-base outline-none focus:border-blue-500"/><button type="submit" disabled={placeSearching} className="flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 font-black text-white disabled:opacity-60"><Search size={19}/>{placeSearching ? "検索中" : "検索"}</button></div><button type="button" onClick={useCurrentLocation} disabled={locationLoading} className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white font-black text-blue-700 disabled:opacity-60"><LocateFixed size={19}/>{locationLoading ? "現在地を取得中…" : "現在地の天気を見る"}</button>{locationError && <p className="mt-2 text-sm font-bold text-rose-600">{locationError}</p>}{placeSearchError && <p className="mt-2 text-sm font-bold text-rose-600">{placeSearchError}</p>}{placeResults.length > 0 && <div className="mt-2 grid gap-2">{placeResults.map(place=><button type="button" key={`${place.id}-${place.latitude}`} onClick={()=>choosePlace(place)} className="min-h-12 rounded-xl border border-blue-100 bg-white px-3 text-left hover:border-blue-400"><b className="block text-base">{place.name}</b><span className="text-sm text-slate-500">{[place.admin1, place.admin2, place.postalCode && `〒${place.postalCode}`].filter(Boolean).join("・")}</span></button>)}</div>}</form>
          <div className="relative mx-auto aspect-square w-full max-w-[600px] overflow-hidden rounded-2xl bg-gradient-to-b from-sky-50 to-blue-50/40">
            <img src="/japan-prefectures.svg" alt="47都道府県の境界を表示した日本地図" className="h-full w-full object-contain p-1 opacity-90 sm:p-3"/>
            {mapCities.map(c=><button key={c.name} onClick={()=>selectPrefecture(c.pref, c.region)} style={{left:`${c.left}%`,top:`${c.top}%`}} className="absolute z-20 hidden -translate-x-1/2 items-center gap-1 rounded-lg border border-white bg-white/95 px-1.5 py-1 text-left shadow-md transition hover:z-30 hover:scale-105 sm:flex"><span className="text-2xl leading-none">{c.icon}</span><span><b className="block text-[11px] leading-none">{c.name}</b><b className="text-sm font-black text-blue-700">{c.temperature == null ? "--" : `${c.temperature}°`}</b></span></button>)}
            <span className="absolute bottom-2 right-3 text-[10px] font-medium text-slate-500">地図: Geolonia / GFDL</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">{mapCities.map(c=><button key={c.name} onClick={()=>selectPrefecture(c.pref, c.region)} className={`flex min-h-16 items-center gap-2 rounded-xl border p-2 text-left ${!selectedPlace && pref === c.pref ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}><span className="text-3xl leading-none">{c.icon}</span><span><b className="block text-sm font-black">{c.name}</b><b className="text-lg font-black text-blue-700">{c.temperature == null ? "--" : `${c.temperature}°`}</b></span></button>)}</div>
          <p className="mt-2 text-center text-xs text-slate-400">地図の天気・気温も4モデルの実データ平均</p>
          <div className="mt-4 grid grid-cols-2 gap-2 xl:hidden"><Select value={region} onValueChange={chooseRegion}><SelectTrigger aria-label="地方を選択" className="h-12 text-base"><SelectValue/></SelectTrigger><SelectContent>{regions.map(r=><SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select><Select value={pref} onValueChange={name=>selectPrefecture(name)}><SelectTrigger aria-label="都道府県を選択" className="h-12 text-base"><SelectValue/></SelectTrigger><SelectContent>{active.prefs.map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
          </div>
        </section>
        <section className="hidden overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm xl:block" aria-labelledby="rain-radar-desktop">
          <div className="flex flex-col gap-3 p-5"><div><p className="text-xs font-bold text-blue-600">LIVE RAIN RADAR</p><h2 id="rain-radar-desktop" className="mt-1 text-xl font-black">{displayLocation}の雨雲レーダー</h2><p className="mt-1 text-sm text-slate-500">実況の雨雲を地図上で再生できます。予報モデルとは別の短時間情報です。</p><div className={`mt-3 rounded-xl border px-3 py-2 text-sm font-black ${approachingRainIndex >= 0 ? "border-blue-200 bg-blue-50 text-blue-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}><span className="mr-2">{approachingRainIndex >= 0 ? "☂" : "✓"}</span>{rainApproachMessage}</div></div><a href={`https://www.rainviewer.com/map.html?loc=${selectedLatitude},${selectedLongitude},8&layer=radar`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-black text-blue-700">大きな地図で見る<ExternalLink size={16}/></a></div>
          <div className="relative aspect-[4/3] min-h-[420px] w-full bg-slate-100">
            <iframe key={`desktop-${selectedLatitude}-${selectedLongitude}`} title={`${displayLocation}の雨雲レーダー`} src={`https://www.rainviewer.com/map.html?loc=${selectedLatitude},${selectedLongitude},8&layer=radar`} loading="lazy" className="absolute inset-0 h-full w-full border-0" allowFullScreen/>
          </div>
          <p className="px-5 py-3 text-xs leading-5 text-slate-500">レーダーデータ：<a href="https://www.rainviewer.com/" target="_blank" rel="noreferrer" className="font-bold text-blue-600 underline">RainViewer</a>（約10分間隔）。通信状況により表示に時間がかかる場合があります。</p>
        </section>
        <section className="hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:block"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-blue-600">7-DAY FORECAST</p><h2 className="text-xl font-black">週間天気</h2><p className="mt-1 text-sm text-slate-500">{displayLocation}・4モデルの平均予報</p></div><CalendarDays className="mt-1 text-blue-500" size={25}/></div>
          <div className="mt-4 grid grid-cols-2 gap-2">{weeklyForecast.map((item, index)=><article key={`desktop-${item.date}-${index}`} className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 ${index === 0 ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50/70"}`}><div className="w-12 shrink-0 text-center"><div className="text-xs font-black text-slate-600">{index === 0 ? "今日" : item.date}</div><div className="mt-1 text-3xl leading-none" role="img" aria-label={item.weather}>{item.icon}</div></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-black text-slate-700">{item.weather}</div><div className="mt-1 flex items-center gap-2 whitespace-nowrap text-sm font-black"><span className="text-rose-500">{item.high ?? "--"}°</span><span className="text-blue-500">{item.low ?? "--"}°</span><span className="text-blue-700">{item.rain == null ? "--" : `${item.rain}%`}</span></div><div className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-black ${item.confidence.style}`}>{item.confidence.label}</div></div></article>)}</div>
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold text-amber-700">KMG週間ワンポイント</p>{weeklyPoints.length ? <><p className="mt-1 font-black text-amber-950">{weeklyPoints[0]}</p><ul className="mt-2 grid gap-1 text-sm font-bold text-amber-900">{weeklyPoints.slice(1).map(point=><li key={`desktop-${point}`}>{point}</li>)}</ul></> : <p className="mt-1 font-bold text-amber-900">大きな天気の変化は少ない見込みです。</p>}</div>
        </section>
        <section className="hidden"><div/></section>
        <section className="hidden gap-3 xl:grid">{links.map((l,i)=><a key={l} href={i===0?"https://weathernews.jp/":i===1?"https://weather.yahoo.co.jp/weather/":"https://tenki.jp/"} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 font-bold shadow-sm transition hover:border-blue-300 hover:shadow-md"><span><span className="mb-1 block text-[10px] font-bold text-slate-400">詳しい予報を見る</span>{l}</span><ExternalLink size={17} className="text-slate-400 group-hover:text-blue-500"/></a>)}</section>
      </aside>
      <div className="order-2 flex min-w-0 flex-col gap-5">
        <section className="order-0 hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:block"><div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-blue-600">予報地点を選択</p><h2 className="text-xl font-black">{displayLocation}・地点を変更</h2></div><MapPin className="shrink-0 text-blue-500" size={26}/></div><form onSubmit={searchPlaces} className="rounded-2xl bg-blue-50 p-3"><label htmlFor="place-search-desktop" className="mb-2 block text-sm font-black text-blue-900">全国の市区町村・郵便番号から検索</label><div className="flex gap-2"><input id="place-search-desktop" value={placeQuery} onChange={event=>setPlaceQuery(event.target.value)} placeholder="例：江東区、横浜市、1350043" className="min-h-12 min-w-0 flex-1 rounded-xl border border-blue-200 bg-white px-3 text-base outline-none focus:border-blue-500"/><button type="submit" disabled={placeSearching} className="flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 font-black text-white disabled:opacity-60"><Search size={19}/>{placeSearching ? "検索中" : "検索"}</button><button type="button" onClick={useCurrentLocation} disabled={locationLoading} className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 font-black text-blue-700 disabled:opacity-60"><LocateFixed size={19}/>{locationLoading ? "取得中…" : "現在地"}</button></div>{locationError && <p className="mt-2 text-sm font-bold text-rose-600">{locationError}</p>}{placeSearchError && <p className="mt-2 text-sm font-bold text-rose-600">{placeSearchError}</p>}{placeResults.length > 0 && <div className="mt-2 grid gap-2 sm:grid-cols-2">{placeResults.map(place=><button type="button" key={`desktop-${place.id}-${place.latitude}`} onClick={()=>choosePlace(place)} className="min-h-12 rounded-xl border border-blue-100 bg-white px-3 text-left hover:border-blue-400"><b className="block text-base">{place.name}</b><span className="text-sm text-slate-500">{[place.admin1, place.admin2, place.postalCode && `〒${place.postalCode}`].filter(Boolean).join("・")}</span></button>)}</div>}</form><div className="mt-3 grid grid-cols-2 gap-3"><Select value={region} onValueChange={chooseRegion}><SelectTrigger aria-label="地方を選択" className="h-12 text-base"><SelectValue/></SelectTrigger><SelectContent>{regions.map(r=><SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select><Select value={pref} onValueChange={name=>selectPrefecture(name)}><SelectTrigger aria-label="都道府県を選択" className="h-12 text-base"><SelectValue/></SelectTrigger><SelectContent>{active.prefs.map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div></section>
        <Tabs value={day} onValueChange={setDay} className="order-1 w-full"><TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-white p-1 shadow-sm"><TabsTrigger value="today" className="rounded-xl text-sm font-black">今日 <span className="ml-2 text-xs font-medium text-slate-400">{dateLabels.today}</span></TabsTrigger><TabsTrigger value="tomorrow" className="rounded-xl text-sm font-black">明日 <span className="ml-2 text-xs font-medium text-slate-400">{dateLabels.tomorrow}</span></TabsTrigger></TabsList></Tabs>
        <section className={`order-2 rounded-[28px] border p-4 text-white shadow-xl transition-colors duration-500 sm:p-6 ${modelTheme}`} aria-labelledby="today-summary"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-black text-white/80">KMG WEATHER · 総合予報</p><h2 id="today-summary" className="mt-1 text-2xl font-black">{kmgHeadline}</h2><p className="mt-2 text-sm font-bold text-white/90">{displayLocation} · {day === "today" ? "今日" : "明日"}｜4モデルの数値をKMGが解析</p></div><div className="flex items-center gap-3"><span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/90 text-4xl shadow-md" role="img" aria-label={selectedForecast?.weather ?? "取得中"}>{selectedForecast?.icon ?? "…"}</span><div><b className="block text-4xl font-black">{selectedForecast?.high ?? "--"}°</b><span className="text-base font-bold text-white/90">最低 {selectedForecast?.low ?? "--"}°</span></div></div></div>
          <div className="mt-4 rounded-2xl bg-white/90 p-4 text-slate-900 shadow-sm"><p className="text-lg font-black">{umbrellaAdvice}</p><p className="mt-1 text-sm font-bold text-blue-700">24時間の予想降水量 {forecast ? `${dayRainTotal}mm` : "--"}</p></div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-2xl bg-white/15 p-3 backdrop-blur"><span className="text-sm font-bold text-white/75">降水確率平均</span><b className="mt-1 block text-xl">{selectedForecast?.rain == null ? "--" : `${selectedForecast.rain}%`}</b></div><div className="rounded-2xl bg-white/15 p-3 backdrop-blur"><span className="text-sm font-bold text-white/75">雨のピーク</span><b className="mt-1 block text-lg">{maxHourlyRain > 0 && maxRainIndex >= 0 ? `${hourlyRain[maxRainIndex].fullLabel}・${maxHourlyRain}mm/h` : "目立った雨なし"}</b></div><div className="rounded-2xl bg-white/15 p-3 backdrop-blur"><span className="text-sm font-bold text-white/75">最大風速平均</span><b className="mt-1 block text-xl">{averageWind == null ? "--" : `${averageWind}km/h`}</b><span className="mt-1 block text-xs font-bold text-white/70">ピーク {forecast && maxWindIndex >= 0 ? hourlyRain[maxWindIndex].fullLabel : "--"}</span></div><div className={`rounded-2xl border p-3 ${warningTheme}`}><span className="text-sm font-bold opacity-70">警報・注意報</span><b className="mt-1 block text-base">{warningStatus.title}</b></div></div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(180px,.75fr)_1.25fr]"><div className="rounded-2xl bg-white/95 p-4 text-slate-900"><span className="text-sm font-bold text-slate-500">予報信頼度</span><b className="mt-1 block text-3xl text-blue-700">{confidenceScore}%</b><span className="text-lg tracking-widest text-amber-500">{confidenceStars}</span></div><div className="rounded-2xl bg-white/15 p-4 text-sm font-bold backdrop-blur"><p>多数派：{majorityWeather} {agreement}/{validRows.length || providers.length}モデル</p><p className="mt-2 text-white/80">雨開始 {rainStarts.length ? `最大${Math.max(...rainStarts) - Math.min(...rainStarts)}時間差` : "対象なし"}・降水確率 {rainRange}</p><p className="mt-1 text-white/80">{forecastStability}｜有効データ {validRows.length}/{providers.length}</p></div></div>
        </section>
        <section className="order-8 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:order-3 md:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold text-blue-600">MODEL CONSENSUS</p><h2 className="text-xl font-black">4モデル比較と信頼度</h2><p className="mt-1 text-sm text-slate-500">KMG多数派：{selectedForecast?.icon} {majorityWeather} {agreement}/{validRows.length || providers.length}モデル</p></div><div className="rounded-xl bg-blue-50 px-4 py-3 text-center"><span className="block text-xs font-bold text-blue-600">総合信頼度</span><b className="text-2xl text-blue-800">{confidenceScore}%</b></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">{rows.map(r=><article key={r.name} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-2"><b>{r.name}</b><span className="text-2xl" role="img" aria-label={r.weather}>{r.icon}</span></div><p className="mt-2 text-lg font-black">{r.weather}</p><dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm"><div><dt className="text-slate-500">降水確率</dt><dd className="font-black text-blue-700">{r.rain == null ? "非配信" : `${r.rain}%`}</dd></div><div><dt className="text-slate-500">最高 / 最低</dt><dd className="font-black"><span className="text-rose-500">{r.hi ?? "--"}°</span> / <span className="text-blue-500">{r.lo ?? "--"}°</span></dd></div><div><dt className="text-slate-500">雨開始</dt><dd className="font-black">{r.rainStart}</dd></div><div><dt className="text-slate-500">雨終了</dt><dd className="font-black">{r.rainEnd}</dd></div><div><dt className="text-slate-500">雨ピーク</dt><dd className="font-black">{r.peak}</dd></div><div><dt className="text-slate-500">最大風速</dt><dd className="font-black">{r.wind == null ? "--" : `${Math.round(r.wind)}km/h`}</dd></div></dl></article>)}</div></section>
        <section className="order-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm xl:hidden" aria-labelledby="rain-radar-mobile">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6"><div><p className="text-xs font-bold text-blue-600">LIVE RAIN RADAR</p><h2 id="rain-radar-mobile" className="mt-1 text-xl font-black">{displayLocation}の雨雲レーダー</h2><p className="mt-1 text-sm text-slate-500">実況の雨雲を地図上で再生できます。予報モデルとは別の短時間情報です。</p><div className={`mt-3 rounded-xl border px-3 py-2 text-sm font-black ${approachingRainIndex >= 0 ? "border-blue-200 bg-blue-50 text-blue-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}><span className="mr-2">{approachingRainIndex >= 0 ? "☂" : "✓"}</span>{rainApproachMessage}</div></div><a href={`https://www.rainviewer.com/map.html?loc=${selectedLatitude},${selectedLongitude},8&layer=radar`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-black text-blue-700">大きな地図で見る<ExternalLink size={16}/></a></div>
          <div className="relative aspect-[4/3] min-h-[340px] w-full bg-slate-100 sm:aspect-[16/9] sm:min-h-[420px]">
            <iframe key={`${selectedLatitude}-${selectedLongitude}`} title={`${displayLocation}の雨雲レーダー`} src={`https://www.rainviewer.com/map.html?loc=${selectedLatitude},${selectedLongitude},8&layer=radar`} loading="lazy" className="absolute inset-0 h-full w-full border-0" allowFullScreen/>
          </div>
          <p className="px-4 py-3 text-xs leading-5 text-slate-500 sm:px-6">レーダーデータ：<a href="https://www.rainviewer.com/" target="_blank" rel="noreferrer" className="font-bold text-blue-600 underline">RainViewer</a>（約10分間隔）。通信状況により表示に時間がかかる場合があります。</p>
        </section>
        <section className="order-4 min-w-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-blue-600">NEXT 24 HOURS</p><h2 className="text-xl font-black">更新時刻から先の24時間</h2><p className="mt-1 text-sm text-slate-500">{displayLocation}・まず雨の時間帯を確認、下で1時間ごとの詳細を確認できます</p></div><CloudRain className="mt-1 text-blue-500" size={25}/></div>
          <div className={`mt-4 flex items-center gap-3 rounded-2xl border p-4 ${umbrellaNeeded ? "border-blue-200 bg-blue-50 text-blue-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm"><Umbrella size={24}/></span><div><p className="text-sm font-bold opacity-70">傘のアドバイス</p><p className="text-lg font-black">{umbrellaAdvice}</p></div></div>
          <div className="mt-3 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-sky-50 p-3 text-center"><span className="block text-xs font-bold text-slate-500">今後24時間の総降水量</span><b className="mt-1 block text-xl text-blue-700">{forecast ? `${dayRainTotal} mm` : "--"}</b></div><div className="rounded-2xl bg-slate-50 p-3 text-center"><span className="block text-xs font-bold text-slate-500">今後24時間の最大風速</span><b className="mt-1 block text-xl text-slate-800">{forecast ? `${dayMaxWind} km/h` : "--"}</b></div></div>
          <div><div className="contained-horizontal-scroll mt-5 pb-2"><div className="min-w-[1440px]"><div className="grid h-44 grid-cols-[repeat(24,minmax(0,1fr))] items-end gap-1 border-b border-slate-200 px-1">{hourlyRain.map((h,index)=><div key={`${h.fullLabel}-${index}`} className="flex h-full flex-col items-center justify-end"><b className="mb-1 text-[11px] text-blue-700">{h.chance}%</b><div className="w-full max-w-10 rounded-t bg-gradient-to-t from-blue-600 to-sky-300 transition-all" style={{height:`${Math.max(6,h.chance)}%`}}/></div>)}</div>
          <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1 px-1 pt-2 text-center text-xs font-bold text-slate-600">{hourlyRain.map((h,index)=><span key={`${h.fullLabel}-${index}`}><span className="block h-4 text-[10px] text-blue-500">{h.dateLabel}</span>{h.time}</span>)}</div>
          <div className="mt-3 grid grid-cols-[repeat(24,minmax(0,1fr))] overflow-hidden rounded-xl border border-slate-200 text-center text-xs">{hourlyRain.map((h,index)=><div key={`${h.fullLabel}-${index}`} className="border-r border-slate-100 px-1 py-2 last:border-0"><span className="mb-2 block text-3xl leading-none" aria-hidden="true">{h.precipitation >= 1 ? "🌧️" : h.chance >= 40 || h.precipitation >= 0.2 ? "🌦️" : "☁️"}</span><span className="sr-only">{h.fullLabel} {h.chance >= 40 || h.precipitation >= 0.2 ? "雨の可能性" : "くもり"}</span><span className="block text-[10px] text-slate-400">降水確率</span><b className="block text-blue-700">{h.chance}%</b><span className="mt-1 block text-[10px] text-slate-400">降水量</span><b className="block text-sky-700">{h.precipitation}mm</b><span className="mt-1 block text-[10px] text-slate-400">風速</span><b className="block text-slate-700">{h.wind}km/h</b></div>)}</div></div></div></div>
        </section>
        <section className="order-5 rounded-[28px] border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm md:p-6"><p className="text-xs font-bold text-blue-600">RAIN ANSWER</p><h2 className="mt-1 text-xl font-black">{currentlyRaining ? "雨はいつやむ？" : "次の雨はいつ降る？"}</h2><p className="mt-3 text-2xl font-black text-blue-950">{currentlyRaining ? (umbrellaRanges.length ? `${rainEndLabel}ごろに弱まる見込みです。` : "まもなく弱まる見込みです。") : (umbrellaRanges.length ? `${rainStartLabel}前後から降り始める可能性があります。` : "今後24時間はまとまった雨の予想はありません。")}</p><div className="mt-4 grid gap-2 sm:grid-cols-4">{rows.map(r=><div key={`rain-answer-${r.name}`} className="rounded-xl border border-blue-100 bg-white p-3"><span className="block text-xs font-bold text-slate-500">{r.name}</span><b className="mt-1 block">{currentlyRaining ? r.rainEnd : r.rainStart}</b></div>)}</div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold text-slate-600">KMG予測：{currentlyRaining ? rainEndLabel : rainStartLabel}前後｜信頼度 {confidenceScore}%</p><button type="button" onClick={()=>scrollToRadar("rain-radar-mobile")} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white xl:hidden">雨雲レーダーを見る ↓</button><button type="button" onClick={()=>scrollToRadar("rain-radar-desktop")} className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white xl:inline-flex">雨雲レーダーを見る ←</button></div></section>
        <section className="order-7 min-w-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6 xl:hidden"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-blue-600">7-DAY FORECAST</p><h2 className="text-xl font-black">週間天気</h2><p className="mt-1 text-sm text-slate-500">{displayLocation}・JMA / GFS / ECMWF / ICONの平均予報</p></div><CalendarDays className="mt-1 text-blue-500" size={25}/></div>
          <div className="contained-horizontal-scroll mt-5 pb-2"><div className="grid min-w-[840px] grid-cols-7 gap-3">{weeklyForecast.map((item, index)=><article key={`${item.date}-${index}`} className={`min-w-0 overflow-hidden rounded-2xl border px-2 py-3 text-center ${index === 0 ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50/70"}`}><div className="text-sm font-black text-slate-700">{index === 0 ? "今日" : item.date}</div><div className="my-3 text-4xl leading-none" role="img" aria-label={item.weather}>{item.icon}</div><div className="text-sm font-bold text-slate-600">{item.weather}</div><div className="mt-3 grid gap-1 rounded-xl bg-white px-2 py-2 text-sm font-black"><div className="flex items-center justify-between gap-1 whitespace-nowrap"><span className="text-[11px] text-slate-400">最高</span><span className="text-base text-rose-500">{item.high ?? "--"}°</span></div><div className="flex items-center justify-between gap-1 whitespace-nowrap"><span className="text-[11px] text-slate-400">最低</span><span className="text-base text-blue-500">{item.low ?? "--"}°</span></div></div><div className="mt-2 rounded-lg bg-white px-1 py-2 text-sm font-bold text-blue-700">降水 {item.rain == null ? "--" : `${item.rain}%`}</div><div className={`mt-2 rounded-full px-1 py-1.5 text-[11px] font-black ${item.confidence.style}`}>{item.confidence.label}</div></article>)}</div></div>
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold text-amber-700">KMG週間ワンポイント</p>{weeklyPoints.length ? <><p className="mt-1 text-lg font-black text-amber-950">{weeklyPoints[0]}</p><ul className="mt-2 grid gap-1 text-sm font-bold text-amber-900">{weeklyPoints.slice(1).map(point=><li key={point}>{point}</li>)}</ul></> : <p className="mt-1 font-bold text-amber-900">大きな天気の変化は少ない見込みです。</p>}</div><p className="mt-3 text-xs leading-5 text-slate-400">気温と天気傾向は4モデルの実データを集計。降水確率は各モデルで配信されている値だけを平均しています。</p>
        </section>
        <section className="hidden"><button type="button" onClick={()=>setModelsOpen(open => !open)} aria-expanded={modelsOpen}><span>4つの予報を比較</span></button><div>
          <div className="mt-4 grid gap-3 sm:hidden">{rows.map(r=><article key={r.name} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><div><span className="mr-2 inline-block size-3 rounded-full" style={{background:r.tint,border:"1px solid #94a3b8"}}/><b className="text-base">{r.name}</b></div><span className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${tomorrow ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-800"}`}><span className="text-2xl" role="img" aria-label={r.weather}>{r.icon}</span>{r.weather}</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-slate-50 p-2"><span className="block text-xs text-slate-500">最高 / 最低</span><b className="text-base"><span className="text-rose-500">{r.hi ?? "--"}°</span> / <span className="text-blue-500">{r.lo ?? "--"}°</span></b></div><div className="rounded-xl bg-slate-50 p-2"><span className="block text-xs text-slate-500">降水確率</span><b className="text-lg text-blue-700">{r.rain == null ? "非配信" : `${r.rain}%`}</b></div><div className="rounded-xl bg-slate-50 p-2"><span className="block text-xs text-slate-500">最大風速</span><b className="text-base">{r.wind == null ? "--" : `${Math.round(r.wind)} km/h`}</b></div></div></article>)}</div>
          <div className="mt-5 hidden overflow-x-auto sm:block"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b text-xs text-slate-400"><th className="pb-3">予報モデル</th><th className="pb-3">天気</th><th className="pb-3">最高 / 最低</th><th className="pb-3">降水確率</th><th className="pb-3">最大風速</th></tr></thead><tbody>{rows.map(r=><tr key={r.name} className="border-b border-slate-100 last:border-0"><td className="py-4"><span className="mr-3 inline-block size-3 rounded-full" style={{background:r.tint,border:"1px solid #94a3b8"}}/><b>{r.name}</b></td><td className="py-4"><span className={`inline-flex min-w-36 items-center gap-3 rounded-xl px-3 py-2 font-bold ${tomorrow ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-800"}`}><span className="text-3xl" role="img" aria-label={r.weather}>{r.icon}</span>{r.weather}</span></td><td className="py-4 font-bold"><span className="text-rose-500">{r.hi ?? "--"}°</span> / <span className="text-blue-500">{r.lo ?? "--"}°</span></td><td className="py-4">{r.rain == null ? <b className="text-slate-400">非配信</b> : <div className="flex items-center gap-3"><Progress value={r.rain} className="h-2 w-20"/><b>{r.rain}%</b></div>}</td><td className="py-4">{r.wind == null ? "--" : `${Math.round(r.wind)} km/h`}</td></tr>)}</tbody></table></div></div></section>
        <section className="order-8 grid gap-3 md:grid-cols-3 xl:hidden">{links.map((l,i)=><a key={l} href={i===0?"https://weathernews.jp/":i===1?"https://weather.yahoo.co.jp/weather/":"https://tenki.jp/"} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 font-bold shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><span><span className="mb-1 block text-[10px] font-bold text-slate-400">詳しい予報を見る</span>{l}</span><ExternalLink size={17} className="text-slate-400 group-hover:text-blue-500"/></a>)}</section>
      </div>
    </div>
    <div className="mx-auto w-full max-w-[1680px] px-4 pb-6 text-center text-sm font-medium leading-6 text-slate-500 md:px-8">
      <p className="mx-auto max-w-5xl">予報データ提供: Open-Meteo（JMA・NOAA GFS・ECMWF IFS・DWD ICON Global）。各都道府県庁所在地付近のモデル予報を集計した参考情報です。警報・避難情報は必ず気象庁や自治体の最新情報をご確認ください。</p>
    </div>
    <footer className="mt-4 border-t border-slate-200 bg-white/80 px-4 py-6 text-center text-sm font-semibold text-slate-500">
      <p>Copyright © KMG Co.,Ltd. All rights reserved.</p>
    </footer>
  </main>;
}
