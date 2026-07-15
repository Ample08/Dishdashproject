const { execSync } = require('child_process');

const port = process.env.PORT || 3000;

try {
  const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
  const pids = new Set();

  output.split('\n').forEach((line) => {
    if (line.includes('LISTENING')) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') pids.add(pid);
    }
  });

  if (pids.size === 0) {
    console.log(`Port ${port} is free.`);
    process.exit(0);
  }

  pids.forEach((pid) => {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`Stopped process ${pid} on port ${port}`);
    } catch {
      // process may already be gone
    }
  });
} catch {
  console.log(`Port ${port} is free.`);
}
