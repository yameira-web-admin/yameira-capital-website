$(document).ready(function () {
    $.ajax({
	url: "/response_handlers/mf/getTotals.php",
	beforeSend: function( xhr )
	{ xhr.overrideMimeType( "text/plain; charset=x-user-defined" ); }

	})
	.done(function( data ) {
	if ( console && console.log )
	{ 
		// console.log( "Sample of data:", data.slice( 0, 100 ) );
		var results = $.parseJSON(data);
		// console.log( "Sample of results:", results['total'] );
        var rTotal = (results['total']);
        // console.log('rTotal = ' + rTotal );
        var s = rTotal;
        s = s.split(',').join('');
        // 36,000+ funds in total
        // 33,000+ no-load funds (92% of total)
        // var roundedTotal = Math.floor( parseInt( s ) / 1000) * 1000;
        var rTotalNum = Math.floor( parseInt( s ) / 1000);
        var rNoLoadNum = Math.floor( parseInt( s * .92 ) / 1000);
        var roundedTotal = rTotalNum.toString()+',000+';
        var roundedNoLoad = rNoLoadNum.toString()+',000+';
        // console.log('roundedTotal = ' + roundedTotal +', s = '+ s );
		$("#funds_count_adv").text( roundedTotal );
		$("#funds_count").text( roundedNoLoad );
	}
    });
});