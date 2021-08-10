module.exports = {
    googleProjectID: process.env.GOOGLE_PROJECT_ID,
    dialogflowSessionID: process.env.DIALOGFLOW_SESSION_ID,
    dialogflowSessionLanguageCode: process.env.DIALOGFLOW_LANGUAGE_CODE,
    googlePrivateKey: JSON.parse(process.env.GOOGLE_PRIVATE_KEY),
    googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    mongoURI: process.env.MONGO_URI,
}