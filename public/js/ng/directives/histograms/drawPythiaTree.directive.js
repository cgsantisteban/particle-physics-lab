"use strict"

lab.directive('drawPythiaTree',function($window, $document){
	 
	function link(scope,element,attr){
		
		var statusList = scope.pythiastatus.statusList,
			statusRangeList = scope.pythiastatus.statusRangeList; 
		
		var color = d3.scale.category20();
		
		var w = angular.element($window);
		
        w.bind('resize', function () {
			  scope.$apply();
	    });
	   
		var panel = angular.element(document.querySelector( '#tree' ));
		var windowFactor = 0.7,
			 widthPanel = panel.width(),
			 heightPanel = panel.width()*windowFactor;
		
		var margin = scope.margin,
			width = widthPanel - margin.left - margin.right,
			height = heightPanel - margin.top - margin.bottom;
		
		scope.getWidth = function () {
            return  panel.width();
        };
       
        var svg = null;
		scope.$watch(scope.getWidth, (newWidth, oldWidth)=> {
			if(typeof scope.eventjson != 'undefined'){
				d3.select("svg").remove();
				widthPanel =newWidth;
				heightPanel = widthPanel*windowFactor;
				width = widthPanel - margin.left - margin.right;
				height = heightPanel - margin.top - margin.bottom;
				svg = buildSVG(width,height);
				drawTree(svg,scope.eventjson);
			}
			else{
				console.error('undefined pythia event tree');
				return;
			}
			
		},true);
		
		
		function buildSVG(width,height){
			
			var svg = d3.select($document[0].querySelector('#tree')).append("svg")
			    .attr("width", width )
			    .attr("height", height)
			  	.append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			
			return svg;
		}
		
		function drawTree(svg,eventjson){
			
			var force = d3.layout.force()
			    .nodes(eventjson.nodes)
			    .links(eventjson.links)
			    .size([width, height])
			    .linkDistance(50)
			    .charge(-60)
			    .on("tick", tick)
			    .start();
			
			// build the arrow.
			svg.append("svg:defs").selectAll("marker")
			    .data(["end"])      
			  .enter().append("svg:marker") 
			    .attr("id", String)
			    .attr("viewBox", "0 -5 10 10")
			    .attr("refX", 15)
			    .attr("refY", -1.5)
			    .attr("markerWidth", 6)
			    .attr("markerHeight", 6)
			    .attr("orient", "auto")
			  .append("svg:path")
			    .attr("d", "M0,-5L10,0L0,5");

			// add the links and the arrows
			var colorStatus = d3.scale.category20();
			var path = svg.append("svg:g").selectAll("path")
			    .data(force.links())
			  .enter().append("svg:path")
			  	.style("stroke-width","1.5px")
			  	.attr("class", (d)=> { 
			    					if(d.bd) return "link"; 
			    					else return "link"; 
			    				})
			    .style("stroke",(d)=>{
			    	return colorStatus(getStatusRange(d.target.status));})
			  	.attr("marker-end", "url(#end)");
		
			// define the nodes
			var node = svg.selectAll(".node")
			    .data(force.nodes())
			  .enter().append("g")
			    .attr("class", "node")
			    .call(force.drag);
		
			// add the nodes
			var rScale = d3.scale.linear()
		     .domain([0 , d3.max(eventjson.nodes, (d)=> { return d.e; })])
		     .range([ 5, 25]);
			
			var circle = node.append("circle")
				.style("fill", (d)=> {return colorStatus(getStatusRange(d.status));})
				.attr("r", (d)=>{return rScale(d.e);});
			
			// add the text 
			var text = node.append("text")
			    .attr("x", -5)
			    .attr("y", 5)
			    .attr("dy", "0em")
			    .text((d)=> { return d.name; });
			
			node.append("title")
				.html((d)=>{ return nodeInfo(d)});
			
			var statusRange = _.range(1, 11);	
			var legend = svg.selectAll("legend")
				  .data(statusRange)
				.enter().append("g")
				
			legend.append("text")
			  .attr('x', 0)
			  .attr('y', 0)
			  .text('Status');	
				
			legend.append("rect")
			  .attr("height", 10)
			  .attr("width", 10)
			  .attr("x", 0)
		      .attr("y", (d, i)=>{ return i *  20 + 10;})
			  .attr("fill", (d)=>{ return colorStatus(d)});
			
			legend.append("text")
			  .attr('x', 15)
			  .attr('y', (d,i)=>{return i * 20 + 20;})
			  .html((d,i)=>{ return getStatusLegend(d);});
			
			function getStatusLegend(statusRange){
				var text;
				if(statusRange>0 && statusRange<=10) text = statusRangeList[statusRange];
				else  text = "Not defined";
				
				return text;
			}
			 
			function getStatusRange(status){
				var statusAbs = Math.abs(status);
				var statusRange;
				if(statusAbs>=11 && statusAbs<=19) statusRange = 1;
				else if(statusAbs>=21 && statusAbs<=29) statusRange = 2;
				else if(statusAbs>=31 && statusAbs<=39) statusRange = 3;
				else if(statusAbs>=41 && statusAbs<=49) statusRange = 4;
				else if(statusAbs>=51 && statusAbs<=59) statusRange = 5;
				else if(statusAbs>=61 && statusAbs<=69) statusRange = 6;
				else if(statusAbs>=71 && statusAbs<=79) statusRange = 7;
				else if(statusAbs>=81 && statusAbs<=89) statusRange = 8;
				else if(statusAbs>=91 && statusAbs<=99) statusRange = 9;
				else if(statusAbs>=101 && statusAbs<=109) statusRange = 10;
				else statusRange = 1;
				
				return statusRange;
			}
		
			function nodeInfo(node){
				var info = "<strong>N. event:</strong> " + node.nEvent + "<br />" +
						   "<strong>pdg:</strong> " + node.idParticle + "<br />" +
						   "<strong>status:</strong> " + node.status + ", " + statusList[Math.abs(node.status)]  + "<br />" +
						   "<strong>mothers: </strong>[" + node.mothers[0] + ", " + node.mothers[1] + "]"  + "<br />" +
						   "<strong>daughters: </strong>[" + node.daughters[0] + ", " + node.daughters[1] + "]"  + "<br />" +
						   "<strong>colour:</strong> " + node.colour + "<br />" +
						   "<strong>acolour:</strong> "	+ node.acolour + "<br />" +
						   "<strong>momentum (GeV/c):</strong> [" + node.p[0] + ", " + node.p[1] + ", " + node.p[2] + "]"  + "<br />" +
						   "<strong>energy (GeV):</strong> " + node.e + "<br />" +
						   "<strong>mass (GeV):</strong> " + node.m + "<br />";
				
				return info;
			} 
			
			function tick() {
			    path.attr("d", (d)=> {
			        var dx = d.target.x - d.source.x,
			            dy = d.target.y - d.source.y,
			            dr = Math.sqrt(dx * dx + dy * dy);
			        return "M" + 
			            d.source.x + "," + 
			            d.source.y + "A" + 
			            dr + "," + dr + " 0 0,1 " + 
			            d.target.x + "," + 
			            d.target.y;
			    });
		
			    node
			        .attr("transform", (d)=> { 
			  	    return "translate(" + d.x + "," + d.y + ")"; });
			}
			
		}//end drawTree
		
		
		function getParticleList(nodes){
			var particleList = [];
			nodes.forEach((node)=>{
				if(particleList.indexOf(node.name)<0) particleList.push(node.name);
			});
			
			return particleList;
		}
		
	}
	
	return {
		link: link,
		restrict: 'AE',
		scope: { 
				margin: '=',
				eventjson: '=',
				pythiastatus: '='
			}
	}
	
});
