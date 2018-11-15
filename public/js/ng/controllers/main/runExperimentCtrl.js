"use strict"

lab.controller('RunExperimentCtrl', function ($rootScope,$scope, $uibModalInstance, $location, socket, initExperiment,
													buildMacro,buildGeom) {
	
	$scope.isCollapsed = false;
	$scope.nEvent = 0;
	$scope.nBeams = $rootScope.experiment.nBeams;
	$scope.buildGeom = false;
	$scope.buildMacro = false;
	$scope.beginSimulation = false; 
	$scope.endRun = false;
	$scope.errorRun = false;
	$scope.simulationTime = {};
	$scope.buildPythia = false;
	$scope.beginPythiaRun = false;
	$scope.endPythiaRun = false;
	$scope.errorPythiaRun = {
			"isError": false
	};

	$rootScope.okRunExperiment = false;
	
	if(typeof $rootScope.experiment !== 'undefined' && $rootScope.experiment !== null){
		resetHistogram();
		let macroCommands = buildMacro.buildMacroFile($rootScope.experiment);
		let geomCommands = buildGeom.buildGeomCommands($rootScope.experiment.geometry.volumeList);
		let commandList = {
			'macro': {
				'fileName': $rootScope.experiment.macroFile,
				'macroCommands': macroCommands
			},
			'geom': {
				'fileName': $rootScope.experiment.geomFile,
				'geomCommands': geomCommands
			},
			'nBeams': $rootScope.experiment.nBeams,
			'actionList': $rootScope.experiment.data.actionList,
			'scorerList': $rootScope.experiment.data.scorerList
		}
		socket.emit('exp:Run', commandList);
		
	} 
	else console.error('error al ejecutar');
	
	$scope.okRun = function (isOk) {
		
		if(isOk){
			let experimentSummary = {
					nEvent: $scope.nEvent,
					time: $scope.simulationTime
			}
			$rootScope.experimentSummary = experimentSummary;
			$uibModalInstance.close(isOk);
		}
		else{
			$scope.endRun = true;
			
			$scope.cancelExperiment = true;
			resetHistogram();
			$uibModalInstance.close('error');
		}
		$location.url('/particlelab');
	};
	
	$scope.stopExperiment = function(){
		socket.emit('exp:Kill', 'stop');
		$scope.endRun = true;
		
		$scope.cancelExperiment = true;
		resetHistogram();
		$uibModalInstance.dismiss('cancel');
	};
	
	socket.on('exp:buildGeom',(state)=> {
		$scope.buildGeom = state; 
		$scope.$digest();
	});
	
	
	socket.on('exp:buildPythia', (state)=> {
		$scope.buildPythia = state;
		$scope.$digest();
	});
	
	socket.on('exp:buildMacro', (state)=> {
		$scope.buildMacro = state; 
		$scope.$digest();
	});
	
	socket.on('exp:beginPythiaRun', (state)=> {
		$scope.beginPythiaRun = state;
		
		$scope.$digest();
	});
	
	socket.on('exp:nPythiaEvent', (nPythiaEvent)=>{
		$scope.nPythiaEvent = nPythiaEvent;
		$scope.$digest();
	});
	
	socket.on('exp:beginSimulation', (state)=> {
		$scope.beginSimulation = state;
		
		$scope.$digest();
	});
	
	socket.on('exp:nEvent', (data)=> {
		$scope.nEvent = parseInt(data)
		if($scope.nEvent === $rootScope.experiment.nBeams) {
			$scope.endRun = true;
		}
		$scope.$digest();
	});
	
	$scope.outExperiment = [];
	socket.on('exp:outDataSimulation', (data)=> {
		$scope.outExperiment.push(data);
	});
	
	let partCountOut = {
			x: [],
			y: [],
			type : 'bar'
		};
	let procCountOut = []; 
	let procCreatorOut = [];
	
	socket.on('exp:simulationTime', (simulationTime)=>{
		$scope.simulationTime = simulationTime;
		$scope.$digest();
	});		
	
	socket.on('exp:partCount', (data)=>{
		partCountOut.x.push(data.particle);
		partCountOut.y.push(data.count);
		$scope.$digest();
	});		
	
	socket.on('exp:procCount', (data)=>{
		procCountOut.push(data);
		$scope.$digest();
	});
	
	socket.on('exp:procCreator', (data)=>{
		procCreatorOut.push(data);
		$scope.$digest();
	});
	
	
	//Errors
	$rootScope.errorList = {
		errorFile: [],
		errorGAMOS: null,
		errorFolder: null,
		errorPythia: null
	};
	
	socket.on('error:File', (error)=> {
		console.error(error);
		$rootScope.errorList.errorFile.push(error);
		$rootScope.$digest();
	});
	
	socket.on('error:GAMOSRun', (error)=> {
		console.error(error);
		$rootScope.errorList.errorGAMOS = error;
		$scope.$digest();
	});
	
	socket.on('error:FolderExp', (error)=> {
		console.error(error);
		$rootScope.errorList.errorFolder = error;
		$scope.$digest();
	});
	
	socket.on('error:PythiaRun', (error)=> {
		console.error(error);
		$rootScope.errorList.errorPythia = error;
		$scope.$digest();
	});

	socket.once('exp:Histograms', (histograms)=>{
		$rootScope.histograms.actionHistograms = histograms.actionHistograms;
		$rootScope.histograms.scorerHistograms = histograms.scorerHistograms;
		
		$scope.$digest();
	});
	
	socket.on("exp:endPythiaRun", (outPythia)=>{
		$scope.outPythia = outPythia;
		if(!outPythia.isError)	$scope.endPythiaRun = true;
		$scope.$digest();
	});
	
	socket.once('exp:pythiaHistogram', (pythiaHistograms)=>{ 
		$rootScope.histograms.pythiaHistograms = JSON.parse(pythiaHistograms);
		
		$scope.$digest();
	});
	
	socket.on('exp:pythiaTree', (pythiaTree)=>{ 
		$rootScope.histograms.pythiaTree = pythiaTree;
		
		$scope.$digest();
	});
	
	socket.on('exp:pythiaTreeFileError', (error)=>{
		console.error(error);
		$scope.$digest();
	});
	
	socket.on('exp:endGAMOSRun', (codeExit)=>{
		
		$scope.endRun = true;
		if(codeExit >= 0){
			$scope.errorRun = false;
			$rootScope.histograms.summary.partCount = partCountOut;
			$rootScope.histograms.summary.procCount = getProcData(procCountOut); 
			$rootScope.histograms.summary.procCreator = getProcData(procCreatorOut);
			
			if($rootScope.experiment.isPythia){
				$rootScope.okRunExperiment = !$scope.errorPythiaRun.isError;
			}
			else {
				$rootScope.okRunExperiment = true;
			}
			
		}
		else{
			$rootScope.okRunExperiment = false;
			$scope.errorRun = true;
		}
		
	});
	
	function resetHistogram(){
		let histograms = initExperiment.getHistograms(); //init histograms
		$rootScope.histograms = angular.copy(histograms);
	}
	
	function getProcData(procCounter){
		let outCounter = [];
		let procNoAll = _.filter(procCounter, function(pC){ return pC.proc !== 'ALL'; });
		let particles = [];
		
		for(let i=0;i<procNoAll.length;i++){
			if(particles.indexOf(procNoAll[i].particle)<0) particles.push(procNoAll[i].particle);
		}
		let processes = [];
		for(let i=0;i<procNoAll.length;i++){
			if(processes.indexOf(procNoAll[i].proc)<0) processes.push(procNoAll[i].proc);
		}
		
		processes.forEach((proc)=> {
			let data = {
							x: particles,
							y: [],
							name: proc,
							type: 'bar'
						};
		    particles.forEach((particle)=>{
		    	let p = _.find(procNoAll, function(pC) { return pC.particle === particle && pC.proc === proc; });
		    	if(typeof p == 'undefined') data.y.push(0);
		    	else data.y.push(p.count);
		    });
		    outCounter.push(data);
		});
		
		return outCounter;
	}
	
	
});
