import { mockCompanies } from '@/utils/mockData';
// Get all available sectors from mock data
export const getAllSectors = (): string[] => {
  const sectors = new Set(mockCompanies.map(company => company.sector));
  return Array.from(sectors);
};