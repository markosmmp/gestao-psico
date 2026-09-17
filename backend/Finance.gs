function listPayments_() { return rowsToObjects_(SHEETS.PAYMENTS); }

function createPayment_(input) {
  if (!input.appointment_id) throw new Error('appointment_id é obrigatório.');
  const appointmentFound = findById_(SHEETS.APPOINTMENTS, 'appointment_id', input.appointment_id);
  if (!appointmentFound) throw new Error('Atendimento não encontrado.');
  const appointment = appointmentFound.headers.reduce((o,h,i)=>(o[h]=appointmentFound.values[i],o),{});
  const timestamp = now_(); const data = {
    payment_id: generateId_(SHEETS.PAYMENTS, 'payment_id', 'PAG', 6), appointment_id: input.appointment_id,
    patient_id: appointment.patient_id, date: safeText_(input.date, 20), value: asNumber_(input.value),
    payment_method: input.payment_method || appointment.payment_method || 'PIX', status: input.status || 'PAGO',
    description: safeText_(input.description || ('Atendimento ' + appointment.date), 200), created_at: timestamp, updated_at: timestamp
  };
  assertAllowed_(data.payment_method, ALLOWED.paymentMethod, 'forma de pagamento');
  if (['PAGO','PENDENTE','CANCELADO'].indexOf(data.status) < 0) throw new Error('Status de pagamento inválido.');
  createRecord_(SHEETS.PAYMENTS, data);
  updateRecord_(SHEETS.APPOINTMENTS, 'appointment_id', input.appointment_id, { payment_status: data.status === 'PAGO' ? 'PAGO' : 'PENDENTE', payment_method: data.payment_method, updated_at: timestamp });
  logAction_('REGISTER_PAYMENT', 'PAYMENT', data.payment_id, { appointment_id: data.appointment_id, value: data.value }); return data;
}

function updatePayment_(input) { if(!input.payment_id)throw new Error('payment_id é obrigatório.');const found=findById_(SHEETS.PAYMENTS,'payment_id',input.payment_id);if(!found)throw new Error('Pagamento não encontrado.');const changes={};['date','payment_method','status','description'].forEach(k=>{if(input[k]!==undefined)changes[k]=safeText_(input[k],200)});if(input.value!==undefined)changes.value=asNumber_(input.value);changes.updated_at=now_();const updated=updateRecord_(SHEETS.PAYMENTS,'payment_id',input.payment_id,changes);logAction_('UPDATE_PAYMENT','PAYMENT',input.payment_id,{status:updated.status});return updated; }

function getFinance_() {
  const appointments=listAppointments_(),payments=listPayments_();
  const sum=list=>Math.round(list.reduce((s,item)=>s+Number(item.value||item.session_value||0),0)*100)/100;
  return {received:sum(payments.filter(p=>p.status==='PAGO')),pending:sum(appointments.filter(a=>a.payment_status==='PENDENTE'&&a.status==='REALIZADO')),forecast:sum(appointments.filter(a=>a.status==='AGENDADO')),billed:sum(appointments.filter(a=>a.status==='REALIZADO')),payments:payments};
}

function getDashboard_() { const patients=listPatients_(),appointments=listAppointments_(),finance=getFinance_();return {active_patients:patients.filter(p=>p.status==='ATIVO').length,appointments_count:appointments.length,received:finance.received,pending:finance.pending,forecast:finance.forecast,upcoming:appointments.filter(a=>a.status==='AGENDADO').slice(0,8)}; }

function getConfig_() { const rows=rowsToObjects_(SHEETS.CONFIG);return rows.reduce((config,row)=>(config[row.key]=row.value,config),Object.assign({},DEFAULT_CONFIG)); }
function updateConfig_(input) { const sheet=getSheet_(SHEETS.CONFIG);Object.keys(DEFAULT_CONFIG).forEach(key=>{if(input[key]===undefined)return;const found=findById_(SHEETS.CONFIG,'key',key);if(found)found.sheet.getRange(found.row,2).setValue(safeText_(input[key],300));else sheet.appendRow([key,safeText_(input[key],300)])});logAction_('UPDATE_CONFIG','CONFIG','GLOBAL',{keys:Object.keys(input).filter(k=>k!=='api_url')});return getConfig_(); }
