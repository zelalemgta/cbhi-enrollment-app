module.exports = {
    channels: {
        APP_INFO: 'app_info',
        WINDOW_STATE: 'window_state',
        MINIMIZE_WINDOW: 'minimize_window',
        MAXIMIZE_WINDOW: 'maximize_window',
        UNMAXIMIZE_WINDOW: 'unmaximize_window',
        CLOSE_APPLICATION: 'close_application',
        UPDATE_AVAILABLE: 'update_available',
        UPDATE_DOWNLOADED: 'update_downloaded',
        CREATE_PROFILE: 'create_profile',
        UPDATE_PROFILE: 'update_profile',
        LOAD_PROFILE: 'load_profile',
        LOAD_ADMINISTRATIVE_DIVISIONS: 'load_administrative_divisions',
        LOAD_KEBELE: 'load_kebele',
        CREATE_KEBELE: 'create_kebele',
        UPDATE_KEBELE: 'update_kebele',
        LOAD_GOTE: 'load_gote',
        CREATE_GOTE: 'create_gote',
        UPDATE_GOTE: 'update_gote',
        LOAD_ENROLLMENT_PERIOD: 'load_enrollment_period',
        CREATE_ENROLLMENT_PERIOD: 'create_enrollment_period',
        UPDATE_ENROLLMENT_PERIOD: 'update_enrollment_period',
        LOAD_MEMBER: 'load_member',
        LOAD_MEMBERS: 'load_members',
        CREATE_MEMBER: 'create_member',
        UPDATE_MEMBER: 'update_member',
        REMOVE_MEMBER: 'remove_member',
        MEMBER_SUCCESS: 'member_success',
        MEMBER_REMOVED: 'member_removed',
        CHECK_ACTIVE_PERIOD: 'check_active_period',
        LOAD_MEMBER_RENEWAL: 'load_member_renewal',
        CREATE_MEMBER_RENEWAL: 'create_member_renewal',
        UPDATE_MEMBER_RENEWAL: 'update_member_renewal',
        CREATE_BENEFICIARY_RENEWAL: 'create_beneficiary_renewal',
        REMOVE_MEMBER_RENEWAL: 'remove_member_renewal',
        MEMBER_RENEWAL_SUCCESS: 'member_renewal_success',
        EXPORT_ENROLLMENT: 'export_enrollment',
        CREATE_SUBSIDY: 'create_subsidy',
        LOAD_SUBSIDIES: 'load_subsidies',
        UPDATE_SUBSIDY: 'update_subsidy',
        REMOVE_SUBSIDY: 'remove_subsidy',
        REPORT_ELIGIBLE_HOUSEHOLDS: 'report_eligible_households',
        REPORT_TOTAL_HOUSEHOLD_ENROLLED: 'report_total_household_enrolled',
        REPORT_TOTAL_BENEFICIARY_ENROLLED: 'report_total_beneficiary_enrolled',
        REPORT_MONTHLY_ENROLLMENT_STATS: 'report_monthly_enrollment_stats',
        REPORT_TOTAL_ENROLLMENT_STATS: 'report_total_enrollment_stats',
        REPORT_ENROLLMENT_RATE: 'report_enrollment_rate',
        REPORT_RENEWAL_RATE: 'report_renewal_rate',
        REPORT_TOTAL_ENROLLMENT_BY_STATUS: 'report_total_enrollment_by_status',
        REPORT_HOUSEHOLDS_BY_GENDER: 'report_households_by_gender',
        REPORT_SUBSIDIES: 'report_subsidies',
        REPORT_MONTHLY_CONTRIBUTION_STATS: 'report_monthly_contribution_stats',
        REPORT_TOTAL_CONTRIBUTION_STATS: 'report_total_contribution_stats',
        REPORT_TOTAL_CONTRIBUTIONS: 'report_total_contributions',
        REPORT_TOTAL_SUBSIDY: 'report_total_subsidy',
        REPORT_TOTAL_CONTRIBUTIONS_COLLECTED: 'report_total_contributions_collected',
        SYSTEM_BACKUP: 'system_backup',
        SYSTEM_RESTORE: 'system_restore',
        SEND_NOTIFICATION: 'send_notification',
        DEV_TOOLS: 'dev_tools',
    },
    genderOptions: ['Male', 'Female'],
    relationshipOptions: ['Household Head', 'Parent', 'Husband', 'Wife', 'Son', 'Daughter', 'Other'],
    professionOptions: ['Farmer', 'Merchant', 'Job Seeker', 'Housewife', 'Stay at home husband', 'Daily Laborer', 'Student', 'Other'],
    administrativeLevelOptions: ['Kebele', 'Gote'],
    //EthiopianMonths: ['Meskerem', 'Tikemt', 'Hidar', 'Tahesas', 'Tir', 'Yekatit', 'Megabit', 'Miyazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase'],
};