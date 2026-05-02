export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const isAdminOrStaff = () => {
  const user = getUser();
  if (!user) return false;

  const role = user.roles?.[0]?.name;
  return ["admin", "staff"].includes(role);
};