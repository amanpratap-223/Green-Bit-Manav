// import jwt from "jsonwebtoken";
// import User from "../models/User.js";
// import { getRoleConn } from "../db/connections.js";

// const auth = async (req, res, next) => {
//   try {
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) return res.status(401).json({ success:false, message:"No token" });

//     const { id } = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(id);
//     if (!user) return res.status(401).json({ success:false, message:"Invalid token" });

//     req.user = user;
//     req.roleDb = getRoleConn(user.role); // ready if you later need role-specific data
//     next();
//   } catch (e) {
//     res.status(401).json({ success:false, message:"Unauthorized" });
//   }
// };
// export default auth;

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getRoleConn } from "../db/connections.js";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ success:false, message:"No token" });

    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ success:false, message:"Invalid token" });

    req.user = user;
    req.roleDb = getRoleConn(user.role);
    next();
  } catch (e) {
    res.status(401).json({ success:false, message:"Unauthorized" });
  }
};

export default auth;
