export const revalidate = 300; // Cache for 24 hours

export async function GET() {
  const data = {
    stats: [
      { number: "800+", label: "Wallpapers Uploaded" },
      { number: "150+", label: "Blogs & Guides" },
      { number: "100+", label: "Heroes & Skins Covered" },
      { number: "Daily", label: "New Updates Posted" },
    ],

    articles: [
      {
        id: 1,
        title: "Best Assassin Builds for Ranked (2025)",
        excerpt: "Top assassin builds dominating Mythic and above this season.",
        slug: "/blogs/assassin-builds",
        image: "",
      },
      {
        id: 2,
        title: "Updated MLBB Tier List – Season 29",
        excerpt: "A complete breakdown of strongest heroes by role.",
        slug: "/blogs/mlbb-tier-list",
        image: "",
      },
      {
        id: 3,
        title: "M5 & MPL Highlights – Weekly Recap",
        excerpt: "Top plays, major upsets, and esports storylines.",
        slug: "/blogs/esports-weekly",
        image: "",
      },
    ],

    esportsUpdates: [
      {
        id: 1,
        title: "MPL Weekly Recap",
        excerpt: "Key match results, standings, and top plays from this week’s MPL action.",
        slug: "/esports/mpl-weekly-recap",
        image: "",
      },
      {
        id: 2,
        title: "M5 World Championship",
        excerpt: "Full coverage of M5 — playoffs, brackets, highlights & predictions.",
        slug: "/esports/m5-news",
        image: "",
      },
      {
        id: 3,
        title: "Pro Player Spotlight",
        excerpt: "Deep dives into pro strategies, hero picks and signature gameplay.",
        slug: "/esports/player-spotlight",
        image: "",
      },
    ],

    mlbbEvents: [
      {
        id: 1,
        title: "Lucky Spin – Epic Skin",
        excerpt: "Try your luck and win the rotating Epic Skin of the month.",
        image: "",
      },
      {
        id: 2,
        title: "Starlight Event",
        excerpt: "See current Starlight skin, rewards, animations & bonuses.",
        image: "",
      },
      {
        id: 3,
        title: "Recharge Bonus",
        excerpt: "Get extra diamonds during limited-time recharge bonus events.",
        image: "",
      },
    ],

    categories: [
      { name: "Assassin", icon: "🗡️" },
      { name: "Fighter", icon: "⚔️" },
      { name: "Mage", icon: "✨" },
      { name: "Marksman", icon: "🏹" },
      { name: "Tank", icon: "🛡️" },
      { name: "Support", icon: "💖" },
    ],
  };

  return Response.json(data);
}
