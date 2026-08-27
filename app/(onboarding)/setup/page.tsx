"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingSetupPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const handleNext = () => {
    if (step === 2) {
      // Validate phone VN
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error("Số điện thoại không hợp lệ. Vui lòng nhập SĐT chuẩn Việt Nam.");
        return;
      }
      if (!formData.name || !formData.address) {
        toast.error("Vui lòng nhập đầy đủ Tên hồ và Địa chỉ.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Gọi API tạo dữ liệu hồ
      const res = await fetch("/api/setup-lake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      toast.success("Chào mừng bạn đến với hệ thống Quản lý Hồ Câu.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === 1 && "👋 Chào mừng bạn"}
            {step === 2 && "🎣 Thiết lập Thông tin Hồ Câu"}
            {step === 3 && "🚀 Hoàn tất"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Hệ thống Quản lý Hồ Câu chuyên nghiệp. Hãy dành 1 phút để thiết lập."}
            {step === 2 && "Vui lòng điền các thông tin bắt buộc dưới đây."}
            {step === 3 && "Bạn đã sẵn sàng để bắt đầu quản lý hồ câu của mình!"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <p>Hệ thống cung cấp cho bạn công cụ mạnh mẽ để:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Quản lý khách hàng và vé câu theo thời gian thực (Realtime).</li>
                <li>Tự động nhắc nhở hết giờ, thu mua cá và tính tiền.</li>
                <li>Hoạt động ngay cả khi rớt mạng (Offline-First).</li>
              </ul>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên hồ câu <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Nhập tên hồ câu của bạn"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại liên hệ <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  placeholder="09..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ chi tiết <span className="text-red-500">*</span></Label>
                <Input
                  id="address"
                  placeholder="Nhập địa chỉ hồ câu"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ✓
              </div>
              <p className="text-lg">Mọi thứ đã sẵn sàng. Nhấn Hoàn tất để vào Dashboard.</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1 || isLoading}>
            Quay lại
          </Button>
          
          {step < 3 ? (
            <Button onClick={handleNext}>Tiếp tục</Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Hoàn tất & Bắt đầu"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
