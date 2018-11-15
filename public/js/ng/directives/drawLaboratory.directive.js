"use strict"

lab.directive("drawLaboratory", function($window){
	
	function link(scope, element){

    	var pi = Math.PI;
    	var factorWindow = 0.6;
    	var wThree = element;
    	var widthContainer = element[0].clientWidth,
			heightContainer = widthContainer*factorWindow,
			container, camera, scene, renderer, controls, axes;
    	
		var labRoomVolume = _.find(scope.volumelist,function(v){
			return v.isWorld;
		});
		
		var labSize = 100;
		var labDimension = [];
		if(typeof labRoomVolume != 'undefined'){
			labDimension = [labRoomVolume.solid.dimensions["Length X"].value, labRoomVolume.solid.dimensions["Length Y"].value,
							labRoomVolume.solid.dimensions["Length Z"].value];
			labSize = Math.max.apply(null, labDimension);	
		}else{
			labDimension = [labSize,labSize,labSize];
		}
	
		initScene(labSize,widthContainer,heightContainer);
      	render();
    
      	new ResizeSensor(element[0], function() {
	    	widthContainer = element[0].clientWidth;
	    	heightContainer = widthContainer*factorWindow;
	    	var SCREEN_WIDTH = widthContainer*1, SCREEN_HEIGHT = heightContainer*1;
	    	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	    	clearScene();
			drawScene(scope.volumelist,scope.sourcelist,scene);
			render();	
		});
      	
      	
	  	function initScene(labSize, widthContainer,heightConatainer) {
	     	//camera
			camera = new THREE.PerspectiveCamera( 100, widthContainer/heightContainer, 1, 1000 );
			camera.position.x = labSize;
			camera.position.y = labSize; 
			camera.position.z = labSize;
			
			container = element[0];
			
			//scene
			scene = new THREE.Scene();
			scene.fog = new THREE.FogExp2( 0xffffff, 0.002 );
			
			// renderer
			renderer = Detector.webgl? new THREE.WebGLRenderer(): new THREE.CanvasRenderer();
			renderer.setClearColor( scene.fog.color, 1 );
			var SCREEN_WIDTH = widthContainer*1, SCREEN_HEIGHT = heightContainer*1;
			renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
			container.appendChild( renderer.domElement );
			
			//Controls
			controls = new THREE.OrbitControls( camera , container);
			controls.addEventListener( 'change', render );
		}
	  	
      	function drawScene(figureList,listSources, scene){
      	
      		//grid xz
      		var labRoomVolume = _.find(figureList,function(v){
				return v.isWorld;
			});
			
			var labSize = 100;
			var labDimension = [];
			if(typeof labRoomVolume != 'undefined'){
				labDimension = [labRoomVolume.solid.dimensions["Length X"].value, labRoomVolume.solid.dimensions["Length Y"].value,
								labRoomVolume.solid.dimensions["Length Z"].value];
				labSize = Math.max.apply(null, labDimension);	
			}else{
				labDimension = [labSize,labSize,labSize];
			}
			
      		var step = 10;
      		var gridXZ = new THREE.GridHelper(labSize, step);
      		gridXZ.position.set(0,0,0);
      		scene.add(gridXZ);
      		
      		//labRoom
      		var labGeometry = new THREE.BoxGeometry( labDimension[0], labDimension[1], labDimension[2]);
      		var labMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
      		var labObject = new THREE.Mesh( labGeometry, labMaterial );
      		var labRoom = new THREE.BoxHelper( labObject );
      		scene.add( labRoom );
      		
      		//axis
      		var axisHelper = new THREE.AxisHelper( labSize );
      		scene.add( axisHelper );
      		//axis text	
      		var red = 0xff0000, 
      			green = 0x00ff00,
      			blue = 0x0000ff;
      		var pX = buildText('X+',3,0,red);
      		pX.position.set(labDimension[0]*0.9,2,0);
      		scene.add(pX);
      		var pY = buildText('Y+',3,0,green);
      		pY.position.set(2,labDimension[1]*0.9,0);
      		scene.add(pY);
      		var pZ = buildText('Z+',3,0,blue);
      		pZ.position.set(0,2,labDimension[2]*0.9);
      		scene.add(pZ);
      		
      		//draw sources
      		for(var i=0;i<listSources.length;i++){
      				if(listSources[i].tPosition != 'volume'){
      					var sourceFigure = buildSource(listSources[i], labSize);
    	      			scene.add(sourceFigure);
      				}
      				
	      	}
	  		
      		//draw solids
      		for(var i=0;i<figureList.length;i++){
      			
      			var figureJSON = figureList[i];
      			
      			//var figure;
      			if(!figureJSON.isWorld){
      				var solidType = figureJSON.solid.solidType,
	      				positionX = figureJSON.position["X"].value,
					    positionY = figureJSON.position["Y"].value,
					    positionZ = figureJSON.position["Z"].value,
						rotationX = figureJSON.rotation["Rx"].value,
						rotationY = figureJSON.rotation["Ry"].value,
						rotationZ = figureJSON.rotation["Rz"].value;
      				
      				var figure = buildFigure(figureJSON);
      				if(figureJSON.isParam){
    	    	  			var parentVolume = _.find(figureList,(v)=>{
    	    	  				return v.name === figureJSON.parentVolume;
    	    	  			});
    	    	  			var figureParam = null;
    	    	  			if(typeof parentVolume != 'undefined'){
    	    	  				
    	    	  				//var figureRot = rotateFigure(figure,solidType,positionX,positionY,positionZ, 
    	     					//		 rotationX,rotationY,rotationZ);
    	    	  				if(figureJSON.parameterisation.type != 'PHANTOM'){
    	    	  					figureParam = buildParam(figureJSON,figure,labRoom,parentVolume);
    	    	  				}
    	    	  				else{
    	    	  					
    	    	  					figureParam = rotateFigure(figure,solidType,positionX,positionY,positionZ, 
    	        							 rotationX,rotationY,rotationZ);
    	    	  				}
    	    	  				
    	    	  				//rotation parent Volume
    	    	  				rotationX = parentVolume.rotation["Rx"].value,
        						rotationY = parentVolume.rotation["Ry"].value,
        						rotationZ = parentVolume.rotation["Rz"].value;
        	    	  			var figureRot = rotateFigure(figureParam,solidType,positionX,positionY,positionZ,
    	    	  								 rotationX,rotationY,rotationZ);
        	    	  			figureRot.position.set(parentVolume.position["X"].value,
    	    	  						parentVolume.position["Y"].value, parentVolume.position["Z"].value);
            	    	  		scene.add(figureRot);
    	    	  				//scene.add(figureParam);
    	    	  			}
    	    	  			
    	    		}else{
    	    			var figureRot = rotateFigure(figure,solidType,positionX,positionY,positionZ, 
     							 rotationX,rotationY,rotationZ);
    	    			scene.add(figureRot);
    	    		}
    	    	  	
      			} //end figureJSON !== labRoom
	      		
      		}
      	
      	}
     	
      	function rotateFigure(figure,solidType,positionX,positionY,positionZ,
      							rotationX,rotationY,rotationZ){
    
      		var figureRot = figure;
      	
			
			if(solidType === 'BOX'){
				rotationX = -rotationX*pi/180;
				rotationY = -rotationY*pi/180;
				rotationZ = -rotationZ*pi/180;
			}
			else if(solidType === 'SPHERE'){
				rotationX = - rotationX*pi/180;
				rotationY = - rotationY*pi/180;
				rotationZ = - (rotationZ)*pi/180;
			}
			else if(solidType === 'CONS' || solidType === 'TUBS' || solidType === 'TUBE'){
				rotationX = -rotationX*pi/180;
				rotationY = -rotationY*pi/180;
				rotationZ = (-rotationZ - 90)*pi/180;
			}
			else {
				rotationX = -rotationX*pi/180;
				rotationY = -rotationY*pi/180;
				rotationZ = -rotationZ*pi/180;
			}
			
			var transformations = new THREE.Matrix4();
			var rot = new THREE.Euler( rotationX, rotationY, rotationZ, 'XYZ' );
			
			transformations.makeRotationFromEuler(rot);
			figureRot.applyMatrix(transformations);
			transformations.makeTranslation(positionX, positionY, positionZ );	
			figureRot.applyMatrix(transformations);
					
			return figureRot;

      	}

      	//clearScene
      	function clearScene(){
      		
      		var obj, i;
      		for ( i = scene.children.length - 1; i >= 0 ; i -- ) {
      		    obj = scene.children[ i ];
      		    if ( obj !== axes && obj !== camera) {
      		        scene.remove(obj);
      		    }
      		}
      		
		}
      	
		scope.$watch('[volumelist,isvalidvolumes]',function(newValues,oldValues){
			var volumeList = newValues[0],
				isvalidvolumes = newValues[1];
			//if(isvalidvolumes){
				if(volumeList.length>0){
					updateScene(scene, volumeList,scope.sourcelist,labSize)
				}
			//}
	    	
		},true);
		
	    function updateScene(scene, volumeList,sourceList,labSize){
	    	
			clearScene();
			drawScene(volumeList,sourceList,scene,labSize);
			render();
			
    	}
		
	    scope.$watch('sourcelist',function(newSourceList,oldSourceList){
				if(newSourceList)
				{
					clearScene();
					drawScene(scope.volumelist,newSourceList,scene);
					render();
				}
		},true);
	    
		function render() {
			renderer.render(scene, camera);
		
		}


		function buildFigure(figureJSON){
			let figure = new THREE.Object3D(),
				solidType = figureJSON.solid.solidType,
				color = figureJSON.color,
				opacity = figureJSON.opacity;
				
			var material = new THREE.MeshBasicMaterial( { color: color, 
				  										side: THREE.DoubleSide,
				  										wireframe: false} );
			
			material.transparent = true;
			material.opacity = opacity; 
			
			if(solidType === 'TUBE'){
				var innerRadius = figureJSON.solid.dimensions['Inner radius'].value,
					outerRadius = figureJSON.solid.dimensions['Outer radius'].value,
					startPhi = 0, 
					deltaPhi = 360,
					length = figureJSON.solid.dimensions['Length'].value;
				
				figure = buildCone(innerRadius,innerRadius,outerRadius,outerRadius,
								  length,startPhi, deltaPhi,material);
			}
			else if(solidType === 'TUBS'){
				var innerRadius = figureJSON.solid.dimensions['Inner radius'].value,
					outerRadius = figureJSON.solid.dimensions['Outer radius'].value,
					startPhi = figureJSON.solid.dimensions['Starting phi'].value,
					deltaPhi = figureJSON.solid.dimensions['Delta phi'].value,
					length = figureJSON.solid.dimensions['Length'].value;
				
				figure = buildCone(innerRadius,innerRadius,outerRadius,outerRadius,
								  length,startPhi, deltaPhi,material);
			}
			else if(solidType === 'BOX'){
				var lengthX = figureJSON.solid.dimensions['Length X'].value,  
					lengthY = figureJSON.solid.dimensions['Length Y'].value,
					lengthZ = figureJSON.solid.dimensions['Length Z'].value;
					
				figure = buildBox(lengthX,lengthY,lengthZ, material);
				
			}
			else if(solidType === 'SPHERE'){
				
				var innerRadius = figureJSON.solid.dimensions['Inner radius'].value,
					outerRadius = figureJSON.solid.dimensions['Outer radius'].value,
					startPhi = figureJSON.solid.dimensions['Starting phi'].value,
					deltaPhi = figureJSON.solid.dimensions['Delta phi'].value,
					startTheta = figureJSON.solid.dimensions['Starting theta'].value,
					deltaTheta = figureJSON.solid.dimensions['Delta theta'].value;
				
				figure = buildPartialSphere(innerRadius,outerRadius,startPhi,deltaPhi,startTheta,deltaTheta, material);
			}
			else if(solidType === 'CONS'){
				
				var innerRadiusDown = figureJSON.solid.dimensions['Inner radius down'].value,
					innerRadiusUp = figureJSON.solid.dimensions['Inner radius up'].value,
					outerRadiusDown = figureJSON.solid.dimensions['Outer radius down'].value,
					outerRadiusUp = figureJSON.solid.dimensions['Outer radius up'].value,
					length = figureJSON.solid.dimensions['Length'].value,
					startPhi = figureJSON.solid.dimensions['Starting phi'].value,
					deltaPhi = figureJSON.solid.dimensions['Delta phi'].value;
				
				figure = buildCone(innerRadiusDown,innerRadiusUp,outerRadiusDown,outerRadiusUp,
								  length,startPhi,deltaPhi,material);
			}
			else{ //figure == SHAPE
				figure = buildShape(figureJSON.dimensions.innerRadiusDown,figureJSON.dimensions.innerRadiusUp,
						  figureJSON.dimensions.outerRadiusDown,figureJSON.dimensions.outerRadiusUp,
						  figureJSON.dimensions.length,material);
			}
			
			figure.name = figureJSON.name;
			return figure;		
		}

		
		function buildSource(source,labSize){
			
			var sourceObject = new THREE.Object3D();
			var charge ='neutral',
				position = [0,0,0], 
				radius = 1,
				length = labSize / 100;
			
			if(source.type !== 'isotopes' && source.type !== 'GAMOS isotopes') charge = source.particle.charge; 
			
			var i=0;
			for(var c in source.distributions.Position.parameters){
				if(typeof source.distributions.Position.parameters[c].value != 'undefined')
				position[i] = source.distributions.Position.parameters[c].value;
				i++;
			}
					
			let color = 0x00ff00;
			switch(charge) {
			    case 'neutral':
			        color = 0x00ff00
			        break;
			    case 'positive':
			        color = 0x0000ff
			        break;
			    case 'negative':
			    	color = 0xff0000
			    	break;
			    default:
			        color = 0x00ff00
			}
			var directionType;
			if(source.type === 'GAMOS isotopes') directionType = 'Random';
			else directionType =  source.distributions.Direction.type;
			
			var orig = 	new THREE.Vector3(position[0],position[1],position[2]);

			let dx = 1, dy = 1, dz = 1;
			if(directionType === 'Random'){
				var dir = [
							new THREE.Vector3( dx, 0, 0 ).normalize(),
							new THREE.Vector3( -dx, 0, 0 ).normalize(),
							new THREE.Vector3( 0, dy, 0 ).normalize(),
							new THREE.Vector3( 0, -dy, 0 ).normalize(),
							new THREE.Vector3( 0, 0, dz ).normalize(),
							new THREE.Vector3( 0, 0, -dz ).normalize(),
							new THREE.Vector3( dx, dy, dz ).normalize(),
							new THREE.Vector3( -dx, dy, dz ).normalize(),
							new THREE.Vector3( -dx, dy, -dz ).normalize(),
							new THREE.Vector3( dx, -dy, -dz ).normalize(),
							new THREE.Vector3( dx, -dy, dz ).normalize(),
							new THREE.Vector3( dx, dy, -dz ).normalize(),
							new THREE.Vector3( -dx, -dy, dz ).normalize(),
							new THREE.Vector3( -dx, -dy, -dz ).normalize()
						  ];
							
				for(var i=0;i<dir.length;i++){
					var arrowSource = new THREE.ArrowHelper( dir[i], orig, length, color );
					sourceObject.add( arrowSource );
				}
			}
			
			if(directionType === 'Constant' || directionType === 'Cone'){
				
				if(typeof source.distributions.Direction.parameters != 'undefined'){
					dx = source.distributions.Direction.parameters['x'].value;
					dy = source.distributions.Direction.parameters['y'].value;
					dz = source.distributions.Direction.parameters['z'].value;
				}
				var dirData = new THREE.Vector3( dx, dy, dz ), //direccion procedente de la interfaz en la definición de la fuente
					dir = dirData.normalize(), //normalizamos la direccion
					arrowSource = new THREE.ArrowHelper( dir, orig, length, color );
					sourceObject.add(arrowSource);
			}
			
			return sourceObject; 
		}
	
		//build text geometry
		function buildText(text,size,height,color){
			var textGeom = new THREE.TextGeometry(text, {size: size, height: height});
	  		var mesh_text = new THREE.MeshBasicMaterial( { color: color });
	 		var textFigure = new THREE.Mesh(textGeom, mesh_text);
			return textFigure;
		}

		//parameterisation
		function buildParam(figureJSON, figureTHREE, labRoom,parentVolume){
			
			var paramType = figureJSON.parameterisation.type;
			var paramObject = new THREE.Object3D();
			
			var	nCopies = figureJSON.parameterisation.parameters["N copies"].value,
	    		step = figureJSON.parameterisation.parameters["Step"].value,
			    offset = figureJSON.parameterisation.parameters["Offset"].value,
			    pi = Math.PI;
			
			var radius;
			if(paramType === 'CIRCLE_XY' || paramType === 'CIRCLE_XZ' || paramType === 'CIRCLE_YZ'){
				radius = figureJSON.parameterisation.parameters["Radius"].value;
			}
				
			  
			var labRoomBox = new THREE.Box3().setFromObject(labRoom); //intersection
			
			var rotationX = figureJSON.rotation["Rx"].value*pi/180,
				rotationY = figureJSON.rotation["Ry"].value*pi/180,
				rotationZ = figureJSON.rotation["Rz"].value*pi/180;
			
			
			for(var i=0;i<nCopies;i++){
				var newVolume = figureTHREE.clone();
				var	positionX = 0; 
				var	positionY = 0;
				var positionZ = 0;
				var rotPar = (step*i + offset)*pi/180;
				
				if(paramType === 'CIRCLE_XY') {
					positionX = radius*Math.cos((step*i + offset)*pi/180);
					positionY = radius*Math.sin((step*i + offset )*pi/180);
					newVolume.rotation.set(rotationX,rotationY,rotationZ + rotPar);
				}
				
				if(paramType === 'CIRCLE_XZ') {
					positionX = radius*Math.cos((step*i + offset)*pi/180);
					positionZ = radius*Math.sin(-(step*i + offset)*pi/180);
					newVolume.rotation.set(rotationX,rotationY + rotPar,rotationZ);
				}
				
				if(paramType === 'CIRCLE_YZ') {
					positionY = radius*Math.sin(-(step*i + offset -90)*pi/180 );
					positionZ = radius*Math.cos((step*i + offset -90)*pi/180 );
					newVolume.rotation.set(rotationX + rotPar,rotationY, rotationZ);
				}
				
				if(paramType === 'LINEAR_X'){
					
					positionX = offset+i*step;
					newVolume.rotation.set(rotationX ,rotationY, rotationZ);	
					
				} 
				 
				if(paramType === 'LINEAR_Y'){
					positionY = offset+i*step;
					newVolume.rotation.set(rotationX,rotationY, rotationZ);
				} 
				
				if(paramType === 'LINEAR_Z'){
					positionZ = offset+i*step;
					newVolume.rotation.set(rotationX,rotationY, rotationZ);
				} 
				
				newVolume.position.set(positionX,positionY,positionZ);
				
				//var cellBox = new THREE.Box3().setFromObject(newVolume); //cell outside labroom
				/*if(typeof scope.isin[figujreJSON.name] == 'undefined'){
					isinparam = {
							isValid: true	
						}
				}*/
				/*var isinparam = {};
				isinparam.isValid = labRoomBox.isIntersectionBox(cellBox);
				scope.isin[figureJSON.name]= isinparam;*/
				paramObject.add(newVolume);
				
			}

			

			return paramObject;
		}

		//build ring geometry
		function buildRing(innerRadius,outerRadius,phiStart,phiLength){
			var ringShape = new THREE.Shape();
			if(phiLength<360){
				phiStart = phiStart*Math.PI/180; // degree to radians
				phiLength = phiLength*Math.PI/180;
				if(innerRadius !== 0)
					ringShape.moveTo(innerRadius*Math.cos(phiStart+phiLength),innerRadius*Math.sin(phiStart+phiLength));
				else
					ringShape.moveTo(0,0);
				
				ringShape.lineTo(outerRadius*Math.cos(phiStart+phiLength),outerRadius*Math.sin(phiStart+phiLength));
				ringShape.absarc(0,0,outerRadius,phiStart+phiLength,phiStart,true);
				
				if(innerRadius !== 0){
					ringShape.lineTo(innerRadius*Math.cos(phiStart),innerRadius*Math.sin(phiStart));
					ringShape.absarc(0,0,innerRadius,phiStart,phiStart+phiLength,true);
				}
				else
					ringShape.lineTo(0,0);
			}
			else{
				ringShape.absarc(0,0,outerRadius,0,2*Math.PI,true);
				if(innerRadius !==0){
					var innerRing = new THREE.Path();
			        innerRing.absarc(0, 0, innerRadius, 0, 2*Math.PI, true);
			        ringShape.holes.push(innerRing);
				}
			}
			
			return ringShape;
			
		}
		
		//SPHERE ------------------------
		function buildPartialSphere(innerRadius,outerRadius,phiStart,phiLength,thetaStart,thetaLength, material){
			var partialSphere;
									
			if((phiStart === 0) && (phiLength>=360) && (thetaStart === 0) && (thetaLength >= 180)) {
				var widthSegments = 16,
					heightSegments = 16;
				
				var	geometry = new THREE.SphereGeometry( outerRadius, widthSegments, heightSegments );
				partialSphere = new THREE.Mesh( geometry, material );
			}else{
				
				partialSphere = new THREE.Object3D()
				//var colorFaces = 0x00ee00,
				var materialFaces = material; //new THREE.MeshBasicMaterial( { color: colorFaces, side: THREE.DoubleSide, wireframe: false } );
			
				var pi = Math.PI,
					innerPoints = [],
					outerPoints = [];
	
				//inner and outer sphere
				if(thetaStart + thetaLength > 180) thetaLength = 180 - thetaStart;
				for (var i = thetaStart-90; i <= thetaStart + thetaLength - 90; i=i+2) {
					if(innerRadius > 0) 
						innerPoints.push(new THREE.Vector3(0,innerRadius*Math.cos(-i*pi/180),innerRadius*Math.sin(-i*pi/180)));
					
					outerPoints.push(new THREE.Vector3(0,outerRadius*Math.cos(-i*pi/180),outerRadius*Math.sin(-i*pi/180)));
				}
				var innerSphereGeometry,
					outerSphereGeometry,
					innerSphere,
					outerSphere,
					colorInner = 0x0000ff,
					materialInner;
				
				if(innerRadius > 0){
					innerSphereGeometry = new THREE.LatheGeometry(innerPoints, 24, (phiStart-90)*pi/180, phiLength*pi/180);
					materialInner = material;
					innerSphere = new THREE.Mesh(innerSphereGeometry,materialInner);
					partialSphere.add(innerSphere);
				}
				
				outerSphereGeometry = new THREE.LatheGeometry(outerPoints, 24, (phiStart-90)*pi/180, phiLength*pi/180);
				outerSphere = new THREE.Mesh(outerSphereGeometry,material);
				partialSphere.add(outerSphere);
				
				//cone 
				var pointsCone1 = [],
					pointsCone2 = [],
					ninterv = 30;
				
				var dh = (outerRadius-innerRadius)/ninterv;
				for(var i=0;i<=ninterv;i++){
					pointsCone1.push(new THREE.Vector3(0,(innerRadius+dh*i)*Math.cos(-(thetaStart+thetaLength-90-0)*pi/180),
									(innerRadius+dh*i)*Math.sin(-(thetaStart+thetaLength-90-1)*pi/180)));
					pointsCone2.push(new THREE.Vector3(0,(innerRadius+dh*i)*Math.cos(-(thetaStart-90)*pi/180),
									(innerRadius+dh*i)*Math.sin(-(thetaStart-90)*pi/180)));	
				}
				
				var coneGeometry1 = new THREE.LatheGeometry(pointsCone1, 24, (phiStart -90)*pi/180, phiLength*pi/180);
				var coneMesh1 = new THREE.Mesh(coneGeometry1,materialFaces);
				var coneGeometry2 = new THREE.LatheGeometry(pointsCone2, 24, (phiStart -90)*pi/180, phiLength*pi/180);
				var coneMesh2 = new THREE.Mesh(coneGeometry2,materialFaces);
				partialSphere.add(coneMesh1);
				partialSphere.add(coneMesh2);
				
				
				//faces
				if(phiLength < 360){
					materialFaces = material; //new THREE.MeshBasicMaterial( { color: 0xff00ff, side: THREE.DoubleSide, wireframe: false } );
					var faceShape = buildRing(innerRadius,outerRadius,thetaStart,thetaLength),
					faceGeometry = new THREE.ShapeGeometry(faceShape),
					face1 = new THREE.Mesh(faceGeometry,materialFaces);
					
					
					var rx = 0,
						ry = -(90)*pi/180,
						rz = 0;
						
					var transformations = new THREE.Matrix4();
					var rot = new THREE.Euler( rx, ry, rz, 'XYZ' );
					transformations.makeRotationFromEuler(rot);
					face1.applyMatrix(transformations);
					var faceClone1 = face1.clone();
					ry = 0;
					rz = -(90 - phiStart)*pi/180;
					rot = new THREE.Euler( rx, ry, rz, 'XYZ' );
					transformations.makeRotationFromEuler(rot);
					faceClone1.applyMatrix(transformations);
					
					var faceClone2 = face1.clone();
					rz = -(90 - phiStart - phiLength)*pi/180;
					rot = new THREE.Euler( rx, ry, rz, 'XYZ' );
					transformations.makeRotationFromEuler(rot);
					faceClone2.applyMatrix(transformations);
					
					
					partialSphere.add(faceClone1);
					partialSphere.add(faceClone2);
				
				}
					
				
			} //else
			
			return partialSphere;

		}
		//end SPHERE ------------------
		
		//BOX ----------
		function buildBox(lengthX,lengthY,lengthZ,material){
			var geometry = new THREE.BoxGeometry(lengthX,lengthY,lengthZ);
			var box = new THREE.Mesh( geometry, material );
		
			return box;
		}
		//end BOX
		
		//CONE ------------
		function buildCone(innerRadiusDown, innerRadiusUp, outerRadiusDown, outerRadiusUp, length, phiStart, phiLength,material){
		 
			var coneObject = new THREE.Object3D(),
				pointsConeInner = [],
				pointsConeOuter = [],
			    ninterv = 30,
			    degtorad = Math.PI/180;
			
			var dhInner = (innerRadiusUp-innerRadiusDown)/ninterv,
				dhOuter = (outerRadiusUp-outerRadiusDown)/ninterv;
			for(var i=0;i<=ninterv;i++){
				if((innerRadiusUp === innerRadiusDown)){ //TUBS
					var yInner = innerRadiusUp,
						zInner = -length/2 + length*i/ninterv;
	
				}
				else{ //CONE
					var mInner = length/(innerRadiusUp-innerRadiusDown),
						yInner = innerRadiusDown+dhInner*i,
						bInner = -length/2 - mInner*innerRadiusDown,
						zInner = mInner*yInner+bInner;
				}
				
				if(outerRadiusUp === outerRadiusDown){ //TUBS
					var yOuter = outerRadiusUp,
					zOuter = -length/2 + length*i/ninterv;
				}
				else{ //CONE
					var	mOuter = length/(outerRadiusUp-outerRadiusDown),
						yOuter = outerRadiusDown+dhOuter*i,
						bOuter = -length/2 - mOuter*outerRadiusDown,
						zOuter = mOuter*yOuter+bOuter;
				}
				
				pointsConeInner.push(new THREE.Vector3(0, yInner, zInner));
				pointsConeOuter.push(new THREE.Vector3(0, yOuter, zOuter));	
			}
		
			var coneGeometryInner = new THREE.LatheGeometry(pointsConeInner, 24, phiStart*degtorad, (phiLength)*degtorad);
			var coneMeshInner = new THREE.Mesh(coneGeometryInner,material);
			var coneGeometryOuter = new THREE.LatheGeometry(pointsConeOuter, 24, phiStart*degtorad, (phiLength)*degtorad);
			var coneMeshOuter = new THREE.Mesh(coneGeometryOuter,material);
			
			coneObject.add(coneMeshInner);
			coneObject.add(coneMeshOuter);
			
			//up, down faces
			var faceShapeUp = buildRing(innerRadiusUp,outerRadiusUp,phiStart,phiLength),
			faceGeometryUp = new THREE.ShapeGeometry(faceShapeUp),
			faceUp = new THREE.Mesh(faceGeometryUp,material);
			faceUp.position.set(0,0,length/2);
			faceUp.rotation.set(0,0,90*degtorad);
			coneObject.add(faceUp);
			if(outerRadiusDown>0){
				var faceShapeDown = buildRing(innerRadiusDown,outerRadiusDown,phiStart,phiLength),
				faceGeometryDown = new THREE.ShapeGeometry(faceShapeDown),
				faceDown = new THREE.Mesh(faceGeometryDown,material);
				faceDown.position.set(0,0,-length/2);
				faceDown.rotation.set(0,0,90*degtorad);
				coneObject.add(faceDown);
			}
			
			//laterals
			if(phiLength<360){
				var lShape = new THREE.Shape(); 
				lShape.moveTo( innerRadiusDown,0 ); 
				lShape.lineTo( innerRadiusUp, length ); 
				lShape.lineTo( outerRadiusUp, length );
				if(innerRadiusDown !== outerRadiusDown) lShape.lineTo( outerRadiusDown, 0 ); 
				lShape.lineTo( innerRadiusDown, 0 ); 
				var lGeom = new THREE.ShapeGeometry( lShape ),
					lMesh = new THREE.Mesh(lGeom,material);
				var lMesh1 = lMesh.clone();
				lMesh.position.set(0,0,-length/2);
				lMesh1.position.set(0,0,-length/2);
				lMesh.rotation.set(90*degtorad,(90+phiStart)*degtorad,0);
				lMesh1.rotation.set(90*degtorad,(90+phiStart+phiLength)*degtorad,0);
				coneObject.add(lMesh);
				coneObject.add(lMesh1);
			}
			
			return coneObject;
			
		}
		//end CONE----------

    }
	
	return {
		link: link,
		restrict: 'AE',
		scope: { 
				
				volumelist: '=',
				sourcelist: '=',
				isvalidvolumes: '='
				//isin: '='
			}
	}
  
});
