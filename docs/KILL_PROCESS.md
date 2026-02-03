# Kill Stuck Backend Process (Windows)

## Quick Commands

### 1. Find what's using port 5000
```powershell
netstat -ano | findstr :5000
```
This shows all processes using port 5000. The last column is the Process ID (PID).

### 2. Kill the process
```powershell
# Replace 7600 with the actual PID from step 1
taskkill /F /PID 7600
```

### 3. Kill all node processes (nuclear option)
```powershell
taskkill /F /IM node.exe
```

---

## One-Liner to Kill Port 5000

```powershell
# Find and kill whatever is on port 5000
$processId = (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -First 1; if ($processId) { taskkill /F /PID $processId }
```

---

## Prevent This Issue

### Option 1: Use nodemon properly
The backend uses nodemon which should handle cleanup. If it's not working:

Check `apps/api/nodemon.json`:
```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/index.ts",
  "events": {
    "restart": "echo 'Restarting server...'",
    "crash": "echo 'Server crashed!'",
    "exit": "echo 'Server exited'"
  }
}
```

### Option 2: Add cleanup to package.json
```json
"scripts": {
  "dev": "turbo run dev",
  "kill": "taskkill /F /IM node.exe || echo 'No node processes running'"
}
```

Then run: `npm run kill` before `npm run dev`

---

## Debug: See all node processes
```powershell
Get-Process node | Format-Table Id,ProcessName,StartTime -AutoSize
```

---

## Add to package.json (recommended)

```json
"scripts": {
  "kill:port": "powershell -Command \"$p = (Get-NetTCPConnection -LocalPort 5000 -EA SilentlyContinue).OwningProcess; if ($p) { taskkill /F /PID $p }\"",
  "dev": "npm run kill:port && turbo run dev"
}
```

This auto-kills port 5000 before starting dev server!
