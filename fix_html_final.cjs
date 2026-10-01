const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<script>\s*\(function\(\) \{\s*try \{[\s\S]*?\}\s*\)\(\);\s*<\/script>/;
const newScript = `<script>
      (function() {
        // Try to safely add a setter to fetch if it only has a getter
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
          // Ignore redefine errors
        }
        
        // Suppress the uncaught error if the above failed and something tries to assign to fetch
        window.addEventListener('error', function(e) {
          if (e.message && (e.message.includes('Cannot set property fetch') || e.message.includes('fetch of #<Window>'))) {
            e.preventDefault();
            e.stopImmediatePropagation();
          }
        });
      })();
    </script>`;

html = html.replace(regex, newScript);
fs.writeFileSync('index.html', html);
