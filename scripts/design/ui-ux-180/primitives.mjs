export const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const paths = {
 home:'M3 10 12 3l9 7v10H3z M9 20v-7h6v7', wallet:'M3 6h17v14H3z M3 6V4h14 M15 12h6v4h-6z',
 bank:'M3 8 12 3l9 5 M4 9h16 M5 11v7m5-7v7m4-7v7m5-7v7M3 21h18',stocks:'M4 19V5m0 14h17M7 14l4-4 4 2 6-7',
 community:'M3 5h18v12H9l-6 4z',quest:'M6 3h12v18l-6-4-6 4z M9 8h6m-6 4h4',
 shop:'M4 9h16l-1-5H5z M5 9v11h14V9 M9 20v-7h6v7',tools:'m15 4 5 5-10 10-6 1 1-6z M13 6l5 5',
 user:'M8 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0M4 21v-3a8 6 0 0 1 16 0v3',
 shield:'M12 3 3 7v6c0 4 9 9 9 9s9-5 9-9V7z M8 12l3 3 5-6', menu:'M4 6h16M4 12h16M4 18h16',
 search:'M10 3a7 7 0 1 0 0 14 7 7 0 1 0 0-14m5 12 6 6', arrow:'M4 12h16m-6-6 6 6-6 6',
 check:'m5 12 4 4L19 6',clock:'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18m0 4v5l4 2',
 plus:'M12 4v16M4 12h16',calendar:'M4 5h16v16H4zM8 3v5m8-5v5M4 10h16',
 mail:'M3 5h18v14H3z M3 6l9 7 9-7',star:'m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
 photo:'M3 4h18v16H3zM4 17l5-6 4 4 3-3 5 5M15 7h1',gear:'M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
 bell:'M6 9a6 6 0 0 1 12 0v7l3 2H3l3-2zM10 21h4',help:'M8 8a4 4 0 1 1 6 4l-2 2v2M12 19h.01',
 logout:'M10 3H4v18h6M9 12h12m-5-5 5 5-5 5',document:'M5 3h10l4 4v14H5zM14 3v5h5M8 12h8m-8 4h6',
};
export function icon(name='document',size=20) {return '<svg aria-hidden="true" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="'+(paths[name]||paths.document)+'"/></svg>';}
export function button(label,style='',extra=''){return '<button type="button" class="'+style+'" '+extra+'>'+esc(label)+'</button>';}
export function badge(text,tone=''){return '<span class="badge '+tone+'">'+esc(text)+'</span>';}
export function panel(title,body,extra='',link=''){return '<section class="panel '+extra+'"><div class="panel-head"><h2>'+esc(title)+'</h2>'+(link?'<a href="#preview-details">'+esc(link)+'</a>':'')+'</div>'+body+'</section>';}
export function hint(text){return '<div class="hint">'+icon('shield',17)+'<p>'+esc(text)+'</p></div>';}
export function summary(rows){return rows.map(([label,value])=>'<div class="summary-line"><span>'+esc(label)+'</span><strong class="num">'+esc(value)+'</strong></div>').join('');}
export function stats(labels=['Available balance','Saved for goals','Recent activity'],values=['128,450 WLD','64,000 WLD','12 movements']){
 return '<div class="stats">'+labels.map((label,i)=>'<div class="stat"><div class="stat-label">'+esc(label)+'</div><strong class="num">'+esc(values[i]||'Preview')+'</strong><small>'+['Design sample balance','For illustration only','Synthetic history'][i%3]+'</small></div>').join('')+'</div>';
}
export function toolbar(fields=[]){return '<div class="toolbar">'+fields.slice(0,3).map((field,i)=>i===0?'<input aria-label="'+esc(field)+'" placeholder="'+esc(field)+'…" autocomplete="off">':'<select aria-label="'+esc(field)+'"><option>'+esc(field)+'</option><option>All</option></select>').join('')+'</div>';}
export function tabs(values){return '<div class="tabs" role="tablist" aria-label="Preview sections">'+values.map((v,i)=>'<button type="button" role="tab" aria-selected="'+(i===0)+'" class="tab '+(i===0?'active':'')+'">'+esc(v)+'</button>').join('')+'</div>';}
export function form(fields,action='Review changes',options={}){return '<div class="form">'+fields.map((label,i)=>{
 const id='field-'+(options.prefix||'main')+'-'+i;const lower=label.toLowerCase();
 if(/consent|acknowledgement|acceptance/.test(lower)) return '<label class="checkbox" for="'+id+'"><input id="'+id+'" type="checkbox">I agree to '+esc(label.toLowerCase())+'</label>';
 if(label==='Photo'||label==='Club emblem'||label==='Profile image') return '<label class="field" for="'+id+'"><span>'+esc(label)+'</span><input id="'+id+'" name="'+id+'" type="file" accept="image/*"><small>PNG or JPEG. Add a descriptive alternative text.</small></label>';
 if(/description|biography|caption|evidence|reason/.test(lower)) return '<label class="field" for="'+id+'"><span>'+esc(label)+'</span><textarea id="'+id+'" name="'+id+'" rows="3" placeholder="'+esc(label)+'…" autocomplete="off"></textarea></label>';
 const select=/direction|side|type|method|policy|category|band|relationship|provider|channel|visibility|language|zone|condition|strategy|universe|benchmark|dependants/.test(lower);
 const type=lower.includes('password')?'password':lower.includes('email')?'email':lower.includes('date')?'date':'text';
 const value=!options.blank&&/amount|principal|price|salary|contribution|balance|assets|income|expenses/.test(lower)?'1,000':!options.blank&&/years/.test(lower)?'5':!options.blank&&/months/.test(lower)?'24':!options.blank&&/rate|return|yield/.test(lower)?'3.5':!options.blank&&/quantity|shares/.test(lower)?'10':'';
 return '<label class="field" for="'+id+'"><span>'+esc(label)+'</span>'+(select?'<select id="'+id+'" name="'+id+'"><option>Select '+esc(label.toLowerCase())+'</option><option>Design example</option></select>':'<input id="'+id+'" name="'+id+'" type="'+type+'" '+(type==='text'&&value?'inputmode="decimal"':'')+' value="'+value+'" placeholder="'+esc(label)+'…" autocomplete="'+(type==='password'?'new-password':type==='email'?'email':'off')+'">')+'</label>';
 }).join('')+'<div class="form-footer">'+button('Cancel','small')+button(action,'primary')+'</div></div>';}
