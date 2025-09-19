import { Company, FilterParams, SavedView } from '../utils/types';
import { applyFilters, calculateScore } from '../utils/scoring';
import { mockCompanies, mockSavedViews } from '../utils/mockData';
import { supabase } from '../lib/supabase/client';
import { logSecurityEvent } from '../lib/security/logger';

// Simulate API key for simulating authenticated endpoints
const API_KEY = 'test-api-key';

// Fetch companies with filters
export const fetchCompanies = async (params: FilterParams): Promise<Company[]> => {
  try {
    // Try to fetch from Supabase first
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
        throw error;
      }

      // Calculate scores and apply additional filters
      const companiesWithScores = data.map(company => ({
        ...company,
        score: calculateScore(company as Company, params)
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
      return filteredCompanies as Company[];
    } catch (supabaseError) {
      console.error('Supabase error, falling back to mock data:', supabaseError);
      logSecurityEvent({
        type: 'ACCESS',
        level: 'WARNING',
        message: 'Failed to fetch from Supabase, using mock data',
        data: {
          error: (supabaseError as Error).message
        }
      });
    }

    // Fallback to mock data
    console.log('Using mock data for companies');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // Get all companies from mock data
    let companies = [...mockCompanies];
    // Calculate score for each company
    companies = companies.map(company => ({
      ...company,
      score: calculateScore(company as Company, params)
    }));
    // Apply all filters
    companies = applyFilters(companies, params);
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
    // Apply pagination
    const {
      limit = 500,
      offset = 0
    } = params;
    return companies.slice(offset, offset + limit) as Company[];
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

// Simulate health check
export const checkApiHealth = async (): Promise<{
  status: string;
}> => {
  try {
    // Check Supabase connection
    const {
      error
    } = await supabase.from('companies').select('id').limit(1);
    if (error) {
      console.error('Supabase health check failed:', error);
      return {
        status: 'error'
      };
    }
    return {
      status: 'ok'
    };
  } catch (error) {
    console.error('Health check error:', error);
    return {
      status: 'error'
    };
  }
};

// Simulate export to CSV
export const exportToCsv = (params: FilterParams): void => {
  // In a real app, this would call the API endpoint
  // For now, we'll just open a new window to simulate the download
  const queryString = new URLSearchParams(params as any).toString();
  const url = `/api/export.csv?${queryString}`;
  window.open(url, '_blank');
};

// Bulk upload
export const bulkUpload = async (file: File, upsert: boolean = true, apiKey: string): Promise<{
  created: number;
  updated: number;
  total: number;
}> => {
  // Check API key
  if (apiKey !== API_KEY) {
    throw new Error('Invalid API key');
  }
  try {
    // Try to use Supabase for bulk upload
    const fileText = await file.text();
    let companies = [];
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
    }
    let created = 0;
    let updated = 0;
    // Process in batches for better performance
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < companies.length; i += batchSize) {
      batches.push(companies.slice(i, i + batchSize));
    }
    for (const batch of batches) {
      if (upsert) {
        // Upsert companies
        const {
          error,
          data
        } = await supabase.from('companies').upsert(batch.map(company => ({
          ...company,
          updated_at: new Date().toISOString()
        })), {
          onConflict: 'name'
        });
        if (error) {
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
          error,
          data
        } = await supabase.from('companies').insert(batch.map(company => ({
          ...company,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));
        if (error) {
          throw error;
        }
        created += data?.length || 0;
      }
    }
    return {
      created,
      updated,
      total: created + updated
    };
  } catch (supabaseError) {
    console.error('Supabase upload error, falling back to mock:', supabaseError);
    logSecurityEvent({
      type: 'ACCESS',
      level: 'WARNING',
      message: 'Failed to upload to Supabase, using mock implementation',
      data: {
        error: (supabaseError as Error).message
      }
    });
    // Fallback to mock implementation
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock response
    return {
      created: Math.floor(Math.random() * 10) + 1,
      updated: Math.floor(Math.random() * 20) + 1,
      total: Math.floor(Math.random() * 30) + 21
    };
  }
};

// Fetch saved views
export const fetchSavedViews = async (): Promise<SavedView[]> => {
  try {
    // Try to fetch from Supabase first
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
        throw error;
      }
      return data;
    } catch (supabaseError) {
      console.error('Supabase error, falling back to mock data:', supabaseError);
      logSecurityEvent({
        type: 'ACCESS',
        level: 'WARNING',
        message: 'Failed to fetch views from Supabase, using mock data',
        data: {
          error: (supabaseError as Error).message
        }
      });
    }

    // Fallback to mock data
    console.log('Using mock data for saved views');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return mock saved views
    return [...mockSavedViews];
  } catch (error) {
    console.error('Error fetching saved views:', error);
    throw error;
  }
};

// Create a new saved view
export const createSavedView = async (name: string, querystring: string, apiKey: string): Promise<SavedView> => {
  // Check API key
  if (apiKey !== API_KEY) {
    throw new Error('Invalid API key');
  }
  try {
    // Try to create in Supabase first
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
        throw error;
      }
      return data;
    } catch (supabaseError) {
      console.error('Supabase error, falling back to mock implementation:', supabaseError);
      logSecurityEvent({
        type: 'ACCESS',
        level: 'WARNING',
        message: 'Failed to create view in Supabase, using mock implementation',
        data: {
          error: (supabaseError as Error).message
        }
      });
    }

    // Fallback to mock implementation
    console.log('Using mock implementation for creating saved view');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // Create a new saved view with a mock ID
    const newId = Math.max(...mockSavedViews.map(view => view.id)) + 1;
    const savedView: SavedView = {
      id: newId,
      name,
      querystring,
      created_at: new Date().toISOString()
    };
    // Add to mock data (this won't persist between page refreshes)
    mockSavedViews.push(savedView);
    return savedView;
  } catch (error) {
    console.error('Error creating saved view:', error);
    throw error;
  }
};

// Delete a saved view
export const deleteSavedView = async (id: number, apiKey: string): Promise<void> => {
  // Check API key
  if (apiKey !== API_KEY) {
    throw new Error('Invalid API key');
  }
  try {
    // Try to delete from Supabase first
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
        throw error;
      }
      return;
    } catch (supabaseError) {
      console.error('Supabase error, falling back to mock implementation:', supabaseError);
      logSecurityEvent({
        type: 'ACCESS',
        level: 'WARNING',
        message: 'Failed to delete view from Supabase, using mock implementation',
        data: {
          error: (supabaseError as Error).message,
          viewId: id
        }
      });
    }

    // Fallback to mock implementation
    console.log('Using mock implementation for deleting saved view');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // Find the index of the view to delete
    const index = mockSavedViews.findIndex(view => view.id === id);
    if (index !== -1) {
      // Remove the view from the mock data
      mockSavedViews.splice(index, 1);
    }
  } catch (error) {
    console.error('Error deleting saved view:', error);
    throw error;
  }
};