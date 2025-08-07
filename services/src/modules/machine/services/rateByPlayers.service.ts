import { PrismaClient, RateByPlayers } from "../../../../generated/prisma";
import {
  CreateRateByPlayersInput,
  UpdateRateByPlayersInput,
  RateByPlayersFilters,
  RateByPlayersPaginationOptions,
  RateByPlayersWithRelations,
  RateByPlayersResponse,
  RateByPlayersStats,
  rateByPlayersToResponse,
  isValidRateInput,
  createRateByPlayersSearchQuery,
} from "../models/rateByPlayers.model";

export class RateByPlayersService {
  constructor(private prisma: PrismaClient) {}

  // Utility functions
  private calculatePricePerPlayer(rate: RateByPlayers): number {
    return rate.price / rate.noOfPlayers;
  }

  private getAveragePrice(rates: RateByPlayers[]): number {
    if (rates.length === 0) return 0;
    const total = rates.reduce((sum, rate) => sum + rate.price, 0);
    return Math.round((total / rates.length) * 100) / 100;
  }

  private getAveragePricePerPlayer(rates: RateByPlayers[]): number {
    if (rates.length === 0) return 0;
    const total = rates.reduce(
      (sum, rate) => sum + this.calculatePricePerPlayer(rate),
      0
    );
    return Math.round((total / rates.length) * 100) / 100;
  }

