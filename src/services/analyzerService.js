const mongoose = require('mongoose');
const Analysis = require('../models/Analysis');
const logger = require('../utils/logger');

class AnalyzerService {
  async analyzeData(cryptocurrency) {
    try {
      logger.info(`Début de l'analyse pour ${cryptocurrency}`);

      // Récupère les données de la collection du data-collector
      logger.info('Récupération des données depuis MongoDB...');
      
      // Se connecter à la bonne base de données
      const db = mongoose.connection.useDb('searchResults', { useCache: true });
      logger.info('Base de données connectée:', db.name);
      
      const searchResults = db.collection('searchresults');
      logger.info('Collection sélectionnée: searchresults');
      
      // Récupère les dernières 24h de news
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      logger.info('Recherche des résultats depuis:', last24Hours);
      logger.info('Expression régulière de recherche:', new RegExp(cryptocurrency, 'i'));
      
      const results = await searchResults.find({
        keyword: { $regex: new RegExp(cryptocurrency, 'i') },
        createdAt: { $gte: last24Hours }
      }).toArray();

      logger.info(`Nombre de résultats trouvés: ${results.length}`);
      if (results.length > 0) {
        logger.info('Premier résultat:', JSON.stringify(results[0]));
      }

      if (results.length === 0) {
        logger.info('Aucun résultat trouvé dans MongoDB');
        return {
          sentiment: 'neutral',
          confidence: 0,
          recommendation: 'hold',
          reasons: ['Pas assez de données pour l\'analyse'],
          stats: {
            totalNews: 0,
            positiveNews: 0,
            negativeNews: 0
          }
        };
      }

      // Analyse des sentiments
      const sentimentCounts = {
        positive: 0,
        negative: 0,
        neutral: 0
      };

      results.forEach(item => {
        sentimentCounts[item.sentiment]++;
      });

      // Calcul du sentiment global
      const totalResults = results.length;
      const sentiment = this._calculateOverallSentiment(sentimentCounts);
      
      // Calcul de la confiance
      const confidence = this._calculateConfidence(sentimentCounts, totalResults);

      // Génération de la recommandation
      const recommendation = this._generateRecommendation(sentiment, confidence);

      // Création de l'analyse
      const analysis = {
        sentiment,
        confidence,
        recommendation: recommendation.action,
        reasons: recommendation.reasons,
        stats: {
          totalNews: totalResults,
          positiveNews: sentimentCounts.positive,
          negativeNews: sentimentCounts.negative
        },
        sources: results.map(item => ({
          title: item.title,
          url: item.url,
          sentiment: item.sentiment
        }))
      };

      // Sauvegarde dans la base de données
      await Analysis.create({
        ...analysis,
        cryptocurrency
      });
      
      return analysis;

    } catch (error) {
      logger.error('Erreur lors de l\'analyse:', error);
      throw error;
    }
  }

  _calculateOverallSentiment(counts) {
    const total = counts.positive + counts.negative + counts.neutral;
    if (total === 0) return 'neutral';

    const positiveRatio = counts.positive / total;
    const negativeRatio = counts.negative / total;

    if (positiveRatio > 0.6) return 'positive';
    if (negativeRatio > 0.6) return 'negative';
    return 'neutral';
  }

  _calculateConfidence(counts, total) {
    if (total === 0) return 0;
    
    // Plus il y a de news, plus la confiance est élevée
    const volumeConfidence = Math.min(total / 10, 1); // Max confiance à 10 news
    
    // Plus le sentiment est tranché, plus la confiance est élevée
    const dominantCount = Math.max(counts.positive, counts.negative);
    const sentimentConfidence = dominantCount / total;

    return Math.round((volumeConfidence + sentimentConfidence) / 2 * 100) / 100;
  }

  _generateRecommendation(sentiment, confidence) {
    if (confidence < 0.3) {
      return {
        action: 'hold',
        reasons: ['Confiance insuffisante dans l\'analyse']
      };
    }

    switch (sentiment) {
      case 'positive':
        return {
          action: 'buy',
          reasons: [
            'Sentiment positif dans les actualités',
            'Bonne confiance dans l\'analyse',
            'Tendance haussière détectée'
          ]
        };
      case 'negative':
        return {
          action: 'sell',
          reasons: [
            'Sentiment négatif dans les actualités',
            'Bonne confiance dans l\'analyse',
            'Tendance baissière détectée'
          ]
        };
      default:
        return {
          action: 'hold',
          reasons: [
            'Sentiment neutre dans les actualités',
            'Pas de signal fort détecté'
          ]
        };
    }
  }
}

module.exports = new AnalyzerService(); 