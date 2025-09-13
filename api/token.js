const twilio = require("twilio");
const { json, requireAuth } = require("./_helpers");

module.exports = async (req, res) => {
  const auth = await requireAuth(req, res);
  if(!auth) return json(res, 401, { error: "unauthorized" });

  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET,
    TWIML_APP_SID,
    PUSH_CREDENTIAL_SID_ANDROID,
    PUSH_CREDENTIAL_SID_IOS
  } = process.env;

  const platform = (req.query && req.query.platform) ? String(req.query.platform) : "web";

  const { jwt } = twilio;
  const { AccessToken } = jwt;
  const { VoiceGrant } = AccessToken;

  const token = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET,
    { identity: auth.username }
  );

  const grantOptions = {
    outgoingApplicationSid: TWIML_APP_SID,
    incomingAllow: true
  };
  if (platform === "android" && PUSH_CREDENTIAL_SID_ANDROID) grantOptions.pushCredentialSid = PUSH_CREDENTIAL_SID_ANDROID;
  if (platform === "ios" && PUSH_CREDENTIAL_SID_IOS) grantOptions.pushCredentialSid = PUSH_CREDENTIAL_SID_IOS;

  const voiceGrant = new VoiceGrant(grantOptions);
  token.addGrant(voiceGrant);

  return json(res, 200, { identity: auth.username, token: token.toJwt() });
};
