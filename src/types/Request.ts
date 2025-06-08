/**
 * 统一返回response
 */
export interface IResponse<T> {
  /**
   *
   */
  success: boolean
  /**
   * @ErrorType
   */
  errCode: EErrCode
  /**
   *
   */
  errMessage: string
  data: IData<T>
}

export interface IData<T> {
  total: number
  list: T[]
}

export enum EErrCode {
  '000' = '未知异常',
  '001' = '网络错误',
  '002' = '应用层未知异常',
  '003' = '数据访问未知异常',
  '004' = '缓存访问未知异常',
  '005' = 'RPC调用未知异常',
  '006' = '鉴权异常(authentication error)',
  '007' = '授权异常(authorization error)',
  '008' = '内部SOCKET授权异常(socket authorization error)',
  '009' = '内部feign调用未知异常',
  '0100' = '传入的参数不对',
  '0101' = 'JSON字符串语法不正确',
  '0102' = '请求的JSON串为空',
  '0106' = '解析json-xml流为JSON对象出错',
  '0108' = 'content-type MIME unsupported',
  '0109' = 'XML解析成MAP对象出错',
  '0110' = 'HTTPerror, action not found!',
  '0111' = '鉴权不通过(access authorization failure)',
  '0112' = 'HTTP 格式化输出异常(format exception)',
  '0113' = 'HTTP 执行Preprocessor失败(call preprocessor exception)',
  '0114' = '操作超时(operation timeout)',
  '0115' = '数据加解密失败(encrypte failure)',
  '0116' = '数据解压缩失败(compress failure)',
  '0117' = '网络异常,请检查网络连接是否正常(HG)',
  '0118' = '网络异常,请检查网络连接是否正常(HP)',
  '0119' = 'FTP 获取服务器上的文件列表异常',
  '0120' = 'FTP 初始化连接服务器异常',
  '0121' = 'FTP 关闭连接异常',
  '0122' = 'FTP 获取服务器上的文件列表异常',
  '0123' = 'FTP 初始化连接服务器异常',
  '0124' = 'FTP 关闭连接异常',
  '0125' = 'HTTP 请求处理异常',
  '0126' = 'HTTP RequestMethodNotSupported',
  '0301' = '数据库执行超时(sql execute timeout)',
  '0302' = '数据库执行DML(update) SQL语句异常',
  '0303' = '数据库执行QUERY(select) SQL语句异常',
  '0304' = '没有找到数据库(db not found)',
  '0305' = '数据库执行事务控制的SQL语句异常(sql transaction fail)',
  '0306' = '数据库执行SQL语句, 影响行数(affacted)异常',
  '0307' = '解析动态SQL异常',
  '0330' = '目标数据源不可用(db connection error)',
  '0331' = '匹配数据库节点集群失败',
  '0332' = 'SQL语法错误(sql syntax error)',
  '0333' = '数据库操作失败(db operation error)',
  '0334' = '表记录主键冲突(duplicate table row)',
  '0335' = '数据库授权不足(db Invalid Authorization)',
  '0336' = '数据库数据异常(db data exception)',
  '0337' = '数据库数据链路异常(communication exception)',
  '0338' = '分表目标字段缺失(split column lost)',
  '0401' = '进程内缓存操作异常',
  '0402' = '分布式缓存操作异常',
  '0403' = '初始化缓存异常',
  '0404' = '分布式锁(缓存实现)异常',
  '0501' = 'Server Interval Error! ',
  '0502' = 'Method not found! ',
  '0503' = 'json-rpc protocal Error! ',
  '0504' = 'mvc-action duplicate definition! ',
  '0700' = '缺少参数',
  '0701' = 'required缺少参数',
  '0702' = 'integer: 没有或者必须为整数 无参数',
  '0703' = 'integerRange:整数范围必须在参数0和参数1之间; param0和param1必须能被转化成整数',
  '0704' = 'date: 必须为日期格式, param0必须为yyyy-mm-dd',
  '0705' = 'enum:必须是一系列枚举值中的一个（param0中用逗号分割出来的集合）',
  '0706' = 'minLength: 参数最小长度不正确',
  '0707' = 'maxLength: 参数最大长度不正确',
  '0708' = 'mask: 允许自定义正则表达式来进行校验, param0为表达式字符串',
  '0709' = 'double: 允许为空或者必须为double数 无参数',
  '0710' = 'doubleRange:浮点范围必须在参数0和参数1之间; param0和param1必须能被转化成浮点数',
  '0711' = '参数类型不匹配',
  '0712' = '变量值不相等',
  '0713' = '格式化数据异常',
  '0714' = 'java bean赋值异常',
  '0715' = '访问java bean属性异常',
  '0716' = '调用java bean方法异常',
  '0717' = '对象序列化异常',
  '0718' = '对象反序列化异常',
  '0719' = '未找到目标对象',
  '0720' = '编码解码数据异常',
  '0721' = '加解密数据异常',
  '0722' = 'java 没有默认构造方法,无法创建实例',
  '0723' = 'file operation error.',
  '0724' = 'file not exists.',
  '0725' = '创建java类实例异常(new instance error)',
  '0726' = '参数数据长度不够(param length is too small)',
  '0727' = '参数值无效(param is invalid)',
  '0728' = '数据状态异常(data error)',
  '0729' = '参数校验错误(%s)',
  '0730' = '操作太频繁，请稍后重试',
  '0731' = '数据未修改',
}
