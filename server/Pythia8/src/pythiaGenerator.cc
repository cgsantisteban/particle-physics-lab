// Based in example main41.cc that is a part of the PYTHIA event generator.
// Copyright (C) 2015 Torbjorn Sjostrand.
// PYTHIA is licenced under the GNU GPL version 2, see COPYING for details.
// Please respect the MCnet Guidelines, see GUIDELINES for details.

// Author: Mikhail Kirsanov, Mikhail.Kirsanov@cern.ch, based on main01.cc.
// This program illustrates how HepMC can be interfaced to Pythia8.
// It studies the charged multiplicity distribution at the LHC.
// HepMC events are output to the hepmcout41.dat file.

// WARNING: typically one needs 25 MB/100 events at the LHC.
// Therefore large event samples may be impractical.

//Author: Alejandro Fernández (guadalinfo.santistebandelpuerto@guadalinfo.es), based on example main41.cc (Author: Mikhail Kirsanov, Mikhail.Kirsanov@cern.ch)

#include <string>
#include <iostream>

#include "json.hpp"

#include "Pythia8/Pythia.h"
#include "Pythia8Plugins/HepMC2.h"

#include "TROOT.h"
#include "TFile.h"
#include "TH1F.h"

using json = nlohmann::json;
using namespace Pythia8;
using namespace std;

double getValue(string dataType,Particle particle){
	double data = 0;

	if(dataType == "px") data = particle.px();
	if(dataType == "py") data = particle.py();
	if(dataType == "pz") data = particle.pz();
	if(dataType == "e") data = particle.e();
	if(dataType == "xProd") data = particle.xProd();
	if(dataType == "yProd") data = particle.yProd();
	if(dataType == "zProd") data = particle.zProd();
	if(dataType == "tProd") data = particle.tProd();
	if(dataType == "pT2") data = particle.pT2();
	if(dataType == "eT2") data = particle.eT2();
	if(dataType == "pT") data = particle.pT();
	if(dataType == "eT") data = particle.eT();
	if(dataType == "y") data = particle.y();
	if(dataType == "eta") data = particle.eta();
	if(dataType == "theta") data = particle.theta();
	if(dataType == "phi") data = particle.phi();
	if(dataType == "mT") data = particle.mT();
	if(dataType == "mT2") data = particle.mT2();
	
	return data;
}

json buildJSON(string str, char delimiter) {
	json histogram;
	stringstream ss(str);
	string token;

	int nData = 0;
	while(getline(ss, token, delimiter)) {
		//e,Energy,gamma,22,20,0,100,GeV/c
		if(nData == 0){
			histogram["pythiaDataName"] = token;
		}

		if(nData == 1){
			string name = token;
			histogram["dataName"] = name;
		}

		if(nData == 2){
			string particle = token;
			histogram["particleName"] = particle;
		}

		if(nData == 3){
			int pdg = atoi(token.c_str());
			histogram["pdg"] = pdg;
		}

		if(nData == 4){
			int nBins = atoi(token.c_str());
			histogram["nbins"] = nBins;
		}

		if(nData == 5){
			double min = atof(token.c_str());
			histogram["minX"] = min;
		}

		if(nData == 6){
			double max = atof(token.c_str());
			histogram["maxX"] = max;
		}

		if(nData == 7){
			string units = token;
			histogram["unitsX"] = units;
		}

		nData++;
	}
	
	return histogram;
}

int writeOutEventCSV(string outEventFileCSV, Event event){
	ofstream outEvent;
	if( outEvent ) {
		remove( outEventFileCSV.c_str() );
	}
	outEvent.open(outEventFileCSV.c_str(),ios::app);
	outEvent<<"event,id,particle,status,mother1,mother2,daughter1,daughter2,colour,acolour,"<<
			"px,py,pz,e,m"<<"\n";

	int precision = 4;
	for(int i=0;i<event.size();i++){
		outEvent<<i<<","<<event[i].id()<<","<<event[i].nameWithStatus(18)<<","
				<<event[i].status() << ","<< event[i].mother1() <<","
				<< event[i].mother2() << "," << event[i].daughter1() << ","
				<< event[i].daughter2() << "," << event[i].col() << "," << event[i].acol() << ","
				<< setprecision(precision)
				<< event[i].px() << "," << event[i].py() << "," << event[i].pz() << ","
				<< event[i].e()<< "," << event[i].m() << "\n";
	}

	return 0;
}

json getDataHistogram(Hist histogram, int nBins){
	json dataJSON;
	json data;

	for(int i=0; i<=nBins+1;i++){
		int value = histogram.getBinContent(i);
		if(i == 0) dataJSON["underflow"] = value;
		else if(i == nBins+1) dataJSON["overflow"] = value;
		else data.push_back(value);
	}
	dataJSON["entries"] = histogram.getEntries();
	dataJSON["y"] = data;

	return dataJSON;
}


