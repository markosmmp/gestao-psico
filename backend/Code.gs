function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'health';
    if (action === 'health') return ok_({ status: 'ok', timezone: getTimezone_() });
    if (action === 'dashboard') return ok_(getDashboard_());
    if (action === 'patients') return ok_(listPatients_());
    if (action === 'patient') return ok_(getPatient_(e.parameter.id));
    if (action === 'appointments') return ok_(listAppointments_());
    if (action === 'payments') return ok_(listPayments_());
    if (action === 'finance') return ok_(getFinance_());
    if (action === 'config') return ok_(getConfig_());
    throw new Error('Ação GET desconhecida.');
  } catch (error) { return fail_(error); }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData && e.postData.contents || '{}');
    const action = payload.action, data = payload.data || {};
    if (action === 'createPatient') return ok_(createPatient_(data));
    if (action === 'updatePatient') return ok_(updatePatient_(data));
    if (action === 'createAppointment') return ok_(createAppointment_(data));
    if (action === 'updateAppointment') return ok_(updateAppointment_(data));
    if (action === 'createPayment') return ok_(createPayment_(data));
    if (action === 'updatePayment') return ok_(updatePayment_(data));
    if (action === 'updateConfig') return ok_(updateConfig_(data));
    throw new Error('Ação POST desconhecida.');
  } catch (error) { return fail_(error); }
}
