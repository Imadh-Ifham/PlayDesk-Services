// Import Prisma client types
import prisma from "../../../config/db";
import PrismaClient from "../../../config/db";
import { IMachineType } from "./machineType.model";

// MachineBlock enum type
export type MachineBlock = "Console" | "PC-L" | "PC-R";

// MachineStatus enum type
export type MachineStatus = "online" | "offline";

// Interface for Machine with relations
export interface IMachine {
  id: string;
  machineTypeId: string;
  category: MachineBlock;
  serialNumber: string;
  status: MachineStatus;
  loungeId: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations (optional since they might not always be included)
  machineType?: IMachineType;
  lounge?: {
    id: string;
    name: string;
    [key: string]: any;
  };
}

// Type for creating a new machine
export type CreateMachineInput = {
  machineTypeId: string;
  category: MachineBlock;
  serialNumber: string;
  loungeId: string;
  status?: MachineStatus;
};

// Type for updating a machine
export type UpdateMachineInput = Partial<Omit<CreateMachineInput, "loungeId">>;

// Standard include object for Prisma queries
export const machineInclude = {
  machineType: true,
  lounge: true,
} as const;
