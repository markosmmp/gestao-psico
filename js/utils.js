export const money = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value)||0);
export const shortDate = value => validIsoDate(value) ? new Intl.DateTimeFormat('pt-BR',{timeZone:'UTC'}).format(new Date(`${value}T12:00:00Z`)) : '—';
export const longDate = value => validIsoDate(value) ? new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long',timeZone:'UTC'}).format(new Date(`${value}T12:00:00Z`)) : '—';
export const label = value => String(value||'').replaceAll('_',' ').toLowerCase().replace(/(^|\s)\p{L}/gu,m=>m.toUpperCase());
export function age(birthDate){if(!validIsoDate(birthDate))return '—';const today=new Date();const born=new Date(`${birthDate}T12:00:00`);let years=today.getFullYear()-born.getFullYear();if(today.getMonth()<born.getMonth()||(today.getMonth()===born.getMonth()&&today.getDate()<born.getDate()))years--;return years>=0&&years<=120?years:'—';}
export function escapeHTML(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));}
export function patientById(patients,id){return patients.find(patient=>patient.patient_id===id)||{first_name:'Paciente',full_name:'Paciente'};}
export function monthMatrix(year,month){const first=new Date(year,month,1);const start=(first.getDay()+6)%7;const days=new Date(year,month+1,0).getDate();const previous=new Date(year,month,0).getDate();return Array.from({length:42},(_,index)=>{const day=index-start+1;if(day<1)return{day:previous+day,current:false,date:new Date(year,month-1,previous+day)};if(day>days)return{day:day-days,current:false,date:new Date(year,month+1,day-days)};return{day,current:true,date:new Date(year,month,day)}})}
export const isoDate=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function validateEmail(email){return !email||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
export function validatePhone(phone){return !phone||phone.replace(/\D/g,'').length>=10}
export function validIsoDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||'')))return false;const [year,month,day]=value.split('-').map(Number);const date=new Date(year,month-1,day,12);return date.getFullYear()===year&&date.getMonth()===month-1&&date.getDate()===day}
export const monthKey=value=>String(value||'').slice(0,7);
export function monthLabel(value){if(!/^\d{4}-\d{2}$/.test(String(value||'')))return 'Período';const [year,month]=value.split('-').map(Number);return new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(new Date(year,month-1,1,12))}
export function addMinutes(time,minutes){const match=/^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(time||''));if(!match)return'';const total=(Number(match[1])*60+Number(match[2])+Number(minutes||0))%(24*60);return`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`}
export const sumMoney=(items,field)=>Math.round(items.reduce((total,item)=>total+Math.round(Number(item[field]||0)*100),0))/100;
