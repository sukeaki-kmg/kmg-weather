"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, CloudRain, Compass, ExternalLink, MapPin, Navigation, ShieldCheck, Umbrella, Wind } from "lucide-react";
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
];
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
      models: providers.map(provider => provider.key).join(","),
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max",
      hourly: "precipitation_probability",
    });
    setForecastError("");
    fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      .then(response => { if (!response.ok) throw new Error("forecast request failed"); return response.json(); })
      .then(data => { setForecast(data); setLastUpdated(new Intl.DateTimeFormat("ja-JP", { timeZone:"Asia/Tokyo", hour:"2-digit", minute:"2-digit" }).format(new Date())); })
      .catch(() => { setForecast(null); setForecastError("予報データを取得できませんでした。しばらくしてから再読み込みしてください。"); });
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
    const offset = tomorrow * 24;
    return [0,3,6,9,12,15,18,21].map(hour => {
      const chances = providers.map(p => forecast?.hourly?.[`precipitation_probability_${p.key}`]?.[offset + hour]).filter((v: unknown): v is number => typeof v === "number");
      return { time:`${hour}時`, chance: chances.length ? Math.round(chances.reduce((a,b)=>a+b,0) / chances.length) : 0 };
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
    const confidence = weatherAgreement === 3 && temperatureSpread <= 2.5
      ? { label:"信頼度 高", style:"bg-emerald-100 text-emerald-700" }
      : weatherAgreement <= 1 || temperatureSpread >= 5
        ? { label:"予報が不安定", style:"bg-rose-100 text-rose-700" }
        : { label:"信頼度 中", style:"bg-amber-100 text-amber-700" };
    return { date, high: average(highs), low: average(numbers("temperature_2m_min")), rain: average(numbers("precipitation_probability_max")), confidence, ...info };
  }), [forecast, weeklyDates]);
  const selectedForecast = weeklyForecast[tomorrow];
  const agreement = Math.max(0, ...rows.map(row => rows.filter(other => other.weather === row.weather).length));
  const averageWind = (() => { const values = rows.map(row => row.wind).filter((v): v is number => typeof v === "number"); return values.length ? Math.round(values.reduce((a,b)=>a+b,0) / values.length) : null; })();
  const umbrellaHours = forecast ? hourlyRain.filter(item => item.chance >= 50) : [];
  const umbrellaAdvice = !forecast ? "降水データを取得中…" : umbrellaHours.length === 0 ? "傘なしで過ごせそうです" : `${umbrellaHours[0].time}〜${umbrellaHours.at(-1)?.time}は傘推奨`;
  const officeCode = `${String(prefectures.indexOf(pref) + 1).padStart(2, "0")}0000`;
  const [selectedLatitude, selectedLongitude] = coordinates[pref] ?? coordinates["東京都"];
  const warningUrl = `https://www.jma.go.jp/bosai/warning/#area_type=offices&area_code=${officeCode}`;
  const riskMapUrl = `https://www.jma.go.jp/bosai/risk/#zoom:7/lat:${selectedLatitude}/lon:${selectedLongitude}/colordepth:normal/elements:land`;
  const active = regions.find(r => r.name === region) ?? regions[2];
  const chooseRegion = (name: string) => { const r = regions.find(x => x.name === name)!; setRegion(name); setPref(r.prefs[0]); };

  return <main className="min-h-screen bg-[#f3f7fb] text-[#13233b]">
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 md:px-8">
      <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#246bfd] text-white shadow-lg shadow-blue-200"><Compass size={24}/></span><div><h1 className="text-xl font-black tracking-tight">KMG天気予報</h1><p className="text-[11px] font-bold tracking-[.14em] text-slate-400">WEATHER FORECAST</p></div></div>
      <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 md:flex"><ShieldCheck size={16} className="text-emerald-500"/>3つの予報データを比較中</div>
    </div></header>
    <div className="mx-auto grid w-full max-w-[1680px] gap-5 p-3 sm:p-4 md:p-8 xl:grid-cols-[minmax(520px,620px)_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-5">
        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-5"><div className="mb-3 flex items-center justify-between"><div><p className="text-sm font-bold text-blue-600 md:text-xs">予報地点を選択</p><h2 className="text-xl font-black sm:text-base">主要12都市から選ぶ</h2></div><MapPin className="shrink-0 text-blue-500"/></div>
          <div className="relative mx-auto aspect-square w-full max-w-[600px] overflow-hidden rounded-2xl bg-gradient-to-b from-sky-50 to-blue-50/40">
            <img src="/japan-prefectures.svg" alt="47都道府県の境界を表示した日本地図" className="h-full w-full object-contain p-1 opacity-90 sm:p-3"/>
            {mapCities.map(c=><button key={c.name} onClick={()=>{setRegion(c.region);setPref(c.pref)}} style={{left:`${c.left}%`,top:`${c.top}%`}} className="absolute z-20 hidden -translate-x-1/2 items-center gap-1 rounded-lg border border-white bg-white/95 px-1.5 py-1 text-left shadow-md transition hover:z-30 hover:scale-105 sm:flex"><span className="text-2xl leading-none">{c.icon}</span><span><b className="block text-[11px] leading-none">{c.name}</b><b className="text-sm font-black text-blue-700">{c.temperature == null ? "--" : `${c.temperature}°`}</b></span></button>)}
            <span className="absolute bottom-2 right-3 text-[10px] font-medium text-slate-500">地図: Geolonia / GFDL</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">{mapCities.map(c=><button key={c.name} onClick={()=>{setRegion(c.region);setPref(c.pref)}} className={`flex min-h-16 items-center gap-2 rounded-xl border p-2 text-left ${pref === c.pref ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}><span className="text-3xl leading-none">{c.icon}</span><span><b className="block text-sm font-black">{c.name}</b><b className="text-lg font-black text-blue-700">{c.temperature == null ? "--" : `${c.temperature}°`}</b></span></button>)}</div>
          <p className="mt-2 text-center text-xs text-slate-400">地図の天気・気温も3モデルの実データ平均</p>
          <div className="mt-4 grid grid-cols-2 gap-2"><Select value={region} onValueChange={chooseRegion}><SelectTrigger className="h-12 text-base"><SelectValue/></SelectTrigger><SelectContent>{regions.map(r=><SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select><Select value={pref} onValueChange={setPref}><SelectTrigger className="h-12 text-base"><SelectValue/></SelectTrigger><SelectContent>{active.prefs.map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
        </section>
      </aside>
      <div className="min-w-0 space-y-5">
        <Tabs value={day} onValueChange={setDay} className="w-full"><TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-white p-1 shadow-sm"><TabsTrigger value="today" className="rounded-xl text-sm font-black">今日 <span className="ml-2 text-xs font-medium text-slate-400">{dateLabels.today}</span></TabsTrigger><TabsTrigger value="tomorrow" className="rounded-xl text-sm font-black">明日 <span className="ml-2 text-xs font-medium text-slate-400">{dateLabels.tomorrow}</span></TabsTrigger></TabsList></Tabs>
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700"><AlertTriangle size={21}/></span><div><h2 className="font-black text-amber-950">{pref}の警報・注意報</h2><p className="mt-0.5 text-sm text-amber-800">大雨時は気象庁の公式防災情報を確認してください。</p></div></div><div className="grid grid-cols-2 gap-2 sm:flex"><a href={warningUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-center text-sm font-black text-amber-900 hover:bg-amber-100">警報・注意報</a><a href={riskMapUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-amber-600 px-4 py-2.5 text-center text-sm font-black text-white hover:bg-amber-700">キキクル</a></div></div></section>
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2872ff] via-[#438cf8] to-[#79b7f6] p-5 text-white shadow-xl shadow-blue-200/70 sm:rounded-[32px] sm:p-6 md:p-8"><div className="absolute -right-10 -top-20 size-64 rounded-full bg-white/10"/><div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><div className="flex flex-wrap items-center gap-2 text-base font-bold text-blue-100 sm:text-sm"><Navigation size={18}/>{pref} · {day === "today" ? "今日" : "明日"} <span className="rounded-full bg-white/20 px-2 py-1 text-xs">実予報モデル</span></div><h2 className="mt-4 text-[28px] font-black leading-tight sm:text-3xl md:text-4xl">{forecastError || (forecast ? `${selectedForecast?.weather ?? "取得中"}の予報` : "予報を取得しています…")}</h2><p className="mt-3 text-base leading-7 text-blue-50">JMA・NOAA GFS・ECMWF IFSの最新値を比較しています。</p></div><div className="flex items-center justify-center gap-4 md:justify-start md:pr-6"><div className="grid size-24 shrink-0 place-items-center rounded-full bg-white/90 shadow-inner"><span className="text-6xl" role="img" aria-label={selectedForecast?.weather ?? "取得中"}>{selectedForecast?.icon ?? "…"}</span></div><div><div className="text-6xl font-light">{selectedForecast?.high ?? "--"}°</div><div className="mt-1 text-base font-bold">最低 {selectedForecast?.low ?? "--"}°</div></div></div></div>
          <div className="relative mt-7 grid grid-cols-3 gap-3">{[{i:<Umbrella key="i"/>,l:"降水確率",v:selectedForecast?.rain == null ? "--" : `${selectedForecast.rain}%`},{i:<ShieldCheck key="i"/>,l:"天気の一致",v:`${agreement} / 3`},{i:<Wind key="i"/>,l:"最大風速平均",v:averageWind == null ? "--" : `${averageWind} km/h`}].map(x=><div key={x.l} className="rounded-2xl bg-white/15 p-3 backdrop-blur"><div className="flex items-center gap-2 text-sm text-blue-50">{x.i}{x.l}</div><div className="mt-1 text-xl font-black">{x.v}</div></div>)}</div>
        </section>
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-blue-600">HOURLY RAIN · {day === "today" ? "TODAY" : "TOMORROW"}</p><h2 className="text-xl font-black">時間別の降水確率</h2><p className="mt-1 text-xs text-slate-400">{pref}・取得できた実予報モデルの平均</p></div><CloudRain className="mt-1 text-blue-500" size={25}/></div>
          <div className={`mt-4 flex items-center gap-3 rounded-2xl border p-4 ${umbrellaHours.length ? "border-blue-200 bg-blue-50 text-blue-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm"><Umbrella size={24}/></span><div><p className="text-xs font-bold opacity-70">傘のアドバイス</p><p className="text-lg font-black">{umbrellaAdvice}</p></div></div>
          <div className="mt-5 overflow-x-auto pb-2"><div className="min-w-[620px]"><div className="grid h-48 grid-cols-8 items-end gap-2 border-b border-slate-200 px-1">{hourlyRain.map(h=><div key={h.time} className="flex h-full flex-col items-center justify-end"><b className="mb-1 text-sm text-blue-700">{h.chance}%</b><div className="w-full max-w-12 rounded-t-md bg-gradient-to-t from-blue-600 to-sky-300 transition-all" style={{height:`${Math.max(8,h.chance)}%`}}/></div>)}</div>
          <div className="grid grid-cols-8 gap-2 px-1 pt-2 text-center text-sm font-bold text-slate-600">{hourlyRain.map(h=><span key={h.time}>{h.time}</span>)}</div>
          <div className="mt-4 grid grid-cols-8 overflow-hidden rounded-xl border border-slate-200 text-center text-sm">{hourlyRain.map(h=><div key={h.time} className="border-r border-slate-100 px-1 py-2 last:border-0"><span className="block text-slate-500">{h.time}</span><b className="mt-0.5 block text-blue-700">{h.chance}%</b></div>)}</div></div></div>
        </section>
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-blue-600">7-DAY FORECAST</p><h2 className="text-xl font-black">週間天気</h2><p className="mt-1 text-sm text-slate-500">{pref}・JMA / GFS / ECMWFの平均予報</p></div><CalendarDays className="mt-1 text-blue-500" size={25}/></div>
          <div className="mt-5 overflow-x-auto pb-2"><div className="grid min-w-[840px] grid-cols-7 gap-3">{weeklyForecast.map((item, index)=><article key={`${item.date}-${index}`} className={`min-w-0 overflow-hidden rounded-2xl border px-2 py-3 text-center ${index === 0 ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50/70"}`}><div className="text-sm font-black text-slate-700">{index === 0 ? "今日" : item.date}</div><div className="my-3 text-4xl leading-none" role="img" aria-label={item.weather}>{item.icon}</div><div className="text-sm font-bold text-slate-600">{item.weather}</div><div className="mt-3 grid gap-1 rounded-xl bg-white px-2 py-2 text-sm font-black"><div className="flex items-center justify-between gap-1 whitespace-nowrap"><span className="text-[11px] text-slate-400">最高</span><span className="text-base text-rose-500">{item.high ?? "--"}°</span></div><div className="flex items-center justify-between gap-1 whitespace-nowrap"><span className="text-[11px] text-slate-400">最低</span><span className="text-base text-blue-500">{item.low ?? "--"}°</span></div></div><div className="mt-2 rounded-lg bg-white px-1 py-2 text-sm font-bold text-blue-700">降水 {item.rain == null ? "--" : `${item.rain}%`}</div><div className={`mt-2 rounded-full px-1 py-1.5 text-[11px] font-black ${item.confidence.style}`}>{item.confidence.label}</div></article>)}</div></div>
          <p className="mt-2 text-xs leading-5 text-slate-400">気温と天気傾向は3モデルの実データを集計。降水確率はJMAモデルでは配信されないため、GFSとECMWFの平均です。</p>
        </section>
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-blue-600 sm:text-xs">FORECAST SOURCES · {day === "today" ? "TODAY" : "TOMORROW"}</p><h2 className="text-xl font-black">3つの予報を比較</h2></div><p className="text-xs font-medium text-slate-500" aria-live="polite">最終更新 {lastUpdated || "--:--"} · 1時間ごとに自動更新</p></div>
          <div className="mt-4 grid gap-3 sm:hidden">{rows.map(r=><article key={r.name} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><div><span className="mr-2 inline-block size-3 rounded-full" style={{background:r.tint,border:"1px solid #94a3b8"}}/><b className="text-base">{r.name}</b></div><span className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${tomorrow ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-800"}`}><span className="text-2xl" role="img" aria-label={r.weather}>{r.icon}</span>{r.weather}</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-slate-50 p-2"><span className="block text-xs text-slate-500">最高 / 最低</span><b className="text-base"><span className="text-rose-500">{r.hi ?? "--"}°</span> / <span className="text-blue-500">{r.lo ?? "--"}°</span></b></div><div className="rounded-xl bg-slate-50 p-2"><span className="block text-xs text-slate-500">降水確率</span><b className="text-lg text-blue-700">{r.rain == null ? "非配信" : `${r.rain}%`}</b></div><div className="rounded-xl bg-slate-50 p-2"><span className="block text-xs text-slate-500">最大風速</span><b className="text-base">{r.wind == null ? "--" : `${Math.round(r.wind)} km/h`}</b></div></div></article>)}</div>
          <div className="mt-5 hidden overflow-x-auto sm:block"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b text-xs text-slate-400"><th className="pb-3">予報モデル</th><th className="pb-3">天気</th><th className="pb-3">最高 / 最低</th><th className="pb-3">降水確率</th><th className="pb-3">最大風速</th></tr></thead><tbody>{rows.map(r=><tr key={r.name} className="border-b border-slate-100 last:border-0"><td className="py-4"><span className="mr-3 inline-block size-3 rounded-full" style={{background:r.tint,border:"1px solid #94a3b8"}}/><b>{r.name}</b></td><td className="py-4"><span className={`inline-flex min-w-36 items-center gap-3 rounded-xl px-3 py-2 font-bold ${tomorrow ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-800"}`}><span className="text-3xl" role="img" aria-label={r.weather}>{r.icon}</span>{r.weather}</span></td><td className="py-4 font-bold"><span className="text-rose-500">{r.hi ?? "--"}°</span> / <span className="text-blue-500">{r.lo ?? "--"}°</span></td><td className="py-4">{r.rain == null ? <b className="text-slate-400">非配信</b> : <div className="flex items-center gap-3"><Progress value={r.rain} className="h-2 w-20"/><b>{r.rain}%</b></div>}</td><td className="py-4">{r.wind == null ? "--" : `${Math.round(r.wind)} km/h`}</td></tr>)}</tbody></table></div></section>
        <section className="grid gap-3 md:grid-cols-3">{links.map((l,i)=><a key={l} href={i===0?"https://weathernews.jp/":i===1?"https://weather.yahoo.co.jp/weather/":"https://tenki.jp/"} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 font-bold shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><span><span className="mb-1 block text-[10px] font-bold text-slate-400">詳しい予報を見る</span>{l}</span><ExternalLink size={17} className="text-slate-400 group-hover:text-blue-500"/></a>)}</section>
        <p className="px-2 text-center text-sm leading-6 text-slate-500 sm:text-xs">予報データ提供: Open-Meteo（JMA・NOAA GFS・ECMWF IFS）。各都道府県庁所在地付近のモデル予報を集計した参考情報です。警報・避難情報は必ず気象庁や自治体の最新情報をご確認ください。</p>
      </div>
    </div>
  </main>;
}
