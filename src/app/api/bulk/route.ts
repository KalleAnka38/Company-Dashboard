import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/utils';
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
    // Get upsert parameter
    const searchParams = request.nextUrl.searchParams;
    const upsert = searchParams.get('upsert') === 'true';
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({
        error: 'No file provided'
      }, {
        status: 400
      });
    }
    // Process file based on content type
    let companies = [];
    const fileText = await file.text();
    if (file.type === 'application/json') {
      companies = JSON.parse(fileText);
    } else if (file.type === 'text/csv') {
      // Simple CSV parser
      const lines = fileText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim());
        const company: any = {};
        headers.forEach((header, index) => {
          let value = values[index];
          // Convert boolean strings to actual booleans
          if (value === 'true') value = true;else if (value === 'false') value = false;
          // Convert numeric strings to numbers
          else if (!isNaN(Number(value))) value = Number(value);
          company[header] = value;
        });
        companies.push(company);
      }
    } else {
      return NextResponse.json({
        error: 'Unsupported file type'
      }, {
        status: 400
      });
    }
    // Process companies
    let created = 0;
    let updated = 0;
    for (const company of companies) {
      if (!company.name) continue;
      // Clean up data
      const cleanCompany = {
        name: company.name,
        sector: company.sector || 'Unknown',
        website: company.website,
        employees: Number(company.employees) || 0,
        growth_rate: Number(company.growth_rate) || 0,
        recent_funding: Boolean(company.recent_funding),
        stale_design: Boolean(company.stale_design),
        clarity_score: Number(company.clarity_score) || 0,
        churn_indicators: Number(company.churn_indicators) || 0,
        hq: company.hq,
        last_updated: company.last_updated
      };
      if (upsert) {
        // Check if company exists
        const existing = await prisma.company.findFirst({
          where: {
            name: cleanCompany.name
          }
        });
        if (existing) {
          // Update
          await prisma.company.update({
            where: {
              id: existing.id
            },
            data: cleanCompany
          });
          updated++;
        } else {
          // Create
          await prisma.company.create({
            data: cleanCompany
          });
          created++;
        }
      } else {
        // Always create
        await prisma.company.create({
          data: cleanCompany
        });
        created++;
      }
    }
    return NextResponse.json({
      created,
      updated,
      total: created + updated
    });
  } catch (error) {
    console.error('Error processing bulk upload:', error);
    return NextResponse.json({
      error: 'Failed to process upload'
    }, {
      status: 500
    });
  }
}