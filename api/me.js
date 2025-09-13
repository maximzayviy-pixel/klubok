const { pool, json, requireAuth } = require("./_helpers");
module.exports = async (req, res) => {
  const auth = await requireAuth(req, res);
  if(!auth) return json(res, 401, { error: "unauthorized" });
  try{
    const r = await pool.query(`SELECT id, username, display_name, bio, avatar_url, created_at, updated_at FROM users WHERE id=$1`, [auth.id]);
    return json(res, 200, { user: r.rows[0] });
  }catch(e){ console.error(e); return json(res, 500, { error: e.message }); }
};
