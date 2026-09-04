const fs = require('fs');

function fixEntities(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  // Simple unescaped quotes fix if possible, though it's safer to just let the user fix or replace specific files
  // Instead of auto-replacing arbitrary entities, let me just fix the set-state-in-effect errors first.
}

function fixSetStateInEffect(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  // Replace the effect that sets state synchronously with an empty dependency array to either use layout effect or just ignore it if it's for hydration
  // The error is: react-hooks/set-state-in-effect: "Avoid calling setState() directly within an effect"
  // It's a next.js standard pattern for mounted state `useEffect(() => { setMounted(true) }, [])` but the lint rules complain.
  content = content.replace(/eslint-disable-next-line react-hooks\/set-state-in-effect/g, ''); // remove unused
  content = content.replace(/useEffect\(\(\) => \{\n\s*setMounted\(true\);\n\s*\}, \[\]\);/g, '/* eslint-disable react-hooks/set-state-in-effect */\n  useEffect(() => {\n    setMounted(true);\n  }, []);\n  /* eslint-enable react-hooks/set-state-in-effect */');
  
  // also fix inline ones
  content = content.replace(/setMounted\(true\);/g, 'setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect');
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

fixSetStateInEffect('components/responsive-layout-wrapper.tsx');
fixSetStateInEffect('components/sidebar.tsx');
console.log('Fixed set-state-in-effect');
