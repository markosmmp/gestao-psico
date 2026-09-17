export const demoPatients = [
  {patient_id:'PAT-0001',first_name:'Ana',full_name:'Ana Martins',birth_date:'1997-02-12',phone:'(11) 99876-4321',email:'ana@example.com',type:'PARTICULAR',insurance_name:'',modality:'ONLINE',session_value:180,frequency:'SEMANAL',preferred_day:'Quarta-feira',preferred_time:'09:00',start_date:'2026-03-12',status:'ATIVO',notes_admin:'Prefere lembrete por WhatsApp.'},
  {patient_id:'PAT-0002',first_name:'Carlos',full_name:'Carlos Rocha',birth_date:'1988-07-28',phone:'(11) 98822-1040',email:'carlos@example.com',type:'PLANO',insurance_name:'Saúde Mais',modality:'PRESENCIAL',session_value:150,frequency:'SEMANAL',preferred_day:'Quarta-feira',preferred_time:'10:30',start_date:'2026-01-18',status:'ATIVO',notes_admin:''},
  {patient_id:'PAT-0003',first_name:'Mariana',full_name:'Mariana Freitas',birth_date:'1993-11-05',phone:'(11) 97743-2001',email:'mariana@example.com',type:'PARTICULAR',insurance_name:'',modality:'ONLINE',session_value:180,frequency:'QUINZENAL',preferred_day:'Quarta-feira',preferred_time:'14:00',start_date:'2025-10-04',status:'ATIVO',notes_admin:''},
  {patient_id:'PAT-0004',first_name:'João',full_name:'João Santos',birth_date:'1982-05-19',phone:'(11) 96612-7810',email:'joao@example.com',type:'PARTICULAR',insurance_name:'',modality:'PRESENCIAL',session_value:180,frequency:'SEMANAL',preferred_day:'Quarta-feira',preferred_time:'16:00',start_date:'2026-02-08',status:'ATIVO',notes_admin:''},
  {patient_id:'PAT-0005',first_name:'Beatriz',full_name:'Beatriz Lima',birth_date:'1990-09-22',phone:'(11) 95500-9012',email:'beatriz@example.com',type:'PLANO',insurance_name:'Bem-Estar',modality:'ONLINE',session_value:140,frequency:'MENSAL',preferred_day:'Sexta-feira',preferred_time:'11:00',start_date:'2025-08-14',status:'PAUSADO',notes_admin:'Retorno previsto para outubro.'},
  {patient_id:'PAT-0006',first_name:'Lucas',full_name:'Lucas Pereira',birth_date:'2000-01-07',phone:'(11) 94488-3322',email:'lucas@example.com',type:'PARTICULAR',insurance_name:'',modality:'ONLINE',session_value:180,frequency:'QUINZENAL',preferred_day:'Terça-feira',preferred_time:'17:30',start_date:'2026-06-11',status:'EM_AVALIACAO',notes_admin:''},
  {patient_id:'PAT-0007',first_name:'Renata',full_name:'Renata Alves',birth_date:'1979-03-14',phone:'(11) 93321-4455',email:'renata@example.com',type:'PARTICULAR',insurance_name:'',modality:'PRESENCIAL',session_value:180,frequency:'EVENTUAL',preferred_day:'Segunda-feira',preferred_time:'15:00',start_date:'2024-11-02',status:'ENCERRADO',notes_admin:''}
];

