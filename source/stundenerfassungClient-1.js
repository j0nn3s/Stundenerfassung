/*setze aktuelles datum*/
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = dd + '-' + mm + '-' + yyyy;

aktuelleBaustellenID = '';
aktuelleTaetigkeiten=[];
baustellenDaten=[];
aktuelleBaustelleDaten={};

cleanModalFormular = function(){
    $('#forularmodalBoddy').html('');
}

loaddatepicker = function() {
    $(".datepicker").datepicker({changeMonth: true, dateFormat: 'dd-mm-yy' });
    $('#yearDate').val(yyyy);
    $("#datum_empty").text(today);
    $("#datum_empty_datepicker").val(today);
    $('#datum_Von_druck').text(today);
    $('#datum_Bis_druck').text(today);
    $('.datepicker').on('change', function() {
        $(this).parent().children('.date').html($(this).val());
    });

    $('.date').on('click', function() {
       $(this).parent().children('.datepicker').datepicker('show');
    });
};

$("#baustellentatigkeitAnlegen").click(function () {
         baustelle = '{"baustellenid":"' + aktuelleBaustellenID +
             '", "datum":"' + $('#datum_empty').text() +
             '", "taetigkeit":"' + $('#taetigkeit_empty').val() +
             '", "stunden":' + $('#stunden_empty').val() + 
             ', "mitarbeiter":"' + $('#mitarbeiter_empty').val() + '"}'
            $.post("neuenBaustelleneinsatzspeichern",
        baustelle,
        function (data, status) {
            aktuelleTaetigkeiten.push(data[0])
            $('#datum_empty').text(today);
            $('#taetigkeit_empty').val('');
            $('#stunden_empty').val(8);
            $('#mitarbeiter_empty').val('');
            rerenderTaetigkeiten();
            $('#baustellentatigkeitAnlegen').attr('disabled','true');
        });
});
$('#baustelleineinsaetzeTabelle').on('click', '.baustellentatigkeitspeichern',function () {
         baustelle = '{"id": "' + ($(this).attr('id')).split('_')[1] + '", "baustellenid":"' + aktuelleBaustellenID +
             '", "datum":"' + $('#datum_' + ($(this).attr('id')).split('_')[1]).text() +
             '", "taetigkeit":"' + $('#taetigkeit_' + ($(this).attr('id')).split('_')[1]).val() +
             '", "stunden":' + $('#stunden_' + ($(this).attr('id')).split('_')[1]).val() + 
             ', "mitarbeiter":"' + $('#mitarbeiter_' + ($(this).attr('id')).split('_')[1]).val() + '"}';
            $.post("baustelleneinsatzupdate",
        baustelle,
        function (data, status) {
            aktuelleTaetigkeiten = data;
            rerenderTaetigkeiten(baustelle['id']);
        });
});
$('#baustelleineinsaetzeTabelle').on('click', '.baustellentatigkeitloeschen',function () {
         baustellenId = '{"id": "' + ($(this).attr('id')).split('_')[1] + '"}';
            $.post("deleteTaetigkeitMitId",
        baustellenId,
        function (data, status) {
            removeTaetigkeitFromList(data['id'])
            rerenderTaetigkeiten();
        });
});
fillFormularVonBis = function () {
    vonVal = $('#datum_Von_druck').text();
    if(vonVal == ''){
      vonVal = '01-01-2000';  
    }
    bisVal = $('#datum_Bis_druck').text();
    if(bisVal == ''){
      bisVal = '31-12-3000';  
    }
    $.post("getBaustellenEinsatzVonBis",
        '{"von": "' + vonVal + '", "bis": "' + bisVal + '"}',
    function (data, status) {
          renderBaustelleFormular(data);  
    });
};

