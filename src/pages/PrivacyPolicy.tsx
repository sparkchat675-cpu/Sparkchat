export default function PrivacyPolicy() {
  return (
    <div className="h-screen overflow-y-auto bg-slate-50 p-6 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-sm">
        <h1 className="text-3xl font-display font-bold text-pink-primary mb-6">Privacy Policy</h1>
        
        <div className="prose prose-slate space-y-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">1. Data We Collect</h2>
            <p>We collect basic information to provide a safe and engaging dating experience:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>Personal Info:</strong> Name, age, gender, and country.</li>
              <li><strong>Temporary Users:</strong> We only store your session info. Chats are deleted immediately after your session ends.</li>
              <li><strong>Google Users:</strong> We securely store your profile, messages, friends, and favorites to allow multi-device access.</li>
              <li><strong>Media:</strong> Profile pictures uploaded by Google-verified users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">2. How We Use Data</h2>
            <p>Your data is used to match you with interesting people, facilitate real-time chat, and maintain community safety. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">3. Storage & Security</h2>
            <p>Sensitive data for logged-in users is stored securely using Supabase (a cloud database service). Guest chats are stored only in memory or temporary local storage.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-2">4. AI Interactions</h2>
            <p>When you chat with our bots, your messages are processed by Google's Gemini AI to generate a response. These interactions are subject to Google's standard privacy guidelines.</p>
          </section>
        </div>

        <button 
          onClick={() => window.history.back()}
          className="mt-12 w-full py-4 pink-gradient text-white font-bold rounded-2xl shadow-lg"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
