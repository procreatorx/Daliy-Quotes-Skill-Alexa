/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const axios = require('axios');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');


    HELP_MESSAGE = 'You can say tell a quote, or, a random quote, or, you can say exit... What can I help you with?',
    HELP_REPROMPT = 'What can I help you with?',
    FALLBACK_MESSAGE =  'The Daily Quotes skill can\'t help you with that.  It can help you listen Motivational Quotes and random quotes. If you say tell me a quote or a random quote. So, What can I help you with?',
    FALLBACK_REPROMPT = 'What can I help you with?',
    ERROR_MESSAGE = 'Sorry, an error occurred.',
    STOP_MESSAGE = 'Goodbye!';

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let word = requestAttributes.t('GREET')
    const speechText = `${word}, Welcome to Daily Quotes. You can ask me to tell quote of the day or motivational quotes or a random quote.`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Quote', speechText)
      .getResponse();
  },
};



function parseHtmlEnteties(str) {
  return str.replace(/&#([0-9]{1,4});/gi, function(match, numStr) {
      var num = parseInt(numStr, 10); // read num as normal number
      return String.fromCharCode(num);
  });
}

//Random Quote
const RandomQuoteIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'rq';
  },
 async handle(handlerInput) {
   const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
  let word = requestAttributes.t('SKILL_NAME')
    let speechText =  `Something went wrong Please try again`;
await axios.get('https://talaikis.com/api/quotes/random/')
.then(res => {
  speechText = `Said by ${res.data.author}, ${res.data.quote}`;
})
.catch(error => {
console.log(error);
});

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('Want to listen more quotes than ask again')
      .withSimpleCard('Random Quote is: ', speechText)
      .getResponse();
  },
};



// Quote of the day.
const QuteofdayIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'qod';
  },
  async handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let word = requestAttributes.t('SKILL_NAME')

 let speechText = 'Something went wrong Please try again';
 

    await axios.get('http://quotes.rest/qod.json')
    .then(res => {
     var author = res.data.contents.quotes[0].author;
      var qofd =  res.data.contents.quotes[0].quote;
      speechText = `Said by ${author}, ${qofd}`;

    })
    .catch(error => {
      console.log(error)
    });
   

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Quote of day is: ', speechText)
      .getResponse();
  },
};


const FallbackHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    
    return handlerInput.responseBuilder
      .speak(FALLBACK_MESSAGE)
      .reprompt(FALLBACK_REPROMPT)
      .getResponse();
  },
};


// Help
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = HELP_MESSAGE;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(HELP_REPROMPT)
      .withSimpleCard('HELP MESSAGE', speechText)
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
    });
    localizationClient.localize = function localize() {
      const args = arguments;
      const values = [];
      for (let i = 1; i < args.length; i += 1) {
        values.push(args[i]);
      }
      const value = i18n.t(args[0], {
        returnObjects: true,
        postProcess: 'sprintf',
        sprintf: values,
      });
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    };
  },
};


const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
        handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = STOP_MESSAGE;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Stop', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      // .speak(error)
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    RandomQuoteIntentHandler,
    QuteofdayIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    FallbackHandler
  )
  .addErrorHandlers(ErrorHandler)
  .addRequestInterceptors(LocalizationInterceptor)
  .lambda();


  const eninData = {
    translation: {
      SKILL_NAME: 'Indian Daily Quote',
      GREET: 'Namaste'
    },
  };

  const enusData = {
    translation: {
      SKILL_NAME: 'American Daily Quote',
      GREET: 'Hello'
    },
  };

  const languageStrings = {
    'en-IN': eninData,
    'en-US': enusData,
  };
