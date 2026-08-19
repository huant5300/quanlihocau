export interface VietQRParams {
  bankBin: string;
  accountNo: string;
  accountName: string;
  amount: number;
  description: string;
}

/**
 * Generate VietQR image URL using vietqr.io API
 */
export function generateVietQRUrl(params: VietQRParams): string {
  // Format description (no spaces, standard chars only for max compatibility)
  const safeDesc = encodeURIComponent(params.description.replace(/\s+/g, ""));
  
  // Create VietQR URL based on vietqr.io standard
  const url = `https://img.vietqr.io/image/${params.bankBin}-${params.accountNo}-compact2.png?amount=${params.amount}&addInfo=${safeDesc}&accountName=${encodeURIComponent(params.accountName)}`;
  
  return url;
}

// Popular banks mapping to help user select
export const VIET_BANKS = [
  { bin: "970422", shortName: "MB", name: "MBBank" },
  { bin: "970436", shortName: "Vietcombank", name: "Vietcombank" },
  { bin: "970415", shortName: "VietinBank", name: "VietinBank" },
  { bin: "970418", shortName: "BIDV", name: "BIDV" },
  { bin: "970405", shortName: "Agribank", name: "Agribank" },
  { bin: "970407", shortName: "Techcombank", name: "Techcombank" },
  { bin: "970432", shortName: "VPBank", name: "VPBank" },
  { bin: "970423", shortName: "TPBank", name: "TPBank" },
  { bin: "970416", shortName: "ACB", name: "ACB" },
  { bin: "970403", shortName: "Sacombank", name: "Sacombank" },
];
