const logAction = require("../utils/logAction");

async function createOrder(req, res) {
  // ...sipari� olu�turma kodlar�
  await logAction(req.user, "sipari� olu�turdu", {
    masa: req.body.tableName,
    �r�nler: req.body.items,
  });
}
