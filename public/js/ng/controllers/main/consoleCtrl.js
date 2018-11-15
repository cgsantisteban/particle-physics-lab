"use strict"

lab.controller('ConsoleCtrl', function ($rootScope,$scope, geantCommandsService, socket) {
	
	 
	
	let commandList = geantCommandsService.getCommandList();
	
	$scope.geantCommands_tree = angular.copy(commandList);
		
	$scope.nodeCopy = {
			node: null,
			isCopy: false
	}
	$scope.$watch( 'gamosTree.currentNode', function( newObj, oldObj ) {
	    if( $scope.gamosTree && angular.isObject($scope.gamosTree.currentNode) ) {
	        
	        /*if($scope.abc.currentNode.type === 'command'){
	        	$scope.nodeCopy = {
	        			cmd: $scope.abc.currentNode,
	        			isCopy: false
	        	}
	        }else{
	        	$scope.nodeCopy = {
	        			cmd: null,
	        			isCopy: false
	        	}
	        }*/
	    }
	}, false);
	
	
	$scope.copyCommand = function(node){
		
		if(node.type === 'command'){
			let cmd = node.route + node.command;
			
			$scope.nodeCopy = {
        			cmd: cmd,
        			isCopy: true
        	}
		}
	}
	
	$scope.getState = function(stateList){
		let prompt = $rootScope.termData.term.prompt;
		let state = prompt.substring(0, prompt.length-1);
		
		let isAvailable = true;
		if(stateList.indexOf('all')<0){
			if(stateList.indexOf(state)<0) isAvailable = false;
		}
		
		
		return isAvailable;
	}
	
	
	socket.on('exp:ErrorConsole',(error)=>{
		console.log('ErrorConsole-->',error);
	})
	
	
	
	$scope.getEvidenceInfos = function(evidence, event) {
		let pastedData = event.originalEvent.clipboardData;
		
	}
	
	
	
	
});
