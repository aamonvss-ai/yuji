import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SystemSettings from "@/models/SystemSettings";
import { unstable_cache } from "next/cache";

export const revalidate = 60;

const getCachedFlashSale = unstable_cache(
    async () => {
        await connectDB();
        const settings = await SystemSettings.findOne().lean();

        if (!settings || !settings.flashSale || !settings.flashSale.isActive) {
            return { success: true, isActive: false };
        }

        return {
            success: true,
            isActive: true,
            endTime: settings.flashSale.endTime,
            items: settings.flashSale.items || []
        };
    },
    ["public-flash-sale-cache"],
    { revalidate: 60 }
);

export async function GET() {
    try {
        const data = await getCachedFlashSale();
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120"
            }
        });
    } catch (error) {
        console.error("PUBLIC GET FLASH SALE ERROR:", error);
        return NextResponse.json({ success: false, isActive: false }, { status: 500 });
    }
}
