/*setze aktuelles datum*/
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = dd + '-' + mm + '-' + yyyy;

aktuelleBaustellenID = '';
aktuelleTaetigkeiten=[];
baustellenDaten=[];
mitarbeiterDaten=[];
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
             ', "mitarbeiter":[';
    $('#mitarbeiter_empty').children(".mitarbeiterStundenRow").each(function(){
        sel = $(this).children('.mitarbeiterStundenCol').children().children('.mitarbeiterStunden');
        baustelle = baustelle + '{"id":"' + sel.children("option:selected").val() +'","stunden":' + sel.parent().parent().parent().children('.stundenCol').children('.stundenM').val() + '},'; 
        $(this).remove();
    });
    if(baustelle.substring(baustelle.length-1,baustelle.length) == ','){
        baustelle = baustelle.substring(0,baustelle.length-1);   
    }
    baustelle = baustelle + ']}';
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
             ', "mitarbeiter":['; + $('#mitarbeiter_' + ($(this).attr('id')).split('_')[1]).val() + '"}';
    
        $('#mitarbeiter_' + ($(this).attr('id')).split('_')[1]).children(".mitarbeiterStundenRow").each(function(){
        sel = $(this).children('.mitarbeiterStundenCol').children().children('.mitarbeiterStunden');
        baustelle = baustelle + '{"id":"' + sel.children("option:selected").val() +'","stunden":' + sel.parent().parent().parent().children('.stundenCol').children('.stundenM').val() + '},'; 
        $(this).remove();
    });
    if(baustelle.substring(baustelle.length-1,baustelle.length) == ','){
        baustelle = baustelle.substring(0,baustelle.length-1);   
    }
    baustelle = baustelle + ']}';
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
            renderer = renderer + '<div class="row"><div class="col-md-auto"><h1>' + baustelle['name'] + '</h1></div><div class="col"></div></div>';
            renderer = renderer + '<div class="row"><div class="col-2 myColLabelFront"><label class="formlabel">Ort:</label></div><div class="col myColLabelBack"><label class="formlabel">' + baustelle['ort'] + '</label></div><div class="col"></div></div>';
            renderer = renderer + '<div class="row"><div class="col-2 myColLabelFront"><label class="formlabel">PLZ:</label></div><div class="col myColLabelBack"><label class="formlabel">' + baustelle['plz'] + '</label></div><div class="col"></div></div>';
            renderer = renderer + '<div class="row"><div class="col-2 myColLabelFront"><label class="formlabel">Strasse:</label></div><div class="col-md-auto"><label class="formlabel">' + baustelle['strasse'] + '</label></div><div class="col"></div></div>';
            taetigkeitenArray = baustelle['taetigkeiten'];
            sortResults(taetigkeitenArray, 'datum', true);
            if(taetigkeitenArray.length > 1){
                renderer = renderer + '<div class="row"><div class="col"><h2>Tätigkeiten</h2></div><div class="col"></div></div>';
            } else {
                renderer = renderer + '<div class="row"><div class="col"><h2>Tätigkeit</h2></div><div class="col"></div></div>';    
            }
            renderer = renderer + '<div class="row"></div>';
            for (tat in taetigkeitenArray){
                taetigkeit = baustelle['taetigkeiten'][tat];
                renderer = renderer + '<div class="row"><div class="col-3"><label class="formlabel">' + taetigkeit['datum'] + '</label></div><div class="col-9"><div class="row"><label class="formlabel">' + taetigkeit['taetigkeit'].replace(/\n/g, "<br />") + '</label></div>';
                for(mitarbeiterN in taetigkeit['mitarbeiter']){
                    mitarbeiter = taetigkeit['mitarbeiter'][mitarbeiterN];
                    renderer = renderer + '<div class="row"><div class="col-6"><label class="formlabel">' + mitarbeiter['name'] + '</label></div><div class="col-6"><label class="formlabel">' + mitarbeiter['stunden'].toFixed(1) + ' Stunden</label></div></div>';
                }
                
                renderer = renderer + '<div class="row"><div class="col-6"><label class="formlabel">Schäfer</label></div><div class="col-6"><label class="formlabel">' + taetigkeit['stunden'].toFixed(1) + ' Stunden</label></div></div></div></div>';  
            }   
            renderer = renderer + '</div>'; 
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
    returnString = '<tr class="baustellentaetigkeitsklasse">' +
            '<td><input onKeyUp="checkSaveDiasableFunction($(this));" type="text" class="datepicker" style="display:none"><div id="datum_' + data['id'] + '" contentEditable="true" class="date">' + data['datum'] + '</div></td>' +
            '<td><textarea class="max requiredFieldForTeaetigkeit" spellcheck="true" onMouseUp="checkSaveDiasableFunction($(this));" onKeyUp="checkSaveDiasableFunction($(this));" id="taetigkeit_' + data['id'] + '" type="text">' + data['taetigkeit'] + '</textarea></td>' +
                '<td id="mitarbeiter_' + data['id'] + '"><div class="row">' +
                    '<div class="schaefer">' +
                        'Schäfer' +
                    '</div>' +
                     '<div class="stundenCol">' +
                        '<input id="stunden_' + data['id'] + '" class="stundenS requiredFieldForTeaetigkeit" type="number" pattern="([0-9]{2,3}).([0-9]{0,2})" step="0.5" value="' + data['stunden'] + '">' + 
                    '</div>' +
                '</div>';
    for(mitarbeiterN in data['mitarbeiter']){
        mitarbeiter = data['mitarbeiter'][mitarbeiterN];
        returnString = returnString + getNewMitarbeiterStunden(mitarbeiter['id'],mitarbeiter['stunden']);
    }
    returnString = returnString + '<div class="row emptyMitarbeiterAuswahl">'+
