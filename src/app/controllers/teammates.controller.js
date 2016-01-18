angular.module('angularTaskr')
.controller('teamCtrl.Controller', teammatesCtrl);

function teammatesCtrl($scope, $http, $log) {
	//set controller vars
	var vm = this;
	vm.apiURL = 'http://localhost:3005/';
	vm.activeAct = 'teamlist';

	vm.getTeamList = function(cached){
		if (typeof cached === 'undefined') { cached = false; }
		if(cached && vm.teammates.length){
			vm.displayTeamList();
		}
		else{
			//get all teammates
			$http.get(vm.apiURL+'teammates/').then(function(response){
				vm.teammates = response.data;
				vm.displayTeamList();
			});
		}
	}    

	vm.displayTeamForm = function(){
		vm.activeAct = 'teamform';
		angular.element(".newTeamFormContainer").show();
		angular.element(".teamListContainer").hide();
	}

	vm.displayTeamList = function(){
		vm.activeAct = 'teamlist';
		angular.element(".editTeamFormContainer").hide();
		angular.element(".newTeamFormContainer").hide();
		angular.element(".teamListContainer").show();
	}

	vm.displayEditTeammate = function(){
		vm.activeAct = 'teamlist';
		angular.element(".editTeamFormContainer").show();
		angular.element(".newTeamFormContainer").hide();
		angular.element(".teamListContainer").hide();
	};

	//show or hide a teammate details section
	vm.showTeamDesc = function(teammateID){
		var target = angular.element('#details_'+teammateID);
		if( target.hasClass('hide') ){
			target.removeClass('hide');
		}else{
			target.addClass('hide');
		}
	};

	//process the new teammate form
	vm.sendNewTeam = function(){
		vm.error_newTeam_first_name = false;
		vm.error_newTeam_last_name = false;
		vm.form_error = false;
		if(angular.element("#first_name").val() == ''){
			vm.error_newTeam_first_name = true;
			vm.form_error = true;
		}
		else if(angular.element("#last_name").val() == ''){
			vm.error_newTeam_last_name = true;
			vm.form_error = true;
		}
		//set the email_hash attribute for gravatars
		if(angular.element("#email").val() != ''){
			var tm_email = angular.element("#email").val().toLowerCase();
			angular.element("#email_hash").val( CryptoJS.MD5( tm_email.trim() ) );
		}

		if(!vm.form_error){
			vm.newTeamData = {
				email_hash : angular.element("#email_hash").val(),
				first_name :	angular.element("#first_name").val(),
				last_name :	angular.element("#last_name").val(),
				company :	angular.element("#company").val(),
				email :	angular.element("#email").val(),
				phone :	angular.element("#phone").val(),
				description :	angular.element("#description").val()
			};

			var req = {
				method: 'POST',
				url: vm.apiURL+'teammates/',
				data: vm.newTeamData
			}
			$http(req).then(function(response){
				angular.element("#new_teammate_form").trigger('reset');
				$log.log(response);
				vm.injectTeam(response.data);
				vm.getTeamList(true);
			}, function(err){
				$log.error('error sending new teammate:');
				$log.error(err);
			});
		}
	}

	//send teammate to delete
	vm.deleteTeammate = function(teamID){
		if( confirm("Are you sure you want to delete this teammate?") ){
			var req = {
				method: 'DELETE',
				url: vm.apiURL+'teammates/'+teamID
			}
			$http(req).then(function(response){
				$log.info('Teammate '+teamID+' deleted');
				vm.dropTeammate(response.data.teamid);
				vm.getTeamList(true);
			}, function(err){
				$log.error('error deleting teammate: ')
				$log.error(err);
			});

		}
	}

	//removes a teammate from the cached teammate list by id
	vm.dropTeammate = function(teammateID){
		//find the teammate id in the list
		for(var i=0; i < vm.teammates.length; i++){
			if(vm.teammates[i].id == teammateID){
				//remove this teammate from the list
				vm.teammates.splice(i, 1);
			}
		}
	}

	//function to get teammate from teammates list
	vm.getTeammateByID = function(teammateID){
		if(vm.teammates){
			for(var i=0; i < vm.teammates.length; i++){
				if(vm.teammates[i].id === teammateID){
					return vm.teammates[i];
				}
			}
		}
		return false;
	}

	//edit an existing teammate
	vm.editTeam = function(teammateID){
		vm.edit_team = vm.getTeammateByID(teammateID);
		vm.displayEditTeammate();
	}

	//inserts a new teammate into the cached teammate list
	vm.injectTeam = function(teamObj){
		//inject new teammate object into teammate list
		vm.teammates.push(teamObj);
	}

	vm.sendEditTeam = function(){
		vm.edit_form_error = false;
		vm.error_editTeam_first_name = false;
		vm.error_editTeam_last_name = false;
		if(angular.element("#edit_first_name").val() == ''){
			vm.error_editTeam_first_name = true;
			vm.edit_form_error = true;
		}
		else if(angular.element("#edit_last_name").val() == ''){
			vm.error_editTeam_last_name = true;
			vm.edit_form_error = true;
		}
		if(!vm.edit_form_error){
			//set the email_hash attribute for gravatars
			if(angular.element("#edit_email").val() != ''){
				var clean_mail = angular.element("#edit_email").val().toLowerCase();
				angular.element("#edit_email_hash").val( CryptoJS.MD5( clean_mail.trim() ) );
				console.log('email_hash : '+angular.element("#edit_email_hash").val() );
			}else {
				email_hash = CryptoJS.MD5("none@none.com");
			}
			var edit_taskID = angular.element("#edit_team_id").val();
			vm.editTeamData = {
				id : edit_taskID,
				email_hash : angular.element("#edit_email_hash").val(),
				first_name :	angular.element("#edit_first_name").val(),
				last_name :	angular.element("#edit_last_name").val(),
				company :	angular.element("#edit_company").val(),
				email :	angular.element("#edit_email").val(),
				phone :	angular.element("#edit_phone").val(),
				description :	angular.element("#edit_description").val()
			};

			var req = {
				method: 'PUT',
				url: vm.apiURL+'teammates/'+edit_taskID,
				data: vm.editTeamData
			}
			$http(req).then(function(response){
				$log.log(response);
				//clear the edit team data and form
				vm.edit_team = {};
				angular.element("#edit_team_form").trigger('reset');
				//update the teamlist manually
				vm.alterTeam(response.data);
				//use cached version of the team list
				vm.getTeamList(true);
			}, function(err){
				$log.error('error sending edit teammate:');
				$log.error(err);
			});

		}
	}

	//updates a existing teammate in the cached teammates list
	vm.alterTeam = function(teamObj){
		//find matching teammate id in the list
		for(var i=0; i < vm.teammates.length; i++){
			if(vm.teammates[i].id == teamObj.id){
				//update all the teammates values with tne new ones
				vm.teammates[i].first_name = teamObj.first_name;
				vm.teammates[i].last_name = teamObj.last_name;
				vm.teammates[i].company = teamObj.company;
				vm.teammates[i].email = teamObj.email;
				vm.teammates[i].phone = teamObj.phone;
				vm.teammates[i].description = teamObj.description;
			}
		}
	}


	vm.getTeamList();
	vm.displayTeamList();

}
