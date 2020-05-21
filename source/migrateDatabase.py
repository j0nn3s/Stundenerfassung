from Database import Database
import json


database = Database()
baustelleneinsaetze = database.getBaustellenEinsatzVonBis(json.loads('{"von": "01-01-2020", "bis": "31-12-2020"}'))

for baustelle in baustelleneinsaetze:
    for taetigkeit in baustelle['taetigkeiten']:
        for mitarbeiter in taetigkeit['mitarbeiter']:
                stundenstring = mitarbeiter['stunden']
                mitarbeiter['stunden'] = float(stundenstring)
        database.updateBaustelleneinsatz(taetigkeit)
