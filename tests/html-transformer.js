const path = require('path');

module.exports = {
  process(src, filename) {
    try {
      const rel = path.relative(process.cwd(), filename).replace(/\\/g, '/');
      const replaced = src.replace(/<script>([\s\S]*?)<\/script>/i, (m, inner) => {
        return `<script>${inner}\n//# sourceURL=${rel}\n</script>`;
      });
      return { code: 'module.exports = ' + JSON.stringify(replaced) + ';' };
    } catch (e) {
      return { code: 'module.exports = ' + JSON.stringify(src) + ';' };
    }
  },
};