/*                    '<div>'+
                        '<select id="neueMitarbeiterStunden" class="selectpicker mitarbeiterselection" data-style="btn-primary" data-live-search="true" onchange="mitarbeiterauswahlF($(this));">'+
                            '<option class="disabledMitarbeiterauswahlClass" disabled selected="true">-- auswaehlen --</option>'+
                        '</select>' +                                   
                    '</div>'+*/
                    '<div>'+
                    '</div>' +
                '</div>';
    returnString = returnString + '</td>' +
            '<td class="actions">' +
                '<button id="baustellentatigkeitspeichern_' + data['id'] + '" type="button" class="btn btn-primary baustellentatigkeitspeichern requiredCheck">speichern</button>' +
                '<button id="baustellentatigkeitloeschen_' + data['id'] + '" type="button" class="btn btn-danger baustellentatigkeitloeschen">löschen</button>' +
            '</td>' +
        '</tr>';
    $('#empty').before(returnString);
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
            getStunden();
        });  
};

baustellenauswahlF = function(){
    id = $('#baustellenauswahl').children("option:selected").attr('id');
    if(id=="neueBaustelle"){
        $('#baustelleAnlegenModal').modal('toggle');
        $('#baustelleineinsaetzeTabelle').hide();
        $('#aktuelleBaustelleForm').hide();
        $('#baustellenButtons').hide();
		$('#neuerBaustellenName').focus();
    } else if(id=='disabledBaustellenauswahl'){
        $('#baustelleineinsaetzeTabelle').hide();
        $('#aktuelleBaustelleForm').hide();
        $('#baustellenButtons').hide();
    } else {
        $('#baustelleineinsaetzeTabelle').show();
        ladeBaustelleinsaezteFuerId(id);
        aktuelleBaustellenID = id; 
        $('#aktuelleBaustelleForm').show();
        renderAktuelleBaustelle();
        $('#baustellenButtons').show();
		$('#taetigkeit_empty').focus();
    }
};

