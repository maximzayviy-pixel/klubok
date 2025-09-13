const { pool, json, hashPassword } = require("./_helpers");
const twilio = require("twilio");
module.exports = async (req, res) => {
  const body = req.body || {};
  const username = (body.username||"").trim().toLowerCase();
  const password = String(body.password||"");
  const displayName = (body.displayName||"").trim();

  if(!username || !password) return json(res, 400, { error: "username and password required" });

  try{
    const hash = await hashPassword(password);
    const r = await pool.query(
      `INSERT INTO users (username, password_hash, display_name) VALUES ($1,$2,$3) RETURNING id, username, display_name`,
      [username, hash, displayName || null]
    );
    // issue app jwt
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: r.rows[0].id, username: r.rows[0].username }, process.env.APP_JWT_SECRET, { expiresIn: "7d" });

    // issue twilio token immediately
    const { jwt: tjwt } = twilio;
    const { AccessToken } = tjwt;
    const { VoiceGrant } = AccessToken;
    const t = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      { identity: username }
    );
    const grantOptions = {
      outgoingApplicationSid: process.env.TWIML_APP_SID,
      incomingAllow: true
    };
    if (process.env.PUSH_CREDENTIAL_SID_ANDROID && (body.platform === "android")) grantOptions.pushCredentialSid = process.env.PUSH_CREDENTIAL_SID_ANDROID;
    if (process.env.PUSH_CREDENTIAL_SID_IOS && (body.platform === "ios")) grantOptions.pushCredentialSid = process.env.PUSH_CREDENTIAL_SID_IOS;
    t.addGrant(new VoiceGrant(grantOptions));

    return json(res, 200, { ok: true, token, twilioToken: t.toJwt(), user: { id: r.rows[0].id, username } });
  }catch(e){
    if (e.code === "23505") return json(res, 409, { error: "username taken" });
    console.error(e);
    return json(res, 500, { error: e.message });
  }
};
