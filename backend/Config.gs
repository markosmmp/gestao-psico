const SHEETS = Object.freeze({
  PATIENTS: 'PACIENTES',
  APPOINTMENTS: 'ATENDIMENTOS',
  PAYMENTS: 'PAGAMENTOS',
  CONFIG: 'CONFIG',
  LOG: 'LOG'
});

const COLUMNS = Object.freeze({
  PACIENTES: ['patient_id','first_name','full_name','birth_date','age','phone','email','type','insurance_name','modality','session_value','frequency','preferred_day','preferred_time','start_date','status','notes_admin','created_at','updated_at'],
  ATENDIMENTOS: ['appointment_id','patient_id','date','start_time','end_time','modality','session_value','status','payment_status','payment_method','notes_admin','created_at','updated_at'],
  PAGAMENTOS: ['payment_id','appointment_id','patient_id','date','value','payment_method','status','description','created_at','updated_at'],
  CONFIG: ['key','value'],
  LOG: ['timestamp','action','entity','entity_id','details']
});

const ALLOWED = Object.freeze({
  patientType: ['PARTICULAR','PLANO'],
  modality: ['PRESENCIAL','ONLINE'],
  frequency: ['SEMANAL','QUINZENAL','MENSAL','EVENTUAL'],
  patientStatus: ['ATIVO','PAUSADO','ENCERRADO','EM_AVALIACAO'],
  appointmentStatus: ['AGENDADO','REALIZADO','CANCELADO','FALTOU','REMARCADO'],
  paymentStatus: ['PENDENTE','PAGO','ISENTO'],
  paymentRecordStatus: ['PAGO','PENDENTE','CANCELADO'],
  paymentMethod: ['PIX','DINHEIRO','CARTAO','TRANSFERENCIA','OUTRO']
});

const FINANCE_RULES = Object.freeze({
  BILLABLE_APPOINTMENT_STATUS: ['REALIZADO'],
  FORECAST_APPOINTMENT_STATUS: ['AGENDADO'],
  NON_BILLABLE_APPOINTMENT_STATUS: ['CANCELADO','FALTOU','REMARCADO']
});

const DEFAULT_CONFIG = Object.freeze({
  clinic_name: 'Consultório Juliana Maranho',
  professional_name: 'Juliana Maranho',
  crp: '', phone: '', email: '',
  default_session_duration: '50',
  default_session_value: '180',
  currency: 'BRL', theme: 'default',
  timezone: 'America/Sao_Paulo'
});
