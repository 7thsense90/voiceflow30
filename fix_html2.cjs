const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<script>\s*\(function\(\) \{\s*try \{[\s\S]*?\} catch \(e\) \{\}\s*\}\)\(\);\s*<\/script>/;
const newScript = `<script>
      (function() {
        try {
          var desc = Object.getOwnPropertyDescriptor(window, 'fetch');
          if (!desc) {
            desc = Object.getOwnPropertyDescriptor(Window.prototype, 'fetch');
          }
          if (desc && desc.get && !desc.set) {
            Object.defineProperty(window, 'fetch', {
              get: desc.get,
              set: function(v) { 
                console.warn("Intercepted fetch reassignment"); 
              },
              configurable: true,
              enumerable: true
            });
          }
        } catch (e) {
          console.error(e);
        }
      })();
    </script>`;

html = html.replace(regex, newScript);
fs.writeFileSync('index.html', html);
