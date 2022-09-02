// Base - product.find()
// bigQ - search=coder&page=2&category=shortsleeve&rating[gte]=4&price[lte]=9000&price[gte]=199

const { search } = require("../routes/product");

class WhereClause {
	constructor(base, bigQ) {
		this.base = base,
			this.bigQ = bigQ;
	}

	//handeling search functionality (search=coder)
	// Base - product.find(name : {"bhagya"})
	search() {
		const searchWord = this.bigQ.search ? {
			name: {
				$regex: this.bigQ.search,
				$options: 'i'
			}
		} : {};

		this.base = this.base.find({ ...searchWord }); //product.find(name : {"bhagya"}) created
		return this;
	}

	pager(resultPerPage) {
		let currentPage = 1;

		if (this.bigQ.page) {
			currentPage = this.bigQ.page;
		}

		//formula to determine skip value : number of records to be skipped before next stage
		const skipVal = resultPerPage * (currentPage - 1);

		this.base = this.base.limit(resultPerPage).skip(skipVal);
		//limit value : number of records to pass to the next page

		return this;
	}
}