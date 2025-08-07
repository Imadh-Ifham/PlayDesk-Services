import {
  PrismaClient,
  Machine,
  MachineCategory,
  MachineStatus,
} from "../../../../generated/prisma";
import {
  CreateMachineInput,
  UpdateMachineInput,
  MachineFilters,
  MachinePaginationOptions,
  MachineWithRelations,
  MachineResponse,
  MachineStats,
  machineToResponse,
  createMachineSearchQuery,
} from "../models/machine.model";

export class MachineService {
  constructor(private prisma: PrismaClient) {}

  // Utility functions
  private groupMachinesByCategory(
    machines: Machine[]
  ): Record<MachineCategory, Machine[]> {
    const grouped = {
      [MachineCategory.Console]: [],
      [MachineCategory.PC_L]: [],
      [MachineCategory.PC_R]: [],
    } as Record<MachineCategory, Machine[]>;

    machines.forEach((machine) => {
      grouped[machine.category].push(machine);
    });

    return grouped;
  }

  private groupMachinesByStatus(
    machines: Machine[]
  ): Record<MachineStatus, Machine[]> {
    const grouped = {
      [MachineStatus.online]: [],
      [MachineStatus.offline]: [],
    } as Record<MachineStatus, Machine[]>;

    machines.forEach((machine) => {
      grouped[machine.status].push(machine);
    });

    return grouped;
  }

  private isAvailableMachine(machine: Machine): boolean {
    return machine.status === MachineStatus.online;
  }

  private generateSerialNumber(
    category: MachineCategory,
    index: number
  ): string {
    const categoryPrefixes = {
      [MachineCategory.Console]: "CON",
      [MachineCategory.PC_L]: "PCL",
      [MachineCategory.PC_R]: "PCR",
    };

    return `${categoryPrefixes[category]}-${String(index).padStart(3, "0")}`;
  }

  private getAvailableMachines(machines: Machine[]): Machine[] {
    return machines.filter(this.isAvailableMachine);
  }

  private getOfflineMachines(machines: Machine[]): Machine[] {
    return machines.filter(
      (machine) => machine.status === MachineStatus.offline
    );
  }

  private countMachinesByCategory(
    machines: Machine[]
  ): Record<MachineCategory, number> {
    return {
      [MachineCategory.Console]: machines.filter(
        (m) => m.category === MachineCategory.Console
      ).length,
      [MachineCategory.PC_L]: machines.filter(
        (m) => m.category === MachineCategory.PC_L
      ).length,
      [MachineCategory.PC_R]: machines.filter(
        (m) => m.category === MachineCategory.PC_R
      ).length,
    };
  }

  private countMachinesByStatus(
    machines: Machine[]
  ): Record<MachineStatus, number> {
    return {
      [MachineStatus.online]: machines.filter(
        (m) => m.status === MachineStatus.online
      ).length,
      [MachineStatus.offline]: machines.filter(
        (m) => m.status === MachineStatus.offline
      ).length,
    };
  }

  private calculateUtilizationRate(machines: Machine[]): number {
    if (machines.length === 0) return 0;
    const onlineCount = machines.filter(
      (m) => m.status === MachineStatus.online
    ).length;
    return Math.round((onlineCount / machines.length) * 100);
  }

  // API Methods
  async getMachines(
    filters: MachineFilters,
    paginationOptions: MachinePaginationOptions
  ): Promise<MachineResponse[]> {
    const where: any = {};

    // Apply filters
    if (filters.search) {
      Object.assign(where, createMachineSearchQuery(filters.search));
    }
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.loungeId) where.loungeId = filters.loungeId;
    if (filters.machineTypeId) where.machineTypeId = filters.machineTypeId;

    // Apply pagination
    const skip =
      paginationOptions.page && paginationOptions.limit
        ? (paginationOptions.page - 1) * paginationOptions.limit
        : undefined;

    const orderBy = paginationOptions.sortBy
      ? { [paginationOptions.sortBy]: paginationOptions.sortOrder || "asc" }
      : undefined;

    const machines = await this.prisma.machine.findMany({
      where,
      skip,
      take: paginationOptions.limit,
      orderBy,
      include: {
        machineType: true,
        lounge: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return machines.map((machine) =>
      machineToResponse(machine as MachineWithRelations)
    );
  }

  async getMachineById(id: string): Promise<MachineResponse | null> {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
      include: {
        machineType: true,
        lounge: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!machine) return null;

    return machineToResponse(machine as MachineWithRelations);
  }

  async createMachine(data: CreateMachineInput): Promise<MachineResponse> {
    const machine = await this.prisma.machine.create({
      data,
      include: {
        machineType: true,
        lounge: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return machineToResponse(machine as MachineWithRelations);
  }

  async updateMachine(
    id: string,
    data: UpdateMachineInput
  ): Promise<MachineResponse | null> {
    const machine = await this.prisma.machine.update({
      where: { id },
      data,
      include: {
        machineType: true,
        lounge: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return machineToResponse(machine as MachineWithRelations);
  }

  async deleteMachine(id: string): Promise<void> {
    await this.prisma.machine.delete({
      where: { id },
    });
  }

  async getMachineStats(): Promise<MachineStats> {
    const machines = await this.prisma.machine.findMany({
      include: {
        lounge: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const byCategory = this.countMachinesByCategory(machines);
    const byStatus = this.countMachinesByStatus(machines);
    const byLounge: Record<
      string,
      {
        loungeId: string;
        loungeName: string;
        total: number;
        online: number;
        offline: number;
      }
    > = {};

    machines.forEach((machine) => {
      if (machine.lounge) {
        const loungeId = machine.lounge.id;
        if (!byLounge[loungeId]) {
          byLounge[loungeId] = {
            loungeId,
            loungeName: machine.lounge.name,
            total: 0,
            online: 0,
            offline: 0,
          };
        }
        byLounge[loungeId].total++;
        if (machine.status === "online") {
          byLounge[loungeId].online++;
        } else {
          byLounge[loungeId].offline++;
        }
      }
    });

    return {
      total: machines.length,
      byCategory,
      byStatus,
      byLounge,
      utilizationRate: this.calculateUtilizationRate(machines),
    };
  }
}
