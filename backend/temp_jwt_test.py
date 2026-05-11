import json
import urllib.request

url = 'http://127.0.0.1:8000/api/token/'
data = json.dumps({'username': 'admin', 'password': '12345678'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req, timeout=10) as resp:
    print('status:', resp.status)
    print(resp.read().decode())
