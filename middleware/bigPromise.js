//options we have : try-catch & asyn-await || use-Promise everywhere

module.exports = func => (req, res, next) =>
	Promise.resolve(func(req, res, next)).catch(next);