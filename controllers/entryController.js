const entryService = require("../services/entryService");

exports.createEntry = async (req, res) => {
  try {
    const entry = await entryService.createEntry(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserEntries = async (req, res) => {
  const entries = await entryService.getEntriesByUser(req.params.userId);
  res.json({ success: true, data: entries });
};