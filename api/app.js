"use strict";

const fs = require('fs');
const express = require('express');

let app = express();
let config = require('./config');
let routes = require('./routes/index'); 


app.get("/", function (req, res) {
  res.redirect("index.html");
});

app.use(express.static(__dirname+'/../public'));
app.get('/getWRL', routes.experiment.getWRL); //<-- delete in new release
app.get('/getExperimentFiles', routes.experiment.getExperimentFiles);


if(config.isMongo){
	app.get('/db/experiments/', routes.experiment.getExperimentList);
	app.post('/db/experiments/',routes.experiment.saveExperiment);
	app.delete('/db/:experiment_id',routes.experiment.deleteExperiment);
}

module.exports = app;