export const demoAppointments = [
  {appointment_id:'ATD-000101',patient_id:'PAT-0001',date:'2026-09-16',start_time:'09:00',end_time:'09:50',modality:'ONLINE',session_value:180,status:'REALIZADO',payment_status:'PAGO',payment_method:'PIX',notes_admin:''},
  {appointment_id:'ATD-000102',patient_id:'PAT-0002',date:'2026-09-16',start_time:'10:30',end_time:'11:20',modality:'PRESENCIAL',session_value:150,status:'AGENDADO',payment_status:'PENDENTE',payment_method:'TRANSFERENCIA',notes_admin:''},
  {appointment_id:'ATD-000103',patient_id:'PAT-0003',date:'2026-09-16',start_time:'14:00',end_time:'14:50',modality:'ONLINE',session_value:180,status:'AGENDADO',payment_status:'PENDENTE',payment_method:'PIX',notes_admin:''},
  {appointment_id:'ATD-000104',patient_id:'PAT-0004',date:'2026-09-16',start_time:'16:00',end_time:'16:50',modality:'PRESENCIAL',session_value:180,status:'AGENDADO',payment_status:'PENDENTE',payment_method:'PIX',notes_admin:''},
  {appointment_id:'ATD-000105',patient_id:'PAT-0006',date:'2026-09-17',start_time:'17:30',end_time:'18:20',modality:'ONLINE',session_value:180,status:'AGENDADO',payment_status:'PENDENTE',payment_method:'PIX',notes_admin:''},
  {appointment_id:'ATD-000106',patient_id:'PAT-0001',date:'2026-09-09',start_time:'09:00',end_time:'09:50',modality:'ONLINE',session_value:180,status:'REALIZADO',payment_status:'PAGO',payment_method:'PIX',notes_admin:''},
  {appointment_id:'ATD-000107',patient_id:'PAT-0002',date:'2026-09-09',start_time:'10:30',end_time:'11:20',modality:'PRESENCIAL',session_value:150,status:'FALTOU',payment_status:'ISENTO',payment_method:'OUTRO',notes_admin:''},
  {appointment_id:'ATD-000108',patient_id:'PAT-0003',date:'2026-09-02',start_time:'14:00',end_time:'14:50',modality:'ONLINE',session_value:180,status:'CANCELADO',payment_status:'ISENTO',payment_method:'PIX',notes_admin:''},
  {appointment_id:'ATD-000109',patient_id:'PAT-0004',date:'2026-09-23',start_time:'16:00',end_time:'16:50',modality:'PRESENCIAL',session_value:180,status:'AGENDADO',payment_status:'PENDENTE',payment_method:'PIX',notes_admin:''},
  {appointment_id:'ATD-000110',patient_id:'PAT-0005',date:'2026-09-25',start_time:'11:00',end_time:'11:50',modality:'ONLINE',session_value:140,status:'AGENDADO',payment_status:'PENDENTE',payment_method:'TRANSFERENCIA',notes_admin:''}
];

export const demoPayments = [
  {payment_id:'PAG-000081',appointment_id:'ATD-000101',patient_id:'PAT-0001',date:'2026-09-16',value:180,payment_method:'PIX',status:'PAGO',description:'Sessão 16/09'},
  {payment_id:'PAG-000080',appointment_id:'ATD-000106',patient_id:'PAT-0001',date:'2026-09-09',value:180,payment_method:'PIX',status:'PAGO',description:'Sessão 09/09'},
  {payment_id:'PAG-000079',appointment_id:'ATD-000099',patient_id:'PAT-0004',date:'2026-09-08',value:180,payment_method:'PIX',status:'PAGO',description:'Sessão 08/09'},
  {payment_id:'PAG-000078',appointment_id:'ATD-000098',patient_id:'PAT-0003',date:'2026-09-05',value:180,payment_method:'CARTAO',status:'PAGO',description:'Sessão 05/09'},
  {payment_id:'PAG-000077',appointment_id:'ATD-000097',patient_id:'PAT-0002',date:'2026-09-03',value:150,payment_method:'TRANSFERENCIA',status:'PAGO',description:'Sessão 03/09'}
];

export const monthlyRevenue = [
  {month:'Abr',value:7820},{month:'Mai',value:8460},{month:'Jun',value:8110},{month:'Jul',value:9260},{month:'Ago',value:9480},{month:'Set',value:9840}
];

export const defaultSettings = {professional_name:'Juliana Maranho',clinic_name:'Consultório Juliana Maranho',crp:'',phone:'',email:'',default_session_value:180,default_session_duration:50,timezone:'America/Sao_Paulo',currency:'BRL'};
