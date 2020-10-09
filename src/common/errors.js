class GMError extends Error {
  constructor(baseError, ...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GMError);
    }
    this.name = 'GMError';
    this.baseError = baseError;
  }
}

module.exports = GMError;
