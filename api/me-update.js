const { pool, json, requireAuth } = require("./_helpers");
module.exports = async (req, res) => {
  const auth = await requireAuth(req, res);
  if(!auth) return json(res, 401, { error: "unauthorized" });
  const { displayName, bio, avatarUrl } = req.body || {};
  try{
    const r = await pool.query(
      `UPDATE users SET display_name=$1, bio=$2, avatar_url=$3, updated_at=now() WHERE id=$4 RETURNING id, username, display_name, bio, avatar_url`,
      [displayName || null, bio || null, avatarUrl || null, auth.id]
    );
    return json(res, 200, { ok: true, user: r.rows[0] });
  }catch(e){ console.error(e); return json(res, 500, { error: e.message }); }
};
