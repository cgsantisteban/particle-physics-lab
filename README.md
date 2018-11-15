# Particle physics laboratory

Front-end for [GAMOS 5.1.0](http://fismed.ciemat.es/GAMOS/gamos.php). Simple introduction to [GAMOS 5.1.0](http://fismed.ciemat.es/GAMOS/gamos.php) and Monte Carlo simulations for Particle Physics.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine.


### Prerequisites

Required software.

- [GAMOS 5.1.0](http://fismed.ciemat.es/GAMOS/gamos.php).
- [NodeJS](https://nodejs.org/). (Recommended version 6.x.x).

Optional software.

- [MongoDB](https://www.mongodb.com/). (Minimum version 3.2.x).


### Installing

1. Download Particle Laboratory or clone this project.
2. Open a terminal and go to Particle Laboratory folder.
3. Installing dependencies. Type.

```bash
npm install
```

4. Minify javascript, compile StackCounter plug-in and Fit Histograms (ROOT).

If you have previously installed gulp, type:

```bash
gulp
```

otherwise type:

```bash
node_modules/.bin/gulp
```

*Note: You must set the GAMOS environment variables (GAMOS_PATH/conf/confgamos.sh file)*


## Running

1. Go to application folder and type:

```bash
node server.js -p port -d temporary_directory -a server_address -m y/n
```

Example

```bash
node server.js -p 3000 -d tmp -m n
```

A http server starts listening on a port 3000, creates the temporary folder *tmp*. 
- Address argument (a) is optional, default value is 127.0.0.1 (localhost).
- Mongo argument (m) is optional, default value is no.


2. Open a web browser (Google Chrome recommended) and go to:

```
http://server_address:port
```

Example:

```
http://localhost:3000
```


## Built With

* [AngularJS v1.6.6](https://angularjs.org/) - Web framework.
* [ThreeJS v0.72](http://threejs.org/) - 3D Graphics.
* [Plotly v1.30.0](https://plot.ly/javascript/getting-started/) -  Interactive charts.
* [NodeJS](https://nodejs.org/) - JavaScript environment.
* [GAMOS 5.1.0](https://plot.ly/javascript/getting-started/) - Geant4-based Architecture for Medicine-Oriented Simulations. 
* [Geant4 10.02](http://geant4.web.cern.ch/geant4/) - Toolkit for the simulation of the passage of particles through matter.
* [ROOT v5.34.36](http://root.cern.ch/) - Data analysis framework.


## Authors

* **Alejandro Fernandez** - *Initial work* - [Centro Guadalinfo de Santisteban del Puerto](http://www.guadalinfo.es)

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://opensource.org/licenses/MIT) file for details

