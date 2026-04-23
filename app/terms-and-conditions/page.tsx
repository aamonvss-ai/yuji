"use client";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Meow Ji";

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-transparent text-[var(--foreground)] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-4xl font-bold text-[var(--accent)] mb-6">
          Terms & Conditions
        </h1>

        <p className="text-[var(--muted)] mb-10">
          Last updated: December 2025
        </p>

        <p className="mb-6 leading-relaxed">
          Welcome to <strong>{BRAND}</strong>. By using our website or placing an
          order, you agree to these Terms & Conditions. If you do not agree, please
          do not use this platform.
        </p>

        {/* 1 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          1. Use of the Platform
        </h2>
        <p className="mb-6 leading-relaxed">
          You agree to use {BRAND} only for legal purposes and follow these terms.
          <br /><br />
          You must enter correct details at checkout, like game ID, server/zone,
          and contact info. Wrong details may cause failed or non-reversible top-ups.
        </p>

        {/* 2 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          2. Orders & Top-Ups
        </h2>
        <p className="mb-6 leading-relaxed">
          • Top-up orders are processed automatically or with limited manual help.  
          <br />
          • Once a top-up is delivered, it is final.  
          <br />
          • We are not responsible for losses caused by wrong user input
          (wrong game ID, server, or account).
          <br /><br />
          By placing an order, you confirm you own the game account or have permission
          to top it up.
        </p>

        {/* 3 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          3. Payments
        </h2>
        <p className="mb-6 leading-relaxed">
          Payments are processed through trusted third-party payment gateways.
          {BRAND} does not store sensitive payment information such as card
          details or UPI credentials.
          <br /><br />
          Orders may be delayed or canceled if payment fails, fraud is suspected,
          or there is a system issue.
        </p>

        {/* 4 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          4. Refunds & Cancellations
        </h2>
        <p className="mb-6 leading-relaxed">
          Because game top-ups are digital and instant:
          <br /><br />
          • Successfully delivered top-ups are <strong>non-refundable</strong>.  
          <br />
          • Refunds may be given only if the order fails and the balance is
          not credited to the game account.
          <br /><br />
          Refund approval is decided by {BRAND}.
        </p>

        {/* 5 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          5. Prohibited Activities
        </h2>
        <p className="mb-6 leading-relaxed">
          You must not:
          <br /><br />
          • Attempt to exploit pricing, system bugs, or promotions  
          <br />
          • Use the platform for fraud or unauthorized payments  
          <br />
          • Interfere with platform security or automated systems  
          <br />
          • Resell services without written permission (unless clearly allowed)
        </p>

        {/* 6 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          6. Third-Party Games & Trademarks
        </h2>
        <p className="mb-6 leading-relaxed">
          {BRAND} is an independent platform and is <strong>not affiliated with,
          endorsed by, or sponsored by</strong> any game publisher.
          <br /><br />
          All game names, logos, and trademarks belong to their respective owners.
        </p>

        {/* 7 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          7. Limitation of Liability
        </h2>
        <p className="mb-6 leading-relaxed">
          {BRAND} is not responsible for:
          <br /><br />
          • Losses caused by incorrect user information  
          <br />
          • Delays due to maintenance, API downtime, or third-party providers  
          <br />
          • Game account bans or actions taken by game publishers  
          <br />
          • Indirect or secondary damages
        </p>

        {/* 8 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          8. Changes to Terms
        </h2>
        <p className="leading-relaxed">
          {BRAND} may update these Terms & Conditions at any time. Changes start
          as soon as they are posted on this page. If you keep using the platform,
          it means you accept the updated terms.
        </p>
      </div>
    </main>
  );
}
