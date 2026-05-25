export const departments = [
  {
    name: "Product & Technology",
    description: "Engineers, designers and PMs building Nepal's payments rail.",
    icon: "Code2",
    openings: 8,
  },
  {
    name: "Risk & Compliance",
    description: "Keeping millions of transactions secure and trusted every day.",
    icon: "ShieldCheck",
    openings: 3,
  },
  {
    name: "Brand & Marketing",
    description: "Telling the Khalti story and growing our community.",
    icon: "Megaphone",
    openings: 4,
  },
  {
    name: "Customer Support",
    description: "Helping users and merchants get the most out of Khalti.",
    icon: "Headphones",
    openings: 5,
  },
  {
    name: "Operations",
    description: "Running the engine that powers reliable fintech experiences.",
    icon: "Settings2",
    openings: 2,
  },
] as const;

const isServer = typeof window === "undefined";
export const API_BASE = isServer
  ? (typeof process !== "undefined" && process.env ? process.env.API_URL : undefined)
  : import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("API_BASE environment variable (API_URL or VITE_API_URL) is not defined!");
}

