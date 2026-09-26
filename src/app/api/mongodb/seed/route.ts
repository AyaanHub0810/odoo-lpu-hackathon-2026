import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
import {
  INITIAL_WAREHOUSES,
  INITIAL_LOCATIONS,
  INITIAL_PRODUCTS,
  INITIAL_OPERATIONS,
  INITIAL_STOCK_MOVES,
} from '@/lib/initialData';

export async function POST() {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Could not connect to MongoDB. Check MONGODB_URI.' },
        { status: 500 }
      );
    }

    // Clear existing collections and insert fresh demo datasets
    await db.collection('warehouses').deleteMany({});
    await db.collection('locations').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('operations').deleteMany({});
    await db.collection('stock_moves').deleteMany({});

    await db.collection('warehouses').insertMany(INITIAL_WAREHOUSES);
    await db.collection('locations').insertMany(INITIAL_LOCATIONS);
    await db.collection('products').insertMany(INITIAL_PRODUCTS);
    await db.collection('operations').insertMany(INITIAL_OPERATIONS);
    await db.collection('stock_moves').insertMany(INITIAL_STOCK_MOVES);

    return NextResponse.json({
      success: true,
      message: 'Demo dataset successfully seeded into MongoDB Atlas!',
      counts: {
        warehouses: INITIAL_WAREHOUSES.length,
        locations: INITIAL_LOCATIONS.length,
        products: INITIAL_PRODUCTS.length,
        operations: INITIAL_OPERATIONS.length,
        stockMoves: INITIAL_STOCK_MOVES.length,
      },
    });
  } catch (error: any) {
    console.error('Error seeding MongoDB:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to seed MongoDB' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
