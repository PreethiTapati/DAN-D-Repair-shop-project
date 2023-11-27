const validatePassword = (password) => {
    const pattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if (pattern.test(password)) {
        return true;
    } else {
        return false;
    }
};

export default validatePassword;
