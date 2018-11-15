"use strict";

const fs = require('fs');
const archiver = require('archiver');
const config = require('../config');
const mongoose = require('mongoose');

let dbUrl = config.dbUrl;
let Experiment = null

if(config.isMongo){
	
	mongoose.connection.on('open', function (ref) {
		  console.log('Connected to mongo server.');
	});

	mongoose.connection.on('error', function (err) {
		  console.log('Error: Could not connect to mongo server');
		  console.log('========EXCEPTION=======');
		  console.log(err);
		  console.log('========END EXCEPTION===');
		  process.exit();
	});

	mongoose.connect(dbUrl); //connect to the db 				


	Experiment = mongoose.model('Experiment', { //experiment model
		name: String,
		description: String,
		date: Date,
		isVisualization: Boolean,
		macroFile: String,
		geomFile: String,
		physicsLib: String,
		processRemove: Array,
		emField: {
			electric: {
				Ex: {
					value: Number,
					units: String
				},
				Ey: {
					value: Number,
					units: String
				},
				Ez: {
					value: Number,
					units: String
				}
			},
			magnetic: {
				Bx: {
					value: Number,
					units: String
				},
				By: {
					value: Number,
					units: String
				},
				Bz: {
					value: Number,
					units: String
				},
			}
		},
		localField: {
			magnetic: {
				Bx: {
					value: Number,
					units: String
				},
				By: {
					value: Number,
					units: String
				},
				Bz: {
					value: Number,
					units: String
				}
			}
		},
		sourceList: Array,
		geometry: {
			volumeList: Array
		},
		data: {
			actionList: Array,
			scorerList: Array,
			filterList: Array
		},
		nBeams: Number,
		isPythia: Boolean,
		pythiaData: {}
	});
	
	//get experiment list
	module.exports.getExperimentList =  function(req,  res, next) {
		Experiment.find((err, experiments)=> {
			if (err)
				res.send(err)

			res.json(experiments); 
		});
	}

	//save experiment
	module.exports.saveExperiment = function(req, res, next) {
		let newExperiment = JSON.parse(req.query.experiment);
		
		if(typeof newExperiment._id == 'undefined'){
			Experiment.create(newExperiment, (err, experiment)=> {
				if (err){
					console.error(err);
					res.send(err);
				}
				Experiment.find((err, experiments)=> {
					if (err){
						console.error(err);
						res.send(err);
					}
					let data = {
						experimentList: experiments,
						experiment: experiment
					}				
					res.json(data);
				});
				
			});
		}else{
			let id = newExperiment._id;
			Experiment.findOneAndUpdate({_id: id}, newExperiment, (err, experiment)=> {
				if (err){
						console.error(err);
						res.send(err);
				}
				
				Experiment.find((err, experiments)=> {
					if (err){
						console.error(err);
						res.send(err);
					}
					let data = {
						experimentList: experiments,
						experiment: newExperiment
					}				
					res.json(data);
				});
				
			});
		}
	}

	//delete experiment
	module.exports.deleteExperiment = function(req, res, next) {
		Experiment.remove({
			_id : req.params.experiment_id

		}, (err, experiment)=> {
			if (err){
				res.send(err);
				console.error(err);
			}

			//get and return all the todos after you delete another
			Experiment.find((err, experiments)=> {
				if (err){
					res.send(err);
					console.error(err);
				}
				res.json(experiments);
			});
		});
	}
	
}




//remove in a future version
module.exports.getWRL = function(req, res, next) {
	let wrl = req.query.urlFile;
	let tmpExpPath = config.tmpDir;
  	let filePath = tmpExpPath + '/' + wrl; 
	
	fs.stat(filePath, (err)=> {
						
			if(err == null) {
				let error    = false; 
				let stream = fs.createReadStream(filePath, {bufferSize: 64 * 1024}); 

			    stream.pipe(res);
			
			    stream.on('error',(err)=> // Error downloading...
			    {
			        error = true; 
			    });
			
			    stream.on('close', (err)=>{// Finished downloading...
			        if (err){
			        	console.error(err);
			        }
			    }); 
			}
			else {
				console.error('error',err);	
			}
			
	});
};

module.exports.getExperimentFiles = function(req, res, next) {
	let expId = config.expId; //req.query.expId;
  	let tmpExpPath = config.tmpDir;
  	let expPath = tmpExpPath  + '/' + expId;
    let zipFile = tmpExpPath + '/' + expId + '.zip'; 
    
    fs.stat(expPath, (err) =>{
				
			if(err == null) {
				let output = fs.createWriteStream(zipFile);
				let archive = archiver('zip');
				
				output.on('close', ()=> {
				    let error    = false; 
					let stream = fs.createReadStream(zipFile, {bufferSize: 64 * 1024}); 
	
				    stream.pipe(res);
				
				    stream.on('error', (err)=> 
				    {
				        error = true; 
				    });
				
				    stream.on('close', ()=>{ // Finished downloading...
				        if (error){
				    		console.error('ERROR: Download experiment folder');
				        }
				        else{
				        	
				        	fs.unlink(zipFile, (err)=>{
				        		if(err) {
							      throw err;
							    }
							});	
				        }
				    });
				});
				
				archive.on('error', (err)=>{
				    throw err;
				});
				
				archive.pipe(output);
				
				archive.glob('*', {cwd: expPath}, (err)=> {
					 if(err) console.error(err);
				})
				
				archive.finalize();

			}
			else {
				console.error('ERROR: Download experiment folder');	
			}
			
	});
};

/*
*/


