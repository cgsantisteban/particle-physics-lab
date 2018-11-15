	"use strict"
	
	lab.controller('LeftNavCtrl',function($rootScope, $scope,$location, pageListService){
			
			$scope.pageList = pageListService.getPageList();
			
			$scope.$watch('isValidExperiment',(newIsValidExperiment,oldIsValidExperiment)=>{
				
				if(typeof newIsValidExperiment != 'undefined'){
					let isValidLabHome = newIsValidExperiment['isValidEMField'] && newIsValidExperiment['isValidLocalField'] && 
										newIsValidExperiment['isValidBeams'];
					
					$scope.pageList['Main']['Lab Home'].isValid = isValidLabHome;
					
					let isValidGeometry = newIsValidExperiment['isValidPythiaProcess'] && newIsValidExperiment['isValidPythiaBeam'] &&
										newIsValidExperiment['isValidVolumes'];
					
					$scope.pageList['Main']['Geometry'].isValid = isValidGeometry;
					
					$scope.pageList['Main']['Sources'].isValid = newIsValidExperiment['isValidSources'];
					
					let isValidData = newIsValidExperiment['isValidActions'] && newIsValidExperiment['isValidScorers'] && 
								newIsValidExperiment['isValidFilters'];
					$scope.pageList['Main']['Analysis'].isValid = isValidData;

				}
				
				 
				
			},true);
			
			$scope.getToolTipError = function(pageName, isValidExperiment){
				let msg = "There are errors in: ";
				if(pageName === 'Lab Home'){
					if(!isValidExperiment.isValidEMField) msg += 'Uniform EM fields ';
					if(!isValidExperiment.isValidLocalField) msg += 'Local magenic field ';
					if(!isValidExperiment.isValidBeams) msg += "Number of beams."
				}
				if(pageName === 'Geometry'){
					
					if(!isValidExperiment.isValidVolumes) msg += 'volume ';
					
					if($rootScope.experiment.isPythia){
						if(!isValidExperiment.isValidPythiaBeam) msg += 'Pythia beam definition ';
						if(!isValidExperiment.isValidPythiaProcess) msg += 'Pythia processes ';
					}else{
						if(!isValidExperiment.isValidSources) msg += 'source ';
					}
					
					
				} 
				
				if(pageName === 'Analysis'){
					if(!isValidExperiment.isValidActions) msg += "GAMOS data definition";
				}
				
				return msg;
				
			}
		
			$scope.$watch('histograms',(newHisto,oldHisto)=>{
		
				let isEmptyHistograms = _.isEmpty(newHisto);
				let isEmptySummary = false;
				let isEmptyActionHisto = false;
				let isEmptyScorerHisto = false;
				let isEmptyPythiaTree = false;
				let isEmptyPythiaHistogram = false;
			
				if(!isEmptyHistograms){
					isEmptySummary = _.isEmpty(newHisto.summary.partCount) || _.isEmpty(newHisto.summary.procCount) || 
													_.isEmpty(newHisto.summary.procCreator);
					isEmptyActionHisto = _.isEmpty(newHisto.actionHistograms);
					isEmptyScorerHisto = _.isEmpty(newHisto.scorerHistograms);
					isEmptyPythiaTree = _.isEmpty(newHisto.pythiaTree);
					isEmptyPythiaHistogram = _.isEmpty(newHisto.pythiaHistograms);
				}
			
				$rootScope.isVisibleSummary = !isEmptySummary;
				$rootScope.isVisiblePythiaTree = !isEmptyPythiaTree;
				$rootScope.isVisiblePythiaHistogram =  !isEmptyPythiaHistogram;
				$rootScope.isVisibleActionHisto = !isEmptyActionHisto;
				$rootScope.isVisibleScorerHisto = !isEmptyScorerHisto;
				
				$scope.pageList['Histograms']['Summary'].isVisible =!isEmptySummary;
				$scope.pageList['Histograms']['GAMOS Data'].isVisible = !isEmptyActionHisto;
				$scope.pageList['Histograms']['Scorers'].isVisible = !isEmptyScorerHisto;
				$scope.pageList['Histograms']['Pythia tree'].isVisible = !isEmptyPythiaTree;
				$scope.pageList['Histograms']['Pythia data'].isVisible = !isEmptyPythiaHistogram;
				
				$scope.isVisibleTitle = !isEmptySummary ||  !isEmptyActionHisto || !isEmptyScorerHisto ||
														!isEmptyPythiaTree || !isEmptyPythiaHistogram;
				
			},true)
			
			
			$scope.$watch(()=>{
					return $location.path()
				},
				(newUrl,oldUrl)=>{
					for(let p in $scope.pageList['Main']){
						let url = $scope.pageList['Main'][p].url;
						if( url === newUrl){
							$scope.pageList['Main'][p].isActive = true;
						}else{
							$scope.pageList['Main'][p].isActive = false;
						}
					}
					
					for(let p in $scope.pageList['Histograms']){
						let url = $scope.pageList['Histograms'][p].url;
						if( url === newUrl){
							$scope.pageList['Histograms'][p].isActive = true;
						}else{
							$scope.pageList['Histograms'][p].isActive = false;
						}
					}
					
					for(let p in $scope.pageList['Addons']){
						let url = $scope.pageList['Addons'][p].url;
						if( url === newUrl){
							$scope.pageList['Addons'][p].isActive = true;
						}else{
							$scope.pageList['Addons'][p].isActive = false;
						}
					}
					
			},true);
			
	});
