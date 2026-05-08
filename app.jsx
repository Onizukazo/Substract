const { useState, useEffect, useRef, useCallback } = React;
const { createRoot } = ReactDOM;
const {
  Home, CreditCard, Users, Sparkles, Bell, ChevronRight,
  Search, Plus, ArrowLeft, Link2, Mail, Landmark, Phone,
  User, Mic, Send, CalendarCheck, X, TrendingUp, ArrowDown,
  CheckCircle2, Clock, Eye, DollarSign, Shield, BarChart3,
  AlertCircle, PieChart, ExternalLink, Archive, PhoneCall,
  FileText, Zap, MessageCircle, UserPlus, Link, Percent,
  Settings, Copy, MoreVertical, Volume2, MicOff, Square
} = window.LucideReact;

// =========================================
// DATA
// =========================================
const INITIAL_SUBS = [
  { id:1, name:"Netflix",    color:"#ef4444", plan:"Premium",  amt:649,    due:"Nov 15",   days:32, cat:"Entertainment" },
  { id:2, name:"Spotify",    color:"#10b981", plan:"Student",  amt:59,     due:"In 2 days",days:2,  cat:"Entertainment", aiTip:true },
  { id:3, name:"Adobe CC",   color:"#ef4444", plan:"All Apps", amt:4230,   due:"Nov 20",   days:37, cat:"Productivity", insight:"Only Photoshop used. Photography plan saves â‚¹3,400/mo." },
  { id:4, name:"Disney+",    color:"#1d4ed8", plan:"Annual",   amt:299,    due:"Dec 1",    days:48, cat:"Entertainment", inactive:true, insight:"No activity for 28 days. Likely unused." },
  { id:5, name:"iCloud+",    color:"#3b82f6", plan:"200GB",    amt:219,    due:"Nov 18",   days:35, cat:"Cloud Storage" },
  { id:6, name:"YouTube",    color:"#ef4444", plan:"Premium",  amt:149,    due:"In 4 days",days:4,  cat:"Entertainment" },
  { id:7, name:"Notion",     color:"#1e293b", plan:"Plus",     amt:650,    due:"Nov 25",   days:42, cat:"Productivity" },
  { id:8, name:"FitnessPro", color:"#8b5cf6", plan:"Annual",   amt:1999,   due:"Dec 5",    days:52, cat:"Health", insight:"No activity for 28 days. Likely unused." },
];

const INITIAL_GROUPS = [
  { id:101, name:"Netflix Family", members:4, perPerson:162, total:649, colors:["#ef4444","#3b82f6","#f59e0b","#ec4899"],
    memberNames:["You","Anita","Priya","Vikram"], subName:"Netflix", plan:"Premium Family", nextDue:"Nov 15",
    balances:[{name:"Anita", paid:true},{name:"Priya", paid:false, owed:162},{name:"Vikram", paid:true}], isOwner: true },
  { id:102, name:"YouTube Premium", members:3, perPerson:89, total:269, colors:["#ef4444","#10b981","#8b5cf6"],
    memberNames:["You","Rahul K.","Sneha"], subName:"YouTube", plan:"Family Premium", nextDue:"Nov 22",
    balances:[{name:"Rahul K.", paid:true},{name:"Sneha", paid:false, owed:89}], isOwner: false, ownerName: "Rahul K." },
];

// AI Insight cards for carousel
const AI_INSIGHTS = [
  { id:'ins1', subId:4, title:"Disney+ is inactive.", desc:"No activity for 28 days. Likely unused.", save:299, color:"#1d4ed8" },
  { id:'ins2', subId:3, title:"Adobe CC underused.", desc:"Only Photoshop used. Switch to Photography plan.", save:3400, color:"#ef4444" },
  { id:'ins3', subId:8, title:"FitnessPro unused.", desc:"No gym check-ins for 28 days.", save:1999, color:"#8b5cf6" },
];

// Subscription library for "Add" flow
const SUB_LIBRARY = [
  { name:"Netflix", color:"#ef4444", cat:"Entertainment", plans:[{label:"Basic",amt:149},{label:"Standard",amt:499},{label:"Premium",amt:649}] },
  { name:"Spotify", color:"#10b981", cat:"Entertainment", plans:[{label:"Individual",amt:119},{label:"Student",amt:59},{label:"Duo",amt:179},{label:"Family",amt:199}] },
  { name:"Disney+", color:"#1d4ed8", cat:"Entertainment", plans:[{label:"Basic",amt:149},{label:"Premium",amt:299}] },
  { name:"Adobe CC", color:"#ef4444", cat:"Productivity", plans:[{label:"Photography",amt:830},{label:"Single App",amt:1850},{label:"All Apps",amt:4230}] },
  { name:"YouTube", color:"#ef4444", cat:"Entertainment", plans:[{label:"Premium",amt:149},{label:"Music",amt:99},{label:"Family",amt:269}] },
  { name:"iCloud+", color:"#3b82f6", cat:"Cloud Storage", plans:[{label:"50GB",amt:75},{label:"200GB",amt:219},{label:"2TB",amt:749}] },
  { name:"Notion", color:"#1e293b", cat:"Productivity", plans:[{label:"Plus",amt:650},{label:"Business",amt:1250}] },
  { name:"Dropbox", color:"#3b82f6", cat:"Cloud Storage", plans:[{label:"Plus",amt:978},{label:"Professional",amt:1650}] },
  { name:"ChatGPT", color:"#10b981", cat:"Productivity", plans:[{label:"Plus",amt:1650},{label:"Pro",amt:16600}] },
  { name:"Figma", color:"#a855f7", cat:"Productivity", plans:[{label:"Professional",amt:1250},{label:"Organization",amt:3750}] },
  { name:"Canva", color:"#06b6d4", cat:"Productivity", plans:[{label:"Pro",amt:500},{label:"Teams",amt:750}] },
  { name:"Hulu", color:"#10b981", cat:"Entertainment", plans:[{label:"Basic",amt:660},{label:"No Ads",amt:1490}] },
];

// Cancellation methods per subscription
const CANCEL_METHODS = {
  'Netflix':    { method:'website', url:'https://netflix.com/cancelplan', features:['Ad-free streaming','4K Ultra HD','4 screens at once'] },
  'Spotify':    { method:'inapp',   steps:['Open Spotify app â†’ Settings','Tap "Subscription"','Select "Cancel Premium"','Confirm cancellation'], features:['Ad-free music','Offline downloads','High quality audio'] },
  'Adobe CC':   { method:'phone',   number:'1-800-833-6687', script:'Hi, I\'d like to cancel my Adobe Creative Cloud subscription. My account email is [your email]. I no longer need the service and would like to process the cancellation today.', features:['Photoshop access','20+ creative apps','100GB cloud storage'] },
  'Disney+':    { method:'website', url:'https://disneyplus.com/account/cancel', features:['Disney originals','Marvel & Star Wars','4K HDR streaming'] },
  'YouTube':    { method:'website', url:'https://youtube.com/paid_memberships', features:['Ad-free videos','Background play','YouTube Music'] },
  'iCloud+':    { method:'inapp',   steps:['Open Settings â†’ Apple ID','Tap "iCloud"','Tap "Manage Storage"','Downgrade to free plan'], features:['Cloud storage','iCloud Private Relay','Hide My Email'] },
  'Notion':     { method:'website', url:'https://notion.so/settings/billing', features:['Unlimited blocks','30-day history','Unlimited uploads'] },
  'FitnessPro': { method:'phone',   number:'1-888-555-0199', script:'Hello, I want to cancel my FitnessPro subscription. My membership ID is [your ID]. Please process the cancellation effective immediately.', features:['Gym access','Personal training','Class bookings'] },
};

// =========================================
// SHARED COMPONENTS
// =========================================
const LetterAvatar = ({ name, color, size = 44 }) => (
  <div className="flex items-center justify-center text-white font-bold shrink-0" style={{
    width: size, height: size, borderRadius: size * 0.3,
    background: color, fontSize: size * 0.38
  }}>
    {name[0].toUpperCase()}
  </div>
);

const Header = () => (
  <div className="flex items-center justify-between px-5 pt-4 pb-2">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm">R</div>
      <div>
        <p className="text-xs text-slate-400 font-medium">Good morning</p>
        <p className="text-sm font-bold text-slate-800">Rahul</p>
      </div>
    </div>
    <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
      <Bell size={18} />
    </button>
  </div>
);

const BottomNav = ({ active, setTab }) => (
  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center h-16 z-40">
    {[
      { id:'home',    icon: Home,       label:'Home' },
      { id:'subs',    icon: CreditCard, label:'Subs' },
      { id:'circles', icon: Users,      label:'Circles' },
      { id:'agent',   icon: Sparkles,   label:'AI Agent' },
    ].map(tab => {
      const Icon = tab.icon;
      const isActive = active === tab.id;
      return (
        <button key={tab.id} onClick={() => setTab(tab.id)} className="flex flex-col items-center gap-0.5 pt-1">
          <Icon size={20} className={isActive ? 'text-brand' : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 1.8} />
          <span className={`text-[10px] font-semibold ${isActive ? 'text-brand' : 'text-slate-400'}`}>{tab.label}</span>
        </button>
      );
    })}
  </div>
);

const FAB = ({ onClick }) => (
  <button onClick={onClick} className="absolute bottom-20 right-5 w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center shadow-lg z-30 active:scale-90 transition-transform">
    <Plus size={24} className="text-white" />
  </button>
);

