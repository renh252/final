import Alert from './alert'

const ReportAlert = () => {
  return Alert({
    title: '檢舉已送出',
    text: '我們會盡快確認文章是否違規',
    icon: 'info',
    showConfirmButton: true,
    confirmButtonText: '好的',
    customClass: {
      popup: 'report-popup',
    }
  })
}

export default ReportAlert
