# Machine Module - Production Grade Modular Models

## Overview

Successfully created a complete **production-grade modular structure** for the machine management system with three separate, comprehensive model files that follow the same patterns as your permission and role models.

## File Structure

### 📁 **Modular Model Files**

- **`machine.model.ts`** - Core machine model with enums, validation, and utilities
- **`machineType.model.ts`** - Machine type model with specifications and pricing
- **`rateByPlayers.model.ts`** - Player-based pricing model with analytics

## Key Improvements Made

### 🎯 **Full Prisma Integration**

- **Generated Types**: All models now use Prisma-generated types
- **Type Safety**: Direct integration with database schema
- **Enum Support**: Proper TypeScript enums from Prisma schema
- **Relation Support**: Full support for related data

### 📝 **machine.model.ts Features**

#### Core Interfaces

```typescript
interface MachineWithRelations extends Machine
interface CreateMachineInput
interface UpdateMachineInput
interface MachineFilters
interface MachinePaginationOptions
interface MachineResponse
interface MachineStats
```

#### Key Utilities

- **Validation**: Serial number format validation with regex
- **Transform**: API response transformation with proper typing
- **Grouping**: Category and status-based grouping
- **Analytics**: Utilization rate calculation
- **Search**: Multi-field search query builder
- **Display**: User-friendly category and status names

#### Gaming-Specific Features

- **Categories**: Console, PC_L, PC_R with display names
- **Serial Generation**: Automatic serial number generation (`CON-001`, `PCL-002`)
- **Availability**: Online/offline status tracking
- **Utilization**: Calculate usage rates across machines

### 🏭 **machineType.model.ts Features**

#### Core Interfaces

```typescript
interface MachineTypeWithRelations extends MachineType
interface CreateMachineTypeInput
interface UpdateMachineTypeInput
interface MachineTypeFilters
interface MachineTypePaginationOptions
interface MachineTypeResponse
interface MachineTypeStats
interface RateByPlayersInput
interface UpdateRateByPlayersInput
```

#### Key Utilities

- **Validation**: Name, description, specifications, and URL validation
- **Transform**: Rich API responses with machine counts and pricing
- **Analysis**: Popular types, average machines per type
- **Pricing**: Price range calculations with min/max pricing
- **Search**: Multi-field search across name, description, specs
- **Grouping**: Lounge-based organization

#### Machine Type Features

- **Specifications**: Technical details storage and validation
- **Images**: URL validation for machine type images
- **Analytics**: Machine count per type, popularity rankings
- **Pricing Integration**: Connected to RateByPlayers for pricing info

### 💰 **Rate Management Features**

#### Core Interfaces

```typescript
interface RateByPlayersInput {
  noOfPlayers: number;
  price: number;
  machineTypeId: string;
}

interface UpdateRateByPlayersInput {
  noOfPlayers?: number;
  price?: number;
}
```

#### Rate Management Endpoints

```typescript
// Add new rate to machine type
POST /:id/rates
{
  "noOfPlayers": number,
  "price": number
}

// Update existing rate
PUT /:machineTypeId/rates/:rateId
{
  "noOfPlayers?: number,
  "price"?: number
}

// Delete rate
DELETE /:machineTypeId/rates/:rateId
```

#### Key Utilities

- **Validation**: Player count (1-8) and price validation
- **Transform**: Price per player calculations
- **Analytics**: Price ranges, averages, medians
- **Comparison**: Find cheapest, most expensive, best value rates
- **Filtering**: Price and player count range filtering
- **Statistics**: Player count distribution analysis

#### Pricing Features

- **Per Player Pricing**: Automatic price per player calculation
- **Price Analysis**: Min, max, average, median price calculations
- **Player Distribution**: Track most common player counts
- **Value Analysis**: Find best value rates (lowest price per player)
- **Range Filtering**: Filter by price and player count ranges

## Advanced Features

### 🔍 **Search & Filtering**

```typescript
// Machine search across multiple fields
createMachineSearchQuery(search: string)

// Machine type search with specifications
createMachineTypeSearchQuery(search: string)

// Rate filtering by price and player ranges
createRateByPlayersSearchQuery(filters: RateByPlayersFilters)
```

### 📊 **Analytics & Statistics**

```typescript
// Machine utilization
calculateUtilizationRate(machines: Machine[]): number

// Machine type popularity
getMostPopularMachineTypes(types: MachineTypeWithRelations[])

// Pricing analytics
getAveragePricePerPlayer(rates: RateByPlayers[]): number
getPriceRange(rates: RateByPlayers[]): { min: number; max: number }
```

### 🏷️ **Validation Constants**

```typescript
// Machine validation
MachineValidation = {
  SERIAL_NUMBER_MIN_LENGTH: 3,
  SERIAL_NUMBER_MAX_LENGTH: 50,
  SERIAL_NUMBER_PATTERN: /^[A-Z0-9-_]+$/,
};

// Machine type validation
MachineTypeValidation = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  SPECIFICATIONS_MAX_LENGTH: 1000,
};

// Rate validation
RateByPlayersValidation = {
  MIN_PLAYERS: 1,
  MAX_PLAYERS: 8,
  MIN_PRICE: 0,
  MAX_PRICE: 10000,
};
```

