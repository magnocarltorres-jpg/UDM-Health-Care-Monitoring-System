import { useEffect, useRef, useState } from "react";
import clinicLogo from "../assets/clinic.png";
import {
  ClipboardPlus,
  HeartPulse,
  Calculator,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
} from "lucide-react";


const API_URL =
  import.meta.env.VITE_API_URL || "https://udm-health-care-api.onrender.com";

function LandingPage({ onLogin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const observerRef = useRef(null);

  useEffect(() => {
    const elements = document.querySelectorAll(".scroll-animate");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) =>
        element.classList.add("animate-visible"),
      );
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-visible");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    elements.forEach((element) => observerRef.current.observe(element));

    return () => observerRef.current?.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactForm((previous) => ({ ...previous, [name]: value }));
    setContactMessage("");
  };


const handleContactSubmit = async (event) => {
  event.preventDefault();

  if (isSubmittingContact) return;

  setIsSubmittingContact(true);
  setContactMessage("");

  try {
    const response = await fetch(
      `${API_URL.replace(/\/+$/, "")}/api/contact-inquiries`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: contactForm.name.trim(),
          email: contactForm.email.trim(),
          subject: contactForm.subject.trim(),
          message: contactForm.message.trim(),
        }),
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to submit your inquiry.",
      );
    }

    setContactMessage(
      data.message || "Your inquiry was submitted successfully.",
    );

    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  } catch (error) {
  console.error("Contact inquiry submission failed:", error);

  setContactMessage(
    error.message ||
      "Unable to submit your inquiry. Please try again.",
  );
  } finally {
    setIsSubmittingContact(false);
  }
};


  const features = [
    {
      icon: ClipboardPlus,
      title: "Patient Records",
      description:
        "Quickly search and access patient information using a patient ID, student number, or name.",
    },
    {
      icon: HeartPulse,
      title: "Health Assessment",
      description:
        "Record vital signs, assessment notes, and information during every clinic visit.",
    },
    {
      icon: Calculator,
      title: "Automatic BMI",
      description:
        "Calculate BMI from height and weight during a health assessment.",
    },
  ];

  const navigation = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-800">
      <header className="sticky top-0 z-50 border-b border-green-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#home" className="flex min-w-0 items-center gap-3">
            <img
              src={clinicLogo}
              alt="UDM Clinic Logo"
              className="h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12"
            />
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold tracking-wide text-green-950 sm:text-xl">
                UDM CLINIC
              </h1>
              <p className="text-[10px] text-slate-500 sm:text-xs">
                Health Care Monitoring System
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {navigation.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-sm font-semibold transition ${
                  index === 0
                    ? "text-green-800"
                    : "text-slate-600 hover:text-green-800"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogin}
              className="rounded-xl bg-green-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 sm:px-6"
            >
              Login
            </button>

            <button
              type="button"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((previous) => !previous)}
              className="rounded-lg p-2 text-green-950 transition hover:bg-green-50 md:hidden"
            >
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-green-100 bg-white px-4 py-3 shadow-lg md:hidden">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="block rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-green-50 hover:text-green-900"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main>
        <section
          id="home"
          className="scroll-animate relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 md:grid-cols-2 md:gap-12 lg:py-24">
            <div className="scroll-animate">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-green-900 shadow-sm sm:text-sm">
                <ShieldCheck size={17} />
                Universidad de Manila Clinic
              </div>

              <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-green-950 sm:text-5xl lg:text-6xl">
                UDM Health Care
                <span className="mt-1 block text-green-800">
                  Monitoring System
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                A digital system designed to help authorized UDM clinic
                personnel manage patient information, health assessments, and
                clinic visit records efficiently.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-900 px-6 py-3.5 font-bold text-white shadow-lg shadow-green-900/15 transition hover:-translate-y-0.5 hover:bg-green-800"
                >
                  Access Clinic System
                  <ArrowRight size={18} />
                </button>

                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-xl border border-green-200 bg-white px-6 py-3.5 font-bold text-green-950 transition hover:border-green-400 hover:bg-green-50"
                >
                  Explore Features
                </a>
              </div>

              <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
                <ShieldCheck size={19} className="shrink-0 text-green-800" />
                <span>For authorized UDM clinic personnel only</span>
              </div>
            </div>