mitarbeiterauswahlF = function(thiselement){
    value = thiselement.children("option:selected").attr('value');
    if(thiselement.attr('id') == 'neueMitarbeiterStunden'){
       thiselement.parent().parent().parent().before(getNewMitarbeiterStunden(value));
        $('.mitarbeiterStunden').selectpicker('refresh');
       thiselement.children('.disabledMitarbeiterauswahlClass').prop('selected', true);
        thiselement.selectpicker('refresh');
    } else if(value=='removeMitarbeiter'){
        /*todo remove the element from the list the whole div row*/
        thiselement.parent().parent().parent().remove();
    } else {
        /*todo nothing i think*/
    }
};


getNewMitarbeiterStunden = function(val, stunden){
    htmlValue = '<div class="row mitarbeiterStundenRow">' +
                    '<div class="mitarbeiterStundenCol">' +
                        '<select class="selectpicker mitarbeiterStunden" data-style="btn-primary" data-live-search="true" onchange="mitarbeiterauswahlF($(this));">'+
                                '<option value="removeMitarbeiter">-- entfernen --</option>';
    sortResults(mitarbeiterDaten,'name',true);
    for(mitarbeiter in mitarbeiterDaten){
        selectedString = '';
        if( val == mitarbeiterDaten[mitarbeiter]['id']){
            selectedString = 'selected="selected"';
        }
        htmlValue = htmlValue + '<option value="' + mitarbeiterDaten[mitarbeiter]['id'] + '" ' + selectedString + '>' + mitarbeiterDaten[mitarbeiter]['name'] + '</option>';
    }
    thisStunden = "0";
    if(stunden != null){
        thisStunden = stunden;
    }
    
    htmlValue = htmlValue + '</select>' +
                '</div>' +
                    '<div class="stundenCol">' +
                        '<input class="requiredFieldForTeaetigkei stundenM" type="number" pattern="([0-9]{2,3}).([0-9]{0,2})" step="0.5" value="' + thisStunden + '">' +
                    '</div>' + 
                '</div>';
    return htmlValue;
};

