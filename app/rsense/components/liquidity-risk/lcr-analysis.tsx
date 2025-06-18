"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import LCRAnalysis from "../components/lcr-analysis"; 


const lcrComponents = [
  {
    category: "Actifs Liquides de Haute Qualité",
    items: [
      { name: "Actifs ajustés niveau 1", value: 0, weight: "0",weightvalue:0 },
      { name: "Actifs niveau 1", value: 0, weight: "-" ,weightvalue:0},
      { name: "Valeurs en caisse", value: 0, weight: "100%" ,weightvalue:0},
      { name: "Excédent des avoirs auprès de la banque centrale selon les modalités définies par BAM", value: 0, weight: "100%",weightvalue:0 },
      { name: "Titres de créances pondérés à 0%.", value: 0, weight: "-" ,weightvalue:0},
      { name: "Emis ou garantis par l'Etat ou Bank Al-Maghrib", value: 0, weight: "100%",weightvalue:0 },
      { name: "Emis ou garantis par les Etats, les banques centrales, les organismes publics, la BRI, le FMI, la CE ou les banques multilatérales de développement", value: 0, weight: "100%" ,weightvalue:0},
      { name: "Titres de créances non pondérés à 0%", value: 0, weight: "-",weightvalue:0 },
      { name: "Emis en monnaie locale par l'Etat ou la banque centrale des pays où la banque encourt un risque de liquidité ou de son pays d'origine", value: 0, weight: "100%",weightvalue:0 },
      { name: "Emis en monnaie étrangère par un Etat ou une banque centrale dans la mesure où la détention de ces titres correspond aux besoins des opérations de la banque dans la juridiction concernée", value: 0, weight: "100%",weightvalue:0 },
      { name: "Actifs ajustés niveau 2A", value: 0, weight: "-" ,weightvalue:0},
      { name: "Actifs niveau 2A", value: 0, weight: "-" ,weightvalue:0},
      { name: "Titres de créances pondérés à 20% émis ou garantis par les Etats, les banques centrales, les organismes publics et les banques multilatérales de développement", value: 0, weight: "85%" ,weightvalue:0},
      { name: "Obligations et billets de trésorerie émis par des entreprises notées au moins AA- ou répondant aux conditions définies par BAM", value: 0, weight: "85%",weightvalue:0 },
      { name: "Obligations sécurisées", value: 0, weight: "85%" ,weightvalue:0},
      { name: "OPCVM selon les modalités définies par BAM", value: 0, weight:"100%" ,weightvalue:0},
      { name: "Actifs ajustés niveau 2B", value: 0, weight: "-",weightvalue:0 },
      { name: "Actifs niveau 2B", value: 0, weight: "-",weightvalue:0 },
      { name: "Titres émis par des fonds de placements collectifs en titrisation de créances hypothécaires", value: 0, weight: "75%",weightvalue:0 },
      { name: "Obligations et billets de trésorerie émis par des entreprises notées entre A+ et BBB-", value: 0, weight: "50%" ,weightvalue:0},
      { name: "Actions ordinaires des entreprises du principal indice boursier", value: 0, weight: "50%",weightvalue:0 },
    ],
       "Total des actifs liquides de haute qualité": 0,
  },

  {
    category: "Sorties de Trésorerie",
    items: [
      { name: "Dépôts des particuliers", value: 0, weight: "-",weightvalue:0 },
      { name: "Fractions stables ", value: 0, weight: "5%",weightvalue:0 },
      { name: "Fractions moins stables ", value: 0, weight: "10%" ,weightvalue:0},
      { name: "Dépôts des personnes morales", value: 0, weight: "-",weightvalue:0 },
      { name: "Fractions stables", value: 0, weight: "-" ,weightvalue:0},
      { name: "Très petites entreprises.", value: 0, weight: "5%" ,weightvalue:0},
      { name: "Entreprises financières et non financières au titre des relations opérationnelles bien établies avec la banque.", value: 0, weight: "5%",weightvalue:0 },
      { name: "Entreprises non financières, Etats, banques centrales, organismes publics et banques multilatérales de développement.", value: 0, weight: "10%" ,weightvalue:0},
      { name: "Fractions moins stables", value: 0, weight: "-",weightvalue:0 },
      { name: "Très petites entreprises", value: 0, weight: "10%" ,weightvalue:0},
      { name: "Entreprises financières et non financières au titre des relations opérationnelles bien établies avec la banque", value: 0, weight: "25%",weightvalue:0 },
      { name: "Entreprises non financières, Etats, banques centrales, organismes publics et banques multilatérales de développement", value: 0, weight: "40%",weightvalue:0 },
      { name: "Autres dépôts, emprunts et élements exigibles du passif dans les 30 jours", value: 0, weight: "-",weightvalue:0 },
      { name: "Insuffisance des avoirs auprès de la banque centrale selon les modalités définies par BAM", value: 0, weight: "100%",weightvalue:0},
      { name: "Autres dépôts des entreprises financières", value: 0, weight: "100%",weightvalue:0 },
      { name: "Emprunts auprès des entreprises financières à échoir dans les 30 jours", value: 0, weight: "100%",weightvalue:0 },
      { name: "Opérations diverses sur titres (si leur solde est créditeur)", value: 0, weight: "100%" ,weightvalue:0},
      { name: "Titres de créances émis par la banque et arrivant à échéance dans les 30 jours", value: 0, weight: "100%" ,weightvalue:0},
      { name: "Dettes en instance ", value: 0, weight: "100%",weightvalue:0}, 
      { name: "Valeurs données en pension et autres opérations garanties échéant dans les 30 jours", value: 0, weight: "100%" ,weightvalue:0},
      { name: "Opérations adossées à des actifs de niveau 1", value: 0, weight: "0%" ,weightvalue:0},
      { name: "Opérations adossées à des actifs de niveau 2A", value: 0, weight: "15%" ,weightvalue:0},
      { name: "Opérations adossées à des actifs de niveau 2B art 7 a)", value: 0, weight: "25%" ,weightvalue:0},
      { name: "Opérations adossées à des actifs de niveau 2B art 7 b) et c)", value: 0, weight: "50%",weightvalue:0 },
      { name: "Opérations adossées à des actifs autres que ceux de niveau 1 et 2A", value: 0, weight: "25%" ,weightvalue:0},
      { name: "Autres opérations ", value: 0, weight: "100%",weightvalue:0 },

      { name: "Sorties de trésorerie supplémentaires", value: 0, weight: "-",weightvalue:0},
      { name: "Montant net à payer sur produits dérivés", value: 0, weight: "100%",weightvalue:0},
      { name: "Besoins de liquidité liés à une dégradation significative de la notation de la banque", value: 0, weight: "100%",weightvalue:0},
      { name: "Besoins de liquidité liés à un excès de sûretés détenues par la banque", value: 0, weight: "100%",weightvalue:0 },
      { name: "Besoins de liquidité liés à des sûretés contractuellement requises", value: 0, weight: "100%" ,weightvalue:0},
      { name: "Besoins de liquidités dues aux variations éventuelles de la valeur de la sûreté", value: 0, weight: "0%" ,weightvalue:0},
      { name: "Besoins de liquidité dus aux variations de la valeur de marché des dérivés", value: 0, weight: "100%" ,weightvalue:0},      
      { name: "Sorties de trésorerie relatives aux engagements confirmés de financement et de liquidité", value: 0, weight: "100%" ,weightvalue:0},
      { name: "Engagements confirmés de financement en faveur :", value: 0, weight: "-" ,weightvalue:0},
      { name: "des particuliers et très petites entreprises.", value: 0, weight: "5%" ,weightvalue:0},
      { name: "des entreprises non financières.", value: 0, weight: "10%" ,weightvalue:0},
      { name: "des établissements de crédit.", value: 0, weight: "40%" ,weightvalue:0},
      { name: "des autres entreprises financières.", value: 0, weight: "40%",weightvalue:0 },
      { name: "des FPCT.", value: 0, weight: "100%",weightvalue:0 },    
      { name: "Sorties de trésorerie relatives aux obligations de financements conditionnelles", value: 0, weight: "100%" ,weightvalue:0},
      { name: "Facilités de financement sans engagement en faveur :", value: 0, weight: "-",weightvalue:0 },
      { name: " des particuliers ", value: 0, weight: "5%" ,weightvalue:0},
      { name: "des entreprises non financières ", value: 0, weight: "10%",weightvalue:0 },
      { name: "des établissements de crédit ", value: 0, weight: "40%" ,weightvalue:0},
      { name: "des autres entreprises financières ", value: 0, weight: "40%" ,weightvalue:0},
      { name: "des FPCT ", value: 0, weight: "100%",weightvalue:0},
      { name: "Facilités de liquidité sans engagement en faveur :", value: 0, weight: "-" ,weightvalue:0},
      { name: "des particuliers", value: 0, weight: "5%",weightvalue:0 },
      { name: " des entreprises non financières", value: 0, weight: "30%",weightvalue:0 },
      { name: "des établissements de crédit", value: 0, weight: "40%",weightvalue:0},
      { name: "des autres entreprises financières", value: 0, weight: "100%",weightvalue:0},
      { name: "des FPCT", value: 0, weight: "100%",weightvalue:0},   
      { name: "Rachat de titres de dettes émis par la banque", value: 0, weight: "-",weightvalue:0},
      { name: "Rachat de titres de dettes d'émetteur ayant eu recours à un courtier affilié", value: 0, weight: "-",weightvalue:0 },
      { name: "Instruments de crédit commercial", value: 0, weight: "5%" ,weightvalue:0},
      { name: "Engagements de garantie", value: 0, weight: "-" ,weightvalue:0},
      { name: "Autres", value: 0, weight: "-" ,weightvalue:0},
    { name: "Sorties de trésorerie relatives aux autres obligations contractuelles",value: 0, weight: "-" ,weightvalue:0},
    { name: "Dividendes à payer dans les 30 jours ", value: 0, weight: "100%",weightvalue:0},
    { name: "Intérêts à payer dans les 30 jours ", value: 0, weight: "100%",weightvalue:0 }, 
    { name: "Excédent des titres à recevoir sur les titres à livrer dans les 30 jours", value: 0, weight: "-",weightvalue:0 },
    { name: "Actifs de niveau 1", value: 0, weight: "0%" ,weightvalue:0},
    { name: "Actifs de niveau 2A", value: 0, weight: "15%" ,weightvalue:0},
    { name: "Actifs de niveau 2B art 7 a)", value: 0, weight: "25%",weightvalue:0 },
    { name: "Actifs de niveau 2B art 7 b) et c)", value: 0, weight: "50%",weightvalue:0 },
    { name: " Autres actifs", value: 0, weight: "100%" ,weightvalue:0},
    { name: "Autres obligations contractuelles de financement", value: 0, weight: "100%",weightvalue:0 },
  ],
    "Total des sorties de trésorerie": 0
  },
  
  {
    category: "Entrées de Trésorerie",
    items: [
      { name: "Créances détenues par la banque ", value: 0, weight: "-" ,weightvalue:0},
      { name: " Entreprises financières", value: 0, weight: "100%",weightvalue:0},
      { name: "Particuliers et autres personnes morales", value: 0, weight: "50%" ,weightvalue:0},
      { name: "Dépôts auprès des banques", value: 0, weight: "-",weightvalue:0 },
      { name: "Relations opérationnelles bien établies et couverts par un système de garantie des dépôts", value: 0, weight: "5%" ,weightvalue:0},
      { name: "Relations opérationnelles bien établies", value: 0, weight: "25%",weightvalue:0 },
      { name: "Autres", value: 0, weight: "100%",weightvalue:0 },
      { name: "Titres de créances à échoir dans un délai de 30 jours", value: 0, weight: "100%",weightvalue:0 },
      { name: "Valeurs reçues en pension et autres opérations garanties échéant dans les 30 jours", value: 0, weight: "100%",weightvalue:0 },
      { name: "Opérations adossées à des actifs de niveau 1", value: 0, weight: "0%",weightvalue:0 },
      { name: "Opérations adossées à des actifs de niveau 2A", value: 0, weight: "15%",weightvalue:0 },
      { name: "Opérations adossées à des actifs de niveau 2B article 7 a)", value: 0, weight: "25%",weightvalue:0 },
      { name: "Opérations adossées à des actifs de niveau 2B article 7 b) et c)", value: 0, weight: "50%",weightvalue:0 },
      { name: "Autres opérations", value: 0, weight: "100%",weightvalue:0 },
      { name: "Autres entrées de trésorerie", value: 0, weight: "-",weightvalue:0 },
      { name: "Paiement net à recevoir sur produits dérivés", value: 0, weight: "100%",weightvalue:0 },
      { name: "Intérêts à recevoir dans les 30 jours", value: 0, weight: "100%",weightvalue:0 },
      { name: "Opérations diverses sur titres (solde débiteur)", value: 0, weight: "100%",weightvalue:0 },
      { name: "Engagements de financement et liquidité reçus", value: 0, weight: "40%",weightvalue:0 },
      { name: "Excédent des titres à livrer sur les ti tres à recevoir dans les 30 jours ", value: 0, weight: "-",weightvalue:0 },
      { name: "Actifs de niveau 1", value: 0, weight: "15%" ,weightvalue:0},
      { name: "Actifs de niveau 2A", value: 0, weight: "15%",weightvalue:0 },
      { name: "Actifs de niveau 2B art 7 a)", value: 0, weight: "25%",weightvalue:0 },
      { name: "Actifs de niveau 2B art 7 b) et c)", value: 0, weight: "50%" ,weightvalue:0},
      { name: "Autres actifs", value: 0, weight: "100%" ,weightvalue:0},
    ],
   "Total des entrées de trésorerie": 0,
  },
]

