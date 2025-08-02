// Prisma RateByPlayers model interface for service layer

export interface IRateByPlayers {
  id: string;
  noOfPlayers: number;
  price: number;
  machineTypeId: string;
}
