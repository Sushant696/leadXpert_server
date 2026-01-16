export const PERMISSIONS = {
  'company:update': ['super_admin'],
  'company:delete': ['super_admin'],
  'company:view_settings': ['super_admin', 'admin'],

  'users:invite': ['super_admin', 'admin'],
  'users:remove': ['super_admin'],
  'users:update_role': ['super_admin'],
  'users:view': ['super_admin', 'admin', 'agent'],

  'leads:create': ['super_admin', 'admin', 'agent'],
  'leads:view_all': ['super_admin', 'admin'],
  'leads:view_own': ['agent'],
  'leads:update_all': ['super_admin', 'admin'],
  'leads:update_own': ['agent'],
  'leads:delete': ['super_admin', 'admin'],
  'leads:assign': ['super_admin', 'admin'],

  'reports:view': ['super_admin', 'admin'],
  'analytics:view': ['super_admin', 'admin'],

  'pipeline:manage': ['super_admin', 'admin'],
  'pipeline:view': ['super_admin', 'admin', 'agent'],

  'tags:manage': ['super_admin', 'admin'],
  'tags:view': ['super_admin', 'admin', 'agent'],

  'activities:create': ['super_admin', 'admin', 'agent'],
  'activities:view_all': ['super_admin', 'admin'],
  'activities:view_own': ['agent'],

  'teams:create': ['super_admin'],
  'teams:manage': ['super_admin', 'admin'],
  'teams:view': ['super_admin', 'admin', 'agent'],
};

export const ROLE_HIERARCHY = {
  'super_admin': ['admin', 'agent'],
  'admin': ['agent'],
  'agent': []
};
