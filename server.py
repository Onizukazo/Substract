import os
import json
import urllib.request
import urllib.error
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Load .env.local manually
env_var = {}
if os.path.exists('.env.local'):
    with open('.env.local', 'r') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                key, val = line.split('=', 1)
                env_var[key.strip()] = val.strip().strip("'\"")

OPENAI_API_KEY = env_var.get('OPENAI_API_KEY')

class APIServerHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            messages = data.get('messages', [])

            if not OPENAI_API_KEY:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'OPENAI_API_KEY not found in .env.local'}).encode())
                return

            system_prompt = {
                "role": "system",
                "content": """You are Substract, an elite financial AI Agent and proactive concierge for Rahul.

Here is Rahul's current subscription data (all costs in Indian Rupees ₹):
[{"name":"Netflix","cost":649,"plan":"Premium","usage":"High"},{"name":"Spotify","cost":59,"plan":"Student","usage":"Medium"},{"name":"Adobe CC","cost":4230,"plan":"All Apps","usage":"Unused for 30 days"},{"name":"Disney+","cost":299,"plan":"Annual","usage":"Inactive 28 days"},{"name":"iCloud+","cost":219,"plan":"200GB","usage":"Regular"},{"name":"YouTube","cost":149,"plan":"Premium","usage":"High"},{"name":"Notion","cost":650,"plan":"Plus","usage":"Regular"},{"name":"FitnessPro","cost":1999,"plan":"Annual","usage":"Unused 28 days"}]

Total monthly spend: ₹8,254. Groups: Netflix Family (4 members), YouTube Premium (3 members). Always use ₹ symbol for currency, never $.

IMPORTANT: You MUST respond with valid JSON only. The format is:
{"text": "your conversational response here", "action": null}

When the user asks you to PERFORM an action (cancel, split/group, snooze, archive, show insights, start check-in), set the "action" field:
- Cancel a sub: {"type":"cancel","sub":"Netflix"} 
- Split/group a sub: {"type":"create_group","sub":"Spotify"}
- Snooze a sub: {"type":"snooze","sub":"Disney+"}
- Archive a sub: {"type":"archive","sub":"FitnessPro"}
- Show spending insights: {"type":"show_insights"}
- Start monthly check-in: {"type":"start_checkin"}
- Open subscription detail: {"type":"open_detail","sub":"Adobe CC"}

Use the exact subscription name from the data above. If no action is needed (just chatting or answering questions), set action to null.

Be concise, helpful, and proactive. Use emoji occasionally. When performing actions, confirm what you're about to do in the text field."""
            }

            # Map our frontend {from:'user', text:'...'} to OpenAI format
            openai_messages = [system_prompt]
            for m in messages[-10:]: # last 10
                role = "assistant" if m.get('from') == 'ai' else "user"
                openai_messages.append({"role": role, "content": m.get('text', '')})

            payload = json.dumps({
                "model": "gpt-4o-mini",
                "messages": openai_messages,
                "response_format": {"type": "json_object"}
            }).encode('utf-8')

            req = urllib.request.Request('https://api.openai.com/v1/chat/completions', data=payload)
            req.add_header('Content-Type', 'application/json')
            req.add_header('Authorization', f'Bearer {OPENAI_API_KEY}')

            try:
                with urllib.request.urlopen(req) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    ai_raw = result['choices'][0]['message']['content']
                    
                    # Parse structured JSON response
                    try:
                        parsed = json.loads(ai_raw)
                        ai_text = parsed.get('text', ai_raw)
                        action = parsed.get('action', None)
                    except json.JSONDecodeError:
                        ai_text = ai_raw
                        action = None
                    
                    resp_data = {'text': ai_text}
                    if action:
                        resp_data['action'] = action
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(resp_data).encode())
            except urllib.error.URLError as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            super().do_POST()

if __name__ == '__main__':
    port = 8000
    server_address = ('', port)
    httpd = HTTPServer(server_address, APIServerHandler)
    print(f"Starting Substract proxy server on port {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
