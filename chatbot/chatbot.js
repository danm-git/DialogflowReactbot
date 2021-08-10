'use strict'
const dialogflow = require('dialogflow');
//const structjson = require('./structjson')
const config = require('../config/keys');
const {struct} = require('pb-util');
const projectId = config.googleProjectID;
const sessionId = config.dialogflowSessionID;
const languageCode = config.dialogflowSessionLanguageCode;

const mongoose = require('mongoose');
const googleAuth = require('google-oauth-jwt');

const credentials = {
    client_email: config.googleClientEmail,
    private_key: config.googlePrivateKey
};

const sessionClient = new dialogflow.SessionsClient({projectId, credentials});

const Registration = mongoose.model('registration');

const sessionPath = sessionClient.sessionPath(config.googleProjectID, config.dialogflowSessionLanguageCode);

module.exports = {

    getToken: async function() {
        return new Promise((resolve) => {
            googleAuth.authenticate(
                {
                    email: config.googleClientEmail,
                    key: config.googlePrivateKey,
                    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
                },
                (err, token) => {
                    resolve(token);
                },
            );
        });
    },

    textQuery: async function(text, userID, parameters = {}) {
        let sessionPath = sessionClient.sessionPath(projectId, sessionId + userID);
        let self = module.exports;
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: text,
                    languageCode: languageCode,
                },
            },
            queryParams: {
                payload: {
                    data: parameters
                }
            }
        };

        let responses = await sessionClient.detectIntent(request);
        responses = await self.handleAction(responses);
        return responses;
    },

    eventQuery: async function(event, userID, parameters = {}) {
        let self = module.exports;
        let sessionPath = sessionClient.sessionPath(projectId, sessionId + userID);
        const request = {
            session: sessionPath,
            queryInput: {
                event: {
                    name: event,
                    parameters: struct.encode(parameters),
                    languageCode: config.dialogflowSessionLanguageCode,
                },
            }
        };

        let responses = await sessionClient.detectIntent(request);
        responses = await self.handleAction(responses);
        return responses;
    },

    handleAction: function(responses) {
        let self = module.exports;
        let queryResult = responses[0].queryResult;

        switch (queryResult.action) {
            case 'dan.dan-yes':
                if (queryResult.allRequiredParamsPresent) {
                    self.saveRegistration(queryResult.parameters.fields);
                }
                break;
        }

        // console.log(queryResult.action);
        // console.log(queryResult.allRequiredParamsPresent);
        // console.log(queryResult.fulfillmentMessages);
        // console.log(queryResult.parameters.fields);

        return responses;
    },

    saveRegistration: async function(fields){
        const registration = new Registration({
            name: fields.name.stringValue,
            address: fields.address.stringValue,
            phone: fields.phone.stringValue,
            email: fields.email.stringValue,
            dateSent: Date.now()
        });
        try{
            let reg = await registration.save();
            console.log(reg);
        } catch (err){
            console.log(err);
        }
    }
}