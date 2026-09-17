function listPayments_() { return rowsToObjects_(SHEETS.PAYMENTS).sort((a, b) => (b.date + b.created_at).localeCompare(a.date + a.created_at)); }

function createPayment_(input) {
  return withScriptLock_(() => {
    if (!input.appointment_id) throw new Error('appointment_id é obrigatório.');
    const appointmentFound = findById_(SHEETS.APPOINTMENTS, 'appointment_id', input.appointment_id);
    if (!appointmentFound) throw new Error('Atendimento não encontrado.');
    const appointment = appointmentFound.headers.reduce((object, header, index) => (object[header] = appointmentFound.values[index], object), {});
    if (FINANCE_RULES.NON_BILLABLE_APPOINTMENT_STATUS.indexOf(appointment.status) >= 0) throw new Error('Este atendimento não é faturável.');
    const duplicate = listPayments_().some(payment => payment.appointment_id === input.appointment_id && payment.status === 'PAGO');
    if (duplicate) throw new Error('Este atendimento já possui um pagamento confirmado.');

    const timestamp = now_();
    const data = {
      payment_id: generateId_(SHEETS.PAYMENTS, 'payment_id', 'PAG', 6),
      appointment_id: input.appointment_id,
      patient_id: appointment.patient_id,
      date: assertDate_(input.date, 'Data do pagamento', false),
      value: assertMoney_(input.value, 'Valor do pagamento', false),
      payment_method: input.payment_method || appointment.payment_method || 'PIX',
      status: input.status || 'PAGO',
      description: safeText_(input.description || ('Atendimento ' + appointment.date), 200),
      created_at: timestamp,
      updated_at: timestamp
    };
    assertAllowed_(data.payment_method, ALLOWED.paymentMethod, 'forma de pagamento');
    assertAllowed_(data.status, ALLOWED.paymentRecordStatus, 'status do pagamento');
    createRecord_(SHEETS.PAYMENTS, data);
    syncAppointmentPayment_(data.appointment_id, data.payment_method, timestamp);
    logAction_('REGISTER_PAYMENT', 'PAYMENT', data.payment_id, { appointment_id: data.appointment_id, value: data.value });
    return data;
  });
}

function syncAppointmentPayment_(appointmentId, paymentMethod, timestamp) {
  const appointmentFound = findById_(SHEETS.APPOINTMENTS, 'appointment_id', appointmentId);
  if (!appointmentFound) throw new Error('Atendimento do pagamento não encontrado.');
  const appointment = appointmentFound.headers.reduce((object, header, index) => (object[header] = appointmentFound.values[index], object), {});
  const hasPaid = listPayments_().some(payment => payment.appointment_id === appointmentId && payment.status === 'PAGO');
  const paymentStatus = hasPaid ? 'PAGO' : (FINANCE_RULES.NON_BILLABLE_APPOINTMENT_STATUS.indexOf(appointment.status) >= 0 ? 'ISENTO' : 'PENDENTE');
  updateRecord_(SHEETS.APPOINTMENTS, 'appointment_id', appointmentId, {
    payment_status: paymentStatus,
    payment_method: paymentMethod || appointment.payment_method,
    updated_at: timestamp || now_()
  });
}

function updatePayment_(input) {
  if (!input.payment_id) throw new Error('payment_id é obrigatório.');
  const found = findById_(SHEETS.PAYMENTS, 'payment_id', input.payment_id);
  if (!found) throw new Error('Pagamento não encontrado.');
  const current = found.headers.reduce((object, header, index) => (object[header] = found.values[index], object), {});
  const changes = {};
  if (input.date !== undefined) changes.date = assertDate_(input.date, 'Data do pagamento', false);
  if (input.payment_method !== undefined) { assertAllowed_(input.payment_method, ALLOWED.paymentMethod, 'forma de pagamento'); changes.payment_method = input.payment_method; }
  if (input.status !== undefined) { assertAllowed_(input.status, ALLOWED.paymentRecordStatus, 'status do pagamento'); changes.status = input.status; }
  if (input.description !== undefined) changes.description = safeText_(input.description, 200);
  if (input.value !== undefined) changes.value = assertMoney_(input.value, 'Valor do pagamento', false);
  if ((changes.status || current.status) === 'PAGO' && listPayments_().some(payment => payment.payment_id !== input.payment_id && payment.appointment_id === current.appointment_id && payment.status === 'PAGO')) throw new Error('Este atendimento já possui outro pagamento confirmado.');
  changes.updated_at = now_();
  const updated = updateRecord_(SHEETS.PAYMENTS, 'payment_id', input.payment_id, changes);
  syncAppointmentPayment_(current.appointment_id, updated.payment_method, changes.updated_at);
  logAction_('UPDATE_PAYMENT', 'PAYMENT', input.payment_id, { status: updated.status });
  return updated;
}

