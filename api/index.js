// Vercel serverless entry: ekspor app Express dari server.js.
// server.js hanya memanggil app.listen saat dijalankan langsung (require.main === module),
// jadi aman di-require di sini dan diekspor sebagai handler serverless.
module.exports = require('../server');
