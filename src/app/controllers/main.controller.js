angular.module('angularTaskr')
.controller('mainCtrl.Controller', mainCtrl);

function mainCtrl($scope, $http, $uibModal, $timeout, $log, tasks, projects, teammates) {
	//set controller vars
	var vm = this,
			tasks_service = new tasks(); //instantiate the tasks service
	vm.activeAct = 'tasklist';//determines which action menu button is set to active
	vm.apiURL = 'http://localhost:3005/';//base url to api
	vm.tasksLoaded = false; //controls display of loading animation
	
	vm.statusOptions = tasks_service.statusOptions;//Constants for status select (new and edit task forms)
	vm.priorityOptions = tasks_service.priorityOptions;//Constants for status select (new and edit task forms)
	vm.filtersOn = false;//variable to control show and hide of filters 
	vm.filter_project = 'none'; //set current filter by project attribute
	vm.filter_assigned = 'none'; //set current filter by assigned attribute
	vm.filter_status = 'All'; //set current filter by status attribute
	vm.filter_priority = '0'; //set current filter by priority

	//function to get task list from api using the tasks service
	vm.getTaskList = function(cached){
		//if cached than use the current list in memory
		if(cached && vm.tasks.length){
			vm.tasks = vm.tasks;
			vm.activeAct = 'tasklist';
		}
		else{
			//get all task items from the tasks service once the page is loaded
			angular.element(document).ready(function () {
				$timeout(function(){
					tasks_service.getTasks().success(function(data) {
						vm.tasks = data;
						vm.activeAct = 'tasklist';
						vm.tasksLoaded = true;
					});
				},500,true);
			});
		}
	}

	//function to get Project Options from api
	vm.getProjectOptions = function(){
		//get all projects data from the projects service
		projects.success(function(data) {
			vm.projectOptions = data;
			//add the all projects filter option
			vm.projectOptions.unshift({id:"none",name:"All"});
		});
	}

	//function to get Teammate Options from api
	vm.getTeammateOptions = function(){
		//get all teammates data from the teammates service
		teammates.success(function(data){
			vm.teammateOptions = data;
			//add the all teammates filter option
			vm.teammateOptions.unshift({id:"none",first_name:"All"});
		});
	}


	vm.getStatIcon = function(status){
		return tasks_service.getStatIcon(status);
	}

	vm.getPiorityIcon = function(priority){
		return tasks_service.getPriorityIcon(priority);
	}

	vm.getPiorityName = function(task_level){
		return tasks_service.getPiorityName(task_level);
	}

	//function to get task from task list
	vm.getTaskByID = function(taskID){
		return tasks_service.getTaskByID(taskID,vm.tasks);
	}

	//function to get project from project options list
	vm.getProjectByID = function(projID){
		if(vm.projectOptions){
			for(var i=0; i < vm.projectOptions.length; i++){
				if(vm.projectOptions[i].id === projID){
					return vm.projectOptions[i];
				}
			}
		}
		return false;
	}

	//function to get teammate from teammate options list
	vm.getTeammateByID = function(teammateID){
		if(vm.teammateOptions){
			for(var i=0; i < vm.teammateOptions.length; i++){
				if(vm.teammateOptions[i].id === teammateID){
					return vm.teammateOptions[i];
				}
			}
		}
		return false;
	}

	vm.toggleTaskAssigned = function(task_id){
		tasks_service.toggleTaskAssigned(task_id);
	}

	vm.toggleTaskStatus = function(task_id){
		tasks_service.toggleTaskStatus(task_id);
	}

	vm.toggleTaskPriority = function(task_id){
		tasks_service.toggleTaskPriority(task_id);
	}

	//toggles filter form
	vm.toggleFilterForm = function(){
		vm.filtersOn = !vm.filtersOn;
	}

	//filter out a task based on user configuration
	vm.filterOut = function(tproject,tassigned,tstatus,tpriority){
		var status_arr = { 
			filt_proj: vm.filter_project, 
			filt_assig: vm.filter_assigned, 
			filt_stat: vm.filter_status, 
			filt_prio: vm.filter_priority 
		};
		return tasks_service.filterOut(tproject,tassigned,tstatus,tpriority,status_arr);
	} 
	
	//show or hide a task details section
	vm.showTaskDesc = function(taskid){
		var target = angular.element('#details_'+taskid);
		if( target.hasClass('open') ){
			target.removeClass('open');
		}else{
			target.addClass('open');
		}
	};

	//process the new task form
	vm.sendNewTask = function(new_task){
		vm.newTaskData = angular.toJson(new_task);
		var req = {
			method: 'POST',
			url: vm.apiURL+'tasks/',
			data: {new_task : vm.newTaskData}
		}
		$http(req).then(function(response){
			angular.element("#new_task_form").trigger('reset');
			$log.info("new task created");
			//add to tasklist manually
			vm.injectTask(response.data.newtask);
			//use cached version of the task list
			vm.getTaskList(true);
		}, function(err){
			$log.error('error sending new task: '+err);
		});
	}

	vm.sendEditTask = function(edited_task){
		var editTaskData = angular.toJson(edited_task),
				task_id = edited_task.id;
		var req = {
			method: 'PUT',
			url: vm.apiURL+'tasks/'+task_id,
			data: {edited_task : editTaskData}
		}
		$http(req).then(function(response){
			angular.element("#new_task_form").trigger('reset');
			$log.info("task updated");
			//add to tasklist manually
			vm.alterTask(angular.fromJson(response.data));
			//use cached version of the task list
			vm.getTaskList(true);
		}, function(err){
			$log.error('error updating task: '+err);
		});
	}

	//updates a existing task in the cached task list
	vm.alterTask = function(taskObj){
		//find matching task id in the list
		for(var i=0; i < vm.tasks.length; i++){
			if(vm.tasks[i].id == taskObj.id){
				//update all the task values with tne new ones
				vm.tasks[i].project = taskObj.project;
				vm.tasks[i].internal_id = taskObj.internal_id;
				vm.tasks[i].url = taskObj.url;
				vm.tasks[i].title = taskObj.title;
				vm.tasks[i].assigned = taskObj.assigned;
				vm.tasks[i].description = taskObj.description;
				vm.tasks[i].solution = taskObj.solution;
				vm.tasks[i].priority = taskObj.priority;
				vm.tasks[i].weight = parseInt(taskObj.weight);
				vm.tasks[i].status = taskObj.status;
				//remove from list if completed
				if(taskObj.status == 'completed'){
					vm.dropTask(taskObj.id);
					return;
				}
			}
		}
	}

	//shortcut to edit task attributes directly from the list item
	vm.quickSet = function(taskid,attr){
		//get the new value for the attr
		var new_val = angular.element("#task_"+taskid+" ."+attr+"-select").val(),
				//get the task by id
				edt_task = vm.getTaskByID(taskid);
		if(attr == 'weight'){
			new_val = parseInt(new_val);
		}
		
		//remove the hashkey attribute used by angular
		delete edt_task['$$hashKey'];
		//update the attr for that task
		edt_task[attr] = new_val;
		//show the uploading icon for this task
		angular.element("#updating_"+taskid).fadeIn();
		//convert the edt_task in json format
		var editTaskData = angular.toJson(edt_task);
		//send the edit task to the api
		var req = {
			method: 'PUT',
			url: vm.apiURL+'tasks/'+taskid,
			data: {edited_task : editTaskData}
		}
		$http(req).then(function(response){
			var doneTask = angular.fromJson(response.data);
			//update the tasklist in memory
			vm.alterTask(doneTask);
			//hide the uploading icon for this task
			angular.element("#updating_"+taskid).fadeOut();
			//toggle the task assigned gravatar back
			if(attr ==='assigned'){
				vm.toggleTaskAssigned(taskid);
			}
			//toggle the task status icon back
			if(attr ==='status'){
				vm.toggleTaskStatus(taskid);
			}
			//toggle the task priority icon back
			if(attr ==='priority'){
				//vm.toggleTaskPriority(taskid);
				//>>>TODO find out why the toggle for this isn't working
				//hide the select box for this tasks priority
				angular.element("#priority_select_"+taskid).addClass('hide');
				//show the icon for this tasks priority
				angular.element("#priority_icon_"+taskid).removeClass('hide');
			}
			//remove from list if completed
			if(attr === 'status' && new_val === 'completed'){
				vm.dropTask(doneTask.id);
			}
			//use cached version of the task list
			vm.getTaskList(true);
		}, function(err){
			$log.error('error updating task: '+err);
		});
	}

	//inserts a new task into the cached task list
	vm.injectTask = function(taskObj){
		taskObj.weight = parseInt(taskObj.weight);
		//inject new task object into tasks list
		vm.tasks.push(taskObj);
	}
		
	//removes a task from the cached task list by id
	vm.dropTask = function(taskid){
		//find the task id in the list
		for(var i=0; i < vm.tasks.length; i++){
			if(vm.tasks[i].id == taskid){
				//remove this task from the list
				vm.tasks.splice(i, 1);
			}
		}
	}

	//send task to delete
	vm.deleteTask = function(taskid){
		if( confirm("Are you sure you want to delete this task?") ){
			var req = {
				method: 'DELETE',
				url: vm.apiURL+'tasks/'+taskid
			}
			$http(req).then(function(response){
				//delete task object from current tasks list
				vm.dropTask(response.data.taskid);
				$log.info("task: "+response.data.taskid+" deleted");
				//use cached version of the task list
				vm.getTaskList(true);
			}, function(err){
				$log.error('error deleting task: '+err);
			});
		}
	}

	//shorten long titles in task list
	vm.cutTitle = function(task_title){
		var cut = '';
		if(task_title){
			if(task_title.length > 80){
			cut = task_title.substring(0,80)+' ...';
			}else{
				cut = task_title;
			}
			return cut;
		}
	}

	//open the new task modal 
	vm.openNewTaskModal = function() {
		vm.activeAct = 'taskform';
		//create a new instance of a modal using uibModal service
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: '/app/templates/modal-new-task-form.html',
			controller: 'ntModal.Controller',
			controllerAs: 'ntModal',
			size: 'lg',
			resolve: {
				options: function(){
					return {
						projects : vm.projectOptions,
						teammates : vm.teammateOptions,
						status : vm.statusOptions,
						priority : vm.priorityOptions
					};
				}
			}
		});

		//function to run at the end of modal promise
		modalInstance
			.result
				.then(function(new_task){
					vm.sendNewTask(new_task);
				},function(reason){
					$log.info('canceled new task reason: '+reason);
					vm.activeAct = 'tasklist';
				});
	};

	//open the edit task modal 
	vm.openEditTaskModal = function(edit_task_id) {
		vm.activeAct = 'tasklist';
		//set the main controllers edit_task to the clicked task
		vm.edit_task = vm.getTaskByID(edit_task_id);
		//create a new instance of a modal using uibModal service
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: '/app/templates/modal-edit-task-form.html',
			controller: 'etModal.Controller',
			controllerAs: 'etModal',
			size: 'lg',
			resolve: {
				options: function(){
					return {
						projects : vm.projectOptions,
						teammates : vm.teammateOptions,
						status : vm.statusOptions,
						priority : vm.priorityOptions
					}
				},
				edit_task : function(){
					//create a copy of the current edit_task so that we don't change its data-binded values
					var modal_edit_task = {
						id : vm.edit_task.id,
						title : vm.edit_task.title,
						description : vm.edit_task.description,
						solution : vm.edit_task.solution,
						created : vm.edit_task.created,
						assigned: vm.edit_task.assigned,
						project: vm.edit_task.project,
						priority: vm.edit_task.priority,
						weight: vm.edit_task.weight,
						status: vm.edit_task.status,
						internal_id: vm.edit_task.internal_id,
						url: vm.edit_task.url
					}
					//return the copy, not the actual task
					return modal_edit_task;
				}
			}
		});

		//function to run at the end of modal promise
		modalInstance
			.result
				.then(function(edited_task){ //this is the promise's .close function
					vm.sendEditTask(edited_task);
					//clear the edit_task data
					vm.edit_task = {};
					//reset the edit_task_form
					angular.element("#edit_task_form").trigger('reset');
				},function(reason){
					$log.info('canceled edit task reason: '+reason);
					vm.activeAct = 'tasklist';
				});
	};

	//open the git task modal 
	vm.openGitTaskModal = function(task_id) {
		//set the gtask to the clicked task
		var gtask = vm.getTaskByID(task_id);
		//create a new instance of a modal using uibModal service
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: '/app/templates/modal-task-git-pr.html',
			controller: 'gitModal.Controller',
			controllerAs: 'gtModal',
			size: 'lg',
			resolve: {
				gtask : function(){
					return gtask;
				},
				project: function(){
					var projObj = vm.getProjectByID(gtask.project);
					return projObj;
				} 
			}
		});

		//function to run at the end of modal promise
		modalInstance
			.result
				.then(function(){ //this is the promise .close function
					//no callback functionality
				},function(reason){
					$log.info('canceled git modal reason: '+reason);
				});
	};

	//fire functions to build page once loaded
	vm.getProjectOptions();
	vm.getTeammateOptions();
	vm.getTaskList();
}  