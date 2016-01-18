var $ = require("jquery");

module.exports = function displayTasks(tasks){
	//clear out the tasks container
	$("#tasks-container").html('');
	if(tasks.length){
		tasks.forEach(function(task){
			if(task){
	  		taskstring = '<div class="task-item">';
	  		taskstring+=   '<p><label>' + task.internal_id + '</label> : ' + task.title + ' <button class="edit-task-btn" data-task="' + task.id + '">Update</button> | <button class="delete-task-btn" data-task="' + task.id + '">x</button></p>';
	  		taskstring+= '</div>';
	  		$("#tasks-container").append(taskstring);
	  	}
  	});
  }else{
  	$("#tasks-container").html('<h3 style="text-align:center;">There are no tasks :(</h3>');
  }	
};