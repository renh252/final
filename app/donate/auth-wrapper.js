// auth-wrapper.js
// 此文件用於在不修改原始頁面的情況下添加身份驗證

import { wrapWithAuth } from '@/app/context/AuthContext'

// 導入原始頁面模塊
import * as FlowPageModule from './flow/page'

// 使用 wrapWithAuth 包裝頁面模塊並導出
export default wrapWithAuth(FlowPageModule)
