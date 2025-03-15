import React from 'react';
import Swal from 'sweetalert2';

/*彈跳視窗使用方法
import Alert from '@/app/_components/alert'

const handleClick = () => {
  Alert({ 
    title:'標題(可用html標籤)',
    text:'註解(可用html標籤)', 
    icon:'success / error / warning / info / question',

    // 確認按鈕ConfirmButton:預設為false
    showconfirmBtn: true,
    confirmBtnText: '確認'

    // 取消按鈕CancelButton:預設為false
    showCancelBtn: true,
    cancelBtnText: '取消',
    
    // 自動關閉時間:預設為false
    timer: 3000,

    // 確認按鈕事件(後面才需要寫)
    function:()=>{},
    title2:'',
    text2:'',
    icon2:'',
    showconfirmBtn2: true,
    confirmBtnText2: '確認',
    showCancelBtn2: true,
    cancelBtnText2: '取消',
    timer2: 3000,


  });
};

<button onClick={()=>{handleClick()}}>顯示提示框</button>
*/
const Alert = ({ 
  title, 
  text, 
  icon, 
  showconfirmBtn,
  confirmBtnText, 
  showCancelBtn,
  cancelBtnText,
  timer,
  title2,
  text2,
  icon2,
  showconfirmBtn2,
  confirmBtnText2,
  showCancelBtn2,
  cancelBtnText2,
  timer2,
  function: customFunction = false  
}) => {
return(
    Swal.fire({
      title: title || false,
      text: text || false,
      icon: icon || false,
      showConfirmButton: showconfirmBtn || false,
      confirmButtonText: confirmBtnText || '確認',
      showCancelButton: showCancelBtn || false,
      cancelButtonText: cancelBtnText || '取消',
      timer: timer || false,
    }).then((result) => {
      if (result.isConfirmed && customFunction) {  
        customFunction();
        Swal.fire({
          title: title2 || false,
          text: text2 || false,
          icon: icon2 || false,
          showConfirmButton: showconfirmBtn2 || false,
          confirmButtonText: confirmBtnText2 || '確認',
          showCancelButton: showCancelBtn2 || false,
          cancelButtonText: cancelBtnText2 || '取消',
          timer: timer2 || false,
        });
      }
    })
  
)

};

export default Alert;