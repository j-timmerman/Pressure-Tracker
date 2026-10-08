onRecordCreate(
  (event) => {
    event.next();

    const profiles = event.app.findCollectionByNameOrId(
      'pressure_app_user_profiles'
    );
    const profile = new Record(profiles);
    const name = event.record.getString('name').trim();
    const emailName = event.record.getString('email').split('@')[0].trim();
    const username =
      name.length >= 3 ? name : emailName.length >= 3 ? emailName : 'User';

    profile.set('auth_user_id', event.record.id);
    profile.set('username', username.slice(0, 100));
    event.app.save(profile);
  },
  'users'
);

onRecordValidate(
  (event) => {
    const record = event.record;
    const start = record.getString('occurred_at');
    const end = record.getString('ended_at');
    const startPressure = record.getFloat('pressure_hpa');
    const startPressureTime = record.getString('pressure_observed_at');
    const endPressure = record.getFloat('end_pressure_hpa');
    const endPressureTime = record.getString('end_pressure_observed_at');
    const severity = record.getFloat('severity');

    if (!record.getString('symptoms').trim()) {
      throw new BadRequestError('Symptoms are required.');
    }
    if (end && end < start) {
      throw new BadRequestError('The end time must be after the start time.');
    }
    if (record.getBool('is_ongoing') && end) {
      throw new BadRequestError('An ongoing entry cannot have an end time.');
    }
    if (Boolean(startPressure) !== Boolean(startPressureTime)) {
      throw new BadRequestError(
        'Start pressure and reading time must be saved together.'
      );
    }
    if (Boolean(endPressure) !== Boolean(endPressureTime)) {
      throw new BadRequestError(
        'End pressure and reading time must be saved together.'
      );
    }
    if (endPressure && !end) {
      throw new BadRequestError('An end pressure requires an end time.');
    }
    if (severity && (severity < 1 || severity > 10)) {
      throw new BadRequestError('Severity must be between 1 and 10.');
    }
    if (startPressure && (startPressure < 800 || startPressure > 1200)) {
      throw new BadRequestError('Start pressure must be between 800 and 1200 hPa.');
    }
    if (endPressure && (endPressure < 800 || endPressure > 1200)) {
      throw new BadRequestError('End pressure must be between 800 and 1200 hPa.');
    }
    if (
      record.getString('location_id') &&
      !record.getString('location_label').trim()
    ) {
      throw new BadRequestError('A saved location requires a location label.');
    }

    event.next();
  },
  'pressure_app_journal_entries'
);

onRecordValidate(
  (event) => {
    const locationId = event.record.getString('default_location_id');
    if (
      event.record.getBool('notices_enabled') &&
      !event.record.getFloat('notice_threshold_hpa')
    ) {
      throw new BadRequestError(
        'A notice threshold is required when notices are enabled.'
      );
    }
    if (locationId) {
      const location = event.app.findRecordById('saved_locations', locationId);
      if (location.getString('owner_id') !== event.record.getString('user_id')) {
        throw new BadRequestError(
          'The default location must belong to the user.'
        );
      }
    }
    event.next();
  },
  'user_settings'
);

onRecordValidate(
  (event) => {
    const locationId = event.record.getString('location_id');
    if (locationId) {
      const location = event.app.findRecordById('saved_locations', locationId);
      if (location.getString('owner_id') !== event.record.getString('user_id')) {
        throw new BadRequestError('The journal location must belong to the user.');
      }
    }
    event.next();
  },
  'pressure_app_journal_entries'
);
