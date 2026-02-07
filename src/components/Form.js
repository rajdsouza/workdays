import React, { useState } from 'react';
import Input from './Input';

const Form = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is not valid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert('Form is valid and ready for submission');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label>Username:</label>
        <Input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your username"
        />
        {errors.username && <p className="error">{errors.username}</p>}
      </div>

      <div>
        <label>Email:</label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />
        {errors.email && <p className="error">{errors.email}</p>}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default Form;
