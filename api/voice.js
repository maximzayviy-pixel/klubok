const twilio = require("twilio");

module.exports = (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  const to = (req.body && (req.body.To || req.body.to)) || (req.query && (req.query.To || req.query.to));

  if (!to) {
    twiml.say("No destination provided");
  } else {
    const dial = twiml.dial({
      callerId: "client",
      record: "record-from-answer",
      answerOnBridge: true
    });

    const dest = String(to).trim();
    if (/^\+\d{8,15}$/.test(dest)) {
      dial.number({
        statusCallbackEvent: "initiated ringing answered completed",
        statusCallback: process.env.PUBLIC_BASE_URL ? `${process.env.PUBLIC_BASE_URL}/api/call-events` : undefined,
        statusCallbackMethod: "POST"
      }, dest);
    } else {
      dial.client(dest);
    }
  }

  res.setHeader("Content-Type", "text/xml");
  res.send(twiml.toString());
};