renderBaustelleFormular = function(data){
    cleanModalFormular();
    renderer = '<div class="container">';
    for (baustelleNum in data){
        baustelle = data[baustelleNum];
        if(baustelle != undefined){
            renderer = renderer + '<div class="row"><h3>' + baustelle['name'] + '</h3></div>';
            taetigkeitenArray = baustelle['taetigkeiten'];
            sortResults(taetigkeitenArray, 'datum', true);
            for (tat in taetigkeitenArray){
                taetigkeit = baustelle['taetigkeiten'][tat]
                renderer = renderer + '<div class="row"><div class="col-3"><label>' + taetigkeit['datum'] + '</label></div><div class="col-3"><label>' + taetigkeit['taetigkeit'] + '</label></div><div class="col-3"><label>' + taetigkeit['stunden'] + '</label></div><div class="col-3"><label>' + taetigkeit['mitarbeiter'] + '</label></div></div>';  
            }
        }
    }
    renderer = renderer + '</div>';
    $('#forularmodalBoddy').append(renderer);
}

getBaustelleWithid = function(){
    for (baustelle in baustellenDaten){
        if(aktuelleBaustellenID == (baustellenDaten[baustelle])['id']){
            aktuelleBaustelleDaten = baustellenDaten[baustelle];
            break;
        }
    }
}

renderAktuelleBaustelle = function(id){
    getBaustelleWithid();
    $('#aktuelleBaustellenName').val(aktuelleBaustelleDaten['name']);
    $('#aktuelleBaustellenPlz').val(aktuelleBaustelleDaten['plz']);
    $('#aktuelleBaustellenOrt').val(aktuelleBaustelleDaten['ort']);
    $('#aktuelleBaustellenStrasse').val(aktuelleBaustelleDaten['strasse']);
    $('#aktuelleBaustellenBemerkungen').val(aktuelleBaustelleDaten['bemerkungen']);
}

insertRow = function(data){
    $('#empty').before('<tr class="baustellentaetigkeitsklasse">' +
            '<td><input onKeyUp="checkSaveDiasableFunction($(this));" type="text" class="datepicker" style="display:none"><div id="datum_' + data['id'] + '" contentEditable="true" class="date">' + data['datum'] + '</div></td>' +
            '<td><textarea class="requiredFieldForTeaetigkeit"  onMouseUp="checkSaveDiasableFunction($(this));" onKeyUp="checkSaveDiasableFunction($(this));" id="taetigkeit_' + data['id'] + '" type="text">' + data['taetigkeit'] + '</textarea></td>' +
            '<td><input onKeyUp="checkSaveDiasableFunction($(this));" id="stunden_' + data['id'] + '" class="requiredFieldForTeaetigkeit" type="number" pattern="([0-9]{2,3}).([0-9]{0,2})" step="0.5" value="' + data['stunden'] +'"></td>' +
            '<td><textarea id="mitarbeiter_' + data['id'] + '" type="text">' + data['mitarbeiter'] + '</textarea></td>' +
            '<td class="actions">' +
                '<button id="baustellentatigkeitspeichern_' + data['id'] + '" type="button" class="btn btn-primary baustellentatigkeitspeichern requiredCheck">speichern</button>' +
                '<button id="baustellentatigkeitloeschen_' + data['id'] + '" type="button" class="btn btn-danger baustellentatigkeitloeschen">loeschen</button>' +
            '</td>' +
        '</tr>');
};

ladeBaustelleinsaezteFuerId = function(data){
    $.post("baustelleneinsatzfuerID",
    '{"id":"' + data + '"}',
    function (data, status) {
        aktuelleTaetigkeiten = data;
        rerenderTaetigkeiten();
    });  
};

deleteAktuelleBaustelle = function(){
        $.post("deleteBaustelleMitId",
        '{"id":"' + aktuelleBaustellenID + '"}',
        function (data, status) {
            removeBaustelleFromList();
            renderOptionForBaustelle();
        });  
};

baustellenauswahlF = function(){
    id = $('#baustellenauswahl').children("option:selected").attr('id');
    if(id=="neueBaustelle"){
        $('#baustelleAnlegenModal').modal('toggle');
        $('#baustelleineinsaetzeTabelle').hide();
        $('#baustellenButtons').hide();
    } else if(id=='disabledBaustellenauswahl'){
        $('#baustelleineinsaetzeTabelle').hide();
        $('#baustellenButtons').hide();
    } else {
        $('#baustelleineinsaetzeTabelle').show();
        ladeBaustelleinsaezteFuerId(id);
        aktuelleBaustellenID = id; 
        $('#baustellenButtons').show();
    }
};

