await logAction(req.user, "�deme ald�", {
  masa: req.body.tableName,
  tutar: req.body.total,
  �deme: req.body.paymentType,
});
