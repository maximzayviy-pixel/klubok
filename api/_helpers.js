const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "disable" ? false : { rejectUnauthorized: false }
});

function json(res, code, data){ res.status(code).json(data); }

async function requireAuth(req, res){
  try{
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if(!token) return null;
    const payload = jwt.verify(token, process.env.APP_JWT_SECRET);
    req.user = payload;
    return payload;
  }catch(e){ return null; }
}

async function hashPassword(pw){
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pw, salt);
}
async function verifyPassword(pw, hash){ return await bcrypt.compare(pw, hash); }

module.exports = { pool, json, requireAuth, hashPassword, verifyPassword };
