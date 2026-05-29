import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useFlutterwave } from 'flutterwave-react-v3';

const primary = "#0B6E4F";
const accent = "#F59E0B";

const routes = ["home", "about", "projects", "donate", "gallery", "contact"] as const;
type Route = (typeof routes)[number];

type Project = {
  title: string;
  location: string;
  image: string;
  budget: string;
  impact: string;
  progress: number;
  summary: string;
  photos: string[];
};

const navItems: { label: string; route: Route }[] = [
  { label: "Home", route: "home" },
  { label: "About", route: "about" },
  { label: "Projects", route: "projects" },
  { label: "Gallery", route: "gallery" },
  { label: "Contact", route: "contact" },
];

const impactStats = [
  { value: 1200, suffix: "+", label: "Lives Impacted", icon: "family" },
  { value: 5000, suffix: "+", label: "Meals Provided", icon: "food" },
  { value: 300, suffix: "+", label: "Children Supported", icon: "school" },
  { value: 15, suffix: "", label: "Villages Reached", icon: "village" },
];

const projects: Project[] = [
  {
    title: "Emergency Food Relief",
    location: "Eastern Uganda village communities",
    image: "/images/project-food-relief.jpg",
    budget: "UGX 8.4M used",
    impact: "5,000+ meals delivered to families, elders, and child-headed homes.",
    progress: 82,
    summary: "Monthly food support for homes facing hunger, illness, and unstable income.",
    photos: ["/images/project-food-relief.jpg", "/images/gallery-home-visit.jpg"],
  },
  {
    title: "Children Back to School",
    location: "Rural primary schools",
    image: "/images/project-education.jpg",
    budget: "UGX 6.1M used",
    impact: "300+ children supported with school materials, uniforms, and basic fees.",
    progress: 68,
    summary: "School readiness packages that keep children learning instead of dropping out early.",
    photos: ["/images/project-education.jpg", "/images/about-family-foundation.jpg"],
  },
  {
    title: "Clean Water and Home Visits",
    location: "Remote village clusters",
    image: "/images/project-water.jpg",
    budget: "UGX 4.7M used",
    impact: "Water access, home follow-ups, and basic repairs for vulnerable households.",
    progress: 54,
    summary: "A practical outreach program focused on the homes that are hardest to reach.",
    photos: ["/images/project-water.jpg", "/images/gallery-medical-outreach.jpg"],
  },
];

const galleryItems = [
  {
    type: "image",
    title: "Food relief day",
    src: "/images/project-food-relief.jpg",
    caption: "Families receiving essentials during a village food outreach.",
  },
  {
    type: "image",
    title: "School support",
    src: "/images/project-education.jpg",
    caption: "Children receiving learning materials to stay in school.",
  },
  {
    type: "video",
    title: "Village field update",
    src: "/images/gallery-home-visit.jpg",
    caption: "A video-ready update card for future field footage from home visits.",
    videoSources: [
      {
        label: "HD 1080p",
        src: "https://videos.pexels.com/video-files/36135998/15324497_1920_1080_24fps.mp4",
      },
      {
        label: "Standard 1080p",
        src: "https://videos.pexels.com/video-files/19749256/19749256-hd_1920_1080_24fps.mp4",
      },
      {
        label: "Low data",
        src: "https://videos.pexels.com/video-files/31948112/13610921_1920_1080_60fps.mp4",
      },
    ],
  },
  {
    type: "image",
    title: "Water access",
    src: "/images/project-water.jpg",
    caption: "Community members gathering around a repaired water point.",
  },
  {
    type: "image",
    title: "Medical outreach",
    src: "/images/gallery-medical-outreach.jpg",
    caption: "Basic health support and referrals for rural families.",
  },
  {
    type: "video",
    title: "Volunteer visit",
    src: "/images/team-volunteers.jpg",
    caption: "A video-ready update card for volunteer field interviews.",
    videoSources: [
      {
        label: "HD 1080p",
        src: "https://videos.pexels.com/video-files/19665416/19665416-uhd_3840_2160_24fps.mp4",
      },
      {
        label: "Standard 1080p",
        src: "https://videos.pexels.com/video-files/34596470/14660862_3840_2160_50fps.mp4",
      },
      {
        label: "Low data",
        src: "https://videos.pexels.com/video-files/27858252/12245702_3840_2160_24fps.mp4",
      },
    ],
  },
];

const testimonials = [
  {
    quote:
      "When food was brought to our home, it felt like someone had remembered us. My grandchildren could sleep without hunger that night.",
    name: "Nabirye",
    role: "Grandmother and beneficiary",
  },
  {
    quote:
      "The foundation listens before it gives. That is why the support reaches the families who truly need it.",
    name: "Mr.Mbeyagala.",
    role: "Village volunteer",
  },
  {
    quote:
      "A small school package can change a child's whole term. It tells them their future matters.",
    name: "Mrs.Babirye",
    role: "Primary school teacher",
  },
];

const team = [
  { name: "Kaudha Persis Ruth", role: "Founder and family vision & Exacutive Director", image: "public/images/ruth.jpg" },
  { name: "Cindy K.", role: "Village coordinator", image: "public/images/cindy.jpg" },
  { name: "Cyril R.", role: "Treasurer", image: "/public/images/cyril.jpg" },
  { name: "Joshua M.", role: "Trustees and donor care", image: "public/images/joshua.jpg" },
  { name: "Charity K.", role: "Secretary", image: "/public/images/charity.jpeg" },
];

const moneyUse = [
  { label: "Food", value: 50 },
  { label: "Education", value: 30 },
  { label: "Logistics", value: 20 },
];

function getRouteFromHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  return routes.includes(raw as Route) ? (raw as Route) : "home";
}