const sampleNames = ['Design sample A','Design sample B','Design sample C','Design sample D'];
function cellValue(col,i,family) {
 const c=col.toLowerCase();
 if(/state|status|visibility|result/.test(c)) return badge(['Active','Review','Paused','Draft'][i%4],['good','warn','','violet'][i%4]);
 if(/price|amount|balance|principal|available|spent|requested|allocated|cost|revenue|value|total|returns|contribution|saved|goal/.test(c)) return '<span class="num">'+['12,800','4,250','7,500','980'][i%4]+' WLD</span>';
 if(/change|yield|rate|spread/.test(c)) return '<span class="num '+(i%2?'negative':'positive')+'">'+(i%2?'−0.8%':'+2.4%')+'</span>';
 if(/date|time|updated|seen|quoted|checked|published|joined|maturity/.test(c))return '<span class="num">24 Nov, 10:'+['30','15','05','00'][i%4]+'</span>';
 if(/stock|volume|quantity|occurrence|attempt|score|rank|unread|shares|submissions/.test(c))return '<span class="num">'+['80','24','12','6'][i%4]+'</span>';
 if(/symbol|pair|ticker/.test(c))return '<span class="cell-main">'+['DEMO A','DEMO B','DEMO C','DEMO D'][i%4]+'</span><span class="cell-sub">Illustrative instrument</span>';
 if(/product/.test(c))return '<span class="cell-main">'+['Workshop kit','Explorer badge','Club banner','Trail pass'][i%4]+'</span><span class="cell-sub">Design catalog item</span>';
 if(/member|player|author|actor|owner|assigned/.test(c))return '<span class="cell-main">Sample member '+(i+1)+'</span><span class="cell-sub">Synthetic profile</span>';
 if(/title|headline|article|discussion|content/.test(c))return '<span class="cell-main">'+['Getting started in Moneyverse','A community worth building','Your next small step','A guide to safer trading'][i%4]+'</span>';
 if(/sequence|reference|order|transaction|delivery|claim|issuance|report|application/.test(c))return '<span class="cell-main num">DEMO-'+String(i+1).padStart(4,'0')+'</span><span class="cell-sub">Design fixture reference</span>';
 if(/endpoint|url/.test(c))return '<span class="num">/example/preview/'+(i+1)+'</span>';
 if(/method/.test(c))return 'GET';
 if(/latency/.test(c))return '<span class="num">— ms</span>';
 if(/action/.test(c))return ['Update settings','Review request','Open record','Publish content'][i%4];
 return '<span class="cell-main">'+sampleNames[i%4]+'</span><span class="cell-sub">'+esc(family)+' preview</span>';
}
export function table(columns,family='records',count=4){return '<div class="table-wrap mobile-cards"><table><thead><tr>'+columns.map(c=>'<th scope="col">'+esc(c)+'</th>').join('')+'<th scope="col">Details</th></tr></thead><tbody>'+Array.from({length:count},(_,i)=>'<tr>'+columns.map(c=>'<td data-label="'+esc(c)+'"><div>'+cellValue(c,i,family)+'</div></td>').join('')+'<td data-label="Details">'+button('Open','small')+'</td></tr>').join('')+'</tbody></table></div><div class="table-foot"><span>'+count+' synthetic records</span><div class="row-actions">'+button('Previous','small')+button('Next','small')+'</div></div>';}
export function rows(items,kind='document'){return items.map((text,i)=>'<div class="list-row"><span class="row-icon">'+icon(kind)+'</span><div><h3>'+esc(text)+'</h3><p>'+['A clear next step, at your pace.','Review the details before continuing.','Keep your community activity in view.'][i%3]+'</p></div><span class="end">'+icon('arrow',16)+'</span></div>').join('');}
export function chart(candles=false){const w=640,h=250;let out='<svg role="img" aria-label="Illustrative '+(candles?'candlestick':'projection')+' chart, synthetic values" viewBox="0 0 '+w+' '+h+'">';
 for(let i=0;i<5;i++)out+='<path d="M8 '+(25+i*43)+'H600" stroke="#2d3753" stroke-width="1"/><text x="606" y="'+(29+i*43)+'" fill="#99a8c4" font-size="9">'+(140-i*10)+'</text>';
 if(candles){for(let i=0;i<27;i++){const x=15+i*21,y=135-Math.sin(i*.6)*22-i*1.6;const color=i%3?'#67d8b2':'#ff9aab';out+='<path d="M'+x+' '+(y-20)+'v50" stroke="'+color+'"/><rect x="'+(x-4)+'" y="'+y+'" width="8" height="'+(12+i%4*3)+'" fill="'+color+'"/><rect x="'+(x-4)+'" y="'+(216-i%5*4)+'" width="8" height="'+(12+i%5*4)+'" fill="'+color+'" opacity=".35"/>';}
 out+='<path d="M10 155 Q110 115 210 143 T410 115 T595 96" fill="none" stroke="#a98aff" stroke-width="2"/>';
 } else {out+='<path d="M10 193 C90 180 90 163 160 169 S270 138 320 122 S410 123 450 91 S540 75 590 40L590 210H10Z" fill="#a98aff" opacity=".08"/><path d="M10 193 C90 180 90 163 160 169 S270 138 320 122 S410 123 450 91 S540 75 590 40" fill="none" stroke="#b69aff" stroke-width="2.5"/><path d="M10 200 590 130" fill="none" stroke="#67d8b2" stroke-width="1.5" stroke-dasharray="4 5"/>';}
 for(let i=0;i<6;i++)out+='<text x="'+(10+i*108)+'" y="245" fill="#99a8c4" font-size="9">'+(candles?['09:00','10:00','11:00','12:00','13:00','14:00'][i]:['Year 1','Year 2','Year 3','Year 4','Year 5','Year 6'][i])+'</text>';
 return '<div class="chart">'+out+'</svg><div class="chart-note">Illustrative geometry • not a current quote or forecast</div></div>';}
