const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldScript = `<script>
      (function() {
        try {
          var desc = Object.getOwnPropertyDescriptor(window, 'fetch');
          if (desc && desc.get && !desc.set && desc.configurable) {
            Object.defineProperty(window, 'fetch', {
              get: desc.get,
              set: function(val) { console.warn("Blocked fetch reassignment"); },
              configurable: desc.configurable,
              enumerable: desc.enumerable
            });
          }
        } catch (e) {}
      })();
    </script>`;

const newScript = `<script>
      (function() {
        try {
          var obj = window;
          var desc = null;
          while (obj) {
            desc = Object.getOwnPropertyDescriptor(obj, 'fetch');
            if (desc) break;
            obj = Object.getPrototypeOf(obj);
          }
          if (desc && desc.get && !desc.set && desc.configurable) {
            Object.defineProperty(obj, 'fetch', {
              get: desc.get,
              set: function(val) { console.warn("Blocked fetch reassignment"); },
              configurable: desc.configurable,
              enumerable: desc.enumerable
            });
          }
        } catch (e) {}
      })();
    </script>`;

html = html.replace(oldScript, newScript);
fs.writeFileSync('index.html', html);
