const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const SRC_BUILD_FOLDER_PATTERN = '/src/';
const SERVER_ROOT_FOLDER = './public';

const determineContentType = extension => {
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
  const referer = request.headers.referer;

  if (!referer) {
    return false;
  } else {
    return referer.includes(SRC_BUILD_FOLDER_PATTERN);
  }
};

const getPath = request => {
  const parsedUrl = url.parse(request.url);

  if (isModuleRequest(request)) {
    return `${SERVER_ROOT_FOLDER}${parsedUrl.pathname}.js`;
  } else {
    if (parsedUrl.pathname === '/') {
      return `${SERVER_ROOT_FOLDER}${parsedUrl.pathname}index.html`;
    } else {
      return `${SERVER_ROOT_FOLDER}${parsedUrl.pathname}`;
    }
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
  const contentType = determineContentType(extension);

  fs.readFile(filePath, (error, fileData) => {
    if (error) {
      console.error(error);
      response.statusCode = 500;
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
