const { json, requireAuth } = require("./_helpers");

module.exports = async (req, res) => {
  const auth = await requireAuth(req, res);
  if(!auth) return json(res, 401, { error: "unauthorized" });
  const { dataUrl } = req.body || {};
  if(!dataUrl) return json(res, 400, { error: "missing dataUrl" });

  try{
    const m = dataUrl.match(/^data:(.+);base64,(.*)$/);
    if(!m) return json(res, 400, { error: "invalid dataUrl" });
    const mime = m[1];
    const b64 = m[2];
    const buffer = Buffer.from(b64, "base64");
    const ext = mime.split("/")[1] || "png";
    const filePath = `${auth.username}/${Date.now()}.${ext}`;

    const url = `${process.env.SUPABASE_URL}/storage/v1/object/${process.env.SUPABASE_BUCKET}/${filePath}`;
    const r = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": mime
      },
      body: buffer
    });
    if(!r.ok){
      const t = await r.text();
      return json(res, 500, { error: "upload failed", details: t });
    }
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${filePath}`;
    return json(res, 200, { ok: true, publicUrl });
  }catch(e){
    console.error(e);
    return json(res, 500, { error: e.message });
  }
};
