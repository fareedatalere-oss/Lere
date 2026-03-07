
'use server';

/**
 * @fileOverview Server actions for Datahouse API to bypass CORS restrictions.
 * Robust error handling added to prevent Server Component crashes.
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
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.msg || `API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error(`Datahouse API Error (${endpoint}):`, error);
    // Return a structured error object instead of throwing to prevent RSC crashes
    return { error: true, message: error.message };
  }
}

export async function buyAirtimeAction(data: { mobile_number: string, amount: number, network: string }) {
  return datahouseFetch('/topup/', {
    method: 'POST',
    body: JSON.stringify({
      network: data.network === '9MOBILE' ? 4 : data.network === 'GLO' ? 3 : data.network === 'AIRTEL' ? 2 : 1,
      amount: data.amount,
      mobile_number: data.mobile_number,
      Ported_number: true,
      airtime_type: "VTU"
    }),
  });
}

export async function buyDataAction(data: { mobile_number: string, plan: number, network: string }) {
  return datahouseFetch('/data/', {
    method: 'POST',
    body: JSON.stringify({
      network: data.network === '9MOBILE' ? 4 : data.network === 'GLO' ? 3 : data.network === 'AIRTEL' ? 2 : 1,
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
  const netId = network.toLowerCase() === '9mobile' ? 4 : network.toLowerCase() === 'glo' ? 3 : network.toLowerCase() === 'airtel' ? 2 : 1;
  const result = await datahouseFetch(`/data_plans/${netId}`);
  if (result.error) return []; // Return empty array on failure
  return result;
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
