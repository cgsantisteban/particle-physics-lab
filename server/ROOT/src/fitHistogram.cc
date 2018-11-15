#include <string>
#include <stdlib.h>
#include <sstream>
#include <iostream>
#include <fstream>

#include "TROOT.h"
#include "TFile.h"
#include "TH1F.h"
#include "TF1.h"
#include "TCanvas.h"
#include "TMath.h"

#include "json.hpp"



using namespace std;
using nlohmann::json;

Int_t getNPar(char* func){

	Int_t nPar;
	if(strncmp(func,"gaus",4) == 0){
		nPar = 3;
	}
	else if(strncmp(func,"expo",4) == 0){
		nPar = 2;
	}
	else if(strncmp(func,"pol",3) == 0){
		Int_t grade = atoi(&func[3]);
		nPar = grade+1;
	}
	else if(strncmp(func,"landau",6) == 0){
			nPar = 3;
	}
	else {
		nPar = 1;
	}

	return nPar;
}

Double_t getPoint(char* func, Double_t x, json parameters){
	Double_t y = 0;
	
	if(strncmp(func,"gaus",4) == 0){
		Double_t N = parameters[0];
		Double_t mean = parameters[1];
		Double_t sigma = parameters[2];
		Double_t coef = ((x-mean)/sigma);
		y =  N*exp(-0.5*(coef*coef));
	}
	
	if(strncmp(func,"pol",3) == 0){
		Int_t grade = atoi(&func[3]);
	
		for(Int_t n=0;n<=grade;n++){
			Double_t coef = parameters[n];
			y += coef*pow(x,n);
		}
		
	}
	
	if(strncmp(func,"expo",4) == 0){
		Double_t p0 = parameters[0];
		Double_t p1 = parameters[1];
		y = exp(p0 + p1*x);
			
	}
	
	if(strncmp(func,"landau",6) == 0){
		Double_t N = parameters[0];
		Double_t MPV = parameters[1];
		Double_t sigma = parameters[2];
		y = N*(TMath::Landau(x,MPV,sigma));
		
	}
	
	return y;
}




