// First make sure the wrapper app is loaded
document.addEventListener("DOMContentLoaded", function() {
   const fs = require("fs");
   const DIRNAME = __dirname.replace("app.asar", "app.asar.unpacked");

   // Then get its webviews
   let webviews = document.querySelectorAll(".TeamView webview");

   let readFile = 

   let cssPromise = Promise.all(
      [
         "default-overrides.css",
         "extra-overrides.css"
      ]
      .map(filename => DIRNAME + "/" + filename)
      .map(path => new Promise((resolve, reject) => {
         fs.readFile(path, (err, data) => {
            if (err) {
               reject(err);
            } else {
               resolve(data);
            }
         });
      }))
   )
      .then(cssList => cssList.reduce((sum, it) => (sum + it)));
      .catch(console.error);


   // Insert a style tag into the wrapper view
   cssPromise.then(css => {
      let s = document.createElement('style');
      s.type = 'text/css';
      s.innerHTML = css;
      document.head.appendChild(s);
   });

   // Wait for each webview to load
   webviews.forEach(webview => {
      webview.addEventListener('ipc-message', message => {
         if (message.channel == 'didFinishLoading')
            // Finally add the CSS into the webview
            cssPromise.then(css => {
               let script = `
                     let s = document.createElement('style');
                     s.type = 'text/css';
                     s.id = 'slack-custom-css';
                     s.innerHTML = \`${css}\`;
                     document.head.appendChild(s);
                     `
               webview.executeJavaScript(script);
            })
      });
   });
});
