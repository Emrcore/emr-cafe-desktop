const Log = require("../models/Log");

async function logAction(user, action, details = {}) {
  try {
    await Log.create({
      userId: user._id,
      username: user.username,
      role: user.role,
      action,
      details,
    });
  } catch (err) {
    console.error("Log kayd� hatas�:", err.message);
  }
}

module.exports = logAction;
