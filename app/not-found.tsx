import Link from 'next/link'
import { Fish } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
        <Fish size={40} />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">404 - Không tìm thấy trang</h2>
      <p className="text-muted-foreground mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all"
      >
        Quay lại trang chủ
      </Link>
    </div>
  )
}
