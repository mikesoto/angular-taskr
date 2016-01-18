angular.module('angularTaskr')
.factory('teammates', function($http){ 
	//get all teammates data from api
	return $http.get('http://localhost:3005/teammates')
			.success(function(data) { 
				return data; 
			}) 
			.error(function(err) { 
				return err; 
			}); 
});