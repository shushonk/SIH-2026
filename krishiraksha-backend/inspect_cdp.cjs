const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const targets = JSON.parse(data);
      const pageTarget = targets.find(t => t.type === 'page' || t.url.includes('8081'));
      if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
        console.error('No page target found:', targets);
        process.exit(1);
      }
      connectWs(pageTarget.webSocketDebuggerUrl);
    } catch (e) {
      console.error('Parse error:', e);
      process.exit(1);
    }
  });
}).on('error', (e) => {
  console.error('HTTP error:', e);
  process.exit(1);
});

function connectWs(wsUrl) {
  const WebSocket = require('../krishiraksha-mobile/node_modules/ws');
  const ws = new WebSocket(wsUrl);
  let id = 1;

  ws.on('open', () => {
    ws.send(JSON.stringify({ id: id++, method: 'Page.enable' }));
    ws.send(JSON.stringify({ id: id++, method: 'Runtime.enable' }));

    // Click on "Live Weather" story
    setTimeout(() => {
      ws.send(JSON.stringify({
        id: id++,
        method: 'Runtime.evaluate',
        params: {
          expression: `(() => {
            const all = Array.from(document.querySelectorAll('*'));
            const story = all.find(el => el.innerText && el.innerText.includes('Live Weather') && el.offsetHeight > 20);
            if (story) {
              const rect = story.getBoundingClientRect();
              const opts = { bubbles: true, cancelable: true, clientX: rect.left + 15, clientY: rect.top + 15 };
              story.dispatchEvent(new MouseEvent('mousedown', opts));
              story.dispatchEvent(new MouseEvent('mouseup', opts));
              story.dispatchEvent(new MouseEvent('click', opts));
              return 'Clicked Live Weather story';
            }
            return 'Story Live Weather not found';
          })()`,
          returnByValue: true
        }
      }));

      // Wait 1.5s, capture story modal screenshot
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 3001,
          method: 'Page.captureScreenshot',
          params: { format: 'png' }
        }));
      }, 1500);
    }, 3500);
  });

  ws.on('message', (event) => {
    const msg = JSON.parse(event);
    if (msg.id === 3001 && msg.result && msg.result.data) {
      fs.writeFileSync('C:/Users/vs999/.gemini/antigravity-ide/brain/ff36a060-be52-4978-a696-126330e86e5f/story_weather_verified.png', Buffer.from(msg.result.data, 'base64'));
      console.log('Saved story_weather_verified.png');
      setTimeout(() => process.exit(0), 300);
    }
    if (msg.result && msg.result.result && msg.result.result.value) {
      console.log('[EVAL]', msg.result.result.value);
    }
  });
}
