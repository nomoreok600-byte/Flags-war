import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const _filename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const _dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(_filename);

const isPackaged = typeof (process as any).pkg !== 'undefined';
const appDir = isPackaged ? path.dirname(process.execPath) : process.cwd();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.use(express.json());

// Set up WebSocket connection upgrade
server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  
  if (pathname === '/api/stream') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Automatic FFmpeg installer for zero-human installation on Windows RDP
function ensureFFmpeg() {
  if (process.platform !== 'win32') return;

  const localFFmpeg = path.join(appDir, 'ffmpeg.exe');
  const dirnameFFmpeg = path.join(_dirname, 'ffmpeg.exe');

  if (fs.existsSync(localFFmpeg) || fs.existsSync(dirnameFFmpeg)) {
    console.log('✓ Found local ffmpeg.exe static binary!');
    return;
  }

  console.log('⚙️ FFmpeg executable is missing on Windows!');
  console.log('⚡ Starting automated background download of official static FFmpeg build...');
  
  try {
    const psCommand = `
      $ProgressPreference = 'SilentlyContinue'
      $url = 'https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v4.4.1/ffmpeg-4.4.1-win-64.zip'
      Write-Host 'Downloading ffmpeg.zip from GitHub...'
      Invoke-WebRequest -Uri $url -OutFile 'ffmpeg.zip'
      Write-Host 'Extracting archive content...'
      Expand-Archive -Path 'ffmpeg.zip' -DestinationPath '.' -Force
      Write-Host 'Cleaning up setup files...'
      Remove-Item 'ffmpeg.zip'
      Write-Host 'FFmpeg successfully installed and registered!'
    `;
    execSync(`powershell -Command "${psCommand.replace(/\n/g, '; ')}"`, { cwd: appDir, stdio: 'inherit' });
  } catch (e: any) {
    console.error('⚠️ Failed to auto-download FFmpeg binary via PowerShell:', e.message);
    console.log('Please ensure your RDP has internet access or place ffmpeg.exe manually in this folder.');
  }
}

// WebSocket Server for RTMP Streaming
wss.on('connection', (ws: WebSocket, req) => {
  console.log('Client connected to Live Stream WebSocket');
  
  const urlParams = new URL(req.url || '', `http://${req.headers.host}`).searchParams;
  const streamKey = urlParams.get('streamKey') || '';
  const rtmpUrl = urlParams.get('rtmpUrl') || 'rtmp://a.rtmp.youtube.com/live2';
  const bitrate = urlParams.get('bitrate') || '2500k';
  const isPotato = urlParams.get('potatoMode') === 'true';
  
  if (!streamKey) {
    ws.send(JSON.stringify({ type: 'error', message: 'Missing Stream Key!' }));
    ws.close();
    return;
  }

  const rtmpDestination = `${rtmpUrl}/${streamKey}`;
  console.log(`Spawning FFmpeg to stream to: ${rtmpUrl}/**** (Potato Mode: ${isPotato})`);

  // Use local downloaded ffmpeg if available
  const localFFmpeg = path.join(appDir, 'ffmpeg.exe');
  const dirnameFFmpeg = path.join(_dirname, 'ffmpeg.exe');
  
  let ffmpegPath = 'ffmpeg';
  if (process.platform === 'win32') {
    if (fs.existsSync(localFFmpeg)) {
      ffmpegPath = localFFmpeg;
    } else if (fs.existsSync(dirnameFFmpeg)) {
      ffmpegPath = dirnameFFmpeg;
    }
  }

  console.log(`Resolved FFmpeg executable path: ${ffmpegPath}`);

  // Spawn FFmpeg with dummy audio generator to ensure YT/RTMP has a valid audio stream
  const ffmpegArgs = [
    '-loglevel', 'info',
    '-i', 'pipe:0',               // Input 0: Read WebM format from client stream stdin
    '-f', 'lavfi', 
    '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100', // Input 1: Silent dummy audio source
    '-c:v', 'libx264',           // H264 encoder
    '-preset', 'ultrafast',      // Ultrafast preset for minimum CPU on light RDP
    '-tune', 'zerolatency',      // Optimize for live broadcast zero latency
  ];

  if (isPotato) {
    // Force downscale to 480x480 & frame-cap to 15fps output to slash CPU usage by 70%
    ffmpegArgs.push('-vf', 'scale=480:480', '-r', '15');
  } else {
    ffmpegArgs.push('-vf', 'scale=720:720', '-r', '30');
  }

  ffmpegArgs.push(
    '-b:v', isPotato ? '1200k' : bitrate, // Reduced bitrate for potato stream
    '-maxrate', isPotato ? '1200k' : bitrate,
    '-bufsize', '2400k',
    '-pix_fmt', 'yuv420p',
    '-g', isPotato ? '30' : '60',         // Appropriate keyframe intervals (2 seconds)
    '-c:a', 'aac',                        // AAC audio codec
    '-b:a', '96k',                        // Clean, ultra-light audio stream
    '-ar', '44100',                       // High quality audio rate
    '-map', '0:v',                        // Use video from input 0
    '-map', '1:a',                        // Use silent audio from input 1
    '-shortest',                         // Stop when video ends
    '-f', 'flv',                         // FLV container for RTMP
    rtmpDestination
  );

  const ffmpeg = spawn(ffmpegPath, ffmpegArgs);

  ffmpeg.stdout.on('data', (data) => {
    console.log(`FFmpeg stdout: ${data}`);
  });

  ffmpeg.stderr.on('data', (data) => {
    const log = data.toString();
    console.log(`FFmpeg log: ${log}`);
    if (log.includes('frame=') || log.includes('fps=')) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'status', message: log.trim() }));
      }
    }
  });

  ffmpeg.on('error', (err) => {
    console.error('Failed to spawn FFmpeg process:', err);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'FFmpeg executable not found! Make sure ffmpeg.exe is downloaded.' 
      }));
    }
    ws.close();
  });

  ffmpeg.stdin.on('error', (err: any) => {
    console.error('FFmpeg stdin pipe error (handled safely):', err.message);
  });

  ffmpeg.on('close', (code) => {
    console.log(`FFmpeg process exited with code ${code}`);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'stopped', message: `Stream closed (code ${code})` }));
    }
    ws.close();
  });

  // Receive binary media recorder chunks from client browser
  ws.on('message', (data) => {
    if (ffmpeg.stdin.writable) {
      try {
        ffmpeg.stdin.write(data, (err) => {
          if (err) {
            console.error('Handled error writing to FFmpeg stdin:', err.message);
          }
        });
      } catch (err: any) {
        console.error('Handled exception writing to FFmpeg stdin:', err.message);
      }
    }
  });

  ws.on('close', () => {
    console.log('Client closed WebSocket, terminating FFmpeg stream...');
    try {
      if (ffmpeg.stdin.writable) {
        ffmpeg.stdin.end();
      }
      ffmpeg.kill('SIGINT');
    } catch (e) {
      // Ignore
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket stream error:', err);
    try {
      ffmpeg.stdin.end();
      ffmpeg.kill('SIGKILL');
    } catch (e) {
      // Ignore
    }
  });
});

