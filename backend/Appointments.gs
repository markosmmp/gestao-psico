function validateAppointment_(input) {
  const data = Object.assign({}, input);
  if (!data.patient_id || !findById_(SHEETS.PATIENTS, 'patient_id', data.patient_id)) throw new Error('Paciente inválido.');
  data.date = assertDate_(data.date, 'Data do atendimento', false);
  data.start_time = assertTime_(data.start_time, 'Hora inicial', false);
  data.end_time = assertTime_(data.end_time, 'Hora final', false);
  if (data.end_time <= data.start_time) throw new Error('Horário final deve ser posterior ao inicial.');
  assertAllowed_(data.modality, ALLOWED.modality, 'modalidade');
  data.status = data.status || 'AGENDADO';
  assertAllowed_(data.status, ALLOWED.appointmentStatus, 'status');
  data.payment_status = data.payment_status || 'PENDENTE';
  assertAllowed_(data.payment_status, ALLOWED.paymentStatus, 'status do pagamento');
  data.payment_method = data.payment_method || 'PIX';
  assertAllowed_(data.payment_method, ALLOWED.paymentMethod, 'forma de pagamento');
  data.session_value = assertMoney_(data.session_value || 0, 'Valor da sessão', true);
  data.notes_admin = safeText_(data.notes_admin, 1000);
  assertAdministrativeNote_(data.notes_admin);

  if (FINANCE_RULES.NON_BILLABLE_APPOINTMENT_STATUS.indexOf(data.status) >= 0 && data.payment_status !== 'PAGO') data.payment_status = 'ISENTO';
  return data;
}

function assertNoAppointmentConflict_(data, ignoredId) {
  if (FINANCE_RULES.NON_BILLABLE_APPOINTMENT_STATUS.indexOf(data.status) >= 0) return;
  const conflict = listAppointments_().some(item =>
    item.appointment_id !== ignoredId && item.date === data.date &&
    FINANCE_RULES.NON_BILLABLE_APPOINTMENT_STATUS.indexOf(item.status) < 0 &&
    data.start_time < item.end_time && data.end_time > item.start_time
  );
  if (conflict) throw new Error('Já existe um atendimento nesse intervalo de horário.');
}

function listAppointments_() {
  return rowsToObjects_(SHEETS.APPOINTMENTS).sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));
}

function createAppointment_(input) {
  return withScriptLock_(() => {
    const data = validateAppointment_(input);
    if (data.payment_status === 'PAGO') throw new Error('Use Registrar pagamento para marcar um atendimento como pago.');
    assertNoAppointmentConflict_(data, '');
    const timestamp = now_();
    data.appointment_id = generateId_(SHEETS.APPOINTMENTS, 'appointment_id', 'ATD', 6);
    data.created_at = timestamp;
    data.updated_at = timestamp;
    createRecord_(SHEETS.APPOINTMENTS, data);
    logAction_('CREATE_APPOINTMENT', 'APPOINTMENT', data.appointment_id, { patient_id: data.patient_id, date: data.date });
    return data;
  });
}

function updateAppointment_(input) {
  if (!input.appointment_id) throw new Error('appointment_id é obrigatório.');
  const found = findById_(SHEETS.APPOINTMENTS, 'appointment_id', input.appointment_id);
  if (!found) throw new Error('Atendimento não encontrado.');
  const current = found.headers.reduce((object, header, index) => (object[header] = found.values[index], object), {});
  const merged = Object.assign({}, current, input);
  if (input.payment_status === undefined && FINANCE_RULES.NON_BILLABLE_APPOINTMENT_STATUS.indexOf(current.status) >= 0 && FINANCE_RULES.NON_BILLABLE_APPOINTMENT_STATUS.indexOf(merged.status) < 0) merged.payment_status = 'PENDENTE';
  const data = validateAppointment_(merged);
  assertNoAppointmentConflict_(data, input.appointment_id);
  data.updated_at = now_();
  const updated = updateRecord_(SHEETS.APPOINTMENTS, 'appointment_id', input.appointment_id, data);
  logAction_('UPDATE_APPOINTMENT', 'APPOINTMENT', input.appointment_id, { status: data.status, payment_status: data.payment_status });
  return updated;
}
