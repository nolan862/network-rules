function main(config) {
  const proxyName = "Pritunl-Custody";
  const proxyServer = "172.29.1.162";
  const proxyPort = 1080;

  const domainRules = [
    `DOMAIN-SUFFIX,paynex.tech,${proxyName}`,
    `DOMAIN-SUFFIX,payxking.club,${proxyName}`,
    `DOMAIN-SUFFIX,koifish.co,${proxyName}`
  ];

  const directProxyRule =
    `IP-CIDR,${proxyServer}/32,DIRECT,no-resolve`;

  /*
   * 保留订阅原有节点，并删除旧的同名节点，
   * 避免重复加载全局覆写时出现节点重名。
   */
  config.proxies = Array.isArray(config.proxies)
    ? config.proxies.filter(
        proxy => proxy.name !== proxyName
      )
    : [];

  // 添加 Pritunl 内网的无认证 SOCKS5 节点
  config.proxies.push({
    name: proxyName,
    type: "socks5",
    server: proxyServer,
    port: proxyPort,
    udp: false
  });

  // 保留订阅原有规则
  config.rules = Array.isArray(config.rules)
    ? config.rules
    : [];

  // 删除以前添加过的相同规则，避免重复
  const managedRules = new Set([
    directProxyRule,
    ...domainRules
  ]);

  config.rules = config.rules.filter(
    rule => !managedRules.has(rule)
  );

  /*
   * 插入到规则最前面：
   * 1. SOCKS5 服务本身交给系统路由，经 Pritunl 访问；
   * 2. 三组业务域名统一发给 SOCKS5。
   */
  config.rules.unshift(
    directProxyRule,
    ...domainRules
  );

  return config;
}
