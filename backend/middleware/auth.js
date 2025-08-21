// // middleware/auth.js
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const auth = async (req, res, next) => {
//   try {
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//         return res.status(401).json({ success:false, message:"No token, authorization denied" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) {
//         return res.status(401).json({ success:false, message:"Invalid token" });
//     }

//     req.user = user;
//     // req.roleDb is no longer needed as we have one shared DB connection
//     next();
//   } catch (e) {
//     res.status(401).json({ success:false, message:"Token is not valid" });
//   }
// };

// export default auth;

// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // password is hidden by default
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (e) {
    console.error("Auth error:", e.message);
    res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

export default auth;
