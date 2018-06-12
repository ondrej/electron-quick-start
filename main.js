// Modules to control application life and create native browser window
const {app, BrowserWindow, protocol} = require('electron')
const request = require('request');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
	var interceptCallback = (req, callback) => {
		console.log(`intercepted ${req.method} ${req.url}`);
		
    console.log(`req method: ${JSON.stringify(req.method, null, 2)}`);
    console.log(`req url: ${JSON.stringify(req.url, null, 2)}`);
    console.log(`req headers: ${JSON.stringify(req.headers, null, 2)}`);

		var options = {
			method: req.method,
			url: req.url,
			headers: req.headers,
			body: (req.uploadData && req.uploadData[0]) ? req.uploadData[0].bytes : undefined,
			encoding: null,
			gzip: false,
			followRedirect: false,
		};

		request(options, function (error, response, body) { }).on('response', (res) => {
			console.log(`'on response'`);
			
      console.log(`'on response' res code: ${JSON.stringify(res.statusCode, null, 2)}`);
      console.log(`'on response' res headers: ${JSON.stringify(res.headers, null, 2)}`);

			/*if (res.headers['set-cookie']) {
				res.headers['set-cookie'] = res.headers['set-cookie'][0];
      }
      console.log(`'on response' res headers (after): ${JSON.stringify(res.headers, null, 2)}`);*/

      callback({
				statusCode: res ? res.statusCode : undefined,
				headers: res ? res.headers : undefined,
				data: res,
			});
		})
		.on('error', (error) => {
			console.error(`'on error': ${error.message}`);
		});
  };

	protocol.interceptStreamProtocol('http', interceptCallback, (error) => {
    if (error) console.error('failed to register protocol handler for HTTP');
	});
	protocol.interceptStreamProtocol('https', interceptCallback, (error) => {
    if (error) console.error('failed to register protocol handler for HTTPS');
	});

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