function getFinance_() {
  const appointments=listAppointments_(),payments=listPayments_();
  const sum=list=>fromCents_(list.reduce((total,item)=>total+cents_(item.value !== undefined ? item.value : item.session_value),0));
  return {received:sum(payments.filter(p=>p.status==='PAGO')),pending:sum(appointments.filter(a=>a.payment_status==='PENDENTE'&&FINANCE_RULES.BILLABLE_APPOINTMENT_STATUS.indexOf(a.status)>=0)),forecast:sum(appointments.filter(a=>FINANCE_RULES.FORECAST_APPOINTMENT_STATUS.indexOf(a.status)>=0)),billed:sum(appointments.filter(a=>FINANCE_RULES.BILLABLE_APPOINTMENT_STATUS.indexOf(a.status)>=0)),payments:payments};
}

function getDashboard_() {
  const patients = listPatients_(), appointments = listAppointments_(), payments = listPayments_();
  const today = Utilities.formatDate(new Date(), getTimezone_(), 'yyyy-MM-dd'), month = today.slice(0, 7);
  const monthAppointments = appointments.filter(item => item.date.indexOf(month) === 0);
  const monthPayments = payments.filter(item => item.date.indexOf(month) === 0 && item.status === 'PAGO');
  const sum = list => fromCents_(list.reduce((total, item) => total + cents_(item.value !== undefined ? item.value : item.session_value), 0));
  return {
    active_patients: patients.filter(item => item.status === 'ATIVO').length,
    appointments_count: monthAppointments.length,
    received: sum(monthPayments),
    pending: sum(monthAppointments.filter(item => item.status === 'REALIZADO' && item.payment_status === 'PENDENTE')),
    forecast: sum(monthAppointments.filter(item => item.status === 'AGENDADO')),
    upcoming: appointments.filter(item => item.status === 'AGENDADO' && item.date >= today).slice(0, 8)
  };
}

function getConfig_() { const rows=rowsToObjects_(SHEETS.CONFIG);return rows.reduce((config,row)=>(config[row.key]=row.value,config),Object.assign({},DEFAULT_CONFIG)); }
function updateConfig_(input) {
  const sheet = getSheet_(SHEETS.CONFIG), values = Object.assign({}, input);
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) throw new Error('E-mail inválido.');
  if (values.default_session_duration !== undefined && ['50','60'].indexOf(String(values.default_session_duration)) < 0) throw new Error('Duração padrão inválida.');
  if (values.default_session_value !== undefined) values.default_session_value = assertMoney_(values.default_session_value, 'Valor padrão', true);
  if (values.timezone !== undefined && values.timezone !== 'America/Sao_Paulo') throw new Error('Fuso horário inválido.');
  if (values.currency !== undefined && values.currency !== 'BRL') throw new Error('Moeda inválida.');
  Object.keys(DEFAULT_CONFIG).forEach(key => {
    if (values[key] === undefined) return;
    const found = findById_(SHEETS.CONFIG, 'key', key), value = safeText_(values[key], 300);
    if (found) found.sheet.getRange(found.row, 2).setValue(value); else sheet.appendRow([key, value]);
  });
  logAction_('UPDATE_CONFIG', 'CONFIG', 'GLOBAL', { keys: Object.keys(values).filter(key => Object.prototype.hasOwnProperty.call(DEFAULT_CONFIG, key)) });
  return getConfig_();
}
