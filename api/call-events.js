const { pool } = require("./_helpers");

module.exports = async (req, res) => {
  try{
    const b = req.body || req.query || {};
    const sid = b.CallSid || null;
    const from = (b.From || "").replace("client:", "");
    const toClient = b.To && b.To.startsWith("client:") ? b.To.replace("client:", "") : null;
    const toNumber = b.To && !b.To.startsWith("client:") ? b.To : null;
    const status = b.CallStatus || b.DialCallStatus || b.Status || null;
    const duration = b.CallDuration ? parseInt(b.CallDuration,10) : null;

    await pool.query(
      `INSERT INTO calls (sid, from_username, to_username, to_number, status, duration)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [sid, from || null, toClient, toNumber, status, duration]
    );
    res.status(200).send("OK");
  }catch(e){
    console.error(e);
    res.status(500).send(e.message);
  }
};
