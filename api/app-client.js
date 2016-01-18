var $ = require("jquery");
var displayTasks = require("./lib/displayTasks");

$(document).ready(function(){
  //get the json tasks data
  $.ajax({
      url : '/tasks',
      type : 'GET'
  })
  .done( function(data){
    displayTasks(data);
  })
  .fail( function( jqXHR, textStatus, errorThrown ) {
      console.log( 'AJAX failed', jqXHR.getAllResponseHeaders(), textStatus, errorThrown);
  });

/* ----------------------------------------------------------*/
  //set the submit event for the add-task-form
  $("#add-task-form").submit(function(event){
  	event.preventDefault();
    //save the formdata to send
  	formData = $("#add-task-form").serialize();
    //reset the form
  	$("#add-task-form").trigger('reset');
  	//send ajax post request to the api
  	$.ajax({
  		url: '/tasks',
  		data: formData,
  		type: 'POST'
  	})
  	.done( function(data){
      //the api should return the new updated data to display
  		displayTasks(data);
  	})
  	.fail( function( jqXHR, textStatus, errorThrown ) {
      console.log( 'AJAX failed', jqXHR.getAllResponseHeaders(), textStatus, errorThrown);
  	});
  });

/* ----------------------------------------------------------*/
  //set the delete task button click event
  $("body").on('click','.delete-task-btn',function(){
   del_task = $(this).attr('data-task');
   console.log('delete '+del_task);
   //send ajax post request to the api
   $.ajax({
     url: '/tasks/'+del_task,
     data: {task : del_task},
     type: 'DELETE'
   })
   .done( function(data){
     displayTasks(data);
   })
   .fail( function( jqXHR, textStatus, errorThrown ) {
      console.log( 'AJAX failed', jqXHR.getAllResponseHeaders(), textStatus, errorThrown);
   });
  });

/* ----------------------------------------------------------*/
  //set the edit task button click event
	$("body").on('click','.edit-task-btn',function(){
		edt_task = $(this).attr('data-task');
		new_title = 'some new title';
		console.log('edit '+edt_task+ ': '+new_title);
		//send ajax put request to the api
  	$.ajax({
  		url: '/tasks/'+edt_task,
  		data: {title : new_title},
  		type: 'PUT'
  	})
  	.done( function(data){
  		displayTasks(data);
  	})
  	.fail( function( jqXHR, textStatus, errorThrown ) {
      console.log( errorThrown);
  	});
	});

	

});