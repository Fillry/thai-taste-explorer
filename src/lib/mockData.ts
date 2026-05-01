export interface UserProfile {
  spiceLevel: 1 | 2 | 3 | 4;
  diets: string[];
  allergies: string[];
  level: number;
  xp: number;
  xpToNext: number;
  name: string;
}

export interface Recipe {
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  ingredients: string[];
  steps: string[];
}

export interface FoodItem {
  id: string;
  name: string;
  engName: string;
  location: string;
  image: string;
  tags: string[];
  matchScore: number;
  description: string;
  spiceLevel: 1 | 2 | 3 | 4;
  recipe: Recipe;
}

export interface ItineraryEvent {
  id: string;
  time: string;
  title: string;
  type: "user" | "ai";
  location: string;
  linkedFoodId?: string;
  reason?: string;
  icon: "map" | "utensils" | "camera" | "coffee";
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  reward: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  unlocked: boolean;
  description: string;
}

export const mockUser: UserProfile = {
  spiceLevel: 3,
  diets: ["Pescatarian"],
  allergies: ["Peanuts"],
  level: 4,
  xp: 320,
  xpToNext: 500,
  name: "Explorer",
};

export const mockFoods: FoodItem[] = [
  {
    id: "1",
    name: "ก๋วยเตี๋ยวเรือ",
    engName: "Boat Noodles",
    location: "Pathum Thani",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
    tags: ["Hidden Gem", "Local Favorite", "Spicy"],
    matchScore: 96,
    spiceLevel: 3,
    description: "Rich, dark broth slow-simmered with herbs and pork blood — a Pathum Thani staple sold from canal boats.",
    recipe: {
      time: "45 min",
      difficulty: "Medium",
      ingredients: ["Rice noodles", "Pork", "Beef broth", "Morning glory", "Bean sprouts", "Thai basil", "Fish sauce"],
      steps: [
        "Simmer beef broth with star anise, cinnamon and cilantro roots for 30 min.",
        "Blanch noodles and bean sprouts.",
        "Slice pork thinly and poach in broth.",
        "Assemble bowl, top with herbs, serve with chili vinegar.",
      ],
    },
  },
  {
    id: "2",
    name: "แกงเทโพ",
    engName: "Gaeng Tay Po",
    location: "Nonthaburi",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    tags: ["Hidden Gem", "Curry", "Coconut"],
    matchScore: 89,
    spiceLevel: 2,
    description: "Sweet & sour red curry with morning glory and pork belly — beloved across the Chao Phraya delta.",
    recipe: {
      time: "60 min",
      difficulty: "Medium",
      ingredients: ["Pork belly", "Morning glory", "Coconut milk", "Red curry paste", "Tamarind", "Palm sugar"],
      steps: [
        "Fry curry paste in coconut cream until fragrant.",
        "Add pork belly and simmer 20 min.",
        "Stir in tamarind, palm sugar, fish sauce.",
        "Add morning glory in the last 2 minutes.",
      ],
    },
  },
  {
    id: "3",
    name: "หมี่กรอบ",
    engName: "Mee Krob",
    location: "Ayutthaya",
    image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&q=80",
    tags: ["Crispy", "Sweet & Sour", "Royal"],
    matchScore: 84,
    spiceLevel: 1,
    description: "Crispy fried rice vermicelli glazed with a tangy palm-sugar sauce — once served in royal courts.",
    recipe: {
      time: "40 min",
      difficulty: "Hard",
      ingredients: ["Rice vermicelli", "Tofu", "Shrimp", "Palm sugar", "Tamarind", "Orange zest"],
      steps: [
        "Deep-fry vermicelli in batches until puffed.",
        "Reduce tamarind, palm sugar, fish sauce to syrup.",
        "Toss noodles quickly in syrup with garnishes.",
      ],
    },
  },
  {
    id: "4",
    name: "ข้าวซอย",
    engName: "Khao Soi",
    location: "Chiang Rai",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    tags: ["Northern", "Curry Noodle", "Comfort"],
    matchScore: 92,
    spiceLevel: 3,
    description: "Northern-style coconut curry noodle soup — try the Chiang Rai version with darker, smokier broth.",
    recipe: {
      time: "50 min",
      difficulty: "Medium",
      ingredients: ["Egg noodles", "Chicken", "Coconut milk", "Khao soi paste", "Pickled mustard greens", "Lime"],
      steps: [
        "Simmer chicken in coconut curry broth.",
        "Boil noodles, fry a small handful for topping.",
        "Serve with shallots, lime, pickled greens.",
      ],
    },
  },
  {
    id: "5",
    name: "ขนมจีนน้ำเงี้ยว",
    engName: "Khanom Jeen Nam Ngiao",
    location: "Phrae",
    image: "https://images.unsplash.com/photo-1583224994076-ae3083b9eb78?w=800&q=80",
    tags: ["Hidden Gem", "Tomato Broth", "Northern"],
    matchScore: 87,
    spiceLevel: 2,
    description: "Rice noodles in a tomato-pork broth with kapok flowers — virtually unknown outside the north.",
    recipe: {
      time: "55 min",
      difficulty: "Medium",
      ingredients: ["Rice noodles", "Pork ribs", "Cherry tomatoes", "Dried kapok flowers", "Fermented soy bean"],
      steps: [
        "Simmer pork ribs with tomato and tao jiao 40 min.",
        "Add kapok flowers and chili paste.",
        "Ladle over fresh rice noodles.",
      ],
    },
  },
];