<div className="scroll-animate flex items-center justify-center md:justify-end">
  <img
    src={clinicLogo}
    alt="UDM Clinic"
    className="h-64 w-64 object-contain sm:h-80 sm:w-80 lg:h-96 lg:w-96"
  />
</div>

          </div>
        </section>

        <section id="features" className="scroll-animate bg-slate-50 px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="scroll-animate mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-green-800">
                System Features
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-green-950 sm:text-4xl">
                Supporting Better Clinic Management
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Keep essential clinic records organized in one system for
                authorized personnel.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="scroll-animate rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg sm:p-7"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-900">
                      <Icon size={27} />
                    </div>
                    <h3 className="text-xl font-bold text-green-950">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

<section id="about" className="scroll-animate px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
  <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14">
    <div className="scroll-animate flex justify-center">
      <img
        src={clinicLogo}
        alt="UDM Clinic"
        className="h-64 w-64 object-contain sm:h-80 sm:w-80 lg:h-96 lg:w-96"
      />
    </div>

            <div className="scroll-animate">
              <p className="text-sm font-bold uppercase tracking-widest text-green-800">
                About the System
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-green-950 sm:text-4xl">
                Built for the UDM Clinic
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                The UDM Health Care Monitoring System is designed to support
                clinic personnel in organizing patient information, recording
                health assessments, and maintaining clinic visit records
                digitally.
              </p>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
                <GraduationCap size={23} className="mt-0.5 shrink-0 text-green-800" />
                <p className="text-sm leading-6 text-green-950">
                  Focused on the healthcare record-management needs of the
                  Universidad de Manila school clinic.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-animate bg-green-950 px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
            <div className="scroll-animate flex flex-col justify-center text-white">
              <p className="text-sm font-bold uppercase tracking-widest text-green-300">
                Contact Us
              </p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Get in Touch
              </h2>
              <p className="mt-5 max-w-lg leading-8 text-green-100/80">
                Have a question about the UDM Health Care Monitoring System?
              Use the contact form to send an inquiry to the UDM clinic.
              </p>

              <div className="mt-8 space-y-4 text-sm text-green-100">
                <div className="flex items-center gap-3">
                  <MapPin size={19} className="text-green-300" />
                  <span>Universidad de Manila Clinic</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={19} className="text-green-300" />
                  <span>Contact information to be provided by the clinic</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={19} className="text-green-300" />
                  <span>Clinic contact number to be provided</span>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleContactSubmit}
              className="scroll-animate rounded-2xl bg-white p-5 shadow-xl sm:p-8"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-green-950">
                  Send an Inquiry
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Complete the fields below.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="contactName" className="mb-2 block text-sm font-semibold text-slate-700">
                    Name
                  </label>
                  <input
                    id="contactName"
                    name="name"
                    type="text"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    placeholder="Enter your name"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label htmlFor="contactEmail" className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    id="contactEmail"
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label htmlFor="contactSubject" className="mb-2 block text-sm font-semibold text-slate-700">
                    Subject
                  </label>
                  <input
                    id="contactSubject"
                    name="subject"
                    type="text"
                    value={contactForm.subject}
                    onChange={handleContactChange}
                    placeholder="Enter subject"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label htmlFor="contactMessage" className="mb-2 block text-sm font-semibold text-slate-700">
                    Message
                  </label>
                  <textarea
                    id="contactMessage"
                    name="message"
                    rows={4}
                    value={contactForm.message}
                    onChange={handleContactChange}
                    placeholder="Enter your message"
                    required
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {contactMessage && (
                  <div
                    role="status"
                    className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900"
                  >
                    <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                    {contactMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-900 px-6 py-3.5 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingContact ? "Sending..." : "Send Message"}
                  {!isSubmittingContact && <ArrowRight size={18} />}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

     <footer className="bg-white px-5 py-6 sm:px-8">
  <div className="mx-auto flex max-w-7xl items-center justify-center text-center">
    <p className="text-xs text-slate-500 sm:text-sm">
      © 2026 UDM Health Care Monitoring System. All rights reserved.
    </p>
  </div>
</footer>
    </div>
  );
}

export default LandingPage;
