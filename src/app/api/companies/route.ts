import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateScore, sanitizeString, isValidNumber } from '@/lib/utils';
import { FilterParams } from '@/types';
import { rateLimit } from '@/lib/rateLimit';
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, {
    uniqueTokenPerInterval: 500,
    // Max 500 users per interval
    interval: 60 * 1000,
    // 1 minute
    limit: 30 // 30 requests per minute
  });
  if (!rateLimitResult.success) {
    return NextResponse.json({
      error: 'Too many requests. Please try again later.'
    }, {
      status: 429,
      headers: {
        'Retry-After': '60'
      }
    });
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    // Parse query parameters
    const params: FilterParams = {};
    // Parse sectors as array with sanitization
    const sectors = searchParams.get('sectors');
    if (sectors) {
      params.sectors = sectors.split(',').map(s => sanitizeString(s.trim()));
    }
    // Parse numeric values with validation
    const numericParams = ['employees_min', 'employees_max', 'growth_min', 'min_score', 'limit', 'offset', 'w_growth', 'w_stale', 'w_clarity', 'w_churn', 'w_funding', 'w_midsize'];
    numericParams.forEach(param => {
      const value = searchParams.get(param);
      if (value !== null) {
        if (!isValidNumber(value)) {
          return NextResponse.json({
            error: `Invalid ${param} parameter: must be a number`
          }, {
            status: 400
          });
        }
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
    // Parse sort with validation
    const sortBy = searchParams.get('sort_by');
    if (sortBy) {
      const allowedSortFields = ['score', 'growth_rate', 'employees', 'clarity_score', 'name', 'sector'];
      if (!allowedSortFields.includes(sortBy)) {
        return NextResponse.json({
          error: 'Invalid sort_by parameter'
        }, {
          status: 400
        });
      }
      params.sort_by = sortBy as any;
    }
    // Apply pagination limits
    const limit = Math.min(params.limit ?? 500, 500); // Cap at 500 records max
    const offset = Math.max(params.offset ?? 0, 0); // Ensure non-negative
    // Build Prisma query
    const where: any = {};
    // Apply sector filter
    if (params.sectors && params.sectors.length > 0) {
      where.sector = {
        in: params.sectors
      };
    }
    // Apply employee range filter
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
    // Apply growth minimum filter
    if (params.growth_min !== undefined) {
      where.growth_rate = {
        gte: params.growth_min
      };
    }
    // Apply boolean filters
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
    // Execute query with a timeout
    let companies;
    try {
      companies = (await Promise.race([prisma.company.findMany({
        where,
        take: limit,
        skip: offset
      }), new Promise((_, reject) => setTimeout(() => reject(new Error('Database query timeout')), 15000))])) as any;
    } catch (error) {
      console.error('Database query error:', error);
      return NextResponse.json({
        error: 'Database query failed or timed out'
      }, {
        status: 500
      });
    }
    // Convert dates to strings for JSON serialization
    companies = companies.map((company: any) => ({
      ...company,
      created_at: company.created_at.toISOString(),
      updated_at: company.updated_at.toISOString(),
      // Calculate score for each company
      score: calculateScore(company as any, params)
    }));
    // Apply min_score filter (can't be done in database query easily)
    if (params.min_score !== undefined) {
      companies = companies.filter((company: any) => (company.score || 0) >= (params.min_score || 0));
    }
    // Apply sorting
    const {
      sort_by = 'score'
    } = params;
    companies.sort((a: any, b: any) => {
      if (sort_by === 'score') {
        return (b.score || 0) - (a.score || 0);
      } else if (typeof a[sort_by] === 'string') {
        return a[sort_by].localeCompare(b[sort_by]);
      } else {
        // @ts-ignore - We know these properties exist
        return b[sort_by] - a[sort_by];
      }
    });
    // Return with security headers
    return NextResponse.json(companies, {
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({
      error: 'Failed to fetch companies'
    }, {
      status: 500
    });
  }
}