int pythiaGenerator(string homeExp, string macro, string dataListFile, string outEventFileCSV, string outHepDataFile, string outHistogramFile){
	string route = homeExp + "/"; //complete route
	
	macro = route + macro;
	dataListFile = route + dataListFile;
	
	//build json with data histogram
	string line;
	char delimiter = ',';
	json dataListJSON;

	if (access( dataListFile.c_str(), F_OK ) != -1)
	{
		ifstream pythiaDataFile (dataListFile);
		while ( getline (pythiaDataFile,line) )
		{
			json histogram = buildJSON(line,delimiter);
			histogram["pythiaName"] = outHistogramFile; 
			histogram["data"] = nullptr;
			dataListJSON.push_back(histogram);
		}
		pythiaDataFile.close();
	}
	else {
		cerr << "PYTHIA Error: Unable to open file "<<endl;
		cerr << "File data list"<<endl;
		return -1;
	}
	
	const unsigned int totalData = dataListJSON.size();
	Hist* histogramList = new Hist[totalData];
	TH1F* hROOTList = new TH1F[totalData];
	string* dataList = new string[totalData];
	int* particleList = new int[totalData];
	for(unsigned int i=0;i<totalData;i++){
			json histogram = dataListJSON[i];
			int nBins = histogram["nbins"];
			double min = histogram["minX"];
			double max = histogram["maxX"];
			string dataName = histogram["pythiaDataName"];
			string particle = histogram["particleName"];
			string title = dataName + ":" + particle; //std::to_string(particle);

			Hist histo(title, nBins, min, max);
			histogramList[i] = histo;
			TH1F *h1 = new TH1F(title.c_str(),title.c_str(),nBins,min,max);
			hROOTList[i] = *h1;
			dataList[i] = histogram["dataName"];
			particleList[i] = histogram["pdg"];
	}

	// Interface for conversion from Pythia8::Event to HepMC event.
	outHepDataFile = route + outHepDataFile;
	HepMC::Pythia8ToHepMC ToHepMC;
	HepMC::IO_GenEvent ascii_io(outHepDataFile, std::ios::out);

	Pythia pythia;
	ifstream pythiaMacroStream (macro);
	if ( access( macro.c_str(), F_OK ) != -1){
		pythia.readFile(macro);
		pythia.init();
	}
	else{
		return -1;
	}

	int nEvent = pythia.mode("Main:numberOfEvents");
	for (int iEvent = 0; iEvent < nEvent; ++iEvent) {
		cout<<"%% EVENT "<<iEvent<<endl;
		if (!pythia.next()) continue;
		
		//get Data
		for ( int i = 0; i < pythia.event.size(); ++i){

			if (pythia.event[i].isFinal()){

				Particle particle = pythia.event[i];
				for(unsigned int nh=0;nh<totalData;nh++){
					string dataName = dataListJSON[nh]["pythiaDataName"];
					int pdg = dataListJSON[nh]["pdg"];

					if (particle.id() == pdg){
						double value = getValue(dataName,particle);
						histogramList[nh].fill( value );
						hROOTList[nh].Fill(value);
					}
				}
			}
		}

		HepMC::GenEvent* hepmcevt = new HepMC::GenEvent();
		ToHepMC.fill_next_event( pythia, hepmcevt );

		// Write the HepMC event to file.
		ascii_io << hepmcevt;
		delete hepmcevt;
	}

	// Write data histogram
	string fileROOT = route + outHistogramFile +".root";
	TFile fROOT(fileROOT.c_str(),"RECREATE");

	for(unsigned int i=0;i<totalData;i++){
		json histoJSON = dataListJSON[i];
		Hist histogram = histogramList[i];
		json dataJSON = getDataHistogram(histogram,histoJSON["nbins"]);
		histoJSON["data"] = dataJSON;
		dataListJSON[i] = histoJSON;
		hROOTList[i].Write();
		cout<<histogram;
	}

	ofstream outHistogram;
	string jsonFile = outHistogramFile + ".json";
	if( outHistogram ) {
		remove( jsonFile.c_str() );
	}
	outHistogram.open(jsonFile.c_str(),ios::app);
	outHistogram<<dataListJSON<<endl;
	outHistogram.close();

	// Write pythia card (Pythia tree)
	outEventFileCSV = route + outEventFileCSV;
	writeOutEventCSV(outEventFileCSV,pythia.event);

	return 0;
}
# ifndef __CINT__
int main(int argc, char* argv[]) {

	int out = -1;
	if(argc !=7 ){
		cerr<<"PYTHIA Error: Incorrect arguments"<<endl;
		cerr<<"arguments: pythiaGenerator homeExp macro dataList outEventFile outDataFile outHistogramFile"<<endl;
	}
	else{
		string homeExp = string(argv[1]);
		string macro = string(argv[2]);
		string dataListFile = string(argv[3]);
		string outEventFileCSV = string(argv[4]);
		string outHepDataFile = string(argv[5]);
		string outHistogramFile = string(argv[6]);

		out = pythiaGenerator(homeExp, macro, dataListFile, outEventFileCSV, outHepDataFile, outHistogramFile);

	}

	return out;
}
# endif
