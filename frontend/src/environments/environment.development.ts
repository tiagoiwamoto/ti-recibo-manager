export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
  oidc: {
    authority: 'https://auth.kamehouse.com.br/application/o/tirecibomanager/',
    clientId: 'ZJSuHDbtbGI57JCnsoAtKJowNaCNt5DVTrBt5SBt',
    redirectUri: typeof window !== 'undefined' ? window.location.origin + '/' : 'http://localhost:4200/',
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/' : 'http://localhost:4200/',
    scopes: 'openid profile email'
  }
};