// Helper to open a native-feeling standalone application window
function autoOpenBrowser(port: number) {
  const url = `http://localhost:${port}`;
  try {
    if (process.platform === 'win32') {
      const edgePath = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Microsoft\\Edge\\Application\\msedge.exe');
      const edgePathX86 = path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Microsoft\\Edge\\Application\\msedge.exe');
      
      let exePath = '';
      if (fs.existsSync(edgePath)) {
        exePath = edgePath;
      } else if (fs.existsSync(edgePathX86)) {
        exePath = edgePathX86;
      }

      if (exePath) {
        console.log(`🎮 Launching Standalone Game Window (Chromium App Mode)...`);
        spawn(exePath, [`--app=${url}`, '--window-size=1280,720'], { detached: true, stdio: 'ignore' });
      } else {
        // Fallback to cmd-level Start App Mode
        console.log(`🎮 Falling back to command-level App Mode...`);
        spawn('cmd.exe', ['/c', `start msedge --app=${url} --window-size=1280,720`], { stdio: 'ignore' });
      }
    } else if (process.platform === 'darwin') {
      console.log(`🎮 Launching Standalone Game Window on macOS...`);
      spawn('open', ['-a', 'Google Chrome', '--args', `--app=${url}`], { stdio: 'ignore' });
    } else {
      console.log(`🎮 Launching Standard Browser on Linux...`);
      spawn('xdg-open', [url], { stdio: 'ignore' });
    }
  } catch (e: any) {
    console.warn('Failed to auto-open web browser in app mode:', e.message);
  }
}

// Run automated FFmpeg static installer check
ensureFFmpeg();

// Mount Vite or Serve Static Assets
const PORT = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === 'production' || isPackaged;

if (isProd) {
  const distPath = path.join(_dirname, 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Fully Packaged Flag Wars Server running in PRODUCTION on http://localhost:${PORT}`);
    autoOpenBrowser(PORT);
  });
} else {
  // Mount Vite dynamically in Dev Mode
  import('vite').then((vite) => {
    vite.createServer({
      server: { middlewareMode: true, hmr: { server } },
      appType: 'spa'
    }).then((viteServer) => {
      app.use(viteServer.middlewares);
      
      server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Flag Wars Full-Stack Dev Server running on http://localhost:${PORT}`);
        autoOpenBrowser(PORT);
      });
    });
  });
}
