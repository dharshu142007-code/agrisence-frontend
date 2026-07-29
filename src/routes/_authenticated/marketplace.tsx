import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Star, ShoppingCart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/glass-card";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/marketplace")({
  head: () => ({
    meta: [
      { title: "Farmer Marketplace — CropGuard AI" },
      { name: "description", content: "Buy inputs and sell produce directly with verified buyers and suppliers." },
      { property: "og:title", content: "Farmer Marketplace — CropGuard AI" },
      { property: "og:description", content: "Seeds, fertilizers, equipment and produce buyers in one place." },
    ],
  }),
  component: MarketplacePage,
});

type Listing = {
  id: string; title: string; category: "Seeds" | "Fertilizer" | "Equipment" | "Produce";
  price: string; seller: string; location: string; rating: number; tag: string;
};

const LISTINGS: Listing[] = [
  { id: "1", title: "Hybrid Tomato Seeds (Arka Rakshak)", category: "Seeds", price: "₹850 / 10g", seller: "AgriSeeds Co.", location: "Bengaluru, KA", rating: 4.7, tag: "Disease resistant" },
  { id: "2", title: "Organic Vermicompost 50kg", category: "Fertilizer", price: "₹640 / bag", seller: "GreenEarth Organics", location: "Nashik, MH", rating: 4.5, tag: "Certified organic" },
  { id: "3", title: "Battery Knapsack Sprayer 16L", category: "Equipment", price: "₹2,450", seller: "KisanTools", location: "Ludhiana, PB", rating: 4.3, tag: "1 yr warranty" },
  { id: "4", title: "Wheat (Sharbati) — 100 quintal wanted", category: "Produce", price: "₹2,580 / qtl", seller: "Bharat Grains FPO", location: "Indore, MP", rating: 4.8, tag: "Buyer" },
  { id: "5", title: "Neem Oil Bio-Pesticide 1L", category: "Fertilizer", price: "₹390", seller: "BioShield Agro", location: "Coimbatore, TN", rating: 4.6, tag: "Pest control" },
  { id: "6", title: "Drip Irrigation Kit — 1 acre", category: "Equipment", price: "₹18,900", seller: "AquaFarm Systems", location: "Rajkot, GJ", rating: 4.4, tag: "Subsidy eligible" },
  { id: "7", title: "Certified Paddy Seeds (IR-64)", category: "Seeds", price: "₹1,150 / 25kg", seller: "State Seed Corp", location: "Cuttack, OR", rating: 4.2, tag: "Govt certified" },
  { id: "8", title: "Fresh Onion — 40 quintal for sale", category: "Produce", price: "₹1,950 / qtl", seller: "Patil Farms", location: "Lasalgaon, MH", rating: 4.9, tag: "Seller" },
];

const CATEGORIES = ["All", "Seeds", "Fertilizer", "Equipment", "Produce"] as const;

function MarketplacePage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");

  const items = useMemo(
    () =>
      LISTINGS.filter(
        (l) =>
          (cat === "All" || l.category === cat) &&
          (l.title.toLowerCase().includes(q.toLowerCase()) ||
            l.seller.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, cat],
  );

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground">Buy trusted inputs and connect with produce buyers near you.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search seeds, fertilizer, buyers..." className="rounded-2xl pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                cat === c ? "bg-gradient-hero text-primary-foreground shadow-glow" : "border border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((l, i) => (
          <motion.div key={l.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GlassCard className="flex h-full flex-col rounded-3xl">
              <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                <Tag className="h-3 w-3" /> {l.tag}
              </span>
              <h3 className="font-semibold leading-tight">{l.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{l.seller}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {l.location}
                <Star className="ml-2 h-3 w-3 fill-earth text-earth" /> {l.rating}
              </p>
              <p className="mt-3 text-xl font-bold">{l.price}</p>
              <Button
                onClick={() => toast.success(`Enquiry sent to ${l.seller}`)}
                className="mt-4 w-full rounded-2xl bg-gradient-hero gap-2"
              >
                <ShoppingCart className="h-4 w-4" /> Contact
              </Button>
            </GlassCard>
          </motion.div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No listings match your search.</p>}
      </div>
    </div>
  );
}
