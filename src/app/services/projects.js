angular.module('angularTaskr')
.factory('projects', function($http){ 
	//get all projects data from api
	return $http.get('http://localhost:3005/projects')
			.success(function(data) { 
				return data; 
			}) 
			.error(function(err) { 
				return err; 
			}); 
});