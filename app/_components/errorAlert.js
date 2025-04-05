import Alert from './alert'

const ErrorAlert = () => {
  return Alert({
    title: '操作失敗啦！',
    text: '我們等等再嘗試一次吧',
    icon: 'error',
    showConfirmButton: true,
    confirmButtonText: '好的',
    customClass: {
      popup: 'error-popup',
    },
  })
}

export default ErrorAlert
