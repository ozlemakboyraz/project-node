const express = require('express');
const router = express.Router();
const fs = require("fs");

// Geçerli dizindeki tüm dosyaları oku
let routes = fs.readdirSync(__dirname);

for (let route of routes) {
  // Sadece ".js" dosyalarını kontrol et ve "index.js" dosyasını atla
  if (route.endsWith(".js") && route !== "index.js") {
    const routePath = `/${route.replace(".js", "")}`; // Yol: "/auditlogs" gibi
    router.use(routePath, require(`./${route}`)); // Dosyayı bağla
  }
}

module.exports = router;
