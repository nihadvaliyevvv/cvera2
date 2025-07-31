// LinkedIn Authentication Utility
export const handleLinkedInRegister = () => {
  // Force LinkedIn logout first to ensure fresh login
  const logoutWin = window.open("https://www.linkedin.com/m/logout/", "_blank", "width=600,height=400");

  // Increased timeout to handle slow loading
  setTimeout(() => {
    logoutWin?.close();
    // Redirect to LinkedIn OAuth with register parameter
    window.location.href = "/api/auth/linkedin?from=register";
  }, 3000); // Increased to 3 seconds for better reliability
};

export const handleLinkedInLogin = () => {
  // Force LinkedIn logout first to ensure fresh login
  const logoutWin = window.open("https://www.linkedin.com/m/logout/", "_blank", "width=600,height=400");

  setTimeout(() => {
    logoutWin?.close();
    // Redirect to LinkedIn OAuth for login
    window.location.href = "/api/auth/linkedin?from=login";
  }, 3000);
};

// Make it available globally to avoid Tawk.to plugin conflicts
if (typeof window !== 'undefined') {
  (window as any).linkedInAuth = {
    register: handleLinkedInRegister,
    login: handleLinkedInLogin
  };
}