renderOptionForBaustelle = function(data){
    $('.baustellenAuswahl').remove();
    sortResults(baustellenDaten, 'name',false);
    selectedString = '';
    for (number in baustellenDaten){
        baustelle = baustellenDaten[number]
        if(baustelle == data){
            selectedString = 'selected="selected"';
        } else {
            selectedString = '';
        }
        $('#neueBaustelle').after('<option class="baustellenAuswahl" id="' + baustelle['id'] + '" value="' + baustelle['name'] + '" ' + selectedString + '>' + baustelle['name'] + '</option>');
    }
    if(data == null){
        $('#disabledBaustellenauswahl').prop('selected', true);
    }
    $('#baustellenauswahl').selectpicker('refresh');
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
    $.post("getAlleMitarbeiter",
        '{}',
    function (data, status) {
        mitarbeiterDaten = data;
        renderOptionForMitarbeiter();
    });
    getStunden();
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
cleanNeuenMitarbeiter = function(){
    $('#neuerMitarbeiterName').val('');
    $('#disabledMitarbeiterauswahl').prop('selected', true);
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
neuenMitarbeiterSpeichernF = function() {
            mitarbeiter = '{"name":"' + $('#neuerMitarbeiterName').val() + '"}';
            $.post("neuerMitarbeiter",
            mitarbeiter,
            function (data, status) {
                cleanNeuenMitarbeiter();
                mitarbeiterDaten.push(data[0]);
                renderOptionForMitarbeiter();
                rerenderTaetigkeiten();
            });
};

renderOptionForMitarbeiter = function(){
        $('.emptyMitarbeiterSelectionOption').remove();
        sortResults(mitarbeiterDaten, 'name',true);
        for(mitarbeiterN in mitarbeiterDaten){
            mitarbeiter = mitarbeiterDaten[mitarbeiterN];
            $( '#disabledMitarbeiterauswahl' ).after('<option class="emptyMitarbeiterSelectionOption" value="' + mitarbeiter['id'] + '">' + mitarbeiter['name'] + '</option>');
        }

    $( '#neueMitarbeiterStunden' ).selectpicker('refresh');
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

baustellenUpdateF = function() {
             baustelle = '{"id":"' + aktuelleBaustellenID + '", "name":"' + $('#aktuelleBaustellenName').val() +
                 '", "plz":"' + $('#aktuelleBaustellenPlz').val() +
                 '", "ort":"' + $('#aktuelleBaustellenOrt').val() + 
                 '", "strasse":"' + $('#aktuelleBaustellenStrasse').val() + 
                 '", "bemerkungen":"' + $('#aktuelleBaustellenBemerkungen').val() + '"}';
            $.post("baustellenupdate",
            baustelle,
            function (data, status) {
                removeBaustelleFromList();
                baustellenDaten.push(data[0]);
                renderOptionForBaustelle(data[0]);
            });
};

rerenderTaetigkeiten = function(highlightedId){
    sortResults(aktuelleTaetigkeiten, 'datum', true);
    $('.baustellentaetigkeitsklasse').remove();
    for (number in aktuelleTaetigkeiten){
        baustelle = aktuelleTaetigkeiten[number]
        insertRow(baustelle);
    }
    $('.mitarbeiterStunden').selectpicker('refresh');
    loaddatepicker();
    //geht so noch ned
    if(highlightedId !== null){
        $('#datum_' + highlightedId + '').parent().parent().effect("highlight", {color: 'green'}, 4000);   
    }
    baustelleMitTaetigkeiten = [aktuelleBaustelleDaten];
    baustelleMitTaetigkeiten[0]['taetigkeiten'] = aktuelleTaetigkeiten;
    renderBaustelleFormular(baustelleMitTaetigkeiten);
    getStunden();
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
    printJS({ printable: 'forularmodalBoddy', type: 'html', documentTitle: '', css: ['bootstrap-4.4.1-dist/css/bootstrap.css', 'bootstrap-4.4.1-dist/css/bootstrap-grid.css', 'stundenerfassung.css'] })
}

/*to disable buttons while something is not filled*/
$('#neuerBaustellenName').bind('keyup', function() {
    if($('#neuerBaustellenName').val() != ''){
      $('#neueBaustelleSpeichern').removeAttr('disabled');  
    } else {
        $('#neueBaustelleSpeichern').attr('disabled','true');
    }
});

$('#neuerMitarbeiterName').bind('keyup', function() {
    if($('#neuerMitarbeiterName').val() != ''){
      $('#neuenMitarbeiterSpeichern').removeAttr('disabled');  
    } else {
        $('#neuenMitarbeiterSpeichern').attr('disabled','true');
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
      if($('#aktuelleBaustellenName').val() != ''){
        $('#aktuelleBaustelleUpdaten').removeAttr('disabled');  
    } else {
        $('#aktuelleBaustelleUpdaten').attr('disabled','true');
    }  
}

getStunden = function(){
    letzterMonat = mm-1;
    if(letzterMonat != 0){
        $.post("getStundenMonat",
            '{"monat":' +  letzterMonat + '}',
            function (data, status) {
                if(data['stunden'] != 0){
                    $('#letzterMonatStunden').text(data['stunden']);
                    $('.letzterMonatStunden').show();                    
                } else {
                    $('.letzterMonatStunden').hide();    
                }
        });    
    } else{
        $('.letzterMonatStunden').hide();
    }
    $.post("getStundenMonat",
    '{"monat":' +  parseInt(mm) + '}',
    function (data, status) {
        $('#aktuellerMonatStunden').text(data['stunden']);
        $('.aktuellerMonat').show();                    
    });
}
waehleJahr(yyyy);