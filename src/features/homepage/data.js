export const HERO_IMAGE =
	"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=60";

export const PRICE_BANDS = [
	{ label: "Any price", min: 0, max: Infinity },
	{ label: "Under ₱5M", min: 0, max: 5000000 },
	{ label: "₱5M – ₱15M", min: 5000000, max: 15000000 },
	{ label: "₱15M – ₱50M", min: 15000000, max: 50000000 },
	{ label: "₱50M – ₱150M", min: 50000000, max: 150000000 },
	{ label: "₱150M+", min: 150000000, max: Infinity },
];

export const STATS = [
	{ value: "$2.4B", label: "Sold in 2025" },
	{ value: "3,100+", label: "Families placed" },
	{ value: "38", label: "Cities covered" },
	{ value: "4.9/5", label: "Client rating" },
];

export const AGENTS = [
	{ id: "a1", name: "Maya Okonkwo", title: "Principal Broker", photo: "https://randomuser.me/api/portraits/women/68.jpg", phone: "+1-512-555-0142", email: "maya@coneyrealty.example", rating: 4.9, deals: 214, volume: "$182M", regions: ["Austin, TX", "Nashville, TN"], types: ["House", "Villa", "Condo"], band: { min: 600000, max: 3500000 }, blurb: "Luxury & new-build specialist with a 12-year track record in Central Texas." },
	{ id: "a2", name: "Daniel Reyes", title: "Senior Agent", photo: "https://randomuser.me/api/portraits/men/32.jpg", phone: "+1-303-555-0188", email: "daniel@coneyrealty.example", rating: 4.8, deals: 176, volume: "$121M", regions: ["Denver, CO", "Boise, ID"], types: ["House", "Condo", "Apartment"], band: { min: 250000, max: 1200000 }, blurb: "First-time buyers and relocation moves across the Mountain West." },
	{ id: "a3", name: "Priya Nair", title: "Luxury Advisor", photo: "https://randomuser.me/api/portraits/women/44.jpg", phone: "+1-971-555-0119", email: "priya@coneyrealty.example", rating: 5.0, deals: 198, volume: "$240M", regions: ["Portland, OR", "Austin, TX"], types: ["Villa", "House", "Land"], band: { min: 900000, max: 6000000 }, blurb: "Architectural and estate homes with private, off-market inventory." },
	{ id: "a4", name: "Marcus Feld", title: "Investment Specialist", photo: "https://randomuser.me/api/portraits/men/75.jpg", phone: "+1-984-555-0173", email: "marcus@coneyrealty.example", rating: 4.7, deals: 152, volume: "$98M", regions: ["Raleigh, NC", "Nashville, TN"], types: ["Apartment", "Condo", "Land"], band: { min: 150000, max: 850000 }, blurb: "Multi-unit and land plays for buy-and-hold investors." },
	{ id: "a5", name: "Sofia Bellini", title: "Associate Broker", photo: "https://randomuser.me/api/portraits/women/90.jpg", phone: "+1-208-555-0155", email: "sofia@coneyrealty.example", rating: 4.9, deals: 168, volume: "$110M", regions: ["Boise, ID", "Denver, CO"], types: ["House", "Villa", "Condo"], band: { min: 400000, max: 2000000 }, blurb: "Move-up families and vacation homes near the foothills." },
	{ id: "a6", name: "Andre Whitfield", title: "Senior Agent", photo: "https://randomuser.me/api/portraits/men/51.jpg", phone: "+1-615-555-0126", email: "andre@coneyrealty.example", rating: 4.8, deals: 141, volume: "$87M", regions: ["Nashville, TN", "Raleigh, NC"], types: ["House", "Apartment", "Condo"], band: { min: 200000, max: 950000 }, blurb: "Historic districts and walkable urban neighborhoods." },
	{ id: "a7", name: "Grace Liang", title: "Relocation Lead", photo: "https://randomuser.me/api/portraits/women/12.jpg", phone: "+1-512-555-0197", email: "grace@coneyrealty.example", rating: 4.9, deals: 133, volume: "$79M", regions: ["Austin, TX", "Portland, OR"], types: ["Apartment", "Condo", "House"], band: { min: 300000, max: 1400000 }, blurb: "Corporate relocations and remote-first buyers." },
	{ id: "a8", name: "Tom Håkansson", title: "Land & New Development", photo: "https://randomuser.me/api/portraits/men/64.jpg", phone: "+1-503-555-0148", email: "tom@coneyrealty.example", rating: 4.7, deals: 121, volume: "$134M", regions: ["Portland, OR", "Boise, ID"], types: ["Land", "Villa", "House"], band: { min: 500000, max: 4000000 }, blurb: "Acreage, custom builds, and pre-construction reservations." },
];

