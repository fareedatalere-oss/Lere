
'use server';

/**
 * @fileOverview Server actions for Datahouse API to bypass CORS restrictions.
 * Optimized for production with strict error reporting and precise POST structure.
 */

const DATAHOUSE_TOKEN = process.env.DATAHOUSE_TOKEN || 'Token 80ca2a529de4afa096c4eabefeb275dafe3a8941';
const BASE_URL = 'https://www.datahouse.com.ng/api';

async function datahouseFetch(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': DATAHOUSE_TOKEN,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      cache: 'no-store',
    });
    
    const result = await response.json();
    
    // Log the raw response for server-side debugging
    console.log(`Datahouse API Response (${endpoint}):`, JSON.stringify(result));

    if (!response.ok) {
      throw new Error(result.error || result.msg || result.message || `API Error: ${response.status}`);
    }
    
    return result;
  } catch (error: any) {
    console.error(`Datahouse API Fetch Error (${endpoint}):`, error.message);
    return { error: true, message: error.message };
  }
}

export async function buyAirtimeAction(data: { mobile_number: string, amount: number, network: string }) {
  const netIdMap: Record<string, number> = { 'MTN': 1, 'AIRTEL': 2, 'GLO': 3, '9MOBILE': 4 };
  const netId = netIdMap[data.network.toUpperCase()] || 1;

  return datahouseFetch('/topup/', {
    method: 'POST',
    body: JSON.stringify({
      network: netId,
      amount: data.amount,
      mobile_number: data.mobile_number,
      Ported_number: true,
      airtime_type: "VTU"
    }),
  });
}

export async function buyDataAction(data: { mobile_number: string, plan: number, network: string }) {
  const netIdMap: Record<string, number> = { 'MTN': 1, 'AIRTEL': 2, 'GLO': 3, '9MOBILE': 4 };
  const netId = netIdMap[data.network.toUpperCase()] || 1;

  return datahouseFetch('/data/', {
    method: 'POST',
    body: JSON.stringify({
      network: netId,
      mobile_number: data.mobile_number,
      plan: data.plan,
      Ported_number: true
    }),
  });
}

export async function buyDataPinAction(data: { plan_id: string, name_on_card: string }) {
  return datahouseFetch('/datarechargepin/', {
    method: 'POST',
    body: JSON.stringify({
      data_plan: data.plan_id,
      quantity: "1",
      name_on_card: data.name_on_card
    }),
  });
}

export async function getDataPlansAction(network: string) {
  const netIdMap: Record<string, number> = { 'mtn': 1, 'airtel': 2, 'glo': 3, '9mobile': 4 };
  const netId = netIdMap[network.toLowerCase()] || 1;
  
  const result = await datahouseFetch(`/data_plans/${netId}`);
  if (result.error) return [];
  
  // Normalize result based on different potential response structures
  return Array.isArray(result) ? result : (result.results || []);
}

export async function getExamPinsAction() {
  return datahouseFetch('/exam_pins/');
}

export async function getTvPlansAction(provider: string) {
  return datahouseFetch(`/tv_plans/${provider.toUpperCase()}`);
}

export async function getElectricityProvidersAction() {
  return datahouseFetch('/electricity_providers/');
}
