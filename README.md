# A Typescript setup with no dependencies

This is a truly minimal, dependency-free setup that will provide the skeleton for you to write your code in Typescript, compile it to Javascript, and use that compiled code in a browser environment. No webpack, no loaders, etc.

## What this is

There are other ways to do this; however, I wanted to create a setup that:
* relied _only_ on:
  * Typescript
  * a _minimal_, local server
* was simple enough for folks curious about servers to follow along with
* was small so it could be easi*er* to wrap your head around

Here, I used Node for the server, since I know Typescript itself uses Node, and so if we're using Typescript, it's safe to assume Node is present.

If you have another server-side language that you prefer, you can use the same ideas and concepts.

If you have a global installation of Typescript, you could skip using `npm` entirely.

This is _not_ a robust server. It won't do anything fancy: no live-reloading; no fancy or complex requests; if a file isn't found, it'll serve a boring plain-text error and a status code of 500; etc., etc. In fact, I'm pretty sure it won't even handle images.

Use it as a base, or an exercise, or an experiment; don't use it in production!

Have fun, tinker, break the server in strange and fascinating ways if you want; go wild! It's just code. If something goes horrifically wrong, just clone this down again!

### Why are there two server files?

There are two almost identical files: `server/index.doc.js` and `server/index.js`.

The first one, `server/index.doc.js` includes doc comments/notes as well as the code. If you change this file, the server does nothing else differently; it's _just_ for documentation purposes.

The second one, `server/index.js`, includes the actual code that runs. It is _identical_ to the first file that has the docs inside it, but without the comments.

**Why do it this way?** Because comments can be great and educational and useful, and also add a _lot_ of visual noise to a file. Some folks find it harder to read code that is heavily commented; this way, folks who _want_ the comments can have them -- and add their own -- and the folks who don't want to read them can skip it while working in the file.

This also means you can experiment like nuts in the `server/index.js` file without worrying about breaking things irrevocably. You can always clone down a new version, but maybe you have files you want to keep; or maybe you're just too frustrated but want to keep everything else.

You can run `npm run-script redo_server_file` from your terminal: this will generate a _new_ `server/index.js` based off `index.doc.js` but with no comments, and _completely overwrite the old `server/index.js`_.

### FYI

