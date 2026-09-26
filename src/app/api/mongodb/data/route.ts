import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: false, connected: false });
    }

    const [warehouses, locations, products, operations, stockMoves] = await Promise.all([
      db.collection('warehouses').find({}).toArray(),
      db.collection('locations').find({}).toArray(),
      db.collection('products').find({}).toArray(),
      db.collection('operations').find({}).toArray(),
      db.collection('stock_moves').find({}).toArray(),
    ]);

    // Strip MongoDB _id to prevent JSON serialization issues if needed
    const cleanDoc = (doc: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...rest } = doc;
      return rest;
    };

    return NextResponse.json({
      success: true,
      connected: true,
      hasData: products.length > 0,
      data: {
        warehouses: warehouses.map(cleanDoc),
        locations: locations.map(cleanDoc),
        products: products.map(cleanDoc),
        operations: operations.map(cleanDoc),
        stockMoves: stockMoves.map(cleanDoc),
      },
    });
  } catch (error: any) {
    console.error('Error reading MongoDB data:', error);
    return NextResponse.json({ success: false, connected: false, error: error?.message });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { warehouses, locations, products, operations, stockMoves } = body;

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: false, message: 'No MongoDB connection' }, { status: 500 });
    }

    if (warehouses && Array.isArray(warehouses) && warehouses.length > 0) {
      await db.collection('warehouses').deleteMany({});
      await db.collection('warehouses').insertMany(warehouses);
    }
    if (locations && Array.isArray(locations) && locations.length > 0) {
      await db.collection('locations').deleteMany({});
      await db.collection('locations').insertMany(locations);
    }
    if (products && Array.isArray(products) && products.length > 0) {
      await db.collection('products').deleteMany({});
      await db.collection('products').insertMany(products);
    }
    if (operations && Array.isArray(operations) && operations.length > 0) {
      await db.collection('operations').deleteMany({});
      await db.collection('operations').insertMany(operations);
    }
    if (stockMoves && Array.isArray(stockMoves) && stockMoves.length > 0) {
      await db.collection('stock_moves').deleteMany({});
      await db.collection('stock_moves').insertMany(stockMoves);
    }

    return NextResponse.json({ success: true, message: 'Synced to MongoDB Atlas' });
  } catch (error: any) {
    console.error('Error writing to MongoDB:', error);
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
  }
}
