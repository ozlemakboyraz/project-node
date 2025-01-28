var express = require('express');
var router = express.Router();

// Kullanıcı doğrulama fonksiyonu
const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader === "Bearer some-token") {
    next(); // Kullanıcı doğrulandı, bir sonraki middleware'e geç
  } else {
    res.status(401).json({ success: false, error: "You are not authenticated" });
  }
};

// GET isteği
router.get('/', function (req, res) {
  res.json({ success: true, message: "Categories route is working" });
});

module.exports = router;
