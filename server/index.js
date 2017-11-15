const fs = require('fs-extra')
const path = require('path')
const schedule = require('node-schedule')
const Twit = require('twit')
const winston = require('winston')

const fakeServer = require('./fakeServer')
const nidforspid = require('./nidforspid')
const randomArrayItem = require('./randomArrayItem')
const randomNumber = require('./randomNumber')

const isDevelopment = process.env.NODE_ENV === 'development'

const config = isDevelopment ? require('./env') : {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
}

const twit = new Twit(config)

const MAX_TWEETS = 4

const SCHEDULE = [
  '0 14 7 * * *', // 8.15
  '0 19 9 * * *', // 10.20
  '0 3 11 * * *', // 12.04
  '0 33 13 * * *', // 14.34
  '0 56 15 * * *', // 16.57
  '0 22 20 * * *', // 21.23
  '0 19 22 * * *', // 23.20
]

winston.configure({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: '/tmp/millennilols.log' }),
  ]
})

const generateTweet = async () => {
  try {
    const rawWords = await fs.readFile(path.resolve(__dirname, './words.json'))
    const words = JSON.parse(rawWords)

    const templates = Object.keys(words)

    let i = 0

    while (i < randomNumber(MAX_TWEETS)) {
      let template = randomArrayItem(templates)
      let status = nidforspid(words[template])

      winston.info(`🔫  ${status}`)

      if (!isDevelopment) await postTweet(status)

      i++
    }
  } catch(e) {
    winston.error(`💥  ${e}`)
  }
}

const postTweet = status => new Promise((resolve, reject) =>
  twit.post('statuses/update', { status }, (err, data) => {
    if (err) return reject(err)

    return resolve(data)
  })
)

const scheduleBot = () => {
  winston.info(`⏰  SCHEDULE : ${SCHEDULE}\n`)
  return SCHEDULE.map(time =>
    schedule.scheduleJob(time, () => generateTweet())
  )
}

const innit = () => {
  winston.info('🤖  M I L L E N N I L O L S\n')
  winston.info(`🛠  DEV_MODE = ${isDevelopment ? 'ON' : 'OFF'}\n`)

  return isDevelopment ? generateTweet() : scheduleBot()
}

innit()
