import { RateByPlayers, MachineType } from "../../../../generated/prisma";

// Rate by players with relations interface
export interface RateByPlayersWithRelations extends RateByPlayers {
  machineType?: MachineType;
}

// Create rate by players input type
export interface CreateRateByPlayersInput {
  noOfPlayers: number;
  price: number;
  machineTypeId: string;
}

// Update rate by players input type
export interface UpdateRateByPlayersInput {
  noOfPlayers?: number;
  price?: number;
}

// Rate by players filters for queries
export interface RateByPlayersFilters {
  machineTypeId?: string;
  minPlayers?: number;
  maxPlayers?: number;
  minPrice?: number;
  maxPrice?: number;
}

// Pagination options for rates
export interface RateByPlayersPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: keyof RateByPlayers;
  sortOrder?: "asc" | "desc";
}

// Rate by players response type for API
export interface RateByPlayersResponse {
  id: string;
  noOfPlayers: number;
  price: number;
  machineTypeId: string;
  machineType?: {
    id: string;
    name: string;
    description?: string;
  };
  pricePerPlayer?: number; // calculated field
}

// Standard include object for Prisma queries
export const rateByPlayersInclude = {
  machineType: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
} as const;

// Validation constants
export const RateByPlayersValidation = {
  MIN_PLAYERS: 1,
  MAX_PLAYERS: 8,
  MIN_PRICE: 0,
  MAX_PRICE: 10000, // in cents or smallest currency unit
} as const;

// Helper functions for validation
export const isValidPlayerCount = (noOfPlayers: number): boolean => {
  return (
    Number.isInteger(noOfPlayers) &&
    noOfPlayers >= RateByPlayersValidation.MIN_PLAYERS &&
    noOfPlayers <= RateByPlayersValidation.MAX_PLAYERS
  );
};

export const isValidPrice = (price: number): boolean => {
  return (
    Number.isInteger(price) &&
    price >= RateByPlayersValidation.MIN_PRICE &&
    price <= RateByPlayersValidation.MAX_PRICE
  );
};

export const isValidRateInput = (
  input: CreateRateByPlayersInput | UpdateRateByPlayersInput
): boolean => {
  if ("noOfPlayers" in input && input.noOfPlayers !== undefined) {
    if (!isValidPlayerCount(input.noOfPlayers)) return false;
  }
  if ("price" in input && input.price !== undefined) {
    if (!isValidPrice(input.price)) return false;
  }
  return true;
};

// Transform functions
export const rateByPlayersToResponse = (
  rate: RateByPlayersWithRelations
): RateByPlayersResponse => {
  const pricePerPlayer = rate.price / rate.noOfPlayers;

  return {
    id: rate.id,
    noOfPlayers: rate.noOfPlayers,
    price: rate.price,
    machineTypeId: rate.machineTypeId,
    pricePerPlayer: Math.round(pricePerPlayer * 100) / 100, // round to 2 decimal places
    ...(rate.machineType && {
      machineType: {
        id: rate.machineType.id,
        name: rate.machineType.name,
        description: rate.machineType.description || undefined,
      },
    }),
  };
};

export const ratesByPlayersToResponse = (
  rates: RateByPlayersWithRelations[]
): RateByPlayersResponse[] => {
  return rates.map(rateByPlayersToResponse);
};

// Rate by players statistics interface
export interface RateByPlayersStats {
  total: number;
  playerCountDistribution: Record<number, number>;
  priceRanges: {
    min: number;
    max: number;
    average: number;
    median: number;
  };
  averagePricePerPlayer: number;
  mostCommonPlayerCount: number;
  byMachineType: Record<
    string,
    {
      machineTypeId: string;
      machineTypeName: string;
      rateCount: number;
      averagePrice: number;
      playerCounts: number[];
    }
  >;
}

// Analysis functions
export const calculatePricePerPlayer = (rate: RateByPlayers): number => {
  return rate.price / rate.noOfPlayers;
};

export const getAveragePrice = (rates: RateByPlayers[]): number => {
  if (rates.length === 0) return 0;
  const total = rates.reduce((sum, rate) => sum + rate.price, 0);
  return Math.round((total / rates.length) * 100) / 100;
};

export const getAveragePricePerPlayer = (rates: RateByPlayers[]): number => {
  if (rates.length === 0) return 0;
  const total = rates.reduce(
    (sum, rate) => sum + calculatePricePerPlayer(rate),
    0
  );
  return Math.round((total / rates.length) * 100) / 100;
};

