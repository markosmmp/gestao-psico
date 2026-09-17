function validatePatient_(input) {
  const data = Object.assign({}, input);
  data.first_name = safeText_(data.first_name, 80);
  if (!data.first_name) throw new Error('Primeiro nome é obrigatório.');
  data.full_name = safeText_(data.full_name || data.first_name, 160);
  assertAllowed_(data.type, ALLOWED.patientType, 'tipo');
  assertAllowed_(data.modality, ALLOWED.modality, 'modalidade');
  data.frequency = data.frequency || 'SEMANAL'; assertAllowed_(data.frequency, ALLOWED.frequency, 'frequência');
  data.status = data.status || 'ATIVO'; assertAllowed_(data.status, ALLOWED.patientStatus, 'status');
  data.session_value = asNumber_(data.session_value || 0);
  data.email = safeText_(data.email, 160);
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new Error('E-mail inválido.');
  data.phone = safeText_(data.phone, 30);
  if (data.phone && data.phone.replace(/\D/g, '').length < 10) throw new Error('Telefone inválido.');
  data.notes_admin = safeText_(data.notes_admin, 1000); assertAdministrativeNote_(data.notes_admin);
  ['birth_date','insurance_name','preferred_day','preferred_time','start_date'].forEach(key => data[key] = safeText_(data[key], 120));
  data.age = calculateAge_(data.birth_date);
  return data;
}

function calculateAge_(value) {
  if (!value) return '';
  const birth = new Date(value + 'T12:00:00');
  if (isNaN(birth.getTime())) throw new Error('Data de nascimento inválida.');
  const today = new Date(); let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

function listPatients_() { return rowsToObjects_(SHEETS.PATIENTS); }
function getPatient_(id) { const found = findById_(SHEETS.PATIENTS, 'patient_id', id); if (!found) throw new Error('Paciente não encontrado.'); return found.headers.reduce((o,h,i)=>(o[h]=found.values[i],o),{}); }

function createPatient_(input) {
  const data = validatePatient_(input); const timestamp = now_();
  data.patient_id = generateId_(SHEETS.PATIENTS, 'patient_id', 'PAT', 4); data.created_at = timestamp; data.updated_at = timestamp;
  createRecord_(SHEETS.PATIENTS, data); logAction_('CREATE_PATIENT', 'PATIENT', data.patient_id, { fields: Object.keys(data).filter(key => !['notes_admin'].includes(key)) });
  return data;
}

function updatePatient_(input) {
  if (!input.patient_id) throw new Error('patient_id é obrigatório.');
  const current = getPatient_(input.patient_id); const data = validatePatient_(Object.assign({}, current, input)); data.updated_at = now_();
  const updated = updateRecord_(SHEETS.PATIENTS, 'patient_id', input.patient_id, data); logAction_('UPDATE_PATIENT', 'PATIENT', input.patient_id, { updated_at: data.updated_at });
  return updated;
}
