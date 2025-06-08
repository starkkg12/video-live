enum localStorageKeys {
  CLIENT_ID = "cid",
  ACCESS_TOKEN = "access_token",
  ACCESS_TOKEN_EXPIRE_TIME = "access_token_expire_time",
  REFRESH_TOKEN = "refresh_token",
  REFRESH_TOKEN_EXPIRE_TIME = "refresh_token_expire_time",
  FIRST_LOGIN = "first_login",
  USER_ID = "user_id",
  GAME_TYPE = "GAME_TYPE",
  GAME_TYPE_CODE = "GAME_TYPE_CODE",
  NICKNAME = "nickname",
  VIP_LEVEL = "vip_level",
  USER_LEVEL = "user_level",
  AVATAR = "avatar",
  SERVICE_URL = "service_url",
  DOWNLOAD_APP_URL = "download_app_url",
  PROMOTION_CODE = "promotion_code",
  IS_EXPERT = "is_expert",
  SUPERIOR_USER_PROMOTION_CODE = "superiorUserPromotionCode",
  MANAGE_SITE_ID = "manage_site_id",
  WEBSITE_ID = 'website_id',
  /**
   * 短信验证码 token, 用于修改手机号
   */
  SMS_TOKEN = 'sms_token',
  /**
   * 性别
   */
  GENDER = 'gender',
}

export default localStorageKeys;
