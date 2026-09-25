import clinicLogo from '../assets/Clinic.jpg'
import { ClipboardPlus, HeartPulse, Calculator } from 'lucide-react'

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

      
          <div className="flex items-center gap-3">
            <img
              src={clinicLogo}
              alt="UDM Clinic Logo"
              className="h-12 w-12 object-contain"
            />

            <div>
              <h1 className="text-xl font-bold text-green-900">
                UDM CLINIC
              </h1>

              <p className="text-xs text-slate-500">
                Health Care Monitoring System
              </p>
            </div>
          </div>


          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#home"
              className="text-sm font-medium text-green-600"
            >
              Home
            </a>

            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-green-600"
            >
              Features
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-600 hover:text-green-600"
            >
              About
            </a>

            <a
              href="#contact"
              className="text-sm font-medium text-slate-600 hover:text-green-600"
            >
              Contact
            </a>
          </nav>

      
          <button className="rounded-lg bg-green-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600">
            Login
          </button>

        </div>
      </header>



      <main id="home">

    <section className="mx-auto grid max-w-7xl grid-cols-2 items-center gap-12 px-6 py-20">

          <div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-900">
              Universidad de Manila Clinic
            </p>

            <h2 className="text-4xl font-bold leading-tight text-green-900 md:text-5xl">
              UDM Health Care
              <span className="block text-green-900">
                Monitoring System
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              A website develop to help authorized UDM
              clinic personnel manage patient information, health
              assessments, and clinic visit records efficiently.
            </p>

            <div className="mt-8 flex gap-4">

              <button className="rounded-lg bg-green-900 px-6 py-3 font-semibold text-white hover:bg-green-700">
                Get Started
              </button>

              <a
                href="#features"
                className="rounded-lg border border-slate-500 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-green-00"
              >
                Learn More
              </a>

            </div>

          </div>


       <div className="flex items-center justify-end">
            <img
                src={clinicLogo}
                alt="UDM Clinic"
                className="h-96 w-96 object-contain"/>
</div>
        </section>


        <section
          id="features"
          className="bg-slate-200 px-6 py-20"
        >

          <div className="mx-auto max-w-7x1">

            <div className="text-center">

              <p className="text-2x1 font-semibold uppercase tracking-wide text-green-900">
                System Features
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-900">
                Everything the clinic needs
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                The system helps authorized clinic personnel manage
                patient information and health records in one place.
              </p>

            </div>


            <div className="mt-12 grid gap-6 md:grid-cols-3">

  
              <div className="rounded-xl border border-slate-700 p-6 shadow-sm">

               <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-200 text-red-600">
                <ClipboardPlus size={24} />
                </div>

                <h3 className="text-lg font-bold text-red-900">
                  Patient Records
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Quickly search and access patient information using
                  their patient ID, student number, or name.
                </p>

              </div>


              <div className="rounded-xl border border-slate-700 p-6 shadow-sm">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-200 text-red-600">
                 <HeartPulse size={24} />
                </div>

                <h3 className="text-lg font-bold text-red-900">
                  Health Assessment
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Record vital signs, assessment notes, and information
                  during every clinic visit.
                </p>

              </div>



              <div className="rounded-xl border border-slate-700 p-6 shadow-sm">

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-200 text-red-600">
             <Calculator size={24} />
                </div>

                <h3 className="text-lg font-bold text-red-900">
                  Automatic BMI
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Automatically calculate BMI from height and weight
                  during a health assessment.
                </p>

              </div>

            </div>

          </div>

        </section>

        <section
          id="about"
          className="px-6 py-20"
        >

          <div className="mx-auto max-w-4xl text-center">

            <p className="text-sm font-semibold uppercase tracking-wide text-green-900">
              About the System
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-900">
              Built for the UDM Clinic
            </h2>

            <p className="mt-6 leading-relaxed text-slate-600">
              The UDM Health Care Monitoring System is designed to
              support the University's clinic personnel in organizing
              patient information, recording health assessments, and
              maintaining clinic visit records digitally.
            </p>

          </div>

        </section>

    <section id="contact" className="bg-slate-200 px-3 py-20">
  <div className="mx-auto grid max-w-7x1 grid-cols-2 items-center gap-15">
    <div className="flex justify-center">
      <img
        src={clinicLogo}
        alt="UDM Clinic"
        className="h-90 w-90 object-contain"
      />
    </div>

    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-green-900">
        Contact Us
      </p>

      <h2 className="mt-2 text-3xl font-bold text-green-900">
        Get in Touch
      </h2>

      <p className="mt-4 leading-relaxed text-slate-600">
        Have a question about the UDM Health Care Monitoring System?
        Send us a message and we will get back to you.
      </p>

      <form className="mt-8 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Subject
          </label>
          <input
            type="text"
            placeholder="Enter subject"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Message
          </label>
          <textarea
            rows="5"
            placeholder="Enter your message"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          ></textarea>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-green-900 px-6 py-3 font-semibold text-white hover:bg-green-700"
        >
          Send Message
        </button>
      </form>
    </div>
  </div>
</section>

      </main>


  
      <footer className="border-t border-slate-200 bg-slate-50 px-6 py-6">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-slate-500">
            © 2026 UDM Health Care Monitoring System. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  )
}

export default LandingPage