import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Reader from "../model/Reader.js";
import Staff from "../model/Staff.js";
import * as readService from "../service/reader.service.js";

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Kiểm tra user tồn tại
    const user = await readService.getReaderByEmail(email);
    if (!user) return res.status(404).json({ message: "Email không tồn tại!" });

    // 2. Kiểm tra mật khẩu (đã hash)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu không đúng!" });

    // 3. Tạo JWT Payload (Quan trọng: phải có role để FE phân quyền)
    const payload = {
      id: user._id,
      role: user.role, // 'admin' hoặc 'user'
    };

    // 4. Ký Token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // 5. Trả về đúng cấu trúc FE yêu cầu
    res.json({
      account: { email: user.email, name: user.name },
      token: token,
      message: "Đăng nhập thành công",
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const register = async (req, res, next) => {};
