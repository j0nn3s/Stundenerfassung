#!/usr/bin/env python3
from tinydb import TinyDB, Query
from _datetime import datetime
from _datetime import date
import re
import json

class Database():
    jahr = date.today().year
    db = TinyDB("Datenbanken/" + str(jahr))
    baustelle = db.table('Baustelle')
    mitarbeiter = db.table('Mitarbeiter')
    baustelleneinsatz = db.table('Baustelleneinsatz')
    indexCounterTaetigkeiten = db.table('indexCounterTaetigkeiten')
    zahl = indexCounterTaetigkeiten.get(Query()['id'] == '1')
    if(zahl is None):
        indexCounterTaetigkeiten.insert({'id': '1', 'index': '1'})
    indexCounterBaustellen = db.table('indexCounterBaustellen')
    zahl = indexCounterBaustellen.get(Query()['id'] == '1')
    if(zahl is None):
        indexCounterBaustellen.insert({'id': '1', 'index': '1'})
    indexCounterMitarbeiter = db.table('indexCounterMitarbeiter')
    zahl = indexCounterMitarbeiter.get(Query()['id'] == '1')
    if(zahl is None):
        indexCounterMitarbeiter.insert({'id': '1', 'index': '1'})

    def waehleJahr(self, jahrjson):
        self.jahr = jahrjson['jahr']
        self.db = TinyDB("Datenbanken/" + str(jahrjson['jahr']))
        self.baustelle = self.db.table('Baustelle')
        self.mitarbeiter = self.db.table('Mitarbeiter')
        self.baustelleneinsatz = self.db.table('Baustelleneinsatz')
        self.indexCounterTaetigkeiten = self.db.table('indexCounterTaetigkeiten')
        zahl = self.indexCounterTaetigkeiten.get(Query()['id'] == '1')
        if(zahl is None):
            self.indexCounterTaetigkeiten.insert({'id': '1', 'index': '1'})
        self.indexCounterBaustellen = self.db.table('indexCounterBaustellen')
        zahl = self.indexCounterBaustellen.get(Query()['id'] == '1')
        if(zahl is None):
            self.indexCounterBaustellen.insert({'id': '1', 'index': '1'})
        zahl = self.indexCounterMitarbeiter.get(Query()['id'] == '1')
        if (zahl is None):
            self.indexCounterMitarbeiter.insert({'id': '1', 'index': '1'})

    def insertBaustelle(self, baustelle):
        baustelle['id'] = self.indexCounterBaustellen.get(Query()['id'] == '1')['index']
        self.baustelle.insert(baustelle)
        neuerIndex = int(baustelle['id']) + 1
        self.indexCounterBaustellen.update({'id': '1', 'index': str(neuerIndex)}, Query()['id'] == '1')
        return self.baustelle.search(Query()['id'] == baustelle['id'])

    def insertMitarbeiter(self, mitarbeiter):
        mitarbeiter['id'] = self.indexCounterMitarbeiter.get(Query()['id'] == '1')['index']
        self.mitarbeiter.insert(mitarbeiter)
        neuerIndex = int(mitarbeiter['id']) + 1
        self.indexCounterMitarbeiter.update({'id': '1', 'index': str(neuerIndex)}, Query()['id'] == '1')
        return self.mitarbeiter.search(Query()['id'] == mitarbeiter['id'])

    def insertBaustelleneinsatz(self, baustelleneinsatz):
        baustelleneinsatz['id'] = self.indexCounterTaetigkeiten.get(Query()['id'] == '1')['index']
        self.baustelleneinsatz.insert(baustelleneinsatz)
        neuerIndex = int(baustelleneinsatz['id']) + 1
        self.indexCounterTaetigkeiten.update({'id': '1', 'index': str(neuerIndex)}, Query()['id'] == '1')
        returnVal = self.baustelleneinsatz.search((Query()['baustellenid'] == baustelleneinsatz['baustellenid']) & (Query()['id'] == baustelleneinsatz['id'])).copy()
        for einsatz in returnVal:
            einsatzMitarbeiter = einsatz['mitarbeiter']
            for mitarbeiter in einsatzMitarbeiter:
                mitarbeiter['name'] = self.mitarbeiter.search(Query()['id'] == mitarbeiter['id'])[0]['name']
        return returnVal

    def updateBaustelleneinsatz(self, baustelleneinsatz):
        self.baustelleneinsatz.update(baustelleneinsatz, Query()['id'] == baustelleneinsatz['id'])
        returnVal = self.baustelleneinsatz.search(Query()['baustellenid'] == baustelleneinsatz['baustellenid']).copy()
        for einsatz in returnVal:
            einsatzMitarbeiter = einsatz['mitarbeiter']
            for mitarbeiter in einsatzMitarbeiter:
                mitarbeiter['name'] = self.mitarbeiter.search(Query()['id'] == mitarbeiter['id'])[0]['name']
        return returnVal

    def updateBaustelle(self, baustelle):
        self.baustelle.update(baustelle, Query()['id'] == baustelle['id'])
        return self.baustelle.search(Query()['id'] == baustelle['id'])

    def updateMitarbeiter(self, mitarbeiter):
        self.mitarbeiter.update(mitarbeiter, Query()['id'] == mitarbeiter['id'])
        return self.mitarbeiter.search(Query()['id'] == mitarbeiter['id'])

    def getStundenMonat(self, monatsJson):
        format = '%d-%m-%Y'
        monat = monatsJson['monat']
        alleEinsaetze = self.baustelleneinsatz.all()
        stunden = 0
        for einsatz in alleEinsaetze:
            pattern = re.compile("[0-9]{2}-[0-1][0-9]-[0-9]{4}")
            if(pattern.match(einsatz['datum'])):
                valDate = datetime.strptime(einsatz['datum'], format)
                if (monat == valDate.month):
                    stunden = stunden + einsatz['stunden']
        return {'stunden': stunden}

    def getBaustellenEinsatzVonBis(self, vonBis):
        alleEinsaetze = self.baustelleneinsatz.all()
        format = '%d-%m-%Y'
        vonDate = datetime.strptime(vonBis['von'], format)
        bisDate = datetime.strptime(vonBis['bis'], format)
        countval = 0
        alleEinsaetzelist = alleEinsaetze.copy()
        for einsatz in alleEinsaetzelist:
            pattern = re.compile("[0-9]{2}-[0-1][0-9]-[0-9]{4}")
            if(pattern.match(einsatz['datum'])):
                valDate = datetime.strptime(einsatz['datum'], format)
                if not(vonDate <= valDate) or not (valDate <= bisDate):
                    alleEinsaetze.remove(einsatz)
            else:
                alleEinsaetze.remove(einsatz)
            einsatzMitarbeiter = einsatz['mitarbeiter']
            for mitarbeiter in einsatzMitarbeiter:
                mitarbeiter['name'] = self.mitarbeiter.search(Query()['id'] == mitarbeiter['id'])[0]['name']
            countval = countval + 1
        alleBaustellen = self.baustelle.all()
        alleRelevantenBaustellen = []
        for baustelle in alleBaustellen:
            baustellentaetigkeiten = []
            arrayEinsaetze = alleEinsaetze.copy()
            for taetigkeit in arrayEinsaetze:
                if taetigkeit['baustellenid'] == baustelle['id']:
                    baustellentaetigkeiten.append(taetigkeit)
                    alleEinsaetze.remove(taetigkeit)
            if baustellentaetigkeiten:
                baustelle['taetigkeiten'] = baustellentaetigkeiten
                alleRelevantenBaustellen.append(baustelle)

        return alleRelevantenBaustellen

    def getBaustellenEinsatzBaustelle(self, baustellenId):
        returnVal = self.baustelleneinsatz.search(Query()['baustellenid'] == baustellenId).copy()
        for einsatz in returnVal:
            einsatzMitarbeiter = einsatz['mitarbeiter']
            for mitarbeiter in einsatzMitarbeiter:
                mitarbeiter['name'] = self.mitarbeiter.search(Query()['id'] == mitarbeiter['id'])[0]['name']
        return returnVal

    def getAlleBaustellen(self):
        return self.baustelle.all()

    def getAlleMitarbeiter(self):
        return self.mitarbeiter.all()

    def deleteBaustelleMitId(self, id):
        self.baustelle.remove(Query()['id'] == id['id'])
        self.baustelleneinsatz.remove(Query()['baustellenid'] == id['id'])
        return id

    def deleteTaetigkeitMitId(self, id):
        self.baustelleneinsatz.remove(Query()['id'] == id['id'])
        return id

    def deleteMitarbeiterMitId(self, id):
        self.mitarbeiter.remove(Query()['id'] == id['id'])
        return id
    def getAlleBaustellenMitTaetigkeiten(self):
        alleEinsaetze = self.baustelleneinsatz.all()
        alleEinsaetzelist = alleEinsaetze.copy()
        for einsatz in alleEinsaetzelist:
            einsatzMitarbeiter = einsatz['mitarbeiter']
            for mitarbeiter in einsatzMitarbeiter:
                mitarbeiter['name'] = self.mitarbeiter.search(Query()['id'] == mitarbeiter['id'])[0]['name']
        alleBaustellen = self.baustelle.all()
        alleRelevantenBaustellen = []
        for baustelle in alleBaustellen:
            baustellentaetigkeiten = []
            arrayEinsaetze = alleEinsaetze.copy()
            for taetigkeit in arrayEinsaetze:
                if taetigkeit['baustellenid'] == baustelle['id']:
                    baustellentaetigkeiten.append(taetigkeit)
                    alleEinsaetze.remove(taetigkeit)
            if baustellentaetigkeiten:
                baustelle['taetigkeiten'] = baustellentaetigkeiten
                alleRelevantenBaustellen.append(baustelle)

        return alleRelevantenBaustellen