const boldNames = ["Actifs ajustés niveau 1","Actifs niveau 1", "Actifs ajustés niveau 2A", "Actifs niveau 2A", "Actifs ajustés niveau 2B", "Actifs niveau 2B", "Dépôts des particuliers", "Dépôts des personnes morales", "Fractions stables", "Fractions moins stables","Autres dépôts, emprunts et élements exigibles du passif dans les 30 jours", "Valeurs données en pension et autres opérations garanties échéant dans les 30 jours", "Sorties de trésorerie supplémentaires", "Sorties de trésorerie relatives aux engagements confirmés de financement et de liquidité",
   "Engagements confirmés de financement en faveur :", "Engagements confirmés de liquidité en faveur :", "Sorties de trésorerie relatives aux obligations de financements conditionnelles",
    "Facilités de financement sans engagement en faveur :", "Facilités de liquidité sans engagement en faveur :", 
    "Rachat de titres de dettes émis par la banque", "Rachat de titres de dettes d'émetteur ayant eu recours à un courtier affilié", 
    "Instruments de crédit commercial", "Engagements de garantie", "Autres", "Sorties de trésorerie relatives aux autres obligations contractuelles",
     "Créances détenues par la banque échéant dans un délai de 30 jours", "Dépôts auprès des banques",
      "Titres de créances à échoir dans un délai de 30 jours", "Valeurs reçues en pension et autres opérations garanties échéant dans les 30 jours","Autres entrées de trésorerie",]; // Noms à mettre en gras

      const LCRAnalysisPage = () => {
        const [lcrComponentsState, setLcrComponentsState] = useState(lcrComponents);
        const [formData, setFormData] = useState({});
        const [error, setError] = useState(null);
      
        const allowedNames = [
          "Valeurs en caisse",
          "Excédent des avoirs auprès de la banque centrale selon les modalités définies par BAM",
          "Emis ou garantis par l'Etat ou Bank Al-Maghrib",
          "OPCVM selon les modalités définies par BAM",
          "Emis ou garantis par les Etats, les banques centrales, les organismes publics, la BRI, le FMI, la CE ou les banques multilatérales de développement",
          "Titres émis par des fonds de placements collectifs en titrisation de créances hypothécaires",
          "Obligations et billets de trésorerie émis par des entreprises notées entre A+ et BBB-",
          "Actions ordinaires des entreprises du principal indice boursier",
          "Emprunts auprès des entreprises financières à échoir dans les 30 jours",
          "Opérations adossées à des actifs de niveau 1",
          "Intérêts à payer dans les 30 jours ",
          "Autres opérations"
        ];
        
        const updateTableData = (name, newValue) => {
          setLcrComponentsState((prevState) => {
            return prevState.map((component) => {
              const updatedItems = component.items.map((item) => {
                if (item.name === name) {
                  const parsedValue = parseFloat(newValue) || 0;
                  let weightvalue = item.weightvalue;
        
                  if (allowedNames.includes(item.name)) {
                    const parsedWeight = parseFloat(item.weight?.replace('%', '') || '0');
                    weightvalue = parsedValue * (parsedWeight / 100);
                  }
        
                  return { ...item, value: parsedValue, weightvalue };
                }
                return item;
              });
        
              // Calculer la somme des montants pondérés des lignes spécifiques pour "Actifs niveau 1"
              const activeLevel1Items = [
                "Valeurs en caisse",
                "Excédent des avoirs auprès de la banque centrale selon les modalités définies par BAM",
                "Titres de créances pondérés à 0%.",
                "Emis ou garantis par l'Etat ou Bank Al-Maghrib",
                "Emis ou garantis par les Etats, les banques centrales, les organismes publics, la BRI, le FMI, la CE ou les banques multilatérales de développement",
                "Titres de créances non pondérés à 0%",
                "Emis en monnaie locale par l'Etat ou la banque centrale des pays où la banque encourt un risque de liquidité ou de son pays d'origine",
                "Emis en monnaie étrangère par un Etat ou une banque centrale dans la mesure où la détention de ces titres correspond aux besoins des opérations de la banque dans la juridiction concernée"
              ];
        
              // Filtrer les éléments d'Actifs niveau 1
              const totalActiveLevel1 = component.items
                .filter((item) => activeLevel1Items.includes(item.name))
                .reduce((sum, item) => sum + item.weightvalue, 0);
        
              // Mettre à jour le total d'Actifs niveau 1
              const updatedComponent = {
                ...component,
                items: updatedItems,
                total: updatedItems.reduce((sum, item) => sum + item.value, 0),
              };
        
              // Mettre à jour le montant pondéré des "Actifs niveau 1"
              const updatedItemsWithLevel1 = updatedComponent.items.map((item) => {
                if (item.name === "Actifs niveau 1") {
                  return {
                    ...item,
                    weightvalue: totalActiveLevel1,
                  };
                }
                return item;
              });
        
              // Calculer la somme des montants pondérés des lignes spécifiques pour "Actifs niveau 2A"
              const activeLevel2AItems = [
                "Titres de créances pondérés à 20% émis ou garantis par les Etats, les banques centrales, les organismes publics et les banques multilatérales de développement",
                "Obligations et billets de trésorerie émis par des entreprises notées au moins AA- ou répondant aux conditions définies par BAM",
                "Obligations sécurisées",
                "OPCVM selon les modalités définies par BAM"
              ];
        
              // Filtrer les éléments d'Actifs niveau 2A
              const totalActiveLevel2A = component.items
                .filter((item) => activeLevel2AItems.includes(item.name))
                .reduce((sum, item) => sum + item.weightvalue, 0);
        
              // Mettre à jour le montant pondéré des "Actifs niveau 2A"
              const updatedItemsWithLevel2A = updatedItemsWithLevel1.map((item) => {
                if (item.name === "Actifs niveau 2A") {
                  return {
                    ...item,
                    weightvalue: totalActiveLevel2A,
                  };
                }
                return item;
              });
        
              // Calculer la somme des montants pondérés des lignes spécifiques pour les nouveaux éléments
              const newItems = [
                "Titres émis par des fonds de placements collectifs en titrisation de créances hypothécaires",
                "Obligations et billets de trésorerie émis par des entreprises notées entre A+ et BBB-",
                "Actions ordinaires des entreprises du principal indice boursier"
              ];
        
              // Filtrer les éléments des nouveaux actifs
              const totalNewItems = component.items
                .filter((item) => newItems.includes(item.name))
                .reduce((sum, item) => sum + item.weightvalue, 0);
        
              // Mettre à jour le montant pondéré des nouveaux actifs
              const updatedItemsWithNewItems = updatedItemsWithLevel2A.map((item) => {
                if (item.name === "Actifs niveau 2B") {  
                  return {
                    ...item,
                    weightvalue: totalNewItems,
                  };
                }
                return item;
              });
        
              return {
                ...updatedComponent,
                items: updatedItemsWithNewItems,
              };
            });
          });
        };
        
        
        
        
      
        const handleInputChange = (e) => {
          const { name, value } = e.target;
          setFormData((prevData) => ({
            ...prevData,
            [name]: value,
          }));
        };
      
        const handleSubmit = (e) => {
          e.preventDefault();
          
          const requiredFields = ["Valeurs en caisse","Excédent des avoirs auprès de la banque centrale selon les modalités définies par BAM","Emis ou garantis par l'Etat ou Bank Al-Maghrib","Emis ou garantis par les Etats, les banques centrales, les organismes publics, la BRI, le FMI, la CE ou les banques multilatérales de développement","OPCVM selon les modalités définies par BAM","Titres émis par des fonds de placements collectifs en titrisation de créances hypothécaires","Obligations et billets de trésorerie émis par des entreprises notées entre A+ et BBB-","Actions ordinaires des entreprises du principal indice boursier","Emprunts auprès des entreprises financières à échoir dans les 30 jours","Opérations adossées à des actifs de niveau 1","Intérêts à payer dans les 30 jours ","Autres opérations"];
          const missingFields = requiredFields.filter((field) => !formData[field]);
          
          if (missingFields.length > 0) {
            setError(`Champs manquants: ${missingFields.join(", ")}`);
            return;
          }
          setError(null);
          
          Object.keys(formData).forEach((key) => {
            updateTableData(key, formData[key]);
            
          });
        };
        
      
        return (
          <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {/* Ajoutez ici les cartes de résumé si nécessaire */}
            </div>
      
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-orange-600"> Veuillez entrer les inputs suivants</h2>
            </div>
      
            <div className="max-w-xl mx-auto p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  "Valeurs en caisse",
                  "Excédent des avoirs auprès de la banque centrale selon les modalités définies par BAM",
                  "Emis ou garantis par l'Etat ou Bank Al-Maghrib",
                  "Emis ou garantis par les Etats, les banques centrales, les organismes publics, la BRI, le FMI, la CE ou les banques multilatérales de développement",
                  "OPCVM selon les modalités définies par BAM",
                  "Titres émis par des fonds de placements collectifs en titrisation de créances hypothécaires",
                  "Obligations et billets de trésorerie émis par des entreprises notées entre A+ et BBB-",
                  "Actions ordinaires des entreprises du principal indice boursier",
                  "Emprunts auprès des entreprises financières à échoir dans les 30 jours",
                  "Opérations adossées à des actifs de niveau 1",
                  "Intérêts à payer dans les 30 jours ",
                  "Autres opérations"
                ].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium">{field}:</label>
                    <input
                      type="number"
                      name={field}
                      value={formData[field] || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      placeholder={`Entrez la valeur pour ${field}`}
                    />
                  </div>
                ))}
      
                <div className="flex justify-center">
                  <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                    Mettre à jour
                  </button>
                </div>
              </form>
      
              {error && <div className="text-red-500 text-center mt-4">{error}</div>}
            </div>
      
            <Card>
  <CardHeader>
    <CardTitle>Tableau des composantes du LCR</CardTitle>
  </CardHeader>
  <CardContent>
  <div className="space-y-6">
  {lcrComponentsState.map((component) => (
    <div key={component.category} className="space-y-2">
      <h3 className="font-semibold text-orange-600">{component.category}</h3> 
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Libellé</TableHead>
                <TableHead className="text-right">Montant (KDH)</TableHead>
                <TableHead className="text-right">Pondération</TableHead>
                <TableHead className="text-right">Montant Pondéré</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {component.items.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className={boldNames.includes(item.name) ? "font-bold" : ""}>{item.name}</TableCell>
                  <TableCell className="text-right">{item.value.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.weight}</TableCell>
                  <TableCell className="text-right">{item.weightvalue}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} className="font-semibold text-right">
                  {component.category === "Actifs Liquides de Haute Qualité"
                    ? "Total des actifs liquides de haute qualité"
                    : component.category === "Sorties de Trésorerie"
                    ? "Total des sorties de trésorerie"
                    : component.category === "Entrées de Trésorerie"
                    ? "Total des entrées de trésorerie"
                    : `Total des ${component.category.toLowerCase()}`}
                </TableCell>
                <TableCell className="text-right" colSpan={2}>
                  {component.category === "Actifs Liquides de Haute Qualité"
                    ? (() => {
                        let level1Value = 0;
                        let level2AValue = 0;
                        let level2BValue = 0;
                        let level1ajValue = 0;
                        let level2AajValue = 0;
                        let level2BajValue = 0;
        
                        component.items.forEach(item => {
                          if (item.name === "Actifs niveau 1") {
                            level1Value = item.weightvalue;
                          }
                          if (item.name === "Actifs niveau 2A") {
                            level2AValue = item.weightvalue;
                          }
                          if (item.name === "Actifs niveau 2B") {
                            level2BValue = item.weightvalue;
                          }
                          if (item.name === "Actifs ajustés niveau 1") {
                            level1ajValue = item.weightvalue;
                          }
                          if (item.name === "Actifs ajustés niveau 2A") {
                            level2AajValue = item.weightvalue;
                          }
                          if (item.name === "Actifs ajustés niveau 2B") {
                            level2BajValue = item.weightvalue;
                          }
                        });
        
                        const ajustement = (level2AajValue + level2BajValue) - (2 / 3) * level1ajValue;
                        const maxAjustement = Math.max(ajustement, level2BajValue);
        
                        const totalHQLA = level1Value + level2AValue + level2BValue - maxAjustement;
                        return totalHQLA.toFixed(2);
                      })()
                    : component.category === "Sorties de Trésorerie"
                    ? component.items.reduce((sum, item) => sum + item.weightvalue, 0).toFixed(2)
                    : component.category === "Entrées de Trésorerie"
                    ? component.items.reduce((sum, item) => sum + item.weightvalue, 0).toFixed(2)
                    : component.total.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ))}
    </div>

    {/* Affichage du ratio LCR une seule fois après la dernière catégorie */}
    <Table>
      <TableBody>
        <TableRow>
        <TableCell className="font-bold text-left text-orange-600">RATIO DE LIQUIDITE</TableCell> 
        <TableCell className="text-left" colSpan={2}>
  {(() => {
    // Calcul du total des Actifs Liquides de Haute Qualité (HQLA)
    const totalHQLA = lcrComponentsState
      .filter(component => component.category === "Actifs Liquides de Haute Qualité")
      .reduce((sum, component) => {
        let level1Value = 0;
        let level2AValue = 0;
        let level2BValue = 0;
        let level1ajValue = 0;
        let level2AajValue = 0;
        let level2BajValue = 0;

        component.items.forEach(item => {
          if (item.name === "Actifs niveau 1") level1Value = item.weightvalue;
          if (item.name === "Actifs niveau 2A") level2AValue = item.weightvalue;
          if (item.name === "Actifs niveau 2B") level2BValue = item.weightvalue;
          if (item.name === "Actifs ajustés niveau 1") level1ajValue = item.weightvalue;
          if (item.name === "Actifs ajustés niveau 2A") level2AajValue = item.weightvalue;
          if (item.name === "Actifs ajustés niveau 2B") level2BajValue = item.weightvalue;
        });

        // Calcul de l'ajustement
        const ajustement = (level2AajValue + level2BajValue) - (2 / 3) * level1ajValue;
        const maxAjustement = Math.max(ajustement, level2BajValue);

        return sum + (level1Value + level2AValue + level2BValue - maxAjustement);
      }, 0);

    // Calcul du total des Sorties de Trésorerie
    const totalSorties = lcrComponentsState
      .filter(component => component.category === "Sorties de Trésorerie")
      .reduce((sum, component) => sum + component.items.reduce((s, item) => s + item.weightvalue, 0), 0);

    // Calcul du total des Entrées de Trésorerie
    const totalEntrees = lcrComponentsState
      .filter(component => component.category === "Entrées de Trésorerie")
      .reduce((sum, component) => sum + component.items.reduce((s, item) => s + item.weightvalue, 0), 0);

    // Calcul du ratio LCR
    const minSortiesEntrees = Math.min(0.75 * totalSorties, totalEntrees);
    const denominator = totalSorties - minSortiesEntrees;

    if (denominator === 0) {
      return "Non calculable (division par zéro)";
    }

    const lcr = (totalHQLA / denominator) * 100;
    return `${lcr.toFixed(2)}%`;
    
  })()}
</TableCell>
</TableRow>
      </TableBody>
    </Table>
  </CardContent>
</Card>

          </div>
        );
      };
      
      export default LCRAnalysisPage;
      











