void fitHistogram(const char* rootFile, const char* outFile, const char* histogram, int nPoints, int nFunc, char* fitFunc[], float rangeTotal[], float range[]){
		json fitJSON;

		if (access( outFile, F_OK ) != -1)
		{
			remove( outFile );
		}

		ofstream fitFile;
		fitFile.open(outFile,ios::app);

		TFile f(rootFile);
		TH1F * h1 = (TH1F*)f.Get(histogram);

		//TCanvas *c = new TCanvas("c","Histogram",800,600); //<--- root graph

		string funcTotal = "";
		Int_t nParam = 0;

		Int_t nParTotal = 0;
		for(Int_t i=0;i<nFunc;i++){
			nParTotal += getNPar(fitFunc[i]);
		}

		Double_t allPartialPar[nParTotal];

		char *fn;

		if(nFunc > 1){

			json fitFunctions;
			for(Int_t i=0;i<nFunc;i++){

				float startBin = range[2*i];
				float endBin = range[2*i+1];
				TF1 *func = new TF1("func",fitFunc[i], startBin,endBin);

				h1->Fit(func,"R"); //fit partial functions
				TF1 *fitPartial = h1->GetFunction("func");
				if(fitPartial == nullptr) {
					fitJSON.clear();
					fitJSON["isError"] = true;
					fitJSON["error"] = "Partial function: Fit data is empty";
					fitFile<<fitJSON<<endl;
					fitFile.close();
					exit(EXIT_FAILURE);
				}

				Int_t nPar = getNPar(fitFunc[i]);
				Int_t argInt;
				if(i==0) argInt = 0;
				else argInt += nParam;
				stringstream argString;
				argString << argInt;
				string argFunc= "("+argString.str()+")";
				if(i<nFunc-1) argFunc += "+";
				funcTotal += string(fitFunc[i])+argFunc;

				json fitFunction;
				fitFunction["fitFunction"] = fitFunc[i];
				json rangeFitFunction;
				rangeFitFunction.push_back(startBin);
				rangeFitFunction.push_back(endBin);
				fitFunction["range"] = rangeFitFunction;


				json partialParameters;
				json partialErrors;
				for(Int_t ii=0;ii<nPar;ii++){
					json partialPar;
					json partialE;
					allPartialPar[nParam + ii] = func->GetParameter(ii);
					if((TMath::IsNaN(allPartialPar[nParam + ii]) != 0)){
						fitJSON.clear();
						fitJSON["isError"] = true;
						fitJSON["error"] = "A partial parameter is not a number";
						fitFile<<fitJSON<<endl;
						fitFile.close();
						cout<<fitJSON<<endl;
						exit(EXIT_FAILURE);
					}
					partialParameters.push_back(func->GetParameter(ii));
					partialErrors.push_back(func->GetParError(ii));
				}
				fitFunction["partialParameters"] = partialParameters;
				fitFunction["partialErrors"] = partialErrors;

				//---- graph points
				if(nPoints<=1) nPoints = 2;
				Double_t step = (endBin - startBin) / (nPoints-1);
				json xPoints;
				json yPoints;
				for(Int_t iii=0;iii<nPoints;iii++){
					Double_t x = startBin +step*iii;
					Double_t y = getPoint(fitFunc[i],x,partialParameters);

					json point;
					xPoints.push_back(x);
					yPoints.push_back(y);
				}

				fitFunction["x"] = xPoints;
				fitFunction["y"] = yPoints;


				nParam = nPar;
				fitFunctions.push_back(fitFunction);

			}

			fitJSON["fitFunctions"] = fitFunctions;
			fn = new char[funcTotal.size()+1];
			fn[funcTotal.size()]=0;
			memcpy(fn,funcTotal.c_str(),funcTotal.size());
		}
		else {
			fn = fitFunc[0];
		}

		TF1 *funcT = new TF1("funcTotal",fn, rangeTotal[0],rangeTotal[1]);

		if(nFunc > 1){
			funcT->SetParameters(allPartialPar);
		}

		h1->Fit("funcTotal","R");

		TF1 *fit = h1->GetFunction("funcTotal"); //fit
		if(fit != nullptr) {
			Double_t chi2 = fit->GetChisquare();
			Int_t ndf = fit->GetNDF();

			if(TMath::IsNaN(chi2) != 0){
				fitJSON.clear();
				fitJSON["isError"] = true;
				fitJSON["error"] = "Chi2 is not a number";
				fitFile<<fitJSON<<endl;
				fitFile.close();
				exit(EXIT_FAILURE);
			}else{
				fitJSON["chi2"] = chi2;
			}

			if(TMath::IsNaN(ndf) != 0){
				fitJSON.clear();
				fitJSON["isError"] = true;
				fitJSON["error"] = "Ndf is not a number";
				fitFile<<fitJSON<<endl;
				fitFile.close();
				exit(EXIT_FAILURE);
			}else{
				fitJSON["ndf"] = ndf;
			}

			Double_t parTotal[nParTotal];
			json totalParameters;
			json totalErrors;
			for(Int_t i=0;i<nParTotal;i++){
				Double_t par = fit->GetParameter(i);
				Double_t errorPar = fit->GetParError(i);

				if((TMath::IsNaN(par) != 0)  || (TMath::IsNaN(errorPar) != 0)){
								fitJSON.clear();
								fitJSON["isError"] = true;
								fitJSON["error"] = "A parameter (error) is not a number";
								fitFile<<fitJSON<<endl;
								fitFile.close();
								cout<<fitJSON<<endl;
								exit(EXIT_FAILURE);
				}

				totalParameters.push_back(par);
				totalErrors.push_back(fit->GetParError(i));
				fitJSON["totalParameters"] = totalParameters;
				fitJSON["totalErrors"] = totalErrors;
			}

			json fitTotalRange;
			fitTotalRange.push_back(rangeTotal[0]);
			fitTotalRange.push_back(rangeTotal[1]);
			fitJSON["fitTotalRange"] = fitTotalRange;

			json totalPoints;
			if(nPoints<=1) nPoints = 2;
			Double_t step = (rangeTotal[1] - rangeTotal[0]) / (nPoints-1);
			json xPoints;
			json yPoints;
			for(Int_t iii=0;iii<nPoints;iii++){
				Double_t total = 0;
				Double_t x = rangeTotal[0] + step*iii;
				Int_t np = 0;
				for(Int_t nf=0;nf<nFunc;nf++){
					char *func = fitFunc[nf];
					Int_t nPar = getNPar(func);
					json parameters;
					for(Int_t i=0;i<nPar;i++){
						Double_t param= fitJSON["totalParameters"][np+i];
						parameters.push_back(param);
					}
					Double_t y = getPoint(func,x,parameters);
					total += y;
					np +=nPar;

				}
				xPoints.push_back(x);
				yPoints.push_back(total);
			}

			totalPoints["x"] = xPoints;
			totalPoints["y"] = yPoints;

			fitJSON["totalPoints"] = totalPoints;
			fitJSON["isError"] = false;
			fitFile<<fitJSON<<endl;

			//root graph
			//h1->Draw();
			//c->SaveAs("myhisto.png");
			//c->Clear();

		}
		else{
			fitJSON.clear();
			fitJSON["isError"] = true;
			fitJSON["error"] = "Fit data is empty";
			fitFile<<fitJSON<<endl;
		} // if fit data empty

		fitFile.close();
		cout<<fitJSON<<endl;

}


# ifndef __CINT__
int main(int argc, char* argv[])
{

	if(argc<9){
		cout<<"Incorrect arguments"<<endl;
		cout<<"Arguments: fileRoot.root outFitFile histogram nPoints nFunctions fitFunctions  rangeTotalFitFunc rangeParcialFunctions"<<endl;
	}
	else{
		char* fileRoot = argv[1];
		char* outFitFile = argv[2];
		char* histogram = argv[3];

		int nPoints = atoi(argv[4]);
		if(nPoints<=0){
			cout<<"Number of points must be a positive integer";
			exit(EXIT_FAILURE);
		}else{
			int nFunc = atoi(argv[5]);
			if(nFunc<=0){
				cout<<"Number of functions must be a positive integer"<<endl;
			}
			else if(nFunc>1 && argc<8+3*nFunc){
				cout<<"Incorrect arguments"<<endl;
				cout<<"Arguments: fileRoot.root outFitFile histogram nPoints nFunctions fitFunctions  rangeTotalFitFunc rangeParcialFunctions"<<endl;
			}
			else{
				int i = 0;
				float rangeTotal[2];
				float range[2*nFunc];
				char* fitFunc[nFunc];

				for(i=0;i<nFunc;i++){
					fitFunc[i] = argv[i+6];
				}

				rangeTotal[0] = atof(argv[6+nFunc]);
				rangeTotal[1] = atof(argv[6+nFunc+1]);

				if(nFunc > 1){
					for(i=0;i<2*nFunc;i++){
						range[i] = atof(argv[i+8+nFunc]);
					}
				}
				else {
					for(i=0;i<2;i++){
						range[i] = rangeTotal[i];
					}
				}

				fitHistogram(fileRoot, outFitFile, histogram, nPoints, nFunc, fitFunc, rangeTotal, range);

			}//else nFunc
		}//else nPoints
	}//else argc

	return 0;
}
# endif
