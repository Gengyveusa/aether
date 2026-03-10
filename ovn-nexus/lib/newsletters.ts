export type NewsletterCategory = "science" | "clinical" | "bulletin" | "research";

export interface Newsletter {
  id: string;
  title: string;
  description: string;
  category: NewsletterCategory;
  featured: boolean;
  url: string;
}

const DROPBOX_BASE = "https://www.dropbox.com/scl/fo/hn9r1k3seumxwaksy92sl";
const RLKEY = "rlkey=l13p0efpv3cyba08rq2nq1okj&dl=0";

export const newsletters: Newsletter[] = [
  // ── Science & Education-First (featured on landing page) ──
  {
    id: "oral-bacteria-systemic",
    title: "How Oral Bacteria Drive Systemic Disease",
    description: "Comprehensive 41-page guide covering molecular mechanisms, bacterial extracellular vesicles, and therapeutic targets linking oral pathogens to cardiovascular, neurological, and oncological disease.",
    category: "science",
    featured: true,
    url: `${DROPBOX_BASE}/AFum15TRGMvVYQxIREwwEUk/How-Oral-Bacteria-Drive-Systemic-Disease.pdf?${RLKEY}`,
  },
  {
    id: "mouth-body-connection",
    title: "The Mouth-Body Connection",
    description: "Why your gums matter more than you think — exploring the systemic links between periodontal health and whole-body wellness.",
    category: "science",
    featured: true,
    url: `${DROPBOX_BASE}/ABweBHrzhwuuujMaqjH3c_0/The%20Mouth-Body%20Connection.pdf?${RLKEY}`,
  },
  {
    id: "hidden-dangers-vape",
    title: "The Hidden Dangers of Vaping",
    description: "What dental professionals need to know about vaping's impact on oral health in 2025 — tissue damage, dry mouth, and emerging research.",
    category: "science",
    featured: true,
    url: `${DROPBOX_BASE}/AHnsTO8uYQ0ubj5tgvEETQk/The%20Hidden%20Dangers%20of%20Vape.pdf?${RLKEY}`,
  },
  {
    id: "cannabis-dry-mouth",
    title: "Cannabis & Dry Mouth",
    description: "Understanding the oral health consequences of cannabis use — xerostomia, caries risk, and clinical management strategies.",
    category: "science",
    featured: true,
    url: `${DROPBOX_BASE}/ABmGp5xgDhKAItx9KotdXK0/Cannabis%20%26%20Dry%20Mouth.pdf?${RLKEY}`,
  },
  {
    id: "cell-level-impact",
    title: "Cell-Level Impact",
    description: "How periodontal pathogens affect host cells at the molecular level — mitochondrial dysfunction, inflammatory signaling, and tissue remodeling.",
    category: "science",
    featured: true,
    url: `${DROPBOX_BASE}/AJ5s8pBWUYYOExyn57bot0s/Cell-Level%20Impact.pdf?${RLKEY}`,
  },
  {
    id: "natural-healing",
    title: "Natural Healing in Dentistry",
    description: "Evidence-based natural approaches to periodontal healing and tissue regeneration.",
    category: "clinical",
    featured: true,
    url: `${DROPBOX_BASE}/AFfa7Yn3Bq2zxKSId3KxmZI/Natural%20Healing%20in%20Dentistry.pdf?${RLKEY}`,
  },
  {
    id: "science-empowers-mouth",
    title: "How Science Empowers Your Mouth to Heal and Defend",
    description: "The science behind oral mucosal immunity, salivary defense systems, and how modern research is advancing periodontal therapy.",
    category: "science",
    featured: true,
    url: `${DROPBOX_BASE}/APb6ZXVPjo4_GzIjHp6SLJk/How%20Science%20Empowers%20Your%20Mouth%20to%20Heal%20and%20Defend.pdf?${RLKEY}`,
  },
  {
    id: "veterans-oral-health",
    title: "A Smile Worth Fighting For \u2013 Honoring Veterans with Better Oral Health",
    description: "Oral health challenges facing veterans and the importance of integrated dental-medical care for those who served.",
    category: "clinical",
    featured: false,
    url: `${DROPBOX_BASE}/ACpJJ1wIoxabmYPn2-p2MVw/A%20Smile%20Worth%20Fighting%20For%20%E2%80%93%20Honoring%20Veterans%20with%20Better%20Oral%20Health.pdf?${RLKEY}`,
  },
  // ── Research Papers ──
  {
    id: "fcimb-research",
    title: "Frontiers in Cellular and Infection Microbiology",
    description: "Peer-reviewed research on oral microbial pathogenesis and host-pathogen interactions.",
    category: "research",
    featured: false,
    url: `${DROPBOX_BASE}/APAcJpYclNSDDRiE_13mibE/fcimb-14-1357631.pdf?${RLKEY}`,
  },
  {
    id: "viridans-streptococci",
    title: "Viridans Group Streptococci and Dental Caries: An Overview",
    description: "Comprehensive overview of viridans streptococci in dental caries pathogenesis.",
    category: "research",
    featured: false,
    url: `${DROPBOX_BASE}/AP0CwQ3KBsAvo5nW_gMY74k/VIRIDANS%20GROUP%20STREPTOCOCCI%20AND%20DENTAL%20CARIES%20AN%20OVERVIEW.pdf?${RLKEY}`,
  },
  // ── Oral Health Bulletin (last 10 newsletters, included as-is) ──
  {
    id: "hidden-dangers-smiles",
    title: "The Hidden Dangers Destroying Your Patients' Smiles",
    description: "Identifying and addressing the overlooked threats to your patients' oral health.",
    category: "bulletin",
    featured: false,
    url: `${DROPBOX_BASE}/AOOkHJ244JxpmtdvNn1q-n8/The%20Hidden%20Dangers%20Destroying%20Your%20Patients%E2%80%99%20Smiles.pdf?${RLKEY}`,
  },
  {
    id: "future-periodontal-care",
    title: "The Future of Periodontal Care Is Here",
    description: "Emerging technologies and approaches shaping the next era of periodontal treatment.",
    category: "bulletin",
    featured: false,
    url: `${DROPBOX_BASE}/ALATUARD6CtH-roHAZU03LY/The%20Future%20of%20Periodontal%20Care%20Is%20Here.pdf?${RLKEY}`,
  },
  {
    id: "compliance-breakthrough",
    title: "The Compliance Breakthrough Dentists Have Been Waiting For",
    description: "Strategies and innovations driving better patient compliance in periodontal therapy.",
    category: "bulletin",
    featured: false,
    url: `${DROPBOX_BASE}/AC7yodHShjxlTrK9HyR3K7E/The%20Compliance%20Breakthrough%20Dentists%20Have%20Been%20Waiting%20For.pdf?${RLKEY}`,
  },
  {
    id: "valentine-bacteria",
    title: "Spread the Love, Not the Inflammatory Bacteria This Valentine's Day!",
    description: "A seasonal look at oral bacterial transmission and what your patients should know.",
    category: "bulletin",
    featured: false,
    url: `${DROPBOX_BASE}/ABWC3KXKsmPOrglkqMn_YEE/Spread%20the%20Love%2C%20Not%20the%20Inflammatory%20Bacteria%20This%20Valentine%E2%80%99s%20Day%21.pdf?${RLKEY}`,
  },
  {
    id: "sensitive-gums",
    title: "Sensitive Gums in a New Era",
    description: "Modern approaches to managing gum sensitivity and the science behind emerging treatments.",
    category: "bulletin",
    featured: false,
    url: `${DROPBOX_BASE}/AKUiaf2L2Fm2D3UybFGWeqc/Sensitive%20Gums%20in%20a%20New%20Era.pdf?${RLKEY}`,
  },
  {
    id: "morning-breath",
    title: "Say Goodbye to Morning Breath: The Secret to Waking Up Fresh",
    description: "The microbiology of morning breath and evidence-based strategies for overnight oral care.",
    category: "bulletin",
    featured: false,
    url: `${DROPBOX_BASE}/ACfqIprpgWjG9bmTCwzUQp8/Say%20Goodbye%20to%20Morning%20Breath%20The%20Secret%20to%20Waking%20Up%20Fresh.pdf?${RLKEY}`,
  },
  {
    id: "post-surgery-secret",
    title: "The Post-Surgery Secret Dentists Trust",
    description: "Post-operative care strategies for optimal healing after oral surgical procedures.",
    category: "bulletin",
    featured: false,
    url: `${DROPBOX_BASE}/ALKSAzH_rzzkx9qQhuYmFSI/The%20Post-Surgery%20Secret%20Dentists%20Trust.pdf?${RLKEY}`,
  },
  {
    id: "unmasking-hidden-dangers",
    title: "Unmasking the Hidden Dangers",
    description: "Uncovering the less obvious oral health risks your patients face and how to address them.",
    category: "bulletin",
    featured: false,
    url: `${DROPBOX_BASE}/AC0TldxfNmfYsBx5DMZUDDI/Unmasking%20the%20Hidden%20Dangers.pdf?${RLKEY}`,
  },
  {
    id: "breaking-the-chain",
    title: "Breaking the Chain: Oral Health and Hypertension in African American Communities",
    description: "Exploring the connection between periodontal health and hypertension with a focus on health equity.",
    category: "bulletin",
    featured: false,
    url: `${DROPBOX_BASE}/AEkk648yDhziY-AkCFQ6Kbg/Breaking%20the%20Chain.pdf?${RLKEY}`,
  },
  {
    id: "conquering-plaque",
    title: "Conquering Plaque at Its Core",
    description: "Advanced approaches to biofilm management and plaque control in modern dentistry.",
    category: "bulletin",
    featured: false,
    url: `${DROPBOX_BASE}/AP7tEHzRmHIvOzpu8JWzAJI/Conquering%20Plaque%20at%20Its%20Core%20How%20Gengyve%20Revolutionizes%20Oral%20Care.pdf?${RLKEY}`,
  },
];

export const categoryLabels: Record<NewsletterCategory, string> = {
  science: "Science & Education",
  clinical: "Clinical Practice",
  bulletin: "Oral Health Bulletin",
  research: "Research Papers",
};

export const categoryColors: Record<NewsletterCategory, string> = {
  science: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  clinical: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  bulletin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  research: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export function getFeaturedNewsletters(): Newsletter[] {
  return newsletters.filter((n) => n.featured);
}

export function getNewslettersByCategory(category: NewsletterCategory): Newsletter[] {
  return newsletters.filter((n) => n.category === category);
}