export function city(){return '<svg class="city" aria-hidden="true" viewBox="0 0 460 235" fill="none"><circle cx="340" cy="75" r="52" stroke="#8e70c8" opacity=".4"/><circle cx="340" cy="75" r="68" stroke="#665181" opacity=".3"/><path d="M15 215h425M35 215V140l25-20 25 20v75m10 0V85l20-22 20 22v130m18 0V130l21-18 21 18v85m20 0V45l25-27 25 27v170m20 0V105l24-24 24 24v110m20 0V60l20-22 20 22v155m20 0v-80l22-20 22 20v80" stroke="#9174c1" stroke-width="1.2"/><path d="M105 100v95m20-85v85m110-140v140m15-125v125m90-119v119" stroke="#be9cfa" stroke-width="2" opacity=".7"/><path d="M35 215v-75l25-20 25 20v75m130 0V45l25-27 25 27v170m60 0V60l20-22 20 22v155" fill="#9f7bdf" opacity=".12"/><circle cx="70" cy="65" r="2" fill="#bdb0dd"/><circle cx="180" cy="55" r="1.5" fill="#bdb0dd"/></svg>';}
export function art(i=0){const colors=[['#283c55','#557a86'],['#2e2a4b','#8a71b8'],['#263d39','#619982'],['#40312f','#b58c6c']][i%4];return '<svg aria-hidden="true" viewBox="0 0 400 200"><rect width="400" height="200" fill="'+colors[0]+'"/><circle cx="'+(280-i*17)+'" cy="62" r="28" fill="'+colors[1]+'" opacity=".65"/><path d="M0 155 100 80 220 165 320 105 400 170V200H0Z" fill="'+colors[1]+'" opacity=".4"/><path d="M0 185 135 135 215 185 335 140 400 180V200H0Z" fill="'+colors[1]+'" opacity=".55"/></svg>';}
export function cards(titles,type='gallery'){return '<div class="grid three">'+titles.map((title,i)=>'<section class="panel product"><div class="gallery-art">'+art(i)+'</div>'+badge(type==='game'?'Rules available':type==='shop'?'Design item':'Community sample','violet')+'<h3 style="margin-top:12px">'+esc(title)+'</h3><p>'+['Made for your next small adventure.','Find your place in the community.','A useful addition to your journey.'][i%3]+'</p><div class="product-bottom"><strong class="num">'+(type==='shop'?['1,200 WLD','800 WLD','2,400 WLD'][i%3]:type==='game'?'View requirements':'Sample creator')+'</strong>'+button(type==='shop'?'Review item':'Open','small')+'</div></section>').join('')+'</div>';}
