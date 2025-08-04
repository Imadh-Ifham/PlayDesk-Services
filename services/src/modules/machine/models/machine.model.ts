import {
  Machine,
  MachineType,
  Lounge,
  MachineCategory,
  MachineStatus,
} from "../../../../generated/prisma";

// Re-export Prisma-generated enums for convenience
export { MachineCategory, MachineStatus } from "../../../../generated/prisma";

// Machine with relations interface
export interface MachineWithRelations extends Machine {
  machineType?: MachineType;
  lounge?: Lounge;
}

// Create machine input type
export interface CreateMachineInput {
  machineTypeId: string;
  category: MachineCategory;
  serialNumber: string;
  loungeId: string;
  status?: MachineStatus;
}

// Update machine input type
export interface UpdateMachineInput {
  machineTypeId?: string;
  category?: MachineCategory;
  serialNumber?: string;
  status?: MachineStatus;
}

// Machine filters for queries
export interface MachineFilters {
  search?: string;
  category?: MachineCategory;
  status?: MachineStatus;
  loungeId?: string;
  machineTypeId?: string;
}

// Pagination options
export interface MachinePaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: keyof Machine;
  sortOrder?: "asc" | "desc";
}

// Machine response type for API
export interface MachineResponse {
  id: string;
  machineTypeId: string;
  category: MachineCategory;
  serialNumber: string;
  status: MachineStatus;
  loungeId: string;
  createdAt: string;
  updatedAt: string;
  machineType?: {
    id: string;
    name: string;
    specifications?: string;
    description?: string;
    imageUrl?: string;
  };
  lounge?: {
    id: string;
    name: string;
  };
}

