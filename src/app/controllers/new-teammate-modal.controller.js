angular.module('angularTaskr')
.controller('nteamModal.Controller', function($log, $scope, $http, $uibModalInstance, cur_teammates) {
		
		var vm = this;
		vm.apiURL = 'http://localhost:3005/';
		vm.teammates = cur_teammates;
		//create the empty new_teammate object
		//these key/values will be binded in the form with ng-model
		vm.new_teammate  = { 
			id : '',
			first_name : '',
			last_name : '',
			company : '',
			email : '',
			phone : '',
			description : '',
			email_hash : ''
		};

		//verifies that the new userId is unique
		vm.checkIsUnique = function(nteamId){
			var isUnique = true;
			if(nteamId == ''){
				//is first time so return false to generate the first id
				isUnique = false;
			}else{
				vm.teammates.forEach(function(tm){
					if(nteamId == tm.id){
						isUnique = false;
					}
				});
			}
			return isUnique;
		}

		//function to fire when ok button is clicked
		vm.saveNewTeam = function() {
			//set all errors to false
			vm.error_newTeam_first_name = false;
			vm.error_newTeam_last_name = false;
			vm.form_error = false;
			//validate each field
			$log.info('checking for errrors');
			if(!vm.new_teammate.first_name){
				$log.error('first_name is blank');
				vm.error_newTeam_first_name = true;
				vm.form_error = true;
				angular.element("#new_teammate_form #first_name").focus();
			}
			else if(!vm.new_teammate.last_name){
				$log.error('last_name is blank');
				vm.error_newTeam_last_name = true;
				vm.form_error = true;
				angular.element("#new_teammate_form #last_name").focus();
			}
			else {
				var nteamId = '';
				//generate new ids for the new teammate until it is unique
				while(!vm.checkIsUnique(nteamId)){
					nteamId = (vm.new_teammate.first_name.substring(0,2) + vm.new_teammate.last_name.substring(0,2) + vm.new_teammate.company.substring(0,2)).toLowerCase() + Math.floor( ( Math.random() * 98) + 1);
				}
				vm.new_teammate.id = nteamId;
				$log.info('id generated : '+nteamId);

				//set the email_hash attribute for gravatars
				if(angular.element("#email").val() != ''){
					var tm_email = angular.element("#email").val().toLowerCase();
				}else{
					tm_email = 'none@none.com';
				}
				angular.element("#email_hash").val( CryptoJS.MD5( tm_email.trim() ) );
				vm.new_teammate.email_hash = angular.element("#email_hash").val();
				$log.info('new email hash : '+vm.new_teammate.email_hash);
			}
			
			//send the new_teammate object back to the teammates controller (which created this instance)
			if(!vm.form_error){
				$uibModalInstance.close(vm.new_teammate);
			}
		};

		//function to fire when the cancel button is clicked
		vm.dismiss = function(reason) {
			$uibModalInstance.dismiss(reason);
		};
});
