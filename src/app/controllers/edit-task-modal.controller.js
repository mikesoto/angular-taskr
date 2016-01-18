angular.module('angularTaskr')
.controller('etModal.Controller', function($scope, $uibModalInstance, options, edit_task) {
		
		var vm = this;
		vm.projectOptions = options.projects;
		vm.teammateOptions = options.teammates;
		vm.statusOptions = options.status;
		vm.priorityOptions = options.priority;
		//edit_task if a copy of vm.edit_task so as not to change binded values for the actual task
		vm.edit_task  = edit_task;

		//automatically adds the internal id to the end of the URL
		vm.updateTaskURL = function(){
			vm.edit_task.url = 'http://localhost:3000/#/task/' + vm.edit_task.internal_id;
			//resets to default value if the user blanks out the field
			if( typeof(vm.edit_task.internal_id) === 'undefined' ){
				vm.edit_task.url = 'http://localhost:3000/#/task/';
			}
		}

		//function to fire when ok button is clicked
		vm.saveEditTask = function(edited_task) {
			//set all errors to false
			vm.error_editTask_project = false;
			vm.error_editTask_intID = false;
			vm.error_editTask_title = false;
			vm.error_editTask_assigned = false;
			vm.form_error = false;
			//validate each field
			if(!edited_task.project){
				vm.error_editTask_project = true;
				vm.form_error = true;
				angular.element("#edit_task_form #edit_project").focus();
			}
			else if(!edited_task.internal_id){
				vm.error_editTask_intID = true;
				vm.form_error = true;
				angular.element("#edit_task_form #edit_internal_id").focus();
			}
			else if(!edited_task.title){
				vm.error_editTask_title = true;
				vm.form_error = true;
				angular.element("#edit_task_form #edit_title").focus();
			}
			else if(!edited_task.assigned){
				vm.error_editTask_assigned = true;
				vm.form_error = true;
				angular.element("#edit_task_form #edit_assigned").focus();
			}
			//send the edit_task object back to the main controller (which created this instance)
			if(!vm.form_error){
				$uibModalInstance.close(edited_task);
			}
		};
		//function to fire when the cancel button is clicked
		vm.dismiss = function(reason) {
			$uibModalInstance.dismiss(reason);
		};
});
