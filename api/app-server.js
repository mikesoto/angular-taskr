var express = require('express');
var fs = require('fs');
var path = require('path');
var cors = require('cors');
var bodyParser = require('body-parser');

/* Setup the Database Dependacies */
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');
var dbeez = require('./dbeeznes');

//the url to connect to the local mongo database
var mongo_url = 'mongodb://localhost:27017/taskr';

MongoClient.connect(mongo_url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to Local Mongo DB server on port 27017");
 //  index_params = { "cuisine": 1, "address.zipcode": -1 };
	// dbeez.makeIndex(db, 'restaurants', index_params, function(results){
 //  	db.close();
 //  });
});

/* create express application instance*/
var app = express();

/* Read the current tasks data from data/tasks.json */
var data_file = path.join(__dirname, 'data', 'tasks.json');
var tasks = [];
fs.readFile(data_file, "UTF-8", function(err, contents){
	if(contents){
		tasks = JSON.parse(contents);
	}
});
/* Read the current projects data from data/projects.json */
var data_file = path.join(__dirname, 'data', 'projects.json');
var projects = [];
fs.readFile(data_file, "UTF-8", function(err, contents){
	if(contents){
		projects = JSON.parse(contents);
	}
});
/* Read the current teammates data from data/teammates.json */
var data_file = path.join(__dirname, 'data', 'teammates.json');
var teammates = [];
fs.readFile(data_file, "UTF-8", function(err, contents){
	if(contents){
		teammates = JSON.parse(contents);
	}
});

/* parse any json or url-encoded data sent in any requests*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

/* log the details about each request.*/
app.use(function(req, res, next){
	console.log(`${req.method} request for ${req.url}`);
	next();
});

/* start static file server in ./public */
app.use(express.static("./public"));
//use cors FUNCTION to allow cross-origin-resource-sharing
app.use(cors());

//=========================================================
//==================== GET DATA ===========================
//=========================================================


//=============== GET Endpoint for tasks ===============
app.get("/tasks", function(req, res){


	/* respond with json data */
	res.json(tasks); 
});


//=============== GET Endpoint for projects ===============
app.get("/projects", function(req, res){
	/* respond with json data */
	res.json(projects); 
});


//=============== GET Endpoint for teammates ===============
app.get("/teammates", function(req, res){
	/* respond with json data */
	res.json(teammates); 
});



//=========================================================
//==================== POST DATA ==========================
//=========================================================



//=============== POST Endpoint for Tasks =============== 
app.post("/tasks",cors(), function(req, res){
	console.log('received post data:');
	console.log(req.body);
	//extract the new_task object from the post body
	ntask = JSON.parse(req.body.new_task);
	//make a new datetime string for the created attribute
	var now = new Date();
	var created = [ [ now.getFullYear(), padZero(now.getMonth()+1),  padZero(now.getDate()) ].join("-"), [ padZero(now.getHours()),  padZero(now.getMinutes()),  padZero(now.getSeconds()) ].join(":") ].join(" ");
	//Pads given value to the left with "0"
	function padZero(num) {
	  return (num >= 0 && num < 10) ? "0" + num : num + "";
	}
	//add the id and created key/value to the ntask object
	ntask.id = ntask.internal_id;
	ntask.created = created;
	ntask.due_date = null;
	//push the new task into the tasks data array
	tasks.push(ntask);
	//update the tasks.json file with the new data
	fs.writeFile('./data/tasks.json',JSON.stringify(tasks), function(err){
		if(err){
			throw(err);
		}
		console.log('Tasks Data File Updated');
	});
	//respond with the new task json string
	res.json({newtask: ntask});
});




//=============== POST Endpoint for Projects ===============
app.post("/projects",cors(), function(req, res){
	console.log('received post data:');
	console.log(req.body.new_proj);
	//the new project object from the post body
	nproj = req.body.new_proj;
	//push the new project into the projects data array
	projects.push(nproj);
	//update the projects.json file with the new data
	fs.writeFile('./data/projects.json',JSON.stringify(projects), function(err){
		if(err){
			throw(err);
		}
		console.log('Projects Data File Updated');
	});
	//respond with the new project json string
	res.json({newproj: nproj});
});



//=============== POST Endpoint for Teammates ===============
app.post("/teammates",cors(), function(req, res){
	console.log('received post data:');
	console.log(req.body);
	//the new teammate object from the post body
	nteam = req.body;
	//push the new teammate into the teammates data array
	teammates.push(nteam);
	//update the teammates.json file with the new data
	fs.writeFile('./data/teammates.json',JSON.stringify(teammates), function(err){
		if(err){
			throw(err);
		}
		console.log('Teammates Data File Updated');
	});
	//respond with the new teammate json string
	res.json(nteam);
});



