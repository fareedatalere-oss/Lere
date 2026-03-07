
'use server';

/**
 * @fileOverview Production server actions for Flutterwave API.
 * Used for generating real Virtual Account numbers.
 */

const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

export async function generateVirtualAccountAction(userData: { email: string, name: string, phone: string }) {
  if (!FLW_SECRET_KEY) {
    return { error: true, message: "Flutterwave Secret Key is missing in Vercel Environment Variables." };
  }

  try {
    const response = await fetch('https://api.flutterwave.com/v3/virtual-account-numbers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLW_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: userData.email,
        is_permanent: false,
        tx_ref: `VA_${Date.now()}`,
        phonenumber: userData.phone,
        firstname: userData.name.split(' ')[0],
        lastname: userData.name.split(' ')[1] || 'LereUser',
      })
    });

    const result = await response.json();

    if (result.status === "success") {
      return {
        account_number: result.data.account_number,
        bank_name: result.data.bank_name,
        expiry_date: result.data.expiry_date
      };
    } else {
      throw new Error(result.message || "Failed to generate virtual account");
    }
  } catch (error: any) {
    console.error("Flutterwave VA Error:", error.message);
    return { error: true, message: error.message };
  }
}
