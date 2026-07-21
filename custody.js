function main(config) {
  const proxyName = "Pritunl-Custody";
  const proxyServer = "172.29.1.162";
  const proxyPort = 1080;

  // 保留订阅原有节点，删除可能存在的同名旧节点
  config.proxies = Array.isArray(config.proxies)
    ? config.proxies.filter(proxy => proxy.name !== proxyName)
    : [];

  // 添加 Pritunl 内网 SOCKS5 节点
  config.proxies.push({
    name: proxyName,
    type: "socks5",
    server: proxyServer,
    port: proxyPort,
    udp: false
  });

  // 保留订阅原有规则
  config.rules = Array.isArray(config.rules) ? config.rules : [];

  const paynexRule =
    `DOMAIN-SUFFIX,paynex.tech,${proxyName}`;

  const directProxyRule =
    `IP-CIDR,${proxyServer}/32,DIRECT,no-resolve`;

  // 删除旧的重复规则
  config.rules = config.rules.filter(rule =>
    rule !== paynexRule &&
    rule !== directProxyRule
  );

  /*
   * 先让 SOCKS5 服务器本身走系统路由/Pritunl，
   * 再让 paynex.tech 全部子域名走 SOCKS5。
   */
  config.rules.unshift(
    directProxyRule,
    paynexRule
  );

  return config;
}
