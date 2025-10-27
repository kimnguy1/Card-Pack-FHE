
// Contract address on Sepolia (deployed)
export const CARD_PACK_CONTRACT_ADDRESS = "0x3E948fDFeFF5C435eaff8390bb221e25dA8A8b27" as `0x${string}`

// Pack types (match FlipCardStore: 0 = small, 1 = med, 2 = large)
export const PACK_TYPES = {
  POKEMON_SMALL: 0,
  ONE_PIECE_MED: 1,
  ONE_PIECE_LARGE: 2,
} as const

// Pack prices in ETH (strings for parse)
export const PACK_PRICES = {
  [PACK_TYPES.POKEMON_SMALL]: "0.001",
  [PACK_TYPES.ONE_PIECE_MED]: "0.01",
  [PACK_TYPES.ONE_PIECE_LARGE]: "0.1",
} as const

// Pack names
export const PACK_NAMES = {
  [PACK_TYPES.POKEMON_SMALL]: "Pokemon Pack",
  [PACK_TYPES.ONE_PIECE_MED]: "One Piece Pack",
  [PACK_TYPES.ONE_PIECE_LARGE]: "One Piece (Large)",
} as const

// Card themes
export const CARD_THEMES = {
  [PACK_TYPES.POKEMON_SMALL]: "pokemon",
  [PACK_TYPES.ONE_PIECE_MED]: "onepiece",
  [PACK_TYPES.ONE_PIECE_LARGE]: "onepiece",
} as const

export const CARD_IMAGES = {
  pokemon: {
    legendary: "/pikachu-legendary-winter-pokemon-card.jpg",
    rare: "/charizard-rare-winter-pokemon-card.jpg",
    common: "/squirtle-common-winter-pokemon-card.jpg",
  },
  onepiece: {
    legendary: "/luffy-gear-5-legendary-winter-one-piece-card.jpg",
    rare: "/zoro-rare-winter-one-piece-card.jpg",
    common: "/nami-common-winter-one-piece-card.jpg",
  },
  naruto: {
    legendary: "/naruto-sage-mode-legendary-winter-card.jpg",
    rare: "/sasuke-sharingan-rare-winter-naruto-card.jpg",
    common: "/sakura-common-winter-naruto-card.jpg",
  },
} as const

export const PACK_COVER_IMAGES = {
  pokemon: "/pokemon-winter-card-pack-cover-with-pokeball.jpg",
  onepiece: "/one-piece-winter-card-pack-cover-with-pirate-flag.jpg",
  naruto: "/naruto-winter-card-pack-cover-with-leaf-village-sy.jpg",
} as const
