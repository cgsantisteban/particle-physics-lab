
"use strict"

lab.controller('ActionCtrl',function($rootScope,$scope, initDataService, initExperiment, utilities, validate, buildMacro, $uibModal, $location){

	
	$scope.isViewMacro = true;
	
	let initDataList = initDataService.getInitActionScorer();

	$scope.initActionList = initDataList.actionList;
	$scope.initClassifierList = initDataList.classifierList;
	$scope.initActionTypeList = _.map($scope.initActionList,'type');
	$scope.actionTypeList = [];
	let selectedAction = [];
	let selectedTypeAction;
	if($rootScope.experiment.data.actionList.length<=0){
		$scope.actionTypeList = angular.copy($scope.initActionTypeList);
	}else{
		selectedTypeAction = _.map($rootScope.experiment.data.actionList,'actionType');
		
	}
	
	
	
	$scope.addAction = function(actionType){ //new action
		
		let action = {
					'name': utilities.generateName($rootScope.experiment.data.actionList,'action'),
					'actionType': actionType,
					'dataList': [],
					'classifierList': [],
					'filterList':[]
		}
		
		$rootScope.experiment.data.actionList.push(action);
		let isValidName = {
							'isValid': true
						  }
		$scope.isValidNameList.push(isValidName);
		
	}	
	
	$scope.delAction = function(actionId){ //delete source
		 if(actionId>-1) $rootScope.experiment.data.actionList.splice(actionId,1);
	
	}
	
	$scope.clearDataList = function(id){
		$rootScope.experiment.data.actionList[id].dataList = [];
	}
	
	$scope.addActionData = function (size,actionType,actionId, dataId) { //new data
		let modalAction = $uibModal.open({
	      animation: true,
	      backdrop: false,
	      templateUrl: 'views/data/actions/newActionData.html',
	      controller: 'ActionDataCtrl',
	      size: size,
	      resolve: {
	    	  actionType: function(){
	    		return actionType;
	    	  },
	    	  actionId: function(){
	    		  return actionId;
	    	  },
	    	  dataId: function(){
	    		  return dataId;
	    	  }
	      }
	    });

	    modalAction.result.then((data)=>{
		      if(dataId<0) $rootScope.experiment.data.actionList[actionId].dataList.push(data);
		      else $rootScope.experiment.data.actionList[actionId].dataList[dataId] = data;
		     
		    }, (cancel)=> {
		      
	      
	    });
	 }; 
	
	 
	 $scope.delData = function(actionId,dataId){
		 $rootScope.experiment.data.actionList[actionId].dataList.splice(dataId,1);
	 }
	 
	 $scope.isCounter = function(data){
		 let isC = false;
		 if(typeof data != 'undefined'){
			
			 if(data.gamosName === 'StackCounter'){
				 if(typeof data.particleList !== 'undefined' && data.particleList.length>0) isC = true;
			 } 
		 }
		 return isC;
	 }
	 
	$scope.getElementList = utilities.getElementList;
	$scope.delElement = utilities.delElement;
	$scope.addElement = utilities.addElement;
	
	 //validations
	 $scope.isValidNameList = []; 
	 for(let i=0;i<$rootScope.experiment.data.actionList.length;i++){ //init validations
			let action = $rootScope.experiment.data.actionList[i];
			let isValidName = validate.validateName($rootScope.experiment.data.actionList,action.name,i, $rootScope.maxLength);
			$scope.isValidNameList.push(isValidName);
	 }
	 
	 $rootScope.$watch('experiment.data.actionList',(newActionList,oldActionList)=>{
		 $scope.isValidAllAction = true;
		  
		 selectedTypeAction = _.map(newActionList,'actionType');
		 $scope.actionTypeList = [];
		 for(let i=0;i<$scope.initActionTypeList.length;i++){
			let aType = $scope.initActionTypeList[i];
			if(selectedTypeAction.indexOf(aType)<0) $scope.actionTypeList.push(aType);
		 }
		 
		 for(let i=0;i<newActionList.length;i++){
			 let isValidName = validate.validateName(newActionList,newActionList[i].name,i, $rootScope.maxLength);
			 $scope.isValidNameList[i] = isValidName;
			 $scope.isValidAllAction = $scope.isValidAllAction && isValidName.isValid && (newActionList[i].dataList.length>0);
		 }
		
		 $rootScope.isValidExperiment.isValidActions =  $scope.isValidAllAction; //initExperiment.isValidExperiment;
		
		$rootScope.isValidAll = true;
		
		for(let k in $rootScope.isValidExperiment){
			$rootScope.isValidAll = $rootScope.isValidAll && $rootScope.isValidExperiment[k];
		} 
		
			
		$rootScope.isSaved = false;
		
		//macro instruction
		if($scope.isValidAllAction){
			$scope.commandList = [];
			for(let i=0;i<newActionList.length;i++){
				let nameString = '#' + newActionList[i].name;
				$scope.commandList.push(nameString);
				$scope.commandList = $scope.commandList.concat(buildMacro.buildGAMOSData(newActionList[i]));
				
			}
			
		}
		
		
	
	 },true);
	//end validations
});
