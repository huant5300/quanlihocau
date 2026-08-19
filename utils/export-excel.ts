import * as XLSX from "xlsx";

/**
 * Xuất dữ liệu ra file Excel
 * @param data Mảng dữ liệu cần xuất (array of objects)
 * @param filename Tên file (không cần đuôi .xlsx)
 * @param sheetName Tên sheet
 */
export function exportToExcel(data: any[], filename: string, sheetName: string = "Sheet1"): void {
  // Tạo workbook và worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Điều chỉnh độ rộng cột tự động dựa trên nội dung
  const colWidths = getColumnWidths(data);
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Xuất file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Tính toán độ rộng cột tự động cho Excel
 */
function getColumnWidths(data: any[]) {
  if (!data || data.length === 0) return [];

  // Lấy các keys từ object đầu tiên
  const keys = Object.keys(data[0]);
  
  return keys.map((key) => {
    // Độ rộng tiêu đề
    let maxWidth = key.length;

    // Tìm độ dài lớn nhất trong dữ liệu
    data.forEach((row) => {
      const value = row[key];
      if (value !== null && value !== undefined) {
        const valStr = value.toString();
        if (valStr.length > maxWidth) {
          maxWidth = valStr.length;
        }
      }
    });

    // Thêm một chút padding
    return { wch: Math.min(maxWidth + 2, 50) }; // Capped at 50 to avoid excessively wide columns
  });
}
