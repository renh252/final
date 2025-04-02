import Swal from 'sweetalert2';
import styles from './alert.module.css'

/*彈跳視窗使用方法
import Alert from '@/app/_components/alert'

const handleClick = () => {
  Alert({ 
    title:'標題',
    text:'註解', 
    html: '<p>註解(可用html標籤)</p>',
    icon:'success / error / warning / info / question',
    // 右上關閉按鈕CloseButton:預設為false
    showCloseButton: true,
    // 確認按鈕ConfirmButton:預設為false
    showconfirmBtn: true,
    confirmBtnText: '確認'

    // 取消按鈕CancelButton:預設為false
    showCancelBtn: true,
    cancelBtnText: '取消',
    
    // 自動關閉時間:預設為false
    timer: 3000,

    // 確認按鈕事件(預設為false)
    function:()=>{}


  });
};

<button onClick={()=>{handleClick()}}>顯示提示框</button>
*/
const Alert = ({ 
  title, 
  text, 
  html,  // 新增 html 屬性
  icon, 
  showCloseButton,
  showconfirmBtn,
  confirmBtnText, 
  showCancelBtn,
  cancelBtnText,
  timer,
  function: customFunction = false  
}) => {
  return(
    Swal.fire({
      title: title || false,
      text: text || false,
      html: html || false,  // 使用 html 屬性
      icon: icon || false,
      showCloseButton: showCloseButton || false,
      showConfirmButton: showconfirmBtn || false,
      confirmButtonText: confirmBtnText || '確認',
      showCancelButton: showCancelBtn || false,
      cancelButtonText: cancelBtnText || '取消',
      timer: timer || false,
      customClass:{
        popup: styles.customSwal,
        confirmButton: styles.customConfirm,
        cancelButton: styles.customCancel
      }
    }).then((result) => {
      if (result.isConfirmed && customFunction) {  
        return customFunction(result);
      }
    })
  )
};


export default Alert;