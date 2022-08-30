class customError extends Error {
	//personal recommendation of Hitesh sir, just go with the classic error new error(message) : no need to overwrite the constructor and all
	constructor(message, code) {//overwriting the constructor
		super(message);
		this.code = code;
	}
}

// https://nodejs.org/api/errors.html#new-errormessage-options

module.exports = customError;