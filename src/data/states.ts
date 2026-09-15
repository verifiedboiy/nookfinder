export interface USState {
  code: string;
  name: string;
  primaryCity: string;
}

export const MAJOR_US_STATES: USState[] = [
  { code: 'TX', name: 'Texas', primaryCity: 'Houston / Austin' },
  { code: 'FL', name: 'Florida', primaryCity: 'Tampa / Orlando' },
  { code: 'GA', name: 'Georgia', primaryCity: 'Atlanta' },
  { code: 'NC', name: 'North Carolina', primaryCity: 'Charlotte / Raleigh' },
  { code: 'OH', name: 'Ohio', primaryCity: 'Columbus / Cleveland' },
  { code: 'PA', name: 'Pennsylvania', primaryCity: 'Philadelphia / Pittsburgh' },
  { code: 'IN', name: 'Indiana', primaryCity: 'Indianapolis' },
  { code: 'MI', name: 'Michigan', primaryCity: 'Detroit / Grand Rapids' },
  { code: 'IL', name: 'Illinois', primaryCity: 'Chicago / Peoria' },
  { code: 'MO', name: 'Missouri', primaryCity: 'Kansas City / St. Louis' },
  { code: 'TN', name: 'Tennessee', primaryCity: 'Nashville / Memphis' },
  { code: 'AZ', name: 'Arizona', primaryCity: 'Phoenix / Tucson' },
  { code: 'NV', name: 'Nevada', primaryCity: 'Las Vegas / Reno' },
  { code: 'CA', name: 'California', primaryCity: 'Sacramento / Fresno' },
  { code: 'NY', name: 'New York', primaryCity: 'Buffalo / Albany' },
  { code: 'WA', name: 'Washington', primaryCity: 'Spokane / Tacoma' },
  { code: 'CO', name: 'Colorado', primaryCity: 'Denver / Colorado Springs' },
  { code: 'VA', name: 'Virginia', primaryCity: 'Richmond / Norfolk' },
  { code: 'SC', name: 'South Carolina', primaryCity: 'Columbia / Greenville' },
  { code: 'MD', name: 'Maryland', primaryCity: 'Baltimore' },
  { code: 'WI', name: 'Wisconsin', primaryCity: 'Milwaukee / Madison' },
  { code: 'MN', name: 'Minnesota', primaryCity: 'Minneapolis / St. Paul' },
  { code: 'KY', name: 'Kentucky', primaryCity: 'Louisville / Lexington' },
  { code: 'AL', name: 'Alabama', primaryCity: 'Birmingham / Huntsville' },
  { code: 'OK', name: 'Oklahoma', primaryCity: 'Oklahoma City / Tulsa' },
];
