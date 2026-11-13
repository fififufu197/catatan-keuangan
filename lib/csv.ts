/**
 * Bungkus satu sel CSV bila mengandung koma, kutip, atau baris baru.
 * Kutip ganda di-escape dengan menggandakannya.
 */
export function escapeCsv(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Bangun isi file CSV dengan UTF-8 BOM dan akhir baris CRLF agar
 * karakter Indonesia tampil benar di Excel.
 */
export function buildCsv(rows: (string | number)[][]): string {
  const body = rows
    .map((row) => row.map((cell) => escapeCsv(String(cell))).join(","))
    .join("\r\n");

  return `\uFEFF${body}\r\n`;
}
