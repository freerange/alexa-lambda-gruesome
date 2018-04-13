/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
const Alexa = require('alexa-sdk');
const https = require('https');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = undefined;

const SKILL_NAME = 'GFR Game';
const HELP_MESSAGE = 'You can say play followed by your command, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const handlers = {
    // 'Unhandled': function() {
    //     this.response.speak("I don't understand");
    //     this.emit(':responseReady');
    // },
    'LaunchRequest': function () {
        var url = 'https://fast-bastion-39196.herokuapp.com/';
        https.get(url, (resp) => {
          let data = '';

          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk;
          });

          // The whole response has been received. Print out the result.
          resp.on('end', () => {
            var parsedOutput = JSON.parse(data)
            var text = parsedOutput.output.replace(/\n/g, '. ').replace(/>$/, '');;
            this.response.speak(text);
            this.attributes.gameMemory = parsedOutput.memory;
            this.response.shouldEndSession(false);
            this.emit(':responseReady');
          });

        }).on("error", (err) => {
          console.log("Error: " + err.message);
        });
    },
    'Go': function() {
      var gameCommand = 'go ' + this.event.request.intent.slots.gameDirection.value;

      var postData = {
          'command': gameCommand,
          'memory': this.attributes.gameMemory
      };

      const options = {
        protocol: 'https:',
        hostname: 'fast-bastion-39196.herokuapp.com',
        port: 443,
        path: '/',
        method: 'POST'
      };

      var self = this;
      const req = https.request(options, (res) => {
          let data = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
              data += chunk;
          });
          res.on('end', () => {
              var parsedOutput = JSON.parse(data);
              self.attributes.gameMemory = parsedOutput.memory;

              var text = parsedOutput.output.replace(/\n/g, '. ').replace(/>$/, '');
              this.response.speak(text);
              this.response.shouldEndSession(false);
              this.emit(':responseReady');
          });
      });

      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
      });

      // write data to request body
      req.write(JSON.stringify(postData));
      req.end();
    },
    'ExecuteGameCommand': function() {
        var gameCommand = this.event.request.intent.slots.gameCommand.value;

        var postData = {
            'command': gameCommand,
            'memory': this.attributes.gameMemory
        };

        const options = {
          protocol: 'https:',
          hostname: 'fast-bastion-39196.herokuapp.com',
          port: 443,
          path: '/',
          method: 'POST'
        };

        var self = this;
        const req = https.request(options, (res) => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                var parsedOutput = JSON.parse(data);
                self.attributes.gameMemory = parsedOutput.memory;

                var text = parsedOutput.output.replace(/\n/g, '. ').replace(/>$/, '');
                this.response.speak(text);
                this.response.shouldEndSession(false);
                this.emit(':responseReady');
            });
        });

        req.on('error', (e) => {
          console.error(`problem with request: ${e.message}`);
        });

        // write data to request body
        req.write(JSON.stringify(postData));
        req.end();
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