function routeHref(route: Route) {
  return `#/${route}`;
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => getRouteFromHash());
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("pmf-theme") === "dark";
  });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    function handleHashChange() {
      setRoute(getRouteFromHash());
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    document.title = `PERSIS McGREGOR FOUNDATION | ${route === "home" ? "Rural Uganda Charity" : titleCase(route)}`;
  }, [prefersReducedMotion, route]);

  useEffect(() => {
    window.localStorage.setItem("pmf-theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <main className={`glass-app min-h-screen text-slate-950 ${isDark ? "dark-theme" : "light-theme"}`}>
      <ScrollProgress />
      <Header route={route} isDark={isDark} onToggleTheme={() => setIsDark((current) => !current)} />
      <AnimatePresence mode="wait">
        <motion.div
          key={route}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
        >
          {route === "home" && <HomePage />}
          {route === "about" && <AboutPage />}
          {route === "projects" && <ProjectsPage />}
          {route === "donate" && <DonatePage />}
          {route === "gallery" && <GalleryPage />}
          {route === "contact" && <ContactPage />}
        </motion.div>
      </AnimatePresence>
      <Footer />
      <FloatingActions isDark={isDark} onToggleTheme={() => setIsDark((current) => !current)} />
    </main>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return <div className="fixed left-0 top-0 z-[70] h-1 bg-[#F59E0B] shadow-[0_0_18px_rgba(245,158,11,.8)]" style={{ width: `${progress}%` }} />;
}

function FloatingActions({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 500);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col gap-3 sm:right-6">
      <motion.a
        className="glass-float flex h-14 w-14 items-center justify-center rounded-full text-lg font-black text-white shadow-2xl"
        href={routeHref("donate")}
        whileHover={{ y: -4, scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Donate now"
      >
        Give
      </motion.a>
      <motion.button
        className="glass-float flex h-12 w-12 items-center justify-center rounded-full text-sm font-black text-white"
        type="button"
        onClick={onToggleTheme}
        whileHover={{ y: -3, scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Toggle color theme"
      >
        {isDark ? "Light" : "Dark"}
      </motion.button>
      <motion.a
        className="glass-float flex h-12 w-12 items-center justify-center rounded-full text-xs font-black text-white"
        href="https://wa.me/256772689323?text=Hello%20PERSIS%20McGREGOR%20FOUNDATION"
        target="_blank"
        rel="noreferrer"
        whileHover={{ y: -3, scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Contact on WhatsApp"
      >
        Chat
      </motion.a>
      {visible && (
        <motion.button
          className="glass-float flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          whileHover={{ y: -3, scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Back to top"
        >
          Up
        </motion.button>
      )}
    </div>
  );
}

function Header({ route, isDark, onToggleTheme }: { route: Route; isDark: boolean; onToggleTheme: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => setIsOpen(false), [route]);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed left-0 top-0 z-[60] w-full px-3 transition-all duration-500 sm:px-6 ${isScrolled ? "py-2" : "py-4"}`}>
      <nav className={`glass-nav mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 transition-all duration-500 sm:px-6 ${isScrolled ? "py-2 shadow-2xl" : "py-3"}`}>
        <a className="group flex items-center gap-3" href={routeHref("home")} aria-label="PERSIS McGREGOR FOUNDATION home">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white shadow-lg shadow-emerald-900/20 transition group-hover:scale-105"
            style={{ backgroundColor: primary }}
          >
            PMF
          </span>
          <span className="hidden text-sm font-extrabold uppercase tracking-[0.2em] text-current sm:block">PERSIS McGREGOR FOUNDATION</span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.route}
              className={`relative text-sm font-semibold transition hover:text-[#F59E0B] ${route === item.route ? "text-[#F59E0B]" : "text-current/75"}`}
              href={routeHref(item.route)}
            >
              {item.label}
              {route === item.route && <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-[#F59E0B]" />}
            </a>
          ))}
          <button
            className="rounded-full border border-current/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-current/80 transition hover:-translate-y-0.5 hover:border-[#F59E0B] hover:text-[#F59E0B]"
            type="button"
            onClick={onToggleTheme}
          >
            {isDark ? "Light" : "Dark"}
          </button>
          <a
            className="rounded-full px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30"
            href={routeHref("donate")}
            style={{ backgroundColor: accent }}
          >
            Donate Now
          </a>
        </div>

        <button
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-current/15 text-current lg:hidden"
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-label="Toggle menu"
        >
          <span className={`h-0.5 w-5 rounded-full bg-current transition ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-5 rounded-full bg-current transition ${isOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-5 rounded-full bg-current transition ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {isOpen && (
        <motion.div
          className="glass-menu mx-2 mt-3 rounded-3xl p-5 text-current shadow-2xl lg:hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="grid gap-2">
            {navItems.map((item) => (
              <a key={item.route} className={`rounded-2xl px-4 py-3 font-semibold transition hover:bg-white/15 ${route === item.route ? "bg-white/15 text-[#F59E0B]" : ""}`} href={routeHref(item.route)}>
                {item.label}
              </a>
            ))}
            <button className="rounded-2xl px-4 py-3 text-left font-extrabold transition hover:bg-white/15" type="button" onClick={onToggleTheme}>
              Switch to {isDark ? "Light" : "Dark"} Mode
            </button>
            <a className="rounded-2xl px-4 py-3 font-extrabold text-white" href={routeHref("donate")} style={{ backgroundColor: primary }}>
              Donate Now
            </a>
          </div>
        </motion.div>
      )}
    </header>
  );
}

function HomePage() {
  return (
    <>
      <HeroSection />
      <ImpactStats />
      <AboutPreview />
      <FeaturedProjects />
      <EmotionalStory />
      <DonationCall />
      <TestimonialsSection />
    </>
  );
}

function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/uganda-village-foundation.jpg')" }}
        initial={prefersReducedMotion ? { scale: 1 } : { scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 2.5, ease: "easeOut" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/35" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 py-28 sm:px-8 lg:px-10">
        <motion.div
          className="hero-glass max-w-4xl rounded-[2rem] p-6 shadow-2xl sm:p-8 lg:p-10"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.15, ease: "easeOut" }}
        >
          <p className="mb-5 text-lg font-black uppercase tracking-[0.32em] text-[#F59E0B] sm:text-xl">PERSIS McGREGOR FOUNDATION</p>
          <h1 className="max-w-4xl text-5xl font-white leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
            Changing Lives in <br /> Rural Uganda, In <br /> Diferent Families
          </h1>
          <p className="mt-7 max-w-2xl text-xl font-medium leading-9 text-white/86 sm:text-2xl">
            Providing food, education, and hope to underserved communities.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button href={routeHref("donate")} variant="accent">
              Donate Now
            </Button>
            <Button href={routeHref("about")} variant="light">
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ImpactStats() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-12 max-w-3xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#0B6E4F]">Trust through impact</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">Help is already reaching the last mile.</h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {impactStats.map((stat) => (
            <motion.div key={stat.label} className="glass-card rounded-[2rem] px-4 py-9 sm:px-6 lg:px-8" whileHover={{ y: -6, scale: 1.015 }}>
              <LineIcon type={stat.icon} />
              <p className="mt-5 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutPreview() {
  return (
    <section className="bg-slate-50 px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <Reveal>
          <img
            className="h-[420px] w-full rounded-[2rem] object-cover shadow-2xl shadow-slate-200"
            src="/images/about-family-foundation.jpg"
            alt="Foundation family and village leaders meeting in rural Uganda"
          />
        </Reveal>
        <Reveal delay={0.12}>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#0B6E4F]">The family promise</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">Started by family. Built for forgotten villages.</h2>
          <div className="mt-6 space-y-5 text-lg leading-8 text-slate-600">
            <p>
              PERSIS McGREGOR FOUNDATION exists because too many families in deep village communities are left to face
              hunger, school costs, and sickness without anyone close enough to respond.
            </p>
            <p>
              The McGregor family began this work as a personal commitment: reach the homes that are hardest to reach,
              listen first, and give support that restores dignity.
            </p>
          </div>
          <div className="mt-8">
            <Button href={routeHref("about")} variant="primary">
              Read Full Story
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FeaturedProjects() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#0B6E4F]">Proof in the field</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">Featured projects</h2>
          </div>
          <a className="font-extrabold text-[#0B6E4F] hover:text-[#F59E0B]" href={routeHref("projects")}>
            View all projects
          </a>
        </Reveal>
        <div className="mt-12 grid gap-7 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EmotionalStory() {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-5 py-28 text-white sm:px-8 lg:px-10 lg:py-40">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/story-namukasa.jpg')" }} aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/58 to-black/15" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <Reveal className="max-w-3xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#F59E0B]">A life behind the numbers</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-6xl">Nabirye's home had gone three days without a full meal.</h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
            Before support arrived, Nabirye was sharing tea with her grandchildren and hoping neighbors could spare
            food. After the outreach, her home received meals, clean water support, and follow-up visits from volunteers.
          </p>
          <div className="mt-8 grid gap-4 text-sm font-bold uppercase tracking-[0.18em] text-white/80 sm:grid-cols-2">
            <div className="border-l-4 border-white/35 pl-5">Before: hunger, isolation, no transport to help</div>
            <div className="border-l-4 border-[#F59E0B] pl-5">After: food, water, follow-up, dignity</div>
          </div>
          <div className="mt-10">
            <Button href={routeHref("donate")} variant="accent">
              Help More People Like Nabirye
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function DonationCall() {
  return (
    <section className="bg-slate-50 px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#0B6E4F]">Action</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">Your support changes lives</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Give in minutes. Food, school support, and emergency help can move toward a family this week.
          </p>
        </Reveal>
        <DonationPanel compact />
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-3xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#0B6E4F]">Trust from people</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">What people are saying</h2>
        </Reveal>
        <TestimonialSlider />
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <>
      <PageHero title="Our Story" subtitle="A family-founded foundation walking the last miles for rural Uganda." />
      <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#0B6E4F]">The problem</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">Poverty is heavier when help is far away.</h2>
          </Reveal>
          <Reveal delay={0.12} className="space-y-5 text-lg leading-8 text-slate-600">
            <p>
              In rural Uganda, families can live hours from reliable transport, clinics, school resources, and stable
              markets. When food runs out or sickness comes, distance becomes a second crisis.
            </p>
            <p>
              Children can miss class because of basic costs. Elders can go unseen because they cannot travel. Parents
              can lose income because a small emergency becomes a large debt.
            </p>
            <p>
              PERSIS McGREGOR FOUNDATION focuses on these overlooked homes by building relationships in the villages
              themselves.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <img
              className="h-[500px] w-full rounded-[2rem] object-cover shadow-2xl shadow-slate-200"
              src="/images/about-family-foundation.jpg"
              alt="McGregor family and village leaders"
            />
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#0B6E4F]">Your story</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">A personal promise became a public mission.</h2>
            <div className="mt-6 space-y-5 text-lg leading-8 text-slate-600">
              <p>
                The foundation began with a family conviction that compassion should not stop where the paved road
                ends. The McGregor family chose to honor that conviction through direct, practical support.
              </p>
              <p>
                Every visit begins with listening: to village elders, mothers, teachers, volunteers, and families who
                know which homes need urgent help first.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
          <Reveal className="rounded-[2rem] bg-[#0B6E4F] p-8 text-white sm:p-10">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-white/70">Mission</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-5xl">Provide practical help to vulnerable families in rural Uganda.</h2>
            <p className="mt-5 text-lg leading-8 text-white/78">
              We support food security, education, medical access, and dignified home follow-up in underserved villages.
            </p>
          </Reveal>
          <Reveal delay={0.12} className="rounded-[2rem] bg-[#F59E0B] p-8 text-slate-950 sm:p-10">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-slate-800/70">Vision</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-5xl">Villages where no family is forgotten because they are far away.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-800/78">
              We want communities to become stronger, healthier, and more hopeful through consistent support.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#0B6E4F]">Team</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">Family leadership and village volunteers</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <Reveal key={member.name} delay={index * 0.06}>
                <img
                  className="h-72 w-full rounded-[1.5rem] object-cover bg-slate-100"
                  src={member.image.replace(/^\/?public\//, '/')}
                  alt={member.name}
                  onError={(e) => {
                    // Graceful visual fallback if specific team photos are not yet uploaded
                    e.currentTarget.src = "/images/about-family-foundation.jpg";
                  }}
                />
                <h3 className="mt-5 text-xl font-black text-slate-950">{member.name}</h3>
                <p className="mt-1 text-slate-600">{member.role}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProjectsPage() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <>
      <PageHero title="Projects" subtitle="Transparent village projects with budgets, progress, and human impact." />
      <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#0B6E4F]">Project proof</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">Every project shows the money and the result.</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {projects.map((project, index) => (
              <motion.article
                key={project.title}
                className="glass-card overflow-hidden rounded-[2rem]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
                whileHover={{ y: -8 }}
              >
                <img className="h-64 w-full object-cover" src={project.image} alt={project.title} />
                <div className="p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0B6E4F]">{project.location}</p>
                  <h3 className="mt-3 text-2xl font-black tracking-[-0.03em] text-slate-950">{project.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{project.summary}</p>
                  <div className="mt-5 space-y-2 text-sm text-slate-700">
                    <p>
                      <strong>Budget:</strong> {project.budget}
                    </p>
                    <p>
                      <strong>Impact:</strong> {project.impact}
                    </p>
                  </div>
                  <div className="mt-5">
                    <ProgressBar value={project.progress} label={`${project.progress}% funded or completed`} />
                  </div>
                  <button
                    className="mt-6 w-full rounded-full bg-[#0B6E4F] px-5 py-3 font-extrabold text-white transition hover:bg-[#07583f]"
                    type="button"
                    onClick={() => setActiveProject(project)}
                  >
                    View Project
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
      <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
    </>
  );
}

function DonatePage() {
  return (
    <>
      <PageHero title="Donate" subtitle="Your gift can become food, school support, transport, or emergency care." />
      <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#0B6E4F]">Why donate</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">A small gift can reach a home that has been waiting for help.</h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Donations help us buy food, cover school essentials, support medical movement, and reach families deep in
              the villages of Uganda.
            </p>
            <div className="mt-8 rounded-[2rem] bg-slate-50 p-6">
              <h3 className="text-xl font-black text-slate-950">Mobile money instructions</h3>
              <ol className="mt-4 space-y-3 text-left leading-7 text-slate-600">
                <li>1. Send your gift to the foundation mobile money line: +256 785 693 373.</li>
                <li>2. Use the reference: PMF DONATION.</li>
                <li>3. Send a WhatsApp message with your name and amount for a receipt.</li>
              </ol>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <DonationPanel />
          </Reveal>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#0B6E4F]">Transparency</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">Where your money goes</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">Clear categories help donors see how support becomes practical help.</p>
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {moneyUse.map((item, index) => (
              <Reveal key={item.label} delay={index * 0.08} className="rounded-[2rem] bg-white p-7 shadow-xl shadow-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-950">{item.label}</h3>
                  <span className="text-3xl font-black text-[#0B6E4F]">{item.value}%</span>
                </div>
                <div className="mt-5">
                  <ProgressBar value={item.value} label={`${item.value}% of giving`} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function GalleryPage() {
  const [activeItem, setActiveItem] = useState<(typeof galleryItems)[number] | null>(null);

  return (
    <>
      <PageHero title="Gallery" subtitle="Field photos and video-ready stories from village outreach." />
      <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#0B6E4F]">Field evidence</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">Images, updates, and stories from the villages</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((item, index) => (
              <motion.button
                key={item.title}
                className="group relative h-80 overflow-hidden rounded-[2rem] bg-slate-900 text-left"
                type="button"
                onClick={() => setActiveItem(item)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.05, ease: "easeOut" }}
                whileHover={{ y: -7 }}
              >
                <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={item.src} alt={item.title} />
                <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {item.type === "video" && (
                  <span className="absolute left-5 top-5 rounded-full bg-white/92 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-950">
                    Video
                  </span>
                )}
                <span className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="block text-2xl font-black">{item.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-white/80">{item.caption}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
      <Lightbox item={activeItem} onClose={() => setActiveItem(null)} />
    </>
  );
}

function ContactPage() {
  const [contactStatus, setContactStatus] = useState("");

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const subject = name ? `Website message from ${name}` : "Website message from PERSIS McGREGOR FOUNDATION site";
    const body = [
      `Name: ${name || "Not provided"}`,
      `Email: ${email || "Not provided"}`,
      "",
      "Message:",
      message || "Not provided",
    ].join("\n");

    setContactStatus("Opening your email app with the message ready to send.");
    window.location.href = `mailto:persismcgregorfoundation@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <>
      <PageHero title="Contact" subtitle="Reach the foundation, send a message, or start a donation conversation." />
      <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#0B6E4F]">Speak with us</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">We would love to hear from you.</h2>
            <div className="mt-8 space-y-5 text-lg leading-8 text-slate-600">
              <p>
                <strong className="text-slate-950">Phone:</strong> +256 785 693 373
              </p>
              <p>
                <strong className="text-slate-950">Email:</strong>persismcgregorfoundation@gmail.com
              </p>
              <p>
                <strong className="text-slate-950">Location:</strong> Uganda village outreach network
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button href="https://wa.me/256772689323?text=Hello%20PERSIS%20McGREGOR%20FOUNDATION" variant="primary">
                WhatsApp Us
              </Button>
              <Button href="mailto:persismcgregorfoundation@gmail.com" variant="outlineDark">
                Send Email
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <form className="rounded-[2rem] bg-slate-50 p-6 sm:p-8" onSubmit={handleContactSubmit}>
              <h3 className="text-2xl font-black text-slate-950">Send a message</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <FormField id="contact-name" label="Name" name="name" placeholder="Your name" />
                <FormField id="contact-email" label="Email" name="email" placeholder="you@example.com" type="email" />
              </div>
              <label className="mt-4 block text-left text-sm font-bold text-slate-950" htmlFor="contact-message">
                Message
                <textarea
                  className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-[#0B6E4F]"
                  id="contact-message"
                  name="message"
                  placeholder="How can we help?"
                />
              </label>
              <button className="mt-5 rounded-full bg-[#F59E0B] px-6 py-4 font-extrabold text-slate-950" type="submit">
                Send Message
              </button>
              {contactStatus && <p className="mt-4 rounded-2xl bg-[#0B6E4F]/10 px-4 py-3 text-sm font-semibold text-[#0B6E4F]">{contactStatus}</p>}
            </form>
          </Reveal>
        </div>
      </section>
      <section className="bg-slate-50 px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-100">
          <iframe
            className="h-[420px] w-full"
            title="Map of Uganda"
            src="https://www.google.com/maps?q=Uganda&output=embed"
            loading="lazy"
          />
        </div>
      </section>
    </>
  );
}

function DonationPanel({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState("10000");
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileProvider, setMobileProvider] = useState<"MTN" | "AIRTEL" | "">("");
  const [showMobileMoneyDetails, setShowMobileMoneyDetails] = useState(false);
  const [message, setMessage] = useState("");
  const donationAmounts = ["5000", "10000", "50000", "custom"];

  const displayAmount = selected === "custom" ? customAmount || "Custom" : Number(selected).toLocaleString();

  function getDonationAmount() {
    const amount = selected === "custom" ? customAmount : selected;

    if (!amount || Number(amount) <= 0) {
      setMessage("Please enter a valid custom amount before continuing.");
      return null;
    }

    return Number(amount);
  }

  function normalizeUgandaMobileNumber(value: string) {
    const digits = value.replace(/\D/g, "");

    if (digits.startsWith("256") && digits.length === 12) return `+${digits}`;
    if (digits.startsWith("0") && digits.length === 10) return `+256${digits.slice(1)}`;
    if (digits.startsWith("7") && digits.length === 9) return `+256${digits}`;

    return "";
  }

  const flutterwaveAmount = selected === "custom" ? Number(customAmount) || 10000 : Number(selected);
  const flutterwaveCustomer = {
    email: donorEmail || "persismcgregorfoundation@gmail.com",
    phone_number: normalizeUgandaMobileNumber(mobileNumber) || "+256785693373",
    name: donorName || "Valued Supporter",
  };

  const baseFlutterwaveConfig = {
    public_key: "FLWPUBK_TEST-SANDBOXDEMOKEY-X", // Live key can be inserted here seamlessly
    tx_ref: `PMF-${Date.now()}`,
    amount: flutterwaveAmount,
    currency: "UGX",
    customer: flutterwaveCustomer,
  };

  // Flutterwave Configuration for securely integrating Mobile Money
  const mobileMoneyFlutterwaveConfig = {
    ...baseFlutterwaveConfig,
    payment_options: "mobilemoneyuganda",
    meta: {
      mobile_network: mobileProvider || "not selected",
      donor_mobile_number: normalizeUgandaMobileNumber(mobileNumber) || "not provided",
    },
    customizations: {
      title: "PERSIS McGREGOR FOUNDATION",
      description: `${mobileProvider || "Mobile Money"} Donation`,
      logo: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=80&q=80",
    },
  };

  const handleMobileMoneyFlutterwave = useFlutterwave(mobileMoneyFlutterwaveConfig);

  function saveDonationLocally(method: string, amount: number) {
    try {
      const record = {
        amount,
        currency: "UGX",
        method,
        createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem("pmf-donations") || "[]");
      localStorage.setItem("pmf-donations", JSON.stringify([record, ...existing].slice(0, 20)));
    } catch {
      // Ignored
    }
  }

  function startPayPalPayment() {
    const amount = getDonationAmount();
    if (!amount) return;

    setMessage("Redirecting to secure PayPal checkout...");
    saveDonationLocally("PayPal", amount);

    // Convert UGX to roughly USD for PayPal since it does not natively support UGX
    const usdAmount = (amount / 3800).toFixed(2);
    const paypalUrl = `https://www.paypal.com/donate/?business=${encodeURIComponent(
      "hello@persismcgregorfoundation@gmail.com"
    )}&item_name=${encodeURIComponent("PERSIS McGREGOR FOUNDATION Donation")}&currency_code=USD&amount=${usdAmount}`;

    setTimeout(() => {
      window.open(paypalUrl, "_blank");
      setMessage(`Thank you! Opened PayPal checkout for ${amount.toLocaleString()} UGX.`);
    }, 600);
  }

  function startSendwavePayment() {
    const amount = getDonationAmount();
    if (!amount) return;

    saveDonationLocally("Sendwave", amount);

    const sendwaveUrl = "https://www.sendwave.com/en/send-money-to-uganda";
    const whatsappText = `Hello PERSIS McGREGOR FOUNDATION. I, ${
      donorName || "a supporter"
    }, want to donate ${amount.toLocaleString()} UGX through Sendwave. My email is ${
      donorEmail || "not provided"
    }. Please confirm the recipient name and phone number.`;

    const newWindow = window.open(sendwaveUrl, "_blank", "noopener,noreferrer");

    if (!newWindow) {
      window.location.href = sendwaveUrl;
    }

    setMessage(
      `Opening Sendwave. In Sendwave, send ${amount.toLocaleString()} UGX to PERSIS McGREGOR FOUNDATION using +256 785 693 373. Need help? Message us on WhatsApp: https://wa.me/256772689323?text=${encodeURIComponent(
        whatsappText
      )}`
    );
  }

  function startMobileMoneyPayment() {
    const amount = getDonationAmount();
    if (!amount) return;

    const normalizedMobileNumber = normalizeUgandaMobileNumber(mobileNumber);

    if (!mobileProvider || !normalizedMobileNumber) {
      setShowMobileMoneyDetails(true);
      setMessage("Enter your Mobile Money number and choose MTN or Airtel before continuing.");
      return;
    }

    setMessage(`Opening ${mobileProvider} Mobile Money secure checkout for ${normalizedMobileNumber}...`);
    saveDonationLocally(`${mobileProvider} Mobile Money`, amount);

    try {
      handleMobileMoneyFlutterwave({
        callback: (response: { status?: string }) => {
          console.log("Flutterwave response:", response);
          const isSuccessful = response.status === "successful" || response.status === "completed";
          setMessage(
            isSuccessful
              ? `Thank you! Your ${mobileProvider} Mobile Money donation of ${amount.toLocaleString()} UGX was successful.`
              : "Mobile Money checkout ended before a successful payment was confirmed. Please try again."
          );
        },
        onClose: () => {
          setMessage(
            "Secure checkout closed. If you need assistance, please use the direct Mobile Money transfer instructions above."
          );
        },
      });
    } catch {
      // Smooth automatic fallback if the Flutterwave modal script is blocked
      const text = `Hello PERSIS McGREGOR FOUNDATION. I, ${
        donorName || "a supporter"
      }, would like to make a ${mobileProvider} Mobile Money donation of ${amount.toLocaleString()} UGX from ${normalizedMobileNumber}. My email is ${
        donorEmail || "not provided"
      }.`;
      window.open(`https://wa.me/256772689323?text=${encodeURIComponent(text)}`, "_blank");
      setMessage("Redirected to WhatsApp for secure Mobile Money transfer.");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Default to PayPal when submitting via Enter key
    startPayPalPayment();
  }

  return (
    <motion.form
      className={`glass-form mx-auto mt-10 rounded-[2rem] p-6 text-left shadow-2xl sm:p-8 ${
        compact ? "max-w-4xl" : ""
      }`}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-950">Choose a quick donation</h3>
          <p className="mt-1 text-slate-600">Select an amount in Ugandan shillings.</p>
        </div>
        <p className="rounded-full bg-[#0B6E4F]/10 px-4 py-2 text-sm font-black text-[#0B6E4F]">{displayAmount} UGX</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {donationAmounts.map((amount) => {
          const isSelected = selected === amount;
          const label = amount === "custom" ? "Custom" : `${Number(amount).toLocaleString()} UGX`;

          return (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelected(amount);
                setMessage("");
              }}
              className={`rounded-2xl border px-4 py-4 text-sm font-black transition ${
                isSelected
                  ? "border-[#0B6E4F] bg-[#0B6E4F] text-white"
                  : "border-slate-200 bg-slate-50 text-slate-950 hover:border-[#0B6E4F]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {selected === "custom" && (
        <label className="mt-4 block text-sm font-bold text-slate-950" htmlFor="custom-amount">
          Custom amount in UGX
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-[#0B6E4F]"
            id="custom-amount"
            inputMode="numeric"
            min="1"
            onChange={(event) => setCustomAmount(event.target.value)}
            placeholder="Enter amount"
            type="number"
            value={customAmount}
          />
        </label>
      )}

      {!compact && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField
            id="donor-name"
            label="Name"
            placeholder="Your name"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
          />
          <FormField
            id="donor-email"
            label="Email"
            placeholder="you@example.com"
            type="email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
          />
        </div>
      )}

      {showMobileMoneyDetails && (
        <motion.div
          className="mt-6 rounded-[2rem] border border-[#0B6E4F]/20 bg-[#0B6E4F]/5 p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4 className="text-lg font-black text-slate-950">Mobile Money details</h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Choose your provider and enter the phone number that will approve the payment prompt.
              </p>
            </div>
            <button
              className="text-sm font-bold text-[#0B6E4F] hover:text-[#F59E0B]"
              type="button"
              onClick={() => setShowMobileMoneyDetails(false)}
            >
              Hide
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(["MTN", "AIRTEL"] as const).map((provider) => {
              const selectedProvider = mobileProvider === provider;

              return (
                <button
                  key={provider}
                  className={`rounded-2xl border px-4 py-4 text-sm font-black transition ${
                    selectedProvider
                      ? "border-[#0B6E4F] bg-[#0B6E4F] text-white"
                      : "border-slate-200 bg-white text-slate-950 hover:border-[#0B6E4F]"
                  }`}
                  type="button"
                  onClick={() => {
                    setMobileProvider(provider);
                    setMessage("");
                  }}
                >
                  {provider} Mobile Money
                </button>
              );
            })}
          </div>

          <label className="mt-4 block text-sm font-bold text-slate-950" htmlFor="mobile-money-number">
            Mobile Money number
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-[#0B6E4F]"
              id="mobile-money-number"
              inputMode="tel"
              onChange={(event) => {
                setMobileNumber(event.target.value);
                setMessage("");
              }}
              placeholder="Example: 0785693373"
              type="tel"
              value={mobileNumber}
            />
          </label>

          <button
            className="mt-5 w-full rounded-full bg-[#0B6E4F] px-5 py-4 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#07583f]"
            type="button"
            onClick={startMobileMoneyPayment}
          >
            Continue with {mobileProvider || "MTN or Airtel"} Mobile Money
          </button>
        </motion.div>
      )}

      <p className="mt-5 text-sm leading-6 text-slate-500">
        Choose PayPal, Sendwave, or Mobile Money. Sendwave opens the official Uganda transfer page; Mobile Money opens secure checkout.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <button
          className="rounded-full bg-[#F59E0B] px-5 py-4 font-extrabold text-slate-950 transition hover:-translate-y-0.5"
          type="button"
          onClick={startPayPalPayment}
        >
          Donate via PayPal
        </button>
        <button
          className="rounded-full border border-slate-300 px-5 py-4 font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:border-[#0B6E4F]"
          type="button"
          onClick={startSendwavePayment}
        >
          Donate via Sendwave
        </button>
        <button
          className="rounded-full border border-slate-300 px-5 py-4 font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:border-[#0B6E4F]"
          type="button"
          onClick={() => {
            setShowMobileMoneyDetails(true);
            setMessage("Enter your Mobile Money number and choose MTN or Airtel to continue.");
          }}
        >
          Donate via Mobile Money
        </button>
      </div>

      {message && (
        <p className="mt-5 rounded-2xl bg-[#0B6E4F]/10 px-4 py-3 text-sm font-semibold text-[#0B6E4F]">
          {message}
        </p>
      )}
    </motion.form>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.article
      className="glass-card group overflow-hidden rounded-[2rem]"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -8 }}
    >
      <img className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" src={project.image} alt={project.title} />
      <div className="p-6">
        <h3 className="text-2xl font-black tracking-[-0.03em] text-slate-950">{project.title}</h3>
        <p className="mt-3 leading-7 text-slate-600">{project.summary}</p>
        <a className="mt-6 inline-flex font-extrabold text-[#0B6E4F] hover:text-[#F59E0B]" href={routeHref("projects")}>
          View Project
        </a>
      </div>
    </motion.article>
  );
}

function TestimonialSlider() {
  const [active, setActive] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const testimonial = testimonials[active];

  function showPrevious() {
    setActive((current) => (current - 1 + testimonials.length) % testimonials.length);
  }

  function showNext() {
    setActive((current) => (current + 1) % testimonials.length);
  }

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setInterval(() => {
      showNext();
    }, 5500);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion]);

  return (
    <div className="glass-card mt-12 rounded-[2rem] p-6 sm:p-10">
      <AnimatePresence mode="wait">
        <motion.figure
          key={testimonial.name}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.x > 80) showPrevious();
            if (info.offset.x < -80) showNext();
          }}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -14 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
        >
          <blockquote className="max-w-5xl text-2xl font-black leading-snug tracking-[-0.03em] text-slate-950 sm:text-4xl">
            "{testimonial.quote}"
          </blockquote>
          <figcaption className="mt-8">
            <p className="text-lg font-black text-[#0B6E4F]">{testimonial.name}</p>
            <p className="text-slate-600">{testimonial.role}</p>
          </figcaption>
        </motion.figure>
      </AnimatePresence>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
        {testimonials.map((item, index) => (
          <button
            key={item.name}
            className={`h-3 rounded-full transition-all ${index === active ? "w-10 bg-[#0B6E4F]" : "w-3 bg-slate-300"}`}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show testimonial ${index + 1}`}
          />
        ))}
        </div>
        <div className="flex gap-2">
          <button className="glass-mini rounded-full px-4 py-2 text-sm font-black" type="button" onClick={showPrevious}>Prev</button>
          <button className="glass-mini rounded-full px-4 py-2 text-sm font-black" type="button" onClick={showNext}>Next</button>
        </div>
      </div>
    </div>
  );
}

function PageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="page-hero px-5 pb-20 pt-32 text-white sm:px-8 lg:px-10 lg:pb-28 lg:pt-40">
      <div className="mx-auto max-w-7xl">
        <motion.p
          className="text-sm font-extrabold uppercase tracking-[0.28em] text-[#F59E0B]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          PERSIS McGREGOR FOUNDATION
        </motion.p>
        <motion.h1
          className="mt-4 max-w-4xl text-5xl font-black tracking-[-0.06em] sm:text-7xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: "easeOut" }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="mt-6 max-w-2xl text-xl leading-9 text-white/82"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}

function Button({ children, href, variant }: { children: ReactNode; href: string; variant: "accent" | "light" | "primary" | "outlineDark" }) {
  const styles = {
    accent: "bg-[#F59E0B] text-slate-950 hover:bg-[#fbbf24]",
    light: "border border-white/70 bg-white/10 text-white hover:bg-white hover:text-slate-950",
    primary: "bg-[#0B6E4F] text-white hover:bg-[#07583f]",
    outlineDark: "border border-slate-300 text-slate-950 hover:border-[#0B6E4F] hover:text-[#0B6E4F]",
  }[variant];

  return (
    <motion.a
      className={`inline-flex items-center justify-center rounded-full px-7 py-4 text-sm font-extrabold uppercase tracking-[0.16em] transition ${styles}`}
      href={href}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.a>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.65, delay: prefersReducedMotion ? 0 : delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;

    if (prefersReducedMotion) {
      setCount(value);
      return;
    }

    const startTime = performance.now();
    const duration = 1400;
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, prefersReducedMotion, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-bold text-slate-600">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="h-full rounded-full bg-[#F59E0B]"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-5 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-8"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#0B6E4F]">{project.location}</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">{project.title}</h2>
              </div>
              <button className="rounded-full bg-slate-100 px-4 py-2 font-black text-slate-950" type="button" onClick={onClose}>
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {project.photos.map((photo) => (
                <img key={photo} className="h-64 w-full rounded-3xl object-cover" src={photo} alt={project.title} />
              ))}
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Budget used</p>
                <p className="mt-2 text-xl font-black text-slate-950">{project.budget}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 md:col-span-2">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Impact</p>
                <p className="mt-2 leading-7 text-slate-700">{project.impact}</p>
              </div>
            </div>
            <div className="mt-6">
              <ProgressBar value={project.progress} label="Project progress" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Lightbox({ item, onClose }: { item: (typeof galleryItems)[number] | null; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerShellRef = useRef<HTMLDivElement | null>(null);
  const pendingQualityChange = useRef<{ time: number; shouldPlay: boolean } | null>(null);
  const hideControlsTimer = useRef<number | null>(null);
  const [selectedQuality, setSelectedQuality] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoSources = item && "videoSources" in item ? item.videoSources ?? [] : [];
  const activeVideoSource = videoSources[selectedQuality] || videoSources[0];

  useEffect(() => {
    setSelectedQuality(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setControlsVisible(true);
    setShowSettings(false);
    pendingQualityChange.current = null;
  }, [item]);

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) {
        window.clearTimeout(hideControlsTimer.current);
      }
    };
  }, []);

  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  }

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  function showControlsTemporarily() {
    setControlsVisible(true);

    if (hideControlsTimer.current) {
      window.clearTimeout(hideControlsTimer.current);
    }

    if (videoRef.current && !videoRef.current.paused && !showSettings) {
      hideControlsTimer.current = window.setTimeout(() => setControlsVisible(false), 2600);
    }
  }

  function seekBy(seconds: number) {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), duration || video.duration || 0);
    setCurrentTime(video.currentTime);
  }

  function changeQuality(index: number) {
    const video = videoRef.current;
    pendingQualityChange.current = {
      time: video?.currentTime || 0,
      shouldPlay: video ? !video.paused : false,
    };
    setSelectedQuality(index);
    setShowSettings(false);
  }

  function changePlaybackRate(rate: number) {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
    }

    setPlaybackRate(rate);
  }

  function changeVolume(nextVolume: number) {
    const boundedVolume = Math.min(Math.max(nextVolume, 0), 1);
    const video = videoRef.current;

    if (video) {
      video.volume = boundedVolume;
      video.muted = boundedVolume === 0;
    }

    setVolume(boundedVolume);
    setIsMuted(boundedVolume === 0);
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;

    if (!nextMuted && volume === 0) {
      video.volume = 1;
      setVolume(1);
    }

    setIsMuted(nextMuted);
  }

  function toggleFullscreen() {
    const shell = playerShellRef.current;

    if (!shell) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }

    shell.requestFullscreen?.();
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = playbackRate;
    setDuration(video.duration || 0);

    if (pendingQualityChange.current) {
      video.currentTime = Math.min(pendingQualityChange.current.time, video.duration || pendingQualityChange.current.time);

      if (pendingQualityChange.current.shouldPlay) {
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }

      pendingQualityChange.current = null;
    }
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/82 p-5 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative bg-slate-950">
              {item.type === "video" && activeVideoSource ? (
                <div ref={playerShellRef} className="relative bg-black" onMouseMove={showControlsTemporarily}>
                  <video
                    key={`${item.title}-${selectedQuality}`}
                    ref={videoRef}
                    className="aspect-video max-h-[72vh] w-full bg-black object-contain"
                    onClick={() => {
                      togglePlayback();
                      showControlsTemporarily();
                    }}
                    onEnded={() => setIsPlaying(false)}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                    playsInline
                    poster={item.src}
                    preload="metadata"
                    src={activeVideoSource.src}
                  />
                  <button
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                    className={`absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white transition ${
                      isPlaying ? "scale-75 opacity-0" : "scale-100 opacity-100"
                    }`}
                    type="button"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>

                  <div
                    className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-3 pb-3 pt-20 text-white transition-opacity duration-200 ${
                      controlsVisible || !isPlaying || showSettings ? "opacity-100" : "opacity-0"
                    }`}
                    onMouseMove={showControlsTemporarily}
                  >
                    <input
                      aria-label="Video progress"
                      className="youtube-range w-full"
                      max={duration || 0}
                      min="0"
                      onChange={(event) => {
                        const nextTime = Number(event.target.value);
                        if (videoRef.current) {
                          videoRef.current.currentTime = nextTime;
                        }
                        setCurrentTime(nextTime);
                      }}
                      step="0.1"
                      style={{
                        background: `linear-gradient(to right, #ff0000 0%, #ff0000 ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,.45) ${
                          duration ? (currentTime / duration) * 100 : 0
                        }%, rgba(255,255,255,.45) 100%)`,
                      }}
                      type="range"
                      value={currentTime}
                    />

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <YouTubeButton label={isPlaying ? "Pause" : "Play"} onClick={togglePlayback}>
                          {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </YouTubeButton>
                        <YouTubeButton label="Back 10 seconds" onClick={() => seekBy(-10)}>
                          <span className="text-xs font-black">-10</span>
                        </YouTubeButton>
                        <YouTubeButton label="Forward 10 seconds" onClick={() => seekBy(10)}>
                          <span className="text-xs font-black">+10</span>
                        </YouTubeButton>
                        <div className="hidden items-center gap-2 sm:flex">
                          <YouTubeButton label={isMuted ? "Unmute" : "Mute"} onClick={toggleMute}>
                            {isMuted || volume === 0 ? <MutedIcon /> : <VolumeIcon />}
                          </YouTubeButton>
                          <input
                            aria-label="Volume"
                            className="youtube-volume w-20"
                            max="1"
                            min="0"
                            onChange={(event) => changeVolume(Number(event.target.value))}
                            step="0.05"
                            type="range"
                            value={isMuted ? 0 : volume}
                          />
                        </div>
                        <span className="whitespace-nowrap text-xs font-semibold text-white sm:text-sm">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <YouTubeButton label="Settings" onClick={() => setShowSettings((current) => !current)}>
                            <SettingsIcon />
                          </YouTubeButton>
                          {showSettings && (
                            <div className="absolute bottom-11 right-0 w-64 rounded-xl bg-black/95 p-3 text-sm text-white shadow-2xl ring-1 ring-white/10">
                              <p className="px-2 pb-2 text-xs font-black uppercase tracking-[0.16em] text-white/55">Quality</p>
                              <div className="grid gap-1">
                                {videoSources.map((source, index) => (
                                  <button
                                    key={source.label}
                                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-left font-semibold hover:bg-white/10 ${
                                      selectedQuality === index ? "text-white" : "text-white/72"
                                    }`}
                                    type="button"
                                    onClick={() => changeQuality(index)}
                                  >
                                    <span>{source.label}</span>
                                    {selectedQuality === index && <span className="h-2 w-2 rounded-full bg-[#ff0000]" />}
                                  </button>
                                ))}
                              </div>
                              <div className="my-3 h-px bg-white/10" />
                              <p className="px-2 pb-2 text-xs font-black uppercase tracking-[0.16em] text-white/55">Speed</p>
                              <div className="grid grid-cols-4 gap-1">
                                {[0.5, 1, 1.25, 1.5].map((rate) => (
                                  <button
                                    key={rate}
                                    className={`rounded-lg px-2 py-2 text-xs font-black hover:bg-white/10 ${playbackRate === rate ? "bg-white/15 text-white" : "text-white/70"}`}
                                    type="button"
                                    onClick={() => changePlaybackRate(rate)}
                                  >
                                    {rate}x
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <YouTubeButton label="Fullscreen" onClick={toggleFullscreen}>
                          <FullscreenIcon />
                        </YouTubeButton>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <img className="max-h-[70vh] w-full object-cover" src={item.src} alt={item.title} />
              )}
            </div>
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#0B6E4F]">{item.type}</p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">{item.title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{item.caption}</p>
              </div>
              <button className="rounded-full bg-slate-100 px-5 py-3 font-black text-slate-950" type="button" onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function YouTubeButton({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15 focus:bg-white/15 focus:outline-none"
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zm-2.5-9.23v2.06a8 8 0 0 1 0 14.34v2.06a10 10 0 0 0 0-18.46z" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 4V5L7 9H3zm13.59 3L14 9.41 15.41 8 18 10.59 20.59 8 22 9.41 19.41 12 22 14.59 20.59 16 18 13.41 15.41 16 14 14.59 16.59 12z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65-2-3.46-2.49 1a7.34 7.34 0 0 0-1.69-.98L15 3h-4l-.36 2.93c-.6.23-1.17.56-1.69.98l-2.49-1-2 3.46 2.11 1.65c-.04.32-.07.65-.07.98s.02.66.07.98l-2.11 1.65 2 3.46 2.49-1c.52.42 1.09.75 1.69.98L11 21h4l.36-2.93c.6-.23 1.17-.56 1.69-.98l2.49 1 2-3.46-2.11-1.65zM13 15.5A3.5 3.5 0 1 1 13 8a3.5 3.5 0 0 1 0 7.5z" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 14H5v5h5v-2H7v-3zm0-4h2V7h3V5H5v7h2V7zm10 7h-3v2h5v-5h-2v3zm-3-12v2h3v3h2V5h-5z" />
    </svg>
  );
}

function FormField({
  id,
  label,
  name,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  id: string;
  label: string;
  name?: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block text-left text-sm font-bold text-slate-950" htmlFor={id}>
      {label}
      <input
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-[#0B6E4F]"
        id={id}
        name={name || id}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

function LineIcon({ type }: { type: string }) {
  const paths = useMemo(() => {
    if (type === "food") return ["M4 4v16", "M8 4v7a4 4 0 0 1-4 4", "M14 4v16", "M18 4c2 2 2 7 0 9v7"];
    if (type === "school") return ["M3 8l9-4 9 4-9 4-9-4Z", "M7 10v5c3 2 7 2 10 0v-5", "M21 8v7"];
    if (type === "village") return ["M3 20h18", "M5 20V9l7-5 7 5v11", "M10 20v-6h4v6"];
    return ["M7 20v-5", "M17 20v-5", "M12 20v-8", "M5 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M19 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"];
  }, [type]);

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B6E4F]/10 text-[#0B6E4F]">
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {paths.map((path) => (
          <path key={path} d={path} />
        ))}
      </svg>
    </div>
  );
}


function Footer({ isDark }: { isDark: boolean }) {
  return (
    <footer className={`glass-footer px-5 py-12 sm:px-8 lg:px-10 ${isDark ? "text-white" : "text-slate-900"}`}>
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <p className="text-lg font-black uppercase tracking-[0.2em] text-[#F59E0B]">PERSIS McGREGOR FOUNDATION</p>
          <p className={`mt-4 max-w-sm leading-7 ${isDark ? "text-white/65" : "text-slate-600"}`}>
            Changing lives in rural Uganda through food, education, hope, and steady family-centered care.
          </p>
        </div>
        <div>
          <h3 className="font-black">Quick links</h3>
          <div className={`mt-4 grid gap-3 ${isDark ? "text-white/65" : "text-slate-600"}`}>
            {navItems.map((item) => (
              <a key={item.route} className={`hover:${isDark ? "text-white" : "text-slate-950"}`} href={routeHref(item.route)}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-black">Contact</h3>
          <div className={`mt-4 grid gap-3 ${isDark ? "text-white/65" : "text-slate-600"}`}>
            <a className={`hover:${isDark ? "text-white" : "text-slate-950"}`} href="mailto:hello@persismcgregorfoundation@gmail.com">Email us</a>
            <a className={`hover:${isDark ? "text-white" : "text-slate-950"}`} href="https://wa.me/256772689323">WhatsApp</a>
            <p>+256 785 693 373</p>
          </div>
        </div>
        <div>
          <h3 className="font-black">Keep giving close</h3>
          <p className={`mt-4 leading-7 ${isDark ? "text-white/65" : "text-slate-600"}`}>
            A family in a village may be waiting for the next outreach.
          </p>
          <a className="mt-5 inline-flex rounded-full bg-[#F59E0B] px-5 py-3 font-black text-slate-950" href={routeHref("donate")}>
            Donate Now
          </a>
        </div>
      </div>
      <div className={`mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-white/10 text-white/45" : "border-slate-200 text-slate-500"}`}>
        <p>Copyright {new Date().getFullYear()} PERSIS McGREGOR FOUNDATION. All rights reserved.</p>
        <p>Social: Facebook / Instagram / YouTube</p>
      </div>
    </footer>
  );
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
