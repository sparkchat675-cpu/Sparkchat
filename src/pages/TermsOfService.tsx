export default function TermsOfService() {
  return (
    <div className="h-screen overflow-y-auto bg-slate-50 p-6 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-sm">
        <h1 className="text-3xl font-display font-bold text-pink-primary mb-6">Terms of Service</h1>
        
        <div className="prose prose-slate space-y-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">1. Eligibility</h2>
            <p>You must be at least 18 years old to use SparkChat. Use of the app by minors is strictly prohibited and accounts found to be under-age will be deleted immediately.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">2. Prohibited Content</h2>
            <p>SparkChat maintains a zero-tolerance policy for:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Explicit sexual content or nudity.</li>
              <li>Harassment, bullying, or hate speech.</li>
              <li>Illegal activities or promoting drugs/violence.</li>
              <li>Spamming or commercial advertising.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">3. User Conduct</h2>
            <p>Be respectful. Our bots and moderators are trained to terminate sessions that exhibit abusive behavior. We reserve the right to ban users (IP or account based) for violating these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">4. Disclaimer</h2>
            <p>The service is provided "as is". We are not responsible for the behavior of real users you meet on the platform. Please exercise caution when sharing personal details with strangers.</p>
          </section>
        </div>

        <button 
          onClick={() => window.history.back()}
          className="mt-12 w-full py-4 pink-gradient text-white font-bold rounded-2xl shadow-lg"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}
