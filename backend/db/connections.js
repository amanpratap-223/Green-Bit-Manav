import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const { MONGO_URI_AUTH, MONGO_URI_COORD, MONGO_URI_FAC } = process.env;

function must(name, v){ if(!v) { console.error(`[db] Missing ${name}`); process.exit(1);} }
must("MONGO_URI_AUTH", MONGO_URI_AUTH);
must("MONGO_URI_COORD", MONGO_URI_COORD);
must("MONGO_URI_FAC",   MONGO_URI_FAC);

const authConn  = mongoose.createConnection(MONGO_URI_AUTH);
const coordConn = mongoose.createConnection(MONGO_URI_COORD);
const facConn   = mongoose.createConnection(MONGO_URI_FAC);

for (const [n,c] of Object.entries({authConn,coordConn,facConn})) {
  c.on("connected", () => console.log(`[db] ${n} connected`));
  c.on("error", (e) => console.error(`[db] ${n} error:`, e.message));
}

export const getAuthConn  = () => authConn;
export const getRoleConn  = (role) => (role === "coordinator" ? coordConn : facConn);