renderOptionForBaustelle = function(data){
    $('.baustellenAuswahl').remove();
    sortResults(baustellenDaten, 'name',false);
    selectedString = '';
    for (number in baustellenDaten){
        baustelle = baustellenDaten[number]
        $('#neueBaustelle').before('<tr id="' + baustelle['id'] + '"><td class="baustellenName"><input class="baustellenName text" contentEditable="true"></td>' + 
                              '<td class="baustellenOrt"><input class="baustellenOrt text" contentEditable="true"></td>' +
                              '<td class="baustellenPlz"><input class="baustellenPlz text" contentEditable="true"></td>' +
                              '<td class="baustellenStrasse"><input class="baustellenStrasse text"></td>' + 
                              '<td class="baustellenBemerkungen"><textarea  class="text baustellenBemerkungen" ></textarea></td>' +
                              '<td class="actions"><button class="btn btn-danger" onclick="deleteAktuelleBaustelle();">loeschen</button>' +
                                '<button class="btn btn-warning" onclick="$(\'#formular\').modal(\'toggle\');">drucken</button>' +
                                '<button id="aktuelleBaustelleUpdaten" class="btn btn-primary baustellenUpdateF">speichern</button>' +
                              '</td></tr>');
        $('#' + baustelle['id']).children('.baustellenName').children('.baustellenName').val(baustelle['name']);
        $('#' + baustelle['id']).children('.baustellenOrt').children('.baustellenOrt').val(baustelle['ort']);
        $('#' + baustelle['id']).children('.baustellenPlz').children('.baustellenPlz').val(baustelle['plz']);
        $('#' + baustelle['id']).children('.baustellenStrasse').children('.baustellenStrasse').val(baustelle['strasse']);
        $('#' + baustelle['id']).children('.baustellenBemerkungen').children('.baustellenBemerkungen').val(baustelle['bemerkungen']);
    }
    baustellenauswahlF();
};

waehleJahr = function(jahrwahl) {
    if(jahrwahl != null){
        baustelle = '{"jahr":"' + jahrwahl + '"}';
        $.post("waehleJahr",
        baustelle,
        function (data, status) {
            baustellenDaten = data;
            renderOptionForBaustelle();
            yyyy = jahrwahl;
            today = dd + '-' + mm + '-' + yyyy;
            loaddatepicker();
            });
    } else if(jahrwahl != yyyy){
        if ($('#yearDate').val().match('[0-9]{4}')){
            baustelle = '{"jahr":"' + $('#yearDate').val() + '"}';
            $.post("waehleJahr",
            baustelle,
            function (data, status) {
                baustellenDaten = data;
                renderOptionForBaustelle();
                yyyy = $('#yearDate').val();
                today = dd + '-' + mm + '-' + yyyy;
                loaddatepicker();
            });
        }
    }
};

cleanNeueBaustelle = function(){
    $('#neuerBaustellenName').val('');
    $('#neuerBaustellenPlz').val('');
    $('#neuerBaustellenOrt').val('');
    $('#neuerBaustellenStrasse').val('');
    $('#neuerBaustellenBemerkungen').val('');
    $('#disabledBaustellenauswahl').prop('selected', true);
    $('#baustellenauswahl').selectpicker('refresh');
}

neueBaustelleSpeichernF = function() {
             baustelle = '{"name":"' + $('#neuerBaustellenName').val() +
                 '", "plz":"' + $('#neuerBaustellenPlz').val() +
                 '", "ort":"' + $('#neuerBaustellenOrt').val() + 
                 '", "strasse":"' + $('#neuerBaustellenStrasse').val() + 
                 '", "bemerkungen":"' + $('#neuerBaustellenBemerkungen').val() + '"}';
            $.post("neueBaustelle",
            baustelle,
            function (data, status) {
                cleanNeueBaustelle();
                baustellenDaten.push(data[0]);
                renderOptionForBaustelle(data[0]);
            });
};

