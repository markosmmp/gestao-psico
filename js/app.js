import {demoPatients,demoAppointments,demoPayments,monthlyRevenue,defaultSettings} from './data.js';
import {api,hasApi,getApiUrl,setApiUrl} from './api.js';
import {isoDate,validateEmail,validatePhone,validIsoDate,addMinutes} from './utils.js';
import {dashboardView,patientsView,agendaView,financeView,reportsView,settingsView,patientModal,patientFormModal,appointmentFormModal,appointmentModal,paymentFormModal,quickMenu} from './render.js';

const today=isoDate(new Date());
const currentMonth=today.slice(0,7);
const defaultFinanceFilters=()=>({month:currentMonth,from:'',to:'',patientId:'TODOS',type:'TODOS',modality:'TODOS'});
const state={
  route:'dashboard',patients:[...demoPatients],appointments:[...demoAppointments],payments:[...demoPayments],monthlyRevenue,
  settings:{...defaultSettings},patientQuery:'',patientFilter:'TODOS',agendaMode:'month',selectedDate:today,today,
  financeFilters:defaultFinanceFilters(),reportMonth:currentMonth,loading:false,demo:true,apiUrl:getApiUrl()
};
const view=document.querySelector('#app-view');
const modalRoot=document.querySelector('#modal-root');
const title=document.querySelector('#page-title');

function routeLabel(route){return({dashboard:'Olá, Juliana',patients:'Pacientes',agenda:'Agenda',finance:'Financeiro',reports:'Relatórios',settings:'Configurações'})[route]}
function updateConnectionStatus(){const badge=document.querySelector('#api-status'),exitButton=document.querySelector('#exit-demo');badge.innerHTML=state.demo?'<i></i> Modo de demonstração':'<i class="connected"></i> Dados da planilha';badge.title=state.demo?'Os dados exibidos são exemplos e não serão gravados.':'Somente dados retornados pelo Google Sheets estão visíveis.';if(exitButton){exitButton.hidden=!state.demo;exitButton.disabled=state.loading;exitButton.textContent=state.loading?'Carregando…':'Sair do modo demo'}}
function render(){title.textContent=routeLabel(state.route);view.setAttribute('aria-busy','true');view.innerHTML=({dashboard:dashboardView,patients:patientsView,agenda:agendaView,finance:financeView,reports:reportsView,settings:settingsView})[state.route](state);view.setAttribute('aria-busy','false');document.querySelectorAll('[data-route]').forEach(element=>{element.classList.toggle('active',element.dataset.route===state.route);if(element.matches('.nav-item'))element.toggleAttribute('aria-current',element.dataset.route===state.route)});window.scrollTo({top:0,behavior:'smooth'})}
function navigate(route){if(!routeLabel(route))return;state.route=route;history.replaceState(null,'',`#${route}`);render()}
function showModal(html){modalRoot.innerHTML=html;document.body.classList.add('modal-open');requestAnimationFrame(()=>modalRoot.querySelector('input:not([type="hidden"]),select,button')?.focus())}
function closeModal(){modalRoot.innerHTML='';document.body.classList.remove('modal-open')}
function toast(message,type='success'){const item=document.createElement('div'),icon=document.createElement('span'),copy=document.createElement('p');item.className=`toast ${type}`;icon.textContent=type==='success'?'✓':'!';copy.textContent=message;item.append(icon,copy);document.querySelector('#toast-root').append(item);setTimeout(()=>item.remove(),5000)}
function requireApi(){if(!navigator.onLine){toast('Você está sem internet. Reconecte para salvar alterações.','error');return false}if(hasApi())return true;toast('Conecte a API do Google Apps Script em Configurações para salvar alterações.','error');return false}
function formData(form){return Object.fromEntries(new FormData(form).entries())}
function setSubmitting(form,busy){const button=form.querySelector('[type="submit"]');if(!button)return;if(!button.dataset.original)button.dataset.original=button.textContent;button.disabled=busy;button.textContent=busy?'Salvando…':button.dataset.original}
function errorText(error,fallback){const message=String(error?.message||'');return message&&!/^(API_ERROR|Failed to fetch|Load failed|HTTP_|AbortError)/.test(message)?message:fallback}

