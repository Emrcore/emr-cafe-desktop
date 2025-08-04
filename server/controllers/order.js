const logAction = require("../utils/logAction");

async function createOrder(req, res) {
  // ...sipariþ oluþturma kodlarý
  await logAction(req.user, "sipariþ oluþturdu", {
    masa: req.body.tableName,
    ürünler: req.body.items,
  });
}
