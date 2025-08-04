await logAction(req.user, "ödeme aldý", {
  masa: req.body.tableName,
  tutar: req.body.total,
  ödeme: req.body.paymentType,
});
