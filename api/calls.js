const { pool, json, requireAuth } = require("./_helpers");
module.exports = async (req, res) => {
  const auth = await requireAuth(req, res);
  if(!auth) return json(res, 401, { error: "unauthorized" });
  try{
    const r = await pool.query(
      `SELECT id, sid, from_username, to_username, to_number, status, duration, created_at
       FROM calls WHERE from_username=$1 OR to_username=$1
       ORDER BY created_at DESC LIMIT 50`,
      [auth.username]
    );
    return json(res, 200, { calls: r.rows });
  }catch(e){ console.error(e); return json(res, 500, { error: e.message }); }
};
