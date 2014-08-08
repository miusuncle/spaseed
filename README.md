# spaseed —  a lightweight framework for single-page application

[![Build Status](https://travis-ci.org/evanyuanvip/spaseed.svg?branch=master)](https://travis-ci.org/evanyuanvip/spaseed)

This project is a set that contains automated workflow, development, file organization norms SPA solutions. After a key building in the browser to access templates, quick and enjoy the fun of coding.

## Getting Started

### Run the Application

We have preconfigured the project with a simple development web server.  The simplest way to start
this server is:

```
npm start
```

Now browse to the app at `http://localhost:8000`.

### Development

Install dependencies:

```
npm install
```

If you do not install grunt command:

```
npm install -g grunt-cli
```

Execution `grunt`, real-time template replace, merge, document generation:

```
grunt
```

### Unit Testing

```
npm test
```

## Directory Layout

    config/                --> app configuration directory
      dao_config.js        --> cgi configuration
      manager.js           --> fetch and manage data
    dest/                  --> packaged file directory
    docs/                  --> document generation directory
    lib/                   --> lib file directory
      event.js             --> event package
      jquery-1.10.2.js     --> use jquery-1.10.2
      net.js               --> network requests package
      util.js              --> public method package
    main/                  --> main logical directory for framework
      default/             --> public rendering
      pagemanager.js       --> page switching management logic
      router.js            --> routing management
      startup.js           --> entry module
    modules/               --> all page module
    test/                  --> test cases
    widget/                --> common components directory
    app.js                 --> example server
    index.html             --> app layout file 
  