removeBaustelleFromList = function(){
    index = -1;
    for(baustelleN in baustellenDaten){
        baustelle = baustellenDaten[baustelleN];
        if(baustelle['id'] == aktuelleBaustellenID){
            index = baustelleN;
        }
    }
    if (index > -1) {
      baustellenDaten.splice(index, 1);
    }
}
removeTaetigkeitFromList = function(id){
    index = -1;
    for(taetitgkeitN in aktuelleTaetigkeiten){
        taetigkeit = aktuelleTaetigkeiten[taetitgkeitN];
        if(taetigkeit['id'] == id){
            index = taetitgkeitN;
        }
    }
    if (index > -1) {
      aktuelleTaetigkeiten.splice(index, 1);
    }
}
$('#baustelleinauswahlTabelle').on('click', '.baustellenUpdateF', function() {
             baustelle = '{"id":"' + $(this).parent().parent().attr('id') + '", "name":"' + $(this).parent().parent().children('.baustellenName').children('.baustellenName').val() +
                 '", "plz":"' + $(this).parent().parent().children('.baustellenPlz').children('.baustellenPlz').val() +
                 '", "ort":"' + $(this).parent().parent().children('.baustellenOrt').children('.baustellenOrt').val() + 
                 '", "strasse":"' + $(this).parent().parent().children('.baustellenStrasse').children('.baustellenStrasse').val() + 
                 '", "bemerkungen":"' + $(this).parent().parent().children('.baustellenBemerkungen').children('.baustellenBemerkungen').val() + '"}';
            $.post("baustellenupdate",
            baustelle,
            function (data, status) {
                removeBaustelleFromList();
                baustellenDaten.push(data[0]);
                renderOptionForBaustelle(data[0]);
            });
});

rerenderTaetigkeiten = function(highlightedId){
    sortResults(aktuelleTaetigkeiten, 'datum', true);
    $('.baustellentaetigkeitsklasse').remove();
    for (number in aktuelleTaetigkeiten){
        baustelle = aktuelleTaetigkeiten[number]
        insertRow(baustelle);
    }
    loaddatepicker();
    //geht so noch ned
    if(highlightedId !== null){
        $('#datum_' + highlightedId + '').parent().parent().effect("highlight", {color: 'green'}, 4000);   
    }
    baustelleMitTaetigkeiten = [aktuelleBaustelleDaten];
    baustelleMitTaetigkeiten[0]['taetigkeiten'] = aktuelleTaetigkeiten;
    renderBaustelleFormular(baustelleMitTaetigkeiten);
}

sortResults = function(array, prop, asc) {
    array.sort(function(a, b) {
        if (asc) {
            return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
        } else {
            return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
        }
    });
}

drucken = function(){
    printJS({ printable: 'forularmodalBoddy', type: 'html', header: 'Stunden', css: ['bootstrap-4.4.1-dist/css/bootstrap.css', 'bootstrap-4.4.1-dist/css/bootstrap-grid.css', 'stundenerfassung.css'] })
}

/*to disable buttons while something is not filled*/
$('#neuerBaustellenName').bind('keyup', function() {
    if($('#neuerBaustellenName').val() != ''){
      $('#neueBaustelleSpeichern').removeAttr('disabled');  
    } else {
        $('#neueBaustelleSpeichern').attr('disabled','true');
    }
});

checkSaveDiasableFunction = function(thisElement){
    if(thisElement.val().match('[0-9]{2}-[0-9]{2}-[0-9]{4}')){
        if(thisElement.val().split('-')[2] ==  $('#yearDate').val()){
            thisElement.parent().parent().children('.actions').children('.requiredCheck').removeAttr('disabled');
        } else {
            alert('falsches jahr siehe oben rechts');
            thisElement.parent().parent().children('.actions').children('.requiredCheck').attr('disabled','true');
        }
    }
    else if(thisElement.val() != ''){
        thisElement.parent().parent().children('.actions').children('.requiredCheck').removeAttr('disabled');
    } else {
        thisElement.parent().parent().children('.actions').children('.requiredCheck').attr('disabled','true');
    }  
}

checkSaveDiasableFunctionAktuelleBaustelle = function(){
    /*todo check with name*/
      if($('#aktuelleBaustellenName').val() != ''){
        $('#aktuelleBaustelleUpdaten').removeAttr('disabled');  
    } else {
        $('#aktuelleBaustelleUpdaten').attr('disabled','true');
    }  
}


waehleJahr(yyyy);
