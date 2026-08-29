"use client";

import { useMemo, useState } from "react";
import { CloudRain, Compass, ExternalLink, LocateFixed, MapPin, Navigation, Search, ShieldCheck, Sun, Umbrella, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
const seed: Record<string, number> = { "東京都": 0, "北海道": 3, "沖縄県": 7, "大阪府": 2, "福岡県": 5 };
const providers = [
  { name: "気象庁", tint: "#e8f0ff" },
  { name: "Apple Weather", tint: "#f0f1f4" },
  { name: "OpenWeather", tint: "#fff2e6" },
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
  const [query, setQuery] = useState("");
  const [day, setDay] = useState("today");
  const factor = seed[pref] ?? pref.charCodeAt(0) % 6;
  const tomorrow = day === "tomorrow" ? 1 : 0;
  const mapCities = useMemo(() => cities.map((c, i) => ({
    ...c,
    icon: tomorrow ? ["☀️","🌤️","☀️","🌤️","☀️","☀️","🌤️","☀️","☀️","🌦️","🌤️","🌦️"][i] : c.icon,
    temp: tomorrow ? `${Number.parseInt(c.temp) + (i % 3 === 0 ? 0 : 1)}°` : c.temp,
  })), [tomorrow]);
  const rows = useMemo(() => providers.map((p, i) => ({ ...p, weather: tomorrow ? "晴れ時々くもり" : i === 2 && factor > 3 ? "くもり時々雨" : "くもりのち雨", hi: 29 + tomorrow + ((factor + i) % 3), lo: 23 + ((factor + i) % 2), rain: tomorrow ? 20 + ((factor + i * 5) % 25) : 50 + ((factor * 7 + i * 10) % 40), wind: 2 + ((factor + i) % 3) })), [factor, tomorrow]);
  const hourlyRain = useMemo(() => {
    const base = tomorrow ? [10,10,15,20,25,20,15,10] : [20,25,35,50,70,80,65,45];
    return ["0時","3時","6時","9時","12時","15時","18時","21時"].map((time, i) => ({
      time,
      chance: Math.min(100, base[i] + ((factor + i) % 3) * 5),
    }));
  }, [factor, tomorrow]);
  const active = regions.find(r => r.name === region) ?? regions[2];
  const chooseRegion = (name: string) => { const r = regions.find(x => x.name === name)!; setRegion(name); setPref(r.prefs[0]); };

  return <main className="min-h-screen bg-[#f3f7fb] text-[#13233b]">
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 md:px-8">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#246bfd] text-white shadow-lg shadow-blue-200"><Compass size={23}/></span><div><h1 className="text-lg font-black tracking-tight">KMG天気予報</h1><p className="text-[10px] font-bold tracking-[.14em] text-slate-400">WEATHER FORECAST</p></div></div>
      <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 md:flex"><ShieldCheck size={16} className="text-emerald-500"/>3つの予報データを比較中</div>
    </div></header>
    <div className="mx-auto grid max-w-[1680px] gap-5 p-2 sm:p-4 md:p-8 xl:grid-cols-[700px_1fr]">
      <aside className="space-y-5">
        <section className="overflow-hidden rounded-[28px] bg-[#15335c] p-5 text-white shadow-xl shadow-slate-300/40"><p className="mb-3 text-xs font-bold tracking-wider text-blue-200">場所を選ぶ</p><div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={18}/><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="市区町村・施設名を検索" className="h-11 border-white/10 bg-white pl-10 text-slate-900 placeholder:text-slate-400"/></div><Button variant="outline" className="mt-3 w-full border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"><LocateFixed size={17}/>現在地の天気を見る</Button></section>
        <section className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[28px] sm:p-5"><div className="mb-2 flex items-center justify-between"><div><p className="text-xs font-bold text-blue-600">全国の{day === "today" ? "今日" : "明日"}の天気</p><h2 className="font-black">主要12都市を一目で確認</h2></div><MapPin className="text-blue-500"/></div>
          <div className="relative mx-auto aspect-square w-full max-w-[660px] overflow-hidden rounded-2xl bg-gradient-to-b from-sky-50 to-blue-50/40">
            <img src="/japan-prefectures.svg" alt="47都道府県の境界を表示した日本地図" className="h-full w-full object-contain p-1 opacity-90 sm:p-3"/>
            {mapCities.map(c=><button key={c.name} onClick={()=>{setRegion(c.region);setPref(c.pref)}} style={{left:`${c.left}%`,top:`${c.top}%`}} className="absolute z-20 flex -translate-x-1/2 items-center justify-center gap-0.5 rounded-lg border border-white bg-white/95 px-1 py-0.5 text-left shadow-lg transition hover:z-30 hover:scale-110 md:gap-1 md:px-1.5 md:py-1"><span className="text-[30px] leading-none md:text-[40px]">{c.icon}</span><span><b className="block text-xs font-extrabold leading-none md:text-[15px]">{c.name}</b><b className="text-[17px] font-black leading-tight md:text-[22px]">{c.temp}</b></span></button>)}
            <span className="absolute bottom-2 right-3 text-[9px] font-medium text-slate-400">地図: Geolonia / GFDL</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2"><Select value={region} onValueChange={chooseRegion}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{regions.map(r=><SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select><Select value={pref} onValueChange={setPref}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{active.prefs.map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
        </section>
      </aside>
      <div className="space-y-5">
        <Tabs value={day} onValueChange={setDay} className="w-full"><TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-white p-1 shadow-sm"><TabsTrigger value="today" className="rounded-xl text-sm font-black">今日 <span className="ml-2 text-xs font-medium text-slate-400">8/29</span></TabsTrigger><TabsTrigger value="tomorrow" className="rounded-xl text-sm font-black">明日 <span className="ml-2 text-xs font-medium text-slate-400">8/30</span></TabsTrigger></TabsList></Tabs>
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#2872ff] via-[#438cf8] to-[#79b7f6] p-6 text-white shadow-xl shadow-blue-200/70 md:p-8"><div className="absolute -right-10 -top-20 size-64 rounded-full bg-white/10"/><div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center"><div><div className="flex items-center gap-2 text-sm font-bold text-blue-100"><Navigation size={16}/>{pref} · {day === "today" ? "今日" : "明日"} <span className="rounded-full bg-white/20 px-2 py-1 text-[10px]">デモデータ</span></div><h2 className="mt-4 text-3xl font-black md:text-4xl">{tomorrow ? "日中は晴れて過ごしやすい" : "午後から雨の可能性が高い"}</h2><p className="mt-2 text-blue-100">{tomorrow ? "朝晩との気温差に注意。傘の出番は少なそうです。" : "外出は14時までがおすすめ。折りたたみ傘があると安心です。"}</p></div><div className="flex items-center gap-4 md:pr-6"><div className={`grid size-24 place-items-center rounded-full shadow-inner ${tomorrow ? "bg-amber-100" : "bg-sky-100"}`}><span className="text-6xl" role="img" aria-label={tomorrow ? "晴れ" : "雨"}>{tomorrow ? "☀️" : "🌧️"}</span></div><div><div className="text-6xl font-light">{30 + tomorrow + factor%2}°</div><div className="mt-1 text-sm font-bold">体感温度 {31 + tomorrow + factor%2}°</div></div></div></div>
          <div className="relative mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">{[{i:<Umbrella key="i"/>,l:"傘推奨度",v:tomorrow ? `${28+factor}%` : `${82+factor}%`},{i:<ShieldCheck key="i"/>,l:"予報一致度",v:"2 / 3"},{i:<Wind key="i"/>,l:"最大風速",v:`${4+factor%3} m/s`},{i:<Sun key="i"/>,l:"紫外線",v:tomorrow ? "強い" : "やや強い"}].map(x=><div key={x.l} className="rounded-2xl bg-white/15 p-3 backdrop-blur"><div className="flex items-center gap-2 text-xs text-blue-100">{x.i}{x.l}</div><div className="mt-1 text-xl font-black">{x.v}</div></div>)}</div>
        </section>
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-blue-600">HOURLY RAIN · {day === "today" ? "TODAY" : "TOMORROW"}</p><h2 className="text-xl font-black">時間別の降水確率</h2><p className="mt-1 text-xs text-slate-400">{pref}・3つの予報データの平均</p></div><CloudRain className="mt-1 text-blue-500" size={25}/></div>
          <div className="mt-5 grid h-48 grid-cols-8 items-end gap-1 border-b border-slate-200 px-1 sm:gap-2">{hourlyRain.map(h=><div key={h.time} className="flex h-full flex-col items-center justify-end"><b className="mb-1 text-[11px] text-blue-700 sm:text-sm">{h.chance}%</b><div className="w-full max-w-12 rounded-t-md bg-gradient-to-t from-blue-600 to-sky-300 transition-all" style={{height:`${Math.max(8,h.chance)}%`}}/></div>)}</div>
          <div className="grid grid-cols-8 gap-1 px-1 pt-2 text-center text-[10px] font-bold text-slate-500 sm:gap-2 sm:text-xs">{hourlyRain.map(h=><span key={h.time}>{h.time}</span>)}</div>
          <div className="mt-4 grid grid-cols-8 overflow-hidden rounded-xl border border-slate-200 text-center text-[10px] sm:text-xs">{hourlyRain.map(h=><div key={h.time} className="border-r border-slate-100 px-0.5 py-2 last:border-0"><span className="block text-slate-400">{h.time}</span><b className="mt-0.5 block text-blue-700">{h.chance}%</b></div>)}</div>
        </section>
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6"><div className="flex items-end justify-between"><div><p className="text-xs font-bold text-blue-600">FORECAST SOURCES · {day === "today" ? "TODAY" : "TOMORROW"}</p><h2 className="text-xl font-black">3つの予報を横並びで比較</h2></div><p className="hidden text-xs text-slate-400 sm:block">最終更新 12:00</p></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b text-xs text-slate-400"><th className="pb-3">予報元</th><th className="pb-3">天気</th><th className="pb-3">最高 / 最低</th><th className="pb-3">降水確率</th><th className="pb-3">風速</th></tr></thead><tbody>{rows.map(r=><tr key={r.name} className="border-b border-slate-100 last:border-0"><td className="py-4"><span className="mr-3 inline-block size-3 rounded-full" style={{background:r.tint,border:"1px solid #94a3b8"}}/><b>{r.name}</b></td><td className="py-4"><span className={`inline-flex min-w-36 items-center gap-3 rounded-xl px-3 py-2 font-bold ${tomorrow ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-800"}`}><span className="text-3xl" role="img" aria-label={tomorrow ? "晴れ時々くもり" : "くもりのち雨"}>{tomorrow ? "🌤️" : "🌦️"}</span>{r.weather}</span></td><td className="py-4 font-bold"><span className="text-rose-500">{r.hi}°</span> / <span className="text-blue-500">{r.lo}°</span></td><td className="py-4"><div className="flex items-center gap-3"><Progress value={r.rain} className="h-2 w-20"/><b>{r.rain}%</b></div></td><td className="py-4">{r.wind} m/s</td></tr>)}</tbody></table></div></section>
        <section className="grid gap-3 md:grid-cols-3">{links.map((l,i)=><a key={l} href={i===0?"https://weathernews.jp/":i===1?"https://weather.yahoo.co.jp/weather/":"https://tenki.jp/"} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 font-bold shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><span><span className="mb-1 block text-[10px] font-bold text-slate-400">詳しい予報を見る</span>{l}</span><ExternalLink size={17} className="text-slate-400 group-hover:text-blue-500"/></a>)}</section>
        <p className="px-2 text-center text-[11px] leading-5 text-slate-400">総合判断は複数の予報を独自に集計した参考情報です。警報・避難情報は必ず気象庁や自治体の最新情報をご確認ください。</p>
      </div>
    </div>
  </main>;
}