function buildMonthlyRevenue(payments){const base=new Date(`${state.today}T12:00:00`);return Array.from({length:6},(_,index)=>{const date=new Date(base.getFullYear(),base.getMonth()-5+index,1),key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;const cents=payments.filter(payment=>payment.status==='PAGO'&&String(payment.date||'').startsWith(key)).reduce((sum,payment)=>sum+Math.round(Number(payment.value||0)*100),0);return{month:new Intl.DateTimeFormat('pt-BR',{month:'short'}).format(date).replace('.',''),value:cents/100}})}
async function loadRealData({notify=false}={}){if(!hasApi())return false;const wasDemo=state.demo;state.loading=true;updateConnectionStatus();try{const[patients,appointments,payments,config]=await Promise.all([api.patients(),api.appointments(),api.payments(),api.config()]);state.patients=Array.isArray(patients)?patients:[];state.appointments=Array.isArray(appointments)?appointments:[];state.payments=Array.isArray(payments)?payments:[];state.monthlyRevenue=buildMonthlyRevenue(state.payments);state.settings={...state.settings,...config};state.demo=false;render();if(notify||wasDemo)toast('Modo de demonstração encerrado. Exibindo somente os dados da planilha.');return true}catch(error){if(wasDemo)state.demo=true;toast(errorText(error,'Não foi possível carregar a planilha. Confira a URL da API e a implantação.'),'error');return false}finally{state.loading=false;updateConnectionStatus()}}
async function exitDemoMode(){if(!hasApi()){navigate('settings');toast('Configure a URL da API do Google Apps Script para sair do modo demo.','error');return}await loadRealData({notify:true})}

async function submitPatient(form){
  const data=formData(form);
  if(!data.first_name.trim())return toast('Informe o primeiro nome.','error');
  if(!data.type||!data.modality)return toast('Selecione tipo e modalidade.','error');
  if(data.type==='PLANO'&&!data.insurance_name.trim())return toast('Informe o nome do plano.','error');
  if(!validateEmail(data.email))return toast('Informe um e-mail válido.','error');
  if(!validatePhone(data.phone))return toast('Informe um telefone válido.','error');
  if(!Number.isFinite(Number(data.session_value))||Number(data.session_value)<0)return toast('Informe um valor de sessão válido.','error');
  if(data.birth_date&&!validIsoDate(data.birth_date))return toast('Informe uma data de nascimento válida.','error');
  if(!requireApi())return;
  setSubmitting(form,true);
  try{const editing=Boolean(data.patient_id);await(editing?api.updatePatient(data):api.createPatient(data));if(!await loadRealData())throw new Error('Dados salvos, mas não foi possível atualizar a tela.');closeModal();toast(editing?'Paciente atualizado com sucesso.':'Paciente cadastrado com sucesso.')}catch(error){toast(errorText(error,'Não foi possível salvar o paciente.'),'error')}finally{setSubmitting(form,false)}
}

async function submitAppointment(form){
  const data=formData(form);
  if(!data.patient_id||!data.date||!data.start_time||!data.end_time)return toast('Preencha paciente, data e horários.','error');
  if(!validIsoDate(data.date)||data.end_time<=data.start_time)return toast('Confira a data e os horários do atendimento.','error');
  if(!Number.isFinite(Number(data.session_value))||Number(data.session_value)<0)return toast('Informe um valor de sessão válido.','error');
  if(!requireApi())return;
  setSubmitting(form,true);
  try{const editing=Boolean(data.appointment_id);await(editing?api.updateAppointment(data):api.createAppointment(data));if(!await loadRealData())throw new Error('Dados salvos, mas não foi possível atualizar a tela.');closeModal();toast(editing?'Atendimento atualizado com sucesso.':'Atendimento criado com sucesso.')}catch(error){toast(errorText(error,'Não foi possível salvar o atendimento.'),'error')}finally{setSubmitting(form,false)}
}