//=========================================================
//==================== DELETE DATA ========================
//=========================================================



//=============== DELETE Endpoint for Tasks =============== 
app.delete("/tasks/:id",cors(), function(req, res){
	console.log(`received delete parameter: task `+req.params.id);
	/* filters the task out	*/
	tasks = tasks.filter(function(task){
		return task.id !== req.params.id;
	}); 
	//update the tasks.json file with the new data
	fs.writeFile('./data/tasks.json',JSON.stringify(tasks), function(err){
		if(err){
			throw(err);
		}
		console.log('Tasks Data File Updated');
	});
	//respond with deleted taskid
	res.json({taskid : req.params.id});
});



//=============== DELETE Endpoint for Projects =============== 
app.delete("/projects/:id",cors(), function(req, res){
	/* filters the project out	*/
	projects = projects.filter(function(project){
		return project.id !== req.params.id;
	}); 
	//update the projects.json file with the new data
	fs.writeFile('./data/projects.json',JSON.stringify(projects), function(err){
		if(err){
			throw(err);
		}
		console.log('Projects Data File Updated');
	});
	//respond with deleted projectid
	res.json({projectid : req.params.id});
});



//=============== DELETE Endpoint for Teammates =============== 
app.delete("/teammates/:id",cors(), function(req, res){
	console.log(`received delete parameter: teammate `+req.params.id);
	/* filters the teammate out	*/
	teammates = teammates.filter(function(teammate){
		return teammate.id !== req.params.id;
	}); 
	//update the teammates.json file with the new data
	fs.writeFile('./data/teammates.json',JSON.stringify(teammates), function(err){
		if(err){
			throw(err);
		}
		console.log('Teammates Data File Updated');
	});
	//respond with deleted teammateid
	res.json({teamid : req.params.id});
});



//=========================================================
//==================== PUT DATA ========================
//=========================================================


//=============== PUT Endpoint for Tasks =============== 
app.put("/tasks/:id",cors(), function(req, res){
	console.log('received put data:'+req.body.edited_task);
	console.log(req.body);
	/* update the matching task */
	for(var i = 0; i < tasks.length; i++){
		if(tasks[i].id === req.params.id){
			console.log('task '+req.params.id+' exists, updating task data');
			//update the task
			tasks[i] = JSON.parse(req.body.edited_task);
		}
	}
	//update the tasks.json file with the new data
	fs.writeFile('./data/tasks.json',JSON.stringify(tasks), function(err){
		if(err){
			throw(err);
		}
		console.log('Tasks Data File Updated');
	}); 
	//set the response to the updated json data
	res.json(req.body.edited_task);
}); 



//=============== PUT Endpoint for Projects =============== 
app.put("/projects/:id",cors(), function(req, res){
	console.log('received put data:');
	console.log(req.body);
	edited_project = JSON.parse(req.body.edited_proj);
	/* update the matching project */
	for(var i = 0; i < projects.length; i++){
		if(projects[i].id === req.params.id){
			console.log('project '+req.params.id+' exists, updating project data');
			projects[i] = edited_project;
			break;
		}
	}
	//update the projects.json file with the new data
	fs.writeFile('./data/projects.json',JSON.stringify(projects), function(err){
		if(err){
			throw(err);
		}
		console.log('Projects Data File Updated');
	}); 
	// set the response to the updated json data
	res.json(edited_project);
}); 



//=============== PUT Endpoint for teammates =============== 
app.put("/teammates/:id",cors(), function(req, res){
	console.log('received put data:');
	console.log(req.body);
	/* update the matching teammate */
	for(var i = 0; i < teammates.length; i++){
		if(teammates[i].id === req.params.id){
			console.log('teammate '+req.params.id+' exists, updating teammate data');
			//update the teammate
			edited_teammate = {
				id: req.body.id,
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				company: req.body.company,
				email: req.body.email,
				phone: req.body.phone,
				description: req.body.description,
				email_hash: req.body.email_hash
			};
			teammates[i] = edited_teammate;
		}
	}
	console.log(edited_teammate);
	//update the teammates.json file with the new data
	fs.writeFile('./data/teammates.json',JSON.stringify(teammates), function(err){
		if(err){
			throw(err);
		}
		console.log('Teammates Data File Updated');
	}); 
	//set the response to the updated json data
	res.json(edited_teammate);
}); 

/* listen on port 3005 */
app.listen(3005);
console.log("Express API running on port 3005");

/* export module */
module.exports = app;