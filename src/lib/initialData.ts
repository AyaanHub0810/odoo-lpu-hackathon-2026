import { Warehouse, Location, Product, Operation, StockMove, User } from '@/types/inventory';

export const INITIAL_USER: User = {
  id: 'usr-admin-01',
  loginId: 'admin123',
  email: 'admin@stocksense.io',
  fullName: 'Alex Morgan',
  role: 'Inventory Manager',
  avatar: 'A',
  createdAt: '2026-01-01T00:00:00Z',
};

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-main-01',
    name: 'Main Central Warehouse',
    shortCode: 'WH',
    address: 'Plot 42, Industrial Logistic Park, Sector 18',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'wh-north-02',
    name: 'North Distribution Hub',
    shortCode: 'NDH',
    address: 'Warehouse Complex 7, Ring Road North',
    isActive: true,
    createdAt: '2026-02-15T00:00:00Z',
  },
];

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'loc-wh-stock1',
    warehouseId: 'wh-main-01',
    warehouseCode: 'WH',
    name: 'Stock Area 1 (Racks A-C)',
    shortCode: 'WH/Stock1',
    type: 'internal',
    capacity: 200,
    currentFill: 95,
    zone: 'Zone A - General',
  },
  {
    id: 'loc-wh-stock2',
    warehouseId: 'wh-main-01',
    warehouseCode: 'WH',
    name: 'Stock Area 2 (Racks D-F)',
    shortCode: 'WH/Stock2',
    type: 'internal',
    capacity: 150,
    currentFill: 50,
    zone: 'Zone B - Heavy Goods',
  },
  {
    id: 'loc-wh-production',
    warehouseId: 'wh-main-01',
    warehouseCode: 'WH',
    name: 'Production Rack / Floor',
    shortCode: 'WH/Production',
    type: 'internal',
    capacity: 100,
    currentFill: 40,
    zone: 'Zone C - Assembly',
  },
  {
    id: 'loc-vendor-generic',
    warehouseId: 'wh-main-01',
    warehouseCode: 'WH',
    name: 'Vendor / Partner Location',
    shortCode: 'vendor',
    type: 'vendor',
  },
  {
    id: 'loc-customer-generic',
    warehouseId: 'wh-main-01',
    warehouseCode: 'WH',
    name: 'Customer Delivery Point',
    shortCode: 'customer',
    type: 'customer',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod-desk-01",
    "sku": "DESK001",
    "name": "Ergonomic Office Desk",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 3000,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 80,
    "onHand": 50,
    "freeToUse": 44,
    "locationStocks": {
      "WH/Stock1": 30,
      "WH/Stock2": 20
    },
    "description": "High durability height-adjustable wooden office desk",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-02",
    "sku": "TAB001",
    "name": "Conference Table 10-Seater",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 7500,
    "minReorderThreshold": 5,
    "targetMaxQuantity": 20,
    "onHand": 12,
    "freeToUse": 12,
    "locationStocks": {
      "WH/Stock1": 7,
      "WH/Stock2": 5
    },
    "description": "10-seater oak conference meeting table with cable raceway",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-03",
    "sku": "CHAIR001",
    "name": "Executive Mesh Chair",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 2200,
    "minReorderThreshold": 12,
    "targetMaxQuantity": 50,
    "onHand": 8,
    "freeToUse": 8,
    "locationStocks": {
      "WH/Stock1": 5,
      "WH/Stock2": 3
    },
    "description": "Breathable ergonomic lumbar support office chair",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-04",
    "sku": "RACK001",
    "name": "Heavy Duty Pallet Racking Upright",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 4500,
    "minReorderThreshold": 10,
    "targetMaxQuantity": 60,
    "onHand": 35,
    "freeToUse": 35,
    "locationStocks": {
      "WH/Stock1": 21,
      "WH/Stock2": 14
    },
    "description": "Cold-rolled structural steel teardrop upright frame 4m",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-05",
    "sku": "BEAM001",
    "name": "Box Beam Connector 2.7m",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 1800,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 120,
    "onHand": 84,
    "freeToUse": 84,
    "locationStocks": {
      "WH/Stock1": 50,
      "WH/Stock2": 34
    },
    "description": "High-strength load beam with 3-pin safety lock",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-06",
    "sku": "CAB001",
    "name": "Steel Filing Storage Cabinet",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 3200,
    "minReorderThreshold": 8,
    "targetMaxQuantity": 40,
    "onHand": 24,
    "freeToUse": 24,
    "locationStocks": {
      "WH/Stock1": 14,
      "WH/Stock2": 10
    },
    "description": "4-drawer anti-tilt fire resistant archival cabinet",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-07",
    "sku": "BENCH001",
    "name": "Modular Industrial Workbench",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 5200,
    "minReorderThreshold": 6,
    "targetMaxQuantity": 30,
    "onHand": 5,
    "freeToUse": 5,
    "locationStocks": {
      "WH/Stock1": 3,
      "WH/Stock2": 2
    },
    "description": "Electrostatic discharge (ESD) safe technician bench",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-08",
    "sku": "LOCK001",
    "name": "Staff Locker 6-Door Unit",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 4100,
    "minReorderThreshold": 5,
    "targetMaxQuantity": 25,
    "onHand": 18,
    "freeToUse": 18,
    "locationStocks": {
      "WH/Stock1": 11,
      "WH/Stock2": 7
    },
    "description": "Ventilated steel locker unit with digital keypad locks",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-09",
    "sku": "SHELF001",
    "name": "Galvanized Boltless Shelving Unit",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 2600,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 75,
    "onHand": 42,
    "freeToUse": 42,
    "locationStocks": {
      "WH/Stock1": 25,
      "WH/Stock2": 17
    },
    "description": "5-tier 350kg per shelf industrial storage rack",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-10",
    "sku": "PART001",
    "name": "Acoustic Desk Partition Screen",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 950,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 100,
    "onHand": 65,
    "freeToUse": 65,
    "locationStocks": {
      "WH/Stock1": 39,
      "WH/Stock2": 26
    },
    "description": "Sound-dampening felt acoustic privacy separator",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-11",
    "sku": "CART001",
    "name": "Heavy Duty 3-Tier Utility Trolley",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 1650,
    "minReorderThreshold": 10,
    "targetMaxQuantity": 50,
    "onHand": 29,
    "freeToUse": 29,
    "locationStocks": {
      "WH/Stock1": 17,
      "WH/Stock2": 12
    },
    "description": "Powder-coated picking trolley with 360-degree castors",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-12",
    "sku": "STOOL001",
    "name": "Drafting High Stool with Footring",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 1400,
    "minReorderThreshold": 8,
    "targetMaxQuantity": 40,
    "onHand": 19,
    "freeToUse": 19,
    "locationStocks": {
      "WH/Stock1": 11,
      "WH/Stock2": 8
    },
    "description": "Polyurethane swivel stool with footrest ring",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-13",
    "sku": "CADDY001",
    "name": "Mobile Under-Desk Pedestal",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 1950,
    "minReorderThreshold": 12,
    "targetMaxQuantity": 60,
    "onHand": 38,
    "freeToUse": 38,
    "locationStocks": {
      "WH/Stock1": 23,
      "WH/Stock2": 15
    },
    "description": "Lockable 3-drawer mobile metal pedestal on wheels",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-14",
    "sku": "WHITE001",
    "name": "Magnetic Dry-Erase Mobile Board",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 2800,
    "minReorderThreshold": 6,
    "targetMaxQuantity": 30,
    "onHand": 14,
    "freeToUse": 14,
    "locationStocks": {
      "WH/Stock1": 8,
      "WH/Stock2": 6
    },
    "description": "Double-sided 180x120cm mobile whiteboard on wheels",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-furn-15",
    "sku": "MAT001",
    "name": "Anti-Fatigue Industrial Floor Mat",
    "category": "Furniture",
    "uom": "Units",
    "perUnitCost": 850,
    "minReorderThreshold": 25,
    "targetMaxQuantity": 100,
    "onHand": 72,
    "freeToUse": 72,
    "locationStocks": {
      "WH/Stock1": 43,
      "WH/Stock2": 29
    },
    "description": "Cushioned ergonomic rubber mat for assembly operators",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-steel-03",
    "sku": "STEEL001",
    "name": "Reinforced Steel Rods (10mm)",
    "category": "Raw Materials",
    "uom": "kg",
    "perUnitCost": 85,
    "minReorderThreshold": 30,
    "targetMaxQuantity": 200,
    "onHand": 100,
    "freeToUse": 100,
    "locationStocks": {
      "WH/Stock1": 60,
      "WH/Stock2": 40
    },
    "description": "High tensile reinforced structural steel rods",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-17",
    "sku": "STEEL002",
    "name": "Stainless Steel Sheet 304 (2mm)",
    "category": "Raw Materials",
    "uom": "kg",
    "perUnitCost": 240,
    "minReorderThreshold": 50,
    "targetMaxQuantity": 300,
    "onHand": 180,
    "freeToUse": 180,
    "locationStocks": {
      "WH/Stock1": 108,
      "WH/Stock2": 72
    },
    "description": "Food-grade cold rolled stainless steel panel",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-18",
    "sku": "ALUM001",
    "name": "Aluminum Extrusion Profile 40x40",
    "category": "Raw Materials",
    "uom": "meters",
    "perUnitCost": 120,
    "minReorderThreshold": 60,
    "targetMaxQuantity": 400,
    "onHand": 240,
    "freeToUse": 240,
    "locationStocks": {
      "WH/Stock1": 144,
      "WH/Stock2": 96
    },
    "description": "T-slot modular aluminum structural profile",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-19",
    "sku": "ALUM002",
    "name": "Aluminum Plate 6061-T6 (5mm)",
    "category": "Raw Materials",
    "uom": "kg",
    "perUnitCost": 310,
    "minReorderThreshold": 40,
    "targetMaxQuantity": 250,
    "onHand": 95,
    "freeToUse": 95,
    "locationStocks": {
      "WH/Stock1": 57,
      "WH/Stock2": 38
    },
    "description": "Aerospace & precision tooling grade aluminum plate",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-20",
    "sku": "COPP001",
    "name": "Pure Copper Electrical Busbar",
    "category": "Raw Materials",
    "uom": "kg",
    "perUnitCost": 850,
    "minReorderThreshold": 25,
    "targetMaxQuantity": 150,
    "onHand": 18,
    "freeToUse": 18,
    "locationStocks": {
      "WH/Stock1": 11,
      "WH/Stock2": 7
    },
    "description": "Electrolytic copper conductive bar 99.9% purity",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-21",
    "sku": "BRASS001",
    "name": "Hexagonal Brass Rod 25mm",
    "category": "Raw Materials",
    "uom": "kg",
    "perUnitCost": 480,
    "minReorderThreshold": 30,
    "targetMaxQuantity": 180,
    "onHand": 110,
    "freeToUse": 110,
    "locationStocks": {
      "WH/Stock1": 66,
      "WH/Stock2": 44
    },
    "description": "Machining grade free-cutting brass bar stock",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-22",
    "sku": "PLAST001",
    "name": "Polycarbonate Clear Sheet (4mm)",
    "category": "Raw Materials",
    "uom": "meters",
    "perUnitCost": 450,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 100,
    "onHand": 55,
    "freeToUse": 55,
    "locationStocks": {
      "WH/Stock1": 33,
      "WH/Stock2": 22
    },
    "description": "Impact resistant transparent safety machine guard panel",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-23",
    "sku": "ACRY001",
    "name": "Cast Acrylic Sheet (3mm)",
    "category": "Raw Materials",
    "uom": "meters",
    "perUnitCost": 280,
    "minReorderThreshold": 30,
    "targetMaxQuantity": 150,
    "onHand": 88,
    "freeToUse": 88,
    "locationStocks": {
      "WH/Stock1": 53,
      "WH/Stock2": 35
    },
    "description": "Laser-cuttable optical grade transparent acrylic",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-24",
    "sku": "RUBB001",
    "name": "EPDM Industrial Rubber Gasket Sheet",
    "category": "Raw Materials",
    "uom": "meters",
    "perUnitCost": 190,
    "minReorderThreshold": 40,
    "targetMaxQuantity": 200,
    "onHand": 130,
    "freeToUse": 130,
    "locationStocks": {
      "WH/Stock1": 78,
      "WH/Stock2": 52
    },
    "description": "Weather & chemical resistant sealing rubber roll",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-25",
    "sku": "FIBER001",
    "name": "Carbon Fiber Twill Sheet (2mm)",
    "category": "Raw Materials",
    "uom": "meters",
    "perUnitCost": 1800,
    "minReorderThreshold": 10,
    "targetMaxQuantity": 50,
    "onHand": 7,
    "freeToUse": 7,
    "locationStocks": {
      "WH/Stock1": 4,
      "WH/Stock2": 3
    },
    "description": "Ultra-light high modulus composite plate",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-26",
    "sku": "WOOD001",
    "name": "Marine Plywood Sheet 18mm",
    "category": "Raw Materials",
    "uom": "Units",
    "perUnitCost": 1200,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 80,
    "onHand": 45,
    "freeToUse": 45,
    "locationStocks": {
      "WH/Stock1": 27,
      "WH/Stock2": 18
    },
    "description": "Boiling water resistant bonded timber core sheet",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-27",
    "sku": "RESIN001",
    "name": "Epoxy Laminating Resin Compound",
    "category": "Raw Materials",
    "uom": "liters",
    "perUnitCost": 650,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 120,
    "onHand": 64,
    "freeToUse": 64,
    "locationStocks": {
      "WH/Stock1": 38,
      "WH/Stock2": 26
    },
    "description": "Two-part industrial infusion grade epoxy resin",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-28",
    "sku": "STEEL003",
    "name": "Mild Steel Square Tubing 50x50",
    "category": "Raw Materials",
    "uom": "meters",
    "perUnitCost": 95,
    "minReorderThreshold": 50,
    "targetMaxQuantity": 300,
    "onHand": 160,
    "freeToUse": 160,
    "locationStocks": {
      "WH/Stock1": 96,
      "WH/Stock2": 64
    },
    "description": "Seamless hollow section structural welded pipe",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-29",
    "sku": "NYLON001",
    "name": "Nylon 6 Natural Round Rod 40mm",
    "category": "Raw Materials",
    "uom": "kg",
    "perUnitCost": 380,
    "minReorderThreshold": 25,
    "targetMaxQuantity": 140,
    "onHand": 80,
    "freeToUse": 80,
    "locationStocks": {
      "WH/Stock1": 48,
      "WH/Stock2": 32
    },
    "description": "Self-lubricating wear resistant engineering plastic",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-raw-30",
    "sku": "BRONZ001",
    "name": "Phosphor Bronze Bushing Hollow Bar",
    "category": "Raw Materials",
    "uom": "kg",
    "perUnitCost": 920,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 80,
    "onHand": 32,
    "freeToUse": 32,
    "locationStocks": {
      "WH/Stock1": 19,
      "WH/Stock2": 13
    },
    "description": "Heavy load low friction bearing bronze alloy",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-31",
    "sku": "SNSR001",
    "name": "Photoelectric Proximity Sensor",
    "category": "Electronics",
    "uom": "Units",
    "perUnitCost": 850,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 100,
    "onHand": 62,
    "freeToUse": 62,
    "locationStocks": {
      "WH/Stock1": 37,
      "WH/Stock2": 25
    },
    "description": "Retro-reflective infrared industrial counting sensor",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-32",
    "sku": "SNSR002",
    "name": "Ultrasonic Distance Sensor IP67",
    "category": "Electronics",
    "uom": "Units",
    "perUnitCost": 1450,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 80,
    "onHand": 11,
    "freeToUse": 11,
    "locationStocks": {
      "WH/Stock1": 7,
      "WH/Stock2": 4
    },
    "description": "Wide-angle obstacle detection sensor for AGV fleet",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-33",
    "sku": "MCU001",
    "name": "Industrial IoT Gateway Controller",
    "category": "Electronics",
    "uom": "Units",
    "perUnitCost": 4200,
    "minReorderThreshold": 8,
    "targetMaxQuantity": 40,
    "onHand": 22,
    "freeToUse": 22,
    "locationStocks": {
      "WH/Stock1": 13,
      "WH/Stock2": 9
    },
    "description": "Quad-core edge computing PLC telemetry node with CANBus",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-34",
    "sku": "MOT001",
    "name": "NEMA 34 High-Torque Stepper Motor",
    "category": "Electronics",
    "uom": "Units",
    "perUnitCost": 2600,
    "minReorderThreshold": 10,
    "targetMaxQuantity": 60,
    "onHand": 36,
    "freeToUse": 36,
    "locationStocks": {
      "WH/Stock1": 22,
      "WH/Stock2": 14
    },
    "description": "Closed-loop 8.5Nm precision positioning actuator",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-35",
    "sku": "MOT002",
    "name": "Brushless DC Drive Motor 48V",
    "category": "Electronics",
    "uom": "Units",
    "perUnitCost": 5800,
    "minReorderThreshold": 6,
    "targetMaxQuantity": 30,
    "onHand": 15,
    "freeToUse": 15,
    "locationStocks": {
      "WH/Stock1": 9,
      "WH/Stock2": 6
    },
    "description": "High efficiency motor for warehouse conveyor & sorter",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-36",
    "sku": "PSU001",
    "name": "DIN Rail Power Supply 24V 10A",
    "category": "Electronics",
    "uom": "Units",
    "perUnitCost": 1850,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 70,
    "onHand": 48,
    "freeToUse": 48,
    "locationStocks": {
      "WH/Stock1": 29,
      "WH/Stock2": 19
    },
    "description": "Industrial fanless metal chassis switching power unit",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-37",
    "sku": "RELAY001",
    "name": "8-Channel Solid State Relay Module",
    "category": "Electronics",
    "uom": "Units",
    "perUnitCost": 720,
    "minReorderThreshold": 25,
    "targetMaxQuantity": 120,
    "onHand": 78,
    "freeToUse": 78,
    "locationStocks": {
      "WH/Stock1": 47,
      "WH/Stock2": 31
    },
    "description": "Opto-isolated 240VAC 5A switching relay board",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-38",
    "sku": "ENC001",
    "name": "Optical Rotary Encoder 1024 PPR",
    "category": "Electronics",
    "uom": "Units",
    "perUnitCost": 1650,
    "minReorderThreshold": 12,
    "targetMaxQuantity": 60,
    "onHand": 34,
    "freeToUse": 34,
    "locationStocks": {
      "WH/Stock1": 20,
      "WH/Stock2": 14
    },
    "description": "Incremental quadrature feedback shaft encoder",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-39",
    "sku": "RFID001",
    "name": "UHF Long-Range RFID Reader Antenna",
    "category": "Electronics",
    "uom": "Units",
    "perUnitCost": 6500,
    "minReorderThreshold": 4,
    "targetMaxQuantity": 20,
    "onHand": 3,
    "freeToUse": 3,
    "locationStocks": {
      "WH/Stock1": 2,
      "WH/Stock2": 1
    },
    "description": "865-868MHz gate portal pallet identification receiver",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-40",
    "sku": "RFID002",
    "name": "Gen2 Passive RFID Pallet Tags",
    "category": "Electronics",
    "uom": "boxes",
    "perUnitCost": 1200,
    "minReorderThreshold": 10,
    "targetMaxQuantity": 50,
    "onHand": 28,
    "freeToUse": 28,
    "locationStocks": {
      "WH/Stock1": 17,
      "WH/Stock2": 11
    },
    "description": "Box of 500 adhesive tamper-evident logistics tags",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-41",
    "sku": "BAT001",
    "name": "LiFePO4 Battery Pack 48V 50Ah",
    "category": "Electronics",
    "uom": "Units",
    "perUnitCost": 18500,
    "minReorderThreshold": 4,
    "targetMaxQuantity": 16,
    "onHand": 9,
    "freeToUse": 9,
    "locationStocks": {
      "WH/Stock1": 5,
      "WH/Stock2": 4
    },
    "description": "Quick-swap deep cycle battery for autonomous AGV units",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-42",
    "sku": "WIRE001",
    "name": "Shielded Multi-Core Control Cable",
    "category": "Electronics",
    "uom": "meters",
    "perUnitCost": 45,
    "minReorderThreshold": 100,
    "targetMaxQuantity": 800,
    "onHand": 420,
    "freeToUse": 420,
    "locationStocks": {
      "WH/Stock1": 252,
      "WH/Stock2": 168
    },
    "description": "Flexible oil-resistant drag chain signal cabling",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-43",
    "sku": "DISP001",
    "name": "Industrial Touch HMI Panel 10-inch",
    "category": "Electronics",
    "uom": "Units",
    "perUnitCost": 8900,
    "minReorderThreshold": 5,
    "targetMaxQuantity": 25,
    "onHand": 12,
    "freeToUse": 12,
    "locationStocks": {
      "WH/Stock1": 7,
      "WH/Stock2": 5
    },
    "description": "IP65 waterproof operator interface touchscreen terminal",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-44",
    "sku": "FUSE001",
    "name": "Ceramic Fast-Blow Cartridge Fuses",
    "category": "Electronics",
    "uom": "boxes",
    "perUnitCost": 350,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 80,
    "onHand": 54,
    "freeToUse": 54,
    "locationStocks": {
      "WH/Stock1": 32,
      "WH/Stock2": 22
    },
    "description": "Box of 100 10A 500V high breaking capacity fuses",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-elec-45",
    "sku": "LED001",
    "name": "Stack Light Beacon 3-Tier RG-Buzzer",
    "category": "Electronics",
    "uom": "Units",
    "perUnitCost": 1100,
    "minReorderThreshold": 12,
    "targetMaxQuantity": 60,
    "onHand": 38,
    "freeToUse": 38,
    "locationStocks": {
      "WH/Stock1": 23,
      "WH/Stock2": 15
    },
    "description": "Andon status signaling tower with 85dB alarm tone",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-46",
    "sku": "BOLT001",
    "name": "Hex Flange Head Bolt M10x50 (Grade 8.8)",
    "category": "Fasteners & Hardware",
    "uom": "boxes",
    "perUnitCost": 650,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 120,
    "onHand": 75,
    "freeToUse": 75,
    "locationStocks": {
      "WH/Stock1": 45,
      "WH/Stock2": 30
    },
    "description": "Box of 200 zinc-plated structural machine bolts",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-47",
    "sku": "BOLT002",
    "name": "Stainless Steel Socket Cap Screw M6x25",
    "category": "Fasteners & Hardware",
    "uom": "boxes",
    "perUnitCost": 480,
    "minReorderThreshold": 25,
    "targetMaxQuantity": 150,
    "onHand": 112,
    "freeToUse": 112,
    "locationStocks": {
      "WH/Stock1": 67,
      "WH/Stock2": 45
    },
    "description": "Box of 500 A2-70 Allen head machine screws",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-48",
    "sku": "NUT001",
    "name": "Nylon Insert Lock Nut M10",
    "category": "Fasteners & Hardware",
    "uom": "boxes",
    "perUnitCost": 320,
    "minReorderThreshold": 30,
    "targetMaxQuantity": 180,
    "onHand": 140,
    "freeToUse": 140,
    "locationStocks": {
      "WH/Stock1": 84,
      "WH/Stock2": 56
    },
    "description": "Box of 500 vibration-resistant prevailing torque nuts",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-49",
    "sku": "WASH001",
    "name": "Flat Steel Heavy Washer M10",
    "category": "Fasteners & Hardware",
    "uom": "boxes",
    "perUnitCost": 220,
    "minReorderThreshold": 40,
    "targetMaxQuantity": 200,
    "onHand": 165,
    "freeToUse": 165,
    "locationStocks": {
      "WH/Stock1": 99,
      "WH/Stock2": 66
    },
    "description": "Box of 1000 DIN 125A galvanized load washers",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-50",
    "sku": "BEAR001",
    "name": "Deep Groove Ball Bearing 6205-2RS",
    "category": "Fasteners & Hardware",
    "uom": "Units",
    "perUnitCost": 240,
    "minReorderThreshold": 50,
    "targetMaxQuantity": 300,
    "onHand": 190,
    "freeToUse": 190,
    "locationStocks": {
      "WH/Stock1": 114,
      "WH/Stock2": 76
    },
    "description": "Rubber sealed high-speed radial roller bearing",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-51",
    "sku": "BEAR002",
    "name": "Pillow Block Mounted Bearing UCP206",
    "category": "Fasteners & Hardware",
    "uom": "Units",
    "perUnitCost": 580,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 100,
    "onHand": 48,
    "freeToUse": 48,
    "locationStocks": {
      "WH/Stock1": 29,
      "WH/Stock2": 19
    },
    "description": "Self-aligning cast iron housing flanged shaft mount",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-52",
    "sku": "VALV001",
    "name": "Pneumatic Solenoid Valve 5/2 Way",
    "category": "Fasteners & Hardware",
    "uom": "Units",
    "perUnitCost": 1350,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 80,
    "onHand": 14,
    "freeToUse": 14,
    "locationStocks": {
      "WH/Stock1": 8,
      "WH/Stock2": 6
    },
    "description": "Air manifold directional valve 24V DC pilot actuated",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-53",
    "sku": "CYL001",
    "name": "Compact Air Cylinder 32mm Bore",
    "category": "Fasteners & Hardware",
    "uom": "Units",
    "perUnitCost": 1750,
    "minReorderThreshold": 10,
    "targetMaxQuantity": 50,
    "onHand": 31,
    "freeToUse": 31,
    "locationStocks": {
      "WH/Stock1": 19,
      "WH/Stock2": 12
    },
    "description": "Double acting magnetic piston 50mm stroke actuator",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-54",
    "sku": "HOSE001",
    "name": "Polyurethane Air Hose 8mm OD",
    "category": "Fasteners & Hardware",
    "uom": "meters",
    "perUnitCost": 18,
    "minReorderThreshold": 100,
    "targetMaxQuantity": 600,
    "onHand": 380,
    "freeToUse": 380,
    "locationStocks": {
      "WH/Stock1": 228,
      "WH/Stock2": 152
    },
    "description": "Kink-resistant pneumatic spiral tubing reel",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-55",
    "sku": "FIT001",
    "name": "Push-in Pneumatic Quick Fittings M8",
    "category": "Fasteners & Hardware",
    "uom": "boxes",
    "perUnitCost": 420,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 100,
    "onHand": 68,
    "freeToUse": 68,
    "locationStocks": {
      "WH/Stock1": 41,
      "WH/Stock2": 27
    },
    "description": "Box of 100 nickel-plated brass straight connectors",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-56",
    "sku": "SEAL001",
    "name": "Hydraulic Piston Rod Oil Seal Kit",
    "category": "Fasteners & Hardware",
    "uom": "boxes",
    "perUnitCost": 890,
    "minReorderThreshold": 10,
    "targetMaxQuantity": 60,
    "onHand": 39,
    "freeToUse": 39,
    "locationStocks": {
      "WH/Stock1": 23,
      "WH/Stock2": 16
    },
    "description": "Pack of 20 nitrile rubber high-pressure rod seals",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-57",
    "sku": "RIVET001",
    "name": "Blind Structural Rivets 4.8x12mm",
    "category": "Fasteners & Hardware",
    "uom": "boxes",
    "perUnitCost": 380,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 80,
    "onHand": 52,
    "freeToUse": 52,
    "locationStocks": {
      "WH/Stock1": 31,
      "WH/Stock2": 21
    },
    "description": "Box of 1000 aluminum dome-head pop rivets",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-58",
    "sku": "CLAMP001",
    "name": "Heavy Duty Worm Gear Hose Clamps",
    "category": "Fasteners & Hardware",
    "uom": "boxes",
    "perUnitCost": 450,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 100,
    "onHand": 62,
    "freeToUse": 62,
    "locationStocks": {
      "WH/Stock1": 37,
      "WH/Stock2": 25
    },
    "description": "Box of 100 stainless steel 32-50mm duct clamps",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-59",
    "sku": "COUPL001",
    "name": "Flexible Jaw Shaft Coupling 25mm",
    "category": "Fasteners & Hardware",
    "uom": "Units",
    "perUnitCost": 680,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 70,
    "onHand": 44,
    "freeToUse": 44,
    "locationStocks": {
      "WH/Stock1": 26,
      "WH/Stock2": 18
    },
    "description": "Zero-backlash spider elastomer shaft connector",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-fast-60",
    "sku": "SPRING001",
    "name": "Precision Compression Springs Set",
    "category": "Fasteners & Hardware",
    "uom": "boxes",
    "perUnitCost": 520,
    "minReorderThreshold": 12,
    "targetMaxQuantity": 60,
    "onHand": 36,
    "freeToUse": 36,
    "locationStocks": {
      "WH/Stock1": 22,
      "WH/Stock2": 14
    },
    "description": "Box of 250 music-wire progressive recoil springs",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-61",
    "sku": "VEST001",
    "name": "High-Visibility Reflective Safety Vest",
    "category": "Safety & Facilities",
    "uom": "Units",
    "perUnitCost": 180,
    "minReorderThreshold": 50,
    "targetMaxQuantity": 250,
    "onHand": 160,
    "freeToUse": 160,
    "locationStocks": {
      "WH/Stock1": 96,
      "WH/Stock2": 64
    },
    "description": "Class 2 fluorescent neon vest with 3M reflective tape",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-62",
    "sku": "HELM001",
    "name": "Industrial Vented Hard Hat Safety Helmet",
    "category": "Safety & Facilities",
    "uom": "Units",
    "perUnitCost": 450,
    "minReorderThreshold": 25,
    "targetMaxQuantity": 120,
    "onHand": 85,
    "freeToUse": 85,
    "locationStocks": {
      "WH/Stock1": 51,
      "WH/Stock2": 34
    },
    "description": "ANSI Z89.1 certified ratchet suspension safety helmet",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-63",
    "sku": "GLOV001",
    "name": "Cut-Resistant Kevlar Work Gloves (Level 5)",
    "category": "Safety & Facilities",
    "uom": "boxes",
    "perUnitCost": 1250,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 80,
    "onHand": 54,
    "freeToUse": 54,
    "locationStocks": {
      "WH/Stock1": 32,
      "WH/Stock2": 22
    },
    "description": "Box of 50 pairs polyurethane palm coated gloves",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-64",
    "sku": "BOOT001",
    "name": "Steel Toe Cap Safety Work Boots",
    "category": "Safety & Facilities",
    "uom": "Units",
    "perUnitCost": 1850,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 80,
    "onHand": 18,
    "freeToUse": 18,
    "locationStocks": {
      "WH/Stock1": 11,
      "WH/Stock2": 7
    },
    "description": "Puncture-proof anti-static oil-resistant warehouse boots",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-65",
    "sku": "SPILL001",
    "name": "Chemical Spill Response Rapid Kit 50L",
    "category": "Safety & Facilities",
    "uom": "Units",
    "perUnitCost": 3800,
    "minReorderThreshold": 6,
    "targetMaxQuantity": 30,
    "onHand": 16,
    "freeToUse": 16,
    "locationStocks": {
      "WH/Stock1": 10,
      "WH/Stock2": 6
    },
    "description": "Complete containment kit with absorbent pads and boom",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-66",
    "sku": "FIRE001",
    "name": "CO2 Fire Extinguisher 5kg Commercial",
    "category": "Safety & Facilities",
    "uom": "Units",
    "perUnitCost": 2400,
    "minReorderThreshold": 10,
    "targetMaxQuantity": 40,
    "onHand": 28,
    "freeToUse": 28,
    "locationStocks": {
      "WH/Stock1": 17,
      "WH/Stock2": 11
    },
    "description": "Class B & electrical hazard fire extinguisher with horn",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-67",
    "sku": "EYEW001",
    "name": "Emergency Wall-Mount Eyewash Station",
    "category": "Safety & Facilities",
    "uom": "Units",
    "perUnitCost": 1600,
    "minReorderThreshold": 8,
    "targetMaxQuantity": 30,
    "onHand": 21,
    "freeToUse": 21,
    "locationStocks": {
      "WH/Stock1": 13,
      "WH/Stock2": 8
    },
    "description": "Dual-head gravity fed eyewash bottle preservation unit",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-68",
    "sku": "TAPE001",
    "name": "Heavy Duty Hazard Aisle Floor Tape (Yellow/Black)",
    "category": "Safety & Facilities",
    "uom": "boxes",
    "perUnitCost": 680,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 70,
    "onHand": 44,
    "freeToUse": 44,
    "locationStocks": {
      "WH/Stock1": 26,
      "WH/Stock2": 18
    },
    "description": "Box of 10 rolls 50mm x 33m vinyl floor marking tape",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-69",
    "sku": "FIRST001",
    "name": "OSHA Compliant Workplace First Aid Station",
    "category": "Safety & Facilities",
    "uom": "Units",
    "perUnitCost": 2900,
    "minReorderThreshold": 8,
    "targetMaxQuantity": 30,
    "onHand": 7,
    "freeToUse": 7,
    "locationStocks": {
      "WH/Stock1": 4,
      "WH/Stock2": 3
    },
    "description": "Metal lockable 150-person industrial trauma first aid box",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-70",
    "sku": "CONE001",
    "name": "Traffic Delineator Safety Cones 750mm",
    "category": "Safety & Facilities",
    "uom": "Units",
    "perUnitCost": 320,
    "minReorderThreshold": 30,
    "targetMaxQuantity": 150,
    "onHand": 92,
    "freeToUse": 92,
    "locationStocks": {
      "WH/Stock1": 55,
      "WH/Stock2": 37
    },
    "description": "Weighted heavy base PVC hazard marker with collar",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-71",
    "sku": "GLASS001",
    "name": "Anti-Fog UV Protective Safety Goggles",
    "category": "Safety & Facilities",
    "uom": "boxes",
    "perUnitCost": 750,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 100,
    "onHand": 68,
    "freeToUse": 68,
    "locationStocks": {
      "WH/Stock1": 41,
      "WH/Stock2": 27
    },
    "description": "Box of 20 polycarbonate scratch-resistant eye shields",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-72",
    "sku": "RESP001",
    "name": "N95 Particulate Respirator Dust Masks",
    "category": "Safety & Facilities",
    "uom": "boxes",
    "perUnitCost": 550,
    "minReorderThreshold": 25,
    "targetMaxQuantity": 120,
    "onHand": 82,
    "freeToUse": 82,
    "locationStocks": {
      "WH/Stock1": 49,
      "WH/Stock2": 33
    },
    "description": "Box of 50 valved filtration masks for particulate handling",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-73",
    "sku": "HARN001",
    "name": "Full-Body Fall Arrest Harness with Lanyard",
    "category": "Safety & Facilities",
    "uom": "Units",
    "perUnitCost": 2850,
    "minReorderThreshold": 10,
    "targetMaxQuantity": 40,
    "onHand": 26,
    "freeToUse": 26,
    "locationStocks": {
      "WH/Stock1": 16,
      "WH/Stock2": 10
    },
    "description": "Dual lanyard shock absorber high-altitude picker harness",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-74",
    "sku": "LOCKOUT001",
    "name": "Lockout Tagout (LOTO) Master Safety Kit",
    "category": "Safety & Facilities",
    "uom": "Units",
    "perUnitCost": 3400,
    "minReorderThreshold": 8,
    "targetMaxQuantity": 35,
    "onHand": 19,
    "freeToUse": 19,
    "locationStocks": {
      "WH/Stock1": 11,
      "WH/Stock2": 8
    },
    "description": "Padlocks, hasps, cable lockouts, and tags containment kit",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-safe-75",
    "sku": "MIRR001",
    "name": "Convex Aisle Safety Mirror 600mm",
    "category": "Safety & Facilities",
    "uom": "Units",
    "perUnitCost": 1450,
    "minReorderThreshold": 10,
    "targetMaxQuantity": 50,
    "onHand": 33,
    "freeToUse": 33,
    "locationStocks": {
      "WH/Stock1": 20,
      "WH/Stock2": 13
    },
    "description": "Wide-angle unbreakable acrylic blind spot mirror",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-76",
    "sku": "BOX001",
    "name": "Corrugated Shipping Cartons (40x30x30 cm)",
    "category": "Packaging & Logistics",
    "uom": "boxes",
    "perUnitCost": 850,
    "minReorderThreshold": 30,
    "targetMaxQuantity": 200,
    "onHand": 140,
    "freeToUse": 140,
    "locationStocks": {
      "WH/Stock1": 84,
      "WH/Stock2": 56
    },
    "description": "Bundle of 50 heavy-duty 3-ply kraft cardboard boxes",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-77",
    "sku": "BOX002",
    "name": "Heavy Duty Master Packing Box (60x40x40 cm)",
    "category": "Packaging & Logistics",
    "uom": "boxes",
    "perUnitCost": 1250,
    "minReorderThreshold": 25,
    "targetMaxQuantity": 150,
    "onHand": 95,
    "freeToUse": 95,
    "locationStocks": {
      "WH/Stock1": 57,
      "WH/Stock2": 38
    },
    "description": "Bundle of 25 double-wall 5-ply export shipping cartons",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-78",
    "sku": "BUBB001",
    "name": "Air Bubble Wrap Protective Roll 100m",
    "category": "Packaging & Logistics",
    "uom": "Units",
    "perUnitCost": 680,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 100,
    "onHand": 64,
    "freeToUse": 64,
    "locationStocks": {
      "WH/Stock1": 38,
      "WH/Stock2": 26
    },
    "description": "1.2m x 100m roll high-cushion anti-shock bubble wrap",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-79",
    "sku": "FILM001",
    "name": "Cast Stretch Film Pallet Wrap (23 Micron)",
    "category": "Packaging & Logistics",
    "uom": "boxes",
    "perUnitCost": 1450,
    "minReorderThreshold": 25,
    "targetMaxQuantity": 120,
    "onHand": 78,
    "freeToUse": 78,
    "locationStocks": {
      "WH/Stock1": 47,
      "WH/Stock2": 31
    },
    "description": "Box of 4 rolls 500mm x 300m heavy cling stretch wrap",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-80",
    "sku": "TAPE002",
    "name": "Heavy Duty Acrylic Packaging Tape 48mm",
    "category": "Packaging & Logistics",
    "uom": "boxes",
    "perUnitCost": 720,
    "minReorderThreshold": 30,
    "targetMaxQuantity": 150,
    "onHand": 105,
    "freeToUse": 105,
    "locationStocks": {
      "WH/Stock1": 63,
      "WH/Stock2": 42
    },
    "description": "Box of 36 rolls 65m high adhesion carton sealing tape",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-81",
    "sku": "LABEL001",
    "name": "Direct Thermal Barcode Shipping Labels 4x6",
    "category": "Packaging & Logistics",
    "uom": "boxes",
    "perUnitCost": 950,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 100,
    "onHand": 15,
    "freeToUse": 15,
    "locationStocks": {
      "WH/Stock1": 9,
      "WH/Stock2": 6
    },
    "description": "Box of 4 rolls (1000 labels/roll) perforation ready",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-82",
    "sku": "STRAP001",
    "name": "Polypropylene (PP) Pallet Strapping Band",
    "category": "Packaging & Logistics",
    "uom": "Units",
    "perUnitCost": 1100,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 70,
    "onHand": 42,
    "freeToUse": 42,
    "locationStocks": {
      "WH/Stock1": 25,
      "WH/Stock2": 17
    },
    "description": "12mm x 2000m roll heavy tension strapping coil",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-83",
    "sku": "SEAL002",
    "name": "Metal Strapping Seals Serrated Clips",
    "category": "Packaging & Logistics",
    "uom": "boxes",
    "perUnitCost": 480,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 100,
    "onHand": 68,
    "freeToUse": 68,
    "locationStocks": {
      "WH/Stock1": 41,
      "WH/Stock2": 27
    },
    "description": "Box of 1000 heavy duty snap-on steel strapping buckles",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-84",
    "sku": "CUSH001",
    "name": "Biodegradable Packing Peanuts Filling 150L",
    "category": "Packaging & Logistics",
    "uom": "boxes",
    "perUnitCost": 620,
    "minReorderThreshold": 15,
    "targetMaxQuantity": 60,
    "onHand": 38,
    "freeToUse": 38,
    "locationStocks": {
      "WH/Stock1": 23,
      "WH/Stock2": 15
    },
    "description": "Cornstarch dissolvable void filler sack for parcels",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-85",
    "sku": "CORNER001",
    "name": "Solid Board Edge Protectors 1m",
    "category": "Packaging & Logistics",
    "uom": "boxes",
    "perUnitCost": 780,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 100,
    "onHand": 72,
    "freeToUse": 72,
    "locationStocks": {
      "WH/Stock1": 43,
      "WH/Stock2": 29
    },
    "description": "Pack of 100 rigid recycled cardboard pallet corner guards",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-86",
    "sku": "PALLET001",
    "name": "Standard Euro Wooden Pallet (1200x800mm)",
    "category": "Packaging & Logistics",
    "uom": "Units",
    "perUnitCost": 850,
    "minReorderThreshold": 40,
    "targetMaxQuantity": 250,
    "onHand": 175,
    "freeToUse": 175,
    "locationStocks": {
      "WH/Stock1": 105,
      "WH/Stock2": 70
    },
    "description": "EPAL certified heat-treated ISPM-15 export wooden pallet",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-87",
    "sku": "PALLET002",
    "name": "Heavy Duty Plastic Export Pallet (Rackable)",
    "category": "Packaging & Logistics",
    "uom": "Units",
    "perUnitCost": 2200,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 100,
    "onHand": 58,
    "freeToUse": 58,
    "locationStocks": {
      "WH/Stock1": 35,
      "WH/Stock2": 23
    },
    "description": "Food-grade virgin HDPE 1.5-ton load rackable blue pallet",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-88",
    "sku": "DOC001",
    "name": "Packing List Enclosed Self-Adhesive Pouches",
    "category": "Packaging & Logistics",
    "uom": "boxes",
    "perUnitCost": 380,
    "minReorderThreshold": 25,
    "targetMaxQuantity": 120,
    "onHand": 84,
    "freeToUse": 84,
    "locationStocks": {
      "WH/Stock1": 50,
      "WH/Stock2": 34
    },
    "description": "Box of 1000 clear document protection pouches 15x20cm",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-89",
    "sku": "DESIC001",
    "name": "Silica Gel Moisture Absorber Desiccant 50g",
    "category": "Packaging & Logistics",
    "uom": "boxes",
    "perUnitCost": 490,
    "minReorderThreshold": 20,
    "targetMaxQuantity": 100,
    "onHand": 65,
    "freeToUse": 65,
    "locationStocks": {
      "WH/Stock1": 39,
      "WH/Stock2": 26
    },
    "description": "Box of 200 moisture indicator humidity control sachets",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-pack-90",
    "sku": "BAG001",
    "name": "Anti-Static ESD Shielding Bags 20x30cm",
    "category": "Packaging & Logistics",
    "uom": "boxes",
    "perUnitCost": 580,
    "minReorderThreshold": 25,
    "targetMaxQuantity": 120,
    "onHand": 76,
    "freeToUse": 76,
    "locationStocks": {
      "WH/Stock1": 46,
      "WH/Stock2": 30
    },
    "description": "Box of 250 zip-top Faraday cage electronic component bags",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-tool-91",
    "sku": "CALIP001",
    "name": "Digital Vernier Caliper 150mm (0.01mm)",
    "category": "Tools & Equipment",
    "uom": "Units",
    "perUnitCost": 1850,
    "minReorderThreshold": 8,
    "targetMaxQuantity": 40,
    "onHand": 24,
    "freeToUse": 24,
    "locationStocks": {
      "WH/Stock1": 14,
      "WH/Stock2": 10
    },
    "description": "Hardened stainless steel electronic micro-measurement gauge",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-tool-92",
    "sku": "SCAN001",
    "name": "Wireless 2D QR Barcode Scanner Terminal",
    "category": "Tools & Equipment",
    "uom": "Units",
    "perUnitCost": 4500,
    "minReorderThreshold": 10,
    "targetMaxQuantity": 50,
    "onHand": 32,
    "freeToUse": 32,
    "locationStocks": {
      "WH/Stock1": 19,
      "WH/Stock2": 13
    },
    "description": "Bluetooth 5.0 rugged warehouse inventory scanner with cradle",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-tool-93",
    "sku": "JACK001",
    "name": "Hydraulic Hand Pallet Jack 2.5 Ton",
    "category": "Tools & Equipment",
    "uom": "Units",
    "perUnitCost": 14500,
    "minReorderThreshold": 4,
    "targetMaxQuantity": 16,
    "onHand": 9,
    "freeToUse": 9,
    "locationStocks": {
      "WH/Stock1": 5,
      "WH/Stock2": 4
    },
    "description": "Dual tandem nylon wheel heavy duty manual pallet lifter",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-tool-94",
    "sku": "SCALE001",
    "name": "Heavy Duty Electronic Platform Scale 500kg",
    "category": "Tools & Equipment",
    "uom": "Units",
    "perUnitCost": 6800,
    "minReorderThreshold": 4,
    "targetMaxQuantity": 16,
    "onHand": 11,
    "freeToUse": 11,
    "locationStocks": {
      "WH/Stock1": 7,
      "WH/Stock2": 4
    },
    "description": "Chequer plate stainless steel weighbridge with LED tower",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-tool-95",
    "sku": "GUN001",
    "name": "Industrial Hot Air Heat Gun 2000W",
    "category": "Tools & Equipment",
    "uom": "Units",
    "perUnitCost": 1350,
    "minReorderThreshold": 10,
    "targetMaxQuantity": 50,
    "onHand": 28,
    "freeToUse": 28,
    "locationStocks": {
      "WH/Stock1": 17,
      "WH/Stock2": 11
    },
    "description": "Variable temperature heat gun for pallet shrink wrapping",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-tool-96",
    "sku": "STRAPTOOL001",
    "name": "Pneumatic Strapping Tensioner & Sealer Tool",
    "category": "Tools & Equipment",
    "uom": "Units",
    "perUnitCost": 8900,
    "minReorderThreshold": 3,
    "targetMaxQuantity": 12,
    "onHand": 2,
    "freeToUse": 2,
    "locationStocks": {
      "WH/Stock1": 1,
      "WH/Stock2": 1
    },
    "description": "Friction weld battery powered strapping tool for PP/PET",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-tool-97",
    "sku": "LASER001",
    "name": "Laser Distance Meter 80m Accuracy Tool",
    "category": "Tools & Equipment",
    "uom": "Units",
    "perUnitCost": 2200,
    "minReorderThreshold": 6,
    "targetMaxQuantity": 30,
    "onHand": 16,
    "freeToUse": 16,
    "locationStocks": {
      "WH/Stock1": 10,
      "WH/Stock2": 6
    },
    "description": "Bluetooth spatial measuring rangefinder with area calculator",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-tool-98",
    "sku": "TAPE003",
    "name": "Automatic Tape Dispenser Machine",
    "category": "Tools & Equipment",
    "uom": "Units",
    "perUnitCost": 5400,
    "minReorderThreshold": 4,
    "targetMaxQuantity": 20,
    "onHand": 12,
    "freeToUse": 12,
    "locationStocks": {
      "WH/Stock1": 7,
      "WH/Stock2": 5
    },
    "description": "Programmable electronic length cutting carton sealer",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-tool-99",
    "sku": "PRINTER001",
    "name": "Direct Thermal Industrial Label Printer",
    "category": "Tools & Equipment",
    "uom": "Units",
    "perUnitCost": 12800,
    "minReorderThreshold": 3,
    "targetMaxQuantity": 15,
    "onHand": 7,
    "freeToUse": 7,
    "locationStocks": {
      "WH/Stock1": 4,
      "WH/Stock2": 3
    },
    "description": "300 DPI high-speed continuous barcode label printer",
    "createdAt": "2026-01-10T00:00:00Z"
  },
  {
    "id": "prod-tool-100",
    "sku": "METER001",
    "name": "True-RMS Digital Multimeter Fluke Class",
    "category": "Tools & Equipment",
    "uom": "Units",
    "perUnitCost": 3600,
    "minReorderThreshold": 6,
    "targetMaxQuantity": 30,
    "onHand": 19,
    "freeToUse": 19,
    "locationStocks": {
      "WH/Stock1": 11,
      "WH/Stock2": 8
    },
    "description": "600V CAT IV rugged industrial electrical maintenance meter",
    "createdAt": "2026-01-10T00:00:00Z"
  }
];