export const FEATURED_PROPERTIES = [
	{ name: "Cedar Ridge Residence", city: "Austin, TX", priceLabel: "From $1.2M", beds: 4, baths: 3, type: "Villa", agentId: "a1", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=70" },
	{ name: "Foothill Modern", city: "Boise, ID", priceLabel: "From $780k", beds: 3, baths: 2, type: "House", agentId: "a5", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=70" },
	{ name: "Willamette Loft", city: "Portland, OR", priceLabel: "From $540k", beds: 2, baths: 2, type: "Condo", agentId: "a7", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=70" },
	{ name: "Magnolia Row House", city: "Nashville, TN", priceLabel: "From $690k", beds: 3, baths: 3, type: "House", agentId: "a6", image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=70" },
	{ name: "Blue Spruce Estate", city: "Denver, CO", priceLabel: "From $1.6M", beds: 5, baths: 4, type: "Villa", agentId: "a2", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=70" },
	{ name: "Research Triangle Flat", city: "Raleigh, NC", priceLabel: "From $360k", beds: 2, baths: 1, type: "Apartment", agentId: "a4", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=70" },
];

export const TESTIMONIAL = {
	quote: "They didn't send me a wall of listings. They sent me one agent who already knew three homes in my range — one wasn't even public yet. We closed in five weeks.",
	name: "Sajib Rahman",
	role: "first-time buyer, Denver",
	photo: "https://randomuser.me/api/portraits/men/41.jpg",
};

// Real agents (from Supabase) and real blog posts don't have photo/cover
// columns in the schema yet, so these pools give the public site a populated
// look for presentation purposes — picked deterministically per record so
// the same agent/post always gets the same dummy image, not a random one on
// every render.
const AVATAR_POOL = [
	"https://randomuser.me/api/portraits/women/68.jpg",
	"https://randomuser.me/api/portraits/men/32.jpg",
	"https://randomuser.me/api/portraits/women/44.jpg",
	"https://randomuser.me/api/portraits/men/75.jpg",
	"https://randomuser.me/api/portraits/women/90.jpg",
	"https://randomuser.me/api/portraits/men/51.jpg",
	"https://randomuser.me/api/portraits/women/12.jpg",
	"https://randomuser.me/api/portraits/men/64.jpg",
];

const BLOG_COVER_POOL = [
	"https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=70",
	"https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=70",
	"https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=70",
];

// Real properties don't have a photo/gallery column in the schema yet, so
// this pool gives listing cards a populated look — same deterministic-by-id
// approach as the avatar/blog-cover pools above.
const PROPERTY_IMAGE_POOL = [
	"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=70",
	"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=70",
	"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=70",
	"https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=70",
	"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=70",
	"https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=70",
];

function hashSeed(seed) {
	let hash = 0;
	for (let i = 0; i < seed.length; i += 1) {
		hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
	}
	return hash;
}

export function getAvatarForSeed(seed) {
	return AVATAR_POOL[hashSeed(String(seed)) % AVATAR_POOL.length];
}

export function getBlogCoverForSeed(seed) {
	return BLOG_COVER_POOL[hashSeed(String(seed)) % BLOG_COVER_POOL.length];
}

export function getPropertyImageForSeed(seed) {
	return PROPERTY_IMAGE_POOL[hashSeed(String(seed)) % PROPERTY_IMAGE_POOL.length];
}

const priceFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0,
});

export function formatPrice(price) {
	return price != null ? priceFormatter.format(price) : "Price on request";
}

const agentById = Object.fromEntries(AGENTS.map((agent) => [agent.id, agent]));

export function getAgentById(id) {
	return agentById[id];
}

export function getLeaderboard(limit = 8) {
	return [...AGENTS].sort((a, b) => b.rating - a.rating || b.deals - a.deals).slice(0, limit);
}

export function formatPostDate(iso) {
	return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
