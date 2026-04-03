import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Users, Award, ArrowRight, BookOpen, CheckCircle, Zap, Shield, Globe, Play, Mail, Phone, MapPin, Send, ChevronRight, Target, Heart, TrendingUp, GraduationCap } from "lucide-react";
import api from "../utils/api";
import CourseCard from "../components/common/CourseCard";
import AnimatedStatCard from "../components/common/AnimatedStatCard";

const stats = [
  { icon: Users,    label: "Active Learners",    value: "50,000+", delay: 0   },
  { icon: BookOpen, label: "Courses Available",   value: "500+",    delay: 150 },
  { icon: Award,    label: "Certificates Issued", value: "30,000+", delay: 300 },
  { icon: Star,     label: "Average Rating",      value: "4.8/5",   delay: 450 },
];

const features = [
  { icon: Zap,         title: "Learn at Your Pace",    desc: "Lifetime access to all enrolled courses. Watch anytime, anywhere on any device."                },
  { icon: Shield,      title: "Verified Certificates", desc: "Earn certificates with unique IDs, verifiable by any employer worldwide."                        },
  { icon: Globe,       title: "Expert Instructors",    desc: "Learn from working professionals with real-world industry experience."                            },
  { icon: CheckCircle, title: "Hands-on Projects",     desc: "Build real projects with quizzes and assignments after every lesson."                            },
];

const services = [
  { icon: BookOpen,    title: "Online Courses",      desc: "500+ courses in Web Dev, Data Science, Design, Marketing, Finance & more. New courses added every month.", color: "bg-blue-500"    },
  { icon: Award,       title: "Certificates",        desc: "Earn industry-recognized certificates on completion. Share on LinkedIn, download as PDF.",               color: "bg-amber-500"   },
  { icon: Target,      title: "Quizzes & Assignments", desc: "Test your knowledge after every lesson with interactive quizzes and get instant feedback.",           color: "bg-emerald-500" },
  { icon: Users,       title: "Community Learning",  desc: "Connect with 50,000+ learners, share progress, and grow together in a supportive community.",           color: "bg-violet-500"  },
  { icon: TrendingUp,  title: "Career Growth",       desc: "Industry-relevant curriculum designed to help you land your dream job or freelance clients.",           color: "bg-rose-500"    },
  { icon: Heart,       title: "Lifetime Access",     desc: "Buy once, access forever. All future updates to your enrolled courses are completely free.",            color: "bg-orange-500"  },
];

const testimonials = [
  { name: "Ankita Sharma", role: "Frontend Developer", company: "TCS",       avatar: "AS", text: "Learnify's React course helped me land a job in just 3 months. The content is practical and the instructor's explanations are crystal clear!", rating: 5 },
  { name: "Rohan Mehta",   role: "Data Analyst",       company: "Infosys",   avatar: "RM", text: "The Python and SQL courses boosted my MIS career significantly. The certificates look professional too. Highly recommended!", rating: 5 },
  { name: "Pooja Nair",    role: "Digital Marketer",   company: "Freelancer", avatar: "PN", text: "After completing the Digital Marketing course, I started my own freelancing business. Best investment I've ever made!", rating: 5 },
];

const faqs = [
  { q: "Do I get lifetime access to courses?",        a: "Yes! Once you enroll in a course, you get lifetime access. All future course updates are also included for free."                                                                   },
  { q: "How can I use my certificate?",               a: "Each Learnify certificate has a unique verification ID. Employers can verify it instantly. You can also share it directly on LinkedIn."                                            },
  { q: "Can I access courses on mobile?",             a: "Absolutely! Learnify is fully responsive and works perfectly on mobile, tablet, and desktop devices."                                                                              },
  { q: "What is your refund policy?",                 a: "If you're not satisfied with a course, you can request a full 100% refund within 7 days of purchase. No questions asked."                                                        },
  { q: "Are there quizzes and assignments?",          a: "Yes! Every course includes quizzes after lessons to test your understanding. You must pass quizzes to complete the course and earn your certificate."                              },
];

