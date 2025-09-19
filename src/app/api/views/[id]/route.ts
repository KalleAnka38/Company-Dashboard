import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/utils';
export async function DELETE(request: NextRequest, {
  params
}: {
  params: {
    id: string;
  };
}) {
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
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({
        error: 'Invalid ID'
      }, {
        status: 400
      });
    }
    await prisma.savedView.delete({
      where: {
        id
      }
    });
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting saved view:', error);
    return NextResponse.json({
      error: 'Failed to delete saved view'
    }, {
      status: 500
    });
  }
}