async function submitPayment(form){
  const data=formData(form);
  if(!data.appointment_id||!validIsoDate(data.date)||Number(data.value)<=0)return toast('Selecione o atendimento e informe data e valor válidos.','error');
  if(!requireApi())return;
  setSubmitting(form,true);
  try{const editing=Boolean(data.payment_id);await(editing?api.updatePayment(data):api.createPayment(data));if(!await loadRealData())throw new Error('Dados salvos, mas não foi possível atualizar a tela.');closeModal();toast(editing?'Pagamento atualizado com sucesso.':'Pagamento registrado com sucesso.')}catch(error){toast(errorText(error,'Não foi possível salvar o pagamento.'),'error')}finally{setSubmitting(form,false)}
}

async function submitSettings(form){
  const data=formData(form),url=data.api_url.trim();
  if(!validateEmail(data.email))return toast('Informe um e-mail válido.','error');
  if(url&&!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(url))return toast('Use a URL publicada do Google Apps Script terminada em /exec.','error');
  if(Number(data.default_session_value)<0)return toast('Informe um valor padrão válido.','error');
  setApiUrl(url);state.apiUrl=getApiUrl();state.settings={...state.settings,...data,default_session_value:Number(data.default_session_value),default_session_duration:Number(data.default_session_duration)};updateConnectionStatus();
  if(!hasApi()){render();toast('Preferências deste dispositivo atualizadas.');return}
  setSubmitting(form,true);
  try{await api.saveConfig(state.settings);if(await loadRealData())toast('Configurações salvas com sucesso.')}catch(error){toast(errorText(error,'A URL foi guardada, mas a API não respondeu corretamente.'),'error')}finally{setSubmitting(form,false)}
}

async function updateAppointmentStatus(id,status){if(!requireApi())return;try{await api.updateAppointment({appointment_id:id,status});if(!await loadRealData())throw new Error('Status salvo, mas não foi possível atualizar a tela.');closeModal();toast(`Atendimento marcado como ${status.toLowerCase()}.`)}catch(error){toast(errorText(error,'Não foi possível atualizar o atendimento.'),'error')}}
function shiftSelectedDate(amount,unit){const date=new Date(`${state.selectedDate}T12:00:00`);if(unit==='month'){date.setDate(1);date.setMonth(date.getMonth()+amount)}else date.setDate(date.getDate()+amount);state.selectedDate=isoDate(date);render()}

