const express = require('express')
const logger = require('./logger')
const expressPino = require('express-pino-logger')({ logger })
// Task 1: import the natural library
const natural = require('natural')

// Task 2: initialize the express server
const port = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use(expressPino)

// Define the sentiment analysis route
// Task 3: create the POST /sentiment analysis
app.post('/sentiment', async (req, res) => {
  // Task 4: extract the sentence parameter
  const { sentence } = req.query

  if (!sentence) {
    logger.error('No sentence provided')
    return res.status(400).json({ error: 'No sentence provided' })
  }

  // Initialize the sentiment analyzer with the Natural's PorterStemmer and "English" language
  const Analyzer = natural.SentimentAnalyzer
  const stemmer = natural.PorterStemmer
  const analyzer = new Analyzer('English', stemmer, 'afinn')

  // Perform sentiment analysis
  try {
    const sentimentScore = analyzer.getSentiment(sentence.split(' '))

    // Task 5: set sentiment to negative or positive based on score rules
    const sentiment = sentimentScore < 0 ? 'negative' : sentimentScore > 0.33 ? 'positive' : 'neutral'

    // Logging the result
    logger.info(`Sentiment analysis result: ${sentimentScore}`)

    // Task 6: send a status code of 200 with both sentiment score and the sentiment txt in the format { sentimentScore: analysisResult, sentiment: sentiment }
    res.status(200).json({ sentimentScore, sentiment })
  } catch (error) {
    logger.error(`Error performing sentiment analysis: ${error}`)
    // Task 7: if there is an error, return a HTTP code of 500 and the json {'message': 'Error performing sentiment analysis'}
    res.status(500).json({ message: 'Error performing sentiment analysis' })
  }
})

app.listen(port, () => {
  logger.info(`Server running on port ${port}`)
})
