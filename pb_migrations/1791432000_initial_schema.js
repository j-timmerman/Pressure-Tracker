migrate(
  (app) => {
    // PocketBase creates the default users auth collection in its system
    // migrations. Configure that collection rather than creating a duplicate.
    const users = app.findCollectionByNameOrId('users');
    users.listRule = null;
    users.viewRule = 'id = @request.auth.id';
    users.createRule = null;
    users.updateRule = 'id = @request.auth.id';
    users.deleteRule = null;
    users.manageRule = null;
    users.authRule = '';
    users.passwordAuth.enabled = true;
    users.passwordAuth.identityFields = ['email'];
    app.save(users);

    const profiles = new Collection({
      type: 'base',
      name: 'pressure_app_user_profiles',
      listRule:
        '@request.auth.id != "" && auth_user_id = @request.auth.id',
      viewRule:
        '@request.auth.id != "" && auth_user_id = @request.auth.id',
      createRule: null,
      updateRule:
        '@request.auth.id != "" && auth_user_id = @request.auth.id && @request.body.auth_user_id:changed = false',
      deleteRule: null,
      fields: [
        {
          name: 'auth_user_id',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: true,
        },
        {
          name: 'username',
          type: 'text',
          required: true,
          min: 3,
          max: 100,
        },
        { name: 'created', type: 'autodate', onCreate: true },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_pressure_profiles_auth_user ON pressure_app_user_profiles (auth_user_id)',
      ],
    });
    app.save(profiles);

    const locations = new Collection({
      type: 'base',
      name: 'saved_locations',
      listRule: '@request.auth.id != "" && owner_id = @request.auth.id',
      viewRule: '@request.auth.id != "" && owner_id = @request.auth.id',
      createRule:
        '@request.auth.id != "" && @request.body.owner_id = @request.auth.id',
      updateRule:
        '@request.auth.id != "" && owner_id = @request.auth.id && @request.body.owner_id:changed = false',
      deleteRule: '@request.auth.id != "" && owner_id = @request.auth.id',
      fields: [
        {
          name: 'owner_id',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: true,
        },
        { name: 'label', type: 'text', required: true, min: 1, max: 100 },
        { name: 'city', type: 'text', required: true },
        { name: 'region', type: 'text' },
        { name: 'country', type: 'text' },
        { name: 'latitude', type: 'number', min: -90, max: 90 },
        {
          name: 'longitude',
          type: 'number',
          min: -180,
          max: 180,
        },
        {
          name: 'timezone',
          type: 'text',
          required: true,
          min: 1,
          max: 100,
        },
        { name: 'created', type: 'autodate', onCreate: true },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        'CREATE INDEX idx_saved_locations_owner_created ON saved_locations (owner_id, created)',
      ],
    });
    app.save(locations);

    const settings = new Collection({
      type: 'base',
      name: 'user_settings',
      listRule: '@request.auth.id != "" && user_id = @request.auth.id',
      viewRule: '@request.auth.id != "" && user_id = @request.auth.id',
      createRule:
        '@request.auth.id != "" && @request.body.user_id = @request.auth.id',
      updateRule:
        '@request.auth.id != "" && user_id = @request.auth.id && @request.body.user_id:changed = false',
      deleteRule: '@request.auth.id != "" && user_id = @request.auth.id',
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: true,
        },
        {
          name: 'default_location_id',
          type: 'relation',
          maxSelect: 1,
          collectionId: locations.id,
          cascadeDelete: false,
        },
        {
          name: 'pressure_unit',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['hPa', 'inHg'],
        },
        { name: 'notices_enabled', type: 'bool' },
        {
          name: 'notice_direction',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['rise', 'fall', 'either'],
        },
        { name: 'notice_threshold_hpa', type: 'number', min: 0 },
        {
          name: 'notice_window_hours',
          type: 'number',
          required: true,
          onlyInt: true,
          min: 1,
          max: 120,
        },
        { name: 'watch_levels', type: 'json', maxSize: 2000 },
        { name: 'created', type: 'autodate', onCreate: true },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_user_settings_user ON user_settings (user_id)',
      ],
    });
    app.save(settings);

    const journal = new Collection({
      type: 'base',
      name: 'pressure_app_journal_entries',
      listRule: '@request.auth.id != "" && user_id = @request.auth.id',
      viewRule: '@request.auth.id != "" && user_id = @request.auth.id',
      createRule:
        '@request.auth.id != "" && @request.body.user_id = @request.auth.id',
      updateRule:
        '@request.auth.id != "" && user_id = @request.auth.id && @request.body.user_id:changed = false',
      deleteRule: '@request.auth.id != "" && user_id = @request.auth.id',
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: true,
        },
        { name: 'occurred_at', type: 'date', required: true },
        { name: 'ended_at', type: 'date' },
        { name: 'is_ongoing', type: 'bool' },
        {
          name: 'symptoms',
          type: 'text',
          required: true,
          min: 1,
          max: 2000,
        },
        { name: 'severity', type: 'number', onlyInt: true },
        { name: 'notes', type: 'text' },
        { name: 'pressure_hpa', type: 'number' },
        { name: 'pressure_observed_at', type: 'date' },
        { name: 'end_pressure_hpa', type: 'number' },
        { name: 'end_pressure_observed_at', type: 'date' },
        {
          name: 'location_id',
          type: 'relation',
          maxSelect: 1,
          collectionId: locations.id,
          cascadeDelete: false,
        },
        { name: 'location_label', type: 'text', max: 200 },
        { name: 'created', type: 'autodate', onCreate: true },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        'CREATE INDEX idx_pressure_journal_user_occurred ON pressure_app_journal_entries (user_id, occurred_at DESC)',
      ],
    });
    app.save(journal);
  },
  (app) => {
    for (const name of [
      'pressure_app_journal_entries',
      'user_settings',
      'saved_locations',
      'pressure_app_user_profiles',
    ]) {
      app.delete(app.findCollectionByNameOrId(name));
    }
  }
);
