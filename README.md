# Crypto Analyzer - Service d'Analyse

## 📊 Vue d'ensemble

Service d'analyse des sentiments pour les cryptomonnaies. Ce service analyse les actualités collectées pour générer des recommandations d'investissement.

## 🔍 Fonctionnalités

- Analyse des sentiments des actualités
- Génération de recommandations (Buy/Sell/Hold)
- Calcul de niveau de confiance
- Statistiques détaillées
- Historique des analyses

## 🛠️ Technologies

- Node.js
- Express
- MongoDB
- Winston (logging)

## 🔌 API Endpoints

### GET `/api/crypto/analyze/:cryptocurrency`
Analyse une cryptomonnaie spécifique.

**Réponse** :
```json
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.72,
  "recommendation": "buy|sell|hold",
  "reasons": ["raison 1", "raison 2"],
  "stats": {
    "totalNews": 36,
    "positiveNews": 16,
    "negativeNews": 3
  }
}
```

## ⚙️ Configuration

### Variables d'Environnement
Créez un fichier `.env` basé sur `.env.example` :
```env
PORT=3002
MONGODB_URI=mongodb://admin:password123@mongodb-search:27017/searchResults?authSource=admin
```

### Prérequis
- Node.js 18+
- MongoDB
- Docker & Docker Compose

## 🚀 Installation

1. Cloner le repo :
```bash
git clone [URL_DU_REPO]
cd crypto-analyzer-analysis
```

2. Installer les dépendances :
```bash
npm install
```

3. Lancer avec Docker :
```bash
docker-compose up -d
```

## 🔄 Intégration

Ce service fait partie d'une suite de microservices :
- `crypto-analyzer-frontend` : Interface utilisateur
- `crypto-analyzer-news-scraper` : Collecte des actualités
- `crypto-analyzer-news-store` : Stockage MongoDB
- `crypto-analyzer-docker` : Configuration Docker globale

## 📝 Logs

Les logs sont stockés dans :
- `/logs/error.log` : Erreurs uniquement
- `/logs/combined.log` : Tous les logs

## 🧪 Tests

```bash
npm test
```

## 🔒 Sécurité

- Validation des entrées
- Gestion des erreurs
- Rate limiting
- CORS configuré 