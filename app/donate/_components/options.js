import Form from 'react-bootstrap/Form'

function SelectBasicExample() {
  return (
    <Form.Select
      aria-label="Default select example"
      style={{ width: '150px', backgroundColor: '#092C4C', color: 'white' , 'text-align':'center' }} // 修改寬度和顏色
    >
      <option>－ 請選擇 －</option>
      <option value="醫療救援">醫療救援</option>
      <option value="線上認養">線上認養</option>
      <option value="捐給我們">捐給我們</option>
    </Form.Select>
  )
}

export default SelectBasicExample
