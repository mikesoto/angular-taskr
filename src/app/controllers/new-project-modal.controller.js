angular.module('angularTaskr')
.controller('npModal.Controller', function($scope, $uibModalInstance, projects) {
		
		var vm = this;
		//create the empty new_project object
		//these key/values will be binded in the form with ng-model
		vm.new_project  = { 
			id : '',
			codename : '',
			name : '',
			dev_url : '',
			prod_url : '',
			repository : '',
			description : ''
		};

		//function to fire when ok button is clicked
		vm.saveNewProj = function() {
			//set all errors to false
			vm.error_newProj_name = false;
			vm.error_newProj_codename = false;
			vm.form_error = false;
			//validate each field
			if(!vm.new_project.name){
				vm.error_newProj_name = true;
				vm.form_error = true;
				angular.element("#new_proj_form #name").focus();
			}
			else if(!vm.new_project.codename){
				vm.error_newProj_codename = true;
				vm.form_error = true;
				angular.element("#new_proj_form #codename").focus();
			}
			//check that the codename (id) is unique
			else {
				projects.forEach(function(proj){
					if(vm.new_project.codename == proj.id){
						vm.error_newProj_codename_unique = true;
						vm.form_error = true;
						angular.element("#new_proj_form #codename").focus();
					}
					//if is unique, add the codename as the id for project
					if(!vm.form_error == true){
						vm.new_project.id = vm.new_project.codename
					}
				});
			}
			//send the new_project object back to the project controller (which created this instance)
			if(!vm.form_error){
				$uibModalInstance.close(vm.new_project);
			}
		};
		//function to fire when the cancel button is clicked
		vm.dismiss = function(reason) {
			$uibModalInstance.dismiss(reason);
		};
});
