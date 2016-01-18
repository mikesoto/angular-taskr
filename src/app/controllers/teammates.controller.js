angular.module('angularTaskr')
.controller('teamCtrl.Controller', teammatesCtrl);

function teammatesCtrl($scope, $http, $log, $uibModal) {
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

	//show or hide a teammate details section
	vm.showTeamDesc = function(teammateID){
		var target = angular.element('#details_'+teammateID);
		if( target.hasClass('hide') ){
			target.removeClass('hide');
		}else{
			target.addClass('hide');
		}
	};

	vm.displayTeamList = function(){
		vm.activeAct = 'teamlist';
		angular.element(".editTeamFormContainer").hide();
		angular.element(".newTeamFormContainer").hide();
		angular.element(".teamListContainer").show();
	}

	//open the new teammate modal 
	vm.openNewTeamModal = function() {
		vm.activeAct = 'teamform';
		//create a new instance of a modal using uibModal service
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: '/app/templates/modal-new-team-form.html',
			controller: 'nteamModal.Controller',
			controllerAs: 'nteamModal',
			size: 'lg',
			resolve: {
				//send existing teammates to check unique values
				cur_teammates: function(){
					return vm.teammates;
				}
			}
		});
		//function to run at the end of modal promise
		modalInstance
			.result
				.then(function(new_team){
					vm.sendNewTeam(new_team);
				},function(reason){
					$log.info("New teammate modal canceled reason: "+reason);
					vm.activeAct = 'teamlist';
				});
	};

	

	//process the new teammate form
	vm.sendNewTeam = function(new_team){
		$log.info('sending new teammate: ');
		$log.info(new_team);
		var req = {
			method: 'POST',
			url: vm.apiURL+'teammates/',
			data: new_team
		}
		$http(req).then(function(response){
			angular.element("#new_teammate_form").trigger('reset');
			vm.injectTeam(response.data);
			vm.getTeamList(true);
		}, function(err){
			$log.error('error sending new teammate:');
			$log.error(err);
		});
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
		vm.edit_teammate = vm.getTeammateByID(teammateID);
		vm.openEditTeammateModal();
	}

	//open the edit teammate modal 
	vm.openEditTeammateModal = function() {
		vm.activeAct = 'teamlist';
		//create a new instance of a modal using uibModal service
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: '/app/templates/modal-edit-teammate-form.html',
			controller: 'eteamModal.Controller',
			controllerAs: 'eteamModal',
			size: 'lg',
			resolve: {
				//send existing teammates to check unique values
				cur_teammates: function(){
					return vm.teammates;
				},
				edit_teammate: function(){
					return vm.edit_teammate;
				}
			}
		});
		//function to run at the end of modal promise
		modalInstance
			.result
				.then(function(edit_teammate){
					vm.sendEditTeam(edit_teammate);
				},function(reason){
					$log.info("Edit teammate modal canceled reason: "+reason);
				});
	};

	//inserts a new teammate into the cached teammate list
	vm.injectTeam = function(teamObj){
		//inject new teammate object into teammate list
		vm.teammates.push(teamObj);
	}

	vm.sendEditTeam = function(edit_teammate){			
		var req = {
			method: 'PUT',
			url: vm.apiURL+'teammates/'+edit_teammate.id,
			data: edit_teammate
		}
		$http(req).then(function(response){
			$log.log(response.data);
			//clear the edit team data and form
			vm.edit_teammate = {};
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