export const getPriceRange = (
  rates: RateByPlayers[]
): { min: number; max: number } => {
  if (rates.length === 0) return { min: 0, max: 0 };
  const prices = rates.map((rate) => rate.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

export const getMedianPrice = (rates: RateByPlayers[]): number => {
  if (rates.length === 0) return 0;
  const sortedPrices = rates.map((rate) => rate.price).sort((a, b) => a - b);
  const mid = Math.floor(sortedPrices.length / 2);

  if (sortedPrices.length % 2 === 0) {
    return (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;
  }
  return sortedPrices[mid];
};

// Grouping functions
export const groupRatesByPlayerCount = (
  rates: RateByPlayers[]
): Record<number, RateByPlayers[]> => {
  const grouped: Record<number, RateByPlayers[]> = {};

  rates.forEach((rate) => {
    if (!grouped[rate.noOfPlayers]) {
      grouped[rate.noOfPlayers] = [];
    }
    grouped[rate.noOfPlayers].push(rate);
  });

  return grouped;
};

export const groupRatesByMachineType = (
  rates: RateByPlayersWithRelations[]
): Record<string, RateByPlayersWithRelations[]> => {
  const grouped: Record<string, RateByPlayersWithRelations[]> = {};

  rates.forEach((rate) => {
    if (!grouped[rate.machineTypeId]) {
      grouped[rate.machineTypeId] = [];
    }
    grouped[rate.machineTypeId].push(rate);
  });

  return grouped;
};

// Player count analysis
export const getPlayerCountDistribution = (
  rates: RateByPlayers[]
): Record<number, number> => {
  const distribution: Record<number, number> = {};

  rates.forEach((rate) => {
    distribution[rate.noOfPlayers] = (distribution[rate.noOfPlayers] || 0) + 1;
  });

  return distribution;
};

export const getMostCommonPlayerCount = (rates: RateByPlayers[]): number => {
  const distribution = getPlayerCountDistribution(rates);
  let maxCount = 0;
  let mostCommon = 1;

  Object.entries(distribution).forEach(([playerCount, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = parseInt(playerCount);
    }
  });

  return mostCommon;
};

// Price filtering helpers
export const filterRatesByPriceRange = (
  rates: RateByPlayers[],
  minPrice: number,
  maxPrice: number
): RateByPlayers[] => {
  return rates.filter(
    (rate) => rate.price >= minPrice && rate.price <= maxPrice
  );
};

export const filterRatesByPlayerRange = (
  rates: RateByPlayers[],
  minPlayers: number,
  maxPlayers: number
): RateByPlayers[] => {
  return rates.filter(
    (rate) => rate.noOfPlayers >= minPlayers && rate.noOfPlayers <= maxPlayers
  );
};

// Rate comparison helpers
export const findCheapestRate = (
  rates: RateByPlayers[]
): RateByPlayers | null => {
  if (rates.length === 0) return null;
  return rates.reduce((cheapest, current) =>
    current.price < cheapest.price ? current : cheapest
  );
};

export const findMostExpensiveRate = (
  rates: RateByPlayers[]
): RateByPlayers | null => {
  if (rates.length === 0) return null;
  return rates.reduce((expensive, current) =>
    current.price > expensive.price ? current : expensive
  );
};

export const findBestValueRate = (
  rates: RateByPlayers[]
): RateByPlayers | null => {
  if (rates.length === 0) return null;
  return rates.reduce((bestValue, current) => {
    const currentPricePerPlayer = calculatePricePerPlayer(current);
    const bestValuePricePerPlayer = calculatePricePerPlayer(bestValue);
    return currentPricePerPlayer < bestValuePricePerPlayer
      ? current
      : bestValue;
  });
};

// Search query helper
export const createRateByPlayersSearchQuery = (
  filters: RateByPlayersFilters
) => {
  const where: any = {};

  if (filters.machineTypeId) {
    where.machineTypeId = filters.machineTypeId;
  }

  if (filters.minPlayers || filters.maxPlayers) {
    where.noOfPlayers = {};
    if (filters.minPlayers) where.noOfPlayers.gte = filters.minPlayers;
    if (filters.maxPlayers) where.noOfPlayers.lte = filters.maxPlayers;
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  return where;
};

// Legacy type aliases for backward compatibility
export type IRateByPlayers = RateByPlayers;
export type RateByPlayersModel = RateByPlayers;