// Standard include object for Prisma queries
export const machineInclude = {
  machineType: {
    select: {
      id: true,
      name: true,
      specifications: true,
      description: true,
      imageUrl: true,
    },
  },
  lounge: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

// Validation constants
export const MachineValidation = {
  SERIAL_NUMBER_MIN_LENGTH: 3,
  SERIAL_NUMBER_MAX_LENGTH: 50,
  SERIAL_NUMBER_PATTERN: /^[A-Z0-9-_]+$/,
} as const;

// Machine categories enum values
export const MachineCategoryValues = {
  Console: "Console",
  PC_L: "PC_L",
  PC_R: "PC_R",
} as const;

// Machine status enum values
export const MachineStatusValues = {
  online: "online",
  offline: "offline",
} as const;

// Helper functions for validation
export const isMachineCategoryValid = (
  category: string
): category is MachineCategory => {
  return Object.values(MachineCategory).includes(category as MachineCategory);
};

export const isMachineStatusValid = (
  status: string
): status is MachineStatus => {
  return Object.values(MachineStatus).includes(status as MachineStatus);
};

export const isValidSerialNumberFormat = (serialNumber: string): boolean => {
  return (
    serialNumber.length >= MachineValidation.SERIAL_NUMBER_MIN_LENGTH &&
    serialNumber.length <= MachineValidation.SERIAL_NUMBER_MAX_LENGTH &&
    MachineValidation.SERIAL_NUMBER_PATTERN.test(serialNumber)
  );
};

// Transform functions
export const machineToResponse = (
  machine: MachineWithRelations
): MachineResponse => {
  return {
    id: machine.id,
    machineTypeId: machine.machineTypeId,
    category: machine.category,
    serialNumber: machine.serialNumber,
    status: machine.status,
    loungeId: machine.loungeId,
    createdAt: machine.createdAt.toISOString(),
    updatedAt: machine.updatedAt.toISOString(),
    ...(machine.machineType && {
      machineType: {
        id: machine.machineType.id,
        name: machine.machineType.name,
        specifications: machine.machineType.specifications || undefined,
        description: machine.machineType.description || undefined,
        imageUrl: machine.machineType.imageUrl || undefined,
      },
    }),
    ...(machine.lounge && {
      lounge: {
        id: machine.lounge.id,
        name: machine.lounge.name,
      },
    }),
  };
};

export const machinesToResponse = (
  machines: MachineWithRelations[]
): MachineResponse[] => {
  return machines.map(machineToResponse);
};

// Machine statistics interface
export interface MachineStats {
  total: number;
  byCategory: Record<MachineCategory, number>;
  byStatus: Record<MachineStatus, number>;
  byLounge: Record<
    string,
    {
      loungeId: string;
      loungeName: string;
      total: number;
      online: number;
      offline: number;
    }
  >;
  utilizationRate: number; // percentage of online machines
}

// Machine grouping functions
export const groupMachinesByCategory = (
  machines: Machine[]
): Record<MachineCategory, Machine[]> => {
  const grouped = {
    [MachineCategory.Console]: [],
    [MachineCategory.PC_L]: [],
    [MachineCategory.PC_R]: [],
  } as Record<MachineCategory, Machine[]>;

  machines.forEach((machine) => {
    grouped[machine.category].push(machine);
  });

  return grouped;
};

export const groupMachinesByStatus = (
  machines: Machine[]
): Record<MachineStatus, Machine[]> => {
  const grouped = {
    [MachineStatus.online]: [],
    [MachineStatus.offline]: [],
  } as Record<MachineStatus, Machine[]>;

  machines.forEach((machine) => {
    grouped[machine.status].push(machine);
  });

  return grouped;
};

// Machine availability checker
export const isAvailableMachine = (machine: Machine): boolean => {
  return machine.status === MachineStatus.online;
};

// Machine category display helpers
export const getCategoryDisplayName = (category: MachineCategory): string => {
  const displayNames = {
    [MachineCategory.Console]: "Gaming Console",
    [MachineCategory.PC_L]: "PC Gaming (Left)",
    [MachineCategory.PC_R]: "PC Gaming (Right)",
  };
  return displayNames[category];
};

// Machine status display helpers
export const getStatusDisplayName = (status: MachineStatus): string => {
  const displayNames = {
    [MachineStatus.online]: "Online",
    [MachineStatus.offline]: "Offline",
  };
  return displayNames[status];
};

// Machine search helper
export const createMachineSearchQuery = (search: string) => {
  return {
    OR: [
      { serialNumber: { contains: search, mode: "insensitive" as const } },
      {
        machineType: {
          name: { contains: search, mode: "insensitive" as const },
        },
      },
      { lounge: { name: { contains: search, mode: "insensitive" as const } } },
    ],
  };
};

// Serial number generator helper
export const generateSerialNumber = (
  category: MachineCategory,
  index: number
): string => {
  const categoryPrefixes = {
    [MachineCategory.Console]: "CON",
    [MachineCategory.PC_L]: "PCL",
    [MachineCategory.PC_R]: "PCR",
  };

  return `${categoryPrefixes[category]}-${String(index).padStart(3, "0")}`;
};

// Machine availability helpers
export const getAvailableMachines = (machines: Machine[]): Machine[] => {
  return machines.filter(isAvailableMachine);
};

export const getOfflineMachines = (machines: Machine[]): Machine[] => {
  return machines.filter((machine) => machine.status === MachineStatus.offline);
};

// Machine count helpers
export const countMachinesByCategory = (
  machines: Machine[]
): Record<MachineCategory, number> => {
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
};

export const countMachinesByStatus = (
  machines: Machine[]
): Record<MachineStatus, number> => {
  return {
    [MachineStatus.online]: machines.filter(
      (m) => m.status === MachineStatus.online
    ).length,
    [MachineStatus.offline]: machines.filter(
      (m) => m.status === MachineStatus.offline
    ).length,
  };
};

// Calculate utilization rate
export const calculateUtilizationRate = (machines: Machine[]): number => {
  if (machines.length === 0) return 0;
  const onlineCount = machines.filter(
    (m) => m.status === MachineStatus.online
  ).length;
  return Math.round((onlineCount / machines.length) * 100);
};

// Legacy type aliases for backward compatibility
export type IMachine = Machine;
export type MachineModel = Machine;
export type MachineBlock = MachineCategory;