export const INITIAL_OPERATIONS: Operation[] = [
  // 1. Receipt WH/IN/0001 (Scheduled today, Ready)
  {
    id: 'op-rcpt-0001',
    reference: 'WH/IN/0001',
    operationType: 'RECEIPT',
    warehouseId: 'wh-main-01',
    warehouseCode: 'WH',
    sourceLocationId: 'loc-vendor-generic',
    sourceLocationCode: 'vendor',
    destinationLocationId: 'loc-wh-stock1',
    destinationLocationCode: 'WH/Stock1',
    contactName: 'Azure Interior',
    scheduledDate: '2026-09-26', // Today
    responsible: 'Alex Morgan',
    status: 'Ready',
    items: [
      {
        id: 'item-rcpt-1',
        productId: 'prod-desk-01',
        sku: 'DESK001',
        name: 'Ergonomic Office Desk',
        uom: 'Units',
        quantityDemanded: 6,
        quantityDone: 6,
        unitPrice: 3000,
      },
    ],
    notes: 'Inbound PO from Azure Interior. Quality checked at gate.',
    createdAt: '2026-09-20T08:00:00Z',
  },
  // 2. Receipt WH/IN/0002 (Scheduled 2 days ago, LATE!)
  {
    id: 'op-rcpt-0002',
    reference: 'WH/IN/0002',
    operationType: 'RECEIPT',
    warehouseId: 'wh-main-01',
    warehouseCode: 'WH',
    sourceLocationId: 'loc-vendor-generic',
    sourceLocationCode: 'vendor',
    destinationLocationId: 'loc-wh-stock1',
    destinationLocationCode: 'WH/Stock1',
    contactName: 'Azure Interior',
    scheduledDate: '2026-09-24', // Past date -> Late
    responsible: 'Alex Morgan',
    status: 'Ready',
    items: [
      {
        id: 'item-rcpt-2',
        productId: 'prod-steel-03',
        sku: 'STEEL001',
        name: 'Steel Rods (10mm)',
        uom: 'kg',
        quantityDemanded: 50,
        quantityDone: 0,
        unitPrice: 85,
      },
    ],
    notes: 'Urgent material receipt for fabrication. Supplier delayed shipment.',
    createdAt: '2026-09-22T09:30:00Z',
  },
  // 3. Delivery WH/OUT/0001 (Scheduled today, Ready)
  {
    id: 'op-delv-0001',
    reference: 'WH/OUT/0001',
    operationType: 'DELIVERY',
    warehouseId: 'wh-main-01',
    warehouseCode: 'WH',
    sourceLocationId: 'loc-wh-stock1',
    sourceLocationCode: 'WH/Stock1',
    destinationLocationId: 'loc-customer-generic',
    destinationLocationCode: 'vendor', // per Excalidraw note
    contactName: 'Azure Interior',
    deliveryAddress: 'Suite 404, Commercial Tower, Business Bay',
    scheduledDate: '2026-09-26',
    responsible: 'Alex Morgan',
    status: 'Ready',
    items: [
      {
        id: 'item-delv-1',
        productId: 'prod-desk-01',
        sku: 'DESK001',
        name: 'Ergonomic Office Desk',
        uom: 'Units',
        quantityDemanded: 6,
        quantityDone: 6,
        unitPrice: 3000,
        isOutOfStock: false,
      },
    ],
    notes: 'Corporate office renovation order.',
    createdAt: '2026-09-25T10:00:00Z',
  },
  // 4. Delivery WH/OUT/0002 (Waiting, out of stock, Scheduled yesterday -> LATE + WAITING)
  {
    id: 'op-delv-0002',
    reference: 'WH/OUT/0002',
    operationType: 'DELIVERY',
    warehouseId: 'wh-main-01',
    warehouseCode: 'WH',
    sourceLocationId: 'loc-wh-stock1',
    sourceLocationCode: 'WH/Stock1',
    destinationLocationId: 'loc-customer-generic',
    destinationLocationCode: 'vendor',
    contactName: 'Azure Interior',
    deliveryAddress: 'Building 12, Tech Innovation Park',
    scheduledDate: '2026-09-25', // Past date -> Late
    responsible: 'Alex Morgan',
    status: 'Waiting', // Out of stock trigger!
    items: [
      {
        id: 'item-delv-2',
        productId: 'prod-desk-01',
        sku: 'DESK001',
        name: 'Ergonomic Office Desk',
        uom: 'Units',
        quantityDemanded: 60, // Demanding 60, but only 44 Free to use! Red line alert!
        quantityDone: 0,
        unitPrice: 3000,
        isOutOfStock: true,
      },
    ],
    notes: 'Waiting for vendor replenishment shipment before final dispatch.',
    createdAt: '2026-09-24T11:00:00Z',
  },
  // 5. Internal Transfer WH/INT/0001
  {
    id: 'op-int-0001',
    reference: 'WH/INT/0001',
    operationType: 'INTERNAL',
    warehouseId: 'wh-main-01',
    warehouseCode: 'WH',
    sourceLocationId: 'loc-wh-stock1',
    sourceLocationCode: 'WH/Stock1',
    destinationLocationId: 'loc-wh-production',
    destinationLocationCode: 'WH/Production',
    contactName: 'Internal Production Line',
    scheduledDate: '2026-09-26',
    responsible: 'Alex Morgan',
    status: 'Ready',
    items: [
      {
        id: 'item-int-1',
        productId: 'prod-steel-03',
        sku: 'STEEL001',
        name: 'Steel Rods (10mm)',
        uom: 'kg',
        quantityDemanded: 20,
        quantityDone: 20,
        unitPrice: 85,
      },
    ],
    notes: 'Transfer steel rods from bulk storage to assembly line rack.',
    createdAt: '2026-09-26T07:30:00Z',
  },
];

