$(document).ready( function() { 
	
	/* TIME FUNCTIONALITY BEGIN  --------------------------------------------------------------  */
	var d = new Date();
	var pinID = -1;
	// TimeZoneID from Oracle: https://docs.oracle.com/middleware/12212/wcs/tag-ref/MISC/TimeZones.html
        /* ---------------------------------------
        [0]Exchange full name, 
        [1]oepn time, 
        [2]closed time, 
        [3]weekdays oepn, 
        [4]open status T/F, 
        [5]Open/Closed label, 
        [6]distance time to closing, 
        [7]time zone toLocalString code 
        [8]toLocalTime
        [9]class name for map marker
        --------------------------------------- */
	var openCloseStats= [
		['New York Stock Exchange','9:30:00','16:00:00',[1,2,3,4,5],false,'Closed','0:00:00','America/New_York',d,'marker-nyse'],
		['London Stock Exchange','8:00:00','16:50:00',[1,2,3,4,5],false,'Closed','0:00:00','Europe/London',d,'marker-lse'],
		['Hong Kong Stock Exchange','9:30:00','16:00:00',[1,2,3,4,5],false,'Closed','0:00:00','Asia/Hong_Kong',d,'marker-hkse'],
		['Chicago Board Options Exchange','8:30:00','15:15:00',[1,2,3,4,5],false,'Closed','0:00:00','America/Chicago',d,'marker-cboe'],
		['Toronto Stock Exchange','9:30:00','16:00:00',[1,2,3,4,5],false,'Closed','0:00:00','America/New_York',d,'marker-tsx'],
		['Bolsa Mexicana de Valores','8:30:00','15:00:00',[1,2,3,4,5],false,'Closed','0:00:00','America/Mexico_City',d,'marker-bmv'],
		['Bolsa de Madrid','9:00:00','17:35:00',[1,2,3,4,5],false,'Closed','0:00:00','Europe/Madrid',d,'marker-xmad'],
		['Frankfurt Stock Exchange','8:00:00','20:00:00',[1,2,3,4,5],false,'Closed','0:00:00','Europe/Berlin',d,'marker-fra'],
		['Swiss Exchange','9:00:00','17:32:00',[1,2,3,4,5],false,'Closed','0:00:00','Europe/Zurich',d,'marker-six'],
		['Budapest Stock Exchange','9:00:00','17:20:00',[1,2,3,4,5],false,'Closed','0:00:00','Europe/Budapest',d,'marker-bse'],
		['Moscow Stock Exchange','9:30:00','19:00:00',[1,2,3,4,5],false,'Closed','0:00:00','Europe/Moscow',d,'marker-moex'],
		['Brazil Stock Exchange','10:00:00','16:55:00',[1,2,3,4,5],false,'Closed','0:00:00','America/Sao_Paulo',d,'marker-b3'],
		['Saudi Exchange','10:00:00','15:20:00',[0,1,2,3,4],false,'Closed','0:00:00','Asia/Riyadh',d,'marker-tadawul'],
		['Abu Dhabi Securities Exchange','10:00:00','14:45:00',[1,2,3,4,5],false,'Closed','0:00:00','Asia/Dubai',d,'marker-adx'],
		['Tel Aviv Stock Exchange','9:30:00','16:25:00',[0],false,'Closed','0:00:00','Asia/Jerusalem',d,'marker-tase'],
		['Tel Aviv Stock Exchange','9:30:00','17:15:00',[1,2,3,4],false,'Closed','0:00:00','Asia/Jerusalem',d,'marker-tase'],
		['National Stock Exchange of India','9:15:00','15:30:00',[1,2,3,4,5],false,'Closed','0:00:00','Asia/Calcutta',d,'marker-nse'],
		['Singapore Stock Exchange','9:00:00','17:00:00',[1,2,3,4,5],false,'Closed','0:00:00','Asia/Singapore',d,'marker-sgx'],
		['Korea Stock Exchange','9:00:00','15:45:00',[1,2,3,4,5],false,'Closed','0:00:00','Asia/Seoul',d,'marker-ksc'],
		['Australia Stock Exchange','10:00:00','16:00:00',[1,2,3,4,5],false,'Closed','0:00:00','Australia/Sydney',d,'marker-asx'],
		['Tokyo Stock Exchange','9:00:00','15:00:00',[1,2,3,4,5],false,'Closed','0:00:00','Asia/Tokyo',d,'marker-tse']  
	];
	/*function timeOpen(od, ot){
		var odSetOpen = new Date(od);
		var tSplit = ot.split(':');
		// console.log('open time string: ' + ot + ' vs ' + tSplit.toString() +' array length ' + tSplit.length );
		odSetOpen.setHours((tSplit[0]));
		odSetOpen.setMinutes((tSplit[1]));
		odSetOpen.setSeconds((tSplit[2]));
		// console.log('open time: ' + odSetOpen.getTime());
		// console.log('curr time: ' + od.getTime() );
		return odSetOpen
	}*/
    function updateMapZoneTime(dSet){
        for (var i=0; i<dSet.length; i++){
            var myLocal = new Date().toLocaleString("en-US", {timeZone: dSet[i][7] });
          dSet[i][8]  = new Date(myLocal);
        }
        return dSet; 
    }
	function testOpenCloseTime(testCurrT, testOpenT, testCloseT, daysOpenArr ){
		/*var weekday = new Array(7);
		weekday[0] = "Sunday";
		weekday[1] = "Monday";
		weekday[2] = "Tuesday";
		weekday[3] = "Wednesday";
		weekday[4] = "Thursday";
		weekday[5] = "Friday";
		weekday[6] = "Saturday";*/
		// var n = weekday[d.getDay()];
        // console.log('current day of week is: ' + weekday[testCurrT.getDay()]  +' for date: '+ testCurrT.getDay() );
		var openStatus = false;
		var distance = 0;
		var distanceDisp = "";
		// targetOpenTime and targetCloseTime will be modified versions of the current time 
		var targetOpenTime = new Date(testCurrT);
		var targetCloseTime = new Date(testCurrT);
		var openTimeSplit = testOpenT.split(':');
		var closeTimeSplit = testCloseT.split(':');
		// ONLY TEST OPEN AND CLOSED TIMES IF DAY IS OPEN FOR TRADING
		var currentDay = testCurrT.getDay();
		if ( daysOpenArr.indexOf(currentDay) != -1 ){
			// console.log('indexOf(currentDay) is: ' + daysOpenArr.indexOf(currentDay) );
			// console.log('Open for trading today: ' + currentDay +' in '+ daysOpenArr.toString() );
			// Modify the new targetOpenTime date with the scheduled open time values from 'testOpenT'
			targetOpenTime.setHours((openTimeSplit[0]));
			targetOpenTime.setMinutes((openTimeSplit[1]));
			targetOpenTime.setSeconds((openTimeSplit[2]));
			// Modify the new targetCloseTime date with the scheduled close time values from 'testCloseT'
			targetCloseTime.setHours((closeTimeSplit[0]));
			targetCloseTime.setMinutes((closeTimeSplit[1]));
			targetCloseTime.setSeconds((closeTimeSplit[2]));
			distance = targetOpenTime.getTime() - testCurrT.getTime();
			var countdownHours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			var countdownMinutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
			var countdownSeconds = Math.floor((distance % (1000 * 60)) / 1000);
			distanceDisp  = countdownHours +":"+ countdownMinutes  +":"+ countdownSeconds;
			// console.log( ' opening soon: ' + countdownHours +":"+ countdownMinutes  +":"+ countdownSeconds );
			// Test if day of week is not a closed day (typically Sat & Sun, ids:7,0)
			// closing time. Return TRUE if current time is greater than openning time and less than closing time [OPENED]
			// [STILL CLOSED ]
			openStatus = ( testCurrT.getTime() > targetOpenTime.getTime() && testCurrT.getTime() < targetCloseTime.getTime() );
		}else{
			// closed for business today so openStatus remains false
			// console.log('indexOf(currentDay) is: ' + daysOpenArr.indexOf(currentDay) );
			// console.log('NOT TRADING TODAY!');
		}
		return [openStatus, distanceDisp];
	}
	function msgLoop() {
		// var localTime = new Date();
		var showMsg = ''; // 'Local time: '+localTime.toLocaleString();
        var dataSet = updateMapZoneTime(openCloseStats);
        var taseTest = false;
		var taseID = -1;
		var closeLabel = $('#closed-label').text();
		var openLabel = $('#open-label').text();
		// for (var i=0; i<openCloseStats.length; i++){
		for (var i=0; i<dataSet.length; i++){
			// var values = testOpenCloseTime(zoneTimes[i], openCloseStats[i][1], openCloseStats[i][2]);
			var values = testOpenCloseTime(dataSet[i][8], dataSet[i][1], dataSet[i][2], dataSet[i][3]);
			dataSet[i][4] = values[0];
			dataSet[i][6] = values[1];
			if (dataSet[i][4]){
				dataSet[i][5] = openLabel;   // 'Open';
                $( "."+dataSet[i][9] ).removeClass('map-location-marker-closed');
                $( "."+dataSet[i][9] ).addClass('map-location-marker');
			}else{
				dataSet[i][5] = closeLabel;  // 'Closed';
                $( "."+dataSet[i][9] ).removeClass('map-location-marker');
                $( "."+dataSet[i][9] ).addClass('map-location-marker-closed');
			}
			// TASE has 2 differnt operating time sets. If either is "True" set to map marker to blue/open
			if ( (dataSet[i][9] == "marker-tase") && (dataSet[i][4]==true) ) {
				taseTest = true;
				taseID = i;
			}
		}
		// If TASE test is true, set tase marker to blue/open
		if (taseTest){
			$( "."+dataSet[taseID][9] ).removeClass('map-location-marker-closed');
			$( "."+dataSet[taseID][9] ).addClass('map-location-marker');
		}
		var nyseMsg = '';
		var lseMsg = '';
		var hkseMsg = '';
			if (dataSet[0][5].toLowerCase() == closeLabel.toLowerCase() ){
				nyseMsg = 'NYSE : <span class="closed-color">' + dataSet[0][5] + '</span>    |    ';
			}else{
				nyseMsg = 'NYSE : <span class="open-color">' + dataSet[0][5] + '</span>    |    ';
			}
			if (dataSet[1][5].toLowerCase() == closeLabel.toLowerCase() ){
				lseMsg = 'LSE : <span class="closed-color">' + dataSet[1][5] + '</span>    |    ';
			}else{
				lseMsg = 'LSE : <span class="open-color">' + dataSet[1][5] + '</span>    |    ';
			}
			if (dataSet[2][5].toLowerCase() == closeLabel.toLowerCase() ){
				hkseMsg = 'HKSE : <span class="closed-color">' + dataSet[2][5] + '</span> ';
			}else{
				hkseMsg = 'HKSE : <span class="open-color">' + dataSet[2][5] + '</span> ';
			}
		showMsg = nyseMsg + lseMsg + hkseMsg;
			/*'NYSE : ' + dataSet[0][5] + '    |    ' +
			'LSE : ' + dataSet[1][5] + '    |    ' + 
			'HKSE : ' + dataSet[2][5] ;
        */
		$(".openCloseMessage").html( showMsg );
        // console.log( 'showMsg = ' + showMsg );
	}
	/*var updateMapPins = setInterval(function(){ 
		// test for approaching open/close market times every minute
		// test open closed exchanges
		msgLoop();
	}, 10000);*/
	msgLoop();
	/* TIME FUNCTIONALITY END  --------------------------------------------------------------  */
/*	$('.map-location-marker').addClass('animated aniInDown');
	$('.map-location-marker-closed').addClass('animated aniInDown');*/
	/*console.log('loading...');*/
	function mapInfoInit() {
		$('.map-location-marker')
			.click(function(e){
				e.preventDefault();
				$('#map-info, #overlay').remove();
				buildmapInfo(
					$(this).data('mapLink'),
					$(this).data('mapTitle'),
					$(this).data('mapSubtitle'),
					$(this).data('mapHours'),
					$(this).data('mapHours2'),
					$(this).data('mapImage'),
					$(this).data('jobListings'),
					$(this).css('top'),
					$(this).css('left')
				);
			});
		$('.map-location-marker-closed')
			.click(function(e){
				e.preventDefault();
				$('#map-info, #overlay').remove();
				buildmapInfo(
					$(this).data('mapLink'),
					$(this).data('mapTitle'),
					$(this).data('mapSubtitle'),
					$(this).data('mapHours'),
					$(this).data('mapHours2'),
					$(this).data('mapImage'),
					$(this).data('jobListings'),
					$(this).css('top'),
					$(this).css('left')
				);
			});
	}
	mapInfoInit();
	function showLocalTime(){
		if (pinID != -1){
			var myLocal = new Date().toLocaleString("en-US", {timeZone: openCloseStats[pinID][7] });
			openCloseStats[pinID][8]  = new Date(myLocal);
			/*$('.locTime').html( openCloseStats[pinID][8].toString() );*/
			/*$('.locTime').html( openCloseStats[pinID][8].toLocaleTimeString() );*/
			$('.locTime').html( openCloseStats[pinID][8].toLocaleTimeString('it-IT') );
		}else{
			// $('.locTime').html( '' );
		}
		// console.log('showLocalTime...');
	}
	function updateShowClock(tf){
		if (tf){
			var localTimeLoop = setInterval(function(){ 
				showLocalTime();
			}, 1000);
		}else{
			pinID = -1;
			clearInterval(localTimeLoop);
			// console.log('clearInterval done...');
		}
	}
	function buildmapInfo ( location, title, subtitle, hours, hours2, src, link, pintop, pinleft )
	{
		var localTimeLabel = $('#local-time').text();
		// get map pin id
		pinID = -1;
		for (var i=0; i<openCloseStats.length; i++){
			// console.log('marker-title is: ' + ("marker-" + title).toLowerCase()  );
			if ( ("marker-" + title).toLowerCase() == openCloseStats[i][9]) {
				pinID = i;
				updateShowClock(true);
			}
		}
		if (hours2 != ""){
		$('<div id="map-info">')
			/*.addClass(location)*/
			.addClass(title)
			.fadeIn('slow')
			.appendTo('#places-map .exch-map')
			.html(
				'<h3>' + title + '</h3>' +
				'<h5>' + subtitle + '</h5>' +
				'<p>' + hours + '</p>' +
				'<p>' + hours2 + '</p>' +
				'<p>' + localTimeLabel + ' <span class="locTime">00:00:00</span></p>' +
				'<span class="close-btn"></span>'
			)
			.css({'top' : ( parseInt(pintop) + 13) , 'left' : ( parseInt(pinleft) - 22 - (parseInt(location)) )} );
			// console.log('clicked pintop value: ' + pintop +' and pinleft value: ' + pinleft +' vs '+ ( parseInt(pinleft) - 22 ) );*/
		}else{
		$('<div id="map-info">')
			.addClass(title)
			.fadeIn('slow')
			.appendTo('#places-map .exch-map')
			.html(
				'<h3>' + title + '</h3>' +
				'<h5>' + subtitle + '</h5>' +
				'<p>' + hours + '</p>' +
				'<p>' + localTimeLabel + ' <span class="locTime">00:00:00</span></p>' +
				'<span class="close-btn"></span>'
			)
			.css({'top' : ( parseInt(pintop) + 13) , 'left' : ( parseInt(pinleft) - 22 - (parseInt(location)) )} );
		}
		// Close map info if click anywhere outside of it
		var mapInfo = $('#map-info');
			$(document).mouseup(function(e) {
				if ( !mapInfo.is(e.target) && mapInfo.has(e.target).length === 0)
				{
					mapInfo
					.fadeOut('slow', function(){
						$(this).remove();
                    });
					updateShowClock(false);
				}
            });
        $('#map-info .close-btn').click(function() {
				$('#map-info').fadeOut('slow', function(){
						$(this).remove();
						updateShowClock(false);
                });
			});
	}
});