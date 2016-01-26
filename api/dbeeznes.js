var assert = require('assert');
module.exports = {
	//function to create a new document to a collection
	createDoc : function(db, collect_name, doc_obj, callback) {
	   db.collection(collect_name)
	   	.insertOne( doc_obj, function(err, result) {
	    	assert.equal(err, null);
	    	console.log("Inserted a document into the " + collect_name + " collection.");
	    	callback(result);
	  	});
	},
	//function to read documents in a collection
	readDoc : function(db, collect_name, query_params, sort_params, callback) {
		//an empty find will return all docs in a collection
		var cursor = db.collection( collect_name )
									.find( query_params )
									.sort( sort_params );
		callback( cursor );
	},
	//function to update a document in a collection
	updateDoc : function(db, collect_name, filter_params, update_params, type, callback) {
	  if(type == "single"){
	  	db.collection( collect_name )
		   	.updateOne( filter_params, update_params, function(err, results) {
		      console.log('matched: '+results.matchedCount);
	  			console.log('modified: '+results.modifiedCount);
		      callback(results);
		  	});
		}
		if(type == "many"){
			db.collection( collect_name )
		   	.updateMany( filter_params, update_params, function(err, results) {
		      console.log('matched: '+results.matchedCount);
	  			console.log('modified: '+results.modifiedCount);
		      callback(results);
		  	});
		}
	},
	//function to remove a documents that match the remove condition. 
	//To remove all documents from a collection, pass an empty filter_params {} to the deleteMany method.
	deleteDoc : function(db, collect_name, filter_params, type, callback) {
	  if(type == "single"){
		  db.collection( collect_name )
		   	.deleteOne( filter_params,function(err, results) {
		       console.log('deleted: '+results.deletedCount);
		       callback(results);
		  	});
		}
		if(type == "many"){
			db.collection( collect_name )
		   	.deleteMany( filter_params,function(err, results) {
		       console.log('deleted: '+results.deletedCount);
		       callback(results);
		  	});
		}
	},
	//function to replace a document in a collection
	//After the update, the document only contains the field or fields in the replacement document.
	replaceDoc : function(db, collect_name, filter_params, update_params, callback) {
  	db.collection( collect_name )
	   	.replaceOne( filter_params, update_params, function(err, results) {
	      console.log('matched: '+results.matchedCount);
  			console.log('modified: '+results.modifiedCount);
	      callback(results);
	  	});
	},

	//function to delete an entire collection 
	deleteCollection : function(db, collect_name, callback) {
	  db.collection( collect_name ).drop( function(err, response) {
      console.log(response);
      callback();
	  });
	},

	//function to match by query, group by key:value and report count for each one
	aggregateCollect : function(db, collect_name, match_params, groupBy, callback) {
	  db.collection( collect_name ).aggregate(
	    [
	     	{ $match: match_params },
	      { $group: { "_id": "$"+groupBy, "count": { $sum: 1 } } }
	    ]
	  ).toArray(function(err, result) {
	    assert.equal(err, null);
	    console.log(result);
	    callback(result);
	  });
	},
	//function to create an index (1 ascending, -1 descending)
	//createIndex only creates an index if the index does not exist.
	makeIndex : function(db, collect_name, index_params, callback) {
  	db.collection( collect_name )
  		.createIndex( index_params, null, function(err, results) {
	        console.log(results);
	        callback(results);
	    });
	}
};