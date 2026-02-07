import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ onClick, children, type = 'button', disabled = false }) => {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="btn">
      {children}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  type: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Button;
