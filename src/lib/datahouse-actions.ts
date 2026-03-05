'use server';

/**
 * @fileOverview Server actions for Datahouse API to bypass CORS restrictions.
 */

const DATAHOUSE_TOKEN = 'Token 80ca2a529de4afa096c4eabefeb275dafe3a8941';
const BASE_URL = 'https://datahouse.com.ng/api';

async function datahouseFetch(endpoint: string, options: RequestInit = {}) {
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
  
  return response.json();
}

export async function buyAirtimeAction(data: { mobile_number: string, amount: number, network: string }) {
  return datahouseFetch('/buy_airtime', {
    method: 'POST',
    body: JSON.stringify({ ...data, Ported_number: true }),
  });
}

export async function buyDataAction(data: { mobile_number: string, plan: number, network: string }) {
  return datahouseFetch('/buy_data', {
    method: 'POST',
    body: JSON.stringify({ ...data, Ported_number: true }),
  });
}

export async function getDataPlansAction(network: string) {
  return datahouseFetch(`/data_plans?network=${network.toUpperCase()}`);
}

export async function getExamPinsAction() {
  return datahouseFetch('/exam_pins');
}

export async function getTvPlansAction(provider: string) {
  return datahouseFetch(`/tv_plans?provider=${provider.toUpperCase()}`);
}

export async function getElectricityProvidersAction() {
  return datahouseFetch('/electricity_providers');
}
