import Form from 'react-bootstrap/Form'

function SelectBasicExample({ value, onChange }) {
  return (
    <Form.Select
      aria-label="Default select example"
      style={{
        width: '150px',
        backgroundColor: '#092C4C',
        color: 'white',
        textAlign: 'center',
      }}
      value={value} // 設定目前選擇的值
      onChange={(e) => onChange(e.target.value)} // 當選擇變更時回傳值
    >
      <option value="">－ 請選擇 －</option>
      <option value="醫療救援">醫療救援</option>
      <option value="線上認養">線上認養</option>
      <option value="捐給我們">捐給我們</option>
    </Form.Select>
  )
}

export default SelectBasicExample
