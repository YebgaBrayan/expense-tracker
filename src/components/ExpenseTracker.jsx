import React, { useState, useEffect } from "react";
import { saveAs } from 'file-saver';

const categoriesOHADA = {
  "60 - Achats": ["Matières premières", "Marchandises", "Fournitures de bureau", "Consommables informatiques"],
  "61 - Services extérieurs": ["Loyers", "Honoraires", "Entretien et réparations", "Assurances", "Publicité", "Transport", "Impressions", "Abonnements", "Frais de logistique", "Électricité", "Electricité", "Eau", "Gaz", "Frais de location des bureaux", "Frais de location des entrepôts", "Entrepots", "Paiement des fournisseurs de services externes"],
  "62 - Autres services extérieurs": ["Télécommunications", "Frais de déplacement", "Frais postaux", "Frais bancaires", "Dîner client", "Marketing", "Relations publiques", "Frais de mission", "Hébergement"],
  "63 - Impôts et taxes": ["Taxes locales", "Impôt sur les sociétés", "Autres impôts et taxes", "TVA", "Droits de douane", "Taxe sur les salaires", "Contribution foncière", "Taxes diverses", "Autres impôts", "Contributions obligatoires"],
  "64 - Charges de personnel": ["Salaires", "Traitements", "Cotisations sociales", "Primes", "Gratifications", "Autres charges sociales", "Formation", "Développement des compétences"],
  "65 - Autres charges de gestion courante": ["Subventions", "Dons", "Charges exceptionnelles", "Frais contentieux", "Pénalités contractuelles"],
  "66 - Charges financières": ["Intérêts sur emprunts", "Autres charges financières", "Escomptes accordés", "Frais d'émission d'emprunts", "Remboursement de dettes", "Prêts", "Frais d’émission d’emprunts obligataires"],
  "67 - Charges exceptionnelles": ["Pénalités", "Amendes", "Pertes sur créances", "Sinistres", "Charges exceptionnelles diverses", "Catastrophes", "Dons et subventions"],
  "68 - Investissements": ["Achat de terrains", "Construction de bureaux", "Acquisition de machines", "Achat de matériel informatique", "Achat de véhicules", "Dépôts", "Cautionnements", "Acquisition de logiciels", "Achat de brevets", "Licences"]
};

const classifyExpense = (description) => {
  const lowerDesc = description.toLowerCase().trim();
  for (const [category, subcategories] of Object.entries(categoriesOHADA)) {
    for (const subcategory of subcategories) {
      const subWords = subcategory.toLowerCase().split(" ");
      if (subWords.some((word) => lowerDesc.includes(word) || lowerDesc.includes(word.normalize("NFD").replace(/[̀-ͯ]/g, "")))) {
        return { category, subcategory };
      }
    }
  }
  return { category: "Autres", subcategory: "Non classé" };
};

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // Charger les dépenses depuis un fichier CSV lorsque l'utilisateur le sélectionne
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const lines = content.split("\n");
      const newExpenses = lines.map((line) => {
        const [date, description, amount, category, subcategory] = line.split(",");
        return { date, description, amount, category, subcategory };
      }).filter(expense => expense.date); // Filtrer les lignes vides
      setExpenses(newExpenses);
    };
    reader.readAsText(file);
  };

  // Ajouter ou mettre à jour une dépense
  const saveExpense = () => {
    if (!date || !description || !amount) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    const { category, subcategory } = classifyExpense(description);
    const newExpense = { date, description, amount, category, subcategory };

    if (editIndex !== null) {
      // Si on est en mode édition, on met à jour l'élément
      const updatedExpenses = [...expenses];
      updatedExpenses[editIndex] = newExpense;
      setExpenses(updatedExpenses);
      setEditIndex(null); // Désactiver le mode édition
    } else {
      // Si c'est un ajout
      setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
    }

    // Sauvegarder dans le fichier CSV après l'ajout ou mise à jour
    saveExpensesToCSV([...expenses, newExpense]);

    setDate("");
    setDescription("");
    setAmount("");
  };

  // Sauvegarder les dépenses dans un fichier CSV
  const saveExpensesToCSV = (expenses) => {
    const csvContent = "Date,Description,Montant,Catégorie,Sous-Catégorie\n" +
      expenses.map(exp => `${exp.date},${exp.description},${exp.amount},${exp.category},${exp.subcategory}`).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "expenses.csv"); // Sauvegarder le fichier CSV avec FileSaver.js
  };

  // Supprimer une dépense
  const deleteExpense = (index) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
    saveExpensesToCSV(updatedExpenses); // Sauvegarder après suppression
  };

  // Modifier une dépense
  const editExpense = (index) => {
    const expenseToEdit = expenses[index];
    setDate(expenseToEdit.date);
    setDescription(expenseToEdit.description);
    setAmount(expenseToEdit.amount);
    setEditIndex(index); // Marquer comme en mode édition
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-lg w-full bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Ajouter une dépense</h2>
        {/* Importation CSV */}
        <input type="file" accept=".csv" onChange={handleCSVUpload} className="mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="input input-bordered w-full px-4 py-2 rounded-lg"
            placeholder="Date" 
          />
          <input 
            type="text" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="input input-bordered w-full px-4 py-2 rounded-lg"
            placeholder="Description" 
          />
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            className="input input-bordered w-full px-4 py-2 rounded-lg"
            placeholder="Montant" 
          />
          <button 
            onClick={saveExpense} 
            className="btn btn-primary col-span-2 py-2 rounded-lg"
          >
            {editIndex !== null ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </div>

      <div className="max-w-lg w-full bg-white p-6 rounded-xl shadow-lg mt-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Liste des Dépenses</h2>
        <table className="table-auto w-full text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Montant</th>
              <th className="px-4 py-2">Catégorie</th>
              <th className="px-4 py-2">Sous-Catégorie</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="px-4 py-2">{exp.date}</td>
                <td className="px-4 py-2">{exp.description}</td>
                <td className="px-4 py-2">{exp.amount} FCFA</td>
                <td className="px-4 py-2">{exp.category}</td>
                <td className="px-4 py-2">{exp.subcategory}</td>
                <td className="px-4 py-2">
                  <button 
                    onClick={() => editExpense(index)} 
                    className="btn btn-sm btn-info mr-2"
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => deleteExpense(index)} 
                    className="btn btn-sm btn-danger"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
