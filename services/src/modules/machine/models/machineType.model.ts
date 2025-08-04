import {
  MachineType,
  Machine,
  Lounge,
  RateByPlayers,
} from "../../../../generated/prisma";

// Machine Type with relations interface
export interface MachineTypeWithRelations extends MachineType {
  machines?: Machine[];
  lounge?: Lounge;
  rateByPlayers?: RateByPlayers[];
}

// Create machine type input type
export interface CreateMachineTypeInput {
  name: string;
  specifications?: string;
  description?: string;
  imageUrl?: string;
  loungeId: string;
}

// Update machine type input type
export interface UpdateMachineTypeInput {
  name?: string;
  specifications?: string;
  description?: string;
  imageUrl?: string;
}

// Machine type filters for queries
export interface MachineTypeFilters {
  search?: string;
  loungeId?: string;
  hasSpecifications?: boolean;
  hasImage?: boolean;
}

// Pagination options for machine types
export interface MachineTypePaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: keyof MachineType;
  sortOrder?: "asc" | "desc";
}

// Machine type response type for API
export interface MachineTypeResponse {
  id: string;
  name: string;
  specifications?: string;
  description?: string;
  imageUrl?: string;
  loungeId: string;
  createdAt: string;
  updatedAt: string;
  machineCount?: number;
  lounge?: {
    id: string;
    name: string;
  };
  rateByPlayers?: Array<{
    id: string;
    noOfPlayers: number;
    price: number;
  }>;
}

// Standard include object for Prisma queries
export const machineTypeInclude = {
  machines: {
    select: {
      id: true,
      serialNumber: true,
      status: true,
      category: true,
    },
  },
  lounge: {
    select: {
      id: true,
      name: true,
    },
  },
  rateByPlayers: {
    select: {
      id: true,
      noOfPlayers: true,
      price: true,
    },
  },
} as const;

// Validation constants
export const MachineTypeValidation = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  SPECIFICATIONS_MAX_LENGTH: 1000,
  NAME_PATTERN: /^[a-zA-Z0-9\s\-_().]+$/,
} as const;

// Helper functions for validation
export const isValidMachineTypeName = (name: string): boolean => {
  return (
    name.length >= MachineTypeValidation.NAME_MIN_LENGTH &&
    name.length <= MachineTypeValidation.NAME_MAX_LENGTH &&
    MachineTypeValidation.NAME_PATTERN.test(name)
  );
};

export const isValidDescription = (description?: string): boolean => {
  if (!description) return true;
  return description.length <= MachineTypeValidation.DESCRIPTION_MAX_LENGTH;
};

export const isValidSpecifications = (specifications?: string): boolean => {
  if (!specifications) return true;
  return (
    specifications.length <= MachineTypeValidation.SPECIFICATIONS_MAX_LENGTH
  );
};

export const isValidImageUrl = (imageUrl?: string): boolean => {
  if (!imageUrl) return true;
  try {
    new URL(imageUrl);
    return true;
  } catch {
    return false;
  }
};

// Transform functions
export const machineTypeToResponse = (
  machineType: MachineTypeWithRelations
): MachineTypeResponse => {
  return {
    id: machineType.id,
    name: machineType.name,
    specifications: machineType.specifications || undefined,
    description: machineType.description || undefined,
    imageUrl: machineType.imageUrl || undefined,
    loungeId: machineType.loungeId,
    createdAt: machineType.createdAt.toISOString(),
    updatedAt: machineType.updatedAt.toISOString(),
    ...(machineType.machines && {
      machineCount: machineType.machines.length,
    }),
    ...(machineType.lounge && {
      lounge: {
        id: machineType.lounge.id,
        name: machineType.lounge.name,
      },
    }),
    ...(machineType.rateByPlayers && {
      rateByPlayers: machineType.rateByPlayers.map((rate) => ({
        id: rate.id,
        noOfPlayers: rate.noOfPlayers,
        price: rate.price,
      })),
    }),
  };
};

export const machineTypesToResponse = (
  machineTypes: MachineTypeWithRelations[]
): MachineTypeResponse[] => {
  return machineTypes.map(machineTypeToResponse);
};

// Machine type statistics interface
export interface MachineTypeStats {
  total: number;
  totalMachines: number;
  averageMachinesPerType: number;
  withSpecifications: number;
  withImages: number;
  byLounge: Record<
    string,
    {
      loungeId: string;
      loungeName: string;
      typeCount: number;
      machineCount: number;
    }
  >;
}

// Search query helper
export const createMachineTypeSearchQuery = (search: string) => {
  return {
    OR: [
      { name: { contains: search, mode: "insensitive" as const } },
      { description: { contains: search, mode: "insensitive" as const } },
      { specifications: { contains: search, mode: "insensitive" as const } },
      { lounge: { name: { contains: search, mode: "insensitive" as const } } },
    ],
  };
};

// Machine type grouping functions
export const groupMachineTypesByLounge = (
  machineTypes: MachineTypeWithRelations[]
): Record<string, MachineTypeWithRelations[]> => {
  const grouped: Record<string, MachineTypeWithRelations[]> = {};

  machineTypes.forEach((type) => {
    if (!grouped[type.loungeId]) {
      grouped[type.loungeId] = [];
    }
    grouped[type.loungeId].push(type);
  });

  return grouped;
};

// Machine type analysis helpers
export const getMachineTypesWithSpecifications = (
  machineTypes: MachineType[]
): MachineType[] => {
  return machineTypes.filter((type) => type.specifications);
};

export const getMachineTypesWithImages = (
  machineTypes: MachineType[]
): MachineType[] => {
  return machineTypes.filter((type) => type.imageUrl);
};

export const getMostPopularMachineTypes = (
  machineTypes: MachineTypeWithRelations[]
): MachineTypeWithRelations[] => {
  return machineTypes
    .filter((type) => type.machines && type.machines.length > 0)
    .sort((a, b) => (b.machines?.length || 0) - (a.machines?.length || 0));
};

// Machine type utility functions
export const calculateTotalMachines = (
  machineTypes: MachineTypeWithRelations[]
): number => {
  return machineTypes.reduce(
    (total, type) => total + (type.machines?.length || 0),
    0
  );
};

export const getAverageMachinesPerType = (
  machineTypes: MachineTypeWithRelations[]
): number => {
  if (machineTypes.length === 0) return 0;
  const totalMachines = calculateTotalMachines(machineTypes);
  return Math.round((totalMachines / machineTypes.length) * 100) / 100;
};

// Price range helpers
export const getPriceRange = (
  machineType: MachineTypeWithRelations
): { min: number; max: number } | null => {
  if (!machineType.rateByPlayers || machineType.rateByPlayers.length === 0) {
    return null;
  }

  const prices = machineType.rateByPlayers.map((rate) => rate.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

export const getMinPrice = (
  machineType: MachineTypeWithRelations
): number | null => {
  const range = getPriceRange(machineType);
  return range ? range.min : null;
};

export const getMaxPrice = (
  machineType: MachineTypeWithRelations
): number | null => {
  const range = getPriceRange(machineType);
  return range ? range.max : null;
};

// Legacy type aliases for backward compatibility
export type IMachineType = MachineType;
export type MachineTypeModel = MachineType;