// =========================================
// SPLASH
// =========================================
const ScreenSplash = ({ onFinish }) => {
  useEffect(() => {
    const t = setTimeout(onFinish, 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex items-center justify-center h-full bg-brand">
      <h1 className="text-white text-5xl font-black tracking-tight glow-text scale-in">
        Substract
      </h1>
    </div>
  );
};

// =========================================
// AUTH SCREEN
// =========================================
const ScreenAuth = ({ onSignUp }) => {
  const [dot, setDot] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDot(d => (d + 1) % 5), 3000);
    return () => clearInterval(t);
  }, []);

  const headlines = [
    "Your AI Financial\nConcierge",
    "Track Every\nSubscription",
    "Cancel Unused\nServices Instantly",
    "Save Hundreds\nEvery Year",
    "AI-Powered\nInsights"
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
        <h1 className="text-brand text-3xl font-black italic tracking-tight">Substract</h1>
      </div>
      <div className="bg-white px-8 pb-8 pt-10 rounded-t-[32px] -mt-6 relative z-10">
        <h2 className="text-slate-800 text-[28px] font-bold leading-tight whitespace-pre-line mb-2 fade-in" key={dot}>
          {headlines[dot]}
        </h2>
        <p className="text-slate-400 text-sm font-medium mb-6">
          Say goodbye to monthly fees you didn't know you had.
        </p>
        <div className="flex justify-center gap-2 mb-8">
          {[0,1,2,3,4].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === dot ? 'w-6 bg-brand' : 'w-2 bg-slate-200'}`} />
          ))}
        </div>
        <button onClick={onSignUp} className="w-full bg-brand text-white font-bold text-base py-4 rounded-2xl mb-3 active:scale-[0.98] transition-transform">
          Sign up
        </button>
        <button className="w-full bg-slate-100 text-slate-800 font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-transform">
          Log in
        </button>
      </div>
    </div>
  );
};

// =========================================
// ONBOARDING (4 steps)
// =========================================
const ScreenOnboarding = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const [selectedCats, setSelectedCats] = useState([]);

  useEffect(() => {
    if (step === 2) {
      const t = setTimeout(() => setStep(3), 3000);
      return () => clearTimeout(t);
    }
  }, [step]);

  const ProgressBar = () => (
    <div className="flex gap-2 px-6 pt-4 pb-6">
      {[0,1,2,3].map(i => (
        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-brand' : 'bg-slate-200'}`} />
      ))}
    </div>
  );

  if (step === 0) return (
    <div className="flex flex-col h-full bg-white slide-up">
      <ProgressBar />
      <div className="flex-1 px-6">
        <h1 className="text-slate-800 text-[28px] font-bold mb-1">Create Account</h1>
        <p className="text-slate-400 text-sm font-medium mb-8">Let's get you started with Substract.</p>
        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Full Name</label>
            <div className="flex items-center gap-3 border border-slate-200 rounded-2xl px-4 py-3.5">
              <User size={18} className="text-slate-400" />
              <input className="flex-1 text-sm font-medium text-slate-800 placeholder-slate-300 bg-transparent border-none" placeholder="Rahul Sharma" defaultValue="Rahul Sharma" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email Address</label>
            <div className="flex items-center gap-3 border border-slate-200 rounded-2xl px-4 py-3.5">
              <Mail size={18} className="text-slate-400" />
              <input className="flex-1 text-sm font-medium text-slate-800 placeholder-slate-300 bg-transparent border-none" placeholder="rahul@example.com" defaultValue="rahul@example.com" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Phone Number</label>
            <div className="flex items-center gap-3 border border-slate-200 rounded-2xl px-4 py-3.5">
              <Phone size={18} className="text-slate-400" />
              <input className="flex-1 text-sm font-medium text-slate-800 placeholder-slate-300 bg-transparent border-none" placeholder="+91 98765 43210" defaultValue="+91 98765 43210" />
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 pb-8">
        <button onClick={() => setStep(1)} className="w-full bg-slate-100 text-slate-700 font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-transform">
          Next
        </button>
      </div>
    </div>
  );

  if (step === 1) return (
    <div className="flex flex-col h-full bg-white slide-up">
      <ProgressBar />
      <div className="flex-1 px-6">
        <h1 className="text-slate-800 text-[28px] font-bold mb-1">Connect to Auto-Detect</h1>
        <p className="text-slate-400 text-sm font-medium mb-8">How should we find your subscriptions?</p>
        <div className="flex justify-center mb-10">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-brand/10 pulse-ring"></div>
            <div className="absolute inset-2 rounded-full bg-brand/15 pulse-ring" style={{animationDelay:'0.6s'}}></div>
            <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center z-10">
              <Link2 size={28} className="text-brand" />
            </div>
          </div>
        </div>
        <button onClick={() => setStep(2)} className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-2xl mb-3 text-left active:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center">
            <Mail size={22} className="text-brand" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800 text-sm">Connect Gmail</p>
            <p className="text-xs text-brand font-medium">Recommended Â· Read-only</p>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
        <button className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-2xl mb-6 text-left active:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Landmark size={22} className="text-slate-500" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800 text-sm">Connect Bank Account</p>
            <p className="text-xs text-slate-400 font-medium">Visa, Mastercard, UPI</p>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
        <button onClick={() => setStep(3)} className="w-full text-center text-brand text-sm font-medium">
          I'll add them manually later
        </button>
      </div>
    </div>
  );

  if (step === 2) return (
    <div className="flex flex-col items-center justify-center h-full bg-white fade-in">
      <div className="relative mb-8">
        <div className="w-48 h-28 bg-brand/20 rounded-2xl absolute top-2 left-2" style={{transform:'rotate(-4deg)'}}></div>
        <div className="w-48 h-28 bg-brand/40 rounded-2xl relative z-10 flex flex-col justify-center px-5">
          <div className="w-8 h-6 bg-white/40 rounded mb-3"></div>
          <div className="w-28 h-2 bg-white/50 rounded mb-2"></div>
          <div className="w-20 h-2 bg-white/40 rounded"></div>
        </div>
      </div>
      <div className="w-8 h-8 border-2 border-slate-200 border-t-brand rounded-full spin mb-4"></div>
      <h2 className="text-slate-800 text-xl font-bold mb-1">Parsing through emailâ€¦</h2>
      <p className="text-slate-400 text-sm font-medium">This will only take a moment</p>
    </div>
  );

  const cats = ["Streaming","Health","Gaming","Cloud Storage","Security","Food","Productivity","Education"];
  const toggleCat = (c) => setSelectedCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  return (
    <div className="flex flex-col h-full bg-white slide-up">
      <ProgressBar />
      <div className="flex-1 px-6">
        <h1 className="text-slate-800 text-[28px] font-bold mb-1">Select your focus areas</h1>
        <p className="text-slate-400 text-sm font-medium mb-8">Pick categories you want to track.</p>
        <div className="flex flex-wrap gap-3">
          {cats.map(c => (
            <button key={c} onClick={() => toggleCat(c)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                selectedCats.includes(c) ? 'bg-brand text-white border-brand' : 'bg-white text-slate-600 border-slate-200'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="px-6 pb-8">
        <button onClick={onFinish} className="w-full bg-slate-100 text-slate-700 font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-transform">
          Finish Setup
        </button>
      </div>
    </div>
  );
};

// =========================================
// SCREEN: HOME (Enhanced)
// =========================================
const ScreenHome = ({ subs, groups, onSelectSub, onSelectGroup, onShowSpendInsights, onStartCheckin }) => {
  const totalSpend = subs.reduce((s, x) => s + x.amt, 0);
  const [dismissedInsights, setDismissedInsights] = useState([]);
  const [carouselIdx, setCarouselIdx] = useState(0);

  const visibleInsights = AI_INSIGHTS.filter(ins => !dismissedInsights.includes(ins.id));

  // Auto-rotate carousel
  useEffect(() => {
    if (visibleInsights.length <= 1) return;
    const t = setInterval(() => {
      setCarouselIdx(prev => (prev + 1) % visibleInsights.length);
    }, 4000);
    return () => clearInterval(t);
  }, [visibleInsights.length]);

  // Fix index if items removed
  useEffect(() => {
    if (carouselIdx >= visibleInsights.length && visibleInsights.length > 0) {
      setCarouselIdx(0);
    }
  }, [dismissedInsights]);

  const handleDismiss = (insId) => {
    setDismissedInsights(prev => [...prev, insId]);
  };

  const handleTakeAction = (ins) => {
    const sub = subs.find(s => s.id === ins.subId);
    if (sub) onSelectSub(sub);
    setDismissedInsights(prev => [...prev, ins.id]);
  };

  const upcomingSubs = [...subs].filter(s => s.days <= 7).sort((a, b) => a.days - b.days);

  return (
    <div className="flex flex-col h-full bg-white">
      <Header />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-5">

        {/* CHECK-IN TRIGGER */}
        <button onClick={onStartCheckin} className="w-full bg-slate-800 text-white rounded-2xl p-4 mb-2 mt-2 flex items-center justify-between active:scale-[0.98] transition-transform shadow-lg shadow-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
              <CalendarCheck size={20} className="text-brand" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Monthly Check-in Ready!</p>
              <p className="text-xs text-slate-300">Review your {subs.length} subs</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        {/* â”€â”€ AI Insight Carousel â”€â”€ */}
        {visibleInsights.length > 0 && (() => {
          const ins = visibleInsights[carouselIdx % visibleInsights.length];
          if (!ins) return null;
          return (
            <div key={ins.id} className="bg-brand rounded-2xl p-5 mb-5 mt-3 fade-in">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-white/80" />
                  <span className="text-[11px] text-white/80 font-bold uppercase tracking-wider">AI Insight</span>
                </div>
                <span className="text-[10px] text-white/50 font-bold">{(carouselIdx % visibleInsights.length) + 1}/{visibleInsights.length}</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{ins.title}</h3>
              <p className="text-white/70 text-sm mb-4">{ins.desc} Save ₹{ins.save.toFixed(0)}/mo.</p>
              <div className="flex gap-3">
                <button onClick={() => handleTakeAction(ins)}
                  className="flex-1 bg-white text-brand font-bold py-3 rounded-xl text-sm active:scale-[0.98] transition-transform">
                  Take Action
                </button>
                <button onClick={() => handleDismiss(ins.id)}
                  className="flex-1 bg-white/20 text-white font-bold py-3 rounded-xl text-sm active:scale-[0.98] transition-transform">
                  Dismiss
                </button>
              </div>
              {/* Dots */}
              {visibleInsights.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {visibleInsights.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === (carouselIdx % visibleInsights.length) ? 'w-4 bg-white' : 'w-1.5 bg-white/30'
                    }`} />
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* â”€â”€ Stat Cards â”€â”€ */}
        <div className="flex gap-3 mb-6">
          <button onClick={onShowSpendInsights} className="flex-1 bg-slate-50 rounded-2xl p-4 text-left active:bg-slate-100 transition-colors">
            <p className="text-[11px] text-brand font-bold uppercase tracking-wider mb-1">Monthly Spend</p>
            <p className="text-2xl font-black text-slate-800">₹{totalSpend.toFixed(0)}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={12} className="text-brand" />
              <span className="text-xs text-brand font-semibold">+12% vs last month</span>
            </div>
          </button>
          <div className="flex-1 bg-slate-50 rounded-2xl p-4">
            <p className="text-[11px] text-brand font-bold uppercase tracking-wider mb-1">Active Subs</p>
            <p className="text-2xl font-black text-slate-800">{subs.length}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDown size={12} className="text-red-500" />
              <span className="text-xs text-red-500 font-semibold">1 flagged unused</span>
            </div>
          </div>
        </div>

        {/* â”€â”€ Active Subscriptions â”€â”€ */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Subscriptions</h3>
          <span className="text-xs font-semibold text-brand">See All</span>
        </div>
        <div className="space-y-0 mb-6">
          {subs.slice(0, 4).map(sub => (
            <button key={sub.id} onClick={() => onSelectSub(sub)}
              className="w-full flex items-center gap-4 py-4 border-b border-slate-100 text-left active:bg-slate-50 transition-colors">
              <LetterAvatar name={sub.name} color={sub.color} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800 text-sm truncate">{sub.name}</p>
                  {sub.aiTip && <Sparkles size={14} className="text-brand" />}
                </div>
                <p className="text-xs text-slate-400 font-medium">Due {sub.due}</p>
              </div>
              <p className="font-bold text-slate-800 text-sm">-₹{sub.amt.toFixed(0)}</p>
            </button>
          ))}
        </div>

        {/* â”€â”€ Group Subscriptions â”€â”€ */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Group Subscriptions</h3>
        </div>
        <div className="space-y-3 mb-6">
          {groups.map(g => (
            <button key={g.id} onClick={() => onSelectGroup(g)}
              className="w-full border border-slate-200 rounded-2xl p-4 text-left active:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-slate-800 text-sm">{g.name}</p>
                <div className="flex -space-x-2">
                  {g.colors.map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{background: c}} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium">{g.members} members Â· ₹{g.perPerson.toFixed(0)}/person</p>
                <p className="font-bold text-slate-700 text-sm">₹{g.total.toFixed(0)}</p>
              </div>
            </button>
          ))}
        </div>

        {/* â”€â”€ Coming Up â”€â”€ */}
        {upcomingSubs.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Coming Up</h3>
            </div>
            <div className="space-y-0 mb-6">
              {upcomingSubs.map(sub => (
                <button key={sub.id} onClick={() => onSelectSub(sub)}
                  className="w-full flex items-center gap-4 py-3.5 border-b border-slate-100 text-left active:bg-slate-50 transition-colors">
                  <LetterAvatar name={sub.name} color={sub.color} size={38} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{sub.name} {sub.plan}</p>
                    <p className="text-xs text-amber-600 font-semibold">{sub.due}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-amber-500" />
                    <p className="font-bold text-slate-800 text-sm">₹{sub.amt.toFixed(0)}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

// =========================================
// SCREEN: SUBS TAB
// =========================================
const ScreenSubs = ({ subs, cancelledSubs = [], onSelectSub }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const filters = ['All', 'Ending Soon', 'Entertainment', 'Productivity'];

  const filtered = subs.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'Ending Soon') return s.days <= 7;
    if (filter === 'Entertainment') return s.cat === 'Entertainment';
    if (filter === 'Productivity') return s.cat === 'Productivity';
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <Header />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-5">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Subscriptions</h1>
        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 mb-4">
          <Search size={16} className="text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none text-slate-800 placeholder-slate-400 font-medium"
            placeholder="Search subscriptions..." />
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                filter === f ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className="space-y-0">
          {filtered.map(sub => (
            <button key={sub.id} onClick={() => onSelectSub(sub)}
              className="w-full flex items-center gap-4 py-4 border-b border-slate-100 text-left active:bg-slate-50 transition-colors">
              <LetterAvatar name={sub.name} color={sub.color} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800 text-sm">{sub.name}</p>
                  {sub.aiTip && <Sparkles size={14} className="text-brand" />}
                  {sub.remindCancel && <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">Cancel pending</span>}
                </div>
                <p className="text-xs text-slate-400 font-medium">Due {sub.due}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800 text-sm">₹{sub.amt.toFixed(0)}</p>
                <p className="text-[10px] text-slate-400 font-medium">/mo</p>
              </div>
            </button>
          ))}
        </div>

        {/* Cancelled Archive */}
        {cancelledSubs.length > 0 && (
          <>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-8 mb-3 flex items-center gap-2">
              <Archive size={12} /> Cancelled ({cancelledSubs.length})
            </p>
            <div className="space-y-0">
              {cancelledSubs.map(sub => (
                <div key={sub.id} className="flex items-center gap-4 py-4 border-b border-slate-100 opacity-50">
                  <LetterAvatar name={sub.name} color="#94a3b8" size={44} />
                  <div className="flex-1">
                    <p className="font-bold text-slate-500 text-sm line-through">{sub.name}</p>
                    <p className="text-xs text-slate-400 font-medium">Cancelled {sub.cancelledDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-400 text-sm line-through">₹{sub.amt.toFixed(0)}</p>
                    <p className="text-[10px] text-brand font-bold">Saved!</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// =========================================
// SCREEN: CIRCLES (clickable groups)
// =========================================
const ScreenCircles = ({ groups, onSelectGroup, onCreateGroup }) => (
  <div className="flex flex-col h-full bg-white">
    <Header />
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-5">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Circles</h1>
      <div className="flex items-center gap-3 bg-brand/5 border border-brand/20 rounded-2xl p-4 mb-5">
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-brand" />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">Combine Spotify plans</p>
          <p className="text-xs text-slate-400 font-medium">Switch to Family Plan to save ₹50/mo per person.</p>
        </div>
      </div>
      {groups.map(g => (
        <button key={g.id} onClick={() => onSelectGroup(g)}
          className="w-full border border-slate-200 rounded-2xl p-5 mb-3 text-left active:bg-slate-50 transition-colors relative overflow-hidden">
          {g.isOwner && (
            <div className="absolute top-0 right-0 bg-brand text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
              Owner
            </div>
          )}
          <div className="flex items-center justify-between mb-1 mt-1">
            <p className="font-bold text-slate-800">{g.name}</p>
            <div className="flex -space-x-2">
              {g.colors.map((c, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white" style={{background: c}} />
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-3">{g.members} members Â· ₹{g.perPerson.toFixed(0)}/person</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total</span>
            <span className="font-bold text-slate-800">₹{g.total.toFixed(0)}</span>
          </div>
        </button>
      ))}
      <button onClick={onCreateGroup} className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center gap-2 text-slate-400 active:bg-slate-50 transition-colors mt-2">
        <Plus size={24} />
        <span className="text-sm font-semibold">+ Create New Circle</span>
      </button>
    </div>
  </div>
);

// =========================================
// SCREEN: AI AGENT (with Voice + Agentic Actions)
// =========================================
const ScreenAgent = ({ subs, onAction }) => {
  const [messages, setMessages] = useState([
    { from:'ai', text:"Hi Rahul! I'm your financial concierge. How can I help you optimize your spending today?" }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // action about to execute
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, pendingAction]);

  // Execute pending action after showing indicator
  useEffect(() => {
    if (!pendingAction) return;
    const timer = setTimeout(() => {
      onAction(pendingAction);
      setPendingAction(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [pendingAction, onAction]);

  // Text-to-Speech helper
  const speakText = useCallback((text, idx) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) 
      || voices.find(v => v.lang.startsWith('en-'));
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setSpeakingIdx(idx);
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeakingIdx(null);
  }, []);

  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return;

    const newMessages = [...messages, { from: 'user', text }];
    setMessages(newMessages);
    setInputVal('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await response.json();
      if (data.text) {
        const aiMsg = { from: 'ai', text: data.text, action: data.action || null };
        setMessages(prev => {
          const updated = [...prev, aiMsg];
          if (voiceMode) {
            setTimeout(() => speakText(data.text, updated.length - 1), 200);
          }
          return updated;
        });
        // If there's an action, queue it for execution
        if (data.action) {
          setTimeout(() => setPendingAction(data.action), 800);
        }
      } else {
        setMessages(prev => [...prev, { from: 'ai', text: "Error: " + (data.error || "Failed to reach AI.") }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { from: 'ai', text: "Network error. Make sure the server is running with: python server.py" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Speech Recognition (STT)
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setInputVal(transcript);
      // If final result, auto-send
      if (event.results[0].isFinal) {
        setIsRecording(false);
        if (transcript.trim()) {
          setTimeout(() => handleSend(transcript.trim()), 300);
        }
      }
    };
    recognition.onerror = (e) => {
      console.error('Speech error:', e.error);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  }, [isRecording, handleSend]);

  const quickPrompts = [
    "Summarize my streaming spend",
    "Find duplicate subscriptions",
    "Cancel unused subs",
    "Any discounts available?"
  ];

  return (
    <div className="flex flex-col h-full bg-white relative">
      <Header />
      <div className="flex items-center justify-between px-5 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">AI Agent</h1>
          <p className="text-xs text-brand font-medium">Your financial concierge</p>
        </div>
        {/* Voice Mode Toggle */}
        <button onClick={() => { setVoiceMode(v => !v); if (voiceMode) stopSpeaking(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            voiceMode 
              ? 'bg-brand text-white' 
              : 'bg-slate-100 text-slate-500'
          }`}>
          <Volume2 size={14} />
          {voiceMode ? 'Voice On' : 'Voice Off'}
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-44 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 mt-4 ${m.from === 'user' ? 'justify-end' : ''}`}>
            {m.from === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0 mt-1">
                <Sparkles size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[75%] text-sm leading-relaxed font-medium ${
              m.from === 'ai'
                ? 'bg-slate-50 text-slate-800 rounded-tl-[4px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'
                : 'bg-brand text-white rounded-tl-2xl rounded-tr-[4px] rounded-br-2xl rounded-bl-2xl'
            }`}>
              <div className="p-4 pb-2">{m.text}</div>
              {/* Action badge on AI messages that triggered actions */}
              {m.from === 'ai' && m.action && (
                <div className="px-4 pb-2">
                  <div className="inline-flex items-center gap-1.5 bg-brand/10 text-brand px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <Zap size={10} />
                    {m.action.type === 'cancel' && `Cancelling ${m.action.sub}`}
                    {m.action.type === 'create_group' && `Splitting ${m.action.sub}`}
                    {m.action.type === 'snooze' && `Snoozing ${m.action.sub}`}
                    {m.action.type === 'archive' && `Archiving ${m.action.sub}`}
                    {m.action.type === 'show_insights' && 'Opening Insights'}
                    {m.action.type === 'start_checkin' && 'Starting Check-in'}
                    {m.action.type === 'open_detail' && `Opening ${m.action.sub}`}
                  </div>
                </div>
              )}
              {/* Speaker button on AI messages */}
              {m.from === 'ai' && i > 0 && (
                <div className="px-4 pb-2 flex justify-end">
                  <button onClick={() => speakingIdx === i ? stopSpeaking() : speakText(m.text, i)}
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      speakingIdx === i ? 'text-brand' : 'text-slate-400 hover:text-slate-600'
                    }`}>
                    {speakingIdx === i ? (
                      <><Square size={10} /> Stop</>
                    ) : (
                      <><Volume2 size={12} /> Listen</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0 mt-1">
              <Sparkles size={14} className="text-white animate-pulse" />
            </div>
            <div className="bg-slate-50 text-slate-500 rounded-tl-[4px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-4 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
            </div>
          </div>
        )}
        {/* Pending Action Indicator */}
        {pendingAction && (
          <div className="flex gap-3 mt-4 items-center">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0 animate-pulse">
              <Zap size={14} className="text-white" />
            </div>
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm font-bold flex items-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full"></span>
              Taking action...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Recording Overlay */}
      {isRecording && (
        <div className="absolute inset-0 z-30 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center"
          onClick={toggleRecording}>
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full bg-brand/20 animate-ping absolute inset-0"></div>
            <div className="w-28 h-28 rounded-full bg-brand/30 flex items-center justify-center relative">
              <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center">
                <Mic size={36} className="text-white" />
              </div>
            </div>
          </div>
          <p className="text-white text-lg font-bold mb-2">Listening...</p>
          <p className="text-white/60 text-sm font-medium mb-1">{inputVal || 'Say something...'}</p>
          <p className="text-white/40 text-xs font-medium mt-6">Tap anywhere to stop</p>
        </div>
      )}

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white">
        {/* Quick Prompts */}
        <div className="px-5 flex gap-2 overflow-x-auto no-scrollbar pb-3">
          {quickPrompts.map((p, i) => (
            <button key={i} onClick={() => handleSend(p)} disabled={isLoading}
              className={`whitespace-nowrap px-4 py-2 text-xs font-bold rounded-full transition-colors ${
                isLoading ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-600 active:bg-slate-200'
              }`}>
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="px-5 pb-[70px]">
          <div className="flex items-center gap-2">
            <button onClick={toggleRecording} disabled={isLoading}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : isLoading 
                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                    : 'bg-slate-50 text-slate-400 active:bg-slate-100'
              }`}>
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <div className="flex-1 bg-slate-50 rounded-full px-4 py-3">
              <input value={inputVal} onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(inputVal)}
                disabled={isLoading || isRecording}
                className="w-full text-sm bg-transparent border-none text-slate-800 placeholder-slate-400 font-medium outline-none disabled:opacity-50"
                placeholder={isRecording ? 'Listening...' : isLoading ? 'Thinking...' : 'Ask your financial concierge...'}
              />
            </div>
            <button onClick={() => handleSend(inputVal)} disabled={isLoading || isRecording}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 transition-all ${
                isLoading || isRecording ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand active:scale-95'
              }`}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================
// SUBSCRIPTION DETAIL & EDIT OVERLAY (FLOW 5)
// =========================================
const SubDetail = ({ sub, onClose, onSnooze, onStartCancel, onArchive, onMoveToGroup, onSaveEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ amt: sub.amt, plan: sub.plan });
  const [showCommitment, setShowCommitment] = useState(false);
  const [commitMonths, setCommitMonths] = useState(3);

  let valueSignal = "MEDIUM";
  let valueReason = "Normal consistent usage.";
  if (sub.usage === 0 || sub.inactive) { valueSignal = "LOW"; valueReason = "You have not used the service in 45 days."; }
  else if (sub.aiTip) { valueSignal = "MEDIUM"; valueReason = "A cheaper promotional plan is available."; }
  else if (sub.cat === 'Entertainment' && sub.amt < 10) { valueSignal = "HIGH"; valueReason = "Excellent value ratio based on usage."; }
  else if (sub.days < 10) { valueSignal = "HIGH"; valueReason = "Highly active usage this month."; }

  if (showCommitment) {
    return (
      <div className="absolute inset-0 z-50 bg-white slide-up-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <button onClick={() => setShowCommitment(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <h2 className="font-bold text-slate-800">Set Commitment</h2>
          <div className="w-10"></div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <CalendarCheck size={36} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">Review Date</h3>
          <p className="text-slate-500 text-center text-sm font-medium mb-10 max-w-[280px]">When do you want to re-evalute your commitment to {sub.name}?</p>
          
          <div className="flex items-center gap-6 mb-10">
            <button onClick={() => setCommitMonths(Math.max(1, commitMonths-1))} className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center active:scale-95 text-slate-600 font-bold active:bg-slate-50">-</button>
            <div className="text-center w-20">
               <p className="text-4xl font-black text-brand">{commitMonths}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{commitMonths === 1 ? 'Month' : 'Months'}</p>
            </div>
            <button onClick={() => setCommitMonths(commitMonths+1)} className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center active:scale-95 text-slate-600 font-bold active:bg-slate-50">+</button>
          </div>
        </div>
        <div className="px-5 pb-5 w-full">
          <button onClick={() => { onSnooze(sub.id); setShowCommitment(false); onClose(); }} className="w-full bg-brand text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <Bell size={16} /> Schedule Reminder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[45] bg-white slide-up-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <span className="font-bold text-slate-800 text-sm">Control Center</span>
        <button onClick={() => isEditing ? onSaveEdit(sub.id, editForm) && setIsEditing(false) : setIsEditing(true)} className="text-brand font-bold text-sm">
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* AI Banner */}
        <div className={`mx-5 mt-2 rounded-2xl px-5 py-4 ${valueSignal === 'LOW' ? 'bg-red-50' : valueSignal === 'HIGH' ? 'bg-brand/10' : 'bg-amber-50'}`}>
          <div className={`flex items-center gap-2 mb-1 ${valueSignal === 'LOW' ? 'text-red-600' : valueSignal === 'HIGH' ? 'text-brand' : 'text-amber-600'}`}>
            <Sparkles size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{valueSignal} VALUE SIGNAL</span>
          </div>
          <p className={`text-sm font-medium ${valueSignal === 'LOW' ? 'text-red-800' : valueSignal === 'HIGH' ? 'text-slate-800' : 'text-amber-800'}`}>
            This subscription is {valueSignal} value because {valueReason.toLowerCase()}
          </p>
        </div>

        {/* Info */}
        <div className="flex flex-col items-center py-8">
          <LetterAvatar name={sub.name} color={sub.color} size={72} />
          <h1 className="text-2xl font-black text-slate-800 mt-4">{sub.name}</h1>
          
          {isEditing ? (
             <div className="flex items-center gap-2 mt-4 max-w-[200px] w-full">
               <span className="text-2xl font-black text-slate-400">$</span>
               <input value={editForm.amt} onChange={e => setEditForm({...editForm, amt: parseFloat(e.target.value)||0})} className="flex-1 text-3xl font-black text-slate-800 text-center outline-none border-b-2 border-brand pb-1 bg-transparent" type="number" />
               <span className="text-sm font-bold text-slate-400">/mo</span>
             </div>
          ) : (
             <>
               <p className="text-sm font-bold text-slate-400 mt-1">{sub.plan}</p>
               <p className="text-4xl font-black text-slate-800 mt-3">₹{sub.amt.toFixed(0)}<span className="text-base text-slate-400 font-bold">/mo</span></p>
             </>
          )}
        </div>

        {/* 5 Actions */}
        <div className="px-5">
           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Subscription Actions</p>
           
           <div className="grid grid-cols-2 gap-3 mb-3">
             <button onClick={() => onMoveToGroup(sub)} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-start gap-3 active:bg-slate-100 transition-colors">
               <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center"><Users size={18}/></div>
               <div className="text-left">
                 <p className="font-bold text-slate-800 text-sm">Move to Group</p>
                 <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Split cost</p>
               </div>
             </button>

             <button onClick={() => setShowCommitment(true)} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-start gap-3 active:bg-slate-100 transition-colors">
               <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center"><CalendarCheck size={18}/></div>
               <div className="text-left">
                 <p className="font-bold text-slate-800 text-sm">Set Commitment</p>
                 <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{sub.snoozed ? 'Snoozed' : 'Calendar Routine'}</p>
               </div>
             </button>
           </div>

           <button onClick={() => onStartCancel(sub)} className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-2xl mb-3 active:bg-red-100 transition-colors text-left">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0"><X size={18}/></div>
               <div>
                 <p className="font-bold text-slate-800 text-sm">Cancel Subscription</p>
                 <p className="text-xs text-slate-500 font-medium">Have AI handle the cancellation</p>
               </div>
             </div>
             <ChevronRight size={16} className="text-slate-300" />
           </button>

           <button onClick={() => onArchive(sub.id)} className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl active:bg-slate-100 transition-colors text-left">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0"><Archive size={18}/></div>
               <div>
                 <p className="font-bold text-slate-800 text-sm">Archive</p>
                 <p className="text-xs text-slate-500 font-medium">Hide from active list</p>
               </div>
             </div>
             <ChevronRight size={16} className="text-slate-300" />
           </button>
        </div>
      </div>
    </div>
  );
};

// =========================================
// CANCELLATION FLOW
// =========================================
const CancellationFlow = ({ sub, onClose, onConfirmCancel, onRemindMe }) => {
  const [step, setStep] = useState(0);
  // 0=confirm intent, 1=AI assess method, 2=method detail, 3=mark done, 4=cancelled?, 5=final
  const [markedDone, setMarkedDone] = useState(false);
  const [cancelled, setCancelled] = useState(null); // null=not answered, true/false
  const [showSavings, setShowSavings] = useState(false);

  const cancelInfo = CANCEL_METHODS[sub.name] || { method:'website', url:'#', features:['Premium features','Ad-free experience','Priority support'] };
  const yearlySavings = (sub.amt * 12).toFixed(0);

  // Step 0: Confirm Intent
  if (step === 0) return (
    <div className="absolute inset-0 z-[60] bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <X size={18} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">Cancel {sub.name}</h2>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28">
        <div className="flex flex-col items-center py-6">
          <LetterAvatar name={sub.name} color={sub.color} size={56} />
          <h3 className="text-lg font-bold text-slate-800 mt-3">{sub.name} {sub.plan}</h3>
          <p className="text-2xl font-black text-slate-800 mt-1">₹{sub.amt.toFixed(0)}/mo</p>
        </div>

        {/* What you'll lose */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5">
          <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-3">What you'll lose</p>
          <div className="space-y-3">
            {cancelInfo.features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <X size={14} className="text-red-400 shrink-0" />
                <span className="text-sm text-slate-700 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Savings */}
        <div className="bg-brand/5 border border-brand/20 rounded-2xl p-5">
          <p className="text-[11px] font-bold text-brand uppercase tracking-wider mb-2">Potential Savings</p>
          <p className="text-2xl font-black text-brand">₹{yearlySavings}<span className="text-sm font-bold text-brand/60">/year</span></p>
          <p className="text-xs text-slate-400 font-medium mt-1">That's ₹{sub.amt.toFixed(0)} Ã— 12 months</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 space-y-3">
        <button onClick={() => setStep(1)}
          className="w-full bg-red-500 text-white font-bold text-sm py-4 rounded-2xl active:scale-[0.98] transition-transform">
          Yes, I want to cancel
        </button>
        <button onClick={onClose}
          className="w-full bg-slate-100 text-slate-600 font-bold text-sm py-4 rounded-2xl active:scale-[0.98] transition-transform">
          Keep subscription
        </button>
      </div>
    </div>
  );

  // Step 1: AI assesses cancellation method
  if (step === 1) return (
    <div className="absolute inset-0 z-[60] bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={() => setStep(0)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">Cancellation Method</h2>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
        {/* AI assessment banner */}
        <div className="bg-brand rounded-2xl p-5 mb-6 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-white/80" />
            <span className="text-[11px] text-white/80 font-bold uppercase tracking-wider">AI Assessment</span>
          </div>
          <p className="text-white font-bold text-base mb-1">Best way to cancel {sub.name}:</p>
          <p className="text-white/70 text-sm">
            {cancelInfo.method === 'inapp' && 'Cancel directly in the app â€” we\'ll guide you step by step.'}
            {cancelInfo.method === 'website' && 'Cancel through their website â€” we have the direct link.'}
            {cancelInfo.method === 'phone' && 'This requires a phone call â€” we\'ll prep you with a script.'}
          </p>
        </div>

        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Available Methods</p>
        <div className="space-y-3">
          {/* In App */}
          <button onClick={() => setStep(cancelInfo.method === 'inapp' ? 2 : 2)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              cancelInfo.method === 'inapp' ? 'border-brand bg-brand/5' : 'border-slate-200'
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cancelInfo.method === 'inapp' ? 'bg-brand/10' : 'bg-slate-100'}`}>
              <Zap size={18} className={cancelInfo.method === 'inapp' ? 'text-brand' : 'text-slate-400'} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-slate-800 text-sm">In App</p>
              <p className="text-xs text-slate-400">Guided step-by-step flow</p>
            </div>
            {cancelInfo.method === 'inapp' && <span className="text-[10px] bg-brand text-white font-bold px-2 py-1 rounded-full">Recommended</span>}
            <ChevronRight size={16} className="text-slate-300" />
          </button>

          {/* Website */}
          <button onClick={() => setStep(cancelInfo.method === 'website' ? 2 : 2)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              cancelInfo.method === 'website' ? 'border-brand bg-brand/5' : 'border-slate-200'
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cancelInfo.method === 'website' ? 'bg-brand/10' : 'bg-slate-100'}`}>
              <ExternalLink size={18} className={cancelInfo.method === 'website' ? 'text-brand' : 'text-slate-400'} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-slate-800 text-sm">Website</p>
              <p className="text-xs text-slate-400">Direct link to cancellation</p>
            </div>
            {cancelInfo.method === 'website' && <span className="text-[10px] bg-brand text-white font-bold px-2 py-1 rounded-full">Recommended</span>}
            <ChevronRight size={16} className="text-slate-300" />
          </button>

          {/* Phone */}
          <button onClick={() => setStep(cancelInfo.method === 'phone' ? 2 : 2)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              cancelInfo.method === 'phone' ? 'border-brand bg-brand/5' : 'border-slate-200'
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cancelInfo.method === 'phone' ? 'bg-brand/10' : 'bg-slate-100'}`}>
              <PhoneCall size={18} className={cancelInfo.method === 'phone' ? 'text-brand' : 'text-slate-400'} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-slate-800 text-sm">Phone Call</p>
              <p className="text-xs text-slate-400">Call customer support</p>
            </div>
            {cancelInfo.method === 'phone' && <span className="text-[10px] bg-brand text-white font-bold px-2 py-1 rounded-full">Recommended</span>}
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );

  // Step 2: Method detail
  if (step === 2) return (
    <div className="absolute inset-0 z-[60] bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={() => setStep(1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">
          {cancelInfo.method === 'inapp' && 'In-App Guide'}
          {cancelInfo.method === 'website' && 'Website Cancellation'}
          {cancelInfo.method === 'phone' && 'Phone Cancellation'}
        </h2>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28">

        {/* IN APP flow */}
        {cancelInfo.method === 'inapp' && (
          <>
            <p className="text-slate-400 text-sm font-medium mb-5 mt-2">Follow these steps to cancel:</p>
            <div className="space-y-4">
              {(cancelInfo.steps || []).map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0 text-sm font-bold text-brand">{i + 1}</div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-medium text-slate-800">{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* WEBSITE flow */}
        {cancelInfo.method === 'website' && (
          <>
            <p className="text-slate-400 text-sm font-medium mb-5 mt-2">We found the direct cancellation page for you.</p>
            <div className="bg-slate-50 rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <ExternalLink size={18} className="text-brand" />
                <p className="text-sm font-bold text-slate-800">Direct Cancellation Link</p>
              </div>
              <p className="text-xs text-brand font-medium mb-4 break-all">{cancelInfo.url}</p>
              <button className="w-full bg-brand text-white font-bold text-sm py-3 rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <ExternalLink size={14} /> Open in Browser
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">Tip</p>
              <p className="text-xs text-amber-700 font-medium">After cancelling on the website, come back here and mark it as done.</p>
            </div>
          </>
        )}

        {/* PHONE flow */}
        {cancelInfo.method === 'phone' && (
          <>
            <p className="text-slate-400 text-sm font-medium mb-5 mt-2">You'll need to call customer support for this one.</p>
            <div className="bg-slate-50 rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-3 mb-2">
                <PhoneCall size={18} className="text-brand" />
                <p className="text-sm font-bold text-slate-800">Customer Support</p>
              </div>
              <p className="text-2xl font-black text-brand mb-3">{cancelInfo.number}</p>
              <button className="w-full bg-brand text-white font-bold text-sm py-3 rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <PhoneCall size={14} /> Call Now
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <FileText size={18} className="text-brand" />
                <p className="text-sm font-bold text-slate-800">Suggested Script</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-700 font-medium italic leading-relaxed">"{cancelInfo.script}"</p>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-3">ðŸ’¡ Be calm and direct. State your intent clearly.</p>
            </div>
          </>
        )}

      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100">
        <button onClick={() => setStep(3)}
          className="w-full bg-brand text-white font-bold text-sm py-4 rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
          <CheckCircle2 size={16} /> Mark as Done
        </button>
      </div>
    </div>
  );

  // Step 3: Cancelled?
  if (step === 3) return (
    <div className="absolute inset-0 z-[60] bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={() => setStep(2)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">Verify Cancellation</h2>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 px-5">
        <div className="flex flex-col items-center py-10">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertCircle size={28} className="text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Were you able to cancel?</h3>
          <p className="text-sm text-slate-400 font-medium text-center">Did you successfully complete the cancellation for {sub.name}?</p>
        </div>

        <div className="space-y-3">
          <button onClick={() => { setCancelled(true); setStep(4); }}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border border-brand bg-brand/5 active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-brand" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-slate-800 text-sm">Yes, it's cancelled</p>
              <p className="text-xs text-slate-400">Archive it with today's date</p>
            </div>
          </button>

          <button onClick={() => { setCancelled(false); setStep(4); }}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border border-slate-200 active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-slate-800 text-sm">Not yet</p>
              <p className="text-xs text-slate-400">Remind me before next billing</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Step 4: Final confirmation
  if (step === 4) return (
    <div className="absolute inset-0 z-[60] bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="w-10"></div>
        <h2 className="font-bold text-slate-800">{cancelled ? 'Cancelled!' : 'Reminder Set'}</h2>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        {cancelled ? (
          <>
            <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mb-5 scale-in">
              <CheckCircle2 size={36} className="text-brand" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Successfully Cancelled</h3>
            <p className="text-sm text-slate-400 font-medium text-center mb-6">{sub.name} {sub.plan} has been archived.</p>

            <div className="w-full bg-brand/5 border border-brand/20 rounded-2xl p-5 mb-5">
              <p className="text-[11px] font-bold text-brand uppercase tracking-wider mb-2">Your Savings</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Monthly</span>
                <span className="text-lg font-black text-brand">₹{sub.amt.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-slate-600 font-medium">Yearly</span>
                <span className="text-lg font-black text-brand">₹{yearlySavings}</span>
              </div>
            </div>

            <div className="w-full bg-slate-50 rounded-2xl p-4 flex gap-3">
              <Archive size={18} className="text-slate-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 font-medium">This subscription has been moved to your Cancelled archive. You can view it anytime in the Subs tab.</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-5 scale-in">
              <Bell size={36} className="text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Reminder Set</h3>
            <p className="text-sm text-slate-400 font-medium text-center mb-6">We'll remind you to cancel {sub.name} before your next billing date.</p>

            <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 font-medium">Next billing</span>
                <span className="text-sm font-bold text-slate-800">{sub.due}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Reminder</span>
                <span className="text-sm font-bold text-amber-700">1 day before</span>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="p-5 bg-white border-t border-slate-100">
        <button onClick={() => {
          if (cancelled) {
            onConfirmCancel(sub.id);
          } else {
            onRemindMe(sub.id);
          }
        }} className="w-full bg-brand text-white font-bold text-sm py-4 rounded-2xl active:scale-[0.98] transition-transform">
          Done
        </button>
      </div>
    </div>
  );

  return null;
};

// =========================================
// GROUP DETAILS OVERLAY
// =========================================
// =========================================
// GROUP DETAILS OVERLAY
// =========================================
const GroupDetail = ({ group, onClose }) => {
  const [viewRole, setViewRole] = useState(group.isOwner ? 'owner' : 'member');
  const [markedSettled, setMarkedSettled] = useState(false);
  const [nudged, setNudged] = useState({});
  const [paidOwner, setPaidOwner] = useState(false);

  const isOwner = viewRole === 'owner';
  const handleToggleRole = () => setViewRole(r => r === 'owner' ? 'member' : 'owner');
  const handleNudge = (name) => setNudged(prev => ({...prev, [name]: true}));

  return (
    <div className="absolute inset-0 z-50 bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">Group Details</h2>
        <button onClick={handleToggleRole} className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center relative">
          <Eye size={18} className="text-brand" />
          <span className="absolute -top-1 -right-1 bg-brand text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase shadow-sm border border-white">
            {isOwner ? 'OWN' : 'MEM'}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-24">
        {/* Group header */}
        <div className="flex flex-col items-center py-6">
          <div className="flex -space-x-3 mb-4">
            {group.colors.map((c, i) => (
              <div key={i} className="w-12 h-12 rounded-full border-3 border-white flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{background: c}}>
                {group.memberNames[i] ? group.memberNames[i][0] : ''}
              </div>
            ))}
          </div>
          <h1 className="text-xl font-bold text-slate-800">{group.name}</h1>
          <p className="text-sm text-slate-400 font-medium">{group.subName} Â· {group.plan}</p>
          <p className="text-3xl font-black text-slate-800 mt-2">₹{group.total.toFixed(0)}<span className="text-sm text-slate-400 font-bold">/mo</span></p>
        </div>

        {/* Split breakdown */}
        <div className="bg-slate-50 rounded-2xl p-5 mb-5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Cost Split</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Per person</span>
            <span className="text-sm font-bold text-slate-800">₹{group.perPerson.toFixed(0)}/mo</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Total members</span>
            <span className="text-sm font-bold text-slate-800">{group.members}</span>
          </div>
        </div>

        {isOwner ? (
          <>
            {/* Owner Consolidate View */}
            <div className="flex items-center justify-between mb-3 mt-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</p>
              {markedSettled && <span className="text-[9px] bg-brand text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Cycle Settled</span>}
            </div>
            
            <div className="space-y-0 mb-5">
              {group.balances.map((b, i) => (
                <div key={i} className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{background: group.colors[i+1] || '#64748b'}}>
                      {b.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{b.name}</p>
                      <p className={`text-xs font-medium ${b.paid || markedSettled ? 'text-brand' : 'text-amber-600'}`}>
                        {b.paid || markedSettled ? 'Paid' : `Owes ₹${b.owed.toFixed(0)}`}
                      </p>
                    </div>
                  </div>
                  {b.paid || markedSettled ? (
                    <div className="flex items-center text-brand font-bold text-xs gap-1"><CheckCircle2 size={16}/> Settled</div>
                  ) : (
                    <button onClick={() => handleNudge(b.name)} disabled={nudged[b.name]}
                      className={`text-xs font-bold px-3.5 py-2 rounded-full active:scale-95 transition-all ${nudged[b.name] ? 'bg-slate-100 text-slate-400' : 'bg-brand/10 text-brand'}`}>
                      {nudged[b.name] ? 'Pinged' : 'Nudge'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Next billing */}
            <div className="bg-slate-50 rounded-2xl p-5 mb-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Next Billing Cycle</p>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-brand flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white"></div></div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{group.nextDue}</p>
                  <p className="text-xs text-slate-400">Auto-renew enabled</p>
                </div>
                <p className="font-bold text-slate-800">₹{group.total.toFixed(0)}</p>
              </div>
            </div>

            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Owner Actions</p>
            <div className="space-y-3">
              {!markedSettled && (
                 <button onClick={() => setMarkedSettled(true)} className="w-full bg-brand/10 text-brand font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                   <CheckCircle2 size={16} /> Mark Cycle Settled
                 </button>
              )}
              <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-2xl active:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-slate-600" />
                  <span className="font-bold text-slate-800 text-sm">Manage Members</span>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
              <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-2xl bg-red-50/30 active:bg-red-50 transition-colors">
                <div className="flex items-center gap-3">
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="font-bold text-red-600 text-sm">Discontinue Service</span>
                </div>
                <ChevronRight size={16} className="text-red-400" />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Non-Owner Payment Request View */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-6 flex flex-col items-center">
               <AlertCircle size={32} className="text-amber-500 mb-3" />
               <h3 className="text-lg font-bold text-slate-800 mb-1">Payment Request</h3>
               <p className="text-sm text-slate-500 text-center mb-4">
                 It's time for the {group.subName} renewal! Send your share to {group.ownerName || 'the owner'}.
               </p>
               <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-100 mb-5 text-center">
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">You Owe</p>
                 <p className="text-3xl font-black text-slate-800">₹{group.perPerson.toFixed(0)}</p>
               </div>

               <button onClick={() => setPaidOwner(true)} disabled={paidOwner}
                 className={`w-full font-bold text-sm py-4 rounded-2xl transition-all flex items-center justify-center gap-2 ${paidOwner ? 'bg-brand text-white scale-100' : 'bg-brand/10 text-brand active:scale-[0.98]'}`}>
                 {paidOwner ? <><CheckCircle2 size={16} /> Payment Recorded</> : 'Pay via App'}
               </button>
               {!paidOwner && (
                 <button onClick={() => setPaidOwner(true)} className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider underline active:text-slate-600">
                   Mark as paid externally
                 </button>
               )}
            </div>

            {/* Next billing */}
            <div className="bg-slate-50 rounded-2xl p-5 mt-6 mb-5 border border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Group Schedule</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center"><CalendarCheck size={16} className="text-slate-400"/></div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">Next Renewal</p>
                  <p className="text-xs text-slate-400">{group.nextDue}</p>
                </div>
              </div>
            </div>
            
            <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-2xl mt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center"><X size={14} className="text-red-500"/></div>
                <div className="text-left">
                  <p className="font-bold text-red-600 text-sm">Leave Circle</p>
                  <p className="text-xs text-slate-400">Owner will be notified</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// =========================================
// SPEND INSIGHTS OVERLAY
// =========================================
const SpendInsights = ({ subs, onClose }) => {
  const total = subs.reduce((s, x) => s + x.amt, 0);
  const catTotals = {};
  subs.forEach(s => {
    catTotals[s.cat] = (catTotals[s.cat] || 0) + s.amt;
  });
  const catList = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const catColors = { Entertainment:'#ef4444', Productivity:'#3b82f6', Health:'#8b5cf6', 'Cloud Storage':'#10b981' };

  return (
    <div className="absolute inset-0 z-50 bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">Spend Insights</h2>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-12">
        {/* Total */}
        <div className="flex flex-col items-center py-6">
          <p className="text-[11px] font-bold text-brand uppercase tracking-wider mb-1">Total Monthly Spend</p>
          <p className="text-4xl font-black text-slate-800">₹{total.toFixed(0)}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={14} className="text-brand" />
            <span className="text-sm text-brand font-semibold">+12% vs last month</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Category Breakdown</p>

        {/* Visual bar */}
        <div className="flex h-3 rounded-full overflow-hidden mb-5">
          {catList.map(([cat, amt], i) => (
            <div key={cat} style={{width: `${(amt / total * 100)}%`, background: catColors[cat] || '#64748b'}} className="first:rounded-l-full last:rounded-r-full" />
          ))}
        </div>

        {/* Category items */}
        <div className="space-y-0 mb-6">
          {catList.map(([cat, amt]) => (
            <div key={cat} className="flex items-center gap-4 py-3.5 border-b border-slate-100">
              <div className="w-3 h-3 rounded-full shrink-0" style={{background: catColors[cat] || '#64748b'}} />
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">{cat}</p>
                <p className="text-xs text-slate-400 font-medium">{subs.filter(s => s.cat === cat).length} subscriptions</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800 text-sm">₹{amt.toFixed(0)}</p>
                <p className="text-[10px] text-slate-400 font-medium">{(amt / total * 100).toFixed(0)}%</p>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly trend */}
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Monthly Trend</p>
        <div className="bg-slate-50 rounded-2xl p-5 mb-5">
          <div className="flex items-end gap-2 h-24 mb-3">
            {[105, 118, 132, 128, 140, total].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-lg ${i === 5 ? 'bg-brand' : 'bg-slate-200'}`} style={{height: `${(v / 160) * 100}%`}} />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {['Jun','Jul','Aug','Sep','Oct','Nov'].map(m => (
              <span key={m} className="text-[10px] text-slate-400 font-medium flex-1 text-center">{m}</span>
            ))}
          </div>
        </div>

        {/* Savings tip */}
        <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4 flex gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-brand" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-brand uppercase tracking-wider mb-0.5">Potential Savings</p>
            <p className="text-sm text-slate-700 font-medium">Cancel unused subs to save up to <span className="font-bold text-brand">$43.98/mo</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================
// ADD SUBSCRIPTION FLOW
// =========================================
const AddSubscription = ({ onClose, onAdd }) => {
  const [step, setStep] = useState(0); // 0=search, 1=details, 2=billing, 3=commitment, 4=remind, 5=group, 6=confirm
  const [search, setSearch] = useState('');
  const [isManual, setIsManual] = useState(false);
  const [selected, setSelected] = useState(null); // library item
  const [form, setForm] = useState({
    name: '', color: '#10b981', plan: '', amt: '', cat: 'Entertainment',
    cycle: 'monthly', customDays: 30,
    commitment: 6, commitUntilCancel: false,
    remindDays: 3,
    addToGroup: false, existingGroup: true, groupId: null, newGroupName: '',
  });

  const CATS = ['Entertainment','Productivity','Health','Cloud Storage','Education','Food'];
  const CAT_COLORS = { Entertainment:'#ef4444', Productivity:'#3b82f6', Health:'#8b5cf6', 'Cloud Storage':'#10b981', Education:'#f59e0b', Food:'#ec4899' };

  const filteredLib = SUB_LIBRARY.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectFromLib = (item) => {
    setSelected(item);
    setForm(f => ({ ...f, name: item.name, color: item.color, cat: item.cat }));
    setStep(1);
  };

  const selectPlan = (plan) => {
    setForm(f => ({ ...f, plan: plan.label, amt: plan.amt.toString() }));
  };

  const startManual = () => {
    setIsManual(true);
    setSelected(null);
    setStep(1);
  };

  const canProceedStep1 = form.name && form.amt && parseFloat(form.amt) > 0;

  const handleConfirm = () => {
    const newSub = {
      id: Date.now(),
      name: form.name,
      color: form.color,
      plan: form.plan || 'Standard',
      amt: parseFloat(form.amt),
      due: form.cycle === 'weekly' ? 'In 7 days' : form.cycle === 'monthly' ? 'In 30 days' : `In ${form.customDays} days`,
      days: form.cycle === 'weekly' ? 7 : form.cycle === 'monthly' ? 30 : parseInt(form.customDays) || 30,
      cat: form.cat,
    };
    onAdd(newSub);
    onClose();
  };

  const StepBar = () => (
    <div className="flex gap-1.5 px-5 pt-3 pb-4">
      {[0,1,2,3,4,5,6].map(i => (
        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-brand' : 'bg-slate-200'}`} />
      ))}
    </div>
  );

  // â”€â”€ Step 0: Search â”€â”€
  if (step === 0) return (
    <div className="absolute inset-0 z-50 bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <X size={18} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">Add Subscription</h2>
        <div className="w-10"></div>
      </div>
      <StepBar />
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
          <Search size={16} className="text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none text-slate-800 placeholder-slate-400 font-medium"
            placeholder="Search subscription name..." autoFocus />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">{search ? 'Results' : 'Popular Services'}</p>
        <div className="space-y-0">
          {filteredLib.map(item => (
            <button key={item.name} onClick={() => selectFromLib(item)}
              className="w-full flex items-center gap-4 py-3.5 border-b border-slate-100 text-left active:bg-slate-50 transition-colors">
              <LetterAvatar name={item.name} color={item.color} size={40} />
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                <p className="text-xs text-slate-400 font-medium">{item.cat}</p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}
        </div>
        {search && filteredLib.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm mb-4">No results found for "{search}"</p>
          </div>
        )}
        <button onClick={startManual}
          className="w-full mt-4 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-2 text-brand font-semibold text-sm active:bg-slate-50 transition-colors">
          <Plus size={16} /> Add manually
        </button>
      </div>
    </div>
  );

  // â”€â”€ Step 1: Details (plan selection or manual entry) â”€â”€
  if (step === 1) return (
    <div className="absolute inset-0 z-50 bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={() => { setStep(0); setIsManual(false); setSelected(null); }} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">{isManual ? 'Manual Entry' : 'Select Plan'}</h2>
        <div className="w-10"></div>
      </div>
      <StepBar />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28">
        {!isManual && selected ? (
          <>
            <div className="flex flex-col items-center py-4 mb-4">
              <LetterAvatar name={selected.name} color={selected.color} size={56} />
              <h3 className="text-lg font-bold text-slate-800 mt-2">{selected.name}</h3>
              <p className="text-xs text-slate-400 font-medium">{selected.cat}</p>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Select Plan</p>
            <div className="space-y-3">
              {selected.plans.map(plan => (
                <button key={plan.label} onClick={() => selectPlan(plan)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    form.plan === plan.label ? 'border-brand bg-brand/5' : 'border-slate-200'
                  }`}>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{plan.label}</p>
                    <p className="text-xs text-slate-400">{selected.name} {plan.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-800">₹{plan.amt.toFixed(0)}</p>
                    <span className="text-xs text-slate-400">/mo</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 mt-2">Subscription Details</p>
            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Name</label>
                <div className="flex items-center gap-3 border border-slate-200 rounded-2xl px-4 py-3.5">
                  <CreditCard size={18} className="text-slate-400" />
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    className="flex-1 text-sm font-medium text-slate-800 placeholder-slate-300 bg-transparent border-none"
                    placeholder="e.g. Gym Membership" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Amount ($/mo)</label>
                <div className="flex items-center gap-3 border border-slate-200 rounded-2xl px-4 py-3.5">
                  <DollarSign size={18} className="text-slate-400" />
                  <input value={form.amt} onChange={e => setForm(f => ({...f, amt: e.target.value}))}
                    type="number" step="0.01"
                    className="flex-1 text-sm font-medium text-slate-800 placeholder-slate-300 bg-transparent border-none"
                    placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({...f, cat: c, color: CAT_COLORS[c] || '#10b981'}))}
                      className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                        form.cat === c ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100">
        <button onClick={() => { if (canProceedStep1) setStep(2); }} disabled={!canProceedStep1}
          className={`w-full font-bold text-sm py-4 rounded-2xl transition-all ${
            canProceedStep1 ? 'bg-brand text-white active:scale-[0.98]' : 'bg-slate-100 text-slate-400'
          }`}>
          Next
        </button>
      </div>
    </div>
  );

  // â”€â”€ Step 2: Billing Cycle â”€â”€
  if (step === 2) return (
    <div className="absolute inset-0 z-50 bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={() => setStep(1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">Billing Cycle</h2>
        <div className="w-10"></div>
      </div>
      <StepBar />
      <div className="flex-1 px-5">
        <p className="text-slate-400 text-sm font-medium mb-6">How often are you charged?</p>
        <div className="space-y-3">
          {[
            { value:'weekly', label:'Weekly', desc:'Billed every 7 days' },
            { value:'monthly', label:'Monthly', desc:'Billed every 30 days' },
            { value:'custom', label:'Custom', desc:'Set your own cycle' },
          ].map(opt => (
            <button key={opt.value} onClick={() => setForm(f => ({...f, cycle: opt.value}))}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                form.cycle === opt.value ? 'border-brand bg-brand/5' : 'border-slate-200'
              }`}>
              <div>
                <p className="font-bold text-slate-800 text-sm">{opt.label}</p>
                <p className="text-xs text-slate-400">{opt.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                form.cycle === opt.value ? 'border-brand' : 'border-slate-300'
              }`}>
                {form.cycle === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
              </div>
            </button>
          ))}
        </div>
        {form.cycle === 'custom' && (
          <div className="mt-5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Every X Days</label>
            <div className="flex items-center gap-3 border border-slate-200 rounded-2xl px-4 py-3.5">
              <Clock size={18} className="text-slate-400" />
              <input value={form.customDays} onChange={e => setForm(f => ({...f, customDays: e.target.value}))}
                type="number" className="flex-1 text-sm font-medium text-slate-800 bg-transparent border-none" />
              <span className="text-xs text-slate-400 font-medium">days</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-5 bg-white border-t border-slate-100">
        <button onClick={() => setStep(3)} className="w-full bg-brand text-white font-bold text-sm py-4 rounded-2xl active:scale-[0.98] transition-transform">
          Next
        </button>
      </div>
    </div>
  );

  // â”€â”€ Step 3: Commitment â”€â”€
  if (step === 3) return (
    <div className="absolute inset-0 z-50 bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={() => setStep(2)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">Commitment</h2>
        <div className="w-10"></div>
      </div>
      <StepBar />
      <div className="flex-1 px-5">
        <p className="text-slate-400 text-sm font-medium mb-6">How long do you plan to use this?</p>
        <div className="bg-slate-50 rounded-2xl p-6 mb-6">
          <p className="text-center text-3xl font-black text-slate-800 mb-1">
            {form.commitUntilCancel ? 'âˆž' : `${form.commitment} mo`}
          </p>
          <p className="text-center text-xs text-slate-400 font-medium">
            {form.commitUntilCancel ? 'Until you cancel' : `${form.commitment} month${form.commitment > 1 ? 's' : ''} commitment`}
          </p>
        </div>
        {!form.commitUntilCancel && (
          <div className="mb-6">
            <input type="range" min="1" max="24" value={form.commitment}
              onChange={e => setForm(f => ({...f, commitment: parseInt(e.target.value)}))}
              className="w-full h-2 rounded-full appearance-none bg-slate-200 accent-emerald-500 cursor-pointer"
              style={{'--tw-ring-color': '#10b981'}} />
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-slate-400 font-medium">1 mo</span>
              <span className="text-[10px] text-slate-400 font-medium">12 mo</span>
              <span className="text-[10px] text-slate-400 font-medium">24 mo</span>
            </div>
          </div>
        )}
        <button onClick={() => setForm(f => ({...f, commitUntilCancel: !f.commitUntilCancel}))}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
            form.commitUntilCancel ? 'border-brand bg-brand/5' : 'border-slate-200'
          }`}>
          <div>
            <p className="font-bold text-slate-800 text-sm">Until I cancel</p>
            <p className="text-xs text-slate-400">No fixed commitment</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            form.commitUntilCancel ? 'border-brand' : 'border-slate-300'
          }`}>
            {form.commitUntilCancel && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
          </div>
        </button>
      </div>
      <div className="p-5 bg-white border-t border-slate-100">
        <button onClick={() => setStep(4)} className="w-full bg-brand text-white font-bold text-sm py-4 rounded-2xl active:scale-[0.98] transition-transform">
          Next
        </button>
      </div>
    </div>
  );

  // â”€â”€ Step 4: Auto Remind â”€â”€
  if (step === 4) return (
    <div className="absolute inset-0 z-50 bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={() => setStep(3)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">Auto Remind</h2>
        <div className="w-10"></div>
      </div>
      <StepBar />
      <div className="flex-1 px-5">
        <p className="text-slate-400 text-sm font-medium mb-6">Get notified before renewal.</p>
        <div className="space-y-3">
          {[
            { value: 1, label: '1 day before' },
            { value: 3, label: '3 days before' },
            { value: 7, label: '1 week before' },
            { value: 14, label: '2 weeks before' },
          ].map(opt => (
            <button key={opt.value} onClick={() => setForm(f => ({...f, remindDays: opt.value}))}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                form.remindDays === opt.value ? 'border-brand bg-brand/5' : 'border-slate-200'
              }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  form.remindDays === opt.value ? 'bg-brand/10' : 'bg-slate-100'
                }`}>
                  <Bell size={18} className={form.remindDays === opt.value ? 'text-brand' : 'text-slate-400'} />
                </div>
                <p className="font-bold text-slate-800 text-sm">{opt.label}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                form.remindDays === opt.value ? 'border-brand' : 'border-slate-300'
              }`}>
                {form.remindDays === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="p-5 bg-white border-t border-slate-100">
        <button onClick={() => setStep(5)} className="w-full bg-brand text-white font-bold text-sm py-4 rounded-2xl active:scale-[0.98] transition-transform">
          Next
        </button>
      </div>
    </div>
  );

  // â”€â”€ Step 5: Add to Group â”€â”€
  if (step === 5) return (
    <div className="absolute inset-0 z-50 bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={() => setStep(4)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">Add to Group?</h2>
        <div className="w-10"></div>
      </div>
      <StepBar />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-24">
        <p className="text-slate-400 text-sm font-medium mb-6">Is this a shared subscription?</p>
        <div className="flex gap-3 mb-6">
          <button onClick={() => setForm(f => ({...f, addToGroup: true}))}
            className={`flex-1 p-4 rounded-2xl border text-center transition-all ${
              form.addToGroup ? 'border-brand bg-brand/5' : 'border-slate-200'
            }`}>
            <Users size={24} className={`mx-auto mb-2 ${form.addToGroup ? 'text-brand' : 'text-slate-400'}`} />
            <p className={`font-bold text-sm ${form.addToGroup ? 'text-brand' : 'text-slate-600'}`}>Yes</p>
          </button>
          <button onClick={() => setForm(f => ({...f, addToGroup: false}))}
            className={`flex-1 p-4 rounded-2xl border text-center transition-all ${
              !form.addToGroup ? 'border-brand bg-brand/5' : 'border-slate-200'
            }`}>
            <User size={24} className={`mx-auto mb-2 ${!form.addToGroup ? 'text-brand' : 'text-slate-400'}`} />
            <p className={`font-bold text-sm ${!form.addToGroup ? 'text-brand' : 'text-slate-600'}`}>No, solo</p>
          </button>
        </div>
        {form.addToGroup && (
          <>
            <div className="flex gap-3 mb-5">
              <button onClick={() => setForm(f => ({...f, existingGroup: true}))}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold border transition-all ${
                  form.existingGroup ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'
                }`}>
                Existing group
              </button>
              <button onClick={() => setForm(f => ({...f, existingGroup: false}))}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold border transition-all ${
                  !form.existingGroup ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'
                }`}>
                New group
              </button>
            </div>
            {form.existingGroup ? (
              <div className="space-y-3">
                {GROUPS.map(g => (
                  <button key={g.id} onClick={() => setForm(f => ({...f, groupId: g.id}))}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      form.groupId === g.id ? 'border-brand bg-brand/5' : 'border-slate-200'
                    }`}>
                    <div className="flex -space-x-2">
                      {g.colors.slice(0,3).map((c,i) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white" style={{background:c}} />
                      ))}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-sm">{g.name}</p>
                      <p className="text-xs text-slate-400">{g.members} members</p>
                    </div>
                    {form.groupId === g.id && <CheckCircle2 size={18} className="text-brand" />}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Group Name</label>
                <div className="flex items-center gap-3 border border-slate-200 rounded-2xl px-4 py-3.5">
                  <Users size={18} className="text-slate-400" />
                  <input value={form.newGroupName} onChange={e => setForm(f => ({...f, newGroupName: e.target.value}))}
                    className="flex-1 text-sm font-medium text-slate-800 placeholder-slate-300 bg-transparent border-none"
                    placeholder="e.g. Family Plan" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100">
        <button onClick={() => setStep(6)} className="w-full bg-brand text-white font-bold text-sm py-4 rounded-2xl active:scale-[0.98] transition-transform">
          Next
        </button>
      </div>
    </div>
  );

  // â”€â”€ Step 6: Confirm â”€â”€
  return (
    <div className="absolute inset-0 z-50 bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={() => setStep(5)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">Confirm</h2>
        <div className="w-10"></div>
      </div>
      <StepBar />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32">
        {/* Subscription card preview */}
        <div className="bg-slate-50 rounded-2xl p-6 mb-6">
          <div className="flex flex-col items-center">
            <LetterAvatar name={form.name || 'S'} color={form.color} size={56} />
            <h3 className="text-lg font-bold text-slate-800 mt-3">{form.name}</h3>
            <p className="text-xs text-slate-400 font-medium">{form.plan || 'Standard'} Â· {form.cat}</p>
            <p className="text-3xl font-black text-slate-800 mt-2">₹{parseFloat(form.amt || 0).toFixed(0)}<span className="text-sm text-slate-400 font-bold">/mo</span></p>
          </div>
        </div>
        {/* Summary rows */}
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Summary</p>
        <div className="space-y-0">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-sm text-slate-500 font-medium">Billing Cycle</span>
            <span className="text-sm font-bold text-slate-800 capitalize">{form.cycle === 'custom' ? `Every ${form.customDays} days` : form.cycle}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-sm text-slate-500 font-medium">Commitment</span>
            <span className="text-sm font-bold text-slate-800">{form.commitUntilCancel ? 'Until cancelled' : `${form.commitment} months`}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-sm text-slate-500 font-medium">Auto Remind</span>
            <span className="text-sm font-bold text-slate-800">{form.remindDays === 1 ? '1 day' : form.remindDays === 7 ? '1 week' : form.remindDays === 14 ? '2 weeks' : `${form.remindDays} days`} before</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-sm text-slate-500 font-medium">Group</span>
            <span className="text-sm font-bold text-slate-800">{form.addToGroup ? (form.existingGroup ? GROUPS.find(g => g.id === form.groupId)?.name || 'Selected' : form.newGroupName || 'New group') : 'Solo'}</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100">
        <button onClick={handleConfirm}
          className="w-full bg-brand text-white font-bold text-sm py-4 rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
          <CheckCircle2 size={16} /> Add Subscription
        </button>
      </div>
    </div>
  );
};

// =========================================
// CREATE GROUP FLOW
// =========================================
const CreateGroupFlow = ({ onClose, onSave, subs, initialSub }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: initialSub ? `${initialSub.name} Group` : '', sub: initialSub || null, memberEmails: [], split: 'equal', owner: 'You' });
  const [phoneSearch, setPhoneSearch] = useState('');

  const canProceed = () => {
    if (step === 0) return form.name.length > 2;
    if (step === 1) return form.sub !== null;
    if (step === 2) return form.memberEmails.length > 0;
    return true;
  };

  const handleSave = () => {
    const mems = form.memberEmails.map(e => e.split('@')[0]);
    // Create balances
    const amt = form.sub.amt;
    const splitCount = mems.length + 1; // plus "You"
    const isOwner = form.owner === 'You';
    
    let balances = [];
    if (form.split === 'equal') {
      const per = amt / splitCount;
      if (isOwner) {
        balances = mems.map(m => ({ name: m, paid: false, owed: per }));
      } else {
        balances = [{ name: form.owner, paid: false, owed: per }];
      }
    } else {
      // Mock custom percentages
      const per = amt * 0.3;
      if (isOwner) {
        balances = mems.map(m => ({ name: m, paid: false, owed: per }));
      } else {
        balances = [{ name: form.owner, paid: false, owed: per }];
      }
    }

    onSave({
      id: Date.now(),
      name: form.name,
      members: splitCount,
      perPerson: form.split === 'equal' ? amt / splitCount : amt * 0.3,
      total: amt,
      colors: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
      memberNames: ["You", ...mems],
      subName: form.sub.name,
      plan: form.sub.plan,
      nextDue: form.sub.due,
      balances,
      isOwner,
      ownerName: isOwner ? '' : form.owner
    });
  };

  const StepBar = () => (
    <div className="flex gap-1.5 px-5 pt-3 pb-4">
      {[0,1,2,3,4].map(i => (
        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-brand' : 'bg-slate-200'}`} />
      ))}
    </div>
  );

  return (
    <div className="absolute inset-0 z-50 bg-white slide-up-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={() => step > 0 ? setStep(step-1) : onClose()} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          {step > 0 ? <ArrowLeft size={18} className="text-slate-600" /> : <X size={18} className="text-slate-600" />}
        </button>
        <h2 className="font-bold text-slate-800">
          {step === 0 && "Create Circle"}
          {step === 1 && "Select Service"}
          {step === 2 && "Invite Members"}
          {step === 3 && "Split Method"}
          {step === 4 && "Set Owner"}
        </h2>
        <div className="w-10"></div>
      </div>
      <StepBar />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-24">
        {step === 0 && (
          <div className="pt-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Name your circle</h3>
            <p className="text-sm text-slate-500 mb-6">Give this group a name like "Roommates" or "Netflix Family".</p>
            <input autoFocus value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Circle Name"
              className="w-full text-lg border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 placeholder-slate-400 focus:border-brand focus:ring-1 focus:ring-brand outline-none" 
            />
          </div>
        )}

        {step === 1 && (
          <div className="pt-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Link subscription</h3>
            <p className="text-sm text-slate-500 mb-6">Select an existing subscription or create a new one.</p>
            <div className="space-y-3">
              {subs.map(s => (
                <button key={s.id} onClick={() => setForm({...form, sub: s})}
                  className={`w-full flex items-center justify-between p-4 border-2 rounded-2xl transition-all ${form.sub?.id === s.id ? 'border-brand bg-brand/5' : 'border-slate-100 hover:border-brand/30'}`}>
                  <div className="flex items-center gap-4">
                    <LetterAvatar name={s.name} color={s.color} size={40} />
                    <div className="text-left">
                      <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                      <p className="text-xs text-slate-400 font-medium">₹{s.amt.toFixed(0)}/mo</p>
                    </div>
                  </div>
                  {form.sub?.id === s.id && <CheckCircle2 size={20} className="text-brand" />}
                </button>
              ))}
              <button className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-2 text-brand font-semibold text-sm active:bg-slate-50 transition-colors">
                <Plus size={16} /> Add new subscription
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="pt-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Invite members</h3>
            <p className="text-sm text-slate-500 mb-6">Search by email or send an invite link.</p>
            
            <button className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 mb-6">
              <Link size={16} /> Share Invite Link
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)}
                placeholder="Search email..."
                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-1 focus:ring-brand outline-none" 
              />
            </div>

            {/* Mock contact list */}
            {phoneSearch.length > 1 && (
              <button onClick={() => {
                  if(!form.memberEmails.includes(phoneSearch)) setForm({...form, memberEmails: [...form.memberEmails, phoneSearch]});
                  setPhoneSearch('');
                }}
                className="w-full flex items-center justify-between p-3 border-b border-slate-100 active:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center"><User size={16} className="text-slate-500" /></div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">{phoneSearch}</p>
                    <p className="text-[10px] text-slate-400">Invite via email</p>
                  </div>
                </div>
                <UserPlus size={18} className="text-brand" />
              </button>
            )}

            {form.memberEmails.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Selected</p>
                {form.memberEmails.map(e => (
                  <div key={e} className="flex items-center justify-between bg-brand/5 border border-brand/20 rounded-xl py-2 px-3">
                    <span className="text-sm font-bold text-brand">{e}</span>
                    <button onClick={() => setForm({...form, memberEmails: form.memberEmails.filter(m => m !== e)})}>
                      <X size={16} className="text-brand/60" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="pt-6">
             <h3 className="text-xl font-bold text-slate-800 mb-2">Split method</h3>
             <p className="text-sm text-slate-500 mb-6">How do you want to divide the ₹{form.sub?.amt.toFixed(0)} bill?</p>

             <div className="space-y-4">
               <button onClick={() => setForm({...form, split: 'equal'})}
                 className={`w-full flex items-center justify-between p-5 border-2 rounded-2xl transition-all ${form.split === 'equal' ? 'border-brand bg-brand/5' : 'border-slate-100'}`}>
                 <div className="text-left">
                   <p className="font-bold text-slate-800">Equal split</p>
                   <p className="text-xs text-slate-500 mt-1">₹{(form.sub?.amt / (form.memberEmails.length + 1)).toFixed(0)} per person</p>
                 </div>
                 {form.split === 'equal' ? <CheckCircle2 className="text-brand" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-200" />}
               </button>

               <button onClick={() => setForm({...form, split: 'custom'})}
                 className={`w-full flex items-center justify-between p-5 border-2 rounded-2xl transition-all ${form.split === 'custom' ? 'border-brand bg-brand/5' : 'border-slate-100'}`}>
                 <div className="text-left">
                   <p className="font-bold text-slate-800">Custom percentages</p>
                   <p className="text-xs text-slate-500 mt-1">Set specific % for everyone</p>
                 </div>
                 {form.split === 'custom' ? <CheckCircle2 className="text-brand" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-200" />}
               </button>
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="pt-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Billing owner</h3>
            <p className="text-sm text-slate-500 mb-6">Who actually pays for this subscription directly?</p>

            <div className="space-y-3">
              <button onClick={() => setForm({...form, owner: 'You'})}
                className={`w-full flex items-center justify-between p-4 border-2 rounded-2xl transition-all ${form.owner === 'You' ? 'border-brand bg-brand/5' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200"><User size={14} className="text-slate-600"/></div>
                  <span className="font-bold text-slate-800">You</span>
                </div>
                {form.owner === 'You' && <CheckCircle2 size={18} className="text-brand" />}
              </button>

              {form.memberEmails.map((e, index) => {
                const name = e.split('@')[0];
                return (
                  <button key={e} onClick={() => setForm({...form, owner: name})}
                    className={`w-full flex items-center justify-between p-4 border-2 rounded-2xl transition-all ${form.owner === name ? 'border-brand bg-brand/5' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 font-bold text-xs uppercase">{name[0]}</div>
                      <span className="font-bold text-slate-800">{name}</span>
                    </div>
                    {form.owner === name && <CheckCircle2 size={18} className="text-brand" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100">
        {step < 4 ? (
          <button onClick={() => setStep(step+1)} disabled={!canProceed()}
            className="w-full bg-slate-800 disabled:bg-slate-300 text-white font-bold text-sm py-4 rounded-2xl active:scale-[0.98] transition-all">
            Continue
          </button>
        ) : (
          <button onClick={handleSave}
            className="w-full bg-brand text-white font-bold text-sm py-4 rounded-2xl active:scale-[0.98] transition-transform">
            Save Group
          </button>
        )}
      </div>
    </div>
  );
};

// =========================================
// MONTHLY CHECKIN FLOW (TINDER STACK)
// =========================================
const CheckinFlow = ({ subs, onClose, onStartCancellations, onOpenDetail }) => {
  const [index, setIndex] = useState(0);
  const [stats, setStats] = useState({ kept: 0, deferred: 0, queued: [] });

  const isDone = index >= subs.length;
  const currentSub = subs[index];

  const handleAction = (action) => {
    if (action === 'keep') {
      setStats(prev => ({ ...prev, kept: prev.kept + 1 }));
    } else if (action === 'defer') {
      setStats(prev => ({ ...prev, deferred: prev.deferred + 1 }));
    } else if (action === 'queue') {
      setStats(prev => ({ ...prev, queued: [...prev.queued, currentSub] }));
    }
    setIndex(i => i + 1);
  };

  if (isDone) {
    return (
      <div className="absolute inset-0 z-50 bg-brand slide-up-full flex flex-col overflow-hidden text-white">
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="w-10"></div>
          <h2 className="font-bold">Check-in Complete</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <X size={18} className="text-white" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <CheckCircle2 size={64} className="text-white mb-6" />
          <h3 className="text-3xl font-black mb-2">Great job!</h3>
          <p className="text-white/80 mb-8">You reviewed all your subscriptions.</p>
          
          <div className="w-full bg-white/10 rounded-2xl p-5 mb-8">
            <div className="flex justify-between items-center py-2 border-b border-white/20">
              <span className="font-medium">Kept</span>
              <span className="font-bold">{stats.kept}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/20">
              <span className="font-medium">Deferred</span>
              <span className="font-bold">{stats.deferred}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-red-200">Queued to cancel</span>
              <span className="font-bold text-red-200">{stats.queued.length}</span>
            </div>
          </div>

          {stats.queued.length > 0 ? (
            <button onClick={() => onStartCancellations(stats.queued)} className="w-full bg-white text-brand font-bold py-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              Start Cancellations <ChevronRight size={16}/>
            </button>
          ) : (
            <button onClick={onClose} className="w-full bg-white text-brand font-bold py-4 rounded-2xl active:scale-[0.98] transition-all">
              Done for the month
            </button>
          )}
        </div>
      </div>
    );
  }

  // Pre-load logic for value signal
  let valueSignal = "MEDIUM";
  let valueReason = "Normal usage.";
  if (currentSub.usage === 0 || currentSub.inactive) { valueSignal = "LOW"; valueReason = "You haven't used this in weeks."; }
  else if (currentSub.aiTip) { valueSignal = "MEDIUM"; valueReason = "There's a cheaper plan available."; }
  else if (currentSub.cat === 'Entertainment' && currentSub.amt < 10) { valueSignal = "HIGH"; valueReason = "Great value for entertainment."; }
  else if (currentSub.days < 10) { valueSignal = "HIGH"; valueReason = "Regularly used."; }

  return (
    <div className="absolute inset-0 z-[60] bg-white slide-up-full flex flex-col overflow-hidden text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col items-center pt-8 pb-4 relative">
        <div className="absolute left-5 top-8">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:bg-slate-200">
             <ArrowLeft size={18} />
          </button>
        </div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Monthly Check-In</h1>
        
        {/* Progress Bar */}
        <div className="flex gap-1.5 mt-5">
          {subs.map((_, i) => (
             <div key={i} className={`h-1.5 rounded-full transition-all duration-300 w-5 ${i === index ? 'bg-brand' : i < index ? 'bg-slate-600' : 'bg-slate-600'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-12 relative overflow-hidden">
        
        {/* CARD */}
        <button onClick={() => onOpenDetail(currentSub)} className="bg-white text-slate-800 rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200 relative transition-transform active:scale-95 text-left flex-1 max-h-[450px] flex flex-col mt-2">
          {/* Banner */}
          <div className={`px-5 py-3 flex items-center gap-2 ${valueSignal === 'LOW' ? 'bg-red-50 text-red-700' : valueSignal === 'HIGH' ? 'bg-brand/10 text-brand' : 'bg-amber-50 text-amber-700'}`}>
            <Sparkles size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wider">{valueSignal} VALUE</span>
          </div>
          <div className={`px-5 pb-4 pt-1 text-sm font-medium border-b border-slate-100 ${valueSignal === 'LOW' ? 'bg-red-50 text-red-600/80' : valueSignal === 'HIGH' ? 'bg-brand/10 text-brand' : 'bg-amber-50 text-amber-600/80'}`}>
            AI Insight: {valueReason}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-slate-50">
             <LetterAvatar name={currentSub.name} color={currentSub.color} size={80} />
             <h2 className="text-2xl font-black text-slate-800 mt-4">{currentSub.name}</h2>
             <p className="text-slate-400 font-medium">{currentSub.plan}</p>
             <p className="text-4xl font-black text-slate-800 mt-4">₹{currentSub.amt.toFixed(0)}<span className="text-lg text-slate-400">/mo</span></p>
             <p className="text-sm font-bold text-slate-500 mt-6 bg-white py-1.5 px-4 shadow-sm border border-slate-100 rounded-full">Renews {currentSub.due}</p>
          </div>
          <div className="bg-white border-t border-slate-100 px-5 py-4 text-center">
            <span className="text-xs text-brand font-bold uppercase tracking-widest underline">Tap card to view details</span>
          </div>
        </button>
        
        {/* ACTION BUTTONS */}
        <div className="flex flex-col items-center mt-6 w-full px-4 shrink-0">
          <button onClick={() => handleAction('defer')} className="flex items-center gap-2 border border-brand text-brand tracking-tight bg-white font-medium px-6 py-2 rounded-full mb-6 active:bg-brand/10 transition-colors">
            Remind me later
          </button>
          
          <div className="flex justify-between items-center w-full">
            <button onClick={() => handleAction('queue')} className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 active:bg-slate-300 transition-all">
                 <X size={36} strokeWidth={2.5} />
              </div>
            </button>
            <button onClick={() => handleAction('keep')} className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 active:bg-slate-300 transition-all">
                 <CheckCircle2 size={36} strokeWidth={2.5} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================
// APP ROOT
// =========================================
const App = () => {
  const [screen, setScreen] = useState('splash');
  const [tab, setTab] = useState('home');
  const [subs, setSubs] = useState(INITIAL_SUBS);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [cancelledSubs, setCancelledSubs] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showSpendInsights, setShowSpendInsights] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [cancellingSubObj, setCancellingSubObj] = useState(null);
  const [cancelQueue, setCancelQueue] = useState([]);

  const handleSnooze = (id) => {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, snoozed: true, due: 'Snoozed' } : s));
    setSelectedSub(prev => prev ? { ...prev, snoozed: true, due: 'Snoozed' } : null);
  };

  const handleStartCancel = (sub) => {
    setCancellingSubObj(sub);
  };

  const handleConfirmCancel = (id) => {
    const sub = subs.find(s => s.id === id);
    if (sub) {
      setCancelledSubs(prev => [...prev, { ...sub, cancelledDate: new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) }]);
    }
    setSubs(prev => prev.filter(s => s.id !== id));
    setSelectedSub(null);
    setCancellingSubObj(null);
    
    // Auto-pop the cancellation queue
    if (cancelQueue.length > 0) {
      setCancellingSubObj(cancelQueue[0]);
      setCancelQueue(prev => prev.slice(1));
    }
  };

  const handleRemindMe = (id) => {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, remindCancel: true } : s));
    setSelectedSub(null);
    setCancellingSubObj(null);
  };

  const handleAddSub = (newSub) => {
    setSubs(prev => [...prev, newSub]);
    setTab('home');
  };

  const handleCreateGroup = (newGroup) => {
    setGroups(prev => [...prev, newGroup]);
    setIsCreateGroupOpen(false);
  };

  const handleStartQueue = (queue) => {
    setIsCheckinOpen(false);
    if (queue.length > 0) {
      setCancellingSubObj(queue[0]);
      setCancelQueue(queue.slice(1));
    }
  };
  // Handle agentic actions from AI Agent
  const handleAgentAction = useCallback((action) => {
    if (!action || !action.type) return;
    const findSub = (name) => subs.find(s => s.name.toLowerCase() === name.toLowerCase());

    switch (action.type) {
      case 'cancel': {
        const sub = findSub(action.sub);
        if (sub) { setTab('home'); setTimeout(() => handleStartCancel(sub), 300); }
        break;
      }
      case 'create_group': {
        const sub = findSub(action.sub);
        if (sub) { setTab('home'); setTimeout(() => setIsCreateGroupOpen(sub), 300); }
        break;
      }
      case 'snooze': {
        const sub = findSub(action.sub);
        if (sub) { handleSnooze(sub.id); }
        break;
      }
      case 'archive': {
        const sub = findSub(action.sub);
        if (sub) { handleConfirmCancel(sub.id); }
        break;
      }
      case 'show_insights': {
        setTab('home');
        setTimeout(() => setShowSpendInsights(true), 300);
        break;
      }
      case 'start_checkin': {
        setTab('home');
        setTimeout(() => setIsCheckinOpen(true), 300);
        break;
      }
      case 'open_detail': {
        const sub = findSub(action.sub);
        if (sub) { setTab('home'); setTimeout(() => setSelectedSub(sub), 300); }
        break;
      }
      default: break;
    }
  }, [subs]);

  // Pre-app screens
  if (screen === 'splash') return <ScreenSplash onFinish={() => setScreen('auth')} />;
  if (screen === 'auth') return <ScreenAuth onSignUp={() => setScreen('onboarding')} />;
  if (screen === 'onboarding') return <ScreenOnboarding onFinish={() => setScreen('app')} />;

  // Main app with tabs
  return (
    <div className="relative h-full">
      {tab === 'home'    && <ScreenHome subs={subs} groups={groups} onSelectSub={setSelectedSub} onSelectGroup={setSelectedGroup} onShowSpendInsights={() => setShowSpendInsights(true)} onStartCheckin={() => setIsCheckinOpen(true)} />}
      {tab === 'subs'    && <ScreenSubs subs={subs} cancelledSubs={cancelledSubs} onSelectSub={setSelectedSub} />}
      {tab === 'circles' && <ScreenCircles groups={groups} onSelectGroup={setSelectedGroup} onCreateGroup={() => setIsCreateGroupOpen(true)} />}
      {tab === 'agent'   && <ScreenAgent subs={subs} onAction={handleAgentAction} />}

      <BottomNav active={tab} setTab={setTab} />
      {tab !== 'agent' && <FAB onClick={() => setShowAddSub(true)} />}

      {selectedSub && (
        <SubDetail 
          sub={selectedSub} 
          onClose={() => setSelectedSub(null)} 
          onSnooze={handleSnooze} 
          onStartCancel={handleStartCancel}
          onArchive={(id) => handleConfirmCancel(id)}
          onMoveToGroup={(subInfo) => { setSelectedSub(null); setIsCreateGroupOpen(subInfo); }}
          onSaveEdit={(id, newDetails) => setSubs(prev => prev.map(s => s.id === id ? {...s, ...newDetails} : s))}
        />
      )}
      {cancellingSubObj && (
        <CancellationFlow
          sub={cancellingSubObj}
          onClose={() => setCancellingSubObj(null)}
          onConfirmCancel={handleConfirmCancel}
          onRemindMe={handleRemindMe}
        />
      )}
      {selectedGroup && (
        <GroupDetail group={selectedGroup} onClose={() => setSelectedGroup(null)} />
      )}
      {showSpendInsights && (
        <SpendInsights subs={subs} onClose={() => setShowSpendInsights(false)} />
      )}
      {showAddSub && (
        <AddSubscription onClose={() => setShowAddSub(false)} onAdd={handleAddSub} />
      )}
      {isCreateGroupOpen && (
        <CreateGroupFlow onClose={() => setIsCreateGroupOpen(false)} onSave={handleCreateGroup} subs={subs} initialSub={typeof isCreateGroupOpen === 'object' ? isCreateGroupOpen : null} />
      )}
      {isCheckinOpen && (
        <CheckinFlow subs={subs} onClose={() => setIsCheckinOpen(false)} onStartCancellations={handleStartQueue} onOpenDetail={setSelectedSub} />
      )}
    </div>
  );
};

// â”€â”€ Render â”€â”€
createRoot(document.getElementById('root')).render(<App />);

