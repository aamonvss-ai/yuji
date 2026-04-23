"use client";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Meow Ji";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-transparent text-[var(--foreground)] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--accent)] mb-6">
          Privacy Policy
        </h1>

        <p className="text-[var(--muted)] mb-10">
          Last updated: December 2025
        </p>

        <p className="mb-6 leading-relaxed">
          At <strong>{BRAND}</strong>, we respect your privacy. This page explains
          what data we collect, why we use it, and how we protect it when you use
          our website.
        </p>

        {/* 1 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          1. Information We Collect
        </h2>
        <p className="mb-6 leading-relaxed">
          We may collect:
          <br /><br />
          <strong>• Account and order information</strong> - like your email,
          phone number, game ID, server/zone details, and order history needed
          to process top-ups.
          <br /><br />
          <strong>• Payment information</strong> - payments are handled by trusted
          third-party gateways. We do not store sensitive details like card
          numbers or UPI PINs.
          <br /><br />
          <strong>• Technical and usage data</strong> - such as IP address,
          browser type, device info, pages visited, and time logs for security
          and fraud checks.
        </p>

        {/* 2 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          2. How We Use Your Information
        </h2>
        <p className="mb-6 leading-relaxed">
          We use your data to:
          <br /><br />
          • Process and deliver game top-ups correctly  
          <br />
          • Check payments and prevent fraud  
          <br />
          • Give customer support  
          <br />
          • Improve website speed and experience  
          <br /><br />
          We do <strong>not</strong> sell, rent, or trade your personal information.
        </p>

        {/* 3 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          3. Cookies & Tracking
        </h2>
        <p className="mb-6 leading-relaxed">
          {BRAND} uses cookies to:
          <br /><br />
          • Remember user preferences  
          <br />
          • Maintain login sessions  
          <br />
          • Understand website traffic  
          <br /><br />
          You can turn off cookies in your browser, but some features may not work.
        </p>

        {/* 4 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          4. Third-Party Services
        </h2>
        <p className="mb-6 leading-relaxed">
          We may use trusted third-party services for:
          <br /><br />
          • Payment processing  
          <br />
          • Analytics and performance tracking  
          <br />
          • Hosting and content delivery  
          <br /><br />
          These providers have their own privacy policies.
        </p>

        {/* 5 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          5. Data Security
        </h2>
        <p className="mb-6 leading-relaxed">
          We use technical and team processes to protect your data from unauthorized
          access, changes, or loss. No online platform can promise 100% security.
        </p>

        {/* 6 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          6. Your Rights
        </h2>
        <p className="mb-6 leading-relaxed">
          You have the right to:
          <br /><br />
          • Request access to your personal data  
          <br />
          • Ask us to fix wrong information  
          <br />
          • Ask us to delete your data (when allowed by law)  
          <br /><br />
          To exercise these rights, please contact us via our{" "}
          <a href="/contact" className="text-[var(--accent)] hover:underline">
            Contact Page
          </a>.
        </p>

        {/* 7 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          7. Policy Updates
        </h2>
        <p className="mb-6 leading-relaxed">
          We may update this Privacy Policy from time to time. Any update will
          appear on this page with a new "Last updated" date.
        </p>

        <p className="leading-relaxed">
          If you have any questions about this Privacy Policy, please contact{" "}
          <a href="/contact" className="text-[var(--accent)] hover:underline">
            {BRAND} Support
          </a>.
        </p>
      </div>
    </main>
  );
}