document.addEventListener('click',event=>{
  if(event.target.classList.contains('modal-backdrop')){closeModal();return}
  const route=event.target.closest('[data-route]');if(route){navigate(route.dataset.route);return}
  const filter=event.target.closest('[data-filter]');if(filter){state.patientFilter=filter.dataset.filter;render();return}
  const mode=event.target.closest('[data-agenda-mode]');if(mode){state.agendaMode=mode.dataset.agendaMode;render();return}
  const dateButton=event.target.closest('[data-date]');if(dateButton){state.selectedDate=dateButton.dataset.date;if(state.agendaMode==='month')state.agendaMode='day';render();return}
  const action=event.target.closest('[data-action]');if(!action)return;const id=action.dataset.id;
  switch(action.dataset.action){
    case'close-modal':closeModal();break;
    case'exit-demo':exitDemoMode();break;
    case'quick-menu':showModal(quickMenu());break;
    case'new-patient':showModal(patientFormModal());break;
    case'patient-detail':{const patient=state.patients.find(item=>item.patient_id===id);if(patient)showModal(patientModal(patient,state));break}
    case'edit-patient':{const patient=state.patients.find(item=>item.patient_id===id);if(patient)showModal(patientFormModal(patient));break}
    case'new-appointment':showModal(appointmentFormModal(state,action.dataset.patientId||''));break;
    case'edit-appointment':{const appointment=state.appointments.find(item=>item.appointment_id===id);if(appointment)showModal(appointmentFormModal(state,'',appointment));break}
    case'appointment-detail':{const appointment=state.appointments.find(item=>item.appointment_id===id);if(appointment)showModal(appointmentModal(appointment,state));break}
    case'new-payment':showModal(paymentFormModal(state,action.dataset.appointmentId||''));break;
    case'edit-payment':{const payment=state.payments.find(item=>item.payment_id===id);if(payment)showModal(paymentFormModal(state,'',payment));break}
    case'update-appointment-status':updateAppointmentStatus(id,action.dataset.status);break;
    case'today':state.selectedDate=state.today;render();break;
    case'previous-month':shiftSelectedDate(-1,'month');break;
    case'next-month':shiftSelectedDate(1,'month');break;
    case'previous-week':shiftSelectedDate(-7,'day');break;
    case'next-week':shiftSelectedDate(7,'day');break;
    case'previous-day':shiftSelectedDate(-1,'day');break;
    case'next-day':shiftSelectedDate(1,'day');break;
    case'reset-finance-filters':state.financeFilters=defaultFinanceFilters();render();break;
  }
});

document.addEventListener('input',event=>{if(event.target.id==='patient-search'){state.patientQuery=event.target.value;const cursor=event.target.selectionStart;render();const input=document.querySelector('#patient-search');input?.focus();input?.setSelectionRange(cursor,cursor)}});
document.addEventListener('change',event=>{
  if(event.target.matches('[data-finance-filter]')){const key=event.target.dataset.financeFilter;state.financeFilters[key]=event.target.value;if(key==='month'){state.financeFilters.from='';state.financeFilters.to=''}render();return}
  if(event.target.id==='report-month'){state.reportMonth=event.target.value||currentMonth;render();return}
  if(event.target.id==='patient-type'){const insurance=document.querySelector('#insurance-name');if(insurance){insurance.required=event.target.value==='PLANO';if(event.target.value==='PARTICULAR')insurance.value=''}return}
  if(event.target.id==='appointment-patient'){const patient=state.patients.find(item=>item.patient_id===event.target.value);if(!patient)return;document.querySelector('#appointment-modality').value=patient.modality;document.querySelector('#appointment-value').value=patient.session_value;if(patient.preferred_time){document.querySelector('#appointment-start').value=patient.preferred_time;document.querySelector('#appointment-end').value=addMinutes(patient.preferred_time,Number(state.settings.default_session_duration)||50)}return}
  if(event.target.id==='appointment-start'){document.querySelector('#appointment-end').value=addMinutes(event.target.value,Number(state.settings.default_session_duration)||50);return}
  if(event.target.id==='payment-appointment'){const appointment=state.appointments.find(item=>item.appointment_id===event.target.value);if(appointment)document.querySelector('#payment-value').value=appointment.session_value}
});
document.addEventListener('submit',event=>{event.preventDefault();if(event.target.id==='patient-form')submitPatient(event.target);if(event.target.id==='appointment-form')submitAppointment(event.target);if(event.target.id==='payment-form')submitPayment(event.target);if(event.target.id==='settings-form')submitSettings(event.target)});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal()});
window.addEventListener('offline',()=>toast('Você está sem internet. Consultas em cache continuam disponíveis, mas não é possível salvar.','error'));
window.addEventListener('online',()=>toast('Conexão restabelecida.'));

const initialRoute=location.hash.slice(1);if(routeLabel(initialRoute))state.route=initialRoute;
const todayLabel=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());document.querySelector('#today-label').textContent=todayLabel[0].toUpperCase()+todayLabel.slice(1);
updateConnectionStatus();render();if(hasApi())loadRealData();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
