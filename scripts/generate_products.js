const fs = require('fs');
const path = require('path');

const categoriesData = [
  {
    category: 'Furniture',
    prefix: 'FURN',
    uom: 'Units',
    items: [
      { sku: 'DESK001', name: 'Ergonomic Office Desk', cost: 3000, desc: 'High durability height-adjustable wooden office desk', min: 15, max: 80, onHand: 50, reserved: 6 },
      { sku: 'TAB001', name: 'Conference Table 10-Seater', cost: 7500, desc: '10-seater oak conference meeting table with cable raceway', min: 5, max: 20, onHand: 12 },
      { sku: 'CHAIR001', name: 'Executive Mesh Chair', cost: 2200, desc: 'Breathable ergonomic lumbar support office chair', min: 12, max: 50, onHand: 8 }, // Low stock!
      { sku: 'RACK001', name: 'Heavy Duty Pallet Racking Upright', cost: 4500, desc: 'Cold-rolled structural steel teardrop upright frame 4m', min: 10, max: 60, onHand: 35 },
      { sku: 'BEAM001', name: 'Box Beam Connector 2.7m', cost: 1800, desc: 'High-strength load beam with 3-pin safety lock', min: 20, max: 120, onHand: 84 },
      { sku: 'CAB001', name: 'Steel Filing Storage Cabinet', cost: 3200, desc: '4-drawer anti-tilt fire resistant archival cabinet', min: 8, max: 40, onHand: 24 },
      { sku: 'BENCH001', name: 'Modular Industrial Workbench', cost: 5200, desc: 'Electrostatic discharge (ESD) safe technician bench', min: 6, max: 30, onHand: 5 }, // Low stock!
      { sku: 'LOCK001', name: 'Staff Locker 6-Door Unit', cost: 4100, desc: 'Ventilated steel locker unit with digital keypad locks', min: 5, max: 25, onHand: 18 },
      { sku: 'SHELF001', name: 'Galvanized Boltless Shelving Unit', cost: 2600, desc: '5-tier 350kg per shelf industrial storage rack', min: 15, max: 75, onHand: 42 },
      { sku: 'PART001', name: 'Acoustic Desk Partition Screen', cost: 950, desc: 'Sound-dampening felt acoustic privacy separator', min: 20, max: 100, onHand: 65 },
      { sku: 'CART001', name: 'Heavy Duty 3-Tier Utility Trolley', cost: 1650, desc: 'Powder-coated picking trolley with 360-degree castors', min: 10, max: 50, onHand: 29 },
      { sku: 'STOOL001', name: 'Drafting High Stool with Footring', cost: 1400, desc: 'Polyurethane swivel stool with footrest ring', min: 8, max: 40, onHand: 19 },
      { sku: 'CADDY001', name: 'Mobile Under-Desk Pedestal', cost: 1950, desc: 'Lockable 3-drawer mobile metal pedestal on wheels', min: 12, max: 60, onHand: 38 },
      { sku: 'WHITE001', name: 'Magnetic Dry-Erase Mobile Board', cost: 2800, desc: 'Double-sided 180x120cm mobile whiteboard on wheels', min: 6, max: 30, onHand: 14 },
      { sku: 'MAT001', name: 'Anti-Fatigue Industrial Floor Mat', cost: 850, desc: 'Cushioned ergonomic rubber mat for assembly operators', min: 25, max: 100, onHand: 72 },
    ]
  },
  {
    category: 'Raw Materials',
    prefix: 'RAW',
    items: [
      { sku: 'STEEL001', name: 'Reinforced Steel Rods (10mm)', uom: 'kg', cost: 85, desc: 'High tensile reinforced structural steel rods', min: 30, max: 200, onHand: 100 },
      { sku: 'STEEL002', name: 'Stainless Steel Sheet 304 (2mm)', uom: 'kg', cost: 240, desc: 'Food-grade cold rolled stainless steel panel', min: 50, max: 300, onHand: 180 },
      { sku: 'ALUM001', name: 'Aluminum Extrusion Profile 40x40', uom: 'meters', cost: 120, desc: 'T-slot modular aluminum structural profile', min: 60, max: 400, onHand: 240 },
      { sku: 'ALUM002', name: 'Aluminum Plate 6061-T6 (5mm)', uom: 'kg', cost: 310, desc: 'Aerospace & precision tooling grade aluminum plate', min: 40, max: 250, onHand: 95 },
      { sku: 'COPP001', name: 'Pure Copper Electrical Busbar', uom: 'kg', cost: 850, desc: 'Electrolytic copper conductive bar 99.9% purity', min: 25, max: 150, onHand: 18 }, // Low stock!
      { sku: 'BRASS001', name: 'Hexagonal Brass Rod 25mm', uom: 'kg', cost: 480, desc: 'Machining grade free-cutting brass bar stock', min: 30, max: 180, onHand: 110 },
      { sku: 'PLAST001', name: 'Polycarbonate Clear Sheet (4mm)', uom: 'meters', cost: 450, desc: 'Impact resistant transparent safety machine guard panel', min: 20, max: 100, onHand: 55 },
      { sku: 'ACRY001', name: 'Cast Acrylic Sheet (3mm)', uom: 'meters', cost: 280, desc: 'Laser-cuttable optical grade transparent acrylic', min: 30, max: 150, onHand: 88 },
      { sku: 'RUBB001', name: 'EPDM Industrial Rubber Gasket Sheet', uom: 'meters', cost: 190, desc: 'Weather & chemical resistant sealing rubber roll', min: 40, max: 200, onHand: 130 },
      { sku: 'FIBER001', name: 'Carbon Fiber Twill Sheet (2mm)', uom: 'meters', cost: 1800, desc: 'Ultra-light high modulus composite plate', min: 10, max: 50, onHand: 7 }, // Low stock!
      { sku: 'WOOD001', name: 'Marine Plywood Sheet 18mm', uom: 'Units', cost: 1200, desc: 'Boiling water resistant bonded timber core sheet', min: 15, max: 80, onHand: 45 },
      { sku: 'RESIN001', name: 'Epoxy Laminating Resin Compound', uom: 'liters', cost: 650, desc: 'Two-part industrial infusion grade epoxy resin', min: 20, max: 120, onHand: 64 },
      { sku: 'STEEL003', name: 'Mild Steel Square Tubing 50x50', uom: 'meters', cost: 95, desc: 'Seamless hollow section structural welded pipe', min: 50, max: 300, onHand: 160 },
      { sku: 'NYLON001', name: 'Nylon 6 Natural Round Rod 40mm', uom: 'kg', cost: 380, desc: 'Self-lubricating wear resistant engineering plastic', min: 25, max: 140, onHand: 80 },
      { sku: 'BRONZ001', name: 'Phosphor Bronze Bushing Hollow Bar', uom: 'kg', cost: 920, desc: 'Heavy load low friction bearing bronze alloy', min: 15, max: 80, onHand: 32 },
    ]
  },
  {
    category: 'Electronics',
    prefix: 'ELEC',
    items: [
      { sku: 'SNSR001', name: 'Photoelectric Proximity Sensor', uom: 'Units', cost: 850, desc: 'Retro-reflective infrared industrial counting sensor', min: 20, max: 100, onHand: 62 },
      { sku: 'SNSR002', name: 'Ultrasonic Distance Sensor IP67', uom: 'Units', cost: 1450, desc: 'Wide-angle obstacle detection sensor for AGV fleet', min: 15, max: 80, onHand: 11 }, // Low stock!
      { sku: 'MCU001', name: 'Industrial IoT Gateway Controller', uom: 'Units', cost: 4200, desc: 'Quad-core edge computing PLC telemetry node with CANBus', min: 8, max: 40, onHand: 22 },
      { sku: 'MOT001', name: 'NEMA 34 High-Torque Stepper Motor', uom: 'Units', cost: 2600, desc: 'Closed-loop 8.5Nm precision positioning actuator', min: 10, max: 60, onHand: 36 },
      { sku: 'MOT002', name: 'Brushless DC Drive Motor 48V', uom: 'Units', cost: 5800, desc: 'High efficiency motor for warehouse conveyor & sorter', min: 6, max: 30, onHand: 15 },
      { sku: 'PSU001', name: 'DIN Rail Power Supply 24V 10A', uom: 'Units', cost: 1850, desc: 'Industrial fanless metal chassis switching power unit', min: 15, max: 70, onHand: 48 },
      { sku: 'RELAY001', name: '8-Channel Solid State Relay Module', uom: 'Units', cost: 720, desc: 'Opto-isolated 240VAC 5A switching relay board', min: 25, max: 120, onHand: 78 },
      { sku: 'ENC001', name: 'Optical Rotary Encoder 1024 PPR', uom: 'Units', cost: 1650, desc: 'Incremental quadrature feedback shaft encoder', min: 12, max: 60, onHand: 34 },
      { sku: 'RFID001', name: 'UHF Long-Range RFID Reader Antenna', uom: 'Units', cost: 6500, desc: '865-868MHz gate portal pallet identification receiver', min: 4, max: 20, onHand: 3 }, // Low stock!
      { sku: 'RFID002', name: 'Gen2 Passive RFID Pallet Tags', uom: 'boxes', cost: 1200, desc: 'Box of 500 adhesive tamper-evident logistics tags', min: 10, max: 50, onHand: 28 },
      { sku: 'BAT001', name: 'LiFePO4 Battery Pack 48V 50Ah', uom: 'Units', cost: 18500, desc: 'Quick-swap deep cycle battery for autonomous AGV units', min: 4, max: 16, onHand: 9 },
      { sku: 'WIRE001', name: 'Shielded Multi-Core Control Cable', uom: 'meters', cost: 45, desc: 'Flexible oil-resistant drag chain signal cabling', min: 100, max: 800, onHand: 420 },
      { sku: 'DISP001', name: 'Industrial Touch HMI Panel 10-inch', uom: 'Units', cost: 8900, desc: 'IP65 waterproof operator interface touchscreen terminal', min: 5, max: 25, onHand: 12 },
      { sku: 'FUSE001', name: 'Ceramic Fast-Blow Cartridge Fuses', uom: 'boxes', cost: 350, desc: 'Box of 100 10A 500V high breaking capacity fuses', min: 15, max: 80, onHand: 54 },
      { sku: 'LED001', name: 'Stack Light Beacon 3-Tier RG-Buzzer', uom: 'Units', cost: 1100, desc: 'Andon status signaling tower with 85dB alarm tone', min: 12, max: 60, onHand: 38 },
    ]
  },
  {
    category: 'Fasteners & Hardware',
    prefix: 'FAST',
    items: [
      { sku: 'BOLT001', name: 'Hex Flange Head Bolt M10x50 (Grade 8.8)', uom: 'boxes', cost: 650, desc: 'Box of 200 zinc-plated structural machine bolts', min: 20, max: 120, onHand: 75 },
      { sku: 'BOLT002', name: 'Stainless Steel Socket Cap Screw M6x25', uom: 'boxes', cost: 480, desc: 'Box of 500 A2-70 Allen head machine screws', min: 25, max: 150, onHand: 112 },
      { sku: 'NUT001', name: 'Nylon Insert Lock Nut M10', uom: 'boxes', cost: 320, desc: 'Box of 500 vibration-resistant prevailing torque nuts', min: 30, max: 180, onHand: 140 },
      { sku: 'WASH001', name: 'Flat Steel Heavy Washer M10', uom: 'boxes', cost: 220, desc: 'Box of 1000 DIN 125A galvanized load washers', min: 40, max: 200, onHand: 165 },
      { sku: 'BEAR001', name: 'Deep Groove Ball Bearing 6205-2RS', uom: 'Units', cost: 240, desc: 'Rubber sealed high-speed radial roller bearing', min: 50, max: 300, onHand: 190 },
      { sku: 'BEAR002', name: 'Pillow Block Mounted Bearing UCP206', uom: 'Units', cost: 580, desc: 'Self-aligning cast iron housing flanged shaft mount', min: 20, max: 100, onHand: 48 },
      { sku: 'VALV001', name: 'Pneumatic Solenoid Valve 5/2 Way', uom: 'Units', cost: 1350, desc: 'Air manifold directional valve 24V DC pilot actuated', min: 15, max: 80, onHand: 14 }, // Low stock!
      { sku: 'CYL001', name: 'Compact Air Cylinder 32mm Bore', uom: 'Units', cost: 1750, desc: 'Double acting magnetic piston 50mm stroke actuator', min: 10, max: 50, onHand: 31 },
      { sku: 'HOSE001', name: 'Polyurethane Air Hose 8mm OD', uom: 'meters', cost: 18, desc: 'Kink-resistant pneumatic spiral tubing reel', min: 100, max: 600, onHand: 380 },
      { sku: 'FIT001', name: 'Push-in Pneumatic Quick Fittings M8', uom: 'boxes', cost: 420, desc: 'Box of 100 nickel-plated brass straight connectors', min: 20, max: 100, onHand: 68 },
      { sku: 'SEAL001', name: 'Hydraulic Piston Rod Oil Seal Kit', uom: 'boxes', cost: 890, desc: 'Pack of 20 nitrile rubber high-pressure rod seals', min: 10, max: 60, onHand: 39 },
      { sku: 'RIVET001', name: 'Blind Structural Rivets 4.8x12mm', uom: 'boxes', cost: 380, desc: 'Box of 1000 aluminum dome-head pop rivets', min: 15, max: 80, onHand: 52 },
      { sku: 'CLAMP001', name: 'Heavy Duty Worm Gear Hose Clamps', uom: 'boxes', cost: 450, desc: 'Box of 100 stainless steel 32-50mm duct clamps', min: 20, max: 100, onHand: 62 },
      { sku: 'COUPL001', name: 'Flexible Jaw Shaft Coupling 25mm', uom: 'Units', cost: 680, desc: 'Zero-backlash spider elastomer shaft connector', min: 15, max: 70, onHand: 44 },
      { sku: 'SPRING001', name: 'Precision Compression Springs Set', uom: 'boxes', cost: 520, desc: 'Box of 250 music-wire progressive recoil springs', min: 12, max: 60, onHand: 36 },
    ]
  },
  {
    category: 'Safety & Facilities',
    prefix: 'SAFE',
    items: [
      { sku: 'VEST001', name: 'High-Visibility Reflective Safety Vest', uom: 'Units', cost: 180, desc: 'Class 2 fluorescent neon vest with 3M reflective tape', min: 50, max: 250, onHand: 160 },
      { sku: 'HELM001', name: 'Industrial Vented Hard Hat Safety Helmet', uom: 'Units', cost: 450, desc: 'ANSI Z89.1 certified ratchet suspension safety helmet', min: 25, max: 120, onHand: 85 },
      { sku: 'GLOV001', name: 'Cut-Resistant Kevlar Work Gloves (Level 5)', uom: 'boxes', cost: 1250, desc: 'Box of 50 pairs polyurethane palm coated gloves', min: 15, max: 80, onHand: 54 },
      { sku: 'BOOT001', name: 'Steel Toe Cap Safety Work Boots', uom: 'Units', cost: 1850, desc: 'Puncture-proof anti-static oil-resistant warehouse boots', min: 20, max: 80, onHand: 18 }, // Low stock!
      { sku: 'SPILL001', name: 'Chemical Spill Response Rapid Kit 50L', uom: 'Units', cost: 3800, desc: 'Complete containment kit with absorbent pads and boom', min: 6, max: 30, onHand: 16 },
      { sku: 'FIRE001', name: 'CO2 Fire Extinguisher 5kg Commercial', uom: 'Units', cost: 2400, desc: 'Class B & electrical hazard fire extinguisher with horn', min: 10, max: 40, onHand: 28 },
      { sku: 'EYEW001', name: 'Emergency Wall-Mount Eyewash Station', uom: 'Units', cost: 1600, desc: 'Dual-head gravity fed eyewash bottle preservation unit', min: 8, max: 30, onHand: 21 },
      { sku: 'TAPE001', name: 'Heavy Duty Hazard Aisle Floor Tape (Yellow/Black)', uom: 'boxes', cost: 680, desc: 'Box of 10 rolls 50mm x 33m vinyl floor marking tape', min: 15, max: 70, onHand: 44 },
      { sku: 'FIRST001', name: 'OSHA Compliant Workplace First Aid Station', uom: 'Units', cost: 2900, desc: 'Metal lockable 150-person industrial trauma first aid box', min: 8, max: 30, onHand: 7 }, // Low stock!
      { sku: 'CONE001', name: 'Traffic Delineator Safety Cones 750mm', uom: 'Units', cost: 320, desc: 'Weighted heavy base PVC hazard marker with collar', min: 30, max: 150, onHand: 92 },
      { sku: 'GLASS001', name: 'Anti-Fog UV Protective Safety Goggles', uom: 'boxes', cost: 750, desc: 'Box of 20 polycarbonate scratch-resistant eye shields', min: 20, max: 100, onHand: 68 },
      { sku: 'RESP001', name: 'N95 Particulate Respirator Dust Masks', uom: 'boxes', cost: 550, desc: 'Box of 50 valved filtration masks for particulate handling', min: 25, max: 120, onHand: 82 },
      { sku: 'HARN001', name: 'Full-Body Fall Arrest Harness with Lanyard', uom: 'Units', cost: 2850, desc: 'Dual lanyard shock absorber high-altitude picker harness', min: 10, max: 40, onHand: 26 },
      { sku: 'LOCKOUT001', name: 'Lockout Tagout (LOTO) Master Safety Kit', uom: 'Units', cost: 3400, desc: 'Padlocks, hasps, cable lockouts, and tags containment kit', min: 8, max: 35, onHand: 19 },
      { sku: 'MIRR001', name: 'Convex Aisle Safety Mirror 600mm', uom: 'Units', cost: 1450, desc: 'Wide-angle unbreakable acrylic blind spot mirror', min: 10, max: 50, onHand: 33 },
    ]
  },
  {
    category: 'Packaging & Logistics',
    prefix: 'PACK',
    items: [
      { sku: 'BOX001', name: 'Corrugated Shipping Cartons (40x30x30 cm)', uom: 'boxes', cost: 850, desc: 'Bundle of 50 heavy-duty 3-ply kraft cardboard boxes', min: 30, max: 200, onHand: 140 },
      { sku: 'BOX002', name: 'Heavy Duty Master Packing Box (60x40x40 cm)', uom: 'boxes', cost: 1250, desc: 'Bundle of 25 double-wall 5-ply export shipping cartons', min: 25, max: 150, onHand: 95 },
      { sku: 'BUBB001', name: 'Air Bubble Wrap Protective Roll 100m', uom: 'Units', cost: 680, desc: '1.2m x 100m roll high-cushion anti-shock bubble wrap', min: 20, max: 100, onHand: 64 },
      { sku: 'FILM001', name: 'Cast Stretch Film Pallet Wrap (23 Micron)', uom: 'boxes', cost: 1450, desc: 'Box of 4 rolls 500mm x 300m heavy cling stretch wrap', min: 25, max: 120, onHand: 78 },
      { sku: 'TAPE002', name: 'Heavy Duty Acrylic Packaging Tape 48mm', uom: 'boxes', cost: 720, desc: 'Box of 36 rolls 65m high adhesion carton sealing tape', min: 30, max: 150, onHand: 105 },
      { sku: 'LABEL001', name: 'Direct Thermal Barcode Shipping Labels 4x6', uom: 'boxes', cost: 950, desc: 'Box of 4 rolls (1000 labels/roll) perforation ready', min: 20, max: 100, onHand: 15 }, // Low stock!
      { sku: 'STRAP001', name: 'Polypropylene (PP) Pallet Strapping Band', uom: 'Units', cost: 1100, desc: '12mm x 2000m roll heavy tension strapping coil', min: 15, max: 70, onHand: 42 },
      { sku: 'SEAL002', name: 'Metal Strapping Seals Serrated Clips', uom: 'boxes', cost: 480, desc: 'Box of 1000 heavy duty snap-on steel strapping buckles', min: 20, max: 100, onHand: 68 },
      { sku: 'CUSH001', name: 'Biodegradable Packing Peanuts Filling 150L', uom: 'boxes', cost: 620, desc: 'Cornstarch dissolvable void filler sack for parcels', min: 15, max: 60, onHand: 38 },
      { sku: 'CORNER001', name: 'Solid Board Edge Protectors 1m', uom: 'boxes', cost: 780, desc: 'Pack of 100 rigid recycled cardboard pallet corner guards', min: 20, max: 100, onHand: 72 },
      { sku: 'PALLET001', name: 'Standard Euro Wooden Pallet (1200x800mm)', uom: 'Units', cost: 850, desc: 'EPAL certified heat-treated ISPM-15 export wooden pallet', min: 40, max: 250, onHand: 175 },
      { sku: 'PALLET002', name: 'Heavy Duty Plastic Export Pallet (Rackable)', uom: 'Units', cost: 2200, desc: 'Food-grade virgin HDPE 1.5-ton load rackable blue pallet', min: 20, max: 100, onHand: 58 },
      { sku: 'DOC001', name: 'Packing List Enclosed Self-Adhesive Pouches', uom: 'boxes', cost: 380, desc: 'Box of 1000 clear document protection pouches 15x20cm', min: 25, max: 120, onHand: 84 },
      { sku: 'DESIC001', name: 'Silica Gel Moisture Absorber Desiccant 50g', uom: 'boxes', cost: 490, desc: 'Box of 200 moisture indicator humidity control sachets', min: 20, max: 100, onHand: 65 },
      { sku: 'BAG001', name: 'Anti-Static ESD Shielding Bags 20x30cm', uom: 'boxes', cost: 580, desc: 'Box of 250 zip-top Faraday cage electronic component bags', min: 25, max: 120, onHand: 76 },
    ]
  },
  {
    category: 'Tools & Equipment',
    prefix: 'TOOL',
    items: [
      { sku: 'CALIP001', name: 'Digital Vernier Caliper 150mm (0.01mm)', uom: 'Units', cost: 1850, desc: 'Hardened stainless steel electronic micro-measurement gauge', min: 8, max: 40, onHand: 24 },
      { sku: 'SCAN001', name: 'Wireless 2D QR Barcode Scanner Terminal', uom: 'Units', cost: 4500, desc: 'Bluetooth 5.0 rugged warehouse inventory scanner with cradle', min: 10, max: 50, onHand: 32 },
      { sku: 'JACK001', name: 'Hydraulic Hand Pallet Jack 2.5 Ton', uom: 'Units', cost: 14500, desc: 'Dual tandem nylon wheel heavy duty manual pallet lifter', min: 4, max: 16, onHand: 9 },
      { sku: 'SCALE001', name: 'Heavy Duty Electronic Platform Scale 500kg', uom: 'Units', cost: 6800, desc: 'Chequer plate stainless steel weighbridge with LED tower', min: 4, max: 16, onHand: 11 },
      { sku: 'GUN001', name: 'Industrial Hot Air Heat Gun 2000W', uom: 'Units', cost: 1350, desc: 'Variable temperature heat gun for pallet shrink wrapping', min: 10, max: 50, onHand: 28 },
      { sku: 'STRAPTOOL001', name: 'Pneumatic Strapping Tensioner & Sealer Tool', uom: 'Units', cost: 8900, desc: 'Friction weld battery powered strapping tool for PP/PET', min: 3, max: 12, onHand: 2 }, // Low stock!
      { sku: 'LASER001', name: 'Laser Distance Meter 80m Accuracy Tool', uom: 'Units', cost: 2200, desc: 'Bluetooth spatial measuring rangefinder with area calculator', min: 6, max: 30, onHand: 16 },
      { sku: 'TAPE003', name: 'Automatic Tape Dispenser Machine', uom: 'Units', cost: 5400, desc: 'Programmable electronic length cutting carton sealer', min: 4, max: 20, onHand: 12 },
      { sku: 'PRINTER001', name: 'Direct Thermal Industrial Label Printer', uom: 'Units', cost: 12800, desc: '300 DPI high-speed continuous barcode label printer', min: 3, max: 15, onHand: 7 },
      { sku: 'METER001', name: 'True-RMS Digital Multimeter Fluke Class', uom: 'Units', cost: 3600, desc: '600V CAT IV rugged industrial electrical maintenance meter', min: 6, max: 30, onHand: 19 },
    ]
  }
];

