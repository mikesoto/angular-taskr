angular.module('angularTaskr')
.controller('ntModal.Controller', function($scope, $uibModalInstance, options) {
		
		var vm = this;
		vm.projectOptions = options.projects;
		vm.teammateOptions = options.teammates;
		vm.statusOptions = options.status;
		vm.priorityOptions = options.priority;
		vm.new_task  = { 
			internal_id : '',
			url : 'http://manoderecha.net/md/index.php/task/',
			weight : 99,
			status : 'pending',
			priority : '1',
			description : '',
			solution : ''
		};

		//automatically adds the internal id to the end of the URL
		vm.updateTaskURL = function(){
			vm.new_task.url = 'http://manoderecha.net/md/index.php/task/' + vm.new_task.internal_id;
			//resets to default value if the user blanks out the field
			if( typeof(vm.new_task.internal_id) === 'undefined' ){
				vm.new_task.url = 'http://manoderecha.net/md/index.php/task/';
			}
		}

		//function to fire when ok button is clicked
		vm.saveNewTask = function() {
			//set all errors to false
			vm.error_newTask_project = false;
			vm.error_newTask_intID = false;
			vm.error_newTask_title = false;
			vm.error_newTask_assigned = false;
			vm.form_error = false;
			//validate each field
			if(!vm.new_task.project){
				vm.error_newTask_project = true;
				vm.form_error = true;
				angular.element("#new_task_form #project").focus();
			}
			else if(!vm.new_task.internal_id){
				vm.error_newTask_intID = true;
				vm.form_error = true;
				angular.element("#new_task_form #internal_id").focus();
			}
			else if(!vm.new_task.title){
				vm.error_newTask_title = true;
				vm.form_error = true;
				angular.element("#new_task_form #title").focus();
			}
			else if(!vm.new_task.assigned){
				vm.error_newTask_assigned = true;
				vm.form_error = true;
				angular.element("#new_task_form #assigned").focus();
			}
			//send the new_task object back to the main controller (which created this instance)
			if(!vm.form_error){
				$uibModalInstance.close(vm.new_task);
			}
		};
		//function to fire when the cancel button is clicked
		vm.dismiss = function(reason) {
			$uibModalInstance.dismiss(reason);
		};
});
