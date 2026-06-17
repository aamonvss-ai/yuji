const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Meow Ji";

export const metadata = {
  title: "Refund Policy | Yujimlbb",
  description: "Read our refund policy to understand the terms and conditions for refunds on game top-ups.",
  keywords: ["refund policy", "yujimlbb refund", "game top up refund", "cancellation policy"]
};

export default function RefundPolicy() {
  return (
    <main className="min-h-screen bg-transparent text-[var(--foreground)] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--accent)] mb-6">
          Refund Policy
        </h1>

        <p className="text-[var(--muted)] mb-10">
          Last updated: December 2025
        </p>

        <p className="mb-6 leading-relaxed">
          At <strong>{BRAND}</strong>, we strive to ensure customer satisfaction with every transaction. Due to the digital nature of our game top-up services, please read our refund and cancellation terms carefully.
        </p>

        {/* 1 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          1. Digital Goods and Top-ups
        </h2>
        <p className="mb-6 leading-relaxed">
          All sales of digital goods, including game credits, diamonds, tokens, and memberships, are final. Once a top-up has been successfully delivered to the provided Game ID and Server/Zone ID, it cannot be reversed, returned, or refunded.
        </p>

        {/* 2 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          2. Incorrect Information
        </h2>
        <p className="mb-6 leading-relaxed">
          It is the customer's responsibility to ensure that the correct Game ID and Server/Zone details are entered during the checkout process. <strong>{BRAND}</strong> is not responsible for top-ups delivered to incorrect accounts due to user error, and no refunds will be issued in such cases.
        </p>

        {/* 3 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          3. Failed Transactions & Non-Delivery
        </h2>
        <p className="mb-6 leading-relaxed">
          If your payment is successfully deducted but the top-up is not delivered due to a system error, server downtime, or stock unavailability, you are eligible for a full refund or a manual top-up retry. 
          <br /><br />
          To claim a refund for non-delivery, please contact our support team within 24 hours of the transaction with your Order ID and payment proof.
        </p>

        {/* 4 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          4. Fraudulent Transactions
        </h2>
        <p className="mb-6 leading-relaxed">
          Any payments made using stolen credit cards, unauthorized bank access, or other fraudulent methods will be immediately reported to the respective authorities. <strong>{BRAND}</strong> reserves the right to ban the offending game accounts and block future transactions. No refunds will be provided for fraudulent transactions.
        </p>

        {/* 5 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          5. Refund Processing Time
        </h2>
        <p className="mb-6 leading-relaxed">
          Approved refunds will be processed back to the original payment method. Depending on your bank or payment gateway, it may take between 3 to 7 business days for the funds to reflect in your account. Wallet refunds (if applicable) are usually instant.
        </p>

        {/* 6 */}
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-3">
          6. Contact Us
        </h2>
        <p className="leading-relaxed">
          If you experience any issues with your order or have questions regarding this Refund Policy, please reach out to us via our{" "}
          <a href="/contact" className="text-[var(--accent)] hover:underline">
            Contact Page
          </a> or directly at our customer support channels.
        </p>
      </div>
    </main>
  );
}