// Build 100 products
const products = [];
let totalCount = 0;

for (const catData of categoriesData) {
  for (const item of catData.items) {
    totalCount++;
    let id = `prod-${catData.prefix.toLowerCase()}-${String(totalCount).padStart(2, '0')}`;
    if (item.sku === 'DESK001') id = 'prod-desk-01';
    if (item.sku === 'STEEL001') id = 'prod-steel-03';

    const uom = item.uom || catData.uom || 'Units';
    const onHand = item.onHand;
    const reserved = item.reserved || 0;
    const freeToUse = Math.max(0, onHand - reserved);

    // Distribute stock across locations
    const stock1 = Math.round(onHand * 0.6);
    const stock2 = onHand - stock1;

    products.push({
      id,
      sku: item.sku,
      name: item.name,
      category: catData.category,
      uom,
      perUnitCost: item.cost,
      minReorderThreshold: item.min,
      targetMaxQuantity: item.max,
      onHand,
      freeToUse,
      locationStocks: {
        'WH/Stock1': stock1,
        'WH/Stock2': stock2,
      },
      description: item.desc,
      createdAt: '2026-01-10T00:00:00Z',
    });
  }
}

console.log(`Generated ${products.length} products.`);

// Now read initialData.ts template and replace INITIAL_PRODUCTS
const initialDataPath = path.join(__dirname, 'src', 'lib', 'initialData.ts');
let content = fs.readFileSync(initialDataPath, 'utf8');

// Replace the INITIAL_PRODUCTS block
const startMarker = 'export const INITIAL_PRODUCTS: Product[] = [';
const endMarker = 'export const INITIAL_OPERATIONS: Operation[] = [';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers in initialData.ts');
  process.exit(1);
}

const productsJson = 'export const INITIAL_PRODUCTS: Product[] = ' + JSON.stringify(products, null, 2) + ';\n\n';

const newContent = content.substring(0, startIndex) + productsJson + content.substring(endIndex);
fs.writeFileSync(initialDataPath, newContent, 'utf8');
console.log('Successfully updated src/lib/initialData.ts with 100 products!');