export const INITIAL_STOCK_MOVES: StockMove[] = [
  // Matching Excalidraw items:
  // WH/IN/0001 | 12/1/2001 | Azure Interior | vendor | WH/Stock1 | 6 | Ready | IN (Green)
  {
    id: 'mv-001',
    operationId: 'op-rcpt-0001',
    reference: 'WH/IN/0001',
    operationType: 'RECEIPT',
    moveDate: '2026-09-20',
    contactName: 'Azure Interior',
    productId: 'prod-desk-01',
    sku: 'DESK001',
    productName: 'Desk',
    fromLocation: 'vendor',
    toLocation: 'WH/Stock1',
    quantity: 6,
    uom: 'Units',
    unitCost: 3000,
    status: 'Ready',
    moveDirection: 'IN',
  },
  // WH/OUT/0002 | 12/1/2001 | Azure Interior | WH/Stock1 | vendor | 6 | Ready | OUT (Red)
  {
    id: 'mv-002',
    operationId: 'op-delv-0002',
    reference: 'WH/OUT/0002',
    moveDate: '2026-09-24',
    operationType: 'DELIVERY',
    contactName: 'Azure Interior',
    productId: 'prod-desk-01',
    sku: 'DESK001',
    productName: 'Desk',
    fromLocation: 'WH/Stock1',
    toLocation: 'vendor',
    quantity: 6,
    uom: 'Units',
    unitCost: 3000,
    status: 'Ready',
    moveDirection: 'OUT',
  },
  // WH/OUT/0002 | 12/1/2001 | Azure Interior | WH/Stock2 | vendor | 4 | Ready | OUT (Red)
  {
    id: 'mv-003',
    operationId: 'op-delv-0002',
    reference: 'WH/OUT/0002',
    moveDate: '2026-09-24',
    operationType: 'DELIVERY',
    contactName: 'Azure Interior',
    productId: 'prod-desk-01',
    sku: 'DESK001',
    productName: 'Desk',
    fromLocation: 'WH/Stock2',
    toLocation: 'vendor',
    quantity: 4,
    uom: 'Units',
    unitCost: 3000,
    status: 'Ready',
    moveDirection: 'OUT',
  },
];
