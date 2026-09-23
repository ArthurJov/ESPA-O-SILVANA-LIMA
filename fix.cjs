const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist')) results = results.concat(walk(file));
    } else if (file.endsWith('.html')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk('.');
const map = {
  'Ã§':'ç', 'Ã£':'ã', 'Ã¡':'á', 'Ã©':'é', 'Ã­':'í', 'Ã³':'ó', 'Ãº':'ú', 
  'Ãª':'ê', 'Ãµ':'õ', 'Ã¢':'â', 'Ãƒ':'Ã', 'Ã‰':'É', 'Ã‡':'Ç', 'Ã ':'Á', 
  'ÃŠ':'Ê', 'Ã“':'Ó', 'Ãš':'Ú', 'Ã‚':'Â', 'Ã£':'ã'
};
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  Object.keys(map).forEach(k => {
    if (content.includes(k)) {
      content = content.split(k).join(map[k]);
      changed = true;
    }
  });
  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Fixed ${f}`);
  }
});
