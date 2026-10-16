/**
 * Flip for Business API Client
 * Dokumentasi: https://docs.flip.id/docs/api/flip-for-business-api-documentation
 *
 * Autentikasi: HTTP Basic Auth
 * - Username: Secret Key dari dashboard Flip
 * - Password: kosong (empty string)
 * Format Authorization header: Base64Encode("SecretKey:")
 */

const FLIP_SECRET_KEY = process.env.FLIP_SECRET_KEY || '';
const IS_PRODUCTION = process.env.FLIP_IS_PRODUCTION === 'true';

// Base URL tergantung environment
export const FLIP_BASE_URL = IS_PRODUCTION
  ? 'https://bigflip.id/api'
  : 'https://bigflip.id/big_sandbox_api';

/**
 * Membuat Authorization header untuk Flip API (Basic Auth)
 */
export function getFlipAuthHeader(): string {
  const credentials = Buffer.from(`${FLIP_SECRET_KEY}:`).toString('base64');
  return `Basic ${credentials}`;
}

/**
 * Tipe data untuk request Create Bill ke Flip
 */
export interface CreateBillParams {
  title: string;
  type: 'SINGLE' | 'MULTIPLE';
  amount: number;
  redirectUrl: string;
  expiredDate?: string;   // Format: "YYYY-MM-DD HH:mm"
  senderName?: string;    // Nama pembeli (wajib di sandbox)
  senderEmail?: string;   // Email pembeli
  senderBank?: string;    // Bank pembayaran: bca, bni, bri, mandiri, ovo, dll
  senderBankType?: string; // virtual_account | wallet_account
}

/**
 * Tipe data response dari Flip setelah Create Bill
 */
export interface FlipBillResponse {
  link_id: number;
  link_url: string;
  title: string;
  type: string;
  amount: number;
  status: string;
  expired_date: string;
  is_address_required: number;
  is_phone_number_required: number;
  step: number;
  redirect_url: string;
  payment_url?: string; // URL langsung ke halaman pembayaran Flip
}

/**
 * Tipe data dari webhook callback Flip (payload "data")
 */
export interface FlipWebhookData {
  id: string;
  bill_link: string;
  bill_link_id: string;
  bill_title: string;
  sender_name: string;
  sender_email: string;
  sender_bank: string;
  sender_bank_type: string;
  amount: number;
  status: 'SUCCESSFUL' | 'FAILED' | 'CANCELLED' | 'PENDING';
  settlement_status: string;
  created_at: string;
}

/**
 * Membuat Bill (tagihan) baru di Flip
 * Endpoint: POST /v2/pwf/bill
 */
export async function createFlipBill(params: CreateBillParams): Promise<FlipBillResponse> {
  // Hitung expired date: default 24 jam dari sekarang
  const expiredDate = params.expiredDate || (() => {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    // Format: "YYYY-MM-DD HH:mm"
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();

  // Flip v2 menggunakan application/x-www-form-urlencoded
  const formBody = new URLSearchParams({
    title: params.title,
    type: params.type,
    amount: String(params.amount),
    redirect_url: params.redirectUrl,
    expired_date: expiredDate,
    is_address_required: '0',
    is_phone_number_required: '0',
    step: '3', // Step 3 = direct checkout page Flip
    // Field wajib di Flip Sandbox (opsional di Production)
    sender_name: params.senderName || 'Pengguna',
    sender_email: params.senderEmail || 'user@example.com',
    sender_bank: params.senderBank || 'bca',
    sender_bank_type: params.senderBankType || 'virtual_account',
  });

  const response = await fetch(`${FLIP_BASE_URL}/v2/pwf/bill`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': getFlipAuthHeader(),
    },
    body: formBody.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Flip API Error [${response.status}]: ${errorText}`);
  }

  return response.json();
}

/**
 * Mengambil detail Bill berdasarkan link_id
 * Endpoint: GET /v2/pwf/bill/:link_id
 */
export async function getFlipBill(linkId: string): Promise<FlipBillResponse> {
  const response = await fetch(`${FLIP_BASE_URL}/v2/pwf/bill/${linkId}`, {
    method: 'GET',
    headers: {
      'Authorization': getFlipAuthHeader(),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Flip API Error [${response.status}]: ${errorText}`);
  }

  return response.json();
}

/**
 * Verifikasi token webhook dari Flip
 * Token harus cocok dengan FLIP_VALIDATION_TOKEN di .env
 */
export function verifyFlipWebhookToken(token: string): boolean {
  const validationToken = process.env.FLIP_VALIDATION_TOKEN || '';
  return token === validationToken;
}
