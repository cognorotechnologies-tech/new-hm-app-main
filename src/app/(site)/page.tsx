import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  ShieldCheck,
  Users,
  Stethoscope,
  FlaskConical,
  Briefcase,
  Building2,
  Zap,
  ArrowRight,
  Megaphone,
  Receipt
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-mesh font-sans selection:bg-primary/30">
      {/* Navigation */}
      <header className="px-6 h-20 flex items-center glass sticky top-0 z-[100] border-b border-white/20 transition-all duration-300">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer transition-all duration-300 hover:scale-105">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/30 transition-all group-hover:rotate-6">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
              HealthManager<span className="text-primary tracking-normal">Pro</span>
            </span>
          </div>
          <nav className="hidden lg:flex gap-10 items-center text-sm font-bold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-primary transition-all relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
            <a href="#solutions" className="hover:text-primary transition-all relative group">
              Solutions
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
            <a href="#pricing" className="hover:text-primary transition-all relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-800">
              <Link href="/login">
                <Button variant="ghost" className="font-bold hover:bg-primary/10">Log In</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="premium" className="h-11 px-6 rounded-xl font-bold">
                  Try Demo
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION - REFINED */}
        <section className="relative pt-32 pb-40 overflow-hidden">
          {/* Animated Background Blobs */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

          <div className="container mx-auto px-6 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <div className="flex-[1.2] space-y-10 animate-in fade-in slide-in-from-left duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                  <Zap className="h-4 w-4 fill-current" /> Next-Gen Clinic Ecosystem
                </div>
                <h1 className="text-6xl lg:text-8xl font-[900] text-slate-900 dark:text-white leading-[1] tracking-tighter">
                  Empower Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-cyan-500 drop-shadow-sm">Facility</span> with Intelligence.
                </h1>
                <p className="text-xl lg:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
                  The ultimate healthcare operating system. Unified records, intelligent billing, and patient engagement—all in one high-performance SaaS.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-6">
                  <Link href="/dashboard">
                    <Button variant="premium" size="lg" className="h-16 px-10 text-xl rounded-2xl font-black shadow-2xl shadow-primary/40 group">
                      Get Started <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="h-16 px-10 text-xl rounded-2xl border-2 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95">
                    Live Demo
                  </Button>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-10 pt-10">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-12 w-12 rounded-2xl border-4 border-background bg-slate-200 shadow-md ring-2 ring-primary/5" />
                    ))}
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">1,200+</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medical Centers Active</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 relative animate-in fade-in zoom-in duration-1000 delay-300">
                <div className="relative z-10 p-2 rounded-[3rem] glass shadow-3xl rotate-1 group hover:rotate-0 transition-transform duration-700">
                  <div className="aspect-[4/3] rounded-[2.5rem] bg-slate-950 flex items-center justify-center overflow-hidden border border-white/10">
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                      <div className="glass-card p-10 rounded-full mb-6 relative group-hover:scale-110 transition-transform duration-500">
                        <Stethoscope className="h-20 w-20 text-primary" />
                        <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20" />
                      </div>
                      <p className="text-primary font-black text-2xl tracking-tight">System v2.4 Active</p>
                      <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em] mt-2">Realtime Engine</p>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -bottom-12 -left-12 glass-card p-8 rounded-3xl shadow-3xl animate-bounce-slow z-20">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white text-xl">Efficiency Peak</p>
                        <p className="text-sm font-bold text-emerald-500">+24.8% Uplift</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES - GRID UPGRADED */}
        <section id="features" className="py-40 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto space-y-6 mb-24">
              <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-black uppercase tracking-widest border border-indigo-500/20">
                Modular Architecture
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                Everything Unified.
              </h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                Stop juggling multiple tools. We've built the most comprehensive healthcare stack on the market.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Stethoscope, title: "Clinical Workflow", desc: "Digital prescriptions and intelligent patient tracking.", color: "text-blue-500" },
                { icon: Receipt, title: "Smart Billing", desc: "Automated insurance claims and inventory syncing.", color: "text-emerald-500" },
                { icon: FlaskConical, title: "Laboratory CMS", desc: "Cloud-based result tracking and patient portals.", color: "text-purple-500" },
                { icon: Briefcase, title: "Enterprise HR", desc: "Staff rosters, payroll, and performance metrics.", color: "text-orange-500" },
                { icon: Megaphone, title: "AI Engagement", desc: "Automated surveys and growth campaigns.", color: "text-rose-500" },
                { icon: ShieldCheck, title: "Tenant Isolated", desc: "Highest security tier for sensitive medical data.", color: "text-indigo-500" },
                { icon: Users, title: "Family Networks", desc: "Comprehensive care for dependents and seniors.", color: "text-cyan-500" },
                { icon: Zap, title: "Global Sync", desc: "Real-time updates across all branches and devices.", color: "text-amber-500" }
              ].map((feature, i) => (
                <div key={i} className="glass-card p-10 rounded-[2.5rem] group hover:bg-primary/5 transition-all duration-500">
                  <div className={cn("h-16 w-16 rounded-2xl bg-background flex items-center justify-center shadow-xl group-hover:-translate-y-2 transition-transform duration-500", feature.color)}>
                    <feature.icon className="h-8 w-8 transition-transform group-hover:scale-125 duration-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-8 mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING - REBOOTED */}
        <section id="pricing" className="py-40 bg-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-10" />
          <div className="container mx-auto px-6 relative z-10 text-white">
            <div className="text-center max-w-4xl mx-auto mb-28 space-y-6">
              <h2 className="text-5xl lg:text-7xl font-black tracking-tighter">Transparent Pricing.</h2>
              <p className="text-xl text-slate-400 font-medium italic">Scalable solutions for clinics and multi-branch hospital networks.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { name: "Starter", price: "0", features: ["100 Patients", "Core Workflow", "Basic Reports"], popular: false },
                { name: "Dynamic Pro", price: "49", features: ["Unlimited Patients", "Pharmacy & Lab", "Team Access", "Custom Brand"], popular: true },
                { name: "Enterprise Hub", price: "Custom", features: ["Multi-Branch", "Priority Support", "AI Diagnostics", "Dedicated API"], popular: false }
              ].map((tier, i) => (
                <div key={i} className={cn(
                  "relative p-12 rounded-[3rem] border transition-all duration-500 flex flex-col h-full group hover:bg-white/5",
                  tier.popular ? "bg-white/10 border-primary scale-105 shadow-3xl shadow-primary/20" : "bg-white/5 border-white/10"
                )}>
                  {tier.popular && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">
                      Industry Choice
                    </span>
                  )}
                  <div className="space-y-8 flex-1">
                    <p className="text-primary font-black uppercase tracking-widest text-xs uppercase">{tier.name}</p>
                    <div className="flex items-baseline gap-2">
                      {tier.price !== "Custom" && <span className="text-2xl font-bold opacity-50">$</span>}
                      <span className="text-6xl font-black tracking-tighter">{tier.price}</span>
                      {tier.price !== "Custom" && <span className="text-slate-400 font-bold opacity-30 italic">/mo</span>}
                    </div>
                    <ul className="space-y-5 pt-4">
                      {tier.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-4 text-slate-300 font-bold">
                          <CheckCircle2 className="h-6 w-6 text-primary shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant={tier.popular ? "premium" : "outline"} className={cn(
                    "mt-12 w-full h-16 text-xl rounded-2xl font-black",
                    !tier.popular && "border-white/20 text-white hover:bg-white/10"
                  )}>
                    {tier.price === "Custom" ? "Contact Team" : "Begin Journey"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-48 relative overflow-hidden bg-mesh">
          <div className="container mx-auto px-6">
            <div className="glass p-16 lg:p-32 rounded-[5rem] text-center space-y-12 relative overflow-hidden shadow-3xl border-none">
              <div className="absolute top-0 left-0 w-full h-full bg-primary/5 pointer-events-none skew-y-12 translate-y-32" />
              <h2 className="text-5xl lg:text-8xl font-black max-w-5xl mx-auto leading-[0.9] tracking-tighter text-slate-900 dark:text-white">
                Ready to redefine <span className="text-primary italic">care?</span>
              </h2>
              <p className="text-2xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                Switch to HealthManagerPro today. 14-day free trial on all plans. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
                <Link href="/dashboard">
                  <Button variant="premium" size="lg" className="h-20 px-16 text-2xl rounded-3xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95">
                    Start Now
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="h-20 px-16 text-2xl rounded-3xl border-2 font-black transition-all hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95">
                  Book a Consult
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 glass border-t border-white/10 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-4 transition-transform hover:scale-105 duration-300">
              <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/30">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                HealthManager<span className="text-primary italic">Pro</span>
              </span>
            </div>
            <p className="text-slate-500 font-bold italic text-sm">© 2026 Hospital Management Solutions. Powered by HM-v2.0</p>
            <div className="flex gap-12 text-sm font-black text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-primary transition-colors hover:translate-y-[-2px] block">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors hover:translate-y-[-2px] block">Terms</a>
              <a href="#" className="hover:text-primary transition-colors hover:translate-y-[-2px] block">Status</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Simple Slow Bounce Animation
const styleTags = `
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
.animate-bounce-slow {
  animation: bounce-slow 4s ease-in-out infinite;
}
`;
