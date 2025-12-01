// app.js - client-side DataInsight Genie
d.setDate(d.getDate()+i);
parsed.push({date: d.toISOString().split('T')[0], product: products[Math.floor(Math.random()*4)], sales: Math.floor(Math.random()*900)+50, region: regions[Math.floor(Math.random()*4)]});
}
rawData = parsed;
postParseSetup();
}


function postParseSetup(){
detectColumns();
fillSelectors();
renderPreview();
computeAndRender();
}


function detectColumns(){
if(parsed.length==0) return;
const row = parsed[0];
numericCols = [];
dateCols = [];
catCols = [];
Object.keys(row).forEach(col=>{
let numericCount=0; let dateCount=0;
for(let i=0;i<Math.min(parsed.length,50);i++){
const v = parsed[i][col];
if(typeof v === 'number' && !isNaN(v)) numericCount++;
if(!isNaN(Date.parse(v))) dateCount++;
}
if(numericCount > 10) numericCols.push(col);
if(dateCount > 10) dateCols.push(col);
if(!numericCols.includes(col) && !dateCols.includes(col)) catCols.push(col);
});
}


function fillSelectors(){
const num = document.getElementById('numericSelect');
const date = document.getElementById('dateSelect');
const cat = document.getElementById('catSelect');
num.innerHTML = '<option value="">-- select --</option>';
date.innerHTML = '<option value="">-- select --</option>';
cat.innerHTML = '<option value="">-- select --</option>';
numericCols.forEach(c=> num.innerHTML += `<option value="${c}">${c}</option>`);
dateCols.forEach(c=> date.innerHTML += `<option value="${c}">${c}</option>`);
catCols.forEach(c=> cat.innerHTML += `<option value="${c}">${c}</option>`);
}


function computeAndRender(){
const numeric = document.getElementById('numericSelect').value || numericCols[0];
const date = document.getElementById('dateSelect').value || dateCols[0];
const cat = document.getElementById('catSelect').value || catCols[0];


const kpis = computeKPIs(parsed, numeric, date);
renderKPIs(kpis, numeric);
renderCharts(parsed, numeric, date, cat);
const insights = genInsights(parsed, numeric, cat, date);
renderInsights(insights);
renderPreview();
}


function computeKPIs(data, numeric, date){
const k = {rows: data.length, columns: data.length?Object.keys(data[0]).length:0};
if(numeric){
const vals = data.map(r=>r[numeric]).filter(v=>typeof v==='number');
const sum = vals.reduce((a,b)=>a+b,0);
const mean = sum/vals.length;
const median = vals.sort((a,b)=>a-b)[Math.floor(vals.length/2)]||0;
const std = Math.sqrt(vals.map(v=>Math.pow(v-mean,2)).reduce((a,b)=>a+b,0)/vals.length)||0;
k.total = sum; k.mean = mean; k.median = median; k.std = std;
}
if(date && numeric){
const monthly = {};
data.forEach(r=>{
const d = new Date(r[date]);
if(isNaN(d)) return;
const key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0')