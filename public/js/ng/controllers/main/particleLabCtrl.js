"use strict"





lab.controller('ParticleLabCtrl',function($rootScope, $scope, $sanitize, genericService, initGeomService, modelSourceService, initExperiment,
										   	socket, validate, utilities, buildMacro,$uibModal, $http){
	
	
	//init physics list
	let initDataList = genericService.getInitPhysicsList();
	$scope.initPhysicsList = initDataList.physicsList;
	let initGeomData = initGeomService.getInitGeom();
	$scope.electricField = angular.copy(initGeomData.electricField);
	$scope.magneticField = angular.copy(initGeomData.magneticField);
	$scope.maxEvent = Number.MAX_SAFE_INTEGER; //maximum n. envents
	$scope.showErrorFile = false;
	
	
	if(typeof $rootScope.experiment == 'undefined' || $rootScope.experiment == null){
		$rootScope.experiment = initExperiment.getExperiment(); //init experiment;
		let histograms = initExperiment.getHistograms(); //init histograms
		$rootScope.histograms = angular.copy(histograms);
		$rootScope.isSaved = false;
	}
	
	socket.on('errorFolder', (error)=>{
		console.error('error folder',error);
		return;
	});
	
	
	$scope.getPhysicsLibHelp = function(physicsLib,physicsList){
		let find = false,
			pos = 0,
			content = '';
		while(!find && pos<physicsList.length){
			if(physicsLib === physicsList[pos].lib){
				find = true;
				content += '<strong>Description:</strong> <span>' + physicsList[pos].description + '</span><br>';
			}
			else pos++;
		}
		
		return $sanitize(content);
	}
	
	//processes
	$scope.isShowProcesses = true; //show processes
	$scope.showTitle = "Show processes";
	$scope.showProcesses = function(){
		$scope.isShowProcesses = !$scope.isShowProcesses;
		if($scope.isShowProcesses) $scope.showTitle = "Show processes";
		else $scope.showTitle = "Hide processes";
	}
	
	$scope.selectAllProcess = function(){
		$rootScope.experiment.processRemove = [];
	}
	
	$scope.getProcessList = function(physicsLib, physicsList){
			let processList = null;
			let physics = _.find(physicsList,function(phy){
				return phy.lib === physicsLib;
			})
			
			if(typeof physics != 'undefined') processList = physics.processList;
			
			return processList;
	}
		
	$scope.findProcess = function(process){
		let find = true;
		if($rootScope.experiment.processRemove.indexOf(process)>=0) {
			find = false;
		}
		return find;
	}
	
	$scope.isSelectProcess = false;
	$scope.initProcessRemove = function(){
		$rootScope.experiment.processRemove = [];
		
		//update event generator
		$scope.removePythiaData = false;
		let selectedPhy = _.find(initDataList.physicsList,(phy)=>{
							return phy.lib === $rootScope.experiment.physicsLib;		
						});
		
		if(!selectedPhy.isPythia && typeof $rootScope.experiment.pythiaData != 'undefined' && $rootScope.experiment.pythiaData !== null){
			$rootScope.experiment.isPythia = false;
			$rootScope.experiment.pythiaData = null;
			$scope.removePythiaData = true;
		}
		
		//update associated filters
		let newFilterList = [];
		$scope.removeFilters = [];
		for(let i=0;i<$rootScope.experiment.data.filterList.length;i++){
			let filter = $rootScope.experiment.data.filterList[i];
			if(filter.type != 'Process') newFilterList.push(filter);
			else{
				$scope.isSelectProcess = false;			
				for(let ii=0;ii<filter.parameters.length;ii++){
					if(filter.parameters[ii].paramType === 'selectProcess') {
						let process = filter.parameters[ii].value;
						let processList = null;
						
						if(typeof selectedPhy != 'undefined') processList = selectedPhy.processList;
						if(processList.indexOf(process)<0){
							$scope.removeFilters.push(filter.name);
							$scope.isSelectProcess = true;
							
							//update associated actions and scorers
							for(let iii=0;iii<$rootScope.experiment.data.actionList.length;iii++){
								let action = $rootScope.experiment.data.actionList[iii];
								let pos = action.filterList.indexOf(filter);
								if(pos>=0) $rootScope.experiment.data.actionList[iii].filterList.splice(pos,1);
							}
							
							for(let iv=0;iv<$rootScope.experiment.data.scorerList.length;iv++){
								let scorer = $rootScope.experiment.data.scorerList[iv];
								let pos = scorer.filterList.indexOf(filter);
								if(pos>=0) $rootScope.experiment.data.scorerList[iv].filterList.splice(pos,1);
							}
							
							break;	
						}
							
					}
				}
				
				if(!$scope.isSelectProcess){
					newFilterList.push(filter);
				} 
				
			}
		}
		
		$rootScope.experiment.data.filterList = newFilterList;
		
	}
	
	$scope.addProcess = function(process){
		
		let pos = $rootScope.experiment.processRemove.indexOf(process);
		if(pos>=0) $rootScope.experiment.processRemove.splice(pos,1);
		else $rootScope.experiment.processRemove.push(process);
	
	}
	//end processes
	
	//EM Fields
	$scope.setEMField = function(isEMField){
		//init fields
		if(!isEMField){ 
			let emField = angular.copy(initExperiment.getExperiment().emField);
			let localField = angular.copy(initExperiment.getExperiment().localField);
			
			$rootScope.experiment.emField = emField;
			$rootScope.experiment.localField = localField;
		}
	}
	
	
	$scope.$watch('experiment.nBeams',(newBeams,oldBeams)=>{
		$scope.isValidBeams = validate.validateBeams(newBeams,$rootScope.maxBeams);
		$rootScope.isValidExperiment.isValidBeams = $scope.isValidBeams.isValid;
		if(newBeams != oldBeams){
			$rootScope.isSaved = false;
		} 
	},true)
	
	$scope.$watch('experiment.emField',(newField,oldField)=>{
		$scope.isValidField = {};
		$rootScope.isValidExperiment.isValidEMField = true;
		for(let fieldType in newField){
			$scope.isValidField[fieldType] = validate.validateField(fieldType, newField[fieldType]);
			for(let f in $scope.isValidField[fieldType]){
				$rootScope.isValidExperiment.isValidEMField = $rootScope.isValidExperiment.isValidEMField && 
																										$scope.isValidField[fieldType][f].isValid;
			}
		}
		
		if(newField != oldField){
			$rootScope.isSaved = false;
		} 
	},true);
	
	
	$scope.$watch('experiment.localField', (newField,oldField)=>{
	
		$scope.isValidLocalField = {};
		$rootScope.isValidExperiment.isValidLocalField = true;
		for(let fieldType in newField){
			$scope.isValidLocalField[fieldType] = validate.validateField(fieldType, newField[fieldType]);
			for(let f in $scope.isValidLocalField[fieldType]){
				$rootScope.isValidExperiment.isValidLocalField = $rootScope.isValidExperiment.isValidLocalField && 
																		$scope.isValidLocalField[fieldType][f].isValid;
			}
		}
		
		if(newField != oldField){
			$rootScope.isSaved = false;
		} 
	},true);
	
	$scope.$watch('isValidExperiment', (newIsValidExperiment,oldIsValidExperiment)=>{
		
		$rootScope.isValidAll = true;
		for(let k in newIsValidExperiment){
			
			$rootScope.isValidAll = $rootScope.isValidAll && newIsValidExperiment[k];
			if(!$rootScope.isValidAll){
				
				break;
			} 
		} 
		
	},true);
	
	let sourceList = modelSourceService.getParticleList();
	let particleList = sourceList.particles;
	
	if($rootScope.experiment.isPythia){
		let beamA = $rootScope.experiment.pythiaData.pythiaBeam.beamA,
			beamB = $rootScope.experiment.pythiaData.pythiaBeam.beamB;
		$scope.textBeamA = utilities.getParticleName('pdg',beamA,particleList);
		$scope.textBeamB = utilities.getParticleName('pdg',beamB,particleList);
		let frame = $rootScope.experiment.pythiaData.pythiaBeam.energy.frame;
		let units = $rootScope.experiment.pythiaData.pythiaBeam.energy.units;
		
		if(frame.option === 1){
			let eCM = $rootScope.experiment.pythiaData.pythiaBeam.energy.eCM;
			$scope.textEnergy = '<b>Energy (' + frame.name + '): </b>' + eCM + ' ' + units ; 
		}
		else if(frame.option === 2){
			let eA = $rootScope.experiment.pythiaData.pythiaBeam.energy.eA,
				eB = $rootScope.experiment.pythiaData.pythiaBeam.energy.eB;
			$scope.textEnergy = '<b>Energy (A): </b>' + eA + ' ' + units + ', <b>Energy (B): </b>' + eB + ' ' + units; 
		}
		else{
			text = "Error: not defined pythia beam";
		}
	}
	
	$scope.runExperiment = function (size) {
		
		if(typeof $rootScope.experiment != 'undefined'){
				$rootScope.showSummary = false;
				
			    let modalInstance = $uibModal.open({
			      animation: true,
			      backdrop: false,
			      templateUrl: 'views/main/runExperiment.html',
			      controller: 'RunExperimentCtrl',
			      size: size,
			      resolve: {
			      }
			    });
				
				 modalInstance.result.then((isOk) =>{
				    
						if($rootScope.okRunExperiment){
							
					        $rootScope.showSummary = true;
					        if(!_.isEmpty($rootScope.errorList.errorFile)){
					        	$scope.showErrorFile = true;
					        }
						} 
				}, (cancel)=> {
				    	if($rootScope.okRunExperiment){
				    		 $rootScope.showSummary = true;
				    	}else{
				    		stopExperiment();
					    }
			    });	
				
			}//if typeof experiment
		
		
	}//run experiment
	
	function stopExperiment(){
		socket.emit('exp:Kill', 'stop');
		$scope.endRun = true;
		$rootScope.showSummary = false;
		$scope.cancelExperiment = true;
		let histograms = initExperiment.getHistograms(); //init histograms
		$rootScope.histograms = angular.copy(histograms);
	}
	
	$scope.showMacroFiles = function (size) {
		
	    let modalInstance = $uibModal.open({
	      animation: true,
	      backdrop: true,
	      templateUrl: 'views/main/macroFiles.html',
	      controller: 'MacroFilesCtrl',
	      size: size,
	      resolve: {
	    	  
	      }
	    });
		
		modalInstance.result.then((isOk) =>{
				 
		}, (cancel)=> {
		    	
	    });	
			
		
	}//show MacroFiles
	
	
	
	socket.on('exp:WRLFile',function(data){
		$scope.wrlJSON = data;
		$scope.$digest();
	});
	
	$scope.getExperimentFiles = function(expId){
		$http({
		      url: 'getExperimentFiles',
		      method: "GET",
		      //params: {expId: expId},
		      params: {},
		      responseType: 'blob'
		  }).then( (data, status, headers, config)=> {
			  
		      let blob = new Blob([data.data]);
		      let fileName = 'experiment.zip'
		      saveAs(blob, fileName);
		  },(error)=>{
			  console.error('Unable to download the file')  
		  });
	}
	
	
}); //ParticleCtrl

