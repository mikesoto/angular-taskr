angular.module('angularTaskr')
.controller('epModal.Controller', function($scope, $uibModalInstance, $log, projects, tasks, edit_proj) {
		
		var vm = this;
		vm.projects = projects;
		vm.tasks = tasks;
		//edit_proj is a copy of vm.edit_proj so as not to change binded values for the actual task
		vm.edit_proj  = edit_proj;
		//sent with the closing function to identify the project by its original id
		vm.old_id = vm.edit_proj.id;

		//function to fire when ok button is clicked
		vm.saveEditProj = function(edited_proj) {
			//set all errors to false
			vm.error_editProj_name = false;
			vm.error_editProj_codename = false;
			vm.error_editProj_codename_unique = false;
			vm.error_editProj_codename_idInUse = false;
			vm.form_error = false;
			//validate each field
			if(!edited_proj.name){
				vm.error_editProj_name = true;
				vm.form_error = true;
				angular.element("#edit_proj_form #edit_name").focus();
			}
			else if(!edited_proj.codename){
				vm.error_editProj_codename = true;
				vm.form_error = true;
				angular.element("#edit_proj_form #edit_codename").focus();
			}

			//if the user is trying to change the project id
			else if(vm.edit_proj.codename != vm.edit_proj.id){
				$log.warn("user requesting codename/id change for project");
				$log.info("Old id: " + vm.edit_proj.id + " New id: " + vm.edit_proj.codename);
				//check to make sure the given codename is unique (not existing in current projects)
				$log.info("checking if unique");
				var isUnique = true;
				vm.projects.forEach(function(proj){
					if(isUnique){
						$log.info('checking '+ vm.edit_proj.codename.toLowerCase() + " against " + proj.id.toLowerCase());
						if(vm.edit_proj.codename.toLowerCase() == proj.id.toLowerCase()){
							vm.error_editProj_codename_unique = true;
							vm.form_error = true;
							angular.element("#edit_proj_form #edit_codename").focus();
							$log.error("Error: new id is NOT unique");
							isUnique = false;
						}
					}
				});
				if(isUnique){
					$log.info('new project id is unique');
					$log.info('checking if old id is in use');
					//check to make sure the current project id is not active in any tasks
					vm.tasks.forEach(function(task){
						//check if there are any ACTIVE tasks with the OLD project id
						if(vm.edit_proj.id == task.project && task.status != 'completed'){
							vm.error_editProj_codename_idInUse = true;
							$log.error("Error: old id in use by open tasks");
							vm.form_error = true;
							angular.element("#edit_proj_form #edit_codename").focus();
						}
					});
				}
				//if there are no active tasks with their project id set to the old project id, continue
				if(!vm.form_error){
					$log.info("no tasks using old project id, setting new id for project");
					vm.edit_proj.id = vm.edit_proj.codename;
				}
			}
			if(!vm.form_error){
				//log the final object which will be sent to the project controller's close function for this modal
				$log.info("ready to send edited project");
				$log.info(vm.edit_proj);
				//send the edit_proj object back to the main controller (which created this instance)
				$uibModalInstance.close({ edited_proj: vm.edit_proj, old_id : vm.old_id });
			}else{
				$log.error("Error found, project not sent");
			}
		};
		//function to fire when the cancel button is clicked
		vm.dismiss = function(reason) {
			$uibModalInstance.dismiss(reason);
		};
});
