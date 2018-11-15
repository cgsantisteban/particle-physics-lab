
	"use strict"
	
	lab.controller('HeaderCtrl',function($rootScope,$scope, socket,ExperimentListService, initExperiment, FileSaver,Blob, $location, $uibModal){
		
		$scope.saveExperiment = function (size,id, type) {
			
			if(type < 0){ //save as
				delete $rootScope.experiment._id;
				let date = Date.now();
				$rootScope.experiment.date = date;	
				let modalSave = $uibModal.open({
				      animation: true,
				      templateUrl: 'views/main/saveExperiment.html',
				      controller: 'SaveExperimentCtrl',
				      size: size,
				      resolve: {
				    	  id: function () {
				    		  return id;
				        }
				      }
				    });
			
				    modalSave.result.then( (exp)=> {
					   
					  	$rootScope.isSaved = true;
					    }, (cancel)=> {
				      
				  });
			}//if type
			else{ //save
				if(typeof id == 'undefined'){
					let modalSave = $uibModal.open({
				      animation: true,
				      templateUrl: 'views/main/saveExperiment.html',
				      controller: 'SaveExperimentCtrl',
				      size: size,
				      resolve: {
				    	  id: function () {
				    		  return id;
				        }
				      }
				    });
			
				    modalSave.result.then((exp)=> {
					     
					  	 $rootScope.isSaved = true;
					    }, (cancel)=> {
					  
				    });
				}
				else{
					let date = Date.now();
					$rootScope.experiment.date = date;	
					$rootScope.isSaved = true;
					
					ExperimentListService.saveExperiment($rootScope.experiment)
								.then((data)=> {
								  	 $rootScope.experiment = data.data.experiment;
								  	 $rootScope.experimentList = data.data.experimentList;
								},(error)=> {
								    	console.log('Error: ', error);
							  	});
					
				}
			}//else type
		 }; 
		 
		 $scope.isSavedF = function(experiment){
		 	return (typeof experiment._id != 'undefined');
		 }
		 
		 
		 
		 $scope.resetExperiment = function (size) {
			 let newExpModal = $uibModal.open({
				      animation: true,
				      backdrop: false,
				      templateUrl: 'views/main/newExperiment.html',
				      controller: 'NewExperimentCtrl',
				      size: size
			});
					 
			newExpModal.result.then((isOk)=> {
					    	//new experiment
						if(isOk){
							 
							 socket.emit('newExperiment', {});
							 $rootScope.experiment = initExperiment.getExperiment(); //init experiment;
							 let histograms = initExperiment.getHistograms(); //init histograms
							 $rootScope.histograms = angular.copy(histograms);
							 
							 let initValues = angular.copy(initExperiment.initGlobal());
							 $rootScope.isValidAll = initValues.isValidAll;
							 $rootScope.isValidExperiment = initValues.isValidExperiment;
							 $rootScope.isSaved = initValues.isSaved; //<---init modifications saved
							 $rootScope.showSummary = initValues.showSummary;
							 $rootScope.okRunExperiment = initValues.okRunExperiment;
							 $rootScope.maxEvent = initValues.maxEvent;
							 $rootScope.maxLength = initValues.maxLength; 
							 $rootScope.termData = initValues.termData;
							 
							 $location.path('#/particlelab');
							
						}
					    
				    }, (cancel)=> {
				  
			    });	
			}//reset experiment
		 
		 
		 $scope.importExperiment = function (size) {
			 let importExpModal = $uibModal.open({
				      animation: true,
				      backdrop: false,
				      templateUrl: 'views/main/importExperiment.html',
				      controller: 'ImportExperimentCtrl',
				      size: size
			});
					 
			importExpModal.result.then((exp)=> {
						
						socket.emit('newExperiment', {});
						$rootScope.experiment = exp; //init experiment;
						let histograms = initExperiment.getHistograms(); //init histograms
						$rootScope.histograms = angular.copy(histograms);
						let initValues = angular.copy(initExperiment.initGlobal());
						$rootScope.isValidAll = initValues.isValidAll;
						$rootScope.isValidExperiment = initValues.isValidExperiment;
						$rootScope.isSaved = false; //<---init modifications saved
						$rootScope.okRunExperiment = false;
						$rootScope.showSummary = false;
						 
						 $location.path('#!/particlelab');
						    
					}, (cancel) =>{
					    	
					});	
			}//import experiment
		 
		 $scope.exportExperiment = function () {
			 	if($rootScope.isValidAll){
			 		let experiment = angular.copy($rootScope.experiment);
				 	
				 	if(typeof experiment._id != 'undefined'){
				 		delete experiment._id;
				 	}
				 	if(typeof experiment.__v != 'undefined'){
				 		delete experiment.__v;
				 	}
				 	
				 	let data = new Blob([JSON.stringify(experiment,null,2)], { type: 'text/plain;charset=utf-8' });
				    FileSaver.saveAs(data, 'experiment.json');
			 	}
		}//export experiment
		 
	});
