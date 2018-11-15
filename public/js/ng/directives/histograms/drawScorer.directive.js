"use strict"

lab.directive('drawScorer',function($window, utilities){
		
	function link(scope,element,attr){
		
		let width = 90,
			height = 100;
		if(typeof scope.width != 'undefined' && typeof scope.heigth != 'undefined' ){
			width = scope.width;
			height = scope.height;
		}
		let gd = utilities.buildPlotly(element,width,height);
		
		scope.$watch('[scorer,graphtype,layer,isvalidlayer]', (newData, oldData, scope)=> {
			
			let scorer = newData[0],
				graphType = newData[1],
				layer = newData[2],
				isValidLayer = newData[3];
			
			if(typeof scorer != 'undefined' && scorer != null){
				let histogram = buildHistogram(scorer,graphType,layer,isValidLayer);
				Plotly.newPlot(gd, histogram.dataList, histogram.layout);
			}
			
		},true);
		
		function  buildHistogram(scorer,graphType,layer,isValidLayer){
			let dataList = [],
				layout = {};
	
			if(graphType === '2D projection' || graphType === '3D projection'){
				if(isValidLayer){
					
					let nx = scope.volume.parameterisation.parameters["N copies X"].value,
						ny = scope.volume.parameterisation.parameters["N copies Y"].value,
						nz = scope.volume.parameterisation.parameters["N copies Z"].value;
					
					let nTotalLayer = nx*ny;
					let iMin = (layer - 1)*nTotalLayer,
						iMax = layer*nTotalLayer -1;
					
					let z = [],
						text = [];
					for(let i=0;i<=ny;i++){
						let zRow = [],
							textRow = [];
						z.push(zRow);
						text.push(textRow);
					}
					
					for(let index=iMin;index<=iMax;index++){
						let rIndex = index - (layer-1)*nTotalLayer,
							row = parseInt(rIndex/nx),
							col = rIndex - nx*row,
							position = scorer.histogram.x.indexOf(index);
						
						if(position<0) {
								z[row][col] = 0;
								text[row][col] = z[row][col] + ' &#177; ' + 0 + ' ' + scorer.histogram.units;
							}
							else {
								z[row][col] = scorer.histogram.y[position];
								let error = scorer.histogram.error_y.array[position]; 
								text[row][col] = z[row][col] + ' &#177; ' + error + ' ' + scorer.histogram.units;
							}
					}
					
					let sizeUnits = scope.volume.solid.dimensions["Length X"].units;
					let dimX = scope.volume.solid.dimensions["Length X"].value,
						dimY = scope.volume.solid.dimensions["Length Y"].value;
						
					let	sizeCellX = dimX / nx,
						sizeCellY = dimY / ny;
					let data = {
						  name: scorer.data,
						  x: _.range(0,dimX+sizeCellX,sizeCellX),
						  y: _.range(sizeCellY/2,dimY+sizeCellY,sizeCellY),
						  z: z,
						  text: text,
						  hoverinfo: 'text',
						  showscale: true
						};
						
					if(graphType === '2D projection') data.type = 'heatmap';
					if(graphType === '3D projection') data.type = 'surface';
					dataList = [data];
					
					let layoutTitle =  scorer.dataName.name;
					if(scorer.histogram.units.length > 0) layoutTitle +=  ' (' +scorer.histogram.units +')';
					layout = {
							  "xaxis": {
					              "title": 'X (' + sizeUnits + ')',
					              showgrid: true,
					            },
					           "yaxis": {
					              "title": 'Y ('+ sizeUnits + ')',
					              "range": [0,dimY],
								  "autorange": false,
					              "showgrid": true,
					           },
					           "showlegend": true,
					           "title": layoutTitle
					 }
					
				}
				
			}else{
				
				scorer.histogram.text = [];
				scorer.histogram.hoverinfo = 'text'
				for(let i=0;i<scorer.histogram.y.length;i++){
					let index = scorer.histogram.x[i],  
						y = scorer.histogram.y[i],
						error = scorer.histogram.error_y.array[i],
						text = 'index = ' + index + ', y = ' + y + ' &#177; ' + error + ' '+ scorer.histogram.units;
					scorer.histogram.text.push(text);
				}
		
				dataList = [scorer.histogram];
				let yTitle = scorer.histogram.name.name;
				if(typeof scorer.histogram.units != 'undefined' && scorer.histogram.units.length>0){
					yTitle += ' (' + scorer.histogram.units + ')';
				}
				layout = {
					          "xaxis": {
					              "title": 'index',
					              showgrid: true,
					            },
					           "yaxis": {
					              "title": yTitle,
					              "showgrid": true,
					           },
					           "showlegend": false
						}
			}
			
			layout.margin = {
				    l: 50,
				    r: 50,
				    b: 40,
				    t: 40,
				    pad: 4
				  };
			
			let histogram = {
					'dataList': dataList,
					'layout': layout
			}
			
			return histogram;
		}//buildHistogram
		
		window.onresize = function() {
		    Plotly.Plots.resize(gd);
		};
		
	}
	
	return {
		link: link,
		restrict: 'AE',
		scope: { 
				scorer: '=',
				volume: '=',
				graphtype: '=',
				layer: '=',
				isvalidlayer: '=',
				width: '=',
				height: '='
			}
	}
	
});
