import React from 'react'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import styles from './CardSwitchButton.module.css'

const CardSwitchButton = ({
  direction = 'left', // left, right
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`${styles.angle} ${styles[direction]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {direction === 'left' ? <FaAngleLeft /> : <FaAngleRight />}
    </button>
  )
}

export default CardSwitchButton
