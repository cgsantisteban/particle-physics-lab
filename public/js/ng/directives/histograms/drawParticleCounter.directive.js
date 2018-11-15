"use strict"

lab.directive('drawParticleCounter',function($window, utilities){
		
	function link(scope,element,attr){
		
		
		let width = 90,
			height = 100;
		if(typeof scope.width != 'undefined' && typeof scope.heigth != 'undefined' ){
			width = scope.width;
			height = scope.height;
		}
		
		let gd = utilities.buildPlotly(element,width,height);
		
		scope.$watch('histogram', (newHistogram, oldHistogram, scope) =>{
			let dataList = newHistogram.data,
				layout = newHistogram.layout;
				
			Plotly.newPlot(gd, dataList,layout);
			
		},true);
		
		window.onresize = function() {
		    Plotly.Plots.resize(gd);
		};
		
		
	}
	
	return {
		link: link,
		restrict: 'AE',
		scope: { 
				histogram: '=',
				width: '=',
				height: '='
			}
	}
	
});
