import Alert from './alert'

const SuccessAlert = () => {
  return Alert({
    title: '成功啦！',
    text: '文章已經加入收藏列表了',
    icon: 'success',
    showConfirmButton: true,
    confirmButtonText: '好的',
    customClass: {
      popup: 'success-popup',
    }
  })
}

export default SuccessAlert
