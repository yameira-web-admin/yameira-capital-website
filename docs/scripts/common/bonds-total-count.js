$(document).ready(function () {
var b_data = { list : [
{instrument:"BOND", locations:"BOND.WW", scanCode:"FAR_MATURITY_DATE", secType:"BOND", maxItems:"1", type:"GlobalCorporateBonds" },
{instrument:"BOND.GOVT.NON-US", locations:"BOND.GOVT.NON-US", scanCode:"FAR_MATURITY_DATE", secType:"BOND", maxItems:"1", type:"NonUSSvrgnBonds"},
{instrument:"BOND.CD", locations:"BOND.CD.US", scanCode:"FAR_MATURITY_DATE", secType:"BOND", maxItems:"1", type:"USCDs"},
{instrument:"BOND.MUNI", locations:"BOND.MUNI.US", scanCode:"FAR_MATURITY_DATE", secType:"BOND", maxItems:"1", type:"USMuniBonds"},
{instrument:"BOND.GOVT", locations:"BOND.GOVT.US", scanCode:"FAR_MATURITY_DATE", secType:"BOND", maxItems:"1", type:"USTreasuries"}
] };
$(document).ready(function () {
function formatNumber(num) {
	return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
console.log(b_data);
  $.ajax({
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
    url: "/portal.proxy/v1/mkt/hmds/scanner/totals",
    accept: 'application/json',
    type: 'POST',
    data: JSON.stringify(b_data)
  })
  .done(function( data ) {
    $('#corporate_bond_count').text( formatNumber( data['GlobalCorporateBonds'] ) );
    $('#muni_bond_count').text( formatNumber( data['USMuniBonds'] )  );
    $('#cd_count').text( formatNumber( data['USCDs'] ) );
    $('#nonus_svrgn_count').text(formatNumber(data['NonUSSvrgnBonds']));
  });
});
});