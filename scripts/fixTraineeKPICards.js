async function main() {
  const fs = await import('node:fs');

  function fixFiles(files) {
    files.forEach((file) => {
      if (!fs.existsSync(file)) return;
      let content = fs.readFileSync(file, 'utf-8');
      content = content.replace(/borderColor="#06b6d4"/g, 'themeColor="cyan"');
      content = content.replace(/borderColor="#3b82f6"/g, 'themeColor="blue"');
      content = content.replace(/borderColor="#10b981"/g, 'themeColor="emerald"');
      content = content.replace(/borderColor="#f59e0b"/g, 'themeColor="amber"');
      content = content.replace(/borderColor="#8b5cf6"/g, 'themeColor="purple"');
      content = content.replace(/borderColor="#6366f1"/g, 'themeColor="indigo"');
      content = content.replace(/borderColor="#f43f5e"/g, 'themeColor="red"');
      content = content.replace(/borderColor="#ef4444"/g, 'themeColor="red"');

      fs.writeFileSync(file, content);
      console.log(`Updated ${file}`);
    });
  }

  fixFiles([
    'app/trainee/dashboard/page.tsx',
    'components/trainee/CoursePlayer/CourseOverview.tsx',
    'components/trainee/dashboard/TraineeOverview.tsx'
  ]);
}

main().catch((error) => {
  console.error('Failed to update trainee KPI cards:', error);
  process.exit(1);
});
