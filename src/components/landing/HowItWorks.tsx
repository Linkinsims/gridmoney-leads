"use client";

const HUSTLER_STEPS = [
  { step: "01", title: "Sign Up Free", desc: "Create your hustler account in 2 minutes. No credit card needed." },
  { step: "02", title: "Browse Campaigns", desc: "Find businesses looking for customers in your area." },
  { step: "03", title: "Submit Leads", desc: "Share contact details of people who need the service." },
  { step: "04", title: "Get Paid", desc: "Earn R50–R500 when the business accepts your lead." },
];

const BUSINESS_STEPS = [
  { step: "01", title: "Create a Campaign", desc: "Describe your ideal customer and set your price per lead." },
  { step: "02", title: "Fund Your Wallet", desc: "Add budget via PayFast. Pay only for accepted leads." },
  { step: "03", title: "Receive Leads", desc: "Get notified instantly when hustlers submit contact details." },
  { step: "04", title: "Accept & Grow", desc: "Review leads in 48 hours. Accept, reject, or let them expire." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Two sides. One marketplace. Everyone wins.
          </p>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Hustlers */}
          <div className="card border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="mb-8">
              <span className="badge bg-primary/20 text-primary text-sm font-semibold px-3 py-1">
                💰 For Hustlers
              </span>
              <h3 className="text-xl font-bold text-white mt-3">
                Earn Money Finding Customers
              </h3>
              <p className="text-text-secondary text-sm mt-1">
                Join free. No investment required.
              </p>
            </div>
            <div className="space-y-6">
              {HUSTLER_STEPS.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{s.title}</p>
                    <p className="text-text-secondary text-sm mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Businesses */}
          <div className="card border-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="mb-8">
              <span className="badge bg-blue-500/20 text-blue-400 text-sm font-semibold px-3 py-1">
                🏢 For Businesses
              </span>
              <h3 className="text-xl font-bold text-white mt-3">
                Get Verified Leads At Scale
              </h3>
              <p className="text-text-secondary text-sm mt-1">
                Pay only for accepted leads.
              </p>
            </div>
            <div className="space-y-6">
              {BUSINESS_STEPS.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{s.title}</p>
                    <p className="text-text-secondary text-sm mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
