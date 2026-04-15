import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as staffService from "../service/staff.service.js";
import * as readerService from "../service/reader.service.js";
import config from "../config/index.js";
const createToken = (payload) => {
  // 4. Ký Token
  if (!config.auth.jwtSecret) {
    return res.status(500).json({
      message: "JWT_SECRET is missing in environment configuration",
    });
  }

  return jwt.sign(payload, config.auth.jwtSecret, { expiresIn: "24h" });
};

export const login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    // 1. Kiểm tra user tồn tại
    let user;
    let role = "";

    // thử tìm trong reader trước
    user = await readerService.getReaderByEmail(username);

    // nếu không có thì tìm trong staff
    if (!user) {
      user = await staffService.getStaffByUsername(username);
      role = user?.vaiTro || "";
    }

    if (!user)
      return res.status(200).json({ message: "Tên người dùng không tồn tại!" });

    // 2. Kiểm tra mật khẩu (đã hash)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(200).json({ message: "Mật khẩu không đúng!" });

    // 3. Tạo JWT Payload (Quan trọng: phải có role để FE phân quyền)
    const payload = {
      id: user._id,
      role: role || "",
      username: user.email || user.username,
    };

    const token = createToken(payload);

    // create cookie
    const day = 24 * 60 * 60 * 1000; // 1 ngày
    res.cookie("token", token, { httpOnly: true, maxAge: day * 3 });

    res.json({
      user,
      token: token,
      message: "Đăng nhập thành công",
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi Server" });
    console.log(err);
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the 'token' cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error during logout" });
  }
};

export const register = async (req, res, next) => {
  console.log("Đăng ký");
  try {
    const isExist = await readerService.getReaderByEmail(req.body.email);

    if (isExist) {
      return res.status(200).json({ message: "Email đã tồn tại!" });
    }

    const reader = await readerService.createReader(req.body);
    res.status(201).json({ data: reader, message: "Đăng ký thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi Server" });
    console.log(err);
  }
};
