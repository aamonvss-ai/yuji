// app/games/[slug]/layout.jsx
const OTTS = {
  "youtube-premium": { name: "YouTube Premium" },
  "netflix": { name: "Netflix" },
  "spotify": { name: "Spotify Premium" },
};

const MEMBERSHIPS = {
  "silver-membership": { name: "Silver Membership" },
  "reseller-membership": { name: "Reseller Membership" },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;

  // Handle static products
  if (OTTS[slug]) {
    return {
      title: `${OTTS[slug].name} Subscription – Cheap & Instant | Yujimlbb`,
      description: `Get ${OTTS[slug].name} subscription at the cheapest price in India. Instant delivery and secure payments on Yujimlbb.com.`,
    };
  }

  if (MEMBERSHIPS[slug]) {
    return {
      title: `${MEMBERSHIPS[slug].name} – Exclusive Pricing | Yujimlbb`,
      description: `Join ${MEMBERSHIPS[slug].name} for exclusive discounts and premium service on Yujimlbb.com.`,
    };
  }

  try {
    const response = await fetch(
      `https://game-off-ten.vercel.app/api/v1/game/${slug}`,
      {
        headers: { "x-api-key": process.env.API_SECRET_KEY },
        next: { revalidate: 3600 } 
      }
    );
    const data = await response.json();
    const game = data?.data;

    if (!game) return { title: "Game Details | Yujimlbb" };

    return {
      title: `${game.gameName} Top Up – Cheap Diamonds & Credits | Yujimlbb`,
      description: `Buy ${game.gameName} top up at the cheapest price in India. Instant delivery for ${game.gameName} diamonds/credits only at Yujimlbb.com.`,
      openGraph: {
        title: `${game.gameName} Top Up – Instant & Secure | Yujimlbb`,
        description: `Instant ${game.gameName} top up at best prices.`,
        images: [game.gameImageId?.image || "/logo.png"],
      },
      twitter: {
        card: "summary_large_image",
        title: `${game.gameName} Top Up | Yujimlbb`,
        description: `Cheap and instant ${game.gameName} recharge.`,
        images: [game.gameImageId?.image || "/logo.png"],
      }
    };
  } catch (error) {
    return { title: "Game Details | Yujimlbb" };
  }
}

export default function GameLayout({ children }) {
  return <>{children}</>;
}
