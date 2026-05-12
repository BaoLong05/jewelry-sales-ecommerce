// ham tra ve message tu backend
export const getErrorMessage = (error, defaultMessage = "Có lỗi xảy ra!") => {
  if (!error?.response) {
    return "Không thể kết nối đến máy chủ!";
  }

  const data = error.response.data;

  //in message tu backend
  if (data?.errors) {
    const firstField = Object.keys(data.errors)[0];

    if (
      firstField &&
      Array.isArray(data.errors[firstField]) &&
      data.errors[firstField].length > 0
    ) {
      return data.errors[firstField][0];
    }
  }
  //backend exception hoac khac
  if (data?.message) {
    return data.message;
  }

  return defaultMessage;
};