  private getPriceRange(rates: RateByPlayers[]): { min: number; max: number } {
    if (rates.length === 0) return { min: 0, max: 0 };
    const prices = rates.map((rate) => rate.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  private getMedianPrice(rates: RateByPlayers[]): number {
    if (rates.length === 0) return 0;
    const sortedPrices = rates.map((rate) => rate.price).sort((a, b) => a - b);
    const mid = Math.floor(sortedPrices.length / 2);

    if (sortedPrices.length % 2 === 0) {
      return (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;
    }
    return sortedPrices[mid];
  }

  private groupRatesByPlayerCount(
    rates: RateByPlayers[]
  ): Record<number, RateByPlayers[]> {
    const grouped: Record<number, RateByPlayers[]> = {};

    rates.forEach((rate) => {
      if (!grouped[rate.noOfPlayers]) {
        grouped[rate.noOfPlayers] = [];
      }
      grouped[rate.noOfPlayers].push(rate);
    });

    return grouped;
  }

  private groupRatesByMachineType(
    rates: RateByPlayersWithRelations[]
  ): Record<string, RateByPlayersWithRelations[]> {
    const grouped: Record<string, RateByPlayersWithRelations[]> = {};

    rates.forEach((rate) => {
      if (!grouped[rate.machineTypeId]) {
        grouped[rate.machineTypeId] = [];
      }
      grouped[rate.machineTypeId].push(rate);
    });

    return grouped;
  }

  private getPlayerCountDistribution(
    rates: RateByPlayers[]
  ): Record<number, number> {
    const distribution: Record<number, number> = {};

    rates.forEach((rate) => {
      distribution[rate.noOfPlayers] =
        (distribution[rate.noOfPlayers] || 0) + 1;
    });

    return distribution;
  }

  private getMostCommonPlayerCount(rates: RateByPlayers[]): number {
    const distribution = this.getPlayerCountDistribution(rates);
    let maxCount = 0;
    let mostCommon = 1;

    Object.entries(distribution).forEach(([playerCount, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = parseInt(playerCount);
      }
    });

    return mostCommon;
  }

  private filterRatesByPriceRange(
    rates: RateByPlayers[],
    minPrice: number,
    maxPrice: number
  ): RateByPlayers[] {
    return rates.filter(
      (rate) => rate.price >= minPrice && rate.price <= maxPrice
    );
  }

  private filterRatesByPlayerRange(
    rates: RateByPlayers[],
    minPlayers: number,
    maxPlayers: number
  ): RateByPlayers[] {
    return rates.filter(
      (rate) => rate.noOfPlayers >= minPlayers && rate.noOfPlayers <= maxPlayers
    );
  }

  private findCheapestRate(rates: RateByPlayers[]): RateByPlayers | null {
    if (rates.length === 0) return null;
    return rates.reduce((cheapest, current) =>
      current.price < cheapest.price ? current : cheapest
    );
  }

  private findMostExpensiveRate(rates: RateByPlayers[]): RateByPlayers | null {
    if (rates.length === 0) return null;
    return rates.reduce((expensive, current) =>
      current.price > expensive.price ? current : expensive
    );
  }

  private findBestValueRate(rates: RateByPlayers[]): RateByPlayers | null {
    if (rates.length === 0) return null;
    return rates.reduce((bestValue, current) => {
      const currentPricePerPlayer = this.calculatePricePerPlayer(current);
      const bestValuePricePerPlayer = this.calculatePricePerPlayer(bestValue);
      return currentPricePerPlayer < bestValuePricePerPlayer
        ? current
        : bestValue;
    });
  }

  // API Methods
  async getRates(
    filters: RateByPlayersFilters,
    paginationOptions: RateByPlayersPaginationOptions
  ): Promise<RateByPlayersResponse[]> {
    const where = createRateByPlayersSearchQuery(filters);

    const skip =
      paginationOptions.page && paginationOptions.limit
        ? (paginationOptions.page - 1) * paginationOptions.limit
        : undefined;

    const orderBy = paginationOptions.sortBy
      ? { [paginationOptions.sortBy]: paginationOptions.sortOrder || "asc" }
      : undefined;

    const rates = await this.prisma.rateByPlayers.findMany({
      where,
      skip,
      take: paginationOptions.limit,
      orderBy,
      include: {
        machineType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return rates.map((rate) =>
      rateByPlayersToResponse(rate as RateByPlayersWithRelations)
    );
  }

  async getRateById(id: string): Promise<RateByPlayersResponse | null> {
    const rate = await this.prisma.rateByPlayers.findUnique({
      where: { id },
      include: {
        machineType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!rate) return null;

    return rateByPlayersToResponse(rate as RateByPlayersWithRelations);
  }

  async createRate(
    data: CreateRateByPlayersInput
  ): Promise<RateByPlayersResponse> {
    if (!isValidRateInput(data)) {
      throw new Error("Invalid rate input");
    }

    const rate = await this.prisma.rateByPlayers.create({
      data,
      include: {
        machineType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return rateByPlayersToResponse(rate as RateByPlayersWithRelations);
  }

  async updateRate(
    id: string,
    data: UpdateRateByPlayersInput
  ): Promise<RateByPlayersResponse | null> {
    if (!isValidRateInput(data)) {
      throw new Error("Invalid rate input");
    }

    const rate = await this.prisma.rateByPlayers.update({
      where: { id },
      data,
      include: {
        machineType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return rateByPlayersToResponse(rate as RateByPlayersWithRelations);
  }

  async deleteRate(id: string): Promise<void> {
    await this.prisma.rateByPlayers.delete({
      where: { id },
    });
  }

  async getRateStats(): Promise<RateByPlayersStats> {
    const rates = (await this.prisma.rateByPlayers.findMany({
      include: {
        machineType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })) as RateByPlayersWithRelations[];

    const priceRanges = this.getPriceRange(rates);
    const playerCountDistribution = this.getPlayerCountDistribution(rates);
    const mostCommonPlayerCount = this.getMostCommonPlayerCount(rates);

    const byMachineType = this.groupRatesByMachineType(rates);
    const machineTypeSummary: Record<
      string,
      {
        machineTypeId: string;
        machineTypeName: string;
        rateCount: number;
        averagePrice: number;
        playerCounts: number[];
      }
    > = {};

    Object.entries(byMachineType).forEach(([machineTypeId, typeRates]) => {
      if (typeRates[0].machineType) {
        machineTypeSummary[machineTypeId] = {
          machineTypeId,
          machineTypeName: typeRates[0].machineType.name,
          rateCount: typeRates.length,
          averagePrice: this.getAveragePrice(typeRates),
          playerCounts: [...new Set(typeRates.map((r) => r.noOfPlayers))],
        };
      }
    });

    return {
      total: rates.length,
      playerCountDistribution,
      priceRanges: {
        ...priceRanges,
        average: this.getAveragePrice(rates),
        median: this.getMedianPrice(rates),
      },
      averagePricePerPlayer: this.getAveragePricePerPlayer(rates),
      mostCommonPlayerCount,
      byMachineType: machineTypeSummary,
    };
  }
}
