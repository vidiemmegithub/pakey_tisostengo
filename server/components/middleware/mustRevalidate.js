module.exports = function nocache(req, res, next) {
  res.header('Cache-Control', 'private, must-revalidate');
  res.header('Expires', '-1');
  next();
};
