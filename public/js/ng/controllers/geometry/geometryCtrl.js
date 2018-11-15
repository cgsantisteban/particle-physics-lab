"use strict";

lab.controller('GeometryCtrl',function($rootScope,$scope, $location, validate, utilities, errorListService,genericService, modelExperimentService,
										initGeomService,modelSourceService, buildMacro, buildGeom, $uibModal, $window){
	
	let errorMessageList = errorListService.getErrorList();
	
	
	//Saved changes
	$scope.isViewGeomCommand = true;
	$scope.isViewSourceCommand = true;
	$rootScope.$watch('experiment.geometry.volumeList',function(newVolumeList,oldVolumeList){
		$rootScope.isSaved = false;
		//volume commands
		$scope.geomCommands = []; 
		if($rootScope.isValidExperiment.isValidVolumes){
			$scope.geomCommands = buildGeom.buildGeomCommands(newVolumeList);
			
		}
		
	},true);
	
	let initGeomData = initGeomService.getInitGeom();
	
	//event generator
	let initPhysicsList = genericService.getInitPhysicsList();
	let eventList = genericService.getEventGeneratorList();
	$scope.eventGeneratorList = [];
	
	let selectedPhy = _.find(initPhysicsList.physicsList,function(phy){
							return phy.lib === $rootScope.experiment.physicsLib;		
						});
	if(selectedPhy.isPythia ) {
		$scope.eventGeneratorList = eventList;	
	}
	else{
		$scope.eventGeneratorList = _.filter(eventList, function(e) { return !e.isPythia; });
	}
	
	if(!$rootScope.experiment.isPythia)	$scope.selectedGenerator = $scope.eventGeneratorList[0];
	else $scope.selectedGenerator = $scope.eventGeneratorList[1];
	
	//fullscreem
	$scope.getIsFull = function(){
		return $window.document.webkitIsFullScreen;
	}
	$scope.$watch($scope.getIsFull,(newIsFull,oldIsFull)=>{
		$scope.isFull = newIsFull;
	},true);
	
		
	//init error posrot and selected volume
	$scope.isValidPosRot = {
			"position": {},
			"rotation": {},
			"opacity": true
		}
		
	//Parameterisation
	if(typeof $rootScope.isIn == 'undefined') {
		$rootScope.isIn = {};
		for(let i=0;i<$rootScope.experiment.geometry.volumeList.length;i++){
			let v = $rootScope.experiment.geometry.volumeList[i];
			if(v.isParam){
	  			let isInParam = {
	  					isValid: true
	  			}
	  			$rootScope.isIn[v.name] = isInParam;
	  		}
	  	}
	}
	
	$scope.initParam = function(v,paramType){
		if(v.isParam){
  			
			let isInParam = {
  					isValid: true
  			}
  			$rootScope.isIn[v.name] = isInParam;
  			v.parameterisation = $scope.getParametersitation(v.solid.solidType)[0];


  		}
  		else{
  			delete $rootScope.isIn[v.name];
  			delete v.parameterisation;
  		}
  	
  	}
	
	
	function getParentList(volume,volumeList){
		let parentList = [];
		for(let i=0;i<volumeList.length;i++){
			let v = volumeList[i];
			if(v.name != volume.name){
				if((!v.isWorld)  && (!v.isParam) && (!v.isParent)){
					parentList.push(v);
				}
			}
			
		}
	
		return parentList;
	}
	
	
	$scope.getParametersitation = function(volumeType){
		let parameterisation = angular.copy(initGeomData.parameterisation);
		if(volumeType !== 'BOX')
			parameterisation = _.filter(parameterisation, function(p) { return p.type !== 'PHANTOM'; });
		
		return parameterisation;
	}
	
	//new, edit volume
	$scope.addVolume = function (size,volumeId) {
		$scope.volumeId = volumeId;
	    let modalVolume = $uibModal.open({
	      animation: true,
	      backdrop: false,
	      templateUrl: 'views/geometry/newVolume.html',
	      controller: 'VolumeCtrl',
	      size: size,
	      resolve: {
	    	  volumeId: function () {
	    		  return volumeId;
	        }
	      }
	    });

	    modalVolume.result.then(function (volume) {
		      if($scope.volumeId<0){
				  volume.isParent = false;
		    	  $rootScope.experiment.geometry.volumeList.push(volume);
			  } 
		      else {
		      	//update filterList
		      	let oldVolume = $rootScope.experiment.geometry.volumeList[$scope.volumeId].name,
		      		oldType = $rootScope.experiment.geometry.volumeList[$scope.volumeId].solid.solidType,
		      		newVolume = volume.name,
		      		newType = volume.solid.solidType;
		      	
		      	for(let i=0;i<$rootScope.experiment.data.filterList.length;i++){
		      		let filter = $rootScope.experiment.data.filterList[i];
		      		if(filter.type === "Flux"){
		      			if(filter.parameters[0].value === oldVolume)
		      				$rootScope.experiment.data.filterList[i].parameters[0].value = newVolume;
		      		}
		      	}
		      	
		      	//update scorers
		      	let newScorerList = [];
		      	$scope.removeScorers = []; 
		      	for(let ii=0;ii<$rootScope.experiment.data.scorerList.length;ii++){
		      		let scorer = $rootScope.experiment.data.scorerList[ii];
		      		if(scorer.volume === oldVolume) {
		      			if(scorer.data.gamosName === 'GmPSSurfaceFlux') {
		      				if((oldType !== newType) || newType === 'CONS'){ //remove scorer (change flux sufaces)
		      					$scope.removeScorers.push(scorer.name);
		      				}
		      				else{
		      					scorer.volume = newVolume;
		      					newScorerList.push(scorer);
		      				}
		      			}
		      			else {
		      				scorer.volume = newVolume;
		      				newScorerList.push(scorer);
		      			}
		      		}
		      		else newScorerList.push(scorer);
		      	}
		      	$rootScope.experiment.data.scorerList = newScorerList;
		      	
		      	//update volume
		      	$rootScope.experiment.geometry.volumeList[$scope.volumeId] = volume;
		      	
		      }
		    
		    }, function (cancel) {
		    	
	    });
	 }; 
	 //end volume
	 
	 $scope.cloneVolume = function(volumeId){
		 let newVolume = angular.copy($rootScope.experiment.geometry.volumeList[volumeId]);
		 newVolume.name = utilities.generateName($rootScope.experiment.geometry.volumeList,'volume');
		 $rootScope.experiment.geometry.volumeList.push(newVolume);
	}
	 
	 $scope.showDelSource = false;
	 $scope.newSourceData = {
			 'newSourceList': [],
			 'removeSourceList': [],
			 'newFilterList': [],
			 'newScorerList': [],
			 'removeScorerList': []
	 }
	
	 
	 $scope.delVolume = function(volumeName){ //delete volume
		let deletedVolume = _.find($rootScope.experiment.geometry.volumeList,(v)=>{
			return v.name === volumeName;
		})
		
		if(typeof deletedVolume != 'undefined'){
			
			//remove source (position distribution)
			$scope.newSourceData = updateExperiment(deletedVolume,$rootScope.experiment);
			if($scope.newSourceData.removeSourceList.length>0){
				 $rootScope.experiment.sourceList = $scope.newSourceData.newSourceList;
			}
			if($rootScope.experiment.sourceList.length<=0) {
				$rootScope.isValidExperiment.isValidSources = false;
			}
			else {
				$rootScope.isValidExperiment.isValidSources = true;
			}
		
			//remove filters
			$rootScope.experiment.data.filterList = $scope.newSourceData.newFilterList;      	
			  
			if($scope.newSourceData.removeScorerList.length>0){
				$rootScope.experiment.data.scorerList = $scope.newSourceData.newScorerList;
			} 
			
			//find son
			let son = null;
			for(let i=0;i<$rootScope.experiment.geometry.volumeList.length;i++){
				let volume = $rootScope.experiment.geometry.volumeList[i];
				
				if(volume.isParam){
					if(volume.parentVolume === deletedVolume.name){ 
						son = volume;
						break;
						
					}
				}
			 }
			 if(son !== null) {
				 let sonSourceData = updateExperiment(deletedVolume,$rootScope.experiment);
				 
				 if(sonSourceData.removeSourceList.length>0){
					 $rootScope.experiment.sourceList = sonSourceData.newSourceList;
				 }
				 
				 $rootScope.experiment.data.filterList = sonSourceData.newFilterList;      	
				  
				if(sonSourceData.removeScorerList.length>0){
					$rootScope.experiment.data.scorerList = sonScorerList;
				}
				 
			 }
			 //end son
			 
			 if(!deletedVolume.isWorld){
				delete $rootScope.isValidGeometry[deletedVolume.name];
				$rootScope.experiment.geometry.volumeList =  _.filter($rootScope.experiment.geometry.volumeList,(v)=>{
					 return v.name !== volumeName;
				 });
				 
			 } 
			 
			 //delete son
			 if(son !== null){
				 delete $rootScope.isValidGeometry[son.name];
				 
				 $rootScope.experiment.geometry.volumeList =  _.filter($rootScope.experiment.geometry.volumeList,(v)=>{
						return v.name !== son.name;
					});
			 }
			
		}
	 
	 }//del volume
	 
	 function updateExperiment(deletedVolume,experiment){
		 let newExperiment = {
				 'newSourceList': [],
				 'removeSourceList': [],
				 'newFilterList': [],
				 'newScorerList': [],
				 'removeScorerList': []
		 }
		 
		//find associated sources
		 let newSourceList = [],
		 		removeSourceList = [];
		 let volumeName = deletedVolume.name;
		
		 for(let i=0;i<experiment.sourceList.length;i++){
		 	let source = experiment.sourceList[i];
		 	if(source.distributions['Position'].type === 'Volume' || 
		 		source.distributions['Position'].type === 'Volume surface'){
		 		if(volumeName !== source.distributions['Position'].parameters['volume'].value){
		 			newSourceList.push(source);
		 		}
		 		else removeSourceList.push(source.name);
		 	}
		 	else newSourceList.push(source);
		 }
		 
		 newExperiment.newSourceList = newSourceList;
		 newExperiment.removeSourceList = removeSourceList;
		 
		 //find associated filters
		 let newFilterList = [];
		 for(let i=0;i<$rootScope.experiment.data.filterList.length;i++){
      		let filter = experiment.data.filterList[i];
      		if(filter.type === "Flux"){
      			if(filter.parameters[0].value !== deletedVolume.name){
      				newFilterList.push(filter);
      			}
      			else{ //update actions and scorers
      				for(let ii=0;ii<experiment.data.actionList.length;ii++){
      					let pos	= experiment.data.actionList[ii].filterList.indexOf(filter);
      					if(pos>=0) experiment.data.actionList[ii].filterList.splice(pos,1);	
      				}
      				for(let iii=0;iii<experiment.data.scorerList.length;iii++){
      					let pos	= experiment.data.scorerList[iii].filterList.indexOf(filter);
      					if(pos>=0) experiment.data.scorerList[iii].filterList.splice(pos,1);	
      				}
      			}
      		}else{
      			newFilterList.push(filter);
      		}
      	 }
		 
      	 newExperiment.newFilterList = newFilterList;      	
		 
		 //update scorers
		 let newScorerList = [],
		 		removeScorerList = [];
		 for(let iv=0;iv<experiment.data.scorerList.length;iv++){
		 	let scorer = experiment.data.scorerList[iv];
		 	if(scorer.volume !== deletedVolume.name) newScorerList.push(scorer);
		 	else removeScorerList.push(scorer.name);
		 }
		 
		 newExperiment.newScorerList = newScorerList;
		 newExperiment.removeScorerList = removeScorerList;		
	
		 return newExperiment;
	 }
	 
	 
	function validateGeometry(volumeList){
		let isValidGeometry = {};
		for(let i=0;i<volumeList.length;i++){
			let v = volumeList[i];
			if(!v.isWorld){
				let isValidVolume= {
						'isValidPosRot': {},
						'isValidParam': {}
				};
			
				isValidVolume.isValidPosRot =  validate.validateVolume(v);
				
				if(v.isParam){
					isValidVolume.isValidParam = validate.validateParameterisation(v.parameterisation.parameters);
				}
				isValidGeometry[v.name]= isValidVolume;
			}
			
		}
	
		return isValidGeometry;
	}
		
	function getIsValidVolume(isValidVolume){
		let isValid = true;
		
		let isValidPosRot = isValidVolume.isValidPosRot;
		let isValidPosition = true,
			isValidRotation = true,
			isValidOpacity = isValidPosRot.isValidOpacity;
	
		for(let coord in isValidPosRot.isValidPosition){
			isValidPosition = isValidPosition && isValidPosRot.isValidPosition[coord];	
		}
		 
		for(let coord in isValidPosRot.isValidRotation){
			isValidRotation = isValidRotation && isValidPosRot.isValidRotation[coord];
		}
		
		isValid = isValidRotation && isValidPosition && isValidOpacity;
		
		if(!_.isEmpty(isValidVolume.isValidParam)){
			let isValidParam = isValidVolume.isValidParam;
			for(let p in isValidParam) {
				isValid = isValid && isValidParam[p].isValid;
			}
			
			
		}
		
		return isValid;
	}
		
	$scope.showErrorVolume = function(volumeName,isValidGeometry,isIn){
		let show = !getIsValidVolume(isValidGeometry[volumeName]);
		
		return show
	}
	
	
	
	$rootScope.$watch('experiment.geometry.volumeList',(newVolumeList, oldVolumeList)=>{
		
		$rootScope.isValidGeometry = validateGeometry(newVolumeList);
		
		
	},true);
	
	$rootScope.$watch('isValidGeometry',(newIsValid,oldIsValid)=>{
		let isValidGeometry = newIsValid;
	
		
		$rootScope.isValidExperiment.isValidVolumes = true;
		for(let v in isValidGeometry){
			$rootScope.isValidExperiment.isValidVolumes = getIsValidVolume(isValidGeometry[v]);
	
			if(!$rootScope.isValidExperiment.isValidVolumes) break;
			
		}//for isValidGeometry
		
		$rootScope.isValidAll = true;
		for(let k in $rootScope.isValidExperiment){
			$rootScope.isValidAll = $rootScope.isValidAll && $rootScope.isValidExperiment[k];
			if(!$rootScope.isValidAll) break;
		}
	},true);
	
	//end volume
	
	
	 
});
