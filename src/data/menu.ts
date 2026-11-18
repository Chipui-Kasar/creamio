import type { MenuItem } from "@/types";

/** Currency symbol shown on every menu card. */
export const CURRENCY = "₹";

/**
 * MENU — placeholder items & prices. Edit freely.
 * Add a real photograph by dropping a file in /public/images/menu and setting `photo`.
 * Without a photo the card shows the illustrated brand artwork instead.
 */
export const MENU: MenuItem[] = [
  {
    id: "scoops",
    name: "Ice-Cream Scoops",
    tagline: "Hand-scooped, 18 flavours rotating",
    description:
      "Slow-churned scoops in a cup or a hand-rolled waffle cone. Strawberry-pink, chocolate fudge and vanilla bean are always on.",
    prices: [
      { label: "Single", price: 70 },
      { label: "Double", price: 120 },
      { label: "Triple", price: 165 },
    ],
    art: "scoops",
    photo: "/images/brand/photo-scoops.jpg",
    accent: "#F96B97",
    tint: "#FFE2EA",
    notes: ["Cup or cone", "Add a waffle shard +₹15"],
  },
  {
    id: "softy",
    name: "Softy Ice Cream",
    tagline: "Vanilla, strawberry or the twist",
    description:
      "Silky-soft swirls from our double-compressor machine — one flavour from each hopper, or both together as a twist.",
    prices: [
      { label: "Cone", price: 60 },
      { label: "Twist cone", price: 80 },
      { label: "Cup", price: 90 },
    ],
    art: "softy",
    accent: "#4DB6AC",
    tint: "#D9F1EE",
    notes: ["Dipped in choc +₹20"],
  },
  {
    id: "juice",
    name: "Fresh Fruit Juices",
    tagline: "Pressed to order, never from concentrate",
    description:
      "Orange, watermelon, pineapple and seasonal blends, juiced in front of you and served over ice in a tall glass.",
    prices: [
      { label: "Regular", price: 80 },
      { label: "Large", price: 110 },
    ],
    art: "juice",
    accent: "#F5A04A",
    tint: "#FFE8CC",
    notes: ["No added sugar", "Seasonal blends"],
  },
  {
    id: "shakes",
    name: "Milkshakes",
    tagline: "Thick, cold and made with real scoops",
    description:
      "Blended with our own ice cream and whole milk, topped with cream and a cherry. Chocolate, strawberry, mango or vanilla.",
    prices: [
      { label: "Regular", price: 130 },
      { label: "Large", price: 170 },
    ],
    art: "shake",
    accent: "#F96B97",
    tint: "#FFE2EA",
    notes: ["Extra scoop +₹40"],
  },
  {
    id: "coffee",
    name: "Fresh Coffee",
    tagline: "Pulled to order on a real espresso machine",
    description:
      "Espresso, americano, cappuccino and latte, plus an affogato — espresso poured over a scoop of vanilla.",
    prices: [
      { label: "Espresso", price: 70 },
      { label: "Latte / cappuccino", price: 120 },
      { label: "Affogato", price: 160 },
    ],
    art: "coffee",
    photo: "/images/brand/photo-cup.jpg",
    accent: "#8A5A3C",
    tint: "#F1E1CF",
    notes: ["Oat milk available"],
  },
  {
    id: "cold",
    name: "Cold Beverages",
    tagline: "From the visi cooler, ready to go",
    description:
      "Chilled sparkling lemonade, iced tea, coconut water and bottled juices, kept at 4 °C in the glass-door cooler by the entrance.",
    prices: [
      { label: "Bottle", price: 50 },
      { label: "Can", price: 60 },
    ],
    art: "cold",
    accent: "#4DB6AC",
    tint: "#D9F1EE",
    notes: ["Grab and go"],
  },
];
