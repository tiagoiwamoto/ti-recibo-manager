export const environment = {
  production: true,
  apiBaseUrl: 'https://api.tirecibomanager.kamehouse.com.br/api/v1',
  oidc: {
    authority: 'https://auth.kamehouse.com.br/application/o/tirecibomanager/',
    clientId: 'ZJSuHDbtbGI57JCnsoAtKJowNaCNt5DVTrBt5SBt',
    redirectUri: typeof window !== 'undefined' ? window.location.origin + '/' : 'https://recibomanager.kamehouse.com.br/',
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/' : 'https://recibomanager.kamehouse.com.br/',
    scopes: 'openid profile email'
  }
};
