angular.module('angularTaskr')
.factory('tasks', function($http, $log){ 
	
	return function(){
		//Constants for status select (new and edit task forms)
		self.priorityOptions = [
			{level:'0',name:'All'},
			{level:'1',name:'urgent'},
			{level:'2',name:'high'},
			{level:'3',name:'medium'},
			{level:'4',name:'low'}
		];

		//Constants for status select (new and edit task forms)
		self.statusOptions = [
			'All',
			'pending',
			'need-info',
			'approval',
			'teammate',
			'review-dev',
			'review-prod',
			'deploy-dev',
			'deploy-prod',
			'completed',
			'ongoing'
		];

		function init(){
			$log.info("tasks service instantiated")
		}

		self.getTasks = function(){
			return $http.get('http://localhost:3005/tasks') 
				.success(function(data) { 
					self.formatWeights(data);
					return data;
				}) 
				.error(function(err) { 
					$log.error(err);
				});
		}

		self.getStatIcon = function(status){
			var stat_class;
			switch(status){
				case 'pending':
					stat_class = 'fa fa-clock-o';
					break;
				case 'need-info':
					stat_class = 'fa fa-question-circle';
					break;
				case 'approval':
					stat_class = 'fa fa-money';
					break;
				case 'teammate':
					stat_class = 'fa fa-user';
					break;
				case 'review-dev':
					stat_class = 'fa fa-eye-slash';
					break;
				case 'review-prod':
					stat_class = 'fa fa-eye';
					break;
				case 'deploy-dev':
					stat_class = 'fa fa-paper-plane-o';
					break;
				case 'deploy-prod':
					stat_class = 'fa fa-rocket';
					break;
				case 'completed':
					stat_class = 'fa fa-check-square-o';
					break;
				case 'ongoing':
					stat_class = 'fa fa-refresh';
					break;
			}
			return stat_class;
		}

		//format the task weights as type number to avoid errors with ng-model
		self.formatWeights = function(tasks){
			for(var i=0;i<tasks.length;i++){
				tasks[i].weight = parseInt(tasks[i].weight);
			}
			return tasks;
		}

		self.getPriorityIcon = function(priority){
			var class_txt = '';
			switch(parseInt(priority)){
				case 1:
					class_txt = 'fa fa-bomb';
					break;
				case 2:
					class_txt = 'fa fa-hourglass-end';
					break;
				case 3:
					class_txt = 'fa fa-hourglass-half';
					break;
				case 4:
					class_txt = 'fa fa-hourglass-start';
					break;
			}
			return class_txt;
		}

		self.getPiorityName = function(task_level){
			for( var i = 0; i < self.priorityOptions.length; i++ ){
				if(self.priorityOptions[i].level == task_level){
					return self.priorityOptions[i].name;
				}
			}
			return '';
		}

		self.getTaskByID = function(taskID,tasks){
			if(tasks.length){
				for(var i=0; i < tasks.length; i++){
					if(tasks[i].id === taskID){
						return tasks[i];
					}
				}
			}
			return false;
		}

		self.toggleTaskAssigned = function(task_id){
			if(angular.element("#assigned_select_"+task_id).hasClass('hide')){
				angular.element("#assigned_select_"+task_id).removeClass('hide');
				angular.element("#assigned_img_"+task_id).addClass('hide');
			}else
			{
				angular.element("#assigned_select_"+task_id).addClass('hide');
				angular.element("#assigned_img_"+task_id).removeClass('hide');
			}
		}

		self.toggleTaskStatus = function(task_id){
			if(angular.element("#status_select_"+task_id).hasClass('hide')){
				angular.element("#status_select_"+task_id).removeClass('hide');
				angular.element("#status_icon_"+task_id).addClass('hide');
			}else
			{
				angular.element("#status_select_"+task_id).addClass('hide');
				angular.element("#status_icon_"+task_id).removeClass('hide');
			}
		}

		self.toggleTaskPriority = function(task_id){
			if(angular.element("#priority_select_"+task_id).hasClass('hide')){
				angular.element("#priority_select_"+task_id).removeClass('hide');
				angular.element("#priority_icon_"+task_id).addClass('hide');
			}else
			{
				angular.element("#priority_select_"+task_id).addClass('hide');
				angular.element("#priority_icon_"+task_id).removeClass('hide');
			}
		}

		self.filterOut = function(tproject,tassigned,tstatus,tpriority,at_arr){
			var filterOut = false;
			//if project filter is set and this task does not match the value
			if(at_arr.filt_proj != 'none' && at_arr.filt_proj !== tproject){
				filterOut = true;
			}
			//if assigned filter is set and this task does not match the value
			if(at_arr.filt_assig != 'none' && at_arr.filt_assig !== tassigned){
				filterOut = true;
			}
			//if status filter is set and this task does not match the value
			if(at_arr.filt_stat != 'All' && at_arr.filt_stat !== tstatus){
				filterOut = true;
			}
			//if priority filter is set and this task does not match the value
			if(at_arr.filt_prio != '0' && at_arr.filt_prio !== tpriority){
				filterOut = true;
			}
			return filterOut;
		} 




		init();
		return self;
	}

});