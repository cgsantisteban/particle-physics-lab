"use strict"

lab.controller('SummaryCtrl', function($rootScope,$scope, $location){
	
	$scope.isViewData = true;
	
	if(typeof $rootScope.histograms.summary.partCount == 'undefined' && 
		typeof $rootScope.histograms.summary.procCount == 'undefined' && 
		typeof $rootScope.histograms.summary.procCreator == 'undefined'){
		$location.url('/');
		return;
	}
	
	let lParticleCounter = {
			  title: 'Particle Counter',
			  xaxis: {
				    title: 'Particles',
				    showline: true
				  },
			  yaxis: {
				    title: 'Number of particles',
				    showline: true
				  }
			};
	
	let lProcCounter = {
			  title: 'Process Counter',
			  xaxis: {
				    title: 'Particles',
				    showline: true
				  },
			  yaxis: {
				    title: 'Number of processes',
				    showline: true
				  },
			  barmode: 'group'
			};
	
	let lProcCreator = {
			  title: 'Process Creator',
			  xaxis: {
				    title: 'Particles',
				    showline: true
				  },
			  yaxis: {
				    title: 'Number of processes',
				    showline: true
				  },
			  barmode: 'group'
			};
	
	 
	let hParticleCounter = {
			data: [$rootScope.histograms.summary.partCount],
			layout: lParticleCounter
		};
	let hProcCounter =  {
			data: $rootScope.histograms.summary.procCount,
			layout: lProcCounter
		};
	let hProcCreator =  {
			data: $rootScope.histograms.summary.procCreator,
			layout: lProcCreator
		};
	
	$scope.histogramList = [hParticleCounter,hProcCounter,hProcCreator];
	$scope.selectedHistogram = $scope.histogramList[0];
	
});
