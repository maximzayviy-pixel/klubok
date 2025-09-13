const { pool, json } = require("./_helpers");
const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  if ((process.env.ADMIN_TOKEN || "") !== (req.headers["x-admin-token"] || "")) {
    return json(res, 403, { error: "forbidden" });
  }
  try{
    const schema = fs.readFileSync(path.join(process.cwd(), "schema.sql"), "utf8");
    await pool.query(schema);
    return json(res, 200, { ok: true });
  }catch(e){
    console.error(e);
    return json(res, 500, { error: e.message });
  }
};
