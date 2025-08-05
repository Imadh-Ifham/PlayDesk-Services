import { PrismaClient, MachineType } from "../../../../generated/prisma";
import {
  CreateMachineTypeInput,
  UpdateMachineTypeInput,
  MachineTypeFilters,
  MachineTypePaginationOptions,
  MachineTypeWithRelations,
  MachineTypeResponse,
  MachineTypeStats,
  RateByPlayersInput,
  UpdateRateByPlayersInput,
  isValidMachineTypeName,
  isValidDescription,
  isValidSpecifications,
  isValidImageUrl,
  machineTypeToResponse,
  createMachineTypeSearchQuery,
} from "../models/machineType.model";

export class MachineTypeService {
  constructor(private prisma: PrismaClient) {}

  // Utility functions
  private groupMachineTypesByLounge(
    machineTypes: MachineTypeWithRelations[]
  ): Record<string, MachineTypeWithRelations[]> {
    const grouped: Record<string, MachineTypeWithRelations[]> = {};

    machineTypes.forEach((type) => {
      if (!grouped[type.loungeId]) {
        grouped[type.loungeId] = [];
      }
      grouped[type.loungeId].push(type);
    });

    return grouped;
  }

  private getMachineTypesWithSpecifications(
    machineTypes: MachineType[]
  ): MachineType[] {
    return machineTypes.filter((type) => type.specifications);
  }

  private getMachineTypesWithImages(
    machineTypes: MachineType[]
  ): MachineType[] {
    return machineTypes.filter((type) => type.imageUrl);
  }

  private getMostPopularMachineTypes(
    machineTypes: MachineTypeWithRelations[]
  ): MachineTypeWithRelations[] {
    return machineTypes
      .filter((type) => type.machines && type.machines.length > 0)
      .sort((a, b) => (b.machines?.length || 0) - (a.machines?.length || 0));
  }

  private calculateTotalMachines(
    machineTypes: MachineTypeWithRelations[]
  ): number {
    return machineTypes.reduce(
      (total, type) => total + (type.machines?.length || 0),
      0
    );
  }

  private getAverageMachinesPerType(
    machineTypes: MachineTypeWithRelations[]
  ): number {
    if (machineTypes.length === 0) return 0;
    const totalMachines = this.calculateTotalMachines(machineTypes);
    return Math.round((totalMachines / machineTypes.length) * 100) / 100;
  }

  // API Methods
  async getMachineTypes(
    filters: MachineTypeFilters,
    paginationOptions: MachineTypePaginationOptions
  ): Promise<MachineTypeResponse[]> {
    const where: any = {};

    // Apply filters
    if (filters.search) {
      Object.assign(where, createMachineTypeSearchQuery(filters.search));
    }
    if (filters.loungeId) where.loungeId = filters.loungeId;
    if (filters.hasSpecifications) where.specifications = { not: null };
    if (filters.hasImage) where.imageUrl = { not: null };

    // Apply pagination
    const skip =
      paginationOptions.page && paginationOptions.limit
        ? (paginationOptions.page - 1) * paginationOptions.limit
        : undefined;

    const orderBy = paginationOptions.sortBy
      ? { [paginationOptions.sortBy]: paginationOptions.sortOrder || "asc" }
      : undefined;

    const machineTypes = await this.prisma.machineType.findMany({
      where,
      skip,
      take: paginationOptions.limit,
      orderBy,
      include: {
        machines: true,
        lounge: {
          select: {
            id: true,
            name: true,
          },
        },
        rateByPlayers: true,
      },
    });

    return machineTypes.map((type) =>
      machineTypeToResponse(type as MachineTypeWithRelations)
    );
  }

  async getMachineTypeById(id: string): Promise<MachineTypeResponse | null> {
    const machineType = await this.prisma.machineType.findUnique({
      where: { id },
      include: {
        machines: true,
        lounge: {
          select: {
            id: true,
            name: true,
          },
        },
        rateByPlayers: true,
      },
    });

    if (!machineType) return null;

    return machineTypeToResponse(machineType as MachineTypeWithRelations);
  }

