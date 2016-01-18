angular.module('angularTaskr', ['ngResource', 'ui.router', 'ui.bootstrap']);

angular.module('angularTaskr').config(routerConfig);

/** @ngInject */
function routerConfig($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: 'app/templates/main.html',
			controller: 'mainCtrl.Controller',
			controllerAs: 'main'
		})
		.state('projects', {
			url: '/projects',
			templateUrl: 'app/templates/projects.html',
			controller: 'projCtrl.Controller',
			controllerAs: 'proj'
		})
		.state('teammates', {
			url: '/teammates',
			templateUrl: 'app/templates/teammates.html',
			controller: 'teamCtrl.Controller',
			controllerAs: 'team'
		});

	$urlRouterProvider.otherwise('/');
}