module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  res.status(200).json({
    status: "ok",
    message: "Football Live API работает!",
    time: new Date().toISOString()
  });
};
