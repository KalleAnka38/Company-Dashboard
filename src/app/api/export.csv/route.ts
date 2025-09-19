import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateScore } from '@/lib/utils';
import { FilterParams } from '@/types';
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // Parse query parameters (same as in /api/companies)
    const params: FilterParams = {};
    // Parse sectors as array
    const sectors = searchParams.get('sectors');
    if (sectors) {
      params.sectors = sectors.split(',');
    }
    // Parse numeric values
    const numericParams = ['employees_min', 'employees_max', 'growth_min', 'min_score', 'limit', 'offset', 'w_growth', 'w_stale', 'w_clarity', 'w_churn', 'w_funding', 'w_midsize'];
    numericParams.forEach(param => {
      const value = searchParams.get(param);
      if (value !== null) {
        // @ts-ignore - We know these are valid keys
        params[param] = Number(value);
      }
    });
    // Parse boolean values
    const booleanParams = ['only_stale', 'only_funding', 'low_clarity', 'churn_risk'];
    booleanParams.forEach(param => {
      const value = searchParams.get(param);
      if (value !== null) {
        // @ts-ignore - We know these are valid keys
        params[param] = value === 'true';
      }
    });
    // Parse sort
    const sortBy = searchParams.get('sort_by');
    if (sortBy) {
      params.sort_by = sortBy as any;
    }
    // Build Prisma query (same as in /api/companies)
    const where: any = {};
    if (params.sectors && params.sectors.length > 0) {
      where.sector = {
        in: params.sectors
      };
    }
    if (params.employees_min !== undefined) {
      where.employees = {
        ...where.employees,
        gte: params.employees_min
      };
    }
    if (params.employees_max !== undefined) {
      where.employees = {
        ...where.employees,
        lte: params.employees_max
      };
    }
    if (params.growth_min !== undefined) {
      where.growth_rate = {
        gte: params.growth_min
      };
    }
    if (params.only_stale) {
      where.stale_design = true;
    }
    if (params.only_funding) {
      where.recent_funding = true;
    }
    if (params.low_clarity) {
      where.clarity_score = {
        lte: 5
      };
    }
    if (params.churn_risk) {
      where.churn_indicators = {
        gte: 1
      };
    }
    // Execute query
    let companies = await prisma.company.findMany({
      where
    });
    // Calculate score for each company
    companies = companies.map(company => ({
      ...company,
      score: calculateScore(company as any, params)
    }));
    // Apply min_score filter
    if (params.min_score !== undefined) {
      companies = companies.filter(company => (company.score || 0) >= (params.min_score || 0));
    }
    // Apply sorting
    const {
      sort_by = 'score'
    } = params;
    companies.sort((a, b) => {
      if (sort_by === 'score') {
        return (b.score || 0) - (a.score || 0);
      } else {
        // @ts-ignore - We know these properties exist
        return b[sort_by] - a[sort_by];
      }
    });
    // Generate CSV content
    const headers = ['id', 'name', 'sector', 'website', 'employees', 'growth_rate', 'recent_funding', 'stale_design', 'clarity_score', 'churn_indicators', 'hq', 'score'];
    let csv = headers.join(',') + '\n';
    companies.forEach(company => {
      const row = headers.map(header => {
        const value = company[header as keyof typeof company];
        if (typeof value === 'string') {
          // Escape quotes and wrap in quotes
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += row.join(',') + '\n';
    });
    // Return CSV as attachment
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="company-finder-results.csv"'
      }
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    return NextResponse.json({
      error: 'Failed to generate CSV'
    }, {
      status: 500
    });
  }
}