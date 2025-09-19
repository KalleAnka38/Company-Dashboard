// This is a mock seed file that doesn't actually need to run
// since we're using mock data directly
import { mockCompanies, mockSavedViews } from '../utils/mockData';
console.log('Using mock data instead of actual database seeding');
console.log(`Mock data includes ${mockCompanies.length} companies and ${mockSavedViews.length} saved views`);
// No actual database operations needed