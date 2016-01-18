angular.module('angularTaskr')
.controller('gitModal.Controller', function($scope, $uibModalInstance, $log, $document, $window, gtask, project) {
	
	var vm = this;
	vm.gtask  = gtask;
	vm.project = project;

	vm.selectPRText = function(){
		$log.info('selecting text');
		var text = $document[0].getElementById('pr-text'),
			range, 
			selection;    
		if ($document[0].body.createTextRange) {
			range = $document[0].body.createTextRange();
			range.moveToElementText(text);
			range.select();
		}else if ($window.getSelection) {
			selection = $window.getSelection();        
			range = $document[0].createRange();
			range.selectNodeContents(text);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}

	//function to fire when ok button is clicked
	vm.close = function() {
		$uibModalInstance.close();
	};
	//function to fire when the cancel button is clicked
	vm.dismiss = function(reason) {
		$uibModalInstance.dismiss(reason);
	};
});
