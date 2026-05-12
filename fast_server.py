import http.server
import socketserver

class NoDNSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def address_string(self):
        # Return the IP directly without doing a reverse DNS lookup
        # This prevents the major lag experienced on Windows development servers.
        return self.client_address[0]

PORT = 8000

class ThreadingSimpleServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    pass

if __name__ == "__main__":
    with ThreadingSimpleServer(("", PORT), NoDNSRequestHandler) as httpd:
        print(f"Fast serving (threaded, no DNS lookup lag) at port {PORT}...")
        httpd.serve_forever()
