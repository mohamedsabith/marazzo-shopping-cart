const jwt = require('jsonwebtoken');

const verifyAdminToken = (req, res, next) => {
  try {
    const token = req.cookies.Admintoken;

    if (!token) {
      res.redirect('/admin');
    } else {
      const decoded = jwt.verify(token, process.env.ADMIN_JWT_TOKEN);
      req.admin = decoded;
      next();
    }
  } catch (error) {
    res.clearCookie('Admintoken');
    res.status(400).send('Invalid token');
  }
};

module.exports = verifyAdminToken;
