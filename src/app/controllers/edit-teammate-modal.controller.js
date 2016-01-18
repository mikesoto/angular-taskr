angular.module('angularTaskr')
.controller('eteamModal.Controller', function($log, $scope, $http, $uibModalInstance, cur_teammates, edit_teammate) {
		
		var vm = this;
		vm.teammates = cur_teammates;
		//create the empty new_teammate object
		//these key/values will be binded in the form with ng-model
		vm.edit_teammate  = edit_teammate;

		//function to fire when ok button is clicked
		vm.saveEditTeammate = function() {
			//set all errors to false
			vm.error_editTeam_first_name = false;
			vm.error_editTeam_last_name = false;
			vm.form_error = false;
			//validate each field
			$log.info('checking for errrors');
			if(!vm.edit_teammate.first_name){
				$log.error('first_name is blank');
				vm.error_editTeam_first_name = true;
				vm.form_error = true;
				angular.element("#edit_teammate_form #edit_first_name").focus();
			}
			else if(!vm.edit_teammate.last_name){
				$log.error('last_name is blank');
				vm.error_editTeam_last_name = true;
				vm.form_error = true;
				angular.element("#edit_teammate_form #edit_last_name").focus();
			}
			else {
				//set the email_hash attribute for gravatars
				if(angular.element("#edit_email").val() != ''){
					var tm_email = angular.element("#edit_email").val().toLowerCase();
				}else{
					tm_email = 'none@none.com';
				}
				angular.element("#edit_email_hash").val( CryptoJS.MD5( tm_email.trim() ) );
				vm.edit_teammate.email_hash = angular.element("#edit_email_hash").val();
				$log.info('new email hash : '+vm.edit_teammate.email_hash);
			}
			
			//send the edit_teammate object back to the teammates controller (which created this instance)
			if(!vm.form_error){
				$uibModalInstance.close(vm.edit_teammate);
			}
		};

		//function to fire when the cancel button is clicked
		vm.dismiss = function(reason) {
			$uibModalInstance.dismiss(reason);
		};
});