  async createMachineType(
    data: CreateMachineTypeInput
  ): Promise<MachineTypeResponse> {
    // Validate input
    if (!isValidMachineTypeName(data.name)) {
      throw new Error("Invalid machine type name");
    }
    if (!isValidDescription(data.description)) {
      throw new Error("Invalid description");
    }
    if (!isValidSpecifications(data.specifications)) {
      throw new Error("Invalid specifications");
    }
    if (!isValidImageUrl(data.imageUrl)) {
      throw new Error("Invalid image URL");
    }

    const machineType = await this.prisma.machineType.create({
      data,
      include: {
        machines: true,
        lounge: {
          select: {
            id: true,
            name: true,
          },
        },
        rateByPlayers: true,
      },
    });

    return machineTypeToResponse(machineType as MachineTypeWithRelations);
  }

  async updateMachineType(
    id: string,
    data: UpdateMachineTypeInput
  ): Promise<MachineTypeResponse | null> {
    // Validate input
    if (data.name && !isValidMachineTypeName(data.name)) {
      throw new Error("Invalid machine type name");
    }
    if (data.description && !isValidDescription(data.description)) {
      throw new Error("Invalid description");
    }
    if (data.specifications && !isValidSpecifications(data.specifications)) {
      throw new Error("Invalid specifications");
    }
    if (data.imageUrl && !isValidImageUrl(data.imageUrl)) {
      throw new Error("Invalid image URL");
    }

    const machineType = await this.prisma.machineType.update({
      where: { id },
      data,
      include: {
        machines: true,
        lounge: {
          select: {
            id: true,
            name: true,
          },
        },
        rateByPlayers: true,
      },
    });

    return machineTypeToResponse(machineType as MachineTypeWithRelations);
  }

  async deleteMachineType(id: string): Promise<void> {
    await this.prisma.machineType.delete({
      where: { id },
    });
  }

  async addRateToMachineType(machineTypeId: string, rate: RateByPlayersInput) {
    return await this.prisma.rateByPlayers.create({
      data: rate,
    });
  }

  async updateRateForMachineType(
    rateId: string,
    data: UpdateRateByPlayersInput
  ) {
    return await this.prisma.rateByPlayers.update({
      where: { id: rateId },
      data,
    });
  }

  async deleteRateFromMachineType(rateId: string) {
    return await this.prisma.rateByPlayers.delete({
      where: { id: rateId },
    });
  }

  async getMachineTypeStats(): Promise<MachineTypeStats> {
    const machineTypes = (await this.prisma.machineType.findMany({
      include: {
        machines: true,
        lounge: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })) as MachineTypeWithRelations[];

    const totalMachines = this.calculateTotalMachines(machineTypes);
    const withSpecifications =
      this.getMachineTypesWithSpecifications(machineTypes).length;
    const withImages = this.getMachineTypesWithImages(machineTypes).length;

    const byLounge = this.groupMachineTypesByLounge(machineTypes);
    const loungeSummary: Record<
      string,
      {
        loungeId: string;
        loungeName: string;
        typeCount: number;
        machineCount: number;
      }
    > = {};

    Object.entries(byLounge).forEach(([loungeId, types]) => {
      if (types[0].lounge) {
        loungeSummary[loungeId] = {
          loungeId,
          loungeName: types[0].lounge.name,
          typeCount: types.length,
          machineCount: types.reduce(
            (sum, type) => sum + (type.machines?.length || 0),
            0
          ),
        };
      }
    });

    return {
      total: machineTypes.length,
      totalMachines,
      averageMachinesPerType: this.getAverageMachinesPerType(machineTypes),
      withSpecifications,
      withImages,
      byLounge: loungeSummary,
    };
  }
}