* _No_ live-reloading (that's in another repo, which I will link once up). This means you have to refresh the webpage to see any changes you've made.
* Unless you are running the Typescript compiler on `watch`, you need to recompile your Typescript files if you change them.
* Once your server is running, you shouldn't need to start or stop it, unless something goes wrong _or_ you change part of the server code (`server/index.js`) itself.

## How to use

1. Clone down this repository.
2. `tsc` will compile the TypeScript source files. (Please see note below.)
3. `npm start` will start your server.
4. <kbd>Ctrl</kbd>+<kbd>c</kbd> to shut off the server.

Your Typescript files should go in the `src` folder.

**Remember, Typescript is a *compiled* language.**

That means that if you change your Typescript files, you have to compile them again before those changes show up in the browser when you refresh the page. You should not need to restart the server itself.

If you get sick of having to recompile manually, you can run `tsc --watch` in one terminal tab/window and do `npm start` in another. That tells Typescript to watch for file changes, and recompile when it sees some.

## Explanation

To use Typescript-compiled files in a browser context, we need two things:

1. We need to tell Typescript to compile files to the native ES6 syntax, because [most browsers support it](https://caniuse.com/#feat=es6-module) (i.e., Chrome, Safari, Firefox do on both mobile and desktop, as do Edge and Opera on desktop).
2. We need to tell the browser, via our `index.html` file, that we are going to be loading modules. You do this by adding `type="module"` to the `<script>` tag.

You'll note I haven't mentioned the server yet, or _why_ we need a server.

The syntax for including a Typescript module is something like:

```ts
// someFile.ts
import someModule from './someModule'; // <- No file extension
```

In ES6 syntax, this ends up compiling to the basically identical:

```javascript
// someFile.js
import someModule from './someModule'; // <- Still no file extension
```

When the browser loads `someFile.js`, a couple of things can happen:

* If we are NOT serving the project on some kind of server, it'll fail with a CORS error -- something like `Access to script at 'file:///...' from origin 'null' has been blocked by CORS policy: The response is invalid.`. Note the `file:///` -- that's the indicator of the file protocol being used, _not_ `http`.
* If we ARE serving the project -- so we're accessing it with something like `http://localhost:3000` (or any other domain):
    * if we did _NOT_ say `<script type="module" src="someFile.js">` (we left out `type...`):
        * if we magically got lucky and are ONLY using default exports throughout, we'll be fine. (A `default` export is imported by doing `import someModuleDefault` -- _no_ curly braces.
        * if we are using any other kind of export syntax, we'll fail to load the file because of `Unexpected token {`. (The `{` is the brace from `import { ...`.)
    * if we are using `type="module"`, the browser parses the `import` request as, well, a request -- and actually makes an HTTP `request` to the server for the file being referenced

That very last case is what we want to handle -- if we handle that, all the other cases end up handled as well.

For handling that, we need a server. Tools like Webpack handle this, as well as many other things, at the cost of a _lot_ of complexity.

We don't need a very _complicated_ server for this: it needs to be able to serve files (reasonably!), and for this specific case, we need to be able to tell it that if it receives a certain kind of request, that it should look for a Javascript file.

## Typescript Compilation settings

The key things here are:
* `"module": "esnext"`: this tells Typescript we want to use the native ES6-style imports.
* `"outDir": "./public/src"`: this is where the compiled files are actually compiled _to_. You can change this -- but `./public` _must_ be replaced with **whatever your server root will be**.
* `"noEmit": false`: this is what tells Typescript that we want it to write actual, physical files. Without this, we have no files to serve.

You can add other settings, too; just make sure they don't interfere with those, or that the ones listed above come after, so they override any earlier ones. (You can also use the `extends` option.)

## Server file

**If servers are new to you, that is awesome! I'm so excited you are going to try working with your own local server. You probably want to look at the existing server files in this repository, not this section; but if this section helps you, too, great!**

This section is if you care about _why_ we're doing this, or if you want to use a different server set-up. It goes over the parts that are necessary for this to work. I'm going to assume that if you have a server-side language of choice, you know how to set up the minimum server in it one way or another.

Your server has to successfully respond to HTTP requests, as well as serve files. (Pretty reasonable baseline, I think!)

Whatever your language or tool of choice, you need to be able to do at least some basic configuration of the server -- that is, _how_ it responds to a request at a low-level.

Specifically, you need to:
* Receive a request
* Check the request headers for a `referer` [sic].
  * If the request headers have a `referer`
    * If the `referer` ends in `.js`
      * Get the file requested
      * Send the response with that file data
  * Else
    * Get the file requested
    * Send the response with that file data

```javascript
// server/index.js

/*
  These are Node system modules -- we `require` them first thing because if they
  aren't present at all, we want to fail very loudly right off the bat instead
  of failing later on when we actually need to use them.
*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const SERVER_ROOT_FOLDER = './public';

const getType = extension => {
  const map = {
    css: 'text/css',
    js: 'text/javascript',
    html: 'text/html',
    plain: 'text/plain'
  };

  if (extension in map) {
    return map[extension];
  } else {
    return map.plain;
  }
};

const isModuleRequest = request => {
  // 'referer' is the correct spelling for the header.
  const { referer } = request.headers;

  if (!referer) {
    return false;
  }

  return referer.endsWith('.js');
};

const getPath = request => {
  const parsedUrl = url.parse(request.url);

  if (isModuleRequest(request)) {
    return `${SERVER_ROOT_FOLDER}${parsedUrl.pathname}.js`;
  } else {
    return `${SERVER_ROOT_FOLDER}${parsedUrl.pathname}`;
  }
};

const requestHandler = (request, response) => {
  console.log(`${request.method} ${request.url}`);

  if (request.url === '/favicon.ico') {
    response.statusCode = 404;
    response.end();
    return;
  }

  const filePath = getPath(request);
  const extension = path.parse(filePath).ext.replace('.', '');
  const contentType = getType(extension);

  fs.readFile(filePath, (error, fileData) => {
    if (error) {
      console.error(error);
      response.statusCode = 500; // internal server error
      response.end('There was an error getting the request file.');
    } else {
      response.setHeader('Content-Type', contentType);
      response.end(fileData);
    }
  });
};

http.createServer(requestHandler).listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
```
