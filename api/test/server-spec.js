//require the cheerios module
var cheerio = require("cheerio");
var request = require("supertest");
var expect = require("chai").expect;
var rewire = require("rewire");
var app = rewire("../server");

describe("Dictionary App", function(){
	/*	now instead of just invoking the done function when our get
			request completes, we will actually run the callback function that 
			supertest gives us so that we can check the data returned. The first arg
			is any errors and the secon arg is the response object
			There is a module called cheerio which will alow us to inspect the 
			response html using jquery syntax. Once we have installed and imported 
			the module, we can use it here 
			 */
	it("loads the homepage", function(done){
		request(app).get("/").expect(200).end(function(err, res){
			/* assign the response html dom to a $ variable so we can 
				search it just like in a jquery DOM*/
			var $ = cheerio.load(res.text);
			/* we are going to check the html header title value */
			var pageHeading = $("body>h1").text();
			expect(pageHeading).to.equal("French Dictionary");
			done();
		});
	});

	describe("Terms API", function(){
		beforeEach(function(){
			
			this.defs = [
				{
					term: "One",
					def: "Term One defined"
				},
				{
					term: "Two",
					def: "Term Two defined"
				}
			];
			
			app.__set__("frenchTerms",this.defs);
		});

		it("GETs dictionary API",function(done){
			/*we will use the supertest callback function again to check the 
			terms variable returned by the get request. 
			first we need to protect the defs variable so that it doesn't fall
			out of scope when we enter the supertest callback function and check it */
			var defs = this.defs;
			request(app).get("/dictionary").expect(200).end(function(err,res){
				//set a variable to an array of the json response
				var terms = JSON.parse(res.text);
				/* now we can expect the response array object to be the same as our 
					protected mock data object. we use deep.equal to compare two full
					objects.*/
					expect(terms).to.deep.equal(defs);
					/* call the mocha done function to let it know that the supertest test 
					is complete*/
					done();
			});
		});

		it("POSTs dictionary API",function(done){
			request(app)
				.post("/dictionary")
				.send({"term": "Two","def":"Term Two defined"})
				.expect(200)
				.end(done);
		});

		it("DELETEs dictionary API", function(done){
			request(app)
				.delete("/dictionary/One")
				.expect(200)
				.end(done);
		});

		it("PUTs dictionary API", function(done){
			request(app)
				.put("/dictionary/Two")
				.send({"def":"Term Two defined again"})
				.expect(200)
				.end(done);
		});

	});
});