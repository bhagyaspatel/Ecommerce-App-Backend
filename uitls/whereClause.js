// Base - product.find()
// bigQ - search=coder&page=2&limit=5&category=shortsleeve&rating[gte]=4&price[lte]=9000&price[gte]=199
//bigQ = req.query - which is actually an object like this :


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

	filter() { //for applying filter like price range, brand..(everything from BigQ excluding "search", "page" and "limit")

		//copying bigQ object to copyQ
		let copyQ = this.bigQ;

		//removing extra key-value pairs from object-copyQ
		delete copyQ["search"];
		delete copyQ["page"];
		delete copyQ["limit"];

		//replacing gte/lte/gt/lt to $gte.. using regex

		//converting json object to string to apply regex on it
		let stringOfcopyQ = JSON.stringify(copyQ);

		stringOfcopyQ = stringOfcopyQ.replace(/\b(gte | lte | gt | lt)\b/g, m => `$${m}`);
		copyQ = JSON.parse(stringOfcopyQ);

		this.base = this.base.find(copyQ);
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

module.exports = WhereClause;