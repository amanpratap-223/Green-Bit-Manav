// // models/User.js
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//   password: { type: String, required: true, minlength: 6 },
//   role: { type: String, enum: ["coordinator", "faculty"], required: true },
//   lastLogin: Date
// }, { timestamps: true });

// userSchema.pre("save", async function(next){
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// userSchema.methods.comparePassword = function(pw){
//   return bcrypt.compare(pw, this.password);
// };

// userSchema.methods.generateAuthToken = function(){
//   return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
// };

// // Use the default mongoose.model since we have a single connection
// const User = mongoose.model("User", userSchema);

// export default User;

// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // hide by default; explicitly select in login
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["coordinator", "faculty"], required: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

// hash password when set/changed
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.generateAuthToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not set");
  }
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// remove sensitive fields on JSON
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
