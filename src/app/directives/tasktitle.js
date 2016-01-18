(function() {
  'use strict';

angular.module('angularTaskr')
.directive('tasktitle', function(){
		return {
			restrict: 'E',
			scope: {
				url: '=',
				codename: '=',
				intid: '=',
				cuttitle: '='
			},
			templateUrl: 'app/templates/tasktitle.html'
		}
	});

})();