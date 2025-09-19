import { supabase, handleSupabaseError } from './client';
import { logSecurityEvent } from '../security/logger';
import { Company, FilterParams, SavedView } from '@/types';
import { calculateScore } from '@/lib/utils';
/**
 * Fetch companies with filters
 */
export async function fetchCompanies(params: FilterParams): Promise<Company[]> {
  try {
    // Start building the query
    let query = supabase.from('companies').select('*');
    // Apply filters
    if (params.sectors && params.sectors.length > 0) {
      query = query.in('sector', params.sectors);
    }
    if (params.employees_min !== undefined) {
      query = query.gte('employees', params.employees_min);
    }
    if (params.employees_max !== undefined) {
      query = query.lte('employees', params.employees_max);
    }
    if (params.growth_min !== undefined) {
      query = query.gte('growth_rate', params.growth_min);
    }
    if (params.only_stale) {
      query = query.eq('stale_design', true);
    }
    if (params.only_funding) {
      query = query.eq('recent_funding', true);
    }
    if (params.low_clarity) {
      query = query.lte('clarity_score', 5);
    }
    if (params.churn_risk) {
      query = query.gte('churn_indicators', 1);
    }
    // Apply pagination
    const limit = Math.min(params.limit ?? 500, 500);
    const offset = Math.max(params.offset ?? 0, 0);
    query = query.range(offset, offset + limit - 1);
    // Execute the query
    const {
      data,
      error
    } = await query;
    if (error) {
      logSecurityEvent({
        type: 'ACCESS',
        level: 'ERROR',
        message: 'Failed to fetch companies from Supabase',
        data: {
          error: error.message
        }
      });
      throw error;
    }
    // Calculate scores and apply additional filters
    const companiesWithScores = data.map(company => ({
      ...company,
      score: calculateScore(company, params)
    }));
    // Apply min_score filter
    let filteredCompanies = companiesWithScores;
    if (params.min_score !== undefined) {
      filteredCompanies = companiesWithScores.filter(company => (company.score || 0) >= (params.min_score || 0));
    }
    // Apply sorting
    const {
      sort_by = 'score'
    } = params;
    filteredCompanies.sort((a, b) => {
      if (sort_by === 'score') {
        return (b.score || 0) - (a.score || 0);
      } else if (typeof a[sort_by as keyof Company] === 'string') {
        return (a[sort_by as keyof Company] as string).localeCompare(b[sort_by as keyof Company] as string);
      } else {
        return (b[sort_by as keyof Company] as number) - (a[sort_by as keyof Company] as number);
      }
    });
    logSecurityEvent({
      type: 'ACCESS',
      level: 'INFO',
      message: 'Successfully fetched companies from Supabase',
      data: {
        count: filteredCompanies.length
      }
    });
    return filteredCompanies;
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch companies');
  }
}
/**
 * Fetch saved views for the current user
 */
export async function fetchSavedViews(): Promise<SavedView[]> {
  try {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    let query = supabase.from('saved_views').select('*');
    // If user is logged in, fetch only their views
    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      // For non-logged in users, fetch public views (null user_id)
      query = query.is('user_id', null);
    }
    // Order by created_at
    query = query.order('created_at', {
      ascending: false
    });
    const {
      data,
      error
    } = await query;
    if (error) {
      logSecurityEvent({
        type: 'ACCESS',
        level: 'ERROR',
        message: 'Failed to fetch saved views from Supabase',
        data: {
          error: error.message
        }
      });
      throw error;
    }
    return data;
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch saved views');
  }
}
/**
 * Create a new saved view
 */
export async function createSavedView(name: string, querystring: string): Promise<SavedView> {
  try {
    // Get current user
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    const {
      data,
      error
    } = await supabase.from('saved_views').insert({
      name,
      querystring,
      user_id: user?.id || null
    }).select().single();
    if (error) {
      logSecurityEvent({
        type: 'ACCESS',
        level: 'ERROR',
        message: 'Failed to create saved view in Supabase',
        data: {
          error: error.message
        }
      });
      throw error;
    }
    logSecurityEvent({
      type: 'ACCESS',
      level: 'INFO',
      message: 'Successfully created saved view',
      data: {
        viewId: data.id,
        viewName: data.name
      }
    });
    return data;
  } catch (error) {
    return handleSupabaseError(error, 'Failed to create saved view');
  }
}
/**
 * Delete a saved view
 */
export async function deleteSavedView(id: number): Promise<void> {
  try {
    // Get current user
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    // Build query
    let query = supabase.from('saved_views').delete();
    // If user is logged in, only delete their own views
    if (user) {
      query = query.eq('id', id).eq('user_id', user.id);
    } else {
      // For non-logged in users, only delete public views
      query = query.eq('id', id).is('user_id', null);
    }
    const {
      error
    } = await query;
    if (error) {
      logSecurityEvent({
        type: 'ACCESS',
        level: 'ERROR',
        message: 'Failed to delete saved view from Supabase',
        data: {
          error: error.message,
          viewId: id
        }
      });
      throw error;
    }
    logSecurityEvent({
      type: 'ACCESS',
      level: 'INFO',
      message: 'Successfully deleted saved view',
      data: {
        viewId: id
      }
    });
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete saved view');
  }
}
/**
 * Upload company data in bulk
 */
export async function bulkUploadCompanies(companies: Partial<Company>[], upsert: boolean = true): Promise<{
  created: number;
  updated: number;
  total: number;
}> {
  try {
    // Check if user is authenticated
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required for bulk upload');
    }
    let created = 0;
    let updated = 0;
    // Process in batches of 100 for better performance
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < companies.length; i += batchSize) {
      batches.push(companies.slice(i, i + batchSize));
    }
    for (const batch of batches) {
      if (upsert) {
        // Upsert companies
        const {
          error
        } = await supabase.from('companies').upsert(batch.map(company => ({
          ...company,
          updated_at: new Date().toISOString()
        })), {
          onConflict: 'name'
        });
        if (error) {
          logSecurityEvent({
            type: 'ACCESS',
            level: 'ERROR',
            message: 'Failed to upsert companies in Supabase',
            data: {
              error: error.message,
              batchSize: batch.length
            }
          });
          throw error;
        }
        // Count created vs updated
        for (const company of batch) {
          if (company.id) {
            updated++;
          } else {
            created++;
          }
        }
      } else {
        // Insert only
        const {
          data,
          error
        } = await supabase.from('companies').insert(batch.map(company => ({
          ...company,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));
        if (error) {
          logSecurityEvent({
            type: 'ACCESS',
            level: 'ERROR',
            message: 'Failed to insert companies in Supabase',
            data: {
              error: error.message,
              batchSize: batch.length
            }
          });
          throw error;
        }
        created += data?.length || 0;
      }
    }
    const total = created + updated;
    logSecurityEvent({
      type: 'ACCESS',
      level: 'INFO',
      message: 'Successfully uploaded companies in bulk',
      data: {
        created,
        updated,
        total
      }
    });
    return {
      created,
      updated,
      total
    };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to bulk upload companies');
  }
}