export const mockItinerary: ItineraryEvent[] = [
  {
    id: "i1",
    time: "09:00",
    title: "Wat Chedi Luang Visit",
    type: "user",
    location: "Old City",
    icon: "map",
  },
  {
    id: "i2",
    time: "11:30",
    title: "Try Boat Noodles",
    type: "ai",
    location: "Rangsit Market, Pathum Thani",
    linkedFoodId: "1",
    reason: "Matches your love for spicy broths (Lv.3) — and helps disperse tourist crowds away from Bangkok.",
    icon: "utensils",
  },
  {
    id: "i3",
    time: "14:00",
    title: "Floating Market Photography",
    type: "user",
    location: "Don Wai",
    icon: "camera",
  },
  {
    id: "i4",
    time: "16:00",
    title: "Coffee at Local Roastery",
    type: "ai",
    location: "Nonthaburi",
    reason: "A quiet break before dinner — supports a family-run café off the tourist trail.",
    icon: "coffee",
  },
  {
    id: "i5",
    time: "19:00",
    title: "Dinner: Gaeng Tay Po",
    type: "ai",
    location: "Riverside, Nonthaburi",
    linkedFoodId: "2",
    reason: "Mild-medium spice, no peanuts — perfect for your allergy profile.",
    icon: "utensils",
  },
];

export const mockQuests: Quest[] = [
  {
    id: "q1",
    title: "Pathum Thani Pioneer",
    description: "Eat 3 local dishes in Pathum Thani",
    progress: 1,
    total: 3,
    reward: 150,
  },
  {
    id: "q2",
    title: "Northern Spirit",
    description: "Try 2 dishes from northern provinces",
    progress: 1,
    total: 2,
    reward: 100,
  },
  {
    id: "q3",
    title: "Spice Master",
    description: "Complete 5 Lv.3+ spicy dishes",
    progress: 3,
    total: 5,
    reward: 200,
  },
];

export interface Restaurant {
  id: string;
  name: string;
  area: string;
}

export const mockRestaurants: Restaurant[] = [
  { id: "r1", name: "Baan Rim Klong", area: "Nonthaburi" },
  { id: "r2", name: "Krua Apsorn", area: "Bangkok – Dinso Rd." },
  { id: "r3", name: "Jay Fai", area: "Bangkok – Phra Nakhon" },
  { id: "r4", name: "Khao Soi Khun Yai", area: "Chiang Mai" },
  { id: "r5", name: "Raan Jay Oh", area: "Bangkok – Banthat Thong" },
  { id: "r6", name: "Hong Tauw Inn", area: "Chiang Mai" },
];

export interface CommunityReview {
  id: string;
  restaurantId: string;
  restaurantName: string;
  dishName: string;
  author: string;
  authorAvatar: string;
  image: string;
  description: string;
  spicy: number;       // 0-5
  sweetness: number;   // 0-5
  hygiene: number;     // 0-5
  tourismFriendly: number; // 0-5
  rating: number;      // 1-5 stars
  likes: number;
  liked: boolean;
  createdAt: string;   // relative time string
}

export const mockReviews: CommunityReview[] = [
  {
    id: "rev1",
    restaurantId: "r1",
    restaurantName: "Baan Rim Klong",
    dishName: "Miang Kham",
    author: "Nicha",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=900&q=80",
    description: "The owner explained every leaf-wrap ingredient in Thai and English. The sauce was sweet, herbal, and slightly salty. Great for learning old-style Thai snacks — peanut allergy travelers should ask first.",
    spicy: 2,
    sweetness: 4,
    hygiene: 5,
    tourismFriendly: 4,
    rating: 5,
    likes: 42,
    liked: false,
    createdAt: "2h ago",
  },
  {
    id: "rev2",
    restaurantId: "r4",
    restaurantName: "Khao Soi Khun Yai",
    dishName: "Khao Soi Gai",
    author: "Marco",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&q=80",
    description: "Closes by 2pm — go early! Crispy noodles on top, broth was rich and not too spicy. Locals fill the place, only a few tourists.",
    spicy: 3,
    sweetness: 2,
    hygiene: 4,
    tourismFriendly: 3,
    rating: 5,
    likes: 88,
    liked: true,
    createdAt: "Yesterday",
  },
  {
    id: "rev3",
    restaurantId: "r3",
    restaurantName: "Jay Fai",
    dishName: "Crab Omelette",
    author: "Aiko",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
    image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=900&q=80",
    description: "Iconic but expect 2-hour wait. Generous crab, crispy edges. Worth it once — bring cash.",
    spicy: 1,
    sweetness: 2,
    hygiene: 4,
    tourismFriendly: 5,
    rating: 4,
    likes: 156,
    liked: false,
    createdAt: "3d ago",
  },
];

export const mockBadges: Badge[] = [
  { id: "b1", name: "First Bite", emoji: "🍜", unlocked: true, description: "Logged your first dish" },
  { id: "b2", name: "Curry King", emoji: "🍛", unlocked: true, description: "Tried 3 different curries" },
  { id: "b3", name: "Street Scholar", emoji: "🛺", unlocked: true, description: "5 street-food meals" },
  { id: "b4", name: "Hidden Gem", emoji: "💎", unlocked: false, description: "Visit 3 secondary provinces" },
  { id: "b5", name: "Fire Eater", emoji: "🌶️", unlocked: false, description: "Master Lv.4 spice" },
  { id: "b6", name: "Royal Palate", emoji: "👑", unlocked: false, description: "Try 3 royal-court dishes" },
  { id: "b7", name: "Night Owl", emoji: "🌙", unlocked: true, description: "Explore a night market" },
  { id: "b8", name: "Sea Whisperer", emoji: "🦐", unlocked: false, description: "5 seafood specialties" },
];
