import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/utils';
export async function GET() {
  try {
    const savedViews = await prisma.savedView.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    // Convert dates to strings for JSON serialization
    const views = savedViews.map(view => ({
      ...view,
      created_at: view.created_at.toISOString()
    }));
    return NextResponse.json(views);
  } catch (error) {
    console.error('Error fetching saved views:', error);
    return NextResponse.json({
      error: 'Failed to fetch saved views'
    }, {
      status: 500
    });
  }
}
export async function POST(request: NextRequest) {
  try {
    // Check API key
    const apiKey = request.headers.get('x-api-key');
    if (!validateApiKey(apiKey)) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, {
        status: 401
      });
    }
    const {
      name,
      querystring
    } = await request.json();
    if (!name || !querystring) {
      return NextResponse.json({
        error: 'Name and querystring are required'
      }, {
        status: 400
      });
    }
    const savedView = await prisma.savedView.create({
      data: {
        name,
        querystring
      }
    });
    return NextResponse.json({
      ...savedView,
      created_at: savedView.created_at.toISOString()
    });
  } catch (error) {
    console.error('Error creating saved view:', error);
    return NextResponse.json({
      error: 'Failed to create saved view'
    }, {
      status: 500
    });
  }
}