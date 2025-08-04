// Prisma MachineType model interface for service layer
import { IMachine } from "./machine.model";
import { IRateByPlayers } from "./rateByPlayers.model";

export interface IMachineType {
  id: string;
  name: string;
  specifications?: string;
  description?: string;
  imageUrl?: string;
  loungeId: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations (optional)
  machines?: IMachine[];
  lounge?: {
    id: string;
    name: string;
    [key: string]: any;
  };
  rateByPlayers?: IRateByPlayers[];
}

// Type for creating a new machine type
export type CreateMachineTypeInput = {
  name: string;
  specifications?: string;
  description?: string;
  imageUrl?: string;
  loungeId: string;
};

// Type for updating a machine type
export type UpdateMachineTypeInput = Partial<
  Omit<CreateMachineTypeInput, "loungeId">
>;

// Standard include object for Prisma queries
export const machineTypeInclude = {
  machines: true,
  lounge: true,
  rateByPlayers: true,
} as const;