export default function Home() {
  const [featured, setFeatured]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [openFaq, setOpenFaq]     = useState(null);
  const [contactForm, setContact] = useState({ name: "", email: "", message: "" });
  const [sent, setSent]           = useState(false);

  useEffect(() => {
    api.get("/courses?limit=6&sort=-enrolledCount")
      .then(r => setFeatured(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleContact = (e) => {
    e.preventDefault();
    setSent(true);
    setContact({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="overflow-x-hidden">

      {/* HERO */}
      <section id="home" className="relative bg-gradient-to-br from-slate-900 via-primary-950 to-violet-950 text-white py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{backgroundImage:"radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)"}} />
        <div className="page-container relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
              <Zap size={14} className="text-amber-400" />
              <span>India's #1 Online Learning Platform</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              Learn Skills That<br/>
              <span className="bg-gradient-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">Actually Matter</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join 50,000+ learners. Get certified by industry experts. Build real projects and land your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses" className="btn-primary text-base py-3.5 px-8">Explore Courses <ArrowRight size={18} /></Link>
              <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all text-base">
                <Play size={16} /> Start Free Today
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-slate-400">
              {["No Credit Card Required", "Lifetime Access", "Certificate Included"].map(t => (
                <span key={t} className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-400" /> {t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-surface-950" />
      </section>

      {/* STATS */}
      <section className="py-14 bg-white dark:bg-surface-950">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((s) => <AnimatedStatCard key={s.label} icon={s.icon} label={s.label} value={s.value} delay={s.delay} />)}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="py-16 bg-slate-50 dark:bg-surface-900">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider mb-2">Top Picks</p>
              <h2 className="section-title">Featured Courses</h2>
            </div>
            <Link to="/courses" className="btn-secondary hidden sm:flex text-sm">View All <ArrowRight size={16} /></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton aspect-video" />
                  <div className="p-5 space-y-3"><div className="skeleton h-4 w-20" /><div className="skeleton h-5 w-full" /><div className="skeleton h-4 w-3/4" /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(c => <CourseCard key={c._id} course={c} />)}
            </div>
          )}
          <div className="text-center mt-8 sm:hidden">
            <Link to="/courses" className="btn-secondary">View All Courses <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 bg-white dark:bg-surface-950">
        <div className="page-container">
          <div className="text-center mb-14">
            <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider mb-2">What We Offer</p>
            <h2 className="section-title mb-4">Our Services</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Everything you need to learn, grow, and succeed — all in one platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="card p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <s.icon size={26} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:gap-2 transition-all">
                  Learn more <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY LEARNIFY */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-violet-700 text-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary-200 font-semibold text-sm uppercase tracking-wider mb-3">Why Choose Us</p>
              <h2 className="font-display text-4xl font-bold mb-5">Why Learnify is the Best?</h2>
              <p className="text-primary-100 mb-8 leading-relaxed">Our platform is designed not just to show videos — we ensure you actually learn and advance in your career.</p>
              <div className="space-y-4">
                {[
                  ["Expert-Curated Content",  "Every course is crafted by industry professionals"],
                  ["Practical Projects",      "Build real projects and create a portfolio"],
                  ["24/7 Access",             "Learn at your own speed — no deadlines"],
                  ["Job-Ready Skills",        "Learn exactly what companies are hiring for"],
                ].map(([title, desc]) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                    <div><span className="font-semibold">{title}</span><span className="text-primary-200"> — {desc}</span></div>
                  </div>
                ))}
              </div>
              <Link to="/courses" className="inline-flex items-center gap-2 mt-8 bg-white text-primary-700 font-bold px-7 py-3 rounded-xl hover:bg-primary-50 transition-all shadow-lg">
                Start Learning <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[["500+","Courses"],["50K+","Students"],["30K+","Certificates"],["4.8★","Rating"],["8","Categories"],["100%","Satisfaction"]].map(([v, l]) => (
                <div key={l} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center hover:bg-white/20 transition-all">
                  <div className="font-display font-bold text-3xl mb-1">{v}</div>
                  <div className="text-primary-200 text-sm">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-slate-50 dark:bg-surface-900">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider mb-2">Student Stories</p>
            <h2 className="section-title">What Our Students Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex mb-3">{[...Array(t.rating)].map((_, i) => <Star key={i} size={16} className="text-amber-400 fill-amber-400" />)}</div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">{t.avatar}</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role} @ {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 bg-white dark:bg-surface-950">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">Our Story</p>
              <h2 className="section-title mb-5">About Learnify</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Learnify was founded in 2024 with a simple mission — <strong>make quality education affordable and accessible for everyone in India.</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                We noticed that many talented people wanted to learn coding, design, and marketing but couldn't afford expensive courses. So we built a platform where world-class content is available at an affordable price.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                Today, 50,000+ students are achieving their dreams with Learnify.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[["2024", "Founded"], ["50K+", "Students"], ["₹499", "Avg Course Price"]].map(([v, l]) => (
                  <div key={l} className="text-center">
                    <div className="font-display font-bold text-2xl text-primary-600 dark:text-primary-400">{v}</div>
                    <div className="text-xs text-slate-500 mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Target,      title: "Our Mission", desc: "Provide world-class education to every Indian at an affordable price.",         color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20"    },
                { icon: Heart,       title: "Our Values",  desc: "Quality, Affordability, Accessibility, and Student Success are our core values.", color: "text-rose-500 bg-rose-50 dark:bg-rose-900/20"   },
                { icon: Globe,       title: "Our Vision",  desc: "Become India's largest and most trusted online learning platform.",             color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
                { icon: TrendingUp,  title: "Our Impact",  desc: "30,000+ careers transformed and growing every single month.",                   color: "text-violet-500 bg-violet-50 dark:bg-violet-900/20"  },
              ].map((item) => (
                <div key={item.title} className="card p-5 hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3`}><item.icon size={18} /></div>
                  <h4 className="font-display font-bold text-slate-900 dark:text-white mb-1 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50 dark:bg-surface-900">
        <div className="page-container max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider mb-2">Got Questions?</p>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-semibold text-slate-900 dark:text-white">{faq.q}</span>
                  <ChevronRight size={18} className={`text-slate-400 shrink-0 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 bg-white dark:bg-surface-950">
        <div className="page-container">
          <div className="text-center mb-14">
            <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider mb-2">Get In Touch</p>
            <h2 className="section-title mb-4">Contact Us</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">Have any questions? We're here to help. We respond within 24 hours.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="space-y-6">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-5">Get in touch</h3>
              <div className="space-y-4">
                {[
                  { icon: Mail,    label: "Email",    value: "hello@learnify.com"        },
                  { icon: Phone,   label: "Phone",    value: "+91 98765 43210"            },
                  { icon: MapPin,  label: "Location", value: "Mumbai, Maharashtra, India" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</div>
                      <div className="font-medium text-slate-900 dark:text-white">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card p-5 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Support Hours</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Monday – Friday: 9 AM – 7 PM IST<br/>Saturday: 10 AM – 4 PM IST</p>
              </div>
            </div>
            <form onSubmit={handleContact} className="card p-6 space-y-4">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">Send a Message</h3>
              {sent && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
                  <CheckCircle size={16} /> Message sent! We'll get back to you soon.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Your Name</label><input required className="input" placeholder="John Doe" value={contactForm.name} onChange={e => setContact({...contactForm, name: e.target.value})} /></div>
                <div><label className="label">Email Address</label><input required type="email" className="input" placeholder="you@example.com" value={contactForm.email} onChange={e => setContact({...contactForm, email: e.target.value})} /></div>
              </div>
              <div><label className="label">Message</label><textarea required className="input resize-none" rows={4} placeholder="Your question or feedback..." value={contactForm.message} onChange={e => setContact({...contactForm, message: e.target.value})} /></div>
              <button type="submit" className="btn-primary w-full justify-center py-3"><Send size={16} /> Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-violet-700">
        <div className="page-container text-center text-white">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">Join thousands of students already learning on Learnify. Your journey starts today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-all shadow-xl text-base">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/courses" className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all text-base">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
