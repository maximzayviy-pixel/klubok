const { pool, json, verifyPassword } = require("./_helpers");
const twilio = require("twilio");
module.exports = async (req, res) => {
  const body = req.body || {};
  const username = (body.username||"").trim().toLowerCase();
  const password = String(body.password||"");
  const platform = body.platform || "web";

  if(!username || !password) return json(res, 400, { error: "username and password required" });

  try{
    const r = await pool.query(`SELECT id, username, password_hash, display_name FROM users WHERE username=$1`, [username]);
    if(!r.rowCount) return json(res, 401, { error: "invalid credentials" });
    const user = r.rows[0];
    const ok = await verifyPassword(password, user.password_hash);
    if(!ok) return json(res, 401, { error: "invalid credentials" });
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.APP_JWT_SECRET, { expiresIn: "7d" });

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
    if (process.env.PUSH_CREDENTIAL_SID_ANDROID && platform === "android") grantOptions.pushCredentialSid = process.env.PUSH_CREDENTIAL_SID_ANDROID;
    if (process.env.PUSH_CREDENTIAL_SID_IOS && platform === "ios") grantOptions.pushCredentialSid = process.env.PUSH_CREDENTIAL_SID_IOS;
    t.addGrant(new VoiceGrant(grantOptions));

    return json(res, 200, { ok: true, token, twilioToken: t.toJwt(), user: { id: user.id, username: user.username, displayName: user.display_name } });
  }catch(e){
    console.error(e);
    return json(res, 500, { error: e.message });
  }
};
