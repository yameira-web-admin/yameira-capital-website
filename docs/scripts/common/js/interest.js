let rates = {};
const int_paid_llc = {};

function fetchLatestRates(entity = 'llc')
{
    let url = '/webrest/interests/benchmarks/' + entity;
    let rateReq = $.ajax({
      method: 'GET',
      url: url
    });
    rateReq.done(function(d) {
      rates = d;
      showRates();
      populateInterestPaid();
      showInterestPaid();
    });
    rateReq.fail(function(xhr, ts, err) {
      $('table#bm-table').hide();
      $('div#bm-err').show();
      console.log('Error status: ' + xhr.status);
    });
}
function populateInterestPaid(entity = 'llc')
{
  int_paid_llc.usdtier1pro = setRateValue('USD', -.5);
  int_paid_llc.usdtier1lite = setRateValue('USD', -1.5)
}
function showInterestPaid(entity = 'llc')
{
  let spans = document.querySelectorAll('tbody#'+entity+'-int-paid td span');
  for(span=0;span<spans.length;++span)
  {
    let sid = spans[span]['id'] || '';
    if(sid != '' && int_paid_llc[sid])
    {
      $('span#'+sid).text(int_paid_llc[sid]);
    }
  }
}
function showRates()
{
  let html = '';
  let eff_date = '';
  let ignore = ['USDLibor','BGN'];
  let domain = window.location.hostname;
  if(domain == "interactivebrokers.com" || domain == "www.interactivebrokers.hk"){
    ignore.push('HKD');
  } else {
    ignore.push('HKD_IBHK');
  }
  for (i=0; i < rates.length; i++)
  {
    if(!ignore.includes(rates[i]['id']) )
    {
      if(rates[i]['id'] == "HKD_IBHK"){
        rates[i]['id'] = "HKD";
      }
      let rate = rates[i]['value'] || '';
      rate = (Math.sign(rate) === -1) ? '(' + Math.abs(rates[i]['value']) + ')%' : rates[i]['value'] + "%";
      html += "<tr>\n";
      html += "<td>" + rates[i]['id'] + "</td>\n";
      html += "<td><div align='left'>Reference Benchmark " + rates[i]['id'] + "</div></td>\n";
      html += "<td><div align='center'><span class='text-price'>" + rate + "</span></div></td>\n";
      html += "<td><div align='center'>" + rates[i]['updated'] + "</div></td>\n";
      html += "</tr>\n";
      eff_date = (eff_date == '') ? rates[i]['updated'] : eff_date;
      eff_date = (eff_date < rates[i]['updated']) ? rates[i]['updated'] : eff_date;
    }
  }
  $('span#bm-eff-date').text(eff_date);
  $('tbody#bm-data').html(html);
}
function getRateForCurr(curr)
{
  rate = null;
  for (i=0; i < rates.length; i++)
  {
    if(rates[i]['id'] == curr)
    {
      rate = rates[i]['value'];
    }
  }
  return rate;
}
function setRateValue(currency, offset, floor = null, max = null)
{
  let sign = offset < 0 ? '-' : '+';
  let rateValue = getRateForCurr(currency) + offset;
  if(floor != null && rateValue < floor)
  {
    rateValue = floor;
  }
  if(max != null && rateValue > max)
  {
    rateValue = max;
  }
  return rateValue + "% (BM " + sign + ' ' + Math.abs(offset) + "%)";
}