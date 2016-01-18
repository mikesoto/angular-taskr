angular.module('angularTaskr')
.controller('projCtrl.Controller', projectsCtrl);

function projectsCtrl($scope, $http, $uibModal, $log, tasks, projects) {
	//set controller vars
	var vm = this;
	vm.apiURL = 'http://localhost:3005/';
	vm.activeAct = 'projlist';
	var tasks_service = new tasks(), //instantiate the tasks service
			tasks_promise = tasks_service.getTasks();
	tasks_promise.success(function(data) {
		vm.tasks = data;
	});

	vm.getProjList = function(cached){
		if (typeof cached === 'undefined') { cached = false; }
		if(cached && vm.projects.length){
			vm.displayProjList();
		}
		else{
			//get all projects from api
			projects.success(function(data) {
				vm.projects = data;
				vm.displayProjList();
			});
		}
	}    

	vm.displayProjList = function(){
		vm.activeAct = 'projlist';
		angular.element(".editProjFormContainer").hide();
		angular.element(".projListContainer").show();
	}

	//show or hide a project details section
	vm.showProjDesc = function(projectid){
		var target = angular.element('#details_'+projectid);
		if( target.hasClass('hide') ){
			target.removeClass('hide');
		}else{
			target.addClass('hide');
		}
	};

	//send project to delete
	vm.deleteProject = function(projID){
		//check if the project has any active tasks
		tasks_promise.success(function(data) {
			var hasTasks = false;
			vm.tasks = data;
			for(var i = 0; i < vm.tasks.length; i++){
				if(vm.tasks[i].id === projID){  
					alert("This project still has open tasks. Please Delete all tasks for this project before deleting it.");
					hasTasks = true;
					return false;
				}
			}

			if(!hasTasks){
				if( confirm("Are you sure you want to delete this project?") ){
					var req = {
						method: 'DELETE',
						url: vm.apiURL+'projects/'+projID
					}
					$http(req).then(function(response){
						//delete project object from current projects list
						vm.dropProj(response.data.projectid);
						$log.info("project: "+response.data.projectid+" deleted");
						//use cached version of the project list
						vm.getProjList(true);
					}, function(err){
						$log.error('error deleting project: '+err);
					});
				}
			}
		});

		
	}

	//removes a project from the cached projects list by id
	vm.dropProj = function(projectid){
		//find the project id in the list
		for(var i=0; i < vm.projects.length; i++){
			if(vm.projects[i].id == projectid){
				//remove this project from the list
				vm.projects.splice(i, 1);
			}
		}
	}


	//function to get project from projects list
	vm.getProjByID = function(projectID){
		if(vm.projects){
			for(var i=0; i < vm.projects.length; i++){
				if(vm.projects[i].id === projectID){
					return vm.projects[i];
				}
			}
		}
		return false;
	}

	//edit an existing project
	vm.editProject = function(projectID){
		vm.edit_proj = vm.getProjByID(projectID);
		vm.displayEditProject();
	}

	vm.displayEditProject = function(){
		vm.activeAct = 'projlist';
		angular.element(".editProjFormContainer").show();
		angular.element(".newProjFormContainer").hide();
		angular.element(".projListContainer").hide();
	};

	//updates an existing project in the cached projects list
	vm.alterProj = function(projObj,old_id){
		//find matching project id in the list
		for(var i=0; i < vm.projects.length; i++){
			if(vm.projects[i].id == old_id){
				$log.info("found project "+old_id+" in memory, updating");
				//update all the project values with tne new ones
				vm.projects[i].id = projObj.id;
				vm.projects[i].codename = projObj.codename;
				vm.projects[i].name = projObj.name;
				vm.projects[i].dev_url = projObj.dev_url;
				vm.projects[i].prod_url = projObj.prod_url;
				vm.projects[i].repository = projObj.repository;
				vm.projects[i].description = projObj.description;
				return true;
			}
		}
		return false;
	}

	//open the new proj modal 
	vm.openNewProjModal = function() {
		vm.activeAct = 'projform';
		//create a new instance of a modal using uibModal service
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: '/app/templates/modal-new-proj-form.html',
			controller: 'npModal.Controller',
			controllerAs: 'ntModal',
			size: 'lg',
			resolve: {
				//send existing projects to check unique values
				projects: function(){
					return vm.projects
				}
			}
		});

		//function to run at the end of modal promise
		modalInstance
			.result
				.then(function(new_proj){
					vm.sendNewProj(new_proj);
				},function(reason){
					$log.info("New proj modal canceled reason: "+reason);
					vm.activeAct = 'projlist';
				});
	};

	//process the new project form
	vm.sendNewProj = function(new_proj){
		var req = {
			method: 'POST',
			url: vm.apiURL+'projects/',
			data: { new_proj : new_proj }
		}
		$http(req).then(function(response){
			angular.element("#new_proj_form").trigger('reset');
			$log.info("new project: "+ response.data.newproj.id + " created");
			//add to projlist manually
			vm.injectProj(response.data.newproj);
			//use cached version of the projects list
			vm.getProjList(true);
		}, function(err){
			$log.error('error sending new project: '+err);
		});
	}

	//inserts a new project into the cached project list
	vm.injectProj = function(projObj){
		//inject new project object into projects list
		vm.projects.push(projObj);
	}

	//open the edit project modal 
	vm.openEditProjModal = function(edit_proj_id) {
		vm.activeAct = 'projlist';
		//set the main controllers edit_project to the clicked project
		vm.edit_proj = vm.getProjByID(edit_proj_id);
		//create a new instance of a modal using uibModal service
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: '/app/templates/modal-edit-project-form.html',
			controller: 'epModal.Controller',
			controllerAs: 'epModal',
			size: 'lg',
			resolve: {
				projects: function(){
					return vm.projects;
				},
				tasks: function(){
					return vm.tasks;
				},
				edit_proj : function(){
					//create a copy of the current edit_proj so that we don't change its data-binded values
					var modal_edit_proj = {
						id : vm.edit_proj.id,
						name : vm.edit_proj.name,
						codename : vm.edit_proj.codename,
						dev_url : vm.edit_proj.dev_url,
						prod_url : vm.edit_proj.prod_url,
						repository: vm.edit_proj.repository,
						description: vm.edit_proj.description
					}
					//return the copy, not the actual project
					return modal_edit_proj;
				}
			}
		});

		//function to run at the end of modal promise
		modalInstance
			.result
				.then(function(data){ //this is the modal's close function
					vm.sendEditProj(data.edited_proj, data.old_id);
					//clear the edit_proj data
					vm.edit_proj = {};
					//reset the edit_proj_form
					angular.element("#edit_proj_form").trigger('reset');
				},function(reason){
					$log.info("Edit proj modal canceled reason: "+reason);
					vm.activeAct = 'projlist';
				});
	}

	vm.sendEditProj = function(edited_proj,old_id){
		$log.info("sending data to "+vm.apiURL+"projects/"+old_id);
		var editProjData = angular.toJson(edited_proj),
				proj_id = old_id;
		var req = {
			method: 'PUT',
			url: vm.apiURL+'projects/'+old_id,
			data: {edited_proj : editProjData}
		}
		$log.info('data package:');
		$log.info({edited_proj : editProjData});
		$http(req).then(function(response){
			$log.info('received response data:');
			$log.info(response.data);
			angular.element("#new_proj_form").trigger('reset');
			//update in projects list manually
			if(vm.alterProj(response.data,old_id)){
				$log.info("project "+ proj_id + " updated");
				//use cached version of the projects list
				vm.getProjList(true);
			}
		}, function(err){
			$log.error('error updating project:');
			$log.error(err);
		});
	}




	vm.getProjList();
	vm.displayProjList();

}