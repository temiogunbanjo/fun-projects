// 1, 1, 2, 3, 5, 8, 13, 21, 33, 54, 87, 141
const cardTypes = {
  bread: {
    image: "./assets/bread-i8k.png",
    unlocksAt: 1,
    description: "",
  },
  strawberry: {
    image: "./assets/strawberry_PNG2587.png",
    unlocksAt: 1,
    description: "",
  },
  vehicles: {
    image: "./assets/land-rover-range-rover-car-png-25.png",
    unlocksAt: 5,
    description: "",
  },
  places: {
    image: "./assets/japan-famous-landmark-png.webp",
    unlocksAt: 13,
    description: "",
  },
  sneakers: {
    image:
      "./assets/pngtree-dropshipping-men-hole-sole-jogging-shoes-png-image_11389148.png",
    unlocksAt: 21,
    description: "",
  },
  guava: {
    image: "./assets/pngimg.com - guava_PNG18.png",
    unlocksAt: 29,
    description: "",
  },
  furniture: {
    image:
      "./assets/ai-generated-armchair-furniture-isolated-on-transparent-background-free-png.webp",
    unlocksAt: 29,
    description: "",
  },
  shoes: {
    image: "./assets/pngimg.com - men_shoes_PNG7492.png",
    unlocksAt: 29,
    description: "",
  },
  pineapple: {
    image: "./assets/pngimg.com - pineapple_PNG2733.webp",
    unlocksAt: 33,
    description: "",
  },
  banana: {
    image: "./assets/Banana-Stack-PNG.png",
    unlocksAt: 2,
    description: "",
  },
  sapphire: {
    image:
      "./assets/ai-generated-blue-gem-stone-isolated-on-transparent-background-png.webp",
    unlocksAt: 38,
    description: "",
  },
  ruby: {
    image: "./assets/Gem-PNG-Download-Image.png",
    unlocksAt: 38,
    description: "",
  },
};

const powerActionTypes = {
  "peek-a-boo": {
    id: "peek-a-boo",
  },
  "mega-blaster": {
    id: "blast-card",
  },
};

const availablePowerTypes = Object.keys(powerActionTypes);
