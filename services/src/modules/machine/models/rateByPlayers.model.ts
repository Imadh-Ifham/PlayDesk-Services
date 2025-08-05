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
  pricePerPlayer?: number;
}

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

// Transform function
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

// Statistics interface
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

// Legacy type aliases for backward compatibility
export type IRateByPlayers = RateByPlayers;
export type RateByPlayersModel = RateByPlayers;
