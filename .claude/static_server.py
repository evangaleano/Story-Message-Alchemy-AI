import functools
import http.server
import os
import sys

DIRECTORY = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(os.environ.get("PORT", "8000"))

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=DIRECTORY)
httpd = http.server.ThreadingHTTPServer(("", PORT), Handler)
print(f"Serving {DIRECTORY} on port {PORT}", file=sys.stderr)
httpd.serve_forever()
