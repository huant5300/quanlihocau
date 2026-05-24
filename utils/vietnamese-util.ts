/**
 * Tiện ích xử lý ngôn ngữ tiếng Việt.
 * Cung cấp hàm loại bỏ dấu câu tiếng Việt để phục vụ in ấn trên máy in nhiệt di động (như PT-210) không hỗ trợ Unicode.
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return "";
  
  let result = str;
  
  // Thay thế chữ đ và Đ
  result = result.replace(/đ/g, "d");
  result = result.replace(/Đ/g, "D");
  
  // Chuẩn hóa NFD để tách các dấu tiếng Việt khỏi ký tự gốc
  result = result.normalize("NFD");
  
  // Loại bỏ các ký tự dấu ghép (combining diacritical marks)
  result = result.replace(/[\u0300-\u036f]/g, "");
  
  // Một số trường hợp ký tự đặc biệt khác có dấu mà NFD không lọc hết
  const replacements: { [key: string]: string } = {
    "à": "a", "á": "a", "ạ": "a", "ả": "a", "ã": "a", "â": "a", "ầ": "a", "ấ": "a", "ậ": "a", "ẩ": "a", "ẫ": "a", "ă": "a", "ằ": "a", "ắ": "a", "ặ": "a", "ẳ": "a", "ẵ": "a",
    "è": "e", "é": "e", "ẹ": "e", "ẻ": "e", "ẽ": "e", "ê": "e", "ề": "e", "ế": "e", "ệ": "e", "ể": "e", "ễ": "e",
    "ì": "i", "í": "i", "ị": "i", "ỉ": "i", "ĩ": "i",
    "ò": "o", "ó": "o", "ọ": "o", "ỏ": "o", "õ": "o", "ô": "o", "ồ": "o", "ố": "o", "ộ": "o", "ổ": "o", "ỗ": "o", "ơ": "o", "ờ": "o", "ớ": "o", "ợ": "o", "ở": "o", "ỡ": "o",
    "ù": "u", "ú": "u", "ụ": "u", "ủ": "u", "ũ": "u", "ư": "u", "ừ": "u", "ứ": "u", "ự": "u", "ử": "u", "ữ": "u",
    "ỳ": "y", "ý": "y", "ỵ": "y", "ỷ": "y", "ỹ": "y"
  };
  
  for (const [key, value] of Object.entries(replacements)) {
    const reg = new RegExp(key, "g");
    result = result.replace(reg, value);
    const upperKey = key.toUpperCase();
    const upperValue = value.toUpperCase();
    const upperReg = new RegExp(upperKey, "g");
    result = result.replace(upperReg, upperValue);
  }
  
  return result;
}
