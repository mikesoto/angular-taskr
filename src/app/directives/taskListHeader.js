angular.module('angularTaskr')
.directive('taskListHeader', function() {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'app/templates/taskListHeader.html'
	}
});