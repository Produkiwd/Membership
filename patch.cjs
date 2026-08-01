const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `  const handleModuleClick = async (moduleId: string, defaultTitle: string, defaultSubtitle: string, defaultMaterials: any[]) => {
    let materials: any[] = [];
    try {
      materials = await getMateriByModule(moduleId);
    } catch (err) {
      console.error('Failed to fetch materials', err);
    }`;

const replacement1 = `  const handleModuleClick = (moduleId: string, defaultTitle: string, defaultSubtitle: string, defaultMaterials: any[]) => {
    let materials: any[] = [];
    try {
      const stored = localStorage.getItem(\`materi_module_\${moduleId}\`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) materials = parsed.map((m: any) => ({ title: m.title, url: m.url }));
      }
      if (materials.length === 0 && moduleId === '05') {
        const legacyStored = localStorage.getItem('thinking_with_claude_materials');
        if (legacyStored) {
          const parsed = JSON.parse(legacyStored);
          if (parsed.length > 0) materials = parsed.map((m: any) => ({ title: m.title, url: m.url }));
        }
        if (materials.length === 0) {
          const oldLink = localStorage.getItem('thinking_with_claude_link');
          if (oldLink) materials = [{title: 'Thinking with Claude', url: oldLink}];
        }
      }
    } catch {}`;

const target2 = `  useEffect(() => {
    setIsLoading(true);
    getMateriByModule(selectedModule)
      .then(data => {
        setMateriList(data);
      })
      .catch(() => setMateriList([]))
      .finally(() => setIsLoading(false));
  }, [selectedModule]);

  const handleSaveMateri = async (e: FormEvent) => {
    e.preventDefault();
    if (!materiTitle || !materiLink) {
      alert("Judul dan link materi harus diisi.");
      return;
    }
    try {
      const added = await addMateri(selectedModule, materiTitle, materiLink);
      if (added) {
        setMateriList([...materiList, added]);
        setMateriTitle('');
        setMateriLink('');
        alert('Materi berhasil ditambahkan!');
      }
    } catch (err) {
      alert('Gagal menambahkan materi ke database.');
    }
  };

  const handleDeleteMateri = async (index: number) => {
    const item = materiList[index];
    if (!item) return;
    try {
      await deleteMateri(item.id);
      const newList = materiList.filter((_, i) => i !== index);
      setMateriList(newList);
    } catch (err) {
      alert('Gagal menghapus materi.');
    }
  };`;

const replacement2 = `  useEffect(() => {
    try {
      const stored = localStorage.getItem(\`materi_module_\${selectedModule}\`);
      if (stored) {
        setMateriList(JSON.parse(stored));
      } else if (selectedModule === '05') {
        // Fallback for older data
        const legacyStored = localStorage.getItem('thinking_with_claude_materials');
        if (legacyStored) {
          setMateriList(JSON.parse(legacyStored));
        } else {
          const oldLink = localStorage.getItem('thinking_with_claude_link');
          if (oldLink) setMateriList([{title: 'Thinking with Claude', url: oldLink}]);
          else setMateriList([]);
        }
      } else {
        setMateriList([]);
      }
    } catch {
      setMateriList([]);
    }
  }, [selectedModule]);

  const handleSaveMateri = (e: FormEvent) => {
    e.preventDefault();
    if (!materiTitle || !materiLink) {
      alert("Judul dan link materi harus diisi.");
      return;
    }
    const newList = [...materiList, { title: materiTitle, url: materiLink }];
    setMateriList(newList);
    localStorage.setItem(\`materi_module_\${selectedModule}\`, JSON.stringify(newList));
    if (selectedModule === '05') {
      localStorage.setItem('thinking_with_claude_materials', JSON.stringify(newList));
    }
    setMateriTitle('');
    setMateriLink('');
    alert('Materi berhasil ditambahkan!');
  };

  const handleDeleteMateri = (index: number) => {
    const newList = materiList.filter((_, i) => i !== index);
    setMateriList(newList);
    localStorage.setItem(\`materi_module_\${selectedModule}\`, JSON.stringify(newList));
    if (selectedModule === '05') {
      localStorage.setItem('thinking_with_claude_materials', JSON.stringify(newList));
    }
  };`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);
content = content.replace('  const [isLoading, setIsLoading] = useState(false);\n', '');

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
