import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PDFExportParams {
  title: string;
  headers: string[];
  rows: any[][];
  filename: string;
  lakeName?: string;
  dateRange?: string;
}

/**
 * Xuất dữ liệu ra file PDF
 */
export function exportToPDF({
  title,
  headers,
  rows,
  filename,
  lakeName = "HỆ THỐNG QUẢN LÝ HỒ CÂU",
  dateRange
}: PDFExportParams): void {
  // Tạo tài liệu mới (A4, portrait)
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.width;
  
  // Font mặc định không hỗ trợ tiếng Việt hoàn toàn, nhưng chúng ta dùng font cơ bản 
  // (Trong ứng dụng thực tế có thể load font Arial/Roboto custom)
  // Để đơn giản ta dùng Helvetica (cần xoá dấu trước khi render ở bản chuẩn nếu không add font)
  // Tuy nhiên jsPDF-autotable có thể hỗ trợ render cơ bản.

  // Tiêu đề phụ (Tên hồ)
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(lakeName, pageWidth / 2, 15, { align: "center" });

  // Tiêu đề chính
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  // doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), pageWidth / 2, 25, { align: "center" });

  // Ngày xuất báo cáo / khoảng thời gian
  let startY = 35;
  if (dateRange) {
    doc.setFontSize(10);
    doc.setTextColor(80);
    // doc.setFont("helvetica", "normal");
    doc.text(dateRange, pageWidth / 2, 32, { align: "center" });
    startY = 40;
  }

  // Khởi tạo bảng
  autoTable(doc, {
    startY,
    head: [headers],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [16, 185, 129], // emerald-500
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
  });

  // Footer (Ngày xuất và trang)
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    
    const now = new Date();
    const dateStr = `Ngày xuất: ${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN')}`;
    const pageStr = `Trang ${i} / ${pageCount}`;
    
    doc.text(dateStr, 14, doc.internal.pageSize.height - 10);
    doc.text(pageStr, pageWidth - 14, doc.internal.pageSize.height - 10, { align: "right" });
  }

  // Tải file
  doc.save(`${filename}.pdf`);
}
