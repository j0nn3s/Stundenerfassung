#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
import logging
from Database import Database
import json

class S(BaseHTTPRequestHandler):
    def _set_response(self):
        self.send_response(200)
        self.end_headers()

    def _set_responsePost(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

    def do_GET(self):
        try:
            filePath = self.path[1:]
            if(filePath != 'bootstrap-4.4.1-dist/css/bootstrap.css' and filePath != 'bootstrap-4.4.1-dist/css/bootstrap-grid.css'
                    and filePath != 'bootstrap-4.4.1-dist/css/bootstrap-select.min.css' and filePath != 'jquery-ui.css'
                    and filePath != 'print.min.css' and filePath != 'stundenerfassung.css'
                    and filePath != 'jquery-3.4.1.min.js' and filePath != 'jquery-ui.js'
                    and filePath != 'Popper.js' and filePath != 'print.min.js'
                    and filePath != 'bootstrap-4.4.1-dist/js/bootstrap.js' and filePath != 'bootstrap-4.4.1-dist/js/bootstrap-select.min.js'
                    and filePath != 'index-1.html' and filePath != 'stundenerfassungClient-1.js'
                    and filePath != 'stundenerfassungClient.js'):
                filePath = 'index.html'
            f = open(filePath, 'rb')
            self._set_response()
            self.wfile.write(f.read())
            f.close()
            return
        except IOError:
            self.send_error(404, 'FileNotFound: % s' % self.path)

    def do_POST(self):
        content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
        post_data = self.rfile.read(content_length) # <--- Gets the data itself
        self._set_responsePost()
        if(self.path == '/neueBaustelle'):
            neueBaustelle = database.insertBaustelle(json.loads(post_data, strict=False))
            self.wfile.write(format(json.dumps(neueBaustelle)).encode('utf-8'))
        if(self.path == '/neuerMitarbeiter'):
            neuerMitarbeiter = database.insertMitarbeiter(json.loads(post_data, strict=False))
            self.wfile.write(format(json.dumps(neuerMitarbeiter)).encode('utf-8'))
        if(self.path == '/baustelleneinsatzfuerID'):
            baustelleneinsaetze = database.getBaustellenEinsatzBaustelle((json.loads(post_data))["id"])
            self.wfile.write(format(json.dumps(baustelleneinsaetze)).encode('utf-8'))
        if(self.path == '/neuenBaustelleneinsatzspeichern'):
            baustelleneinsatz = database.insertBaustelleneinsatz((json.loads(post_data, strict=False)))
            self.wfile.write(format(json.dumps(baustelleneinsatz)).encode('utf-8'))
        if (self.path == '/baustelleneinsatzupdate'):
            baustelleneinsatz = database.updateBaustelleneinsatz((json.loads(post_data, strict=False)))
            self.wfile.write(format(json.dumps(baustelleneinsatz)).encode('utf-8'))
        if (self.path == '/mitarbeiterupdate'):
            mitarbeiter = database.updateMitarbeiter((json.loads(post_data, strict=False)))
            self.wfile.write(format(json.dumps(mitarbeiter)).encode('utf-8'))
        if (self.path == '/baustellenupdate'):
            baustelle = database.updateBaustelle((json.loads(post_data, strict=False)))
            self.wfile.write(format(json.dumps(baustelle)).encode('utf-8'))
        if (self.path == '/getAlleBaustellen'):
            baustellen = database.getAlleBaustellen()
            self.wfile.write(format(json.dumps(baustellen)).encode('utf-8'))
        if (self.path == '/getAlleMitarbeiter'):
            mitarbeiter = database.getAlleMitarbeiter()
            self.wfile.write(format(json.dumps(mitarbeiter)).encode('utf-8'))
        if(self.path == '/getBaustellenEinsatzVonBis'):
            baustelleneinsaetze = database.getBaustellenEinsatzVonBis((json.loads(post_data)))
            self.wfile.write(format(json.dumps(baustelleneinsaetze)).encode('utf-8'))
        if(self.path == '/deleteBaustelleMitId'):
            id = database.deleteBaustelleMitId((json.loads(post_data)))
            self.wfile.write(format(json.dumps(id)).encode('utf-8'))
        if(self.path == '/deleteTaetigkeitMitId'):
            id = database.deleteTaetigkeitMitId((json.loads(post_data)))
            self.wfile.write(format(json.dumps(id)).encode('utf-8'))
        if(self.path == '/deleteMitarbeiterMitId'):
            id = database.deleteMitarbeiterMitId((json.loads(post_data)))
            self.wfile.write(format(json.dumps(id)).encode('utf-8'))
        if(self.path == '/getAlleBaustellenMitTaetigkeiten'):
            self.wfile.write(format(json.dumps(database.getAlleBaustellenMitTaetigkeiten())).encode('utf-8'))
        if(self.path == '/waehleJahr'):
            database.waehleJahr((json.loads(post_data)))
            self.wfile.write(format(json.dumps(database.getAlleBaustellen())).encode('utf-8'))
        if(self.path == '/getStundenMonat'):
            self.wfile.write(format(json.dumps(database.getStundenMonat((json.loads(post_data, strict=False))))).encode('utf-8'))


def run(server_class=HTTPServer, handler_class=S, port=8080):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    logging.info('Starting httpd...\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    logging.info('Stopping httpd...\n')

if __name__ == '__main__':
    database = Database()
    run()