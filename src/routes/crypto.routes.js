const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const axios = require('axios');
const delay = require('../utils/delay');
const analyzerService = require('../services/analyzerService');
const Analysis = require('../models/Analysis');

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 secondes entre chaque requête

const makeThrottledRequest = async (params) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }

  try {
    const response = await axios.get('https://cryptopanic.com/api/v1/posts/', {
      params: {
        auth_token: process.env.CRYPTOPANIC_API_KEY,
        ...params
      },
      timeout: 10000 // timeout de 10s
    });
    
    lastRequestTime = Date.now();
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      logger.warn('Limite de requêtes atteinte, attente de 1 minute');
      await delay(60000); // attente 1 minute
      return makeThrottledRequest(params); // réessaie
    }
    throw error;
  }
};

router.get('/news', async (req, res) => {
  try {
    const data = await makeThrottledRequest({ kind: 'news' });
    res.json(data);
  } catch (error) {
    logger.error('Erreur lors de la récupération des news:', error);
    res.status(error.response?.status || 500).json({ 
      error: 'Erreur serveur',
      details: error.response?.data || error.message 
    });
  }
});

router.get('/analyze', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword requis' });
    }

    const data = await makeThrottledRequest({
      currencies: 'BTC,ETH',
      kind: 'news',
      filter: 'important'
    });

    res.json(data);
  } catch (error) {
    logger.error('Erreur lors de l\'analyse:', error);
    res.status(error.response?.status || 500).json({ 
      error: 'Erreur serveur',
      details: error.response?.data || error.message 
    });
  }
});

router.get('/analyze/:cryptocurrency', async (req, res) => {
  try {
    const { cryptocurrency } = req.params;
    logger.info(`Nouvelle requête d'analyse pour ${cryptocurrency}`);
    
    const analysis = await analyzerService.analyzeData(cryptocurrency);
    logger.info(`Analyse terminée pour ${cryptocurrency}:`, JSON.stringify(analysis));
    
    res.json({
      cryptocurrency,
      analysis
    });
  } catch (error) {
    logger.error('Erreur lors de l\'analyse:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
});

router.get('/history/:cryptocurrency', async (req, res) => {
  try {
    const { cryptocurrency } = req.params;
    const { limit = 10 } = req.query;

    const analyses = await Analysis.find({ cryptocurrency })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-__v');

    res.json(analyses);
  } catch (error) {
    logger.error('Erreur lors de la récupération historique:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
});

module.exports = router; 