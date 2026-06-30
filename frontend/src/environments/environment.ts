export const environment = {
  production: true,
  apiBaseUrl: 'https://api-recibomanager.kamehouse.com.br/api/v1',
  oidc: {
    authority: 'https://auth.kamehouse.com.br/application/o/tirecibomanager/',
    clientId: '7TVtDnk6Js4g23yuLA2EOV4An0RIePtoLoBUqEAm',
    redirectUri: typeof window !== 'undefined' ? window.location.origin + '/' : 'https://recibomanager.kamehouse.com.br/',
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/' : 'https://recibomanager.kamehouse.com.br/',
    scopes: 'openid profile email'
  }
};