## Database Integration

### 🗃️ **Optimized Prisma Includes**

```typescript
// Machine include
machineInclude = {
  machineType: { select: { id, name, specifications, description, imageUrl } },
  lounge: { select: { id, name } },
};

// Machine type include
machineTypeInclude = {
  machines: { select: { id, serialNumber, status, category } },
  lounge: { select: { id, name } },
  rateByPlayers: { select: { id, noOfPlayers, price } },
};

// Rate include
rateByPlayersInclude = {
  machineType: { select: { id, name, description } },
};
```

### 🔄 **Transform Functions**

- **Null Safety**: Proper handling of nullable Prisma fields
- **Type Conversion**: Convert null to undefined for API responses
- **Date Formatting**: ISO string conversion for timestamps
- **Calculated Fields**: Add computed fields like pricePerPlayer

## Usage Examples

### Creating Machines

```typescript
const newMachine: CreateMachineInput = {
  machineTypeId: "type-123",
  category: MachineCategory.Console,
  serialNumber: generateSerialNumber(MachineCategory.Console, 1), // "CON-001"
  loungeId: "lounge-456",
  status: MachineStatus.online,
};
```

### Analytics

```typescript
const machines = await getAllMachines();
const utilizationRate = calculateUtilizationRate(machines); // 75%
const availableMachines = getAvailableMachines(machines);
const categoryBreakdown = countMachinesByCategory(machines);
```

### Pricing Analysis

```typescript
const rates = await getRatesByMachineType("type-123");
const priceRange = getPriceRange(rates); // { min: 500, max: 2000 }
const bestValue = findBestValueRate(rates); // lowest price per player
const avgPricePerPlayer = getAveragePricePerPlayer(rates);
```

## Benefits of Modular Structure

### 🎯 **Separation of Concerns**

- **Machine Model**: Core machine management and availability
- **Machine Type Model**: Hardware specifications and type management
- **Rate Model**: Pricing and player-based rate management

### 🚀 **Developer Experience**

- **IntelliSense**: Full TypeScript autocomplete for all models
- **Type Safety**: Compile-time validation of data structures
- **Consistent APIs**: Same patterns across all models
- **Rich Utilities**: Comprehensive helper functions for common operations

### 📈 **Scalability**

- **Modular Design**: Easy to extend each model independently
- **Performance**: Optimized database queries with selective includes
- **Analytics Ready**: Built-in statistics and reporting capabilities
- **Search Optimized**: Flexible search and filtering across all models

## Production Features

### ✅ **Validation**

- Runtime validation for all inputs
- Pattern validation for serial numbers and URLs
- Range validation for prices and player counts
- Type guards for enum validation

### 🔄 **Backward Compatibility**

- Legacy type aliases preserved
- Gradual migration support
- Consistent interface naming

### 📊 **Analytics Ready**

- Built-in statistics interfaces
- Grouping and aggregation functions
- Price analysis and comparison tools
- Utilization and popularity metrics

## API Integration

### 🛣️ **Route Structure**

#### Machine Routes (`/machines`)

```typescript
GET    /                - Get all machines with filtering and pagination
GET    /:id            - Get machine by ID
POST   /               - Create new machine
PUT    /:id           - Update machine
DELETE /:id           - Delete machine
GET    /stats         - Get machine statistics
```

#### Machine Type Routes (`/machine-types`)

```typescript
GET    /                                    - Get all machine types
GET    /:id                                - Get machine type by ID
POST   /                                   - Create machine type
PUT    /:id                                - Update machine type
DELETE /:id                                - Delete machine type
GET    /stats                              - Get statistics
POST   /:id/rates                          - Add rate to machine type
PUT    /:machineTypeId/rates/:rateId       - Update rate
```

#### Rate Routes (`/rates`)

```typescript
GET    /               - Get all rates with filtering
GET    /:id           - Get rate by ID
POST   /              - Create new rate
PUT    /:id           - Update rate
DELETE /:id           - Delete rate
GET    /stats         - Get rate statistics
```

## Implementation Status

1. ✅ **Models Created**: All three production-grade models completed
2. ✅ **Prisma Integration**: Generated types and proper integration
3. ✅ **Validation Added**: Comprehensive validation for all inputs
4. ✅ **Analytics Included**: Rich analytics and statistics support
5. ✅ **Create Services**: Built service layer with proper separation of concerns
6. ✅ **Build Controllers**: Created modular controllers for all components
7. ✅ **Route Setup**: Implemented complete REST API endpoints
8. 🔄 **Add Tests**: Unit tests for all utility functions
9. 🔄 **API Documentation**: Document all endpoints and interfaces

Your machine module now has **enterprise-grade modular models** with comprehensive TypeScript support, validation, analytics, and follows all the best practices from your permission and role models!
