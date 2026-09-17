function validateAppointment_(input) {
  const data = Object.assign({}, input);
  if (!data.patient_id || !findById_(SHEETS.PATIENTS, 'patient_id', data.patient_id)) throw new Error('Paciente inválido.');
  ['date','start_time','end_time'].forEach(field => { data[field] = safeText_(data[field], 20); if (!data[field]) throw new Error(field + ' é obrigatório.'); });
  if (data.end_time <= data.start_time) throw new Error('Horário final deve ser posterior ao inicial.');
  assertAllowed_(data.modality, ALLOWED.modality, 'modalidade');
  data.status = data.status || 'AGENDADO'; assertAllowed_(data.status, ALLOWED.appointmentStatus, 'status');
  data.payment_status = data.payment_status || 'PENDENTE'; assertAllowed_(data.payment_status, ALLOWED.paymentStatus, 'status do pagamento');
  data.payment_method = data.payment_method || 'PIX'; assertAllowed_(data.payment_method, ALLOWED.paymentMethod, 'forma de pagamento');
  data.session_value = asNumber_(data.session_value || 0); data.notes_admin = safeText_(data.notes_admin, 1000); assertAdministrativeNote_(data.notes_admin);
  return data;
}

function listAppointments_() { return rowsToObjects_(SHEETS.APPOINTMENTS); }
function createAppointment_(input) { const data=validateAppointment_(input),timestamp=now_();data.appointment_id=generateId_(SHEETS.APPOINTMENTS,'appointment_id','ATD',6);data.created_at=timestamp;data.updated_at=timestamp;createRecord_(SHEETS.APPOINTMENTS,data);logAction_('CREATE_APPOINTMENT','APPOINTMENT',data.appointment_id,{patient_id:data.patient_id,date:data.date});return data; }
function updateAppointment_(input) { if(!input.appointment_id)throw new Error('appointment_id é obrigatório.');const found=findById_(SHEETS.APPOINTMENTS,'appointment_id',input.appointment_id);if(!found)throw new Error('Atendimento não encontrado.');const current=found.headers.reduce((o,h,i)=>(o[h]=found.values[i],o),{});const data=validateAppointment_(Object.assign({},current,input));data.updated_at=now_();const updated=updateRecord_(SHEETS.APPOINTMENTS,'appointment_id',input.appointment_id,data);logAction_('UPDATE_APPOINTMENT','APPOINTMENT',input.appointment_id,{status:data.status,payment_status:data.payment_status});return updated; }
