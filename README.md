# infosec**aware**

## Description

infosec**aware** is a portal for discussing matters relating to information security events, issues, sharing experiences and helping to collaboratively resolve issues amongst a community.

This application was developed for the Web Scripting and Application Development module (7WCM0035-0901-2019) 2019/2020, MSc Software Development (online) at University of Hertfordshire.

It features:

  * An interactive messageboard, prioritised by popularity and submission date
  * The ability to retract your identity when posting
  * The ability to limit the audience of your post to select community members
  * Tagging facilities, with the ability to limit search results by tag
  * A sensitivity indicator, displayed above the post: posts marked "top secret" are only viewable by administrators, specified users and the author

## Requirements

* nodejs version 13 is required for ESM loader support and ES2015 language standard & imports
* MongoDB version 3.4 or greater (count, aggregation pipeline features required) - version 4.2 was used in development

## Setup

Edit `/mongoose-setup.js` and adjust the DSN to specify how to connect to your MongoDB instance. Install requirements with:

> `npm install`

Start the application with:

> `npm start`

And connect to http://my.host.name:3000/ to use the application.

On a production system, it would be prudent to proxy the frontend with a web server such as nginx or the Apache project's httpd in order to protect traffic with SSL/TLS.

## Starting the application

To run the application in production mode:

> `npm start`

To run the application in development mode:

> `npm run start-dev`

## Coding style

Please note that server-side code is in ES2015 (ES6) format, for which nodejs 13 is required.

Browser-side code is ES5 format for compatibility; this code resides within `public/isaApp/js/`.

## Author

Rob Andrews <ra17aab@herts.ac.uk> / <rob@aphlor.org>

## Acknowledgements 💕

infosecaware is thankful for and makes use of the following manually installed libraries:

| Name | Homepage | License |
|------|----------|---------|
| AngularJS | https://angularjs.org/ | MIT |
| AutoSuggest | https://github.com/avcs06/AutoSuggest | MIT |
| Bootstrap | https://getbootstrap.com/ | MIT |
| jQuery | https://jquery.org/ | MIT |
| jquery.tagcloud.js | https://addywaddy.github.io/jquery.tagcloud.js/ | MIT |
| Popper.js | https://popper.js.org/ | MIT |

The following libraries are installed from npmjs:

| Name | Homepage | License |
|------|----------|---------|
| bcrypt | https://github.com/kelektiv/node.bcrypt.js#readme | MIT |
| cookie-parser (expressjs) | https://github.com/expressjs/cookie-parser#readme | MIT |
| debug | https://github.com/visionmedia/debug#readme | MIT |
| ejs | https://github.com/mde/ejs | Apache-2.0 |
| express | http://expressjs.com/ | MIT |
| http-errors | https://github.com/jshttp/http-errors#readme | MIT |
| lodash | https://lodash.com/ | MIT |
| mongoose | https://mongoosejs.com | MIT |
| morgan (expressjs) | https://github.com/expressjs/morgan#readme | MIT |
| uuid | https://github.com/kelektiv/node-uuid#readme | MIT |
| nodemon | https://github.com/remy/nodemon | MIT |

Thanks go to the MongoDB project for both MongoDB and the excellent [documentation](https://docs.mongodb.com/), the [nodejs project](https://nodejs.org/) and the [visual studio code project](https://code.visualstudio.com/) which made developing this software a pleasurable experience. [eslint](https://eslint.org/) was used to assist in detecting coding errors during development.
