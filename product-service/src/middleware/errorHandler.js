const errorHandler = (err, _req, res, _next) => {
  console.error(err.stack || err.message);
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;
