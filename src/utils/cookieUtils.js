// Clear all authentication cookies
export const clearAuthCookies = () => {
  const domain = window.location.hostname;
  const domainParts = domain.split('.');
  const baseDomain = domainParts.length > 1 
    ? domainParts.slice(-2).join('.')
    : domain;
  
  const cookieNames = [
    'auth_token',
    'token',
    'jwt',
    'session',
    'session_id',
    'connect.sid',
    'remember_token'
  ];
  
  const domains = [
    '',
    domain,
    `.${domain}`,
    baseDomain,
    `.${baseDomain}`,
    'localhost',
    '.localhost',
    '127.0.0.1',
    '.127.0.0.1'
  ];
  
  const paths = ['', '/', '/admin', '/api'];
  
  // Generate all possible cookie variations
  cookieNames.forEach(name => {
    domains.forEach(domain => {
      paths.forEach(path => {
        const domainPart = domain ? `; domain=${domain}` : '';
        const pathPart = path ? `; path=${path}` : '; path=/';
        const expires = '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // Clear with all combinations of attributes
        const baseCookie = `${name}=${expires}${pathPart}${domainPart}`;
        
        // Try different combinations of attributes
        document.cookie = baseCookie;
        document.cookie = `${baseCookie}; secure`;
        document.cookie = `${baseCookie}; samesite=strict`;
        document.cookie = `${baseCookie}; secure; samesite=strict`;
        
        // Also try with empty value
        document.cookie = `${name}=${expires}${pathPart}${domainPart}`;
        document.cookie = `${name}=${expires}${pathPart}${domainPart}; secure`;
      });
    });
  });
  
  // Clear all cookies from document.cookie
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    domains.forEach(domain => {
      paths.forEach(path => {
        const domainPart = domain ? `; domain=${domain}` : '';
        const pathPart = path ? `; path=${path}` : '; path=/';
        const expires = '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        document.cookie = `${name}=${expires}${pathPart}${domainPart}`;
        document.cookie = `${name}=${expires}${pathPart}${domainPart}; secure`;
      });
    });
  });
  
  // Force clear by setting document.cookie directly (last resort)
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${domain}`;
  });
};
