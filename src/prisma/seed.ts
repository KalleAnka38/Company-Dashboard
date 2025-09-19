import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Clear existing data
  await prisma.company.deleteMany();
  await prisma.savedView.deleteMany();
  // Create seed companies
  const companies = [{
    name: 'FlowForge',
    sector: 'B2B SaaS',
    website: 'https://flowforge.com',
    employees: 180,
    growth_rate: 32,
    recent_funding: true,
    stale_design: true,
    clarity_score: 4,
    churn_indicators: 2,
    hq: 'Austin, TX',
    last_updated: '2023-05-15'
  }, {
    name: 'DataSync',
    sector: 'Data Analytics',
    website: 'https://datasync.io',
    employees: 85,
    growth_rate: 28,
    recent_funding: false,
    stale_design: true,
    clarity_score: 6,
    churn_indicators: 1,
    hq: 'Boston, MA',
    last_updated: '2023-06-20'
  }, {
    name: 'CloudPulse',
    sector: 'DevOps',
    website: 'https://cloudpulse.dev',
    employees: 120,
    growth_rate: 40,
    recent_funding: true,
    stale_design: false,
    clarity_score: 3,
    churn_indicators: 0,
    hq: 'San Francisco, CA',
    last_updated: '2023-07-12'
  },
  // Add more companies from your mock data
  {
    name: 'SecureEdge',
    sector: 'Cybersecurity',
    website: 'https://secureedge.com',
    employees: 250,
    growth_rate: 35,
    recent_funding: true,
    stale_design: false,
    clarity_score: 2,
    churn_indicators: 1,
    hq: 'Seattle, WA',
    last_updated: '2023-06-30'
  }, {
    name: 'MarketMesh',
    sector: 'MarTech',
    website: 'https://marketmesh.co',
    employees: 65,
    growth_rate: 22,
    recent_funding: false,
    stale_design: true,
    clarity_score: 7,
    churn_indicators: 2,
    hq: 'Chicago, IL',
    last_updated: '2023-05-28'
  }
  // ... more companies
  ];
  for (const company of companies) {
    await prisma.company.create({
      data: company
    });
  }
  // Create sample saved views
  const savedViews = [{
    name: 'High Growth B2B',
    querystring: 'sectors=B2B%20SaaS&growth_min=30&sort_by=growth_rate'
  }, {
    name: 'Stale Design Opportunities',
    querystring: 'only_stale=true&min_score=60&w_stale=2.5'
  }, {
    name: 'Funded Startups',
    querystring: 'only_funding=true&employees_max=200'
  }];
  for (const view of savedViews) {
    await prisma.savedView.create({
      data: view
    });
  }
  console.log('Seed data created successfully');
}
main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});