import { Metadata } from "next";
import { GuideClient } from "./guide-client";

export const metadata: Metadata = {
  title: "Hướng Dẫn Sử Dụng & Cẩm Nang Vận Hành | QuanLiHoCau™",
  description: "Cẩm nang hướng dẫn từng bước quản lý hồ câu, vào ca câu, bán mồi, cân cá và xuất hóa đơn VietQR.",
};

export default function GuidePage() {
  return <GuideClient />;
}
