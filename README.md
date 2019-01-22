# Dependency-free Typescript setup

This is a _truly_ minimal, **dependency-free** setup that will provide the skeleton for you to:
* write your code in Typescript
* compile it for browser use
* use that compiled code in a browser environment

That's it. This server won't do anything fancy: it won't reload for you, it won't minify or uglify anything.

It _will_ serve files for you, and that's it. You can ignore the server entirely if you want; or, if you think writing your own server sounds neat, the [second half of the README](#about-the-server) is worth checking out.

There's no magic here. No Webpack, no loaders, no routing libraries necessary, etc. (If you don't know what those are, don't worry -- the _point_ of this repository is so you don't have to.) There's nothing wrong with using those tools, but they add complexity, and they can _extremely_ frustrating to use when all you really want is to be able to type some things and see what happens.

To add an HTML page -- you make a new HTML page. To link to it, you link to it like you would on a basic HTML site, because this _is_ a basic HTML site.

To add some CSS -- you add a CSS file, and link to it like you would in a normal, vanilla HTML project, because this _is_ a normal, vanilla HTML project -- that happens to use Javascript that was compiled from Typescript.

Use this project as a base, or an exercise, or an experiment; don't use it in production!

Have fun! It's just code. If something goes horrifically wrong, you can always clone this down again.

## How to use

1. Clone down this repository.
2. Change directories so you are inside the project folder.
2. The first time you do this, you'll need to run `npm install` so that you have Typescript set up.
2. `npx tsc` will compile the TypeScript source files. (If you have a global version of Typescript, you can just do `tsc`)
3. `npm start` will start your server.
4. <kbd>Ctrl</kbd>+<kbd>c</kbd> to shut off the server.

### Typescript

Your Typescript files should go in the `src` folder. Everything else should be in the `public` folder -- HTML, images, CSS, etc.

**Remember, Typescript is a *compiled* language.**

That means that if you change your Typescript files, you have to compile them again before those changes show up in the browser when you refresh the page. You should not need to restart the server itself.

If you get sick of having to recompile manually, you can run `npx tsc --watch` in one terminal tab/window and do `npm start` in another. That tells Typescript to watch for file changes, and recompile when it sees some.

### The server

You shouldn't need to touch the server code unless you _want_ to.

* _No_ live-reloading (that's in another repo, linked below). This means you have to refresh the webpage to see any changes you've made.
* Once your server is running, you shouldn't need to start or stop it, unless something goes wrong _or_ you change part of the server code (`server/index.js`) itself.

(If you want to try or look at the hot-reloading version, that is now available [here](https://github.com/aleph-naught2tog/reloading_ts_without_dependencies). Fair warning, hot reloading adds a couple moving parts, making it more complex)

## About the server

This is _not_ a robust server. It won't do anything fancy: no live-reloading; no fancy or complex requests; if a file isn't found, it'll serve a boring plain-text error and a status code of 500; etc., etc.

Here, I used Node for the server, since I know Typescript itself uses Node, and so if we're using Typescript, it's safe to assume Node is present. Also, since we install it with `npm`, it made the most sense. If you have a global installation of Typescript, you could skip using `npm` entirely.

If you have another server-side language that you prefer, you can use the same ideas and concepts.

### Why are there two server files?

There are two almost identical files: `server/index.doc.js` and `server/index.js`.

The first one, `server/index.doc.js` includes doc comments/notes as well as the code. If you change this file, the server does nothing else differently; it's _just_ for documentation purposes.

The second one, `server/index.js`, includes the actual code that runs. It is _identical_ to the first file that has the docs inside it, but without the comments.

**Why do it this way?** Because comments can be great and educational and useful, and also add a _lot_ of visual noise to a file. Some folks find it harder to read code that is heavily commented; this way, folks who _want_ the comments can have them -- and add their own -- and the folks who don't want to read them can skip it while working in the file.

This also means you can experiment like nuts in the `server/index.js` file without worrying about breaking things irrevocably. You can always clone down a new version, but maybe you have files you want to keep; or maybe you're just too frustrated but want to keep everything else.

You can run `npm run-script redo_server_file` from your terminal: this will generate a _new_ `server/index.js` based off `index.doc.js` but with no comments, and _completely overwrite the old `server/index.js`_.

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

**If servers are new to you, that is awesome! I'm so excited you are going to try working with your own local server. You probably want to look at the existing server files in this repository as a basis. This section is aimed for folks who might want to try making a server to handle this but in a different language -- but if this helps you, too, wahoo!**